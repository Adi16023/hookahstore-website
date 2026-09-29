'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminOrder } from './page';

const STATUS_OPTIONS = ['', 'pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed'];

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        completed: 'admin-badge-green',
        processing: 'admin-badge-yellow',
        'on-hold': 'admin-badge-yellow',
        pending: 'admin-badge-gray',
        cancelled: 'admin-badge-red',
        refunded: 'admin-badge-red',
        failed: 'admin-badge-red',
    };
    return <span className={`admin-badge ${map[status] ?? 'admin-badge-gray'}`}>{status}</span>;
}

export default function OrdersClient({
    initialOrders, initialSearch, initialStatus, currentPage,
}: { initialOrders: AdminOrder[]; initialSearch: string; initialStatus: string; currentPage: number }) {
    const router = useRouter();
    const [search, setSearch] = useState(initialSearch);
    const [status, setStatus] = useState(initialStatus);

    function applyFilters(overrides: { search?: string; status?: string; page?: number } = {}) {
        const params = new URLSearchParams();
        const s = overrides.search ?? search;
        const st = overrides.status ?? status;
        if (s) params.set('search', s);
        if (st) params.set('status', st);
        if (overrides.page) params.set('page', String(overrides.page));
        router.push(`/admin/orders?${params.toString()}`);
    }

    return (
        <div>
            <div className="admin-toolbar">
                <input
                    className="admin-input"
                    placeholder="Search by order # or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && applyFilters()}
                    style={{ flex: 1, minWidth: 200 }}
                />
                <select
                    className="admin-select"
                    value={status}
                    onChange={e => { setStatus(e.target.value); applyFilters({ status: e.target.value }); }}
                >
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s || 'All statuses'}</option>)}
                </select>
                <button className="admin-btn admin-btn-secondary" onClick={() => applyFilters()}>Search</button>
            </div>

            <div className="admin-table-wrap">
                {initialOrders.length === 0 ? (
                    <div className="admin-empty">No orders found.</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {initialOrders.map(o => (
                                <tr key={o.id} className="clickable" onClick={() => router.push(`/admin/orders/${o.id}`)}>
                                    <td>#{o.number}</td>
                                    <td>{o.billing?.first_name} {o.billing?.last_name}<br /><span style={{ color: '#9a9aa3', fontSize: 12 }}>{o.billing?.email}</span></td>
                                    <td>{new Date(o.date_created).toLocaleDateString()}</td>
                                    <td>{o.currency === 'INR' ? '₹' : o.currency}{o.total}</td>
                                    <td><StatusBadge status={o.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="admin-pagination">
                <button className="admin-btn admin-btn-secondary" disabled={currentPage <= 1} onClick={() => applyFilters({ page: currentPage - 1 })}>Previous</button>
                <button className="admin-btn admin-btn-secondary" disabled={initialOrders.length < 50} onClick={() => applyFilters({ page: currentPage + 1 })}>Next</button>
            </div>
        </div>
    );
}
