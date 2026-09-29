'use client';
export const runtime = 'edge';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '../../../components/providers/ThemeProvider';

const M = "var(--font-montserrat), sans-serif";
const RED = '#D32F2F';

export interface OrderReceipt {
    orderId: number;
    orderNumber: string;
    paymentId: string;
    dateCreated: string;
    email: string;
    items: { name: string; size: string | null; quantity: number; price: string; image: string; }[];
    billing: { firstName: string; lastName: string; address1: string; address2: string; city: string; state: string; country: string; phone: string; };
    subtotal: number;
    shippingCost: number;
    discountAmount?: number;
    couponCode?: string | null;
    total: number;
    shippingMethodLabel: string;
}

function fmt(v: number) { return `₹${v.toFixed(2)}`; }

function formatDate(iso: string) {
    try {
        return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return iso; }
}

export default function OrderReceivedPage() {
    const { dark } = useTheme();
    const router = useRouter();
    const [receipt, setReceipt] = useState<OrderReceipt | null>(null);

    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('hookah_order_receipt');
            if (!raw) { router.replace('/'); return; }
            setReceipt(JSON.parse(raw) as OrderReceipt);
        } catch {
            router.replace('/');
        }
    }, [router]);

    if (!receipt) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: dark ? '#111' : '#f6f5f8' }}>
                <p style={{ fontFamily: M, color: dark ? '#fff' : '#333', fontSize: 16 }}>Loading your order…</p>
            </div>
        );
    }

    const c = dark ? {
        bg: '#111113', card: '#1a1a1d', border: 'rgba(255,255,255,0.10)', heading: '#ffffff',
        body: 'rgba(255,255,255,0.70)', meta: 'rgba(255,255,255,0.50)', divider: 'rgba(255,255,255,0.10)',
        label: 'rgba(255,255,255,0.50)', imgBg: '#2a2a2d',
    } : {
        bg: '#f6f5f8', card: '#ffffff', border: '#ebebed', heading: '#1b1c1f',
        body: '#4c4e52', meta: '#6c6d73', divider: '#ebebed',
        label: '#6c6d73', imgBg: '#f0f0f0',
    };

    const billingLines = [
        receipt.billing.firstName + ' ' + receipt.billing.lastName,
        receipt.billing.address1 + (receipt.billing.address2 ? ', ' + receipt.billing.address2 : ''),
        `${receipt.billing.city}${receipt.billing.state ? ', ' + receipt.billing.state : ''} ${receipt.billing.country}`,
    ].filter(Boolean);

    return (
        <div style={{ backgroundColor: c.bg, minHeight: '100vh', padding: '48px 16px 80px', transition: 'background-color 200ms' }}>
            <div style={{ maxWidth: 1100, margin: '0 auto' }}>

                {/* Header – check icon + thank you */}
                <div style={{ textAlign: 'center', marginBottom: 48 }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <svg width="30" height="24" viewBox="0 0 30 24" fill="none">
                            <path d="M2 12L11 21L28 2" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <h1 style={{ fontFamily: M, fontWeight: 700, fontSize: 'clamp(28px, 4vw, 40px)', color: c.heading, margin: '0 0 12px', lineHeight: 1.2, transition: 'color 200ms' }}>
                        Thank you for your purchase!
                    </h1>
                    <p style={{ fontFamily: M, fontWeight: 400, fontSize: 15, color: c.body, margin: '0 0 4px', lineHeight: '24px', transition: 'color 200ms' }}>
                        Your order <strong style={{ color: c.heading }}>#{receipt.orderNumber}</strong> has been placed successfully.
                    </p>
                    <p style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.meta, margin: 0, transition: 'color 200ms' }}>
                        A confirmation email has been sent to <strong style={{ color: c.body }}>{receipt.email}</strong>
                    </p>
                </div>

                {/* Two-column layout */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'start' }}>

                    {/* LEFT — Billing + info */}
                    <div style={{ backgroundColor: c.card, borderRadius: 12, padding: 32, border: `1px solid ${c.border}`, transition: 'background-color 200ms, border-color 200ms' }}>
                        <p style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.body, lineHeight: '22px', margin: '0 0 32px', transition: 'color 200ms' }}>
                            Your order will be processed within 24 hours during working days. We will notify you by email once your order has been shipped.
                        </p>

                        <h2 style={{ fontFamily: M, fontWeight: 700, fontSize: 18, color: c.heading, margin: '0 0 20px', transition: 'color 200ms' }}>Billing address</h2>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {[
                                    ['Name', receipt.billing.firstName + ' ' + receipt.billing.lastName],
                                    ['Address', billingLines.slice(1).join('\n')],
                                    ['Phone', receipt.billing.phone],
                                    ['Email', receipt.email],
                                ].map(([k, v]) => (
                                    <tr key={k} style={{ verticalAlign: 'top' }}>
                                        <td style={{ fontFamily: M, fontWeight: 600, fontSize: 14, color: c.label, paddingBottom: 14, paddingRight: 24, whiteSpace: 'nowrap', width: 80, transition: 'color 200ms' }}>{k}</td>
                                        <td style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.heading, paddingBottom: 14, lineHeight: '22px', whiteSpace: 'pre-line', transition: 'color 200ms' }}>{v}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ marginTop: 8 }}>
                            <Link
                                href={`/account/orders`}
                                style={{ display: 'inline-block', backgroundColor: RED, borderRadius: 98, padding: '12px 32px', fontFamily: M, fontWeight: 600, fontSize: 14, color: 'white', textDecoration: 'none', letterSpacing: '0.5px', transition: 'opacity 200ms' }}
                            >
                                Track Your Order
                            </Link>
                        </div>
                    </div>

                    {/* RIGHT — Order Summary */}
                    <div style={{ backgroundColor: c.card, borderRadius: 12, border: `1px solid ${c.border}`, overflow: 'hidden', transition: 'background-color 200ms, border-color 200ms' }}>
                        <div style={{ padding: '24px 24px 16px', borderBottom: `1px solid ${c.divider}` }}>
                            <h2 style={{ fontFamily: M, fontWeight: 700, fontSize: 18, color: c.heading, margin: 0, transition: 'color 200ms' }}>Order Summary</h2>
                        </div>

                        {/* Meta row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '16px 24px', borderBottom: `1px solid ${c.divider}` }}>
                            {[
                                ['Date', formatDate(receipt.dateCreated)],
                                ['Order Number', receipt.orderNumber],
                                ['Payment', 'Razorpay'],
                            ].map(([k, v]) => (
                                <div key={k}>
                                    <p style={{ fontFamily: M, fontWeight: 400, fontSize: 11, color: c.meta, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.5px', transition: 'color 200ms' }}>{k}</p>
                                    <p style={{ fontFamily: M, fontWeight: 600, fontSize: 13, color: c.heading, margin: 0, transition: 'color 200ms' }}>{v}</p>
                                </div>
                            ))}
                        </div>

                        {/* Items */}
                        <div style={{ padding: '0 24px' }}>
                            {receipt.items.map((item, i) => (
                                <div key={i} style={{ display: 'flex', gap: 14, padding: '16px 0', borderBottom: `1px solid ${c.divider}`, alignItems: 'flex-start' }}>
                                    <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 6, overflow: 'hidden', position: 'relative', backgroundColor: c.imgBg }}>
                                        {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontFamily: M, fontWeight: 600, fontSize: 13, color: c.heading, margin: '0 0 4px', lineHeight: '18px', transition: 'color 200ms' }}>{item.name}</p>
                                        {item.size && <p style={{ fontFamily: M, fontSize: 12, color: c.meta, margin: '0 0 2px', transition: 'color 200ms' }}>Pack: {item.size}</p>}
                                        <p style={{ fontFamily: M, fontSize: 12, color: c.meta, margin: 0, transition: 'color 200ms' }}>Qty: {item.quantity}</p>
                                    </div>
                                    <p style={{ fontFamily: M, fontWeight: 600, fontSize: 13, color: c.heading, margin: 0, flexShrink: 0, transition: 'color 200ms' }}>{item.price}</p>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        <div style={{ padding: '16px 24px' }}>
                            {[
                                ['Sub Total', fmt(receipt.subtotal), false],
                                ...(receipt.discountAmount && receipt.discountAmount > 0
                                    ? [[`Coupon${receipt.couponCode ? ` (${receipt.couponCode})` : ''}`, `-${fmt(receipt.discountAmount)}`, false]] as [string, string, boolean][]
                                    : []),
                                ['Shipping', receipt.shippingCost === 0 ? 'FREE' : fmt(receipt.shippingCost), false],
                                ['Tax', 'To be calculated', false],
                            ].map(([k, v]) => (
                                <div key={k as string} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <span style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: (k as string).startsWith('Coupon') ? '#22c55e' : c.body, transition: 'color 200ms' }}>{k}</span>
                                    <span style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: (k as string).startsWith('Coupon') ? '#22c55e' : c.meta, transition: 'color 200ms' }}>{v}</span>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 14, borderTop: `1px solid ${c.divider}`, marginTop: 4 }}>
                                <span style={{ fontFamily: M, fontWeight: 700, fontSize: 16, color: c.heading, transition: 'color 200ms' }}>Order Total</span>
                                <span style={{ fontFamily: M, fontWeight: 700, fontSize: 16, color: c.heading, transition: 'color 200ms' }}>{fmt(receipt.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back to shop */}
                <div style={{ textAlign: 'center', marginTop: 40 }}>
                    <Link href="/" style={{ fontFamily: M, fontWeight: 500, fontSize: 14, color: RED, textDecoration: 'underline' }}>
                        ← Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}
