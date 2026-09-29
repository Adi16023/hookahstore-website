/**
 * ensureServerEnv() — runs validateEnv() once per server isolate.
 * Called from shared server-side helpers used by the API routes
 * (session tokens, WooCommerce REST client, wholesale guard).
 */
import { validateEnv } from '../env-check';

let checked = false;
let missingVars: string[] = [];

export function ensureServerEnv(): string[] {
    if (!checked) {
        checked = true;
        missingVars = validateEnv();
    }
    return missingVars;
}
