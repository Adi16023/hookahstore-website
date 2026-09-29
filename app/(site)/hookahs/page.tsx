export const runtime = 'edge';
import type { Metadata } from 'next';
import {
    fetchGraphQLSafe,
    fetchCategoryProducts,
    type WPProductNode,
} from '../../../lib/graphql';
import CategoryPageClient from '../category/[slug]/CategoryPageClient';

export const metadata: Metadata = {
    title: 'Hookahs',
    description: 'Shop our full collection of premium hookahs — traditional Egyptian pipes, modern multi-hose setups, and everything in between.',
};

export default async function HookahsPage() {
    const prodData = await fetchCategoryProducts('hookahs', 60, 0);
    const products: WPProductNode[] = prodData?.products?.nodes ?? [];

    return (
        <CategoryPageClient
            category={{
                id: 'hookahs',
                name: 'Hookahs',
                slug: 'hookahs',
                description: 'Shop our full collection of premium hookahs — traditional Egyptian pipes, modern multi-hose setups, and everything in between.',
                count: products.length,
                image: null,
            }}
            products={products}
            slug="hookahs"
            parentLabel="Category"
            parentHref="/hookahs"
        />
    );
}
