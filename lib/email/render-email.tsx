/**
 * Email HTML renderer — pure string templates, no React/DOM dependency.
 * Turbopack-safe. No react-dom/server required.
 * Server-side only.
 */

/* ── Shared base HTML wrapper ── */
function base({
    title,
    bodyHtml,
    ctaLabel,
    ctaHref,
}: {
    title: string;
    bodyHtml: string;
    ctaLabel?: string;
    ctaHref?: string;
}): string {
    const year = new Date().getFullYear();
    const cta = ctaLabel && ctaHref
        ? `<tr>
            <td style="padding:0 32px 36px 32px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tbody><tr>
                  <td style="background-color:#CD142C;border-radius:4px;">
                    <a href="${ctaHref}" target="_blank" rel="noreferrer"
                       style="display:inline-block;padding:12px 28px;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:4px;">
                      ${ctaLabel}
                    </a>
                  </td>
                </tr></tbody>
              </table>
            </td>
          </tr>`
        : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} | The Hookah Store</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#f4f4f4;padding:32px 16px;">
    <tbody><tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
             style="max-width:600px;background-color:#ffffff;border-radius:6px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <tbody>
          <!-- Brand header -->
          <tr><td style="background-color:#ffffff;padding:24px 32px;border-bottom:1px solid #eeeeee;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#CD142C;letter-spacing:0.5px;">
              THE HOOKAH STORE
            </p>
          </td></tr>
          <!-- Red title bar -->
          <tr><td style="background-color:#CD142C;padding:18px 32px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:700;color:#ffffff;">
              ${title}
            </p>
          </td></tr>
          <!-- Body -->
          <tr><td style="padding:32px 32px 24px 32px;">
            ${bodyHtml}
          </td></tr>
          ${cta}
          <!-- Divider -->
          <tr><td style="padding:0 32px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tbody><tr><td style="border-top:1px solid #eeeeee;height:1px;"></td></tr></tbody>
            </table>
          </td></tr>
          <!-- Footer -->
          <tr><td style="padding:20px 32px 28px 32px;">
            <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#999999;line-height:1.6;">
              This is an automated message. Please do not reply to this email.
            </p>
            <p style="margin:8px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#cccccc;">
              &copy; ${year} The Hookah Store. All rights reserved.
            </p>
          </td></tr>
        </tbody>
      </table>
    </td></tr></tbody>
  </table>
