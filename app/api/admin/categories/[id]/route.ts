export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { wcPut, wcDelete } from '../../../../../lib/woocommerce';
import { requireAdminSession } from '../../../../../lib/admin/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdminSession())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const { name } = await req.json().catch(() => ({})) as { name?: string };
    if (!name?.trim()) {
        return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }
    try {
        const term = await wcPut(`products/categories/${id}`, { name: name.trim() });
        return NextResponse.json({ success: true, term });
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to rename category.';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdminSession())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    try {
        await wcDelete(`products/categories/${id}?force=true`);
        return NextResponse.json({ success: true });
    } catch (e) {
        const msg = e instanceof Error ? e.message : 'Failed to delete category.';
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
