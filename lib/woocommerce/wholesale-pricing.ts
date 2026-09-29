/**
 * Wholesale tier pricing + account lookup — server-side only.
 *
 * Tiers are set by the Wholesale Admin Manager plugin (v4.2+):
 *   user meta     wam_tier            gold | silver | bronze  (default bronze)
 *   product meta  _wam_price_{tier}   parent default / simple product price
 *   variation meta _wam_price_{tier}  per-variation price (overrides parent)
 * An empty / missing price means "Price on request".
 */

import { wcGet, wcGetCached } from './index';
import { getRawWholesaleProductsByIds, metaValue, type WcMeta } from './wholesale-catalog';

export const TIERS = ['gold', 'silver', 'bronze'] as const;
export type Tier = typeof TIERS[number];
export const DEFAULT_TIER: Tier = 'bronze';

export const sanitizeTier = (v: unknown): Tier =>
    (TIERS as readonly string[]).includes(String(v)) ? (v as Tier) : DEFAULT_TIER;

/* ── Accounts ─────────────────────────────────────────────────────────────── */

export interface WholesaleAccount {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    approved: boolean;
    tier: Tier | null;           // null → not set in WooCommerce meta
    businessName: string;
    businessPhone: string;
    businessAddress: string;
    gstNumber: string;
    billing: Record<string, string>;
    shipping: Record<string, string>;
}

interface WcCustomerFull {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    billing?: Record<string, string>;
    shipping?: Record<string, string>;
    meta_data?: WcMeta[];
}

/** Live WooCommerce customer → wholesale account view (never cached). */
export async function getWholesaleAccount(customerId: number): Promise<WholesaleAccount | null> {
    const c = await wcGet(`customers/${customerId}`) as WcCustomerFull | null;
    if (!c?.id) return null;
    const m = (k: string) => metaValue(c.meta_data, k) ?? '';
    const approved = c.role === 'wholesale_customer'
        || (m('account_type') === 'wholesale' && m('approval_status') === 'approved');
    const tierRaw = m('wam_tier');
    return {
        id: c.id,
        email: c.email,
        firstName: c.first_name,
        lastName: c.last_name,
        approved,
        tier: tierRaw ? sanitizeTier(tierRaw) : null,
        businessName: m('business_name'),
        businessPhone: m('business_phone') || c.billing?.phone || '',
        businessAddress: m('business_address'),
        gstNumber: m('gst_number'),
        billing: c.billing ?? {},
        shipping: c.shipping ?? {},
    };
}

/**
 * Read wam_tier through the WordPress Users REST API with the Application
 * Password (same credentials as role assignment). Requires plugin v4.2, which
 * registers the meta with show_in_rest. Returns null on any failure.
 */
export async function readTierFromWordPress(userId: number): Promise<Tier | null> {
    const base = process.env.WOOCOMMERCE_URL ?? '';
    const user = process.env.WP_ADMIN_USERNAME;
    const pass = process.env.WP_ADMIN_APP_PASSWORD;
    if (!base || !user || !pass) return null;
    try {
        const res = await fetch(`${base}/wp-json/wp/v2/users/${userId}?context=edit&_fields=meta`, {
            headers: { Authorization: `Basic ${btoa(`${user}:${pass}`)}` },
        });
        if (!res.ok) return null;
        const data = await res.json() as { meta?: { wam_tier?: string } };
        return data.meta?.wam_tier ? sanitizeTier(data.meta.wam_tier) : null;
    } catch {
        return null;
    }
}

/* ── Prices ───────────────────────────────────────────────────────────────── */

export interface VariationPrice {
    id: number;
    /** attribute name → option, e.g. { Size: "250g" } */
    attributes: Record<string, string>;
    price: number | null;
}

export interface ProductPrice {
    productId: number;
    name: string;
    type: string;
    /** Simple products (and parent fallback for variations) */
    price: number | null;
    variations: VariationPrice[];
}

const parsePrice = (raw: string | null): number | null => {
    if (raw == null || raw === '') return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
};

const tierKey = (tier: Tier) => `_wam_price_${tier}`;

interface WcVariation {
    id: number;
    attributes?: { name: string; option: string }[];
    meta_data?: WcMeta[];
}

/**
 * Tier prices for the given product IDs. Only wholesale-visible, published
 * products are returned — anything else is simply absent from the result.
 * Cached for 60s so price edits show up quickly.
 */
export async function getTierPrices(ids: number[], tier: Tier): Promise<Record<number, ProductPrice>> {
    const unique = [...new Set(ids.filter(n => Number.isInteger(n) && n > 0))].slice(0, 100);
    const products = await getRawWholesaleProductsByIds(unique);
    const out: Record<number, ProductPrice> = {};

    await Promise.all(products.map(async p => {
        const parentPrice = parsePrice(metaValue(p.meta_data, tierKey(tier)));
        let variations: VariationPrice[] = [];
        if (p.type === 'variable') {
            const list = await wcGetCached(`products/${p.id}/variations?per_page=100`, 60) as WcVariation[];
            variations = (Array.isArray(list) ? list : []).map(v => ({
                id: v.id,
                attributes: Object.fromEntries((v.attributes ?? []).map(a => [a.name, a.option])),
                price: parsePrice(metaValue(v.meta_data, tierKey(tier))) ?? parentPrice,
            }));
        }
        out[p.id] = { productId: p.id, name: p.name, type: p.type, price: parentPrice, variations };
    }));

    return out;
}

/** Unit price for a cart line (variation price → parent price → null). */
export function unitPriceFor(pp: ProductPrice | undefined, variationId: number | null): number | null {
    if (!pp) return null;
    if (variationId) {
        const v = pp.variations.find(x => x.id === variationId);
        if (v) return v.price;
    }
    return pp.price;
}
