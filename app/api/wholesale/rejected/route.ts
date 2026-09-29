export const runtime = 'edge';
/**
 * POST /api/wholesale/rejected
 *
 * Webhook called by the WordPress Wholesale Admin Manager plugin
 * when an admin rejects a wholesale application.
 *
 * Expected JSON payload:
 *   {
 *     "userId": 123,
 *     "email": "applicant@example.com",
 *     "name":  "Jane Smith"
 *   }
 *
 * Security: Authorization: Bearer <WHOLESALE_WEBHOOK_SECRET>
 */

import { NextRequest, NextResponse } from 'next/server';
import { sendWholesaleRejectedEmail } from '../../../../lib/email/send-emails';

const WEBHOOK_SECRET = process.env.WHOLESALE_WEBHOOK_SECRET;

function json(body: object, status: number) {
    return NextResponse.json(body, { status });
}

export async function POST(req: NextRequest) {
    try {
        /* ── Auth ── */

        // Hard requirement: the secret MUST be configured in the environment.
        // If it is missing, refuse all requests rather than running unauthenticated.
        if (!WEBHOOK_SECRET) {
            console.error('[api/wholesale/rejected] CRITICAL: WHOLESALE_WEBHOOK_SECRET is not set. Webhook is disabled.');
            return json({ error: 'Webhook not configured.' }, 500);
        }

        const authHeader = req.headers.get('authorization') ?? '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

        if (token !== WEBHOOK_SECRET) {
            console.error('[api/wholesale/rejected] Unauthorized — invalid webhook token.');
            return json({ error: 'Unauthorized' }, 401);
        }


        /* ── Parse payload ── */
        let body: { userId?: number; email?: string; name?: string };
        try {
            body = await req.json() as { userId?: number; email?: string; name?: string };
        } catch {
            console.error('[api/wholesale/rejected] Failed to parse request body as JSON');
            return json({ error: 'Request body must be valid JSON.' }, 400);
        }



        const { userId, email, name } = body;

        if (!email?.trim()) {
            console.error('[api/wholesale/rejected] Missing required field: email');
            return json({ error: 'email is required.' }, 400);
        }
        if (!name?.trim()) {
            console.error('[api/wholesale/rejected] Missing required field: name');
            return json({ error: 'name is required.' }, 400);
        }


        /* ── Send rejection email ── */
        await sendWholesaleRejectedEmail({
            name: name.trim(),
            email: email.trim().toLowerCase(),
        });


        return json({ success: true, message: 'Rejection email sent.' }, 200);

    } catch (err) {
        console.error('[api/wholesale/rejected] Unhandled error:', err);
        return json({ error: 'Failed to send rejection email.' }, 500);
    }
}
