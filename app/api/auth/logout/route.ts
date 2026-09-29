export const runtime = 'edge';
/**
 * /api/auth/logout
 *
 * POST — programmatic logout (called by JS fetch)
 * GET  — fallback for direct browser navigation (href links)
 *
 * Both handlers clear the session cookie.
 * GET also accepts an optional ?redirect= param (defaults to /wholesale/login).
 */
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE } from '../../../../lib/auth';

function clearSessionCookie(res: NextResponse) {
    res.cookies.set(SESSION_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    });
}

export async function POST() {
    const response = NextResponse.json({ success: true });
    clearSessionCookie(response);
    return response;
}

export async function GET(request: NextRequest) {
    const to = request.nextUrl.searchParams.get('redirect') ?? '/wholesale/login';
    const response = NextResponse.redirect(new URL(to, request.url));
    clearSessionCookie(response);
    return response;
}
