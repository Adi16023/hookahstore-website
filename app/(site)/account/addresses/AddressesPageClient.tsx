'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../../../components/providers/ThemeProvider';
import { useAuth } from '../../../../components/providers/AuthProvider';
import AccountSidebar from '../../../../components/account/AccountSidebar';

type AddressData = {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    phone: string;
    email?: string;
};

const EMPTY: AddressData = {
    first_name: '', last_name: '', company: '',
    address_1: '', address_2: '', city: '',
    state: '', postcode: '', country: 'IN', phone: '', email: '',
};

type AddressType = 'billing' | 'shipping';

function formatAddress(a: AddressData): string {
    const parts = [
        [a.first_name, a.last_name].filter(Boolean).join(' '),
        a.company,
        a.address_1,
        a.address_2,
        [a.city, a.state, a.postcode].filter(Boolean).join(', '),
        a.country,
    ].filter(Boolean);
    return parts.join('\n');
}

function isEmpty(a: AddressData): boolean {
    return !a.address_1 && !a.city;
}

const FIELD_CONFIG = [
    { key: 'first_name', label: 'First Name', half: true },
    { key: 'last_name',  label: 'Last Name',  half: true },
    { key: 'company',    label: 'Company (optional)', half: false },
    { key: 'address_1',  label: 'Address Line 1', half: false },
    { key: 'address_2',  label: 'Address Line 2 (optional)', half: false },
    { key: 'city',       label: 'City',       half: true },
    { key: 'state',      label: 'State',      half: true },
    { key: 'postcode',   label: 'Postcode',   half: true },
    { key: 'country',    label: 'Country',    half: true },
    { key: 'phone',      label: 'Phone',      half: false },
] as const;

const BILLING_ONLY = { key: 'email', label: 'Email', half: false } as const;

