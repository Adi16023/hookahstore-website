export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { getShippingOptions } from '../../../../lib/checkout/shipping';

export const dynamic = 'force-dynamic';

// Uses the same helper as /api/payment/create-order, so the price shown here is
// exactly the price charged (Shiprocket live rates, flat-rate fallback).
export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as { deliveryPostcode?: string; weight?: number };
        const { deliveryPostcode, weight = 0.5 } = body;

        if (!deliveryPostcode || deliveryPostcode.trim().length < 6) {
            return NextResponse.json({ error: 'Valid delivery postcode is required' }, { status: 400 });
        }

        const methods = await getShippingOptions(deliveryPostcode.trim(), weight);
        return NextResponse.json({ methods });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[/api/shipping/rates]', msg);
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
