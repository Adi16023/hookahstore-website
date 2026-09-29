export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { getServerSession } from '../../../../lib/auth/session-server';

export async function GET() {
    const session = await getServerSession();

    if (!session) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    return NextResponse.json({
        sub: session.sub,
        email: session.email,
        firstName: session.firstName,
        lastName: session.lastName,
        accountType: session.accountType,
        role: session.role ?? null,
        tier: session.tier ?? null,
        userId: session.sub ? Number(session.sub) : null,
        emailVerified: session.emailVerified ?? false,
    });
}
