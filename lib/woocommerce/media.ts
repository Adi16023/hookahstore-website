/**
 * WordPress Media Library upload helper
 * Server-side only. Never import in client components.
 *
 * Uses WordPress Application Passwords for authentication.
 * Set in .env.local:
 *   WP_ADMIN_USERNAME=your_username
 *   WP_ADMIN_APP_PASSWORD=xxxx xxxx xxxx xxxx xxxx xxxx
 */

const WP_BASE = process.env.WOOCOMMERCE_URL ?? '';

/** Allowed MIME types for wholesale document uploads */
const ALLOWED_TYPES: Record<string, string> = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
};

/** 10 MB limit */
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

export interface UploadedMedia {
    id: number;
    source_url: string;
    filename: string;
}

/**
 * Validate a file before uploading.
 * Returns an error string, or null if valid.
 */
export function validateUploadFile(file: File, required: boolean, fieldName: string): string | null {
    if (!file || file.size === 0) {
        if (required) return `${fieldName} is required.`;
        return null;
    }
    if (!ALLOWED_TYPES[file.type]) {
        return `${fieldName} must be a PDF, JPG, or PNG file.`;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
        return `${fieldName} must be smaller than 10 MB.`;
    }
    return null;
}

/**
 * Upload a single file to the WordPress Media Library.
 * Returns the resulting source_url.
 */
export async function uploadToWordPressMedia(file: File, filename: string): Promise<UploadedMedia> {
    const username = process.env.WP_ADMIN_USERNAME;
    const appPassword = process.env.WP_ADMIN_APP_PASSWORD;

    if (!username || !appPassword) {
        throw new Error('WordPress admin credentials (WP_ADMIN_USERNAME / WP_ADMIN_APP_PASSWORD) are not configured.');
    }

    const credentials = btoa(`${username}:${appPassword}`);
    const arrayBuffer = await file.arrayBuffer();

    const res = await fetch(`${WP_BASE}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${credentials}`,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
            'Content-Type': file.type,
        },
        body: arrayBuffer,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({})) as { message?: string };
        throw new Error(err.message ?? `WordPress media upload failed: ${res.status}`);
    }

    const media = await res.json() as { id: number; source_url: string; slug: string };
    return {
        id: media.id,
        source_url: media.source_url,
        filename,
    };
}

/**
 * Save document URLs to a WooCommerce customer's meta.
 */
export async function wcSaveDocumentUrls(
    customerId: number,
    urls: {
        gst_certificate_url?: string;
        business_license_url?: string;
        identity_document_url?: string;
    }
): Promise<void> {
    const { wcPut } = await import('./index');

    const meta_data = Object.entries(urls)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([key, value]) => ({ key, value: value as string }));

    if (meta_data.length === 0) return;
    await wcPut(`customers/${customerId}`, { meta_data });
}
