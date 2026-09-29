export const runtime = 'edge';
/**
 * GET /api/wholesale/profile — business details for the logged-in, approved
 * wholesaler (used to fill the WhatsApp order message on the cart page).
 */
import { NextResponse } from 'next/server';
import { requireApprovedWholesaler } from '../../../../lib/auth/wholesale-guard';

export async function GET() {
    const guard = await requireApprovedWholesaler();
    if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status, headers: { 'Cache-Control': 'no-store' } });
    const { account, tier } = guard;
    return NextResponse.json({
        firstName: account.firstName,
        lastName: account.lastName,
        email: account.email,
        businessName: account.businessName,
        phone: account.businessPhone,
        gstNumber: account.gstNumber,
        tier,
    }, { headers: { 'Cache-Control': 'private, no-store' } });
}
