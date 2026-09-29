export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { getShiprocketTracking } from '../../../../lib/shiprocket';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const { orderNumber } = await req.json() as { orderNumber?: string };

        if (!orderNumber || !orderNumber.trim()) {
            return NextResponse.json({ error: 'Order number is required' }, { status: 400 });
        }

        const result = await getShiprocketTracking(orderNumber.trim().replace(/^#/, ''));
        return NextResponse.json(result);
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[/api/shiprocket/track]', msg);
        return NextResponse.json({ error: 'Could not fetch tracking info. Please try again.' }, { status: 500 });
    }
}
