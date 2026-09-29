/**
 * Auth utilities — JWT session management + verification/reset tokens
 * Server-side only. Never import in client components.
 */

import { SignJWT, jwtVerify } from 'jose';
import { getJwtSecret } from './jwt-secret';
import { ensureServerEnv } from '../server/env';

/** Edge-runtime safe random hex string using Web Crypto API */
function randomHex(byteCount: number): string {
    const bytes = new Uint8Array(byteCount);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Signing key — throws when JWT_SECRET is missing (fail closed, no fallback). */
function signingKey(): Uint8Array {
    ensureServerEnv();
    const key = getJwtSecret();
    if (!key) throw new Error('JWT_SECRET is not configured — refusing to issue tokens');
    return key;
}

/** Verification key — null when JWT_SECRET is missing, so every token is rejected. */
function verifyKey(): Uint8Array | null {
    ensureServerEnv();
    return getJwtSecret();
}

export const SESSION_COOKIE = 'hookah_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

/* ── Session payload ─────────────────────────────────────── */
export type WholesaleRole = 'wholesale_pending' | 'wholesale_customer' | 'customer';

export interface SessionPayload {
    sub: string;          // WC customer ID (stringified)
    email: string;
    firstName: string;
    lastName: string;
    accountType: 'retail' | 'wholesale';
    emailVerified: boolean;
    /** Only present for wholesale sessions */
    role?: WholesaleRole;
    /** Wholesale pricing tier at login (live tier is re-read by wholesale APIs) */
    tier?: 'gold' | 'silver' | 'bronze';
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(signingKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
    try {
        const key = verifyKey();
        if (!key) return null;
        const { payload } = await jwtVerify(token, key);
        return payload as unknown as SessionPayload;
    } catch {
        return null;
    }
}

/* ── Email verification token (stateless, 24h) ───────────── */
export async function createVerificationToken(customerId: string, email: string): Promise<string> {
    return new SignJWT({ type: 'email_verify', customerId, email })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(signingKey());
}

export async function verifyVerificationToken(
    token: string
): Promise<{ customerId: string; email: string } | null> {
    try {
        const key = verifyKey();
        if (!key) return null;
        const { payload } = await jwtVerify(token, key);
        if (payload.type !== 'email_verify') return null;
        return { customerId: payload.customerId as string, email: payload.email as string };
    } catch {
        return null;
    }
}

/* ── Password reset token (includes nonce for single-use) ── */
export function generateNonce(): string {
    return randomHex(32);
}

export async function createResetToken(
    customerId: string,
    email: string,
    nonce: string
): Promise<string> {
    return new SignJWT({ type: 'pwd_reset', customerId, email, nonce })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('1h')
        .sign(signingKey());
}

export async function verifyResetToken(
    token: string
): Promise<{ customerId: string; email: string; nonce: string } | null> {
    try {
        const key = verifyKey();
        if (!key) return null;
        const { payload } = await jwtVerify(token, key);
        if (payload.type !== 'pwd_reset') return null;
        return {
            customerId: payload.customerId as string,
            email: payload.email as string,
            nonce: payload.nonce as string,
        };
    } catch {
        return null;
    }
}
