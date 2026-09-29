export const runtime = 'edge';
import type { Metadata } from 'next';
import ShopByBundleClient from './ShopByBundleClient';

export const metadata: Metadata = {
    title: 'Shop Hookahs By Bundle',
    description: 'Get more for less with our curated hookah bundles — everything you need for the perfect session, all in one place.',
};

export default function ShopByBundlePage() {
    return <ShopByBundleClient />;
}
