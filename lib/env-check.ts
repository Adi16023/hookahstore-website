/**
 * Environment variable validation.
 *
 * Called (once per server isolate) by ensureServerEnv() in lib/server/env.ts,
 * which the shared server helpers — session tokens, WooCommerce client,
 * wholesale guard — invoke, so every API route runs it.
 *
 * It LOGS each missing variable instead of throwing: throwing here would take
 * every route down because one optional key (e.g. Brevo) is unset. Code that
 * truly cannot work without a secret must fail closed itself (see
 * lib/auth/jwt-secret.ts, the Razorpay routes).
 */

export const REQUIRED_ENV_VARS = [
    'JWT_SECRET',
    'WOOCOMMERCE_URL',
    'WOOCOMMERCE_CONSUMER_KEY',
    'WOOCOMMERCE_CONSUMER_SECRET',
    'WP_ADMIN_USERNAME',
    'WP_ADMIN_APP_PASSWORD',
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RESEND_API_KEY',
    'WHOLESALE_WEBHOOK_SECRET',
    'ADMIN_PASSWORD',
] as const;

/** Returns the names of missing required variables and logs each one. */
export function validateEnv(): string[] {
    const missing = REQUIRED_ENV_VARS.filter(key => !process.env[key]);
    for (const key of missing) {
        console.error(`[env-check] Missing environment variable: ${key} — set it in Cloudflare Pages → Settings → Variables and Secrets`);
    }
    return missing;
}
