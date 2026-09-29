export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { wcPost } from '../../../../lib/woocommerce';
import { requireAdminSession } from '../../../../lib/admin/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    if (!(await requireAdminSession())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { name } = await req.json().catch(() => ({})) as { name?: string };
    if (!name?.trim()) {
        return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }
    try {
        const term = await wcPost('products/tags', { name: name.trim() });
        return NextResponse.json({ success: true, term });
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to create tag.';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
