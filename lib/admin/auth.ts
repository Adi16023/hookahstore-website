/**
 * Admin dashboard auth — separate from the customer JWT session system.
 * Single shared password (ADMIN_PASSWORD), signed session cookie.
 * Server-side only.
 */
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getJwtSecret } from '../auth/jwt-secret';
import { ensureServerEnv } from '../server/env';


export const ADMIN_SESSION_COOKIE = 'hookah_admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

export async function createAdminSessionToken(): Promise<string> {
    ensureServerEnv();
    const secret = getJwtSecret();
    if (!secret) throw new Error('JWT_SECRET is not configured — refusing to issue admin sessions');
    return new SignJWT({ type: 'admin_session' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('12h')
        .sign(secret);
}

export async function verifyAdminSessionToken(token: string): Promise<boolean> {
    const secret = getJwtSecret();
    if (!secret) return false; // fail closed
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload.type === 'admin_session';
    } catch {
        return false;
    }
}

/** Use inside /api/admin/* route handlers to gate the action. */
export async function requireAdminSession(): Promise<boolean> {
    const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
    if (!token) return false;
    return verifyAdminSessionToken(token);
}
