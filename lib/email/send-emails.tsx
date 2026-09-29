/**
 * High-level email sending functions — Turbopack-safe.
 * Uses pure HTML string renderers (no react-dom/server).
 * Server-side only.
 */
import { resend, FROM_EMAIL, REPLY_TO } from './resend-client';
import {
    renderWelcomeEmail,
    renderVerificationEmail,
    renderPasswordResetEmail,
    renderPasswordResetSuccessEmail,
    renderWholesaleApplicationEmail,
    renderWholesaleApprovedEmail,
    renderWholesaleRejectedEmail,
    renderWholesaleEnquiryAdminEmail,
    renderWholesaleEnquiryCustomerEmail,
    renderWholesaleApplicationAdminEmail,
    type EnquiryEmailData,
    type WholesaleApplicationAdminData,
} from './render-email';
import { SITE } from '../config/site';


export async function sendWelcomeEmail({
    firstName, email, loginUrl,
}: { firstName: string; email: string; loginUrl: string }) {
    await resend.emails.send({
        from: FROM_EMAIL, replyTo: REPLY_TO, to: email,
        subject: 'Welcome to The Hookah Store',
        html: renderWelcomeEmail(firstName, loginUrl),
    });
}

export async function sendVerificationEmail({
    firstName, email, verificationUrl,
}: { firstName: string; email: string; verificationUrl: string }) {
    await resend.emails.send({
        from: FROM_EMAIL, replyTo: REPLY_TO, to: email,
        subject: 'Verify your email — The Hookah Store',
        html: renderVerificationEmail(firstName, verificationUrl),
    });
}

export async function sendPasswordResetEmail({
    firstName, email, resetUrl,
}: { firstName: string; email: string; resetUrl: string }) {
    await resend.emails.send({
        from: FROM_EMAIL, replyTo: REPLY_TO, to: email,
        subject: 'Reset Your Password – The Hookah Store',
        html: renderPasswordResetEmail(firstName, resetUrl),
    });
}

export async function sendPasswordResetSuccessEmail({
    firstName, email,
}: { firstName: string; email: string }) {
    await resend.emails.send({
        from: FROM_EMAIL, replyTo: REPLY_TO, to: email,
        subject: 'Your Password Has Been Updated – The Hookah Store',
        html: renderPasswordResetSuccessEmail(firstName),
    });
}

export async function sendWholesaleApplicationEmail({
    name, businessName, email,
}: { name: string; businessName: string; email: string }) {
    await resend.emails.send({
        from: FROM_EMAIL, replyTo: REPLY_TO, to: email,
        subject: 'Your Wholesale Application Has Been Received – The Hookah Store',
        html: renderWholesaleApplicationEmail(name, businessName),
    });
}

export async function sendWholesaleApprovedEmail({
    name, email, loginUrl,
}: { name: string; email: string; loginUrl: string }) {
    await resend.emails.send({
        from: FROM_EMAIL, replyTo: REPLY_TO, to: email,
        subject: 'Your Wholesale Account Has Been Approved – The Hookah Store',
        html: renderWholesaleApprovedEmail(name, loginUrl),
    });
}

export async function sendWholesaleRejectedEmail({
    name, email,
}: { name: string; email: string }) {
    await resend.emails.send({
        from: FROM_EMAIL, replyTo: REPLY_TO, to: email,
        subject: 'Your Wholesale Application Update – The Hookah Store',
        html: renderWholesaleRejectedEmail(name),
    });
}

/* ── Store (admin) notifications go to the site email ── */
export const ADMIN_EMAIL = SITE.email;

export async function sendWholesaleApplicationAdminAlert(data: WholesaleApplicationAdminData, reviewUrl: string) {
    await resend.emails.send({
        from: FROM_EMAIL, replyTo: data.email || REPLY_TO, to: ADMIN_EMAIL,
        subject: `New wholesale application – ${data.businessName || data.name}`,
        html: renderWholesaleApplicationAdminEmail(data, reviewUrl),
    });
}

export async function sendWholesaleEnquiryAdminEmail(data: EnquiryEmailData, adminOrderUrl: string) {
    await resend.emails.send({
        from: FROM_EMAIL, replyTo: data.customerEmail || REPLY_TO, to: ADMIN_EMAIL,
        subject: `Wholesale order ${data.reference} – ${data.businessName || data.customerName}`,
        html: renderWholesaleEnquiryAdminEmail(data, adminOrderUrl),
    });
}

export async function sendWholesaleEnquiryCustomerEmail(data: EnquiryEmailData, accountUrl: string) {
    await resend.emails.send({
        from: FROM_EMAIL, replyTo: ADMIN_EMAIL, to: data.customerEmail,
        subject: `We received your wholesale order ${data.reference} – The Hookah Store`,
        html: renderWholesaleEnquiryCustomerEmail(data, accountUrl),
    });
}
