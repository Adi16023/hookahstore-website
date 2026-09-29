'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface AdminCustomer {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    date_created: string;
    is_paying_customer: boolean;
}

function RoleBadge({ role }: { role: string }) {
    const map: Record<string, string> = {
        wholesale_customer: 'admin-badge-green',
        wholesale_pending: 'admin-badge-yellow',
        customer: 'admin-badge-violet',
        administrator: 'admin-badge-red',
    };
    return <span className={`admin-badge ${map[role] ?? 'admin-badge-gray'}`}>{role}</span>;
}

export default function CustomersClient({
    initialCustomers, initialSearch, currentPage,
}: { initialCustomers: AdminCustomer[]; initialSearch: string; currentPage: number }) {
    const router = useRouter();
    const [search, setSearch] = useState(initialSearch);

    function runSearch(e: React.FormEvent) {
        e.preventDefault();
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        router.push(`/admin/customers?${params.toString()}`);
    }

    function goPage(p: number) {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        params.set('page', String(p));
        router.push(`/admin/customers?${params.toString()}`);
    }

    return (
        <div>
            <form className="admin-toolbar" onSubmit={runSearch}>
                <input
                    className="admin-input"
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200 }}
                />
                <button type="submit" className="admin-btn admin-btn-secondary">Search</button>
            </form>

            <div className="admin-table-wrap">
                {initialCustomers.length === 0 ? (
                    <div className="admin-empty">No customers found.</div>
                ) : (
                    <table className="admin-table">
                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Registered</th></tr></thead>
                        <tbody>
                            {initialCustomers.map(c => (
                                <tr key={c.id}>
                                    <td>{c.first_name} {c.last_name}</td>
                                    <td>{c.email}</td>
                                    <td><RoleBadge role={c.role} /></td>
                                    <td>{new Date(c.date_created).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="admin-pagination">
                <button className="admin-btn admin-btn-secondary" disabled={currentPage <= 1} onClick={() => goPage(currentPage - 1)}>Previous</button>
                <button className="admin-btn admin-btn-secondary" disabled={initialCustomers.length < 100} onClick={() => goPage(currentPage + 1)}>Next</button>
            </div>
        </div>
    );
}
