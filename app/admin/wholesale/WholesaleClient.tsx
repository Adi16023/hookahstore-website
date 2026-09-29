'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export interface WcCustomer {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    date_created: string;
    meta_data?: { key: string; value: unknown }[];
}

function metaValue(meta: WcCustomer['meta_data'], key: string): string {
    const entry = meta?.find(m => m.key === key);
    return entry ? String(entry.value ?? '') : '';
}

export default function WholesaleClient({
    initialPending, initialApproved,
}: { initialPending: WcCustomer[]; initialApproved: WcCustomer[] }) {
    const router = useRouter();
    const [pending, setPending] = useState(initialPending);
    const [busyId, setBusyId] = useState<number | null>(null);
    const [error, setError] = useState('');

    async function handleDecision(customer: WcCustomer, decision: 'approve' | 'reject') {
        setBusyId(customer.id);
        setError('');
        try {
            const res = await fetch(`/api/admin/wholesale/${decision}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: customer.id,
                    email: customer.email,
                    name: customer.first_name || customer.email,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error ?? `Failed to ${decision} application.`);
                setBusyId(null);
                return;
            }
            setPending(prev => prev.filter(c => c.id !== customer.id));
            router.refresh();
        } catch {
            setError('Network error.');
        }
        setBusyId(null);
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {error && <div className="admin-error">{error}</div>}

            <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Pending applications ({pending.length})</h3>
                <div className="admin-table-wrap">
                    {pending.length === 0 ? (
                        <div className="admin-empty">No pending applications.</div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr><th>Name</th><th>Email</th><th>Business</th><th>GST</th><th>Documents</th><th>Applied</th><th></th></tr>
                            </thead>
                            <tbody>
                                {pending.map(c => {
                                    const businessName = metaValue(c.meta_data, 'business_name');
                                    const gstNumber = metaValue(c.meta_data, 'gst_number');
                                    const gstDoc = metaValue(c.meta_data, 'gst_certificate_url');
                                    const licenseDoc = metaValue(c.meta_data, 'business_license_url');
                                    return (
                                        <tr key={c.id}>
                                            <td>{c.first_name} {c.last_name}</td>
                                            <td>{c.email}</td>
                                            <td>{businessName || '—'}</td>
                                            <td>{gstNumber || '—'}</td>
                                            <td style={{ display: 'flex', gap: 8 }}>
                                                {gstDoc && <a href={gstDoc} target="_blank" rel="noreferrer" className="admin-badge admin-badge-gray">GST doc</a>}
                                                {licenseDoc && <a href={licenseDoc} target="_blank" rel="noreferrer" className="admin-badge admin-badge-gray">License</a>}
                                                {!gstDoc && !licenseDoc && '—'}
                                            </td>
                                            <td>{new Date(c.date_created).toLocaleDateString()}</td>
                                            <td style={{ display: 'flex', gap: 8 }}>
                                                <button className="admin-btn admin-btn-accent" disabled={busyId === c.id} onClick={() => handleDecision(c, 'approve')}>Approve</button>
                                                <button className="admin-btn admin-btn-danger" disabled={busyId === c.id} onClick={() => handleDecision(c, 'reject')}>Reject</button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 12px' }}>Approved wholesale customers ({initialApproved.length})</h3>
                <div className="admin-table-wrap">
                    {initialApproved.length === 0 ? (
                        <div className="admin-empty">No approved wholesale customers yet.</div>
                    ) : (
                        <table className="admin-table">
                            <thead><tr><th>Name</th><th>Email</th><th>Business</th><th>GST</th><th>Since</th></tr></thead>
                            <tbody>
                                {initialApproved.map(c => (
                                    <tr key={c.id}>
                                        <td>{c.first_name} {c.last_name}</td>
                                        <td>{c.email}</td>
                                        <td>{metaValue(c.meta_data, 'business_name') || '—'}</td>
                                        <td>{metaValue(c.meta_data, 'gst_number') || '—'}</td>
                                        <td>{new Date(c.date_created).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
