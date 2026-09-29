/**
 * Coupon validation against WooCommerce (server-side only).
 * Moved from app/api/payment/complete-order so create-order can use it too.
 */
import { wcGet } from '../woocommerce';

export class CheckoutError extends Error {
    constructor(message: string, public status = 400) { super(message); }
}

interface WcCoupon {
    code: string;
    discount_type: string;
    amount: string;
    minimum_amount: string;
    usage_limit: number | null;
    usage_count: number;
    date_expires: string | null;
}

/**
 * Returns the server-computed discount for `couponCode` on `cartSubtotal`
 * (0 when no coupon). Throws CheckoutError if the coupon is invalid,
 * expired, used up, or the minimum isn't met.
 */
export async function validateAndComputeDiscount(
    couponCode: string | null | undefined,
    cartSubtotal: number,
): Promise<number> {
    if (!couponCode) return 0;

    let coupons: WcCoupon[];
    try {
        coupons = await wcGet(`coupons?code=${encodeURIComponent(couponCode)}`) as WcCoupon[];
    } catch {
        throw new CheckoutError('Could not verify coupon with WooCommerce.', 502);
    }
    if (!Array.isArray(coupons) || !coupons.length) throw new CheckoutError('Coupon code is invalid.');

    const c = coupons[0];
    if (c.date_expires && new Date(c.date_expires) < new Date()) throw new CheckoutError('Coupon has expired.');
    if (c.usage_limit !== null && c.usage_count >= c.usage_limit) throw new CheckoutError('Coupon usage limit has been reached.');

    const minAmount = parseFloat(c.minimum_amount || '0');
    if (minAmount > 0 && cartSubtotal < minAmount) {
        throw new CheckoutError(`Coupon requires a minimum order of ₹${minAmount.toFixed(2)}.`);
    }

    if (c.discount_type === 'percent') {
        return Math.round((cartSubtotal * parseFloat(c.amount)) / 100 * 100) / 100;
    }
    if (c.discount_type === 'fixed_cart' || c.discount_type === 'fixed_product') {
        return Math.min(parseFloat(c.amount), cartSubtotal);
    }
    return 0;
}
