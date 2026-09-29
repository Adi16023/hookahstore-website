export const runtime = 'edge';
import type { Metadata } from 'next';
import WholesaleRegisterClient from './WholesaleRegisterClient';

export const metadata: Metadata = {
    title: 'Apply for Wholesale | The Hookah Store',
    description: 'Apply for a wholesale partner account and access exclusive B2B pricing.',
};

export default function WholesaleRegisterPage() {
    return <WholesaleRegisterClient />;
}
