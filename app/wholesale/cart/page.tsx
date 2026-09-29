export const runtime = 'edge';
import type { Metadata } from 'next';
import WholesaleCartClient from './WholesaleCartClient';

// Protected by middleware: approved wholesale_customer only.
export const metadata: Metadata = {
    title: 'Wholesale Cart | The Hookah Store',
    description: 'Review your wholesale order and send it on WhatsApp or by email.',
    robots: { index: false, follow: false },
};

export default function WholesaleCartPage() {
    return <WholesaleCartClient />;
}
