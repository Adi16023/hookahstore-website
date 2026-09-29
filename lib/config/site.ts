/**
 * lib/config/site.ts
 *
 * Single source of truth for the business's public contact details.
 * Every component that shows a phone number, email, address, GSTIN,
 * company name or social link must import from here — never hardcode.
 */

export const SITE = {
    company: 'Al Dhuvor LLP',
    domain: 'thehookahstore.in',
    foundedYear: 2020,

    phone: {
        display: '+91 98410 00493',
        href: 'tel:+919841000493',
    },

    email: 'support@thehookahstore.in',

    address: 'No. 9/5, Thiruvallur Street, MGR Nagar, Chennai, Tamil Nadu - 600078',
    // Same address split for multi-line display (contact page)
    addressLines: [
        'No. 9/5, Thiruvallur Street',
        'MGR Nagar, Chennai',
        'Tamil Nadu - 600078',
    ],

    gstin: '33ABRFA4433F1ZL',

    // TODO: confirm with client — free-shipping threshold in ₹ (placeholder;
    // used in the footer, homepage marquee and product pages).
    freeShippingThreshold: 999,

    // TODO: confirm with client — kept the old Mon–Fri 10–6 hours, switched EST → IST
    supportHours: 'Monday to Friday, 10:00 AM - 6:00 PM IST',

    social: {
        instagram: 'https://www.instagram.com/INSTAGRAM_HANDLE_HERE/',
        // Leave empty to hide the YouTube icon everywhere
        youtube: '',
    },

    whatsapp: {
        number: '919841000493',
        href: 'https://wa.me/919841000493',
    },
} as const;

export const mailtoHref = (subject?: string) =>
    `mailto:${SITE.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

/** Footer legal lines — shared by the main footer and the blog footer. */
export const LEGAL_LINES = [
    `© ${SITE.foundedYear} ${SITE.domain} (A unit of ${SITE.company}). All Rights Reserved.`,
    SITE.address,
    `GSTIN: ${SITE.gstin} | Tel: ${SITE.phone.display}`,
] as const;

/** "₹999" — formatted free-shipping threshold */
export const FREE_SHIPPING_TEXT = `₹${SITE.freeShippingThreshold.toLocaleString('en-IN')}`;
