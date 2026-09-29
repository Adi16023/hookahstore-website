export const runtime = 'edge';
/**
 * POST /api/wholesale/approved
 *
 * Webhook called by the WordPress Wholesale Admin Manager plugin
 * when an admin approves a wholesale application.
 *
 * The WordPress plugin (actions.php) should call this endpoint
 * after setting the user's role to `wholesale_customer`, via:
 *
 *   do_action('wam_after_approve_user', $user_id);
 *
 * or by a direct HTTP POST immediately after wp_safe_redirect().
 *
 * Expected JSON payload:
 *   {
 *     "userId": 123,       // WordPress user ID  (used for logging only)
 *     "email": "...",      // User's email address
 *     "name":  "..."       // User's display name / first name
 *   }
 *
 * Security: validated via a shared secret token in the
 * Authorization header:
 *   Authorization: Bearer <WHOLESALE_WEBHOOK_SECRET>
 *
 * Set WHOLESALE_WEBHOOK_SECRET in .env.local and in the WP plugin.
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendWholesaleApprovedEmail } from '../../../../lib/email/send-emails';
import { getWholesaleUrl } from '../../../../lib/config';

const WEBHOOK_SECRET = process.env.WHOLESALE_WEBHOOK_SECRET;

function json(body: object, status: number) {
    return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {

    try {
        /* ── Shared-secret authentication ── */

        // Hard requirement: the secret MUST be configured in the environment.
        // If it is missing, refuse all requests rather than running unauthenticated.
        if (!WEBHOOK_SECRET) {
            console.error('[api/wholesale/approved] CRITICAL: WHOLESALE_WEBHOOK_SECRET is not set. Webhook is disabled.');
            return json({ error: 'Webhook not configured.' }, 500);
        }

        const authHeader = req.headers.get('authorization') ?? '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

        if (token !== WEBHOOK_SECRET) {
            console.error('[api/wholesale/approved] Unauthorized — invalid webhook token.');
            return json({ error: 'Unauthorized' }, 401);
        }


        /* ── Parse payload ── */
        let body: { userId?: number; email?: string; name?: string };
        try {
            body = await req.json() as { userId?: number; email?: string; name?: string };
        } catch {
            console.error('[api/wholesale/approved] ERROR: Failed to parse request body as JSON');
            return json({ error: 'Request body must be valid JSON.' }, 400);
        }



        const { userId, email, name } = body;

        if (!email?.trim()) {
            console.error('[api/wholesale/approved] ERROR: Missing required field: email');
            return json({ error: 'email is required.' }, 400);
        }
        if (!name?.trim()) {
            console.error('[api/wholesale/approved] ERROR: Missing required field: name');
            return json({ error: 'name is required.' }, 400);
        }

        // Always the wholesale subdomain (https://wholesale.thehookahstore.in/login in production)
        const loginUrl = getWholesaleUrl('/login');


        /* ── Send approval email ── */
        await sendWholesaleApprovedEmail({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            loginUrl,
        });


        return json({ success: true, message: 'Approval email sent.' }, 200);

    } catch (err) {
        console.error('[api/wholesale/approved] UNHANDLED ERROR:', err);
        return json({ error: 'Failed to send approval email.' }, 500);
    }
}


