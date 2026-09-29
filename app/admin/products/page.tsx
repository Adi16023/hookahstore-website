export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { wcGet } from '../../../lib/woocommerce';
import ProductsClient from './ProductsClient';

export interface AdminProduct {
    id: number;
    name: string;
    sku: string;
    type: string;
    status: string;
    price: string;
    regular_price: string;
    sale_price: string;
    stock_status: string;
    stock_quantity: number | null;
    images: { src: string }[];
    categories: { id: number; name: string }[];
}

export default async function AdminProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; page?: string }>;
}) {
    const { search = '', page = '1' } = await searchParams;

    const query = new URLSearchParams({ per_page: '50', page, orderby: 'date', order: 'desc' });
    if (search) query.set('search', search);

    let products: AdminProduct[] = [];
    let error = '';
    try {
        products = (await wcGet(`products?${query.toString()}`)) as AdminProduct[];
    } catch (e) {
        error = e instanceof Error ? e.message : 'Failed to load products.';
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 className="admin-h1">Products</h1>
                    <p className="admin-sub">Edit pricing, stock, and wholesale visibility.</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <Link href="/admin/products/categories" className="admin-btn admin-btn-secondary">Categories</Link>
                    <Link href="/admin/products/tags" className="admin-btn admin-btn-secondary">Tags</Link>
                </div>
            </div>
            {error ? (
                <div className="admin-error">{error}</div>
            ) : (
                <ProductsClient initialProducts={products} initialSearch={search} currentPage={Number(page)} />
            )}
        </div>
    );
}
