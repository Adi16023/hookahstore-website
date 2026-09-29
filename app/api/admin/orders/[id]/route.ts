export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { wcPut } from '../../../../../lib/woocommerce';
import { requireAdminSession } from '../../../../../lib/admin/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdminSession())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json().catch(() => ({})) as { status?: string };
    if (!status) {
        return NextResponse.json({ error: 'Status is required.' }, { status: 400 });
    }

    try {
        const updated = await wcPut(`orders/${id}`, { status });
        return NextResponse.json({ success: true, order: updated });
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to update order.';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
