export const runtime = 'edge';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    fetchGraphQLSafe,
    fetchCategoryProducts,
    GET_PRODUCT_CATEGORY,
    type WPProductNode,
    type WPProductCategory,
} from '../../../../lib/graphql';
import CategoryPageClient from '../../category/[slug]/CategoryPageClient';

type Props = { params: Promise<{ slug: string }> };

/* ── SEO ─────────────────────────────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const data = await fetchGraphQLSafe(GET_PRODUCT_CATEGORY, { slug }, 3600);
    // Unknown brand → not-found UI + noindex. NOTE: HTTP status stays 200 because
    // app/(site)/loading.tsx streams the response before notFound() runs (soft 404).
    if (data && !data.productCategory) notFound();
    const cat: WPProductCategory | null = data?.productCategory ?? null;
    const name = cat?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
        title: name,
        description: `Shop all ${name} products — authentic hookah & shisha, delivered across India.`,
    };
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default async function BrandPage({ params }: Props) {
    const { slug } = await params;

    // Brands are stored as WooCommerce product categories (e.g. "al-fakher", "afzal", "mya")
    // NOT as product tags — so we query by category slug.
    const [catData, prodData] = await Promise.all([
        fetchGraphQLSafe(GET_PRODUCT_CATEGORY, { slug }, 3600),
        fetchCategoryProducts(slug, 60, 300),
    ]);

    const category: WPProductCategory | null = catData?.productCategory ?? null;
    const products: WPProductNode[] = prodData?.products?.nodes ?? [];

    /* WordPress answered and this brand category doesn't exist → real 404.
       (catData === null means the CMS request itself failed — don't 404 on an outage.) */
    if (catData && !catData.productCategory) notFound();

    /* CMS unreachable → render with a synthetic category so the page still loads */
    const resolvedCategory = category ?? {
        id: slug,
        name: slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        slug,
        description: null,
        count: products.length,
        image: null,
    };

    /* Breadcrumb parent comes from lib/config/categories.ts (flavour brands → Hookah Flavours) */
    return (
        <CategoryPageClient
            category={resolvedCategory}
            products={products}
            slug={slug}
        />
    );
}
