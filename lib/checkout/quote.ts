/**
 * Server-side checkout quote. The ONLY source of the amount charged.
 *
 *  - Real prices from WooCommerce REST (product / variation `price`, i.e. the
 *    current sale or regular price) — client prices are ignored.
 *  - Variable products require a variation; stock + purchasability are checked.
 *  - Coupon discount and shipping are recomputed on the server.
 *
 * cartHash() fingerprints the exact items / coupon / shipping choice. It is
 * stored in the Razorpay order notes by create-order and re-checked by
 * complete-order, so a paid amount can't be reused for a different cart.
 */
import { wcGet } from '../woocommerce';
import { CheckoutError, validateAndComputeDiscount } from './coupon';
import { applyFreeShipping, cartWeightKg, getShippingOptions } from './shipping';

export { CheckoutError };

export interface CartLineInput {
    productId: number;
    variationId: number | null;
    quantity: number;
}

export interface QuoteInput {
    items: CartLineInput[];
    couponCode?: string | null;
    shipping: { methodId: string; postcode: string };
}

export interface QuoteLine extends CartLineInput {
    name: string;
    unitPrice: number;
    lineTotal: number;
}

export interface Quote {
    lines: QuoteLine[];
    subtotal: number;
    discount: number;
    couponCode: string | null;
    shippingMethodId: string;
    shippingLabel: string;
    shippingCost: number;
    total: number;
    amountPaise: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Normalise + validate raw cart lines from a request body. */
export function parseCartLines(raw: unknown): CartLineInput[] {
    const list = Array.isArray(raw) ? raw.slice(0, 100) : [];
    const lines = list.map((l: { productId?: unknown; variationId?: unknown; quantity?: unknown }) => ({
        productId: Number(l?.productId),
        variationId: l?.variationId == null || l?.variationId === '' || Number(l?.variationId) === 0 ? null : Number(l?.variationId),
        quantity: Math.floor(Number(l?.quantity)),
    }));
    const valid = lines.every(l =>
        Number.isInteger(l.productId) && l.productId > 0 &&
        (l.variationId === null || (Number.isInteger(l.variationId) && l.variationId > 0)) &&
        Number.isInteger(l.quantity) && l.quantity > 0 && l.quantity <= 999);
    if (!lines.length || !valid) throw new CheckoutError('Your cart is empty or invalid.');
    return lines;
}

interface WcProduct { id: number; name: string; type: string; status: string; price: string; purchasable: boolean; stock_status: string; variations?: number[] }
interface WcVariation { id: number; price: string; purchasable: boolean; stock_status: string; attributes?: { option: string }[] }

export async function buildQuote(input: QuoteInput): Promise<Quote> {
    const ids = [...new Set(input.items.map(i => i.productId))];
    const products = await wcGet(`products?include=${ids.join(',')}&per_page=100`) as WcProduct[];
    const byId = new Map((Array.isArray(products) ? products : []).map(p => [p.id, p]));

    const lines: QuoteLine[] = [];
    for (const item of input.items) {
        const p = byId.get(item.productId);
        if (!p || p.status !== 'publish') throw new CheckoutError('An item in your cart is no longer available. Please remove it and try again.', 409);

        let price: string;
        let name = p.name;
        if (p.type === 'variable') {
            if (!item.variationId) throw new CheckoutError(`Please choose a size for "${p.name}" (remove it and add it again).`);
            let v: WcVariation;
            try {
                v = await wcGet(`products/${p.id}/variations/${item.variationId}`) as WcVariation;
            } catch {
                throw new CheckoutError(`The selected size of "${p.name}" is no longer available.`, 409);
            }
            if (!v.purchasable || v.stock_status === 'outofstock') throw new CheckoutError(`"${p.name}" in that size is out of stock.`, 409);
            price = v.price;
            const option = v.attributes?.map(a => a.option).join(' / ');
            if (option) name = `${p.name} (${option})`;
        } else {
            if (!p.purchasable || p.stock_status === 'outofstock') throw new CheckoutError(`"${p.name}" is out of stock.`, 409);
            price = p.price;
        }

        const unit = Number(price);
        if (!Number.isFinite(unit) || unit <= 0) throw new CheckoutError(`"${p.name}" can't be purchased online right now.`, 409);
        lines.push({ ...item, name, unitPrice: round2(unit), lineTotal: round2(unit * item.quantity) });
    }

    const subtotal = round2(lines.reduce((s, l) => s + l.lineTotal, 0));
    const couponCode = input.couponCode?.trim() || null;
    const discount = round2(await validateAndComputeDiscount(couponCode, subtotal));

    const options = applyFreeShipping(
        await getShippingOptions(input.shipping.postcode, cartWeightKg(input.items)),
        subtotal,
    );
    const ship = options.find(o => o.id === input.shipping.methodId);
    if (!ship) throw new CheckoutError('Your shipping option has changed. Please go back and choose a shipping method again.', 409);

    const total = round2(Math.max(0, subtotal - discount) + ship.price);
    return {
        lines,
        subtotal,
        discount,
        couponCode,
        shippingMethodId: ship.id,
        shippingLabel: ship.label,
        shippingCost: round2(ship.price),
        total,
        amountPaise: Math.round(total * 100),
    };
}

/** SHA-256 fingerprint of the cart, coupon and shipping choice. */
export async function cartHash(input: QuoteInput): Promise<string> {
    const canonical = JSON.stringify({
        i: [...input.items]
            .map(l => [l.productId, l.variationId ?? 0, l.quantity])
            .sort((a, b) => a[0] - b[0] || a[1] - b[1]),
        c: (input.couponCode ?? '').trim().toLowerCase(),
        s: input.shipping.methodId,
        p: input.shipping.postcode.trim(),
    });
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}
