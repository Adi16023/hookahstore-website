/**
 * The HMAC key for every session JWT (customer + admin).
 *
 * FAIL CLOSED: there is no fallback secret. If JWT_SECRET is missing this
 * returns null and logs an error; callers must then refuse to issue or accept
 * sessions (nobody can log in, but nobody can forge a session either).
 *
 * Edge-safe (no Node APIs) — also used by middleware.ts.
 */

let warned = false;

export function getJwtSecret(): Uint8Array | null {
    const value = process.env.JWT_SECRET;
    if (!value) {
        if (!warned) {
            warned = true;
            console.error('[auth] JWT_SECRET is not set — all sessions are rejected until it is configured (Cloudflare Pages → Settings → Variables and Secrets).');
        }
        return null;
    }
    return new TextEncoder().encode(value);
}
