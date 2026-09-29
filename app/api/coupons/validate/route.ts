export const runtime = 'edge';
import { NextRequest, NextResponse } from 'next/server';

const WC_BASE = process.env.WOOCOMMERCE_URL;
const WC_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const WC_SEC = process.env.WOOCOMMERCE_CONSUMER_SECRET;

export async function POST(req: NextRequest) {
    try {
        const { code, subtotal } = (await req.json()) as { code?: string; subtotal?: number };

        if (!code || !code.trim()) {
            return NextResponse.json({ error: 'Please enter a coupon code.' }, { status: 400 });
        }

        const creds = btoa(`${WC_KEY}:${WC_SEC}`);
        const url = `${WC_BASE}/wp-json/wc/v3/coupons?code=${encodeURIComponent(code.trim().toUpperCase())}`;

        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${creds}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            return NextResponse.json({ error: 'Could not verify coupon. Please try again.' }, { status: 500 });
        }

        const coupons = await res.json() as Array<{
            id: number;
            code: string;
            discount_type: string;
            amount: string;
            minimum_amount: string;
            maximum_amount: string;
            usage_limit: number | null;
            usage_count: number;
            date_expires: string | null;
            free_shipping: boolean;
        }>;

        if (!Array.isArray(coupons) || coupons.length === 0) {
            return NextResponse.json({ error: 'Invalid coupon code. Please check and try again.' }, { status: 404 });
        }

        const coupon = coupons[0];

        // Check expiry
        if (coupon.date_expires) {
            const expiry = new Date(coupon.date_expires);
            if (expiry < new Date()) {
                return NextResponse.json({ error: 'This coupon has expired.' }, { status: 400 });
            }
        }

        // Check usage limit
        if (coupon.usage_limit !== null && coupon.usage_count >= coupon.usage_limit) {
            return NextResponse.json({ error: 'This coupon has reached its usage limit.' }, { status: 400 });
        }

        // Check minimum amount
        const minAmount = parseFloat(coupon.minimum_amount || '0');
        if (subtotal !== undefined && minAmount > 0 && subtotal < minAmount) {
            return NextResponse.json({
                error: `This coupon requires a minimum order of ₹${minAmount.toFixed(2)}.`,
            }, { status: 400 });
        }

        // Calculate discount
        let discountAmount = 0;
        if (coupon.discount_type === 'percent') {
            discountAmount = Math.round(((subtotal ?? 0) * parseFloat(coupon.amount)) / 100 * 100) / 100;
        } else if (coupon.discount_type === 'fixed_cart' || coupon.discount_type === 'fixed_product') {
            discountAmount = parseFloat(coupon.amount);
        }

        return NextResponse.json({
            valid: true,
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discountType: coupon.discount_type,
                amount: coupon.amount,
                freeShipping: coupon.free_shipping,
                discountAmount,
            },
        });
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[validate-coupon]', msg);
        return NextResponse.json({ error: 'Unexpected error validating coupon.' }, { status: 500 });
    }
}
