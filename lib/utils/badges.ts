/**
 * getBadge() — the ONE place product badges are decided (retail + wholesale).
 *
 * Priority:
 *   1. ACF field "ribbon_type" (GraphQL productRibbon.ribbonType, WC REST meta
 *      ribbon_type). WPGraphQL returns it as an array, e.g. ["new"].
 *   2. Product tags named like a badge ("New", "Limited", "Back in Stock",
 *      "Exclusive", "Top Rated").
 * Never guessed from the product name.
 */

export type ProductBadge = 'LIMITED' | 'NEW' | 'BACK IN STOCK' | 'EXCLUSIVE' | 'TOP RATED';

const KEYS: Record<string, ProductBadge> = {
    limited: 'LIMITED',
    limited_edition: 'LIMITED',
    new: 'NEW',
    back_in_stock: 'BACK IN STOCK',
    backinstock: 'BACK IN STOCK',
    restocked: 'BACK IN STOCK',
    exclusive: 'EXCLUSIVE',
    top_rated: 'TOP RATED',
    toprated: 'TOP RATED',
    // Existing ACF choice already used on 7 products — shown as "Top Rated"
    topsale: 'TOP RATED',
    top_sale: 'TOP RATED',
};

const key = (v: string) => v.trim().toLowerCase().replace(/[\s-]+/g, '_');

type RibbonInput = string | string[] | null | undefined | { ribbonType?: string | string[] | null };

function fromRibbon(ribbon: RibbonInput): ProductBadge | null {
    const raw = ribbon && typeof ribbon === 'object' && !Array.isArray(ribbon) ? ribbon.ribbonType : ribbon;
    const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
    for (const v of values) {
        const b = KEYS[key(String(v))];
        if (b) return b;
    }
    return null;
}

export function getBadge(product: {
    ribbon?: RibbonInput;
    tags?: Array<{ name?: string | null; slug?: string | null }> | null;
}): ProductBadge | null {
    const fromAcf = fromRibbon(product.ribbon);
    if (fromAcf) return fromAcf;
    for (const t of product.tags ?? []) {
        const b = KEYS[key(t.slug ?? '')] ?? KEYS[key(t.name ?? '')];
        if (b) return b;
    }
    return null;
}
