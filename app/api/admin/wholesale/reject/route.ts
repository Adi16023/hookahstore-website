export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { wcSetWholesaleMeta } from '../../../../../lib/woocommerce/wholesale';
import { sendWholesaleRejectedEmail } from '../../../../../lib/email/send-emails';
import { requireAdminSession } from '../../../../../lib/admin/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    if (!(await requireAdminSession())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { customerId, email, name } = await req.json().catch(() => ({})) as {
        customerId?: number; email?: string; name?: string;
    };

    if (!customerId || !email || !name) {
        return NextResponse.json({ error: 'customerId, email, and name are required.' }, { status: 400 });
    }

    try {
        // Role intentionally left as wholesale_pending — matches the existing WordPress plugin behaviour on reject.
        await wcSetWholesaleMeta(customerId, { account_type: 'wholesale', approval_status: 'rejected' });
        await sendWholesaleRejectedEmail({ name, email: email.toLowerCase() });
        return NextResponse.json({ success: true });
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to reject application.';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
