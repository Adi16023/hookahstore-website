export const dynamic = 'force-dynamic';

import { wcGet } from '../../../../lib/woocommerce';
import OrderDetailClient, { type FullOrder } from './OrderDetailClient';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let order: FullOrder | null = null;
    let error = '';
    try {
        order = (await wcGet(`orders/${id}`)) as FullOrder;
    } catch (e) {
        error = e instanceof Error ? e.message : 'Failed to load order.';
    }

    if (error || !order) {
        return <div className="admin-error">{error || 'Order not found.'}</div>;
    }

    return <OrderDetailClient order={order} />;
}
