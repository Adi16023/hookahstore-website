export const runtime = 'edge';
// Cloudflare Pages requires edge runtime on all routes.
// The wcSetCustomerRole/wcSetWholesaleMeta calls work on edge now that
// the unsupported cache: 'no-store' fetch option has been removed.
/**
 * POST /api/auth/signup
 * Uses GraphQL (WooGraphQL registerCustomer) — no WC REST API keys required.
 *
 * For wholesale registrations (registrationSource === 'wholesale'):
 *   - Assigns role: wholesale_pending via WC REST API
 *   - Stores account_type and approval_status meta
 *   - Stores business info meta fields
 *   - Does NOT issue a session token (user must wait for approval)
 */
import { NextRequest, NextResponse } from 'next/server';
import {
    createSessionToken,
    createVerificationToken,
    SESSION_COOKIE,
    SESSION_MAX_AGE,
} from '../../../../lib/auth';
import {
    graphqlRegisterCustomer,
    graphqlCheckEmailExists,
} from '../../../../lib/auth/auth-graphql';
import { sendWelcomeEmail, sendVerificationEmail, sendWholesaleApplicationEmail, sendWholesaleApplicationAdminAlert } from '../../../../lib/email/send-emails';
import { runInBackground } from '../../../../lib/utils/background';
import { wcSetCustomerRole, wcSetWholesaleMeta } from '../../../../lib/woocommerce/wholesale';
import { wcPut } from '../../../../lib/woocommerce';
import { parseIsoDob, isOfAge, MIN_AGE, DOB_META_KEY } from '../../../../lib/utils/dob';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as {
            firstName?: string;
            lastName?: string;
            email?: string;
            password?: string;
            marketingOptIn?: boolean;
            dob?: string;                // optional ISO YYYY-MM-DD (pre-filled from age gate)
            registrationSource?: string; // 'wholesale' when coming from /wholesale/register
            // Wholesale-specific business info
            businessName?: string;
            businessAddress?: string;
            businessPhone?: string;
            gstNumber?: string;
            businessWebsite?: string;
        };

        const {
            firstName,
            lastName,
            email,
            password,
            marketingOptIn = false,
            dob,
            registrationSource,
            businessName,
            businessAddress,
            businessPhone,
            gstNumber,
            businessWebsite,
        } = body;

        const isWholesale = registrationSource === 'wholesale';

        /* ── Basic server-side validation ── */
        if (!firstName?.trim()) return json({ error: 'First name is required.' }, 400);
        if (!lastName?.trim()) return json({ error: 'Last name is required.' }, 400);
        if (!email?.trim()) return json({ error: 'Email is required.' }, 400);
        if (!password) return json({ error: 'Password is required.' }, 400);
        if (password.length < 8) return json({ error: 'Password must be at least 8 characters.' }, 400);
        if (!/[A-Z]/.test(password)) return json({ error: 'Password must contain an uppercase letter.' }, 400);
        if (!/[a-z]/.test(password)) return json({ error: 'Password must contain a lowercase letter.' }, 400);
        if (!/[^A-Za-z0-9]/.test(password)) return json({ error: 'Password must contain a special character.' }, 400);

        // Optional DOB — if supplied it must be valid and the user must be of age
        if (dob !== undefined && dob !== '') {
            if (!parseIsoDob(dob)) return json({ error: 'Please enter a valid date of birth.' }, 400);
            if (!isOfAge(dob)) return json({ error: `You must be at least ${MIN_AGE} years old to create an account.` }, 403);
        }

        if (isWholesale && !businessName?.trim()) {
            return json({ error: 'Business name is required for wholesale accounts.' }, 400);
        }

        const emailLower = email.trim().toLowerCase();

        /* ── Optional: Check if email already exists ── */
        const alreadyExists = await graphqlCheckEmailExists(emailLower);
        if (alreadyExists) {
            return json({ error: 'An account with this email already exists.' }, 409);
        }

        /* ── Create WooCommerce customer via GraphQL ── */
        let customer;
        try {
            customer = await graphqlRegisterCustomer({
                username: emailLower,
                email: emailLower,
                password,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            });
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : '';
            if (msg.toLowerCase().includes('email') && msg.toLowerCase().includes('registered')) {
                return json({ error: 'An account with this email already exists.' }, 409);
            }
            if (msg.toLowerCase().includes('username') && msg.toLowerCase().includes('exists')) {
                return json({ error: 'An account with this email already exists.' }, 409);
            }
            throw err;
        }

        const customerId = String(customer.databaseId);

        /* ── Save DOB as customer meta (best-effort; never blocks signup) ── */
        if (dob) {
            try {
                await wcPut(`customers/${customerId}`, { meta_data: [{ key: DOB_META_KEY, value: dob }] });
            } catch (e) {
                console.error('[signup] saving customer DOB meta failed (non-fatal):', e);
            }
        }

        /* ─────────────────────────────────────────────────────────
           WHOLESALE REGISTRATION PATH
           - Assign wholesale_pending role via WordPress Users REST API
             (PUT /wp/v2/users/{id} — NOT the WC API, which silently
              ignores custom/unknown roles)
           - Store business meta via WC REST API
           - Do NOT issue session — return 202 Accepted
        ───────────────────────────────────────────────────────── */
        if (isWholesale) {
            // ── Role assignment via WP REST API (best-effort, non-fatal) ──
            // If this fails (wrong credentials, missing `edit_users` cap, etc.)
            // we still proceed. The login route detects pending status from
            // the approval_status meta key set below, so the WP role is not
            // strictly required for the flow to work.
            try {
                await wcSetCustomerRole(Number(customerId), 'wholesale_pending');
            } catch (e) {
                const detail = e instanceof Error ? e.message : String(e);
                console.error('[signup/wholesale] wcSetCustomerRole FAILED (non-fatal, continuing):', detail);
            }

            try {
                await wcSetWholesaleMeta(Number(customerId), {
                    account_type: 'wholesale',
                    approval_status: 'pending',
                    business_name: businessName ?? '',
                    business_address: businessAddress ?? '',
                    business_phone: businessPhone ?? '',
                    gst_number: gstNumber ?? '',
                    business_website: businessWebsite ?? '',
                });
            } catch (e) {
                // Meta write failed but role was already set — non-fatal.
                // Log and continue so the user still gets their 202.
                console.error('[signup/wholesale] wcSetWholesaleMeta failed (non-fatal):', e);
            }

            // Application-received email to the applicant + alert to the store.
            // AWAITED (Cloudflare can cancel un-awaited work after the response);
            // an email failure is logged but never fails the application.
            const [applicantMail, adminMail] = await Promise.allSettled([
                sendWholesaleApplicationEmail({
                    name: customer.firstName,
                    businessName: businessName ?? '',
                    email: emailLower,
                }),
                sendWholesaleApplicationAdminAlert({
                    name: `${firstName.trim()} ${lastName.trim()}`,
                    email: emailLower,
                    businessName: businessName ?? '',
                    businessPhone: businessPhone ?? '',
                    businessAddress: businessAddress ?? '',
                    gstNumber: gstNumber ?? '',
                    businessWebsite: businessWebsite ?? '',
                    customerId,
                }, `${process.env.WOOCOMMERCE_URL ?? ''}/wp-admin/admin.php?page=wholesale-applications`),
            ]);
            if (applicantMail.status === 'rejected') console.error('[signup/wholesale] application email to applicant failed:', applicantMail.reason);
            if (adminMail.status === 'rejected') console.error('[signup/wholesale] admin alert email failed:', adminMail.reason);

            return NextResponse.json(
                {
                    success: true,
                    wholesale: true,
                    customerId: customerId,
                    message: 'Your wholesale application has been submitted. You will be notified once your account is approved.',
                },
                { status: 202 }
            );
        }

        /* ─────────────────────────────────────────────────────────
           RETAIL REGISTRATION PATH
        ───────────────────────────────────────────────────────── */

        /* ── Create session JWT + set httpOnly cookie ── */
        const sessionToken = await createSessionToken({
            sub: customerId,
            email: emailLower,
            firstName: customer.firstName,
            lastName: customer.lastName,
            accountType: 'retail',
            emailVerified: false,
            role: 'customer',
        });

        const response = NextResponse.json(
            { success: true, message: 'Account created successfully.' },
            { status: 201 }
        );
        response.cookies.set(SESSION_COOKIE, sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: SESSION_MAX_AGE,
            path: '/',
        });

        /* ── Welcome + verification emails (awaited; failures logged, never fail signup) ── */
        try {
            await sendWelcomeEmail({
                firstName: customer.firstName,
                email: emailLower,
                loginUrl: `${APP_URL}/login`,
            });
        } catch (e) {
            console.error('[signup] welcome email failed:', e);
        }
        try {
            const verifyToken = await createVerificationToken(customerId, emailLower);
            await sendVerificationEmail({
                firstName: customer.firstName,
                email: emailLower,
                verificationUrl: `${APP_URL}/verify-email?token=${verifyToken}`,
            });
        } catch (e) {
            console.error('[signup] verification email failed:', e);
        }

        /* ── Marketing opt-in (Brevo) — non-critical, runs via ctx.waitUntil ── */
        if (marketingOptIn) {
            await runInBackground('signup Brevo add', addToBrevoList(emailLower, customer.firstName, customer.lastName));
        }

        return response;

    } catch (err) {
        console.error('[api/auth/signup]', err);
        return json({ error: 'Something went wrong. Please try again.' }, 500);
    }
}

async function addToBrevoList(email: string, firstName: string, lastName: string) {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return;
    await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email,
            attributes: { FIRSTNAME: firstName, LASTNAME: lastName },
            listIds: [Number(process.env.BREVO_LIST_ID ?? 1)],
            updateEnabled: true,
        }),
    });
}

function json(body: object, status: number) {
    return NextResponse.json(body, { status });
}
