export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { createShiprocketOrder, ShiprocketOrderPayload } from '../../../../lib/shiprocket';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json() as ShiprocketOrderPayload;

        if (!payload.order_id || !payload.billing_pincode) {
            return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
        }

        const result = await createShiprocketOrder(payload);
        return NextResponse.json(result);
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[/api/shiprocket/create-shipment]', msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
