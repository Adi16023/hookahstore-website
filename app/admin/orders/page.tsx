export const dynamic = 'force-dynamic';

import { wcGet } from '../../../lib/woocommerce';
import OrdersClient from './OrdersClient';

export interface AdminOrder {
    id: number;
    number: string;
    status: string;
    total: string;
    currency: string;
    date_created: string;
    billing: { first_name: string; last_name: string; email: string };
}

export default async function AdminOrdersPage({
    searchParams,
}: { searchParams: Promise<{ search?: string; status?: string; page?: string }> }) {
    const { search = '', status = '', page = '1' } = await searchParams;

    const query = new URLSearchParams({ per_page: '50', page, orderby: 'date', order: 'desc' });
    if (search) query.set('search', search);
    if (status) query.set('status', status);

    let orders: AdminOrder[] = [];
    let error = '';
    try {
        orders = (await wcGet(`orders?${query.toString()}`)) as AdminOrder[];
    } catch (e) {
        error = e instanceof Error ? e.message : 'Failed to load orders.';
    }

    return (
        <div>
            <h1 className="admin-h1">Orders</h1>
            <p className="admin-sub">View and update order status, payment, and shipment info.</p>
            {error ? <div className="admin-error">{error}</div> : (
                <OrdersClient initialOrders={orders} initialSearch={search} initialStatus={status} currentPage={Number(page)} />
            )}
        </div>
    );
}
