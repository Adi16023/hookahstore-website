/**
 * Variation matching — EXACT attribute matching (never substring):
 * "50g" must never match "250g".
 *
 * WooGraphQL returns global-attribute options and variation values as term
 * slugs (e.g. options ["1kg","250g","50g"], variation value "250g"), so both
 * sides use the same keys. Values are compared after normalising case and
 * whitespace only ("1 Kg" ≡ "1kg").
 */

export interface VariationNode {
    databaseId?: number;
    price?: string | null;
    stockStatus?: string | null;
    attributes?: { nodes: Array<{ name?: string; value?: string | null }> } | null;
}

export const normOption = (s: string | null | undefined) =>
    (s ?? '').toLowerCase().replace(/\s+/g, '');

/** The variation whose attribute values include `option` exactly. */
export function matchVariation<T extends VariationNode>(variations: T[] | undefined, option: string | null | undefined): T | undefined {
    const want = normOption(option);
    if (!want || !variations?.length) return undefined;
    return variations.find(v => (v.attributes?.nodes ?? []).some(a => normOption(a.value) === want));
}

/** Attribute used for size pills: size / weight / pack, else the first attribute. */
export function pickSizeAttribute<A extends { name: string; options: string[] }>(attrs: A[] | undefined): A | undefined {
    if (!attrs?.length) return undefined;
    return attrs.find(a => /size|weight|pack/i.test(a.name)) ?? attrs[0];
}

/** WooGraphQL stockStatus is "IN_STOCK" / "OUT_OF_STOCK" / "ON_BACKORDER". */
export const isInStock = (status: string | null | undefined) =>
    !status || !/out[_ ]?of[_ ]?stock/i.test(status);

/** A price string that WooCommerce will actually charge (not empty / zero). */
export const hasPrice = (price: string | null | undefined) =>
    !!price && Number(price.replace(/[^0-9.]/g, '')) > 0;

/**
 * Per-option maps for a product card: price, variation databaseId and
 * availability (in stock AND priced), keyed by option.
 */
export function buildVariationMaps(options: string[], variations: VariationNode[] | undefined) {
    const prices: Record<string, string> = {};
    const ids: Record<string, number> = {};
    const available: Record<string, boolean> = {};
    for (const opt of options) {
        const v = matchVariation(variations, opt);
        if (v?.price) prices[opt] = v.price;
        if (v?.databaseId) ids[opt] = v.databaseId;
        available[opt] = !!v && isInStock(v.stockStatus) && hasPrice(v.price);
    }
    return { prices, ids, available };
}
