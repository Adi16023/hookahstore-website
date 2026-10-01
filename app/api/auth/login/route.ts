export const runtime = 'edge';
// Note: runtime is NOT set to 'edge' — rate limiting requires module-level state
// which is NOT shared across Edge isolates. Node runtime is required.
/**
 * POST /api/auth/login
 * Uses GraphQL login mutation (WPGraphQL JWT Authentication plugin required).
 * No WC REST API keys needed for retail logins.
 *
 * Wholesale role enforcement:
 *  - wholesale_pending  → rejected with 403 "awaiting approval"
 *  - wholesale_customer → JWT issued with accountType: 'wholesale', role: 'wholesale_customer'
 *  - customer (retail)  → JWT issued with accountType: 'retail'
 *
 * Plugin: https://github.com/wp-graphql/wp-graphql-jwt-authentication
 * Install via: WP Admin → Plugins → Add New → search "WPGraphQL JWT Authentication"
 */
import { NextRequest, NextResponse } from 'next/server';
import {
    createSessionToken,
    SESSION_COOKIE,
    SESSION_MAX_AGE,
} from '../../../../lib/auth';
import { graphqlLogin } from '../../../../lib/auth/auth-graphql';
import { wcGetCustomerByEmail, wcGetCustomerMeta } from '../../../../lib/woocommerce';
import { sanitizeTier, readTierFromWordPress, DEFAULT_TIER, type Tier } from '../../../../lib/woocommerce/wholesale-pricing';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as {
            email?: string;
            password?: string;
            loginSource?: string; // 'wholesale' when coming from /wholesale/login
        };
        const { email, password, loginSource } = body;

        if (!email?.trim()) return json({ error: 'Email is required.' }, 400);
        if (!password) return json({ error: 'Password is required.' }, 400);

        const emailLower = email.trim().toLowerCase();

        /* ── Authenticate via GraphQL login mutation ── */
        let loginResult;
        try {
            loginResult = await graphqlLogin(emailLower, password);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message.toLowerCase() : '';
            if (
                msg.includes('invalid') ||
                msg.includes('incorrect') ||
                msg.includes('empty password') ||
                msg.includes('unknown username')
            ) {
                return json({ error: 'Invalid email or password.' }, 401);
            }
            if (msg.includes('login') && msg.includes('field')) {
                return json({
                    error: 'Login is not configured on the server. Please install the WPGraphQL JWT Authentication plugin.',
                }, 503);
            }
            throw err;
        }

        const user = loginResult.user;

        /* ─────────────────────────────────────────────────────────
           WHOLESALE ROLE CHECK
           For wholesale login page requests, or when WC confirms the
           user has a wholesale role, we enforce approval gating.
        ───────────────────────────────────────────────────────── */
        const wcCustomer = await wcGetCustomerByEmail(emailLower).catch(() => null);
        const wcRole = (wcCustomer?.role as string) ?? 'customer';
        const emailVerified = wcCustomer
            ? (await wcGetCustomerMeta(wcCustomer, 'hookah_email_verified')) === 'true'
            : false;

        // Read wholesale meta — fallback when WP role assignment fails during signup
        const accountType     = wcCustomer ? await wcGetCustomerMeta(wcCustomer, 'account_type').catch(() => '') : '';
        const approvalStatus  = wcCustomer ? await wcGetCustomerMeta(wcCustomer, 'approval_status').catch(() => '') : '';
        const isWholesaleApp  = accountType === 'wholesale';
        // WordPress approval sets the role to wholesale_customer and does not
        // always update approval_status. A real wholesale role wins over a stale
        // "pending" flag left from signup.
        const isApproved      = wcRole === 'wholesale_customer' || (isWholesaleApp && approvalStatus === 'approved');
        const isPending       = !isApproved && (wcRole === 'wholesale_pending' || (isWholesaleApp && approvalStatus === 'pending'));

        // Block pending wholesale accounts from logging in anywhere
        if (isPending) {
            return json(
                { error: 'Your wholesale account is awaiting approval. You will be notified once approved.' },
                403
            );
        }

        // If user hit the wholesale login portal but their account isn't approved wholesale, deny
        if (loginSource === 'wholesale' && !isApproved) {
            return json(
                { error: 'This login portal is for approved wholesale accounts only.' },
                403
            );
        }

        /* ── Create our session JWT ── */
        const isWholesale = isApproved;

        // Wholesale pricing tier: WC customer meta → WP REST (app password) → bronze
        let tier: Tier | undefined;
        if (isWholesale) {
            const metaTier = wcCustomer ? await wcGetCustomerMeta(wcCustomer, 'wam_tier').catch(() => null) : null;
            tier = metaTier
                ? sanitizeTier(metaTier)
                : (await readTierFromWordPress(Number(user.databaseId))) ?? DEFAULT_TIER;
        }

        const sessionToken = await createSessionToken({
            sub: String(user.databaseId),
            email: emailLower,
            firstName: user.firstName ?? '',
            lastName: user.lastName ?? '',
            accountType: isWholesale ? 'wholesale' : 'retail',
            emailVerified,
            role: isWholesale ? 'wholesale_customer' : 'customer',
            ...(tier ? { tier } : {}),
        });

        const response = NextResponse.json(
            { success: true, message: 'Logged in successfully.' },
            { status: 200 }
        );
        response.cookies.set(SESSION_COOKIE, sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: SESSION_MAX_AGE,
            path: '/',
        });

        return response;

    } catch (err) {
        console.error('[api/auth/login]', err);
        return json({ error: 'Something went wrong. Please try again.' }, 500);
    }
}

function json(body: object, status: number) {
    return NextResponse.json(body, { status });
}
