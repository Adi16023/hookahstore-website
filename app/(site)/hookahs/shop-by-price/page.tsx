export const runtime = 'edge';
import type { Metadata } from 'next';
import {
    fetchGraphQLSafe,
    fetchCategoryProducts,
    type WPProductNode,
} from '../../../../lib/graphql';
import CategoryPageClient from '../../category/[slug]/CategoryPageClient';

export const metadata: Metadata = {
    title: 'Shop Hookahs By Price',
    description: 'Find the perfect hookah for your budget — quality pipes at every price point.',
};

export default async function ShopByPricePage() {
    const prodData = await fetchCategoryProducts('hookahs', 60, 0);
    const products: WPProductNode[] = prodData?.products?.nodes ?? [];

    return (
        <CategoryPageClient
            category={{
                id: 'shop-by-price',
                name: 'Shop By Price',
                slug: 'hookahs',
                description: 'Find the perfect hookah for your budget — quality pipes at every price point, from beginner-friendly options to premium setups.',
                count: products.length,
                image: null,
            }}
            products={products}
            slug="hookahs"
            parentLabel="Hookahs"
            parentHref="/hookahs/shop-by-price"
        />
    );
}
