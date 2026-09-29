/**
 * Resend email client — uses fetch() directly so it works on Cloudflare Workers
 * edge runtime (the Resend Node.js SDK is incompatible with edge runtime).
 */

const RESEND_API = 'https://api.resend.com/emails';

export const FROM_EMAIL = 'The Hookah Store <no-reply@thehookahstore.in>';
export const REPLY_TO   = 'no-reply@thehookahstore.in';

interface SendEmailOpts {
    from: string;
    replyTo?: string;
    to: string | string[];
    subject: string;
    html: string;
}

/** "someone@example.com" → "s***@example.com" — enough to debug, not a full address in logs */
const maskEmail = (to: string | string[]) =>
    (Array.isArray(to) ? to : [to]).map(e => e.replace(/^(.).*(@.*)$/, '$1***$2')).join(', ');

/**
 * Send one email through Resend. THROWS when the email was not sent (missing
 * API key, Resend error, network failure) so callers can log or report it —
 * callers must catch if the email is non-critical.
 */
async function sendEmail(opts: SendEmailOpts): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY ?? '';
    const ctx = `to=${maskEmail(opts.to)} subject="${opts.subject}"`;
    if (!apiKey) {
        console.error(`[resend] EMAIL NOT SENT — RESEND_API_KEY is not set in this environment (${ctx}). ` +
            'Add it in Cloudflare Pages → Settings → Variables and Secrets, then redeploy.');
        throw new Error('RESEND_API_KEY is not set — email not sent');
    }

    let res: Response;
    try {
        res = await fetch(RESEND_API, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: opts.from,
                reply_to: opts.replyTo,
                to: Array.isArray(opts.to) ? opts.to : [opts.to],
                subject: opts.subject,
                html: opts.html,
            }),
        });
    } catch (err) {
        console.error(`[resend] EMAIL NOT SENT — network error reaching Resend (${ctx}):`, err);
        throw err;
    }

    if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { name?: string; message?: string };
        // Common causes: 403 domain not verified (thehookahstore.in), 401 bad key, 422 invalid "from"/"to".
        console.error(`[resend] EMAIL NOT SENT — Resend API returned HTTP ${res.status} (${ctx}): ${body.name ?? ''} ${body.message ?? JSON.stringify(body)}`);
        throw new Error(`Resend API error ${res.status}: ${body.message ?? JSON.stringify(body)}`);
    }
    console.log(`[resend] Email sent (${ctx})`);
}

export const resend = {
    emails: {
        send: sendEmail,
    },
};
