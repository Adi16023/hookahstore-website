/**
 * Admin login hardening — edge-safe (Web Crypto only).
 *
 *  - timingSafeEqualStrings(): SHA-256 both values, then compare every byte,
 *    so the time taken never depends on how many characters matched.
 *  - Lockout: after MAX_FAILURES failed attempts from one IP within WINDOW_MS,
 *    that IP is locked out for LOCK_MS.
 *
 * NOTE: the attempt counter lives in isolate memory. On Cloudflare each
 * isolate keeps its own counter, so this slows brute force down but is not a
 * global limit. For a hard global limit, add a Cloudflare WAF rate-limiting
 * rule on POST /api/admin/login (see report).
 */

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const LOCK_MS = 15 * 60 * 1000;

type Attempt = { failures: number; firstAt: number; lockedUntil: number };
const attempts = new Map<string, Attempt>();

async function sha256(value: string): Promise<Uint8Array> {
    return new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)));
}

export async function timingSafeEqualStrings(a: string, b: string): Promise<boolean> {
    const [ha, hb] = await Promise.all([sha256(a), sha256(b)]);
    let diff = 0;
    for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
    return diff === 0;
}

export function clientIp(headers: Headers): string {
    return headers.get('cf-connecting-ip')
        ?? headers.get('x-forwarded-for')?.split(',')[0].trim()
        ?? 'unknown';
}

/** Seconds until the lock expires, or 0 when the IP may try again. */
export function lockedForSeconds(ip: string, now = Date.now()): number {
    const a = attempts.get(ip);
    return a && a.lockedUntil > now ? Math.ceil((a.lockedUntil - now) / 1000) : 0;
}

export function recordFailure(ip: string, now = Date.now()): void {
    const a = attempts.get(ip);
    if (!a || now - a.firstAt > WINDOW_MS) {
        attempts.set(ip, { failures: 1, firstAt: now, lockedUntil: 0 });
        return;
    }
    a.failures += 1;
    if (a.failures >= MAX_FAILURES) {
        a.lockedUntil = now + LOCK_MS;
        console.warn(`[admin-login] ${ip} locked out for ${LOCK_MS / 60000} min after ${a.failures} failed attempts`);
    }
}

export function recordSuccess(ip: string): void {
    attempts.delete(ip);
}
