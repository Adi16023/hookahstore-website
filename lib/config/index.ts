/**
 * lib/site-config.ts
 *
 * Single source of truth for:
 *   - App mode detection (retail | wholesale)
 *   - Environment detection (local dev | production)
 *   - Domain URL helpers (env-aware, never hardcoded)
 *
 * Works in:
 *   - Browser (window.location)
 *   - Next.js server components (process.env)
 *   - Static export (SSG)
 */

// ─── Types ───────────────────────────────────────────────────────────────────

export type AppMode = 'retail' | 'wholesale';

// ─── Core mode detector (pure function, no side-effects) ──────────────────────

/**
 * Derive app mode from a hostname string.
 * Rule: hostname starting with "wholesale." → WHOLESALE MODE, everything else → RETAIL MODE
 *
 * Works for:
 *   wholesale.thehookahstore.in       → wholesale
 *   wholesale.thehookahstore.local    → wholesale
 *   wholesale.localhost               → wholesale
 *   thehookahstore.in                 → retail
 *   thehookahstore.local              → retail
 *   localhost                         → retail
 */
export function getAppModeFromHost(hostname: string): AppMode {
    return hostname.startsWith('wholesale.') ? 'wholesale' : 'retail';
}

// ─── Runtime helpers (client-side) ───────────────────────────────────────────

/** Current app mode — reads window.location at runtime. */
export function getAppMode(): AppMode {
    if (typeof window === 'undefined') return 'retail'; // SSR/SSG default
    return getAppModeFromHost(window.location.hostname);
}

export const isWholesale = (): boolean => getAppMode() === 'wholesale';
export const isRetail = (): boolean => getAppMode() === 'retail';

// ─── Environment detection ────────────────────────────────────────────────────

/**
 * Returns true when running in a local development environment.
 * Detected by:
 *   - NODE_ENV === 'development' (server-side)
 *   - Hostname ending with .local or being localhost (client-side)
 */
export function isLocalDev(): boolean {
    if (typeof window === 'undefined') {
        return process.env.NODE_ENV === 'development';
    }
    const h = window.location.hostname;
    return h === 'localhost' || h.endsWith('.local');
}

// ─── Local domain constants ───────────────────────────────────────────────────

const LOCAL_RETAIL_HOST = 'thehookahstore.local';
const LOCAL_WHOLESALE_HOST = 'wholesale.thehookahstore.local';
export const PROD_RETAIL_HOST = 'thehookahstore.in';
export const PROD_WHOLESALE_HOST = 'wholesale.thehookahstore.in';
/** Retail hostnames that must 301 their /wholesale/* paths to the subdomain (middleware). */
export const PROD_RETAIL_HOSTS = [PROD_RETAIL_HOST, `www.${PROD_RETAIL_HOST}`];
/** Local wholesale origin — middleware treats host localhost:3001 as the wholesale subdomain. */
const LOCAL_WHOLESALE_ORIGIN = 'http://localhost:3001';

// ─── URL builders (env-aware, never hardcoded) ───────────────────────────────

/**
 * Build the URL for the wholesale experience (always the subdomain, never
 * thehookahstore.in/wholesale).
 *
 * Local dev:
 *   → "http://localhost:3001"  (run a second dev server: `npx next dev -p 3001`)
 *
 * Production:
 *   → "https://wholesale.thehookahstore.in"
 *
 * @param path  Optional sub-path, e.g. "/login" (no "/wholesale" prefix)
 */
export function getWholesaleUrl(path = ''): string {
    if (isLocalDev()) {
        return `${LOCAL_WHOLESALE_ORIGIN}${path}`;
    }
    return `https://${PROD_WHOLESALE_HOST}${path}`;
}

/**
 * Build the retail URL.
 * Dev  → "/" (relative)
 * Prod → "https://thehookahstore.in"
 */
export function getRetailUrl(path = ''): string {
    if (isLocalDev()) {
        return `/${path}`.replace('//', '/');
    }
    return `https://${PROD_RETAIL_HOST}${path}`;
}

/**
 * Resolve a wholesale-internal path correctly regardless of context:
 *   - On wholesale subdomain → short path (e.g. "/login")
 *     because Cloudflare rewrites wholesale.thehookahstore.in/* → /wholesale/*
 *   - On retail domain → full prefixed path (e.g. "/wholesale/login")
 */
export function wholesalePath(path: string): string {
    if (typeof window !== 'undefined' && isWholesale()) {
        return path;
    }
    return `/wholesale${path}`;
}
