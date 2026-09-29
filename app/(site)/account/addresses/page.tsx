export const runtime = 'edge';
import type { Metadata } from 'next';
import AddressesPageClient from './AddressesPageClient';

export const metadata: Metadata = {
    title: 'My Addresses | The Hookah Store',
    description: 'Manage your saved shipping and billing addresses.',
};

export default function AddressesPage() {
    return <AddressesPageClient />;
}
