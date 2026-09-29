import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecret } from './lib/auth/jwt-secret';
import { PROD_RETAIL_HOSTS, PROD_WHOLESALE_HOST } from './lib/config';

/**
 * Middleware: subdomain routing + wholesale access control
 *
 * 1. Subdomain routing (unchanged):
 *    wholesale.thehookahstore.in  → rewrites to /wholesale/* internally
 *
 * 2. Wholesale route guard (new):
 *    Protected paths require role = wholesale_customer.
 *    Non-approved users are redirected to /wholesale/login with a reason param
 *    so the login page can display a contextual message.
 *
 *    Public wholesale paths (no auth required):
 *      /wholesale              (homepage)
 *      /wholesale/login
 *      /wholesale/register
 *      /wholesale/reset-password
 */

// Paths inside /wholesale that do NOT require authentication
const PUBLIC_WHOLESALE_PATHS = new Set([
    '/wholesale',
    '/wholesale/login',
    '/wholesale/register',
    '/wholesale/reset-password',
    '/wholesale/auth',
]);

// Prefix-based public paths (checked with startsWith)
const PUBLIC_WHOLESALE_PREFIXES = [
    '/wholesale/product/',   // product detail pages — no prices are sent until logged in
    '/wholesale/category/',  // catalog pages — "Login for pricing" when logged out
];

/** Verify a session JWT. No fallback secret: if JWT_SECRET is missing every
 *  token is rejected (fail closed) — callers treat that as "not logged in". */
async function verifyToken(token: string) {
    const key = getJwtSecret();
    if (!key) throw new Error('JWT_SECRET not configured');
    return jwtVerify(token, key);
}

const SESSION_COOKIE = 'hookah_session';
const ADMIN_SESSION_COOKIE = 'hookah_admin_session';

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') ?? '';

    /* ── 0. Internal admin dashboard guard (own login, own cookie) ── */
    if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
        const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
        if (!token) {
            url.pathname = '/admin/login';
            return NextResponse.redirect(url);
        }
        try {
            const { payload } = await verifyToken(token);
            if (payload.type !== 'admin_session') throw new Error('wrong token type');
        } catch {
            url.pathname = '/admin/login';
            const response = NextResponse.redirect(url);
            response.cookies.delete(ADMIN_SESSION_COOKIE);
            return response;
        }
        return NextResponse.next();
    }

    /* ── 0b. Retail host: /wholesale[/*] → 301 to the wholesale subdomain ──
       thehookahstore.in/wholesale/login → https://wholesale.thehookahstore.in/login
       Only on the real retail hosts, so localhost and *.pages.dev previews
       keep serving /wholesale/* directly. */
    const bareHost = hostname.split(':')[0].toLowerCase();
    if (
        PROD_RETAIL_HOSTS.includes(bareHost) &&
        (url.pathname === '/wholesale' || url.pathname.startsWith('/wholesale/'))
    ) {
        const target = new URL(`https://${PROD_WHOLESALE_HOST}`);
        target.pathname = url.pathname.slice('/wholesale'.length) || '/';
        target.search = url.search;
        return NextResponse.redirect(target, 301);
    }

    /* ── 1. Subdomain routing ──
       wholesale.thehookahstore.in/<path> is served from /wholesale/<path>.
       The rewrite is applied AFTER the guard below (previously it returned
       first, so short subdomain paths like /cart skipped the guard). */
    const isWholesale =
        hostname.startsWith('wholesale.') ||
        hostname === 'localhost:3001';

    const needsRewrite = isWholesale && !url.pathname.startsWith('/wholesale') && !url.pathname.startsWith('/api/');
    const wsPath = needsRewrite ? `/wholesale${url.pathname}` : url.pathname;
    // Redirect targets: short paths on the subdomain, /wholesale/* elsewhere
    const loginPath   = needsRewrite ? '/login'   : '/wholesale/login';
    const accountPath = needsRewrite ? '/account' : '/wholesale/account';

    const pass = () => {
        if (!needsRewrite) return NextResponse.next();
        const rewritten = url.clone();
        rewritten.pathname = wsPath;
        return NextResponse.rewrite(rewritten);
    };

    /* ── 2. Wholesale route guard (evaluated on the effective /wholesale path) ── */
    const isWholesalePath = wsPath.startsWith('/wholesale');
    const isPublicPath = PUBLIC_WHOLESALE_PATHS.has(wsPath) ||
        wsPath === '/wholesale/' ||  // trailing-slash variant
        PUBLIC_WHOLESALE_PREFIXES.some(prefix => wsPath.startsWith(prefix));

    if (isWholesalePath && !isPublicPath) {
        const token = request.cookies.get(SESSION_COOKIE)?.value;

        // Not logged in → redirect to login
        if (!token) {
            url.pathname = loginPath;
            url.searchParams.set('reason', 'unauthenticated');
            return NextResponse.redirect(url);
        }

        // Verify JWT and extract role
        let role: string | undefined;
        try {
            const { payload } = await verifyToken(token);
            role = payload.role as string | undefined;
        } catch {
            // Expired or invalid token — treat as logged out
            url.pathname = loginPath;
            url.searchParams.set('reason', 'session_expired');
            const response = NextResponse.redirect(url);
            response.cookies.delete(SESSION_COOKIE);
            return response;
        }

        // Pending application → redirect to account page (shows pending message)
        if (role === 'wholesale_pending') {
            // Allow /wholesale/account so they can see their status
            if (!wsPath.startsWith('/wholesale/account')) {
                url.pathname = accountPath;
                url.searchParams.set('reason', 'pending');
                return NextResponse.redirect(url);
            }
            return pass();
        }

        // Retail customer trying to access wholesale → redirect to login
        if (role !== 'wholesale_customer') {
            url.pathname = loginPath;
            url.searchParams.set('reason', 'not_wholesale');
            return NextResponse.redirect(url);
        }

        // Approved wholesale_customer → allow through
        return pass();
    }

    return pass();
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf)).*)',
    ],
};

