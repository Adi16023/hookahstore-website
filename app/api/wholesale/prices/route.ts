export const runtime = 'edge';
/**
 * GET /api/wholesale/prices?ids=12,34,56
 *
 * Returns ONLY the logged-in wholesaler's tier price for each product and
 * variation. Requires an approved wholesale_customer session (re-checked live
 * against WooCommerce). Products not visible in wholesale are omitted.
 *
 * Response:
 *   { tier: "gold", products: { "12": { price: 450 | null, variations: [{ id, attributes, price }] } } }
 *   price null → "Price on request"
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireApprovedWholesaler } from '../../../../lib/auth/wholesale-guard';
import { getTierPrices } from '../../../../lib/woocommerce/wholesale-pricing';

const MAX_IDS = 50;

export async function GET(req: NextRequest) {
    const guard = await requireApprovedWholesaler();
    if (!guard.ok) {
        return NextResponse.json({ error: guard.error }, { status: guard.status, headers: { 'Cache-Control': 'no-store' } });
    }

    const ids = (req.nextUrl.searchParams.get('ids') ?? '')
        .split(',')
        .map(s => Number(s.trim()))
        .filter(n => Number.isInteger(n) && n > 0)
        .slice(0, MAX_IDS);

    if (!ids.length) {
        return NextResponse.json({ tier: guard.tier, products: {} }, { headers: { 'Cache-Control': 'no-store' } });
    }

    try {
        const prices = await getTierPrices(ids, guard.tier);
        const products = Object.fromEntries(
            Object.values(prices).map(p => [p.productId, { price: p.price, variations: p.variations }])
        );
        // Per-user response — must never be cached by a shared cache.
        return NextResponse.json({ tier: guard.tier, products }, { headers: { 'Cache-Control': 'private, no-store' } });
    } catch (err) {
        console.error('[api/wholesale/prices] failed:', err);
        return NextResponse.json({ error: 'Could not load prices right now.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
    }
}
