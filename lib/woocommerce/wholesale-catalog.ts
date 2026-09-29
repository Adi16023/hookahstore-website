/**
 * Wholesale catalog — WooCommerce REST, server-side only.
 *
 * Wholesale shows ONLY products whose ACF/meta `show_in_wholesale` is "1".
 * (The ACF field's GraphQL name is `showInWholesale`, but the stored meta key
 * is `show_in_wholesale`.) Filtering happens here, on the server, via the
 * product meta_data returned by WC REST — not via a WPGraphQL metaQuery.
 *
 * NO PRICES are ever returned from this module. Tier prices are served only to
 * approved wholesalers by /api/wholesale/prices.
 */

import { wcGetCached } from './index';
import { HOMEPAGE_BRAND_ALIASES, type HomepageBrandsData, type HomepageProduct } from '../graphql';
import { optionWeightKg, wholesaleKgUnit } from '../wholesale/weight';

export const WHOLESALE_VISIBILITY_META = 'show_in_wholesale';

/** Price-free product shape safe to send to any browser. */
export interface WholesaleProduct {
    id: number;
    slug: string;
    name: string;
    image: string | null;
    /** Plain-text short description (falls back to description) */
    description: string;
    type: string;               // 'simple' | 'variable' | ...
    stockStatus: string;        // 'instock' | 'outofstock' | 'onbackorder'
    /**
     * Size options. Weight products expose only the 1 kg pack (50g / 250g are dropped).
     * Products that are not sold by weight keep their real options.
     */
    options: string[];
    /** Name of that attribute (e.g. "Size") */
    optionName: string | null;
    /** True when the variation attribute is a weight (g / kg). Ordered in whole kilograms. */
    sellsByKg: boolean;
    categories: { slug: string; name: string }[];
    ribbon: string | null;      // ACF ribbon_type (new / topsale / none …)
    moq: number | null;         // ACF wholesale_moq
}

export interface WholesaleCategory {
    id: number;
    slug: string;
    name: string;
    description: string | null;
    image: string | null;
}

/* ── Raw WC REST shapes (only the fields we read) ─────────────────────────── */
interface WcMeta { key: string; value: unknown }
interface WcRestProduct {
    id: number;
    slug: string;
    name: string;
    type: string;
    status: string;
    stock_status: string;
    short_description?: string;
    description?: string;
    images?: { src: string }[];
    categories?: { slug: string; name: string }[];
    attributes?: { name: string; options: string[]; variation?: boolean }[];
    meta_data?: WcMeta[];
}

const stripHtml = (html?: string) =>
    (html ?? '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

export const metaValue = (meta: WcMeta[] | undefined, key: string): string | null => {
    const m = meta?.find(x => x.key === key);
    return m == null || m.value == null ? null : String(m.value);
};

export const isWholesaleVisible = (p: { meta_data?: WcMeta[] }) =>
    metaValue(p.meta_data, WHOLESALE_VISIBILITY_META) === '1';

function toWholesaleProduct(p: WcRestProduct): WholesaleProduct {
    const varAttr = p.attributes?.find(a => a.variation) ?? null;
    const rawOptions = p.type === 'variable' ? (varAttr?.options ?? []) : [];
    const sellsByKg = rawOptions.some(option => optionWeightKg(option) != null);
    const kgUnit = wholesaleKgUnit(rawOptions);
    const moqRaw = Number(metaValue(p.meta_data, 'wholesale_moq'));
    const ribbon = metaValue(p.meta_data, 'ribbon_type');
    return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        image: p.images?.[0]?.src ?? null,
        description: stripHtml(p.short_description) || stripHtml(p.description).slice(0, 220),
        type: p.type,
        stockStatus: p.stock_status,
        options: sellsByKg ? (kgUnit ? [kgUnit] : []) : rawOptions,
        optionName: sellsByKg ? 'Weight' : (p.type === 'variable' ? (varAttr?.name ?? null) : null),
        sellsByKg,
        categories: (p.categories ?? []).map(c => ({ slug: c.slug, name: c.name })),
        ribbon: ribbon && ribbon !== 'none' ? ribbon : null,
        moq: Number.isFinite(moqRaw) && moqRaw > 0 ? moqRaw : null,
    };
}

/* ── Categories ───────────────────────────────────────────────────────────── */

