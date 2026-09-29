export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';
import { createAdminSessionToken, ADMIN_SESSION_COOKIE, ADMIN_SESSION_MAX_AGE } from '../../../../lib/admin/auth';
import { timingSafeEqualStrings, clientIp, lockedForSeconds, recordFailure, recordSuccess } from '../../../../lib/admin/login-guard';

export async function POST(req: NextRequest) {
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_PASSWORD) {
        console.error('[api/admin/login] ADMIN_PASSWORD is not set.');
        return NextResponse.json({ error: 'Admin dashboard is not configured.' }, { status: 500 });
    }

    const ip = clientIp(req.headers);
    const wait = lockedForSeconds(ip);
    if (wait > 0) {
        return NextResponse.json(
            { error: `Too many failed attempts. Try again in ${Math.ceil(wait / 60)} minute(s).` },
            { status: 429, headers: { 'Retry-After': String(wait) } },
        );
    }

    const { password } = (await req.json().catch(() => ({}))) as { password?: string };

    // Constant-time comparison (SHA-256 of both values, byte-by-byte XOR)
    const ok = typeof password === 'string' && password.length > 0
        && await timingSafeEqualStrings(password, ADMIN_PASSWORD);

    if (!ok) {
        recordFailure(ip);
        return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
    }
    recordSuccess(ip);

    let token: string;
    try {
        token = await createAdminSessionToken();
    } catch (err) {
        console.error('[api/admin/login] could not create session:', err);
        return NextResponse.json({ error: 'Admin dashboard is not configured.' }, { status: 500 });
    }

    const res = NextResponse.json({ success: true });
    res.cookies.set(ADMIN_SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: ADMIN_SESSION_MAX_AGE,
        path: '/',
    });
    return res;
}
