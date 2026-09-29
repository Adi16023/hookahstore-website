'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface FullOrder {
    id: number;
    number: string;
    status: string;
    total: string;
    currency: string;
    date_created: string;
    payment_method_title: string;
    billing: { first_name: string; last_name: string; email: string; phone: string; address_1: string; address_2: string; city: string; state: string; postcode: string; country: string };
    shipping: { first_name: string; last_name: string; address_1: string; address_2: string; city: string; state: string; postcode: string; country: string };
    line_items: { id: number; name: string; quantity: number; total: string; sku: string }[];
    shipping_lines: { method_title: string; total: string }[];
    meta_data: { key: string; value: unknown }[];
}

const STATUS_OPTIONS = ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded', 'failed'];

function metaValue(meta: FullOrder['meta_data'], key: string) {
    return meta.find(m => m.key === key)?.value as string | undefined;
}

function fmtAddress(a: { address_1: string; address_2: string; city: string; state: string; postcode: string; country: string }) {
    return [a.address_1, a.address_2, a.city, a.state, a.postcode, a.country].filter(Boolean).join(', ');
}

export default function OrderDetailClient({ order }: { order: FullOrder }) {
    const router = useRouter();
    const [status, setStatus] = useState(order.status);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState('');

    const [tracking, setTracking] = useState<{ found: boolean; currentStatus: string; courierName: string; awbCode: string } | null>(null);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [trackingError, setTrackingError] = useState('');

    const razorpayPaymentId = metaValue(order.meta_data, '_razorpay_payment_id');
    const razorpayOrderId = metaValue(order.meta_data, '_razorpay_order_id');

    async function handleStatusSave() {
        setSaving(true);
        setError('');
        setSaved(false);
        try {
            const res = await fetch(`/api/admin/orders/${order.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? 'Failed to update status.');
                setSaving(false);
                return;
            }
            setSaved(true);
            setSaving(false);
            router.refresh();
        } catch {
            setError('Network error.');
            setSaving(false);
        }
    }

    async function checkTracking() {
        setTrackingLoading(true);
        setTrackingError('');
        try {
            const res = await fetch('/api/shiprocket/track', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderNumber: order.number }),
            });
            const data = await res.json();
            if (!res.ok) {
                setTrackingError(data.error ?? 'Could not fetch tracking.');
                setTrackingLoading(false);
                return;
            }
            setTracking(data);
        } catch {
            setTrackingError('Network error.');
        }
        setTrackingLoading(false);
    }

    return (
        <div>
            <a href="/admin/orders" className="admin-back-link">← Back to orders</a>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                <div>
                    <h1 className="admin-h1" style={{ marginBottom: 4 }}>Order #{order.number}</h1>
                    <p className="admin-sub" style={{ marginBottom: 0 }}>{new Date(order.date_created).toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <select className="admin-select" value={status} onChange={e => setStatus(e.target.value)}>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button className="admin-btn admin-btn-accent" onClick={handleStatusSave} disabled={saving || status === order.status}>
                        {saving ? 'Saving…' : 'Update status'}
                    </button>
                </div>
            </div>
            {saved && <div style={{ color: '#027A48', fontSize: 13, marginBottom: 12 }}>Status updated.</div>}
            {error && <div className="admin-error">{error}</div>}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="admin-card">
                    <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 14px' }}>Items</h3>
                    <table className="admin-table" style={{ minWidth: 0 }}>
                        <thead><tr><th>Item</th><th>SKU</th><th>Qty</th><th>Total</th></tr></thead>
                        <tbody>
                            {order.line_items.map(li => (
                                <tr key={li.id}>
                                    <td>{li.name}</td>
                                    <td>{li.sku || '—'}</td>
                                    <td>{li.quantity}</td>
                                    <td>₹{li.total}</td>
                                </tr>
                            ))}
                            {order.shipping_lines?.map((sl, i) => (
                                <tr key={`ship-${i}`}>
                                    <td colSpan={3} style={{ color: '#7a7a85' }}>Shipping — {sl.method_title}</td>
                                    <td>₹{sl.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div style={{ textAlign: 'right', marginTop: 12, fontWeight: 700 }}>Total: ₹{order.total}</div>
                </div>

                <div className="admin-form-grid">
                    <div className="admin-card">
                        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>Billing</h3>
                        <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                            {order.billing.first_name} {order.billing.last_name}<br />
                            {order.billing.email}<br />
                            {order.billing.phone}<br />
                            {fmtAddress(order.billing)}
                        </div>
                    </div>
                    <div className="admin-card">
                        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>Shipping</h3>
                        <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                            {order.shipping.first_name} {order.shipping.last_name}<br />
                            {fmtAddress(order.shipping)}
                        </div>
                    </div>
                </div>

                <div className="admin-form-grid">
                    <div className="admin-card">
                        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>Payment</h3>
                        <div style={{ fontSize: 13.5, lineHeight: 1.9 }}>
                            Method: {order.payment_method_title || '—'}<br />
                            Razorpay payment ID: {razorpayPaymentId || '—'}<br />
                            Razorpay order ID: {razorpayOrderId || '—'}
                        </div>
                    </div>
                    <div className="admin-card">
                        <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 10px' }}>Shipment tracking (Shiprocket)</h3>
                        <button className="admin-btn admin-btn-secondary" onClick={checkTracking} disabled={trackingLoading}>
                            {trackingLoading ? 'Checking…' : 'Check tracking'}
                        </button>
                        {trackingError && <div className="admin-error">{trackingError}</div>}
                        {tracking && (
                            <div style={{ fontSize: 13.5, lineHeight: 1.9, marginTop: 10 }}>
                                {tracking.found ? (
                                    <>
                                        Status: {tracking.currentStatus || '—'}<br />
                                        Courier: {tracking.courierName || '—'}<br />
                                        AWB: {tracking.awbCode || '—'}
                                    </>
                                ) : 'No Shiprocket shipment found for this order yet.'}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
