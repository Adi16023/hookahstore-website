export const runtime = 'edge';
import type { Metadata } from 'next';
import ShopByBrandClient from './ShopByBrandClient';

export const metadata: Metadata = {
    title: 'Shop Hookahs By Brand',
    description: 'Explore our collection of hookahs, organized by brand so you can easily find your favorites or discover something new from the top names in the industry.',
};

export default function ShopByBrandPage() {
    return <ShopByBrandClient />;
}
