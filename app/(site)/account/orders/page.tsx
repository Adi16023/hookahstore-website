export const runtime = 'edge';
import type { Metadata } from 'next';
import OrdersPageClient from './OrdersPageClient';

export const metadata: Metadata = {
    title: 'My Orders | The Hookah Store',
    description: 'View your recent orders on The Hookah Store.',
};

export default function OrdersPage() {
    return <OrdersPageClient />;
}