export async function getWholesaleCategory(slug: string): Promise<WholesaleCategory | null> {
    const list = await wcGetCached(`products/categories?slug=${encodeURIComponent(slug)}`, 3600) as Array<{
        id: number; slug: string; name: string; description?: string; image?: { src?: string } | null;
    }>;
    const c = Array.isArray(list) ? list[0] : null;
    if (!c) return null;
    return {
        id: c.id,
        slug: c.slug,
        name: c.name,
        description: stripHtml(c.description) || null,
        image: c.image?.src ?? null,
    };
}

/* ── Products ─────────────────────────────────────────────────────────────── */

const PER_PAGE = 100;
const MAX_PAGES = 5; // hard cap: 500 products per listing

/**
 * Raw WC REST products (published only), paginated. Includes meta_data, so
 * callers can filter on wholesale visibility. Cached for 5 minutes.
 */
async function listRawProducts(params: Record<string, string>, maxPages = MAX_PAGES, revalidate = 300): Promise<WcRestProduct[]> {
    const out: WcRestProduct[] = [];
    for (let page = 1; page <= maxPages; page++) {
        const qs = new URLSearchParams({ status: 'publish', per_page: String(PER_PAGE), page: String(page), ...params });
        const batch = await wcGetCached(`products?${qs.toString()}`, revalidate) as WcRestProduct[];
        if (!Array.isArray(batch)) break;
        out.push(...batch);
        if (batch.length < PER_PAGE) break;
    }
    return out;
}

/** Wholesale-visible products in a category (by slug). */
export async function getWholesaleProductsByCategory(slug: string): Promise<WholesaleProduct[]> {
    const cat = await getWholesaleCategory(slug);
    if (!cat) return [];
    const raw = await listRawProducts({ category: String(cat.id) });
    return raw.filter(isWholesaleVisible).map(toWholesaleProduct);
}

/** Wholesale-visible products matching a search string (max `limit`). */
export async function searchWholesaleProducts(query: string, limit = 10): Promise<WholesaleProduct[]> {
    const raw = await listRawProducts({ search: query }, 1);
    return raw.filter(isWholesaleVisible).slice(0, limit).map(toWholesaleProduct);
}

/** Single wholesale-visible product by slug, or null (missing OR hidden from wholesale). */
export async function getWholesaleProductBySlug(slug: string): Promise<WholesaleProduct | null> {
    const raw = await listRawProducts({ slug }, 1);
    const p = raw[0];
    return p && isWholesaleVisible(p) ? toWholesaleProduct(p) : null;
}

/**
 * Raw products by ID (published + wholesale-visible only). Used server-side by
 * the pricing / enquiry code, which needs meta_data.
 */
export async function getRawWholesaleProductsByIds(ids: number[], revalidate = 60): Promise<WcRestProduct[]> {
    if (!ids.length) return [];
    const raw = await listRawProducts({ include: ids.join(',') }, 1, revalidate);
    return raw.filter(isWholesaleVisible);
}

/**
 * Wholesale homepage brand sliders — same 5 brands as retail, but only
 * wholesale-visible products and NO price fields (shape matches the retail
 * HomepageBrandsData so HomePageContent/ProductSlider can render it).
 * A brand that fails returns an empty slider; the others still render.
 */
export async function fetchWholesaleHomepageBrands(): Promise<HomepageBrandsData> {
    const aliases = Object.keys(HOMEPAGE_BRAND_ALIASES) as (keyof typeof HOMEPAGE_BRAND_ALIASES)[];
    const results = await Promise.allSettled(aliases.map(a => getWholesaleProductsByCategory(HOMEPAGE_BRAND_ALIASES[a])));
    const out: NonNullable<HomepageBrandsData> = {};
    aliases.forEach((alias, i) => {
        const r = results[i];
        if (r.status === 'rejected') console.error('[wholesale home] brand failed:', alias, r.reason);
        const products = r.status === 'fulfilled' ? r.value.slice(0, 5) : [];
        out[alias] = { nodes: products.map(toHomepageProduct) };
    });
    return out;
}

function toHomepageProduct(p: WholesaleProduct): HomepageProduct {
    return {
        id: String(p.id),
        databaseId: p.id,
        slug: p.slug,
        name: p.name,
        description: p.description,
        image: p.image ? { sourceUrl: p.image } : undefined,
        stockStatus: p.stockStatus,
        productRibbon: p.ribbon ? { ribbonType: p.ribbon } : undefined,
        attributes: p.options.length ? { nodes: [{ name: p.optionName ?? 'Size', options: p.options }] } : undefined,
        // Price-free "variations" so the slider renders size pills; tier prices load client-side
        variations: p.options.length ? { nodes: p.options.map((o, i) => ({ id: String(i), name: o, price: '' })) } : undefined,
    };
}

export type { WcRestProduct, WcMeta };
