/** Wholesale orders are sold by the kilogram, not retail pack sizes. */

export const WHOLESALE_MIN_KG = 1;
export const WHOLESALE_MAX_KG = 5;

/** "50g" → 0.05, "1 kg" → 1, "1kg" → 1. Null when the label is not a weight. */
export function optionWeightKg(label: string): number | null {
    const match = label.trim().toLowerCase().match(/(\d+(?:\.\d+)?)\s*(kg|g)\b/);
    if (!match) return null;
    const amount = Number(match[1]);
    if (!Number.isFinite(amount) || amount <= 0) return null;
    return match[2] === 'kg' ? amount : amount / 1000;
}

/** The 1 kg pack used as the priced unit. Smaller packs (50g, 250g) are ignored. */
export function wholesaleKgUnit(options: string[]): string | null {
    return options.find(option => optionWeightKg(option) === 1) ?? null;
}

export function clampWholesaleKg(value: number): number {
    const kg = Math.floor(value);
    if (!Number.isFinite(kg)) return WHOLESALE_MIN_KG;
    return Math.min(WHOLESALE_MAX_KG, Math.max(WHOLESALE_MIN_KG, kg));
}
