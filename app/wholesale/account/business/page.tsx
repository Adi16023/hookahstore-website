export const runtime = 'edge';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from '../../../../lib/auth/session-server';
import WholesaleBusinessClient from './WholesaleBusinessClient';

export const metadata: Metadata = {
    title: 'Business Profile | The Hookah Store',
    description: 'Manage your wholesale business profile and GST details.',
};

export default async function WholesaleBusinessPage() {
    const session = await getServerSession();
    if (!session) redirect('/wholesale/login?reason=unauthenticated');

    return (
        <WholesaleBusinessClient
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
