/**
 * Wholesale order reference, e.g. "WS-260926-7K3Q".
 * Generated in the browser when the cart page opens so the same reference
 * appears in the WhatsApp message and the emailed order. Shared by client + server.
 */

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I

export const ENQUIRY_REF_PATTERN = /^WS-\d{6}-[A-Z0-9]{4}$/;

export function newEnquiryRef(now: Date = new Date()): string {
    const yymmdd = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const bytes = new Uint8Array(4);
    crypto.getRandomValues(bytes);
    const suffix = Array.from(bytes, b => ALPHABET[b % ALPHABET.length]).join('');
    return `WS-${yymmdd}-${suffix}`;
}

export const isValidEnquiryRef = (ref: unknown): ref is string =>
    typeof ref === 'string' && ENQUIRY_REF_PATTERN.test(ref);
