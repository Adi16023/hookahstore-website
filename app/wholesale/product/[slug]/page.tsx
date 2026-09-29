export const runtime = 'edge';
// ISR: revalidate wholesale product pages every 300 seconds (5 minutes).
export const revalidate = 300;
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getWholesaleProductBySlug, type WholesaleProduct } from '../../../../lib/woocommerce/wholesale-catalog';
import WholesaleProductClient from './WholesaleProductClient';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const product = await getWholesaleProductBySlug(slug).catch(() => null);
    const title = product?.name ?? slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
        title: `${title} | Wholesale | The Hookah Store`,
        description: `Wholesale ${title}. Log in to your approved wholesale account to view your tier pricing and order.`,
    };
}

export default async function WholesaleProductPage({ params }: Props) {
    const { slug } = await params;

    // Server-side, price-free. Products not ticked "Show in wholesale" → 404.
    let product: WholesaleProduct | null = null;
    try {
        product = await getWholesaleProductBySlug(slug);
    } catch (err) {
        console.error('[wholesale/product] WooCommerce request failed:', slug, err);
        throw err; // surface as an error page rather than a misleading 404
    }
    if (!product) notFound();

    return <WholesaleProductClient product={product} />;
}
