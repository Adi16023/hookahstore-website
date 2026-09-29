export const runtime = 'edge';
import type { Metadata } from 'next';
import WholesaleLoginClient from './LoginClient';

export const metadata: Metadata = {
    title: 'Wholesale Login | The Hookah Store',
    description: 'Sign in to your wholesale partner account.',
};

export default function WholesaleLoginPage() {
    return <WholesaleLoginClient />;
}
