export const runtime = 'edge';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from '../../../../lib/auth/session-server';
import WholesaleOrdersClient from './WholesaleOrdersClient';

export const metadata: Metadata = {
    title: 'Wholesale Orders | The Hookah Store',
    description: 'View and manage your wholesale orders.',
};

export default async function WholesaleOrdersPage() {
    const session = await getServerSession();
    if (!session) redirect('/wholesale/login?reason=unauthenticated');

    return (
        <WholesaleOrdersClient
            session={{
                firstName:   session.firstName,
                lastName:    session.lastName,
                email:       session.email,
                role:        session.role,
                accountType: session.accountType,
            }}
        />
    );
}
