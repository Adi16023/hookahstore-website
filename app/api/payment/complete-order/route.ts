export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

import { wcPost } from '../../../../lib/woocommerce';
import { runInBackground } from '../../../../lib/utils/background';
import { parseIsoDob, isOfAge, MIN_AGE, DOB_META_KEY } from '../../../../lib/utils/dob';
import { razorpayCreds, verifyCheckoutSignature, fetchRazorpayOrder, fetchRazorpayPayment } from '../../../../lib/checkout/razorpay';
import { cartHash, parseCartLines, CheckoutError } from '../../../../lib/checkout/quote';
import { getServerSession } from '../../../../lib/auth/session-server';
import { getPublicAppUrl } from '../../../../lib/config';

const COUNTRY_CODES: Record<string, string> = {
    'India': 'IN', 'United States': 'US', 'United Kingdom': 'GB',
    'Canada': 'CA', 'Australia': 'AU',
};

export async function POST(req: NextRequest) {
    // FAIL CLOSED: never create a paid order without signature verification.
    const creds = razorpayCreds();
    if (!creds) {
        return NextResponse.json({ error: 'Payment verification is unavailable. Your order was not placed — please contact us.' }, { status: 503 });
    }

    try {
        const body = await req.json() as {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
            email: string;
            cart: { productId: number; variationId: number | null; name: string; price: string; quantity: number; size: string | null }[];
            shippingAddress: { firstName: string; lastName: string; country: string; phone: string; street: string; addressLine2: string; city: string; state: string; postalCode: string; };
            shippingMethodId: string;
            shippingMethodLabel: string;
            shippingCost: number;
            couponCode?: string | null;
            discountAmount?: number;
            customerDob?: string;
        };

        // 1. Verify the Razorpay checkout signature (constant-time)
        if (!(await verifyCheckoutSignature(body.razorpay_order_id, body.razorpay_payment_id, body.razorpay_signature, creds.keySecret))) {
            console.error('[complete-order] SIGNATURE MISMATCH', body.razorpay_payment_id);
            return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 });
        }

        // 1a. Verify what was actually paid, against the server-priced Razorpay order
        const [rzOrder, rzPayment] = await Promise.all([
            fetchRazorpayOrder(body.razorpay_order_id),
            fetchRazorpayPayment(body.razorpay_payment_id),
        ]);
        const paidOk = rzPayment.order_id === rzOrder.id
            && (rzPayment.status === 'captured' || rzPayment.status === 'authorized')
            && rzPayment.currency === 'INR'
            && rzPayment.amount === rzOrder.amount;
        if (!paidOk) {
            console.error('[complete-order] PAYMENT/ORDER MISMATCH', { payment: rzPayment.id, status: rzPayment.status, paid: rzPayment.amount, expected: rzOrder.amount });
            return NextResponse.json({ error: 'Payment amount could not be verified. Please contact us with your payment ID.' }, { status: 400 });
        }

        // 1a-ii. The cart being ordered must be exactly the cart that was priced
        let cartLines;
        try {
            cartLines = parseCartLines(body.cart);
        } catch (e) {
            return NextResponse.json({ error: e instanceof CheckoutError ? e.message : 'Invalid cart.' }, { status: 400 });
        }
        const expectedHash = await cartHash({
            items: cartLines,
            couponCode: body.couponCode ?? null,
            shipping: { methodId: body.shippingMethodId, postcode: String(body.shippingAddress?.postalCode ?? '').trim() },
        });
        if (rzOrder.notes?.cart_hash !== expectedHash) {
            console.error('[complete-order] CART HASH MISMATCH — cart changed after pricing', body.razorpay_payment_id);
            return NextResponse.json({ error: 'Your cart changed after payment started. Please contact us with your payment ID for a refund or to complete the order.' }, { status: 409 });
        }

        // 1b. Re-check age server-side. create-order already rejected under-21s
        //     before payment, so reaching here means the request was tampered with.
        if (!body.customerDob || !parseIsoDob(body.customerDob) || !isOfAge(body.customerDob)) {
            console.error('[complete-order] AGE CHECK FAILED after payment — refund required for', body.razorpay_payment_id);
            return NextResponse.json(
                { error: `Order rejected: you must be at least ${MIN_AGE} years old to purchase. Please contact us for a refund.` },
                { status: 403 },
            );
        }

        // 2. Server-computed totals from the Razorpay order notes (set by create-order)
        const cartSubtotal = Number(rzOrder.notes?.subtotal) || 0;
        const verifiedDiscount = Number(rzOrder.notes?.discount) || 0;
        const shippingCost = Number(rzOrder.notes?.shipping_cost) || 0;
        const shippingLabel = rzOrder.notes?.shipping_label || body.shippingMethodLabel || 'Shipping';
        const couponCode = rzOrder.notes?.coupon || null;

        // Logged-in customers: link the order to their account (My Orders)
        const session = await getServerSession();
        const customerId = session?.sub && Number(session.sub) > 0 ? Number(session.sub) : 0;

        // 3. Build billing/shipping objects
        const countryCode = COUNTRY_CODES[body.shippingAddress.country] ?? 'IN';
        const a = body.shippingAddress;

        // Sanitize phone — only digits, +, spaces, dashes, parentheses
        const cleanPhone = (a.phone ?? '').replace(/[^\d+\s\-()]/g, '').trim();
        // Validate email — WooCommerce requires a valid email in billing
        const rawEmail = (body.email ?? '').trim();
        const billingEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)
            ? rawEmail
            : `guest.${body.razorpay_payment_id}@thehookahstore.in`;

        const billing = {
            first_name: a.firstName || 'Customer',
            last_name: a.lastName || '',
            address_1: a.street || '',
            address_2: a.addressLine2 || '',
            city: a.city || '',
            state: a.state || '',
            postcode: a.postalCode || '',
            country: countryCode,
            email: billingEmail,
            phone: cleanPhone || '0000000000',
        };

        // Shipping does NOT include email/phone (WooCommerce rejects them)
        const shipping = {
            first_name: billing.first_name,
            last_name: billing.last_name,
            address_1: billing.address_1,
            address_2: billing.address_2,
            city: billing.city,
            state: billing.state,
            postcode: billing.postcode,
            country: billing.country,
        };

        // 4. Create WooCommerce order
        const wcOrder = await wcPost('orders', {
            payment_method: 'razorpay',
            payment_method_title: 'Razorpay',
            set_paid: true,
            status: 'processing',
            customer_id: customerId,
            billing,
            shipping,
            line_items: cartLines.map(item => ({
                product_id: item.productId,
                ...(item.variationId ? { variation_id: item.variationId } : {}),
                quantity: item.quantity,
            })),
            shipping_lines: [{
                method_id: body.shippingMethodId,
                method_title: shippingLabel,
                total: shippingCost.toFixed(2), // server value, not the client's
            }],
            ...(couponCode ? { coupon_lines: [{ code: couponCode }] } : {}),
            meta_data: [
                { key: '_razorpay_payment_id', value: body.razorpay_payment_id },
                { key: '_razorpay_order_id', value: body.razorpay_order_id },
                { key: '_razorpay_amount_paid', value: (rzPayment.amount / 100).toFixed(2) },
                { key: DOB_META_KEY, value: body.customerDob },
            ],
        }) as { id: number; number: string; date_created: string };

        // Fire-and-forget: create Shiprocket shipment (non-blocking)
        const appUrl = getPublicAppUrl();
        const orderDateStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
        const totalWeight = Math.max(
            0.5,
            body.cart.reduce((sum, item) => sum + item.quantity * 0.5, 0),
        );
        const shiprocketPayload = {
            order_id: `WC-${wcOrder.number}`,
            order_date: orderDateStr,
            pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION ?? 'Home',
            billing_customer_name: `${a.firstName} ${a.lastName}`.trim(),
            billing_last_name: a.lastName || '',
            billing_address: a.street || '',
            billing_address_2: a.addressLine2 || '',
            billing_city: a.city || '',
            billing_pincode: a.postalCode || '',
            billing_state: a.state || '',
            billing_country: 'India',
            billing_email: billingEmail,
            billing_phone: cleanPhone,
            shipping_is_billing: true,
            order_items: body.cart.map(item => ({
                name: item.name,
                sku: `P${item.productId}${item.variationId ? `-V${item.variationId}` : ''}`,
                units: item.quantity,
                selling_price: parseFloat(item.price.replace(/[^0-9.-]+/g, '')),
                discount: 0,
                tax: 0,
                hsn: '',
            })),
            payment_method: 'Prepaid' as const,
            sub_total: Math.max(0, cartSubtotal - verifiedDiscount),
            length: 10,
            breadth: 10,
            height: 10,
            weight: totalWeight,
        };
        // Non-blocking, but registered with ctx.waitUntil so Cloudflare doesn't cancel it
        await runInBackground('complete-order Shiprocket shipment', fetch(`${appUrl}/api/shiprocket/create-shipment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(shiprocketPayload),
        }));

        return NextResponse.json({
            orderId: wcOrder.id,
            orderNumber: wcOrder.number,
            dateCreated: wcOrder.date_created,
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[complete-order] FAILED:', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
