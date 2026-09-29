'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../../components/providers/ThemeProvider';
import { WholesaleAccountShell, SessionData } from '../WholesaleAccountClient';
import { useWholesaleHref } from '../../../../lib/config/use-wholesale-path';
import { formatInr } from '../../../../lib/wholesale/use-wholesale-prices';

type Order = {
    id: number;
    number: string;
    status: string;
    date: string;
    total: number;
    reference: string | null;
    isEnquiry: boolean;
    items: { name: string; quantity: number }[];
};

const STATUS_LABEL: Record<string, string> = {
    'on-hold': 'Awaiting confirmation',
    pending: 'Pending',
    processing: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    failed: 'Failed',
};

export default function WholesaleOrdersClient({ session }: { session: SessionData }) {
    const { dark } = useTheme();
    const href = useWholesaleHref();
    const textPrim    = dark ? '#ffffff' : '#000000';
    const textMuted   = dark ? 'rgba(255,255,255,0.45)' : '#6c6d73';
    const cardBorder  = dark ? 'rgba(255,255,255,0.12)' : '#d7d8db';
    const pagePad     = '48px 32px 80px';
    const M = "var(--font-montserrat), sans-serif";

    const [orders, setOrders] = useState<Order[] | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/wholesale/orders', { cache: 'no-store' })
            .then(async r => {
                const data = await r.json() as { orders?: Order[]; error?: string };
                if (!r.ok) throw new Error(data.error ?? 'Could not load your orders.');
                setOrders(data.orders ?? []);
            })
            .catch(e => { setError(e instanceof Error ? e.message : 'Could not load your orders.'); setOrders([]); });
    }, []);

    const statusColor = (s: string) =>
        s === 'completed' || s === 'processing' ? (dark ? '#4caf50' : '#2e7d32')
            : s === 'cancelled' || s === 'failed' ? '#D32F2F'
            : (dark ? '#fbbf24' : '#92400e');

    return (
        <WholesaleAccountShell session={session}>
            <div style={{ flex: 1, padding: pagePad }}>
                <h1 style={{ fontFamily: M, fontWeight: 600, fontSize: '40px', lineHeight: '54px', color: textPrim, margin: '4px 0 24px', transition: 'color 200ms' }}>
                    WHOLESALE ORDERS
                </h1>

                <h2 style={{ fontFamily: M, fontWeight: 600, fontSize: '16px', lineHeight: '24px', color: textPrim, margin: '0 0 16px', transition: 'color 200ms' }}>
                    Order History
                </h2>

                {orders === null ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
                        {[1, 2].map(i => <div key={i} style={{ height: 96, borderRadius: 8, border: `1px solid ${cardBorder}`, background: dark ? 'rgba(255,255,255,0.03)' : '#f6f5f8', animation: 'pulse 1.4s ease-in-out infinite' }} />)}
                    </div>
                ) : orders.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 720 }}>
                        {orders.map(o => (
                            <div key={o.id} style={{ border: `1px solid ${cardBorder}`, borderRadius: 8, padding: '16px 20px', fontFamily: M, transition: 'border-color 200ms' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: textPrim }}>
                                            Order #{o.number}{o.reference ? <span style={{ fontWeight: 500, color: textMuted }}> · {o.reference}</span> : null}
                                        </p>
                                        <p style={{ margin: '2px 0 0', fontSize: 13, color: textMuted }}>
                                            {new Date(o.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            {o.isEnquiry ? ' · Sent by email' : ''}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: statusColor(o.status) }}>
                                            {STATUS_LABEL[o.status] ?? o.status}
                                        </p>
                                        <p style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 700, color: textPrim }}>{formatInr(o.total)}</p>
                                    </div>
                                </div>
                                <p style={{ margin: 0, fontSize: 13, color: textMuted, lineHeight: '20px' }}>
                                    {o.items.map(i => `${i.name} × ${i.quantity}`).join(' · ')}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ border: `1px solid ${cardBorder}`, borderRadius: '8px', padding: '40px 24px', textAlign: 'center', maxWidth: '600px', transition: 'border-color 200ms' }}>
                        <svg width="48" height="48" viewBox="0 0 20 21" fill="none" style={{ margin: '0 auto 16px', display: 'block', opacity: 0.3 }}>
                            <clipPath id="woc2"><rect fill="white" height="21" width="20" /></clipPath>
                            <g clipPath="url(#woc2)">
                                <path d="M3.75487 3.78882H17.5292C18.4475 3.78882 19.2857 4.20421 18.9066 7.25584C18.4475 9.33605 17.8791 12.8031 15.4631 12.8031H4.44359L3.06615 2.40201C2.83658 1.70861 2.40659 0.877828 1 1.0152" stroke={textPrim} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
                                <path d="M4.5166 12.8594C4.5166 13.5248 5.78253 16.1866 8.03307 16.1866H15.7693" stroke={textPrim} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
                            </g>
                        </svg>
                        <p style={{ fontFamily: M, fontWeight: 600, fontSize: '16px', color: textPrim, margin: '0 0 8px', transition: 'color 200ms' }}>
                            {error ? 'Could not load your orders' : 'No wholesale orders yet'}
                        </p>
                        <p style={{ fontFamily: M, fontWeight: 400, fontSize: '14px', lineHeight: '22px', color: textMuted, margin: '0 0 16px', transition: 'color 200ms' }}>
                            {error || 'Once you send an order from your cart it will appear here.'}
                        </p>
                        <Link href={href('/category/hookahs')} style={{ fontFamily: M, fontSize: 14, fontWeight: 600, color: '#D32F2F', textDecoration: 'underline' }}>
                            Browse the catalog
                        </Link>
                    </div>
                )}
            </div>
        </WholesaleAccountShell>
    );
}
