'use client';

/**
 * Client-side tier pricing for approved wholesalers.
 *
 * Every ProductCard on a page asks for its own product's price; requests made
 * in the same tick are batched into ONE call to /api/wholesale/prices and the
 * results are cached for the page session. Nothing is fetched unless the
 * caller passes `enabled` (i.e. the user is an approved wholesaler), so
 * logged-out visitors never receive price data.
 */

import { useEffect, useState } from 'react';

export interface VariationPrice {
    id: number;
    attributes: Record<string, string>;
    price: number | null;
}

export interface ProductPricing {
    price: number | null;
    variations: VariationPrice[];
}

const BATCH_SIZE = 50;
const cache = new Map<number, ProductPricing | null>();
const waiters = new Map<number, Array<(p: ProductPricing | null) => void>>();
let queue = new Set<number>();
let timer: ReturnType<typeof setTimeout> | null = null;

async function flush() {
    timer = null;
    const ids = [...queue];
    queue = new Set();
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
        const chunk = ids.slice(i, i + BATCH_SIZE);
        let products: Record<string, ProductPricing> = {};
        try {
            const res = await fetch(`/api/wholesale/prices?ids=${chunk.join(',')}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json() as { products?: Record<string, ProductPricing> };
                products = data.products ?? {};
            }
        } catch { /* network error → treated as no price */ }
        for (const id of chunk) {
            const value = products[String(id)] ?? null;
            cache.set(id, value);
            (waiters.get(id) ?? []).forEach(fn => fn(value));
            waiters.delete(id);
        }
    }
}

function requestPricing(id: number): Promise<ProductPricing | null> {
    if (cache.has(id)) return Promise.resolve(cache.get(id) ?? null);
    return new Promise(resolve => {
        waiters.set(id, [...(waiters.get(id) ?? []), resolve]);
        queue.add(id);
        if (!timer) timer = setTimeout(flush, 0);
    });
}

/** Forget cached prices (e.g. after login / tier change). */
export function clearWholesalePriceCache() {
    cache.clear();
}

/** Tier pricing for one product. `productId` undefined → disabled. */
export function useWholesalePricing(productId: number | undefined): { loading: boolean; pricing: ProductPricing | null } {
    const [state, setState] = useState<{ loading: boolean; pricing: ProductPricing | null }>(() =>
        productId && cache.has(productId)
            ? { loading: false, pricing: cache.get(productId) ?? null }
            : { loading: !!productId, pricing: null }
    );

    useEffect(() => {
        if (!productId) { setState({ loading: false, pricing: null }); return; }
        let active = true;
        setState(s => (cache.has(productId) ? s : { loading: true, pricing: null }));
        requestPricing(productId).then(pricing => { if (active) setState({ loading: false, pricing }); });
        return () => { active = false; };
    }, [productId]);

    return state;
}

/** Tier pricing for several products at once (cart page). */
export function useWholesalePricingMap(ids: number[], enabled: boolean): { loading: boolean; map: Record<number, ProductPricing | null> } {
    const key = [...new Set(ids)].sort((a, b) => a - b).join(',');
    const [state, setState] = useState<{ loading: boolean; map: Record<number, ProductPricing | null> }>({ loading: enabled && !!key, map: {} });

    useEffect(() => {
        if (!enabled || !key) { setState({ loading: false, map: {} }); return; }
        let active = true;
        const list = key.split(',').map(Number);
        setState(s => ({ ...s, loading: true }));
        Promise.all(list.map(id => requestPricing(id).then(p => [id, p] as const))).then(entries => {
            if (active) setState({ loading: false, map: Object.fromEntries(entries) });
        });
        return () => { active = false; };
    }, [key, enabled]);

    return state;
}

/** Exact (case-insensitive) match of a selected option to a variation's attributes. */
export function findVariation(pricing: ProductPricing | null, option: string | null | undefined): VariationPrice | undefined {
    if (!pricing || !option) return undefined;
    const want = option.trim().toLowerCase();
    return pricing.variations.find(v => Object.values(v.attributes).some(val => val.trim().toLowerCase() === want));
}

/** Price for the selected option: variation price → simple/parent price → null. */
export function priceFor(pricing: ProductPricing | null, option: string | null | undefined): { price: number | null; variationId: number | null } {
    if (!pricing) return { price: null, variationId: null };
    if (pricing.variations.length) {
        const v = findVariation(pricing, option);
        return v ? { price: v.price, variationId: v.id } : { price: pricing.price, variationId: null };
    }
    return { price: pricing.price, variationId: null };
}

export const formatInr = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
