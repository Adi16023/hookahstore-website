'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AdminProduct } from './page';

function money(v: string) {
    const n = parseFloat(v);
    return isNaN(n) ? '—' : `₹${n.toFixed(2)}`;
}

function StockBadge({ status }: { status: string }) {
    const cls = status === 'instock' ? 'admin-badge-green' : status === 'onbackorder' ? 'admin-badge-yellow' : 'admin-badge-red';
    const label = status === 'instock' ? 'In stock' : status === 'onbackorder' ? 'Backorder' : 'Out of stock';
    return <span className={`admin-badge ${cls}`}>{label}</span>;
}

export default function ProductsClient({
    initialProducts, initialSearch, currentPage,
}: { initialProducts: AdminProduct[]; initialSearch: string; currentPage: number }) {
    const router = useRouter();
    const [search, setSearch] = useState(initialSearch);

    function runSearch(e: React.FormEvent) {
        e.preventDefault();
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        router.push(`/admin/products?${params.toString()}`);
    }

    function goPage(p: number) {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        params.set('page', String(p));
        router.push(`/admin/products?${params.toString()}`);
    }

    return (
        <div>
            <form className="admin-toolbar" onSubmit={runSearch}>
                <input
                    className="admin-input"
                    placeholder="Search products…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{ flex: 1, minWidth: 200 }}
                />
                <button type="submit" className="admin-btn admin-btn-secondary">Search</button>
            </form>

            <div className="admin-table-wrap">
                {initialProducts.length === 0 ? (
                    <div className="admin-empty">No products found.</div>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Name</th>
                                <th>SKU</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initialProducts.map(p => (
                                <tr key={p.id} className="clickable" onClick={() => router.push(`/admin/products/${p.id}`)}>
                                    <td>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img className="admin-thumb" src={p.images?.[0]?.src || '/placeholder.png'} alt="" />
                                    </td>
                                    <td>{p.name}</td>
                                    <td>{p.sku || '—'}</td>
                                    <td>{p.categories?.map(c => c.name).join(', ') || '—'}</td>
                                    <td>{money(p.sale_price || p.price || p.regular_price)}</td>
                                    <td><StockBadge status={p.stock_status} /></td>
                                    <td>
                                        <span className={`admin-badge ${p.status === 'publish' ? 'admin-badge-green' : 'admin-badge-gray'}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="admin-pagination">
                <button className="admin-btn admin-btn-secondary" disabled={currentPage <= 1} onClick={() => goPage(currentPage - 1)}>Previous</button>
                <button className="admin-btn admin-btn-secondary" disabled={initialProducts.length < 50} onClick={() => goPage(currentPage + 1)}>Next</button>
            </div>
        </div>
    );
}
