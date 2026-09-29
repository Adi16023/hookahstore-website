/**
 * WooCommerce REST API client
 * Server-side only. Never import in client components.
 */

import { ensureServerEnv } from '../server/env';

const WC_BASE = process.env.WOOCOMMERCE_URL;           // e.g. https://thehookahstore.in
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const WC_SEC = process.env.WOOCOMMERCE_CONSUMER_SECRET;

function authHeaders() {
    // btoa is available in both Node.js 16+ and Edge runtime
    const creds = btoa(`${WC_KEY}:${WC_SEC}`);
    return { 'Authorization': `Basic ${creds}`, 'Content-Type': 'application/json' };
}

async function wcFetch(method: string, endpoint: string, body?: object, revalidate?: number) {
    ensureServerEnv();
    const url = `${WC_BASE}/wp-json/wc/v3/${endpoint}`;

    // Build fetch options — avoid 'cache' field as it's not supported in Edge runtime.
    // POST/PUT are never cached by default. GET with revalidate uses Next.js ISR caching.
    const fetchOpts: RequestInit & { next?: { revalidate?: number } } = {
        method,
        headers: authHeaders(),
        body: body ? JSON.stringify(body) : undefined,
    };
    if (revalidate !== undefined) {
        fetchOpts.next = { revalidate };
    }

    const res = await fetch(url, fetchOpts);
    if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(err.message ?? `WC API ${method} ${endpoint}: ${res.status}`);
    }
    return res.json();
}

export const wcGet = (endpoint: string) => wcFetch('GET', endpoint);
export const wcPost = (endpoint: string, body: object) => wcFetch('POST', endpoint, body);
export const wcPut = (endpoint: string, body: object) => wcFetch('PUT', endpoint, body);
export const wcDelete = (endpoint: string) => wcFetch('DELETE', endpoint);

/**
 * wcGetCached — ISR-cached GET.
 * Use for slow-changing WC data (shipping zones, tax rates, currencies).
 * Never use for orders, customers, or payment-critical data.
 *
 * @param endpoint  WC REST endpoint (e.g. 'shipping/zones')
 * @param revalidate  seconds to cache (e.g. 1800 = 30 min)
 */
export const wcGetCached = (endpoint: string, revalidate: number) =>
    wcFetch('GET', endpoint, undefined, revalidate);

/* ── Helpers ── */
export async function wcGetCustomerByEmail(email: string) {
    // WC requires consumer key auth to search customers by email
    const list = await wcGet(`customers?email=${encodeURIComponent(email)}&role=all`);
    return Array.isArray(list) ? (list[0] ?? null) : null;
}

export async function wcGetCustomerMeta(
    customer: { meta_data?: { key: string; value: string }[] },
    key: string
): Promise<string | null> {
    const entry = customer?.meta_data?.find((m: { key: string }) => m.key === key);
    return entry ? (entry.value as string) : null;
}
