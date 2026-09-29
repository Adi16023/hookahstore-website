export const runtime = 'edge';
import { Metadata } from 'next';
import {
    fetchGraphQLSafe,
    fetchCategoryProducts,
    GET_PRODUCT_CATEGORY,
    type WPProductNode,
    type WPProductCategory,
} from '../../../../lib/graphql';
import CategoryPageClient from './CategoryPageClient';

// ISR — rebuild category pages at most every 5 minutes
export const revalidate = 300;

type Props = { params: Promise<{ slug: string }> };

/* ── SEO ─────────────────────────────────────────────────── */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const data = await fetchGraphQLSafe(GET_PRODUCT_CATEGORY, { slug }, 3600);
    const cat: WPProductCategory | null = data?.productCategory ?? null;
    const title = cat?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
        title,
        description: cat?.description ?? `Shop all ${title} — authentic hookah products, delivered across India.`,
    };
}

/* ── Page ────────────────────────────────────────────────── */
export default async function CategoryPage({ params }: Props) {
    const { slug } = await params;

    const [catData, prodData] = await Promise.all([
        fetchGraphQLSafe(GET_PRODUCT_CATEGORY, { slug }, 3600),  // category meta rarely changes
        fetchCategoryProducts(slug, 60, 300), // products: 5 min cache
    ]);

    const category: WPProductCategory | null = catData?.productCategory ?? null;
    const products: WPProductNode[] = prodData?.products?.nodes ?? [];

    return (
        <CategoryPageClient
            category={category}
            products={products}
            slug={slug}
        />
    );
}
