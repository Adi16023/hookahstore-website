/**
 * Server-side session helper for Server Components.
 * Reads the hookah_session cookie and returns the decoded payload.
 * Returns null if not logged in or token is invalid.
 *
 * IMPORTANT: Import this ONLY in Server Components or Route Handlers.
 */

import { cookies } from 'next/headers';
import { verifySessionToken, SESSION_COOKIE, SessionPayload } from './index';

export async function getServerSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return verifySessionToken(token);
}
