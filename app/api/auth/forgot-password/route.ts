export const runtime = 'edge';
// Note: runtime is NOT set to 'edge' — rate limiting requires Node module-level state.
/**
 * POST /api/auth/forgot-password
 *
 * Flow:
 *  1. Look up customer by email via WooCommerce REST API
 *  2. Generate custom reset JWT (1h)
 *  3. Send reset email via Resend
 *
 * Always returns 200 to prevent email enumeration.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createResetToken, generateNonce } from '../../../../lib/auth';
import { wcGetCustomerByEmail } from '../../../../lib/woocommerce';
import { sendPasswordResetEmail } from '../../../../lib/email/send-emails';
import { getPublicAppUrl, getWholesaleUrl } from '../../../../lib/config';


const APP_URL = getPublicAppUrl();

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as { email?: string; source?: string };
        const email = body.email?.trim().toLowerCase();
        // 'wholesale' → the email links to the wholesale subdomain's reset page
        const isWholesale = body.source === 'wholesale';

        if (!email) {
            return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
        }

        /* Look up customer via WC REST API */
        const customer = await wcGetCustomerByEmail(email);
        if (!customer) {
            return NextResponse.json({ success: true });
        }

        /* Generate reset JWT (1h expiry) */
        const nonce = generateNonce();
        const resetToken = await createResetToken(String(customer.id), email, nonce);
        const resetUrl = isWholesale
            ? getWholesaleUrl(`/reset-password?token=${encodeURIComponent(resetToken)}`)
            : `${APP_URL}/reset-password?token=${resetToken}`;

        /* Send via Resend */
        await sendPasswordResetEmail({
            firstName: customer.first_name || 'there',
            email,
            resetUrl,
        });

        return NextResponse.json({ success: true });

    } catch (err) {
        // Always 200 (no email enumeration) — but make the failure visible in logs
        console.error('[forgot-password] ❌ Reset email NOT sent:', err);
        return NextResponse.json({ success: true });
    }
}
