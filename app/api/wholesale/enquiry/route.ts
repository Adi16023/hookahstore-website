export const runtime = 'edge';
/**
 * POST /api/wholesale/enquiry
 *
 * "Send order by email" from the wholesale cart. No online payment.
 *
 *   body: { items: [{ productId, variationId, quantity }], reference, note? }
 *
 * 1. Requires an approved wholesale_customer session (re-checked live).
 * 2. Re-reads the customer's tier prices on the server — client prices are ignored.
 * 3. Creates a WooCommerce order: status "on-hold", customer_id set, no payment,
 *    meta _wam_created_via = "wholesale-enquiry" (plugin v4.2 copies this into
 *    created_via; WC REST itself always records "rest-api").
 * 4. AWAITS two Resend emails: the order to the site email, a confirmation to the customer.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedWholesaler } from '../../../../lib/auth/wholesale-guard';
import { getTierPrices, unitPriceFor } from '../../../../lib/woocommerce/wholesale-pricing';
import { wcPost } from '../../../../lib/woocommerce';
import { isValidEnquiryRef, newEnquiryRef } from '../../../../lib/wholesale/enquiry-ref';
import { sendWholesaleEnquiryAdminEmail, sendWholesaleEnquiryCustomerEmail } from '../../../../lib/email/send-emails';
import type { EnquiryEmailData, EnquiryEmailLine } from '../../../../lib/email/render-email';
import { getWholesaleUrl } from '../../../../lib/config';

const MAX_LINES = 100;
const MAX_QTY = 100000;

type InLine = { productId?: unknown; variationId?: unknown; quantity?: unknown };

const json = (body: object, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

export async function POST(req: NextRequest) {
    const guard = await requireApprovedWholesaler();
    if (!guard.ok) return json({ error: guard.error }, guard.status);
    const { account, tier } = guard;

    /* ── Validate input ── */
    let body: { items?: InLine[]; reference?: unknown; note?: unknown };
    try {
        body = await req.json();
    } catch {
        return json({ error: 'Invalid request.' }, 400);
    }

    const lines = (Array.isArray(body.items) ? body.items : [])
        .slice(0, MAX_LINES)
        .map(l => ({
            productId: Number(l.productId),
            variationId: l.variationId == null || l.variationId === '' ? null : Number(l.variationId),
            quantity: Math.floor(Number(l.quantity)),
        }))
        .filter(l => Number.isInteger(l.productId) && l.productId > 0
            && (l.variationId === null || (Number.isInteger(l.variationId) && l.variationId > 0))
            && Number.isInteger(l.quantity) && l.quantity > 0 && l.quantity <= MAX_QTY);

    if (!lines.length) return json({ error: 'Your cart is empty.' }, 400);

    const reference = isValidEnquiryRef(body.reference) ? body.reference : newEnquiryRef();
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 2000) : '';

    /* ── Server-side tier prices (never trust the client) ── */
    let prices: Awaited<ReturnType<typeof getTierPrices>>;
    try {
        prices = await getTierPrices(lines.map(l => l.productId), tier);
    } catch (err) {
        console.error('[wholesale/enquiry] price lookup failed:', err);
        return json({ error: 'Could not load prices right now. Please try again.' }, 502);
    }

    const unavailable = lines.filter(l => !prices[l.productId]);
    if (unavailable.length) {
        return json({ error: 'Some items in your cart are no longer available. Please remove them and try again.', unavailable: unavailable.map(l => l.productId) }, 409);
    }

    const emailLines: EnquiryEmailLine[] = [];
    const lineItems = lines.map(l => {
        const pp = prices[l.productId];
        const variation = l.variationId ? pp.variations.find(v => v.id === l.variationId) : undefined;
        const unit = unitPriceFor(pp, variation ? variation.id : null);
        const lineTotal = unit != null ? Math.round(unit * l.quantity * 100) / 100 : null;
        const option = variation ? Object.values(variation.attributes).join(' / ') : null;
        emailLines.push({ name: pp.name, option, quantity: l.quantity, unitPrice: unit, lineTotal });
        return {
            product_id: l.productId,
            ...(variation ? { variation_id: variation.id } : {}),
            quantity: l.quantity,
            // Tier price overrides the WooCommerce retail price; "on request" lines are 0 + flagged
            subtotal: (lineTotal ?? 0).toFixed(2),
            total: (lineTotal ?? 0).toFixed(2),
            meta_data: [
                { key: 'Wholesale tier', value: tier },
                { key: 'Unit price', value: unit != null ? unit.toFixed(2) : 'Price on request' },
            ],
        };
    });

    const subtotal = Math.round(emailLines.reduce((s, l) => s + (l.lineTotal ?? 0), 0) * 100) / 100;
    const hasPriceOnRequest = emailLines.some(l => l.unitPrice == null);
    const customerName = `${account.firstName} ${account.lastName}`.trim() || account.email;

    /* ── Create the WooCommerce order (on-hold, unpaid) ── */
    const b = account.billing ?? {};
    const billing = {
        first_name: b.first_name || account.firstName,
        last_name: b.last_name || account.lastName,
        company: account.businessName || b.company || '',
        address_1: b.address_1 || account.businessAddress || '',
        address_2: b.address_2 || '',
        city: b.city || '',
        state: b.state || '',
        postcode: b.postcode || '',
        country: b.country || 'IN',
        email: account.email,
        phone: account.businessPhone || b.phone || '',
    };

    let order: { id: number; number: string };
    try {
        order = await wcPost('orders', {
            status: 'on-hold',
            customer_id: account.id,
            created_via: 'wholesale-enquiry', // ignored by WC REST; plugin v4.2 applies it from meta below
            set_paid: false,
            payment_method: '',
            payment_method_title: 'Wholesale enquiry (no online payment)',
            billing,
            ...(account.shipping?.address_1 ? { shipping: account.shipping } : {}),
            line_items: lineItems,
            customer_note: note,
            meta_data: [
                { key: '_wam_created_via', value: 'wholesale-enquiry' },
                { key: '_wam_enquiry_ref', value: reference },
                { key: '_wam_tier', value: tier },
                { key: '_wam_channel', value: 'email' },
                ...(account.gstNumber ? [{ key: '_billing_gstin', value: account.gstNumber }] : []),
            ],
        }) as { id: number; number: string };
    } catch (err) {
        console.error('[wholesale/enquiry] WooCommerce order creation failed:', err);
        return json({ error: 'We could not create your order. Please try again or send it on WhatsApp.' }, 502);
    }

    /* ── Emails (awaited — the response reports whether each was sent) ── */
    const emailData: EnquiryEmailData = {
        reference,
        orderNumber: String(order.number),
        tier,
        customerName,
        customerEmail: account.email,
        businessName: account.businessName,
        phone: billing.phone,
        gstNumber: account.gstNumber,
        items: emailLines,
        subtotal,
        hasPriceOnRequest,
        note,
    };
    const adminOrderUrl = `${process.env.WOOCOMMERCE_URL ?? ''}/wp-admin/post.php?post=${order.id}&action=edit`;

    const [adminMail, customerMail] = await Promise.allSettled([
        sendWholesaleEnquiryAdminEmail(emailData, adminOrderUrl),
        sendWholesaleEnquiryCustomerEmail(emailData, getWholesaleUrl('/account/orders')),
    ]);
    if (adminMail.status === 'rejected') console.error(`[wholesale/enquiry] admin email failed for ${reference}:`, adminMail.reason);
    if (customerMail.status === 'rejected') console.error(`[wholesale/enquiry] customer email failed for ${reference}:`, customerMail.reason);

    return json({
        success: true,
        reference,
        orderNumber: String(order.number),
        subtotal,
        hasPriceOnRequest,
        emails: {
            store: adminMail.status === 'fulfilled',
            customer: customerMail.status === 'fulfilled',
        },
    });
}
