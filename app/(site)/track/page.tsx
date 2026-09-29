import type { Metadata } from 'next';
import TrackingPageClient from './TrackingPageClient';

export const metadata: Metadata = {
    title: 'Track Your Order — The Hookah Store',
    description: 'Enter your order number to get live shipping and delivery updates.',
};

export default function TrackPage() {
    return <TrackingPageClient />;
}
