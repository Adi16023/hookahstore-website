export const runtime = 'edge';
// ISR — category listings refresh at most every 5 minutes
export const revalidate = 300;

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    getWholesaleCategory,
    getWholesaleProductsByCategory,
    type WholesaleCategory,
    type WholesaleProduct,
} from '../../../../lib/woocommerce/wholesale-catalog';
import { findCategory } from '../../../../lib/config/categories';
import WholesaleCategoryClient from './WholesaleCategoryClient';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const cat = await getWholesaleCategory(slug).catch(() => null);
    const name = cat?.name ?? findCategory(slug)?.label ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    return {
        title: `${name} | Wholesale | The Hookah Store`,
        description: `Wholesale ${name} for smoke shops and lounges. Log in to your approved wholesale account for tier pricing.`,
    };
}

export default async function WholesaleCategoryPage({ params }: Props) {
    const { slug } = await params;

    // Products are price-free and already filtered to show_in_wholesale = "1" server-side.
    let category: WholesaleCategory | null = null;
    let products: WholesaleProduct[] = [];
    let cmsReachable = true;
    try {
        [category, products] = await Promise.all([
            getWholesaleCategory(slug),
            getWholesaleProductsByCategory(slug),
        ]);
    } catch (err) {
        cmsReachable = false;
        console.error('[wholesale/category] WooCommerce request failed:', slug, err);
    }

    // Unknown slug (not in WooCommerce and not in our category tree) → wholesale 404
    if (cmsReachable && !category && !findCategory(slug)) notFound();

    return <WholesaleCategoryClient slug={slug} category={category} products={products} />;
}