</body>
</html>`;
}

/* ─────────────────────────────── Public helpers ─────────────────────────────── */

export function renderWelcomeEmail(firstName: string, loginUrl: string): string {
    return base({
        title: 'Welcome to The Hookah Store',
        ctaLabel: 'Log in to your account',
        ctaHref: loginUrl,
        bodyHtml: `
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#222222;line-height:1.6;">Hi ${firstName},</p>
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;">
            Your account has been successfully created. You can now browse our full range of hookahs, flavours, charcoal, and accessories — and enjoy exclusive member benefits.
          </p>
          <p style="margin:0 0 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;">
            Click the button below to log in and start shopping.
          </p>
        `,
    });
}

export function renderVerificationEmail(firstName: string, verificationUrl: string): string {
    return base({
        title: 'Verify Your Email Address',
        ctaLabel: 'Verify Email Address',
        ctaHref: verificationUrl,
        bodyHtml: `
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#222222;line-height:1.6;">Hi ${firstName},</p>
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;">
            Thank you for creating your account. To complete your profile setup, please verify your email address by clicking the button below.
          </p>
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;">
            You can continue shopping without verifying — this step is optional but helps keep your account secure.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tbody><tr><td style="background-color:#fff8f8;border:1px solid #f5c6cb;border-radius:4px;padding:12px 16px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#CD142C;line-height:1.6;">
                <strong>Note:</strong> This verification link will expire after 24 hours.
              </p>
            </td></tr></tbody>
          </table>
        `,
    });
}

export function renderPasswordResetEmail(firstName: string, resetUrl: string): string {
    return base({
        title: 'Reset Your Password',
        ctaLabel: 'Reset Password',
        ctaHref: resetUrl,
        bodyHtml: `
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#222222;line-height:1.6;">Hi ${firstName},</p>
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;">
            We received a request to reset the password for your account. Click the button below to choose a new password.
          </p>
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;">
            If you did not request a password reset, you can safely ignore this email.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tbody><tr><td style="background-color:#fff8f8;border:1px solid #f5c6cb;border-radius:4px;padding:12px 16px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#CD142C;line-height:1.6;">
                <strong>Note:</strong> This reset link will expire after a limited time.
              </p>
            </td></tr></tbody>
          </table>
        `,
    });
}

export function renderPasswordResetSuccessEmail(firstName: string): string {
    return base({
        title: 'Password Updated',
        bodyHtml: `
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#222222;line-height:1.6;">Hi ${firstName},</p>
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;">
            Your password has been changed successfully. You can now log in with your new password.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;">
            <tbody><tr><td style="background-color:#fff8f8;border:1px solid #f5c6cb;border-radius:4px;padding:12px 16px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#CD142C;line-height:1.6;">
                <strong>Was this not you?</strong> If you did not make this change, please contact our support team immediately.
              </p>
            </td></tr></tbody>
          </table>
        `,
    });
}

export function renderWholesaleApplicationEmail(name: string, businessName: string): string {

    return base({
        title: 'Wholesale Application Received',
        bodyHtml: `
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#222222;line-height:1.6;">Hi ${name},</p>
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;">
            Thank you for applying for a wholesale account with The Hookah Store. We have received your application for
            <strong style="color:#222222;">${businessName}</strong> and it is now under review.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tbody><tr><td style="background-color:#f9f9f9;border-left:4px solid #CD142C;padding:14px 18px;border-radius:2px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#444444;line-height:1.7;">
                Our team will verify your submitted documents and business details. You will receive a separate email
                once your account has been reviewed — typically within 1–2 business days.
              </p>
            </td></tr></tbody>
          </table>
          <p style="margin:0 0 8px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;">
            If you have any questions in the meantime, feel free to reach out to our wholesale team.
          </p>
        `,
    });
}

export function renderWholesaleApprovedEmail(name: string, loginUrl: string): string {
    return base({
        title: 'Your Wholesale Account Is Approved',
        ctaLabel: 'Log In to Your Wholesale Account',
        ctaHref: loginUrl,
        bodyHtml: `
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#222222;line-height:1.6;">Hi ${name},</p>
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;">
            Great news — your wholesale account application has been <strong style="color:#2a7a2a;">approved</strong>.
            Your account is now active and you have full access to our B2B pricing and wholesale catalog.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tbody><tr><td style="background-color:#f4faf4;border:1px solid #b7dfb7;border-radius:4px;padding:14px 18px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#2a7a2a;line-height:1.7;">
                Your wholesale account is now live. Log in using the button below to start placing orders.
              </p>
            </td></tr></tbody>
          </table>
          <p style="margin:0 0 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;">
            If you have any questions about your account or our wholesale terms, please don't hesitate to contact us.
          </p>
        `,
    });
}

export function renderWholesaleRejectedEmail(name: string): string {
    return base({
        title: 'Your Wholesale Application Update',
        bodyHtml: `
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#222222;line-height:1.6;">Hi ${name},</p>
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;">
            Thank you for applying for a wholesale account with The Hookah Store.
          </p>
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;">
            After reviewing your application, we are unable to approve it at this time.
          </p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tbody><tr><td style="background-color:#fffbf0;border:1px solid #e8d8a0;border-radius:4px;padding:14px 18px;">
              <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#7a6000;line-height:1.7;">
                If you believe this was an error or would like to provide additional information,
                please contact our support team and we will be happy to assist you.
              </p>
            </td></tr></tbody>
          </table>
          <p style="margin:0 0 28px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;">
            Best regards,<br />The Hookah Store Team
          </p>
        `,
    });
}

/* ═══════════════════════════════════════════════════════════════════════════
   Wholesale enquiries + admin alerts (user-supplied values are HTML-escaped)
═══════════════════════════════════════════════════════════════════════════ */

const esc = (v: unknown): string =>
    String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

const P = 'margin:0 0 12px 0;font-family:Arial,Helvetica,sans-serif;font-size:15px;color:#444444;line-height:1.7;';
const TD = 'padding:8px 10px;border-bottom:1px solid #eeeeee;font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333333;';
const TH = 'padding:8px 10px;border-bottom:2px solid #dddddd;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#777777;text-transform:uppercase;text-align:left;';

const inr = (n: number) => `&#8377;${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export interface EnquiryEmailLine {
    name: string;
    option: string | null;
    quantity: number;
    unitPrice: number | null;   // null → price on request
    lineTotal: number | null;
}

export interface EnquiryEmailData {
    reference: string;
    orderNumber: string;
    tier: string;
    customerName: string;
    customerEmail: string;
    businessName: string;
    phone: string;
    gstNumber: string;
    items: EnquiryEmailLine[];
    subtotal: number;
    hasPriceOnRequest: boolean;
    note: string;
}

