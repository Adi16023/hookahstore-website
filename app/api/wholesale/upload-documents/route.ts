export const runtime = 'edge';
// Node.js runtime — required for ArrayBuffer + fetch to WordPress
// (no 'runtime = edge' here because we pass binary file data)

/**
 * POST /api/wholesale/upload-documents
 *
 * Accepts multipart/form-data:
 *   customerId      string  (required) — WC customer ID
 *   gstCertificate  File    (required) — GST Certificate (PDF/JPG/PNG, max 10MB)
 *   businessLicense File    (required) — Business License (PDF/JPG/PNG, max 10MB)
 *   identityDocument File   (optional) — Identity Document (PDF/JPG/PNG, max 10MB)
 *
 * Flow:
 *   1. Validate files
 *   2. Upload each to WordPress Media Library
 *   3. Save source_url values to WC customer meta
 *   4. Return { success, urls }
 */

import { NextRequest, NextResponse } from 'next/server';
import {
    validateUploadFile,
    uploadToWordPressMedia,
    wcSaveDocumentUrls,
} from '../../../../lib/woocommerce/media';

export async function POST(req: NextRequest) {
    try {
        let formData: FormData;
        try {
            formData = await req.formData();
        } catch {
            return json({ error: 'Request must be multipart/form-data.' }, 400);
        }

        /* ── Extract fields ── */
        const customerId = formData.get('customerId');
        if (!customerId || typeof customerId !== 'string') {
            return json({ error: 'customerId is required.' }, 400);
        }

        const gstCertificate = formData.get('gstCertificate');
        const businessLicense = formData.get('businessLicense');
        const identityDocument = formData.get('identityDocument');

        /* ── Validate files ── */
        const validationErrors: string[] = [];

        if (!(gstCertificate instanceof File)) {
            validationErrors.push('GST Certificate is required.');
        } else {
            const err = validateUploadFile(gstCertificate, true, 'GST Certificate');
            if (err) validationErrors.push(err);
        }

        if (!(businessLicense instanceof File)) {
            validationErrors.push('Business License is required.');
        } else {
            const err = validateUploadFile(businessLicense, true, 'Business License');
            if (err) validationErrors.push(err);
        }

        if (identityDocument instanceof File && identityDocument.size > 0) {
            const err = validateUploadFile(identityDocument, false, 'Identity Document');
            if (err) validationErrors.push(err);
        }

        if (validationErrors.length > 0) {
            return json({ error: validationErrors[0], errors: validationErrors }, 400);
        }

        /* ── Upload to WordPress Media Library ── */
        const safeId = customerId.replace(/[^0-9]/g, '');
        const timestamp = Date.now();

        const uploadResults: { gst_certificate_url?: string; business_license_url?: string; identity_document_url?: string } = {};

        // Upload GST Certificate (required)
        const gstFile = gstCertificate as File;
        const gstExt = gstFile.name.split('.').pop() ?? 'pdf';
        const gstMedia = await uploadToWordPressMedia(
            gstFile,
            `wholesale-${safeId}-gst-${timestamp}.${gstExt}`
        );
        uploadResults.gst_certificate_url = gstMedia.source_url;

        // Upload Business License (required)
        const licenseFile = businessLicense as File;
        const licenseExt = licenseFile.name.split('.').pop() ?? 'pdf';
        const licenseMedia = await uploadToWordPressMedia(
            licenseFile,
            `wholesale-${safeId}-license-${timestamp}.${licenseExt}`
        );
        uploadResults.business_license_url = licenseMedia.source_url;

        // Upload Identity Document (optional)
        if (identityDocument instanceof File && identityDocument.size > 0) {
            const idFile = identityDocument as File;
            const idExt = idFile.name.split('.').pop() ?? 'pdf';
            const idMedia = await uploadToWordPressMedia(
                idFile,
                `wholesale-${safeId}-id-${timestamp}.${idExt}`
            );
            uploadResults.identity_document_url = idMedia.source_url;
        }

        /* ── Save URLs to WC customer meta ── */
        await wcSaveDocumentUrls(Number(safeId), uploadResults);

        return NextResponse.json(
            {
                success: true,
                urls: uploadResults,
                message: 'Documents uploaded successfully.',
            },
            { status: 200 }
        );

    } catch (err) {
        console.error('[api/wholesale/upload-documents]', err);
        const message = err instanceof Error ? err.message : 'Document upload failed.';
        return json({ error: message }, 500);
    }
}

function json(body: object, status: number) {
    return NextResponse.json(body, { status });
}
