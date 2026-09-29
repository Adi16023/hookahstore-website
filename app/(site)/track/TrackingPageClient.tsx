'use client';

import { useState } from 'react';
import { useTheme } from '../../../components/providers/ThemeProvider';
import type { ShiprocketTrackingResult, TrackingActivity } from '../../../lib/shiprocket';

const RED = '#D32F2F';
const M = "var(--font-montserrat), sans-serif";

function makeColors(dark: boolean) {
    return dark ? {
        pageBg: '#121212',
        cardBg: '#1e1e1e',
        cardBorder: 'rgba(255,255,255,0.10)',
        heading: '#ffffff',
        body: 'rgba(255,255,255,0.65)',
        meta: 'rgba(255,255,255,0.45)',
        inputBg: 'rgba(255,255,255,0.05)',
        inputBorder: 'rgba(255,255,255,0.22)',
        inputText: '#ffffff',
        divider: 'rgba(255,255,255,0.10)',
        timelineLine: 'rgba(255,255,255,0.12)',
        badgeBg: 'rgba(255,255,255,0.08)',
    } : {
        pageBg: '#f6f5f8',
        cardBg: '#ffffff',
        cardBorder: '#ebebed',
        heading: '#000000',
        body: '#4c4e52',
        meta: '#6c6d73',
        inputBg: '#ffffff',
        inputBorder: '#d7d8db',
        inputText: '#1b1c1f',
        divider: '#ebebed',
        timelineLine: '#e0e0e0',
        badgeBg: '#f6f5f8',
    };
}

function statusColor(status: string): { bg: string; text: string } {
    const s = status.toLowerCase();
    if (s.includes('deliver')) return { bg: '#dcfce7', text: '#15803d' };
    if (s.includes('out for')) return { bg: '#dbeafe', text: '#1d4ed8' };
    if (s.includes('transit') || s.includes('dispatch') || s.includes('pickup')) return { bg: '#fef9c3', text: '#a16207' };
    if (s.includes('cancel') || s.includes('rto') || s.includes('return')) return { bg: '#fee2e2', text: '#b91c1c' };
    return { bg: '#f3f4f6', text: '#374151' };
}

