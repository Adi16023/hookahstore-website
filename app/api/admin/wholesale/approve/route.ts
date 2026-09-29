export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { wcSetCustomerRole, wcSetWholesaleMeta } from '../../../../../lib/woocommerce/wholesale';
import { sendWholesaleApprovedEmail } from '../../../../../lib/email/send-emails';
import { requireAdminSession } from '../../../../../lib/admin/auth';
import { getWholesaleUrl } from '../../../../../lib/config';

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
        await wcSetCustomerRole(customerId, 'wholesale_customer');
        await wcSetWholesaleMeta(customerId, { account_type: 'wholesale', approval_status: 'approved' });
        await sendWholesaleApprovedEmail({
            name,
            email: email.toLowerCase(),
            loginUrl: getWholesaleUrl('/login'),
        });
        return NextResponse.json({ success: true });
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to approve application.';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
