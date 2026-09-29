export const dynamic = 'force-dynamic';

import { wcGet } from '../../../lib/woocommerce';
import CustomersClient, { type AdminCustomer } from './CustomersClient';

export default async function CustomersPage({
    searchParams,
}: { searchParams: Promise<{ search?: string; page?: string }> }) {
    const { search = '', page = '1' } = await searchParams;

    const query = new URLSearchParams({ per_page: '100', page, orderby: 'registered_date', order: 'desc' });
    if (search) query.set('search', search);

    let customers: AdminCustomer[] = [];
    let error = '';
    try {
        customers = (await wcGet(`customers?${query.toString()}`)) as AdminCustomer[];
    } catch (e) {
        error = e instanceof Error ? e.message : 'Failed to load customers.';
    }

    return (
        <div>
            <h1 className="admin-h1">Customers</h1>
            <p className="admin-sub">All registered customers — retail and wholesale.</p>
            {error ? <div className="admin-error">{error}</div> : (
                <CustomersClient initialCustomers={customers} initialSearch={search} currentPage={Number(page)} />
            )}
        </div>
    );
}
