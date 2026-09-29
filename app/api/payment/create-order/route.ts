export const runtime = 'edge';
/**
 * POST /api/payment/create-order
 *
 * body: { items: [{ productId, variationId, quantity }], couponCode?, shipping: { methodId, postcode }, customerDob }
 *
 * The amount is computed HERE from WooCommerce prices, the server-validated
 * coupon and server-recomputed shipping — never from the browser. The cart
 * fingerprint + breakdown are stored in the Razorpay order notes and checked
 * again by /api/payment/complete-order.
 */
import { NextRequest, NextResponse } from 'next/server';
import { parseIsoDob, isOfAge, MIN_AGE } from '../../../../lib/utils/dob';
import { buildQuote, cartHash, parseCartLines, CheckoutError } from '../../../../lib/checkout/quote';
import { createRazorpayOrder, razorpayCreds } from '../../../../lib/checkout/razorpay';

export async function POST(req: NextRequest) {
    // Fail closed: no Razorpay keys → no payments at all
    if (!razorpayCreds()) {
        return NextResponse.json({ error: 'Online payment is temporarily unavailable. Please try again later.' }, { status: 503 });
    }

    try {
        const body = await req.json() as {
            items?: unknown;
            couponCode?: string | null;
            shipping?: { methodId?: string; postcode?: string };
            customerDob?: string;
        };

        // Age check BEFORE the customer is charged (complete-order re-checks too).
        if (!body.customerDob || !parseIsoDob(body.customerDob)) {
            return NextResponse.json({ error: 'Please complete the age verification step with a valid date of birth.' }, { status: 400 });
        }
        if (!isOfAge(body.customerDob)) {
            return NextResponse.json({ error: `You must be at least ${MIN_AGE} years old to purchase.` }, { status: 403 });
        }

        const methodId = String(body.shipping?.methodId ?? '');
        const postcode = String(body.shipping?.postcode ?? '').trim();
        if (!methodId || postcode.length < 6) {
            return NextResponse.json({ error: 'Please choose a shipping method and enter a valid PIN code.' }, { status: 400 });
        }

        const input = {
            items: parseCartLines(body.items),
            couponCode: body.couponCode ?? null,
            shipping: { methodId, postcode },
        };
        const quote = await buildQuote(input);
        if (quote.amountPaise < 100) {
            return NextResponse.json({ error: 'Order total must be at least ₹1.' }, { status: 400 });
        }

        const order = await createRazorpayOrder(quote.amountPaise, {
            cart_hash: await cartHash(input),
            subtotal: quote.subtotal.toFixed(2),
            discount: quote.discount.toFixed(2),
            coupon: quote.couponCode ?? '',
            shipping_method: quote.shippingMethodId,
            shipping_label: quote.shippingLabel.slice(0, 200),
            shipping_cost: quote.shippingCost.toFixed(2),
        });

        return NextResponse.json({
            orderId: order.id,
            amount: order.amount,          // paise — use this for the Razorpay checkout
            currency: order.currency,
            quote: {
                subtotal: quote.subtotal,
                discount: quote.discount,
                shippingCost: quote.shippingCost,
                total: quote.total,
            },
        });
    } catch (err) {
        if (err instanceof CheckoutError) {
            return NextResponse.json({ error: err.message }, { status: err.status });
        }
        console.error('[create-order]', err);
        return NextResponse.json({ error: 'Could not start the payment. Please try again.' }, { status: 500 });
    }
}
