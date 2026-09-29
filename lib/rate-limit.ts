/**
 * Simple in-memory rate limiter for API routes.
 *
 * The store lives in the Node.js module scope, so it is shared across
 * all requests handled by the same server process.  For multi-instance
 * deployments (multiple pods / serverless) a Redis-backed solution such
 * as Upstash Rate Limit should replace this.
 *
 * NOTE: This module MUST NOT be imported in Edge runtime routes because
 * Map is available in Edge but module-level state is NOT shared across
 * Edge invocations (each invocation gets its own V8 isolate).
 * Auth routes that need rate-limiting should NOT declare `runtime = 'edge'`.
 */

interface RateLimitRecord {
    count: number;
    resetAt: number;
}

// Module-level singleton — persists for the lifetime of the Node process.
const store = new Map<string, RateLimitRecord>();

/**
 * Check whether the given IP has exceeded its request quota.
 *
 * @param ip        Client IP address (use x-forwarded-for in Next.js routes).
 * @param limit     Maximum number of allowed requests within the window.
 * @param windowMs  Rolling window duration in milliseconds.
 * @returns `true` when the request is allowed, `false` when rate-limited.
 */
export function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const record = store.get(ip);

    if (!record || record.resetAt < now) {
        // First request in this window (or window has expired).
        store.set(ip, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (record.count >= limit) {
        return false;
    }

    record.count += 1;
    return true;
}

/**
 * Pre-configured rate limit profiles for each auth endpoint.
 *
 *  login          →  10 attempts / 15 minutes
 *  signup         →   5 attempts / 60 minutes
 *  forgot-password →  5 attempts / 60 minutes
 *  check-email    →  20 attempts / 15 minutes
 */
export const RATE_LIMITS = {
    login:           { limit: 10, windowMs: 15 * 60 * 1000 },
    signup:          { limit:  5, windowMs: 60 * 60 * 1000 },
    forgotPassword:  { limit:  5, windowMs: 60 * 60 * 1000 },
    checkEmail:      { limit: 20, windowMs: 15 * 60 * 1000 },
} as const;
