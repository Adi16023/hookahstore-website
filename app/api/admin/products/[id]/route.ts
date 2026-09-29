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
    const body = await req.json().catch(() => null);
    if (!body) {
        return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    try {
        const updated = await wcPut(`products/${id}`, body);
        return NextResponse.json({ success: true, product: updated });
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to update product.';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
