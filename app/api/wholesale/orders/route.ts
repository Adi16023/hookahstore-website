export const runtime = 'edge';
/**
 * GET /api/wholesale/orders — the logged-in, approved wholesaler's WooCommerce
 * orders and enquiries (newest first), looked up by their customer ID.
 */
import { NextResponse } from 'next/server';
import { requireApprovedWholesaler } from '../../../../lib/auth/wholesale-guard';
import { wcGet } from '../../../../lib/woocommerce';

interface WcOrder {
    id: number;
    number: string;
    status: string;
    date_created: string;
    total: string;
    created_via?: string;
    line_items?: { name: string; quantity: number }[];
    meta_data?: { key: string; value: unknown }[];
}

export async function GET() {
    const guard = await requireApprovedWholesaler();
    if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status, headers: { 'Cache-Control': 'no-store' } });

    try {
        const orders = await wcGet(`orders?customer=${guard.account.id}&per_page=50&orderby=date&order=desc`) as WcOrder[];
        const meta = (o: WcOrder, k: string) => {
            const m = o.meta_data?.find(x => x.key === k);
            return m?.value != null ? String(m.value) : null;
        };
        return NextResponse.json({
            orders: (Array.isArray(orders) ? orders : []).map(o => ({
                id: o.id,
                number: o.number,
                status: o.status,
                date: o.date_created,
                total: Number(o.total) || 0,
                reference: meta(o, '_wam_enquiry_ref'),
                isEnquiry: meta(o, '_wam_created_via') === 'wholesale-enquiry' || o.created_via === 'wholesale-enquiry',
                items: (o.line_items ?? []).map(li => ({ name: li.name, quantity: li.quantity })),
            })),
        }, { headers: { 'Cache-Control': 'private, no-store' } });
    } catch (err) {
        console.error('[api/wholesale/orders] failed:', err);
        return NextResponse.json({ error: 'Could not load your orders right now.' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
    }
}
