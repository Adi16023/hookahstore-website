/**
 * Server-side guard for wholesale-only API routes.
 *
 * The session JWT says who the user is; approval and tier are re-checked LIVE
 * against WooCommerce on every call, so a revoked wholesaler or a tier change
 * takes effect immediately (not after the 7-day session expires).
 */

import { getServerSession } from './session-server';
import type { SessionPayload } from './index';
import {
    getWholesaleAccount,
    sanitizeTier,
    DEFAULT_TIER,
    type Tier,
    type WholesaleAccount,
} from '../woocommerce/wholesale-pricing';

export type WholesaleGuardResult =
    | { ok: true; session: SessionPayload; account: WholesaleAccount; tier: Tier }
    | { ok: false; status: 401 | 403 | 503; error: string };

export async function requireApprovedWholesaler(): Promise<WholesaleGuardResult> {
    const session = await getServerSession();
    if (!session) return { ok: false, status: 401, error: 'Please log in to your wholesale account.' };
    if (session.role !== 'wholesale_customer') {
        return { ok: false, status: 403, error: 'This is available to approved wholesale accounts only.' };
    }

    let account: WholesaleAccount | null = null;
    try {
        account = await getWholesaleAccount(Number(session.sub));
    } catch (err) {
        console.error('[wholesale-guard] WooCommerce customer lookup failed:', err);
        return { ok: false, status: 503, error: 'Could not verify your account right now. Please try again.' };
    }
    if (!account || !account.approved) {
        return { ok: false, status: 403, error: 'Your wholesale account is not approved.' };
    }

    // Live tier from WooCommerce meta → tier stored in the session → bronze
    const tier = account.tier ?? (session.tier ? sanitizeTier(session.tier) : DEFAULT_TIER);
    return { ok: true, session, account, tier };
}
