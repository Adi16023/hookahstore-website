/**
 * Shipping options — shared by /api/shipping/rates (what the customer sees)
 * and /api/payment/create-order (what the customer is charged), so both
 * always agree. Shiprocket live rates with the same flat-rate fallback.
 */
import { getShiprocketRates } from '../shiprocket';
import { SITE } from '../config/site';

export interface ShippingOption {
    id: string;
    label: string;
    description: string;
    price: number;
    courierCompanyId: number | null;
}

export const FALLBACK_SHIPPING: ShippingOption = {
    id: 'flat_rate',
    label: 'Standard Shipping',
    description: 'Estimated 3–5 business days',
    price: 40,
    courierCompanyId: null,
};

/** Assumed parcel weight: 0.5 kg per unit, minimum 0.5 kg (matches Shiprocket sync). */
export const cartWeightKg = (items: { quantity: number }[]) =>
    Math.max(0.5, items.reduce((sum, i) => sum + i.quantity * 0.5, 0));

export async function getShippingOptions(postcode: string, weight: number): Promise<ShippingOption[]> {
    try {
        const methods = await getShiprocketRates(postcode.trim(), weight);
        return methods.length ? methods : [FALLBACK_SHIPPING];
    } catch (err) {
        console.error('[shipping] Shiprocket rates failed — using flat rate:', err instanceof Error ? err.message : err);
        return [FALLBACK_SHIPPING];
    }
}

/** Orders at or above the merchandise threshold ship free. Courier choice is unchanged. */
export function applyFreeShipping(options: ShippingOption[], subtotal: number): ShippingOption[] {
    if (!(subtotal >= SITE.freeShippingThreshold)) return options;
    return options.map(option => ({ ...option, price: 0 }));
}