export default function AddressesPageClient() {
    const { dark } = useTheme();
    const { role } = useAuth();
    const router = useRouter();

    const [billing, setBilling] = useState<AddressData>(EMPTY);
    const [shipping, setShipping] = useState<AddressData>(EMPTY);
    const [editType, setEditType] = useState<AddressType | null>(null);
    const [form, setForm] = useState<AddressData>(EMPTY);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        if (role === 'not_approved') router.replace('/login');
    }, [role, router]);

    useEffect(() => {
        fetch('/api/account/addresses', { credentials: 'include' })
            .then(r => r.json())
            .then(d => {
                setBilling({ ...EMPTY, ...d.billing });
                setShipping({ ...EMPTY, ...d.shipping });
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    function openEdit(type: AddressType) {
        setForm(type === 'billing' ? { ...billing } : { ...shipping });
        setEditType(type);
        setSaveError('');
    }

    async function handleSave() {
        if (!editType) return;
        setSaving(true);
        setSaveError('');
        try {
            const body = editType === 'billing' ? { billing: form } : { shipping: form };
            const res = await fetch('/api/account/addresses', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error('save failed');
            const data = await res.json();
            setBilling({ ...EMPTY, ...data.billing });
            setShipping({ ...EMPTY, ...data.shipping });
            setEditType(null);
        } catch {
            setSaveError('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    /* ── Colors ── */
    const pageBg      = dark ? '#121212' : '#ffffff';
    const headingCol  = dark ? '#ffffff'  : '#000000';
    const metaCol     = dark ? 'rgba(255,255,255,0.55)' : '#4c4e52';
    const cardBorder  = dark ? 'rgba(255,255,255,0.12)' : '#d7d8db';
    const inputBg     = dark ? '#1e1e1e'  : '#f6f5f8';
    const inputBorder = dark ? 'rgba(255,255,255,0.15)' : '#d7d8db';
    const inputText   = dark ? '#ffffff'  : '#101114';
    const labelCol    = dark ? 'rgba(255,255,255,0.65)' : '#4c4e52';
    const overlayBg   = dark ? 'rgba(0,0,0,0.70)' : 'rgba(0,0,0,0.40)';
    const modalBg     = dark ? '#1e1e1e'  : '#ffffff';
    const modalBorder = dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb';
    const btnSecBg    = dark ? 'rgba(255,255,255,0.08)' : '#f0f0f0';
    const btnSecText  = dark ? '#ffffff'  : '#101114';

    const sidebarProps = {
        iconStroke:         dark ? 'rgba(255,255,255,0.75)' : '#1B1C1F',
        labelColor:         dark ? 'rgba(255,255,255,0.85)' : '#1b1c1f',
        sidebarBorderRight: dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb',
        sectionBorder:      dark ? 'rgba(255,255,255,0.10)' : '#d7d8db',
    };

    const inputStyle = (half = false): React.CSSProperties => ({
        width: '100%', boxSizing: 'border-box',
        backgroundColor: inputBg, border: `1px solid ${inputBorder}`,
        borderRadius: '6px', color: inputText,
        fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '14px',
        padding: '10px 14px', outline: 'none',
        gridColumn: half ? 'span 1' : 'span 2',
    });

    function AddressCard({ type, data }: { type: AddressType; data: AddressData }) {
        return (
            <div style={{ border: `1px solid ${cardBorder}`, borderRadius: '8px', padding: '24px', flex: 1, minWidth: 260, transition: 'border-color 200ms' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '16px', color: headingCol, margin: 0 }}>
                        {type === 'billing' ? 'Billing Address' : 'Shipping Address'}
                    </p>
                    <button
                        onClick={() => openEdit(type)}
                        style={{
                            background: 'none', border: `1px solid ${cardBorder}`, borderRadius: '6px',
                            padding: '6px 14px', cursor: 'pointer',
                            fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '12px',
                            color: '#CD142C', letterSpacing: '0.5px',
                        }}
                    >
                        {isEmpty(data) ? 'ADD' : 'EDIT'}
                    </button>
                </div>
                {isEmpty(data) ? (
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: '14px', color: metaCol, margin: 0 }}>
                        No address saved.
                    </p>
                ) : (
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: '14px', color: metaCol, margin: 0, whiteSpace: 'pre-line', lineHeight: '1.7' }}>
                        {formatAddress(data)}
                        {type === 'billing' && data.phone && `\n${data.phone}`}
                    </p>
                )}
            </div>
        );
    }

    function EditModal() {
        if (!editType) return null;
        const isBilling = editType === 'billing';
        const fields = isBilling ? [...FIELD_CONFIG, BILLING_ONLY] : FIELD_CONFIG;

        return (
            <div
                style={{ position: 'fixed', inset: 0, zIndex: 100, backgroundColor: overlayBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
                onClick={e => { if (e.target === e.currentTarget) setEditType(null); }}
            >
                <div style={{ backgroundColor: modalBg, border: `1px solid ${modalBorder}`, borderRadius: '12px', width: '100%', maxWidth: '580px', maxHeight: '90vh', overflowY: 'auto', padding: '32px', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h2 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: '18px', color: headingCol, margin: 0 }}>
                            {isBilling ? 'Edit Billing Address' : 'Edit Shipping Address'}
                        </h2>
                        <button onClick={() => setEditType(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', color: metaCol, lineHeight: 1, padding: '4px' }}>✕</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        {fields.map(f => (
                            <div key={f.key} style={{ gridColumn: f.half ? 'span 1' : 'span 2', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <label style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: '12px', fontWeight: 600, color: labelCol, letterSpacing: '0.3px' }}>
                                    {f.label}
                                </label>
                                <input
                                    value={form[f.key as keyof AddressData] ?? ''}
                                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                                    style={inputStyle(f.half)}
                                    placeholder={f.label}
                                />
                            </div>
                        ))}
                    </div>

                    {saveError && (
                        <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: '13px', color: '#CD142C', marginTop: '16px', marginBottom: 0 }}>
                            {saveError}
                        </p>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '28px', justifyContent: 'flex-end' }}>
                        <button
                            onClick={() => setEditType(null)}
                            style={{ padding: '10px 24px', borderRadius: '6px', border: 'none', cursor: 'pointer', backgroundColor: btnSecBg, color: btnSecText, fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '13px' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            style={{ padding: '10px 28px', borderRadius: '6px', border: 'none', cursor: saving ? 'not-allowed' : 'pointer', backgroundColor: '#CD142C', color: '#ffffff', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: '13px', opacity: saving ? 0.7 : 1 }}
                        >
                            {saving ? 'Saving…' : 'Save Address'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', width: '100%', transition: 'background-color 200ms' }}>
            {/* Desktop ≥1280px */}
            <div className="hidden min-[1280px]:flex min-h-screen">
                <AccountSidebar active="addresses" variant="desktop" {...sidebarProps} />
                <PageContent />
            </div>

            {/* Tablet 768–1279px */}
            <div className="hidden min-[768px]:flex min-[1280px]:hidden min-h-screen">
                <AccountSidebar active="addresses" variant="tablet" {...sidebarProps} />
                <PageContent />
            </div>

            {/* Mobile ≤767px */}
            <div className="flex flex-col min-h-screen min-[768px]:hidden">
                <PageContent mobile />
            </div>

            <EditModal />
        </div>
    );

    function PageContent({ mobile = false }: { mobile?: boolean }) {
        return (
            <div style={{ flex: 1, padding: mobile ? '24px 16px 40px' : '48px 48px 80px' }}>
                <h1 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: mobile ? '28px' : '40px', color: headingCol, margin: '0 0 32px', lineHeight: 1.2 }}>
                    ADDRESSES
                </h1>

                {loading ? (
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: '14px', color: metaCol }}>Loading…</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: '20px', flexWrap: 'wrap' }}>
                        <AddressCard type="shipping" data={shipping} />
                        <AddressCard type="billing" data={billing} />
                    </div>
                )}
            </div>
        );
    }
}
