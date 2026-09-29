/**
 * lib/utils/dob.ts
 *
 * Date-of-birth helpers shared by the age gate, signup, checkout and the
 * server routes that re-check age. Pure functions — safe on the edge runtime.
 *
 * Canonical storage format is ISO "YYYY-MM-DD" (localStorage key `ageDOB`,
 * WooCommerce meta `_customer_dob`). The checkout input displays DD/MM/YYYY.
 */

export const MIN_AGE = 21;
export const DOB_STORAGE_KEY = 'ageDOB';
export const DOB_META_KEY = '_customer_dob';

/** Build an ISO date from parts, or null if the date doesn't exist (e.g. 31/02). */
export function toIsoDob(year: number, month: number, day: number): string | null {
    if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
    const d = new Date(Date.UTC(year, month - 1, day));
    if (d.getUTCFullYear() !== year || d.getUTCMonth() !== month - 1 || d.getUTCDate() !== day) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

/** Parse a strict ISO "YYYY-MM-DD" date of birth. Returns null if invalid or out of range. */
export function parseIsoDob(iso: unknown): { year: number; month: number; day: number } | null {
    if (typeof iso !== 'string') return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
    if (!m) return null;
    const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (!toIsoDob(year, month, day)) return null;
    const thisYear = new Date().getFullYear();
    if (year < 1900 || year > thisYear) return null;
    return { year, month, day };
}

/** Age in whole years on `today` (defaults to now). */
export function ageFromIsoDob(iso: string, today: Date = new Date()): number | null {
    const p = parseIsoDob(iso);
    if (!p) return null;
    let age = today.getFullYear() - p.year;
    const monthDiff = today.getMonth() + 1 - p.month;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < p.day)) age--;
    return age;
}

export const isOfAge = (iso: string, minAge = MIN_AGE): boolean => {
    const age = ageFromIsoDob(iso);
    return age !== null && age >= minAge;
};

/** "YYYY-MM-DD" → "DD/MM/YYYY" (checkout input format). */
export function isoToDisplay(iso: string): string {
    const p = parseIsoDob(iso);
    if (!p) return '';
    return `${String(p.day).padStart(2, '0')}/${String(p.month).padStart(2, '0')}/${p.year}`;
}

/** "DD/MM/YYYY" → "YYYY-MM-DD", or null if not a real date. */
export function displayToIso(display: string): string | null {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(display.trim());
    if (!m) return null;
    return toIsoDob(Number(m[3]), Number(m[2]), Number(m[1]));
}

/* ── Browser storage (client only; never throws) ─────────────────────────── */

export function readStoredDob(): string {
    try {
        const v = typeof window !== 'undefined' ? window.localStorage.getItem(DOB_STORAGE_KEY) : null;
        return v && parseIsoDob(v) ? v : '';
    } catch {
        return '';
    }
}

export function storeDob(iso: string): void {
    try {
        if (parseIsoDob(iso)) window.localStorage.setItem(DOB_STORAGE_KEY, iso);
    } catch { /* storage unavailable — pre-fill is a convenience only */ }
}
