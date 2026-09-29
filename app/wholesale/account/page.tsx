export const runtime = 'edge';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from '../../../lib/auth/session-server';
import WholesaleAccountClient from './WholesaleAccountClient';

export const metadata: Metadata = {
    title: 'My Wholesale Account | The Hookah Store',
    description: 'Manage your wholesale partner account, orders and business profile.',
};

export default async function WholesaleAccountPage() {
    const session = await getServerSession();
    if (!session) redirect('/wholesale/login?reason=unauthenticated');

    return (
        <WholesaleAccountClient
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
