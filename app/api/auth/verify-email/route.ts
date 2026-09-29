export const runtime = 'edge';
/**
 * GET /api/auth/verify-email?token=XYZ
 *
 * Verifies the email verification JWT, marks customer emailVerified = true in WC meta,
 * and refreshes the session cookie so the banner disappears immediately.
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
    verifyVerificationToken,
    verifySessionToken,
    createSessionToken,
    SESSION_COOKIE,
    SESSION_MAX_AGE,
} from '../../../../lib/auth';
import { wcPut } from '../../../../lib/woocommerce';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token');
    if (!token) {
        return NextResponse.redirect(`${APP_URL}/verify-email?status=invalid`);
    }

    const payload = await verifyVerificationToken(token);
    if (!payload) {
        return NextResponse.redirect(`${APP_URL}/verify-email?status=expired`);
    }

    try {
        await wcPut(`customers/${payload.customerId}`, {
            meta_data: [{ key: 'hookah_email_verified', value: 'true' }],
        });
    } catch (err) {
        console.error('[api/auth/verify-email] wcPut failed:', err);
        return NextResponse.redirect(`${APP_URL}/verify-email?status=error`);
    }

    // Refresh the session JWT so emailVerified becomes true client-side immediately.
    const redirectResponse = NextResponse.redirect(`${APP_URL}/verify-email?status=success`);
    try {
        const jar = await cookies();
        const existingToken = jar.get(SESSION_COOKIE)?.value;
        if (existingToken) {
            const session = await verifySessionToken(existingToken);
            if (session) {
                const newToken = await createSessionToken({ ...session, emailVerified: true });
                redirectResponse.cookies.set(SESSION_COOKIE, newToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'lax',
                    maxAge: SESSION_MAX_AGE,
                    path: '/',
                });
            }
        }
    } catch (err) {
        console.error('[api/auth/verify-email] session refresh failed (non-fatal):', err);
    }

    return redirectResponse;
}