function detailRows(rows: [string, string][]): string {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px 0;"><tbody>
      ${rows.filter(([, v]) => v).map(([k, v]) => `<tr>
        <td style="${TD}width:38%;color:#777777;">${esc(k)}</td>
        <td style="${TD}font-weight:600;">${esc(v)}</td>
      </tr>`).join('')}
    </tbody></table>`;
}

function itemsTable(d: EnquiryEmailData): string {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px 0;border-collapse:collapse;">
      <thead><tr>
        <th style="${TH}">Item</th><th style="${TH}text-align:right;">Qty</th>
        <th style="${TH}text-align:right;">Unit</th><th style="${TH}text-align:right;">Total</th>
      </tr></thead>
      <tbody>
        ${d.items.map(i => `<tr>
          <td style="${TD}">${esc(i.name)}${i.option ? ` <span style="color:#777777;">(${esc(i.option)})</span>` : ''}</td>
          <td style="${TD}text-align:right;">${i.quantity}</td>
          <td style="${TD}text-align:right;">${i.unitPrice != null ? inr(i.unitPrice) : 'On request'}</td>
          <td style="${TD}text-align:right;">${i.lineTotal != null ? inr(i.lineTotal) : '—'}</td>
        </tr>`).join('')}
        <tr>
          <td colspan="3" style="${TD}text-align:right;font-weight:700;">Subtotal${d.hasPriceOnRequest ? ' (excl. price-on-request items)' : ''}</td>
          <td style="${TD}text-align:right;font-weight:700;">${inr(d.subtotal)}</td>
        </tr>
      </tbody>
    </table>`;
}

/** Sent to the store (site email) when a wholesaler submits an order by email. */
export function renderWholesaleEnquiryAdminEmail(d: EnquiryEmailData, adminOrderUrl: string): string {
    return base({
        title: `New Wholesale Order ${esc(d.reference)}`,
        ctaLabel: 'Open Order in WooCommerce',
        ctaHref: adminOrderUrl,
        bodyHtml: `
          <p style="${P}">A wholesale customer has sent an order enquiry (no online payment). WooCommerce order
            <strong>#${esc(d.orderNumber)}</strong> has been created with status <strong>On hold</strong>.</p>
          ${detailRows([
              ['Reference', d.reference],
              ['Business', d.businessName],
              ['Contact', d.customerName],
              ['Email', d.customerEmail],
              ['Phone', d.phone],
              ['GSTIN', d.gstNumber],
              ['Pricing tier', d.tier],
          ])}
          ${itemsTable(d)}
          ${d.note ? `<p style="${P}"><strong>Customer note:</strong><br />${esc(d.note).replace(/\n/g, '<br />')}</p>` : ''}
        `,
    });
}

/** Confirmation sent to the wholesaler. */
export function renderWholesaleEnquiryCustomerEmail(d: EnquiryEmailData, accountUrl: string): string {
    return base({
        title: 'We Received Your Wholesale Order',
        ctaLabel: 'View My Wholesale Orders',
        ctaHref: accountUrl,
        bodyHtml: `
          <p style="margin:0 0 16px 0;font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#222222;line-height:1.6;">Hi ${esc(d.customerName)},</p>
          <p style="${P}">Thank you for your order. Our wholesale team will confirm availability, final pricing and delivery,
            and contact you shortly. No payment has been taken online.</p>
          ${detailRows([
              ['Reference', d.reference],
              ['Order number', `#${d.orderNumber}`],
              ['Business', d.businessName],
          ])}
          ${itemsTable(d)}
          ${d.hasPriceOnRequest ? `<p style="${P}">Items marked "On request" will be quoted by our team.</p>` : ''}
        `,
    });
}

export interface WholesaleApplicationAdminData {
    name: string;
    email: string;
    businessName: string;
    businessPhone: string;
    businessAddress: string;
    gstNumber: string;
    businessWebsite: string;
    customerId: string;
}

/** Sent to the store when a new wholesale application arrives. */
export function renderWholesaleApplicationAdminEmail(d: WholesaleApplicationAdminData, reviewUrl: string): string {
    return base({
        title: 'New Wholesale Application',
        ctaLabel: 'Review Application',
        ctaHref: reviewUrl,
        bodyHtml: `
          <p style="${P}">A new wholesale account application is waiting for review. Approve it and choose a pricing tier
            in WP Admin → Wholesale → Applications.</p>
          ${detailRows([
              ['Name', d.name],
              ['Email', d.email],
              ['Business', d.businessName],
              ['Phone', d.businessPhone],
              ['Address', d.businessAddress],
              ['GSTIN', d.gstNumber],
              ['Website', d.businessWebsite],
              ['Customer ID', d.customerId],
          ])}
          <p style="${P}">Uploaded documents (GST certificate, licence, ID) are attached to the application in WordPress.</p>
        `,
    });
}
