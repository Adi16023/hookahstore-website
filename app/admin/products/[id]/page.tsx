export const dynamic = 'force-dynamic';

import { wcGet } from '../../../../lib/woocommerce';
import ProductEditClient, { type FullProduct, type WcCategory } from './ProductEditClient';

export default async function ProductEditPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    let product: FullProduct | null = null;
    let categories: WcCategory[] = [];
    let error = '';

    try {
        [product, categories] = await Promise.all([
            wcGet(`products/${id}`) as Promise<FullProduct>,
            wcGet('products/categories?per_page=100') as Promise<WcCategory[]>,
        ]);
    } catch (e) {
        error = e instanceof Error ? e.message : 'Failed to load product.';
    }

    if (error || !product) {
        return <div className="admin-error">{error || 'Product not found.'}</div>;
    }

    return <ProductEditClient product={product} categories={categories} />;
}
