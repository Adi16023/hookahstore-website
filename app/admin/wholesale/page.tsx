export const dynamic = 'force-dynamic';

import { wcGet } from '../../../lib/woocommerce';
import WholesaleClient, { type WcCustomer } from './WholesaleClient';

export default async function WholesalePage() {
    let pending: WcCustomer[] = [];
    let approved: WcCustomer[] = [];
    let error = '';

    try {
        [pending, approved] = await Promise.all([
            wcGet('customers?role=wholesale_pending&per_page=100&orderby=registered_date&order=desc') as Promise<WcCustomer[]>,
            wcGet('customers?role=wholesale_customer&per_page=100&orderby=registered_date&order=desc') as Promise<WcCustomer[]>,
        ]);
    } catch (e) {
        error = e instanceof Error ? e.message : 'Failed to load wholesale customers.';
    }

    return (
        <div>
            <h1 className="admin-h1">Wholesale</h1>
            <p className="admin-sub">Approve or reject wholesale applications — replaces the WordPress plugin admin screen.</p>
            {error ? <div className="admin-error">{error}</div> : (
                <WholesaleClient initialPending={pending} initialApproved={approved} />
            )}
        </div>
    );
}
