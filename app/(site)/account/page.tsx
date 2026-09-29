export const runtime = 'edge';
import type { Metadata } from 'next';
import AccountPageClient from './AccountPageClient';

export const metadata: Metadata = {
    title: 'My Account',
    description: 'Manage your Hookah Store account, addresses, and order history.',
};

export default function AccountPage() {
    return <AccountPageClient />;
}
