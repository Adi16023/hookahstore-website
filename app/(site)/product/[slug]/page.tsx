export const runtime = 'edge';
// ISR — product pages rebuilt at most every 5 minutes across the server fleet.
// Replacing the previous edge-runtime / CSR approach so the full product HTML
// is present in the initial response (SEO, no client spinner).
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchGraphQLSafe, GET_PRODUCT_DETAIL, type WPProductDetail } from '../../../../lib/graphql';
import ProductDetailPageClient from './ProductDetailPageClient';

export const revalidate = 300;

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const title = slug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    return {
        title: `${title} | The Hookah Store`,
        description: `Shop ${title} at The Hookah Store. Premium hookah tobacco and accessories.`,
    };
}

export default async function ProductPage({ params }: Props) {
    const { slug } = await params;

    // Fetch product server-side — cached for 5 minutes (ISR).
    // fetchGraphQLSafe returns null on network/GraphQL errors instead of throwing.
    const data = await fetchGraphQLSafe(GET_PRODUCT_DETAIL, { slug }, 300);
    const product: WPProductDetail | null = data?.product ?? null;

    if (!product) {
        notFound();
    }

    return <ProductDetailPageClient product={product} />;
}
