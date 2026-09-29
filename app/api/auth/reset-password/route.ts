export const runtime = 'edge';
/**
 * POST /api/auth/reset-password
 *
 * Validates the reset JWT, updates the WC customer password via REST API,
 * sends a confirmation email.
 */
import { NextRequest, NextResponse } from 'next/server';
import { verifyResetToken } from '../../../../lib/auth';
import { wcPut, wcGet } from '../../../../lib/woocommerce';
import { sendPasswordResetSuccessEmail } from '../../../../lib/email/send-emails';

function json(body: object, status: number) {
    return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as { token?: string; password?: string };
        const { token, password } = body;

        if (!token) return json({ error: 'Reset token is missing.' }, 400);
        if (!password) return json({ error: 'New password is required.' }, 400);
        if (password.length < 8)
            return json({ error: 'Password must be at least 8 characters.' }, 400);
        if (!/[A-Z]/.test(password))
            return json({ error: 'Password must contain an uppercase letter.' }, 400);
        if (!/[^A-Za-z0-9]/.test(password))
            return json({ error: 'Password must contain a special character.' }, 400);

        /* Verify JWT */
        const payload = await verifyResetToken(token);
        if (!payload) return json({ error: 'This reset link is invalid or has expired.' }, 400);

        /* Update WC customer password directly */
        await wcPut(`customers/${payload.customerId}`, { password });

        /* Fetch customer for confirmation email */
        let firstName = 'there';
        try {
            const customer = await wcGet(`customers/${payload.customerId}`);
            firstName = customer?.first_name || 'there';
        } catch { /* non-critical */ }

        /* Confirmation email — awaited; a failure is logged but the reset still succeeds */
        try {
            await sendPasswordResetSuccessEmail({ firstName, email: payload.email });
        } catch (e) {
            console.error('[reset-password] confirmation email failed:', e);
        }

        return json({ success: true }, 200);

    } catch (err) {
        console.error('[api/auth/reset-password]', err);
        return json({ error: 'Something went wrong. Please try again.' }, 500);
    }
}
