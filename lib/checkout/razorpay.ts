/**
 * Razorpay REST helpers (server-side, edge-safe).
 * FAIL CLOSED: without RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET nothing is
 * created or verified.
 */

const API = 'https://api.razorpay.com/v1';

export function razorpayCreds(): { keyId: string; keySecret: string } | null {
    const keyId = process.env.RAZORPAY_KEY_ID ?? '';
    const keySecret = process.env.RAZORPAY_KEY_SECRET ?? '';
    if (!keyId || !keySecret) {
        console.error('[razorpay] RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not set — payments are disabled (fail closed).');
        return null;
    }
    return { keyId, keySecret };
}

async function rz<T>(path: string, init: RequestInit = {}): Promise<T> {
    const creds = razorpayCreds();
    if (!creds) throw new Error('Razorpay is not configured');
    const res = await fetch(`${API}${path}`, {
        ...init,
        headers: { Authorization: `Basic ${btoa(`${creds.keyId}:${creds.keySecret}`)}`, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
    });
    const data = await res.json().catch(() => ({})) as T & { error?: { description?: string } };
    if (!res.ok) throw new Error(`Razorpay ${path} failed: ${data.error?.description ?? `HTTP ${res.status}`}`);
    return data;
}

export interface RazorpayOrder { id: string; amount: number; amount_paid: number; currency: string; status: string; notes: Record<string, string> }
export interface RazorpayPayment { id: string; order_id: string; amount: number; currency: string; status: string }

export const createRazorpayOrder = (amountPaise: number, notes: Record<string, string>) =>
    rz<RazorpayOrder>('/orders', {
        method: 'POST',
        body: JSON.stringify({ amount: amountPaise, currency: 'INR', receipt: `rcpt_${Date.now()}`, notes }),
    });

export const fetchRazorpayOrder = (id: string) => rz<RazorpayOrder>(`/orders/${encodeURIComponent(id)}`);
export const fetchRazorpayPayment = (id: string) => rz<RazorpayPayment>(`/payments/${encodeURIComponent(id)}`);

/** HMAC-SHA256 hex (Web Crypto) + constant-time compare of the checkout signature. */
export async function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string, keySecret: string): Promise<boolean> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(keySecret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, enc.encode(`${orderId}|${paymentId}`)));
    const expected = Array.from(sig).map(b => b.toString(16).padStart(2, '0')).join('');
    if (typeof signature !== 'string' || signature.length !== expected.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    return diff === 0;
}
