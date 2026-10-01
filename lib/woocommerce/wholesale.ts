/**
 * WooCommerce REST API — wholesale-specific helpers
 * Server-side only. Never import in client components.
 */

import { wcPut, wcGetCustomerByEmail } from './index';

export type WcRole = 'customer' | 'wholesale_pending' | 'wholesale_customer';

export interface WcCustomer {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    meta_data?: { key: string; value: string }[];
}

/**
 * Assign a WordPress role to a user via the WordPress Users REST API.
 *
 * WHY NOT WooCommerce REST API?
 * PUT /wc/v3/customers/{id} { role: 'wholesale_pending' } silently ignores
 * custom roles that WooCommerce didn't register itself. The WC API validates
 * roles against its own internal list and drops anything it doesn't recognise,
 * leaving the user with their original 'customer' role.
 *
 * WHY WordPress REST API?
 * PUT /wp/v2/users/{id} { roles: ['wholesale_pending'] } writes directly to
 * the WordPress user role system and respects ALL registered roles, including
 * custom ones added by plugins (like our Wholesale Admin Manager).
 *
 * AUTH: Uses WP Application Password (same credentials as media uploads).
 * The `nextjs_api` WP user must have the `edit_users` capability for this
 * call to succeed (Editor role has this; Author does not).
 */
export async function wcSetCustomerRole(customerId: number, role: WcRole): Promise<void> {
    const wpBase    = process.env.WOOCOMMERCE_URL ?? '';
    const username  = process.env.WP_ADMIN_USERNAME;
    const appPass   = process.env.WP_ADMIN_APP_PASSWORD;

    if (!username || !appPass) {
        throw new Error(
            'WordPress admin credentials (WP_ADMIN_USERNAME / WP_ADMIN_APP_PASSWORD) are not set.'
        );
    }

    const credentials = btoa(`${username}:${appPass}`);
    const url = `${wpBase}/wp-json/wp/v2/users/${customerId}`;

    if (process.env.NODE_ENV === 'development') {
        console.log(`[wcSetCustomerRole] → PUT ${url}  role="${role}"`);
    }

    const res = await fetch(url, {
        method: 'PUT',
        headers: {
            Authorization:  `Basic ${credentials}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roles: [role] }),
    });

    const responseBody = await res.json().catch(() => ({}));
    console.log(`[wcSetCustomerRole] ← HTTP ${res.status}`, JSON.stringify(responseBody));

    if (!res.ok) {
        const { message, code } = responseBody as { message?: string; code?: string };
        throw new Error(
            `WP Users API role update failed [${res.status}]: ${message ?? code ?? 'unknown error'}`
        );
    }
}

/**
 * Set a user's password through the WordPress Users API.
 *
 * WooCommerce PUT /customers/{id} { password } fails for wholesale_customer
 * and wholesale_pending — those roles are not in WooCommerce's own role list,
 * so the customer update is rejected and the reset page shows a generic error.
 */
export async function wpSetUserPassword(userId: number, password: string): Promise<void> {
    const wpBase   = process.env.WOOCOMMERCE_URL ?? '';
    const username = process.env.WP_ADMIN_USERNAME;
    const appPass  = process.env.WP_ADMIN_APP_PASSWORD;

    if (!username || !appPass) {
        throw new Error(
            'WordPress admin credentials (WP_ADMIN_USERNAME / WP_ADMIN_APP_PASSWORD) are not set.'
        );
    }

    const res = await fetch(`${wpBase}/wp-json/wp/v2/users/${userId}`, {
        method: 'PUT',
        headers: {
            Authorization: `Basic ${btoa(`${username}:${appPass}`)}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { message?: string; code?: string };
        throw new Error(
            `WP Users API password update failed [${res.status}]: ${body.message ?? body.code ?? 'unknown error'}`
        );
    }
}

/**
 * Store wholesale business meta and mark approval status on a customer.
 */
export async function wcSetWholesaleMeta(
    customerId: number,
    meta: {
        account_type: string;
        approval_status: string;
        business_name?: string;
        business_address?: string;
        business_phone?: string;
        gst_number?: string;
        business_website?: string;
        // Document URLs (populated after upload step)
        gst_certificate_url?: string;
        business_license_url?: string;
        identity_document_url?: string;
    }
): Promise<void> {
    const meta_data = Object.entries(meta)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([key, value]) => ({ key, value: value as string }));

    await wcPut(`customers/${customerId}`, { meta_data });
}

/**
 * Fetch a WooCommerce customer by email and return role + id.
 * Returns null if the customer doesn't exist.
 */
export async function wcGetCustomerRoleByEmail(
    email: string
): Promise<{ id: number; role: WcRole; firstName: string; lastName: string } | null> {
    const customer = (await wcGetCustomerByEmail(email)) as WcCustomer | null;
    if (!customer) return null;
    return {
        id: customer.id,
        role: customer.role as WcRole,
        firstName: customer.first_name,
        lastName: customer.last_name,
    };
}
