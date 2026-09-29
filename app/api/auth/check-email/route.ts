export const runtime = 'edge';
// Note: runtime is NOT set to 'edge' — rate limiting requires Node module-level state.
/**
 * POST /api/auth/check-email
 * Checks whether a customer account exists for the given email.
 * Returns { exists: true | false } — never exposes user data.
 */
import { NextRequest, NextResponse } from 'next/server';
import { wcGetCustomerByEmail } from '../../../../lib/woocommerce';


export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as { email?: string };
        const email = body.email?.trim().toLowerCase();

        if (!email) {
            return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
        }

        const customer = await wcGetCustomerByEmail(email);
        return NextResponse.json({ exists: !!customer });
    } catch (err) {
        console.error('[check-email]', err);
        // Fail open — treat as "not found" so UX is never stuck
        return NextResponse.json({ exists: false });
    }
}