function StatusBadge({ status }: { status: string }) {
    const { bg, text } = statusColor(status);
    return (
        <span style={{ backgroundColor: bg, color: text, fontFamily: M, fontWeight: 600, fontSize: 12, padding: '4px 12px', borderRadius: 9999, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            {status}
        </span>
    );
}

function ActivityRow({ activity, isLast }: { activity: TrackingActivity; isLast: boolean }) {
    const { bg, text } = statusColor(activity.status || activity.activity);
    return (
        <div style={{ display: 'flex', gap: 16, position: 'relative' }}>
            {/* Timeline dot + line */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{ width: 12, height: 12, borderRadius: 9999, backgroundColor: text, flexShrink: 0, marginTop: 4 }} />
                {!isLast && <div style={{ width: 2, flex: 1, backgroundColor: '#e0e0e0', marginTop: 4 }} />}
            </div>
            {/* Content */}
            <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
                <p style={{ fontFamily: M, fontWeight: 600, fontSize: 13, color: text, margin: '0 0 2px' }}>
                    {activity.activity || activity.status}
                </p>
                {activity.location && (
                    <p style={{ fontFamily: M, fontWeight: 400, fontSize: 12, color: '#6c6d73', margin: '0 0 2px' }}>
                        {activity.location}
                    </p>
                )}
                <p style={{ fontFamily: M, fontWeight: 400, fontSize: 11, color: '#9ca3af', margin: 0 }}>
                    {activity.date}
                </p>
            </div>
        </div>
    );
}

export default function TrackingPageClient() {
    const { dark } = useTheme();
    const c = makeColors(dark);

    const [orderNumber, setOrderNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<ShiprocketTrackingResult | null>(null);

    const handleTrack = async () => {
        const num = orderNumber.trim().replace(/^#/, '');
        if (!num) { setError('Please enter your order number.'); return; }
        setError('');
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch('/api/shiprocket/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderNumber: num }),
            });
            const data = await res.json() as ShiprocketTrackingResult & { error?: string };
            if (!res.ok || data.error) { setError(data.error || 'Could not fetch tracking info.'); return; }
            if (!data.found) { setError('No order found with that number. Please check and try again.'); return; }
            setResult(data);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: c.pageBg, minHeight: '100vh', position: 'relative', zIndex: 10, transition: 'background-color 200ms' }}>
            <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px 80px' }}>

                {/* Header */}
                <div style={{ marginBottom: 40 }}>
                    <h1 style={{ fontFamily: M, fontWeight: 700, fontSize: 28, color: c.heading, margin: '0 0 8px', letterSpacing: '-0.5px', transition: 'color 200ms' }}>
                        Track Your Order
                    </h1>
                    <p style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.body, margin: 0, lineHeight: '22px', transition: 'color 200ms' }}>
                        Enter your order number from your confirmation email to get live shipping updates.
                    </p>
                </div>

                {/* Search card */}
                <div style={{ backgroundColor: c.cardBg, borderRadius: 12, padding: 24, border: `1px solid ${c.cardBorder}`, marginBottom: 24, transition: 'background-color 200ms, border-color 200ms' }}>
                    <label style={{ fontFamily: M, fontWeight: 500, fontSize: 14, color: c.heading, display: 'block', marginBottom: 8, transition: 'color 200ms' }}>
                        Order Number
                    </label>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <input
                            type="text"
                            placeholder="e.g. 1234"
                            value={orderNumber}
                            onChange={e => { setOrderNumber(e.target.value); if (error) setError(''); }}
                            onKeyDown={e => e.key === 'Enter' && handleTrack()}
                            style={{
                                flex: 1, height: 48, borderRadius: 8, outline: 'none', boxSizing: 'border-box',
                                border: `1px solid ${error ? '#b61c11' : c.inputBorder}`,
                                padding: '0 16px', backgroundColor: c.inputBg,
                                fontFamily: M, fontWeight: 400, fontSize: 14, color: c.inputText,
                                transition: 'background-color 200ms, border-color 200ms, color 200ms',
                            }}
                        />
                        <button
                            onClick={handleTrack}
                            disabled={loading}
                            style={{
                                backgroundColor: loading ? '#9c9ea3' : RED,
                                borderRadius: 8, height: 48, padding: '0 24px',
                                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                                fontFamily: M, fontWeight: 600, fontSize: 14, color: 'white',
                                letterSpacing: '0.5px', flexShrink: 0, transition: 'background-color 200ms',
                            }}
                        >
                            {loading ? 'Searching…' : 'Track'}
                        </button>
                    </div>
                    {error && (
                        <p style={{ fontFamily: M, fontSize: 13, color: '#b61c11', margin: '8px 0 0' }}>{error}</p>
                    )}
                </div>

                {/* Results */}
                {result && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

                        {/* Status summary */}
                        <div style={{ backgroundColor: c.cardBg, borderRadius: 12, padding: 24, border: `1px solid ${c.cardBorder}`, transition: 'background-color 200ms, border-color 200ms' }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 20 }}>
                                <div>
                                    <p style={{ fontFamily: M, fontWeight: 400, fontSize: 12, color: c.meta, margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 200ms' }}>
                                        Current Status
                                    </p>
                                    <StatusBadge status={result.currentStatus || 'Order Placed'} />
                                </div>
                                {result.edd && (
                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontFamily: M, fontWeight: 400, fontSize: 12, color: c.meta, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 200ms' }}>
                                            Expected Delivery
                                        </p>
                                        <p style={{ fontFamily: M, fontWeight: 600, fontSize: 14, color: c.heading, margin: 0, transition: 'color 200ms' }}>
                                            {result.edd}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                {result.courierName && (
                                    <div style={{ backgroundColor: c.badgeBg, borderRadius: 8, padding: '12px 16px', transition: 'background-color 200ms' }}>
                                        <p style={{ fontFamily: M, fontWeight: 400, fontSize: 11, color: c.meta, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 200ms' }}>Courier</p>
                                        <p style={{ fontFamily: M, fontWeight: 600, fontSize: 13, color: c.heading, margin: 0, transition: 'color 200ms' }}>{result.courierName}</p>
                                    </div>
                                )}
                                {result.awbCode && (
                                    <div style={{ backgroundColor: c.badgeBg, borderRadius: 8, padding: '12px 16px', transition: 'background-color 200ms' }}>
                                        <p style={{ fontFamily: M, fontWeight: 400, fontSize: 11, color: c.meta, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 200ms' }}>AWB / Tracking No.</p>
                                        <p style={{ fontFamily: M, fontWeight: 600, fontSize: 13, color: c.heading, margin: 0, transition: 'color 200ms' }}>{result.awbCode}</p>
                                    </div>
                                )}
                                {result.origin && (
                                    <div style={{ backgroundColor: c.badgeBg, borderRadius: 8, padding: '12px 16px', transition: 'background-color 200ms' }}>
                                        <p style={{ fontFamily: M, fontWeight: 400, fontSize: 11, color: c.meta, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 200ms' }}>Origin</p>
                                        <p style={{ fontFamily: M, fontWeight: 600, fontSize: 13, color: c.heading, margin: 0, transition: 'color 200ms' }}>{result.origin}</p>
                                    </div>
                                )}
                                {result.destination && (
                                    <div style={{ backgroundColor: c.badgeBg, borderRadius: 8, padding: '12px 16px', transition: 'background-color 200ms' }}>
                                        <p style={{ fontFamily: M, fontWeight: 400, fontSize: 11, color: c.meta, margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 200ms' }}>Destination</p>
                                        <p style={{ fontFamily: M, fontWeight: 600, fontSize: 13, color: c.heading, margin: 0, transition: 'color 200ms' }}>{result.destination}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Timeline */}
                        {result.activities.length > 0 && (
                            <div style={{ backgroundColor: c.cardBg, borderRadius: 12, padding: 24, border: `1px solid ${c.cardBorder}`, transition: 'background-color 200ms, border-color 200ms' }}>
                                <h2 style={{ fontFamily: M, fontWeight: 600, fontSize: 15, color: c.heading, margin: '0 0 20px', letterSpacing: '0.5px', transition: 'color 200ms' }}>
                                    Shipment Timeline
                                </h2>
                                {result.activities.map((a, i) => (
                                    <ActivityRow key={i} activity={a} isLast={i === result.activities.length - 1} />
                                ))}
                            </div>
                        )}

                        {/* No activities yet */}
                        {result.activities.length === 0 && (
                            <div style={{ backgroundColor: c.cardBg, borderRadius: 12, padding: 24, border: `1px solid ${c.cardBorder}`, textAlign: 'center', transition: 'background-color 200ms, border-color 200ms' }}>
                                <p style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.body, margin: 0, transition: 'color 200ms' }}>
                                    Your shipment has been created. Tracking updates will appear here once the courier picks it up.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
