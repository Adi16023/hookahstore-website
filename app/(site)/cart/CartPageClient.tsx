'use client';
// Brand constants
const RED = '#D32F2F';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../../../components/providers/CartProvider';
import { useTheme } from '../../../components/providers/ThemeProvider';
import { useAuth } from '../../../components/providers/AuthProvider';
import { readStoredDob, storeDob, isoToDisplay, displayToIso, isOfAge, MIN_AGE } from '../../../lib/utils/dob';

type UserState = 'guest' | 'existing' | 'new';

const INACTIVE_STEPS = ['Shipping', 'Shipping Methods', 'Age Verification'];
const M = "var(--font-montserrat), sans-serif";

/* ─── Theme tokens ───────────────────────────────────────────────────────── */
interface C {
    pageBg: string;
    cardBg: string;
    cardBorder: string;
    heading: string;
    body: string;
    meta: string;
    subtle: string;
    inputBg: string;
    selectBg: string;
    inputBorder: string;
    inputText: string;
    inputFilledBg: string;
    inactiveStep: string;
    divider: string;
    removeBtn: string;
    qtyBg: string;
    mobileToggleBg: string;
    mobileToggleText: string;
    benefitsBg: string;
    termsText: string;
    checkboxBorder: string;
    totalLabel: string;
    totalValue: string;
    tbc: string;
}

function makeColors(dark: boolean): C {
    return dark ? {
        pageBg: '#121212',
        cardBg: '#1e1e1e',
        cardBorder: 'rgba(255,255,255,0.10)',
        heading: '#ffffff',
        body: 'rgba(255,255,255,0.65)',
        meta: 'rgba(255,255,255,0.50)',
        subtle: 'rgba(255,255,255,0.35)',
        inputBg: 'rgba(255,255,255,0.05)',
        selectBg: '#1e1e1e',
        inputBorder: 'rgba(255,255,255,0.22)',
        inputText: '#ffffff',
        inputFilledBg: 'rgba(100,130,255,0.15)',
        inactiveStep: 'rgba(255,255,255,0.30)',
        divider: 'rgba(255,255,255,0.10)',
        removeBtn: 'rgba(255,255,255,0.60)',
        qtyBg: 'rgba(255,255,255,0.08)',
        mobileToggleBg: '#1e1e1e',
        mobileToggleText: '#ffffff',
        benefitsBg: 'rgba(255,255,255,0.06)',
        termsText: 'rgba(255,255,255,0.40)',
        checkboxBorder: 'rgba(255,255,255,0.22)',
        totalLabel: 'rgba(255,255,255,0.85)',
        totalValue: '#ffffff',
        tbc: 'rgba(255,255,255,0.40)',
    } : {
        pageBg: '#f6f5f8',
        cardBg: '#ffffff',
        cardBorder: '#ebebed',
        heading: '#000000',
        body: '#4c4e52',
        meta: '#4c4e52',
        subtle: '#6c6d73',
        inputBg: '#ffffff',
        selectBg: '#ffffff',
        inputBorder: '#6c6d73',
        inputText: '#1b1c1f',
        inputFilledBg: '#e8f0fe',
        inactiveStep: '#9c9ea3',
        divider: '#ebebed',
        removeBtn: '#35363b',
        qtyBg: '#f6f5f8',
        mobileToggleBg: '#ffffff',
        mobileToggleText: '#1b1c1f',
        benefitsBg: '#f6f5f8',
        termsText: '#6c6d73',
        checkboxBorder: '#d7d8db',
        totalLabel: '#1b1c1f',
        totalValue: '#101114',
        tbc: '#6c6d73',
    };
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */
function EyeIcon({ c }: { c: C }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={c.subtle} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" stroke={c.subtle} strokeWidth="1.5" />
        </svg>
    );
}
function ChevronDown({ open, c }: { open: boolean; c: C }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
            <path d="M7 10L12 14.58L17 10" stroke={c.mobileToggleText} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function MinusIcon({ disabled }: { disabled: boolean }) {
    return (
        <svg width="14" height="2" viewBox="0 0 14 2" fill="none">
            <path d="M12.333 1L1.667 1" stroke={disabled ? '#D7D8DB' : '#35363B'} strokeLinecap="round" strokeWidth="1.4" />
        </svg>
    );
}
function PlusIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1V13M1 7H13" stroke="#35363B" strokeLinecap="round" strokeWidth="1.4" />
        </svg>
    );
}

/* ─── Primitives ─────────────────────────────────────────────────────────── */
function Label({ text, required, c }: { text: string; required?: boolean; c: C }) {
    return (
        <div style={{ marginBottom: 8 }}>
            <span style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.heading, transition: 'color 200ms' }}>{text}</span>
            {required && <span style={{ color: '#b61c11', marginLeft: 4, fontSize: 12 }}>*</span>}
        </div>
    );
}
function Input({ placeholder, type = 'text', value, onChange, filled, suffix, c }: {
    placeholder: string; type?: string; value?: string;
    onChange?: (v: string) => void; filled?: boolean;
    suffix?: React.ReactNode; c: C;
}) {
    return (
        <div style={{ position: 'relative' }}>
            <input
                type={type} placeholder={placeholder} value={value}
                onChange={e => onChange?.(e.target.value)}
                style={{
                    width: '100%', height: 56, borderRadius: 8, outline: 'none', boxSizing: 'border-box',
                    border: `1px solid ${c.inputBorder}`, padding: suffix ? '0 48px 0 16px' : '0 16px',
                    backgroundColor: filled ? c.inputFilledBg : c.inputBg,
                    fontFamily: M, fontWeight: 400, fontSize: 14, color: c.inputText,
                    transition: 'background-color 200ms, border-color 200ms, color 200ms',
                }}
            />
            {suffix && (
                <div style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', display: 'flex' }}>
                    {suffix}
                </div>
            )}
        </div>
    );
}

function InactiveStep({ label, mobile, c }: { label: string; mobile?: boolean; c: C }) {
    return (
        <div style={{ backgroundColor: c.cardBg, borderRadius: 8, height: mobile ? 84 : 88, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 200ms' }}>
            <span style={{ fontFamily: M, fontWeight: 600, fontSize: mobile ? 14 : 16, color: c.inactiveStep, textTransform: 'capitalize', letterSpacing: '0.96px', transition: 'color 200ms' }}>
                {label}
            </span>
        </div>
    );
}

/* ─── Order Summary Panel ────────────────────────────────────────────────── */
function OrderSummaryPanel({ cart, removeFromCart, updateQuantity, subtotal, c,
    couponCode, setCouponCode, couponDiscount, couponApplied, couponLoading,
    couponError, promoOpen, setPromoOpen, onApplyCoupon, onRemoveCoupon }: any) {
    const fmt = (v: number) => `₹${v.toFixed(2)}`;
    const discountedTotal = Math.max(0, subtotal - (couponDiscount || 0));
    return (
        <div style={{ backgroundColor: c.cardBg, borderRadius: 8, padding: 24, transition: 'background-color 200ms' }}>
            <div style={{ borderBottom: `1px solid ${c.divider}`, paddingBottom: 16 }}>
                <h2 style={{ fontFamily: M, fontWeight: 600, fontSize: 16, color: c.heading, letterSpacing: '0.96px', margin: 0, textTransform: 'capitalize', transition: 'color 200ms' }}>
                    Order Summary
                </h2>
            </div>

            {/* Items */}
            <div style={{ maxHeight: 333, overflowY: 'auto' }}>
                {cart.length === 0 ? (
                    <p style={{ fontFamily: M, fontSize: 14, color: c.subtle, margin: '24px 0' }}>Your cart is empty.</p>
                ) : cart.map((item: any, idx: number) => (
                    <div key={`${item.productId}-${item.variationId}`}>
                        {idx > 0 && <div style={{ height: 1, backgroundColor: c.divider, margin: '16px 0' }} />}
                        <div style={{ display: 'flex', gap: 12, paddingTop: idx === 0 ? 24 : 0 }}>
                            <div style={{ width: 64, height: 64, flexShrink: 0, borderRadius: 4, overflow: 'hidden', position: 'relative', backgroundColor: c.qtyBg }}>
                                {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontFamily: M, fontWeight: 600, fontSize: 14, color: c.heading, flex: 1, marginRight: 8, lineHeight: '20px', transition: 'color 200ms' }}>{item.name}</span>
                                    <span style={{ fontFamily: M, fontWeight: 600, fontSize: 14, color: c.heading, whiteSpace: 'nowrap', transition: 'color 200ms' }}>{item.price}</span>
                                </div>
                                {item.size && <p style={{ fontFamily: M, fontWeight: 500, fontSize: 12, color: c.meta, margin: '0 0 8px', transition: 'color 200ms' }}>{item.size}</p>}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <button onClick={() => removeFromCart(item.productId, item.variationId)}
                                        style={{ fontFamily: M, fontWeight: 500, fontSize: 14, color: c.removeBtn, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 200ms' }}>
                                        Remove
                                    </button>
                                    <div style={{ display: 'flex', alignItems: 'center', border: `1px solid ${c.cardBorder}`, borderRadius: 9999, height: 42, width: 130, position: 'relative', transition: 'border-color 200ms' }}>
                                        <button onClick={() => item.quantity > 1 && updateQuantity(item.productId, item.variationId, item.quantity - 1)}
                                            style={{ position: 'absolute', left: 14, background: 'none', border: 'none', cursor: item.quantity <= 1 ? 'default' : 'pointer', display: 'flex', padding: 0 }}>
                                            <MinusIcon disabled={item.quantity <= 1} />
                                        </button>
                                        <div style={{ position: 'absolute', left: 44, right: 44, top: 5, bottom: 5, backgroundColor: c.qtyBg, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 200ms' }}>
                                            <span style={{ fontFamily: M, fontWeight: 600, fontSize: 14, color: c.heading, transition: 'color 200ms' }}>{item.quantity}</span>
                                        </div>
                                        <button onClick={() => updateQuantity(item.productId, item.variationId, item.quantity + 1)}
                                            style={{ position: 'absolute', right: 14, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}>
                                            <PlusIcon />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div style={{ borderTop: `1px solid ${c.divider}`, paddingTop: 24, marginTop: 16, transition: 'border-color 200ms' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.totalLabel, transition: 'color 200ms' }}>Subtotal</span>
                    <span style={{ fontFamily: M, fontWeight: 600, fontSize: 14, color: c.totalValue, transition: 'color 200ms' }}>{fmt(subtotal)}</span>
                </div>
                {couponApplied && couponDiscount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <span style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: '#22c55e' }}>
                            Coupon ({couponApplied})
                            <button onClick={onRemoveCoupon} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: c.removeBtn, fontSize: 11, textDecoration: 'underline', padding: 0, fontFamily: M }}>Remove</button>
                        </span>
                        <span style={{ fontFamily: M, fontWeight: 600, fontSize: 14, color: '#22c55e' }}>-{fmt(couponDiscount)}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.totalLabel, transition: 'color 200ms' }}>Shipping</span>
                    <span style={{ fontFamily: M, fontWeight: 400, fontSize: 12, color: c.tbc, transition: 'color 200ms' }}>To be calculated</span>
                </div>

                {/* Promo code inline box */}
                <div style={{ borderTop: `1px solid ${c.divider}`, borderBottom: `1px solid ${c.divider}`, padding: '17px 0', marginBottom: 4, transition: 'border-color 200ms' }}>
                    {!couponApplied ? (
                        <>
                            <button
                                onClick={() => setPromoOpen((v: boolean) => !v)}
                                style={{ fontFamily: M, fontWeight: 500, fontSize: 14, color: RED, textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                            >
                                Got a Promo Code?
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style={{ transform: promoOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
                                    <path d="M7 10L12 15L17 10" stroke={RED} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            {promoOpen && (
                                <div style={{ marginTop: 14 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <input
                                            type="text"
                                            placeholder="Enter promo code"
                                            value={couponCode}
                                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') onApplyCoupon(); }}
                                            style={{
                                                flex: 1, height: 48, borderRadius: 24,
                                                border: `1.5px solid ${c.inputBorder}`,
                                                padding: '0 18px', backgroundColor: c.inputBg,
                                                fontFamily: M, fontWeight: 400, fontSize: 14,
                                                color: c.inputText, outline: 'none',
                                                boxSizing: 'border-box', letterSpacing: '0.5px',
                                            }}
                                        />
                                        <button
                                            onClick={onApplyCoupon}
                                            disabled={couponLoading || !couponCode.trim()}
                                            style={{
                                                fontFamily: M, fontWeight: 700, fontSize: 13,
                                                color: couponLoading || !couponCode.trim() ? c.subtle : RED,
                                                background: 'none', border: 'none',
                                                cursor: couponLoading || !couponCode.trim() ? 'default' : 'pointer',
                                                padding: '0 4px', letterSpacing: '1px',
                                                textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0,
                                            }}
                                        >
                                            {couponLoading ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                    {couponError && (
                                        <p style={{ fontFamily: M, fontSize: 12, color: '#b61c11', margin: '8px 0 0' }}>{couponError}</p>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="12" fill="#22c55e" />
                                <path d="M6 12L10 16L18 8" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span style={{ fontFamily: M, fontWeight: 600, fontSize: 13, color: '#22c55e' }}>
                                Code <strong>{couponApplied}</strong> applied!
                            </span>
                            <button onClick={onRemoveCoupon} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: c.removeBtn, fontSize: 12, textDecoration: 'underline', padding: 0, fontFamily: M }}>Remove</button>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0' }}>
                    <span style={{ fontFamily: M, fontWeight: 600, fontSize: 18, color: c.totalLabel, transition: 'color 200ms' }}>Total</span>
                    <span style={{ fontFamily: M, fontWeight: 600, fontSize: 18, color: c.totalValue, transition: 'color 200ms' }}>{fmt(discountedTotal)}</span>
                </div>
            </div>
        </div>
    );
}

/* ─── Step cards ─────────────────────────────────────────────────────────── */
function GuestCard({ email, setEmail, onSetExisting, onSetNew, onContinueAsGuest, c }: {
    email: string;
    setEmail: (v: string) => void;
    onSetExisting: () => void;
    onSetNew: () => void;
    onContinueAsGuest: () => void;
    c: C;
}) {
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

    const handleContinue = async () => {
        if (!isValidEmail(email)) { setEmailError('Please enter a valid email address.'); return; }
        setEmailError('');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });
            const data = await res.json() as { exists: boolean };
            if (data.exists) onSetExisting(); else onSetNew();
        } catch {
            onSetNew(); // fail open — let user register or guest
        } finally {
            setLoading(false);
        }
    };

    const handleGuest = () => {
        if (!isValidEmail(email)) { setEmailError('Please enter a valid email address to continue as guest.'); return; }
        setEmailError('');
        onContinueAsGuest();
    };

    return (
        <div style={{ backgroundColor: c.cardBg, borderRadius: 8, padding: 24, transition: 'background-color 200ms' }}>
            <h2 style={{ fontFamily: M, fontWeight: 600, fontSize: 16, color: c.heading, letterSpacing: '0.96px', margin: '0 0 16px', transition: 'color 200ms' }}>
                Log in, Create Account or Guest Checkout
            </h2>
            <p style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.body, lineHeight: '20px', margin: '0 0 24px', transition: 'color 200ms' }}>
                Enter your Email to login to your account. If you don't have one yet you can register in the next step. Alternatively you can checkout as a guest.
            </p>
            <Label text="Email" required c={c} />
            <div style={{ position: 'relative' }}>
                <input
                    type="email" placeholder="Email" value={email}
                    onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(''); }}
                    style={{
                        width: '100%', height: 56, borderRadius: 8, outline: 'none', boxSizing: 'border-box',
                        border: `1px solid ${emailError ? '#b61c11' : c.inputBorder}`, padding: '0 16px',
                        backgroundColor: c.inputBg, fontFamily: M, fontWeight: 400, fontSize: 14, color: c.inputText,
                        transition: 'background-color 200ms, border-color 200ms, color 200ms',
                    }}
                />
            </div>
            {emailError && <p style={{ fontFamily: M, fontSize: 12, color: '#b61c11', margin: '6px 0 0' }}>{emailError}</p>}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, flexWrap: 'wrap', gap: 12 }}>
                <button onClick={handleContinue} disabled={loading}
                    style={{ backgroundColor: loading ? '#9c9ea3' : RED, borderRadius: 98, height: 40, padding: '0 32px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: M, fontWeight: 600, fontSize: 14, color: 'white', letterSpacing: '1px', textTransform: 'uppercase' }}>
                    {loading ? 'Checking…' : 'Continue'}
                </button>
                <button onClick={handleGuest} disabled={loading} style={{ background: 'none', border: `1px solid ${c.cardBorder}`, borderRadius: 98, padding: '8px 20px', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: M, fontWeight: 500, fontSize: 14, color: c.body, transition: 'border-color 200ms, color 200ms' }}>
                    Continue as Guest
                </button>
            </div>
        </div>
    );
}

function ExistingUserCard({ email, onBack, onSuccess, c }: {
    email: string;
    onBack: () => void;
    onSuccess: () => void;
    c: C;
}) {
    const [showPw, setShowPw] = useState(false);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!password) { setError('Password is required.'); return; }
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json() as { error?: string };
            if (!res.ok) { setError(data.error || 'Login failed. Please try again.'); return; }
            onSuccess();
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: c.cardBg, borderRadius: 8, padding: 24, transition: 'background-color 200ms' }}>
            <h2 style={{ fontFamily: M, fontWeight: 600, fontSize: 16, color: c.heading, letterSpacing: '0.96px', margin: '0 0 16px', transition: 'color 200ms' }}>Log in</h2>
            <p style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.body, lineHeight: '20px', margin: '0 0 20px', transition: 'color 200ms' }}>
                You found an account associated with this email address. Please log in to continue or continue as a guest.
            </p>
            <div style={{ marginBottom: 16 }}>
                <Label text="Email" required c={c} />
                <Input type="email" placeholder="Email" value={email} filled c={c} />
            </div>
            <div style={{ marginBottom: 16 }}>
                <Label text="Password" required c={c} />
                <Input type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={setPassword} c={c}
                    suffix={<button type="button" onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}><EyeIcon c={c} /></button>} />
            </div>
            {error && <p style={{ fontFamily: M, fontSize: 13, color: '#b61c11', margin: '-8px 0 12px' }}>{error}</p>}
            <Link href="/forgot-password" style={{ fontFamily: M, fontWeight: 500, fontSize: 14, color: RED, textDecoration: 'underline', display: 'block', marginBottom: 20 }}>
                Forgot Your Password?
            </Link>
            <button onClick={handleLogin} disabled={loading} style={{ width: '100%', backgroundColor: loading ? '#9c9ea3' : RED, borderRadius: 98, height: 40, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: M, fontWeight: 600, fontSize: 16, color: 'white', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
                {loading ? 'Logging in…' : 'Login'}
            </button>
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: M, fontWeight: 500, fontSize: 14, color: c.body, textDecoration: 'underline', transition: 'color 200ms' }}>
                ← Continue as Guest
            </button>
        </div>
    );
}

function NewUserCard({ email, onBack, onSuccess, onContinueAsGuest, c }: {
    email: string;
    onBack: () => void;
    onSuccess: () => void;
    onContinueAsGuest: () => void;
    c: C;
}) {
    const [showPw, setShowPw] = useState(false);
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [marketingOptIn, setMarketingOptIn] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, firstName, lastName, marketingOptIn, ...(readStoredDob() ? { dob: readStoredDob() } : {}) }),
            });
            const data = await res.json() as { error?: string };
            if (!res.ok) { setError(data.error || 'Registration failed. Please try again.'); return; }
            onSuccess();
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: c.cardBg, borderRadius: 8, padding: 24, transition: 'background-color 200ms' }}>
            <h2 style={{ fontFamily: M, fontWeight: 600, fontSize: 16, color: c.heading, letterSpacing: '0.96px', margin: '0 0 16px', transition: 'color 200ms' }}>Create Account</h2>
            <p style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.body, lineHeight: '20px', margin: '0 0 20px', transition: 'color 200ms' }}>
                You don't have an account associated with this email address. You can register now or continue as guest.
            </p>
            <div style={{ marginBottom: 16 }}>
                <Label text="Email" required c={c} />
                <Input type="email" placeholder="Email" value={email} filled c={c} />
            </div>
            <div style={{ marginBottom: 8 }}>
                <Label text="Password" required c={c} />
                <Input type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={setPassword} c={c}
                    suffix={<button type="button" onClick={() => setShowPw(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}><EyeIcon c={c} /></button>} />
            </div>
            <p style={{ fontFamily: M, fontWeight: 400, fontSize: 13, color: c.subtle, lineHeight: '20px', margin: '0 0 16px', transition: 'color 200ms' }}>
                Passwords must be longer than 7 characters and include a special character and uppercase letter.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div><Label text="First Name" required c={c} /><Input placeholder="First Name" value={firstName} onChange={setFirstName} c={c} /></div>
                <div><Label text="Last Name" required c={c} /><Input placeholder="Last Name" value={lastName} onChange={setLastName} c={c} /></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 20 }}>
                <input type="checkbox" checked={marketingOptIn} onChange={e => setMarketingOptIn(e.target.checked)} style={{ marginTop: 3, width: 20, height: 20, flexShrink: 0, cursor: 'pointer', accentColor: '#471169' }} />
                <p style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.heading, lineHeight: '20px', margin: 0, transition: 'color 200ms' }}>
                    Yes, keep me up to date on news and exclusive offers of Hookah products including tobacco
                </p>
            </div>
            <div style={{ backgroundColor: c.benefitsBg, borderRadius: 12, padding: 16, marginBottom: 16, transition: 'background-color 200ms' }}>
                <h3 style={{ fontFamily: M, fontWeight: 600, fontSize: 16, color: c.heading, margin: '0 0 12px', transition: 'color 200ms' }}>Account Creation Benefits</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                    {['Fast, secure and convenient checkout', 'New product alerts + Expert tips', 'Loyalty and referral programs', 'Expert customer service'].map(b => (
                        <div key={b} style={{ display: 'flex', gap: 6 }}>
                            <span style={{ color: c.heading, lineHeight: '20px', transition: 'color 200ms' }}>•</span>
                            <span style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.heading, lineHeight: '20px', transition: 'color 200ms' }}>{b}</span>
                        </div>
                    ))}
                </div>
            </div>
            <p style={{ fontFamily: M, fontWeight: 400, fontSize: 12, color: c.termsText, textAlign: 'center', lineHeight: '18px', margin: '0 0 16px', transition: 'color 200ms' }}>
                By creating an account, I agree to the{' '}
                <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" style={{ color: c.termsText, textDecoration: 'underline' }}>Terms and Conditions</a>
                {', and '}
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: c.termsText, textDecoration: 'underline' }}>Privacy Policy</a>
                {' and I certify that I am at least 21 years of age.'}
            </p>
            {error && <p style={{ fontFamily: M, fontSize: 13, color: '#b61c11', margin: '0 0 12px', textAlign: 'center' }}>{error}</p>}
            <button onClick={handleRegister} disabled={loading} style={{ width: '100%', backgroundColor: loading ? '#9c9ea3' : RED, borderRadius: 98, height: 40, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: M, fontWeight: 600, fontSize: 16, color: 'white', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 12 }}>
                {loading ? 'Creating Account…' : 'Create Account'}
            </button>
            <button onClick={onContinueAsGuest} disabled={loading} style={{ width: '100%', backgroundColor: 'transparent', border: `1px solid ${c.cardBorder}`, borderRadius: 98, height: 40, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: M, fontWeight: 600, fontSize: 14, color: c.heading, letterSpacing: '1px', textTransform: 'uppercase', transition: 'border-color 200ms, color 200ms' }}>
                Continue as Guest
            </button>
        </div>
    );
}

/* ─── Completed step chip ────────────────────────────────────────────────── */
function CompletedStep({ title, summary, onEdit, c }: { title: string; summary: string; onEdit: () => void; c: C }) {
    return (
        <div style={{ backgroundColor: c.cardBg, borderRadius: 8, padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, transition: 'background-color 200ms' }}>
            <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: M, fontWeight: 600, fontSize: 14, color: c.inactiveStep, margin: '0 0 2px', letterSpacing: '0.5px', textTransform: 'capitalize', transition: 'color 200ms' }}>{title}</p>
                <p style={{ fontFamily: M, fontWeight: 400, fontSize: 13, color: c.meta, margin: 0, lineHeight: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', transition: 'color 200ms' }}>{summary}</p>
            </div>
            <button onClick={onEdit} aria-label="Edit" style={{ background: 'none', border: `1px solid ${c.cardBorder}`, borderRadius: 9999, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'border-color 200ms' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c.meta} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            </button>
        </div>
    );
}

/* ─── Shipping form types + helpers ─────────────────────────────────────── */
type ShippingForm = { firstName: string; lastName: string; country: string; phone: string; street: string; addressLine2: string; city: string; state: string; postalCode: string; };
function SField({ label, required, placeholder, value, onChange, type = 'text', error, c }: { label: string; required?: boolean; placeholder: string; value: string; onChange: (v: string) => void; type?: string; error?: string; c: C; }) {
    return (
        <div>
            <Label text={label} required={required} c={c} />
            <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
                style={{ width: '100%', height: 56, borderRadius: 8, outline: 'none', boxSizing: 'border-box', border: `1px solid ${error ? '#b61c11' : c.inputBorder}`, padding: '0 16px', backgroundColor: c.inputBg, fontFamily: M, fontWeight: 400, fontSize: 14, color: c.inputText, transition: 'background-color 200ms, border-color 200ms, color 200ms' }} />
            {error && <p style={{ fontFamily: M, fontSize: 12, color: '#b61c11', margin: '6px 0 0' }}>{error}</p>}
        </div>
    );
}

/* ─── Step 2 – Shipping Address ─────────────────────────────────────────── */
function ShippingAddressCard({ form, setForm, onNext, c }: { form: ShippingForm; setForm: (f: ShippingForm) => void; onNext: () => void; c: C; }) {
    const [errors, setErrors] = useState<Partial<Record<keyof ShippingForm, string>>>({});

    const set = (key: keyof ShippingForm) => (v: string) => {
        setForm({ ...form, [key]: v });
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const handleNext = () => {
        const e: Partial<Record<keyof ShippingForm, string>> = {};
        if (!form.firstName.trim()) e.firstName = 'First name is required.';
        if (!form.lastName.trim()) e.lastName = 'Last name is required.';
        if (!form.phone.trim()) e.phone = 'Phone number is required.';
        if (!form.street.trim()) e.street = 'Street address is required.';
        if (!form.city.trim()) e.city = 'City is required.';
        if (!form.postalCode.trim()) e.postalCode = 'Postal code is required.';
        if (Object.keys(e).length) { setErrors(e); return; }
        onNext();
    };

    const grid2: React.CSSProperties = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 };
    return (
        <div style={{ backgroundColor: c.cardBg, borderRadius: 8, padding: 24, transition: 'background-color 200ms' }}>
            <h2 style={{ fontFamily: M, fontWeight: 600, fontSize: 16, color: c.heading, letterSpacing: '0.96px', margin: '0 0 20px', textTransform: 'capitalize', transition: 'color 200ms' }}>Shipping Address</h2>
            {/* Restriction banner */}
            <div style={{ backgroundColor: '#fef5e7', border: '1px solid #935f06', borderRadius: 8, padding: '10px 14px', marginBottom: 20 }}>
                <p style={{ fontFamily: M, fontWeight: 400, fontSize: 12, color: '#935f06', lineHeight: '18px', margin: 0 }}>
                    Due to legal restrictions, certain products cannot be shipped to some jurisdictions.{' '}
                    <a href="/faq" style={{ color: '#935f06', textDecoration: 'underline' }}>See our FAQs</a> for more details.
                </p>
            </div>
            <div style={grid2}>
                <SField label="First Name" required placeholder="First Name" value={form.firstName} onChange={set('firstName')} error={errors.firstName} c={c} />
                <SField label="Last Name" required placeholder="Last Name" value={form.lastName} onChange={set('lastName')} error={errors.lastName} c={c} />
            </div>
            <div style={{ marginBottom: 16 }}>
                <Label text="Country" c={c} />
                <select value={form.country} onChange={e => set('country')(e.target.value)}
                    style={{ width: '100%', height: 56, borderRadius: 8, outline: 'none', boxSizing: 'border-box', border: `1px solid ${c.inputBorder}`, padding: '0 16px', backgroundColor: c.selectBg, fontFamily: M, fontWeight: 400, fontSize: 14, color: c.inputText, appearance: 'none', cursor: 'pointer', transition: 'background-color 200ms, border-color 200ms, color 200ms' }}>
                    {['India', 'United States', 'United Kingdom', 'Canada', 'Australia'].map(co => <option key={co} value={co} style={{ backgroundColor: c.selectBg, color: c.inputText }}>{co}</option>)}
                </select>
            </div>
            <div style={{ marginBottom: 16 }}><SField label="Phone Number" required placeholder="(555) 000-0000" type="tel" value={form.phone} onChange={set('phone')} error={errors.phone} c={c} /></div>
            <div style={grid2}>
                <SField label="Street Address" required placeholder="Street Address" value={form.street} onChange={set('street')} error={errors.street} c={c} />
                <SField label="Address Line 2" placeholder="Apt, Suite, etc." value={form.addressLine2} onChange={set('addressLine2')} c={c} />
            </div>
            <div style={grid2}>
                <SField label="City" required placeholder="City" value={form.city} onChange={set('city')} error={errors.city} c={c} />
                <SField label="State / Region / Province" placeholder="State" value={form.state} onChange={set('state')} c={c} />
            </div>
            <div style={{ marginBottom: 24 }}><SField label="Postal / Zip Code" required placeholder="000 000" value={form.postalCode} onChange={set('postalCode')} error={errors.postalCode} c={c} /></div>
            <button onClick={handleNext} style={{ width: '100%', backgroundColor: RED, borderRadius: 98, height: 40, border: 'none', cursor: 'pointer', fontFamily: M, fontWeight: 600, fontSize: 14, color: 'white', letterSpacing: '1px', textTransform: 'uppercase' }}>NEXT</button>
        </div>
    );
}

/* ─── Step 3 – Shipping Methods (live from Shiprocket) ──────────────────── */
interface WcShippingOption { id: string; label: string; description: string; price: number; }

function ShippingMethodCard({ selected, setSelected, onSelectOption, onNext, deliveryPostcode, cartWeight, subtotal, c }: { selected: string; setSelected: (v: string) => void; onSelectOption?: (opt: WcShippingOption) => void; onNext: () => void; deliveryPostcode: string; cartWeight: number; subtotal: number; c: C; }) {
    const [methods, setMethods] = useState<WcShippingOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        setLoading(true);
        fetch('/api/shipping/rates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deliveryPostcode, weight: cartWeight, subtotal }),
        })
            .then(r => r.json())
            .then((d: { methods?: WcShippingOption[]; error?: string }) => {
                const list = d.methods ?? [];
                setMethods(list);
                // Auto-select the first (cheapest) option when methods load
                if (list.length > 0 && !selected) {
                    setSelected(list[0].id);
                    onSelectOption?.(list[0]);
                }
            })
            .catch(() => setError('Could not load shipping methods. Please refresh.'))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [deliveryPostcode, subtotal]);

    return (
        <div style={{ backgroundColor: c.cardBg, borderRadius: 8, padding: 24, transition: 'background-color 200ms' }}>
            <h2 style={{ fontFamily: M, fontWeight: 600, fontSize: 16, color: c.heading, letterSpacing: '0.96px', margin: '0 0 20px', textTransform: 'capitalize', transition: 'color 200ms' }}>Shipping Method</h2>

            {/* Loading skeleton */}
            {loading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                    {[1, 2].map(i => (
                        <div key={i} style={{ border: `1px solid ${c.cardBorder}`, borderRadius: 8, padding: 16, height: 64, backgroundColor: c.inputBg, opacity: 0.5, animation: 'pulse 1.4s ease-in-out infinite', transition: 'background-color 200ms' }}>
                            <style>{`@keyframes pulse { 0%,100%{opacity:.5} 50%{opacity:.25} }`}</style>
                        </div>
                    ))}
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <p style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: '#b61c11', marginBottom: 24 }}>{error}</p>
            )}

            {/* Methods list */}
            {!loading && !error && methods.length === 0 && (
                <p style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.meta, marginBottom: 24, transition: 'color 200ms' }}>
                    No shipping methods available for your region.
                </p>
            )}

            {!loading && methods.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                    {methods.map(opt => (
                        <label key={opt.id} style={{ border: `1px solid ${selected === opt.id ? RED : c.cardBorder}`, borderRadius: 8, padding: 16, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', transition: 'border-color 200ms' }}>
                            <div style={{ width: 18, height: 18, borderRadius: 9999, border: `2px solid ${selected === opt.id ? RED : c.cardBorder}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 200ms' }}>
                                {selected === opt.id && <div style={{ width: 8, height: 8, borderRadius: 9999, backgroundColor: RED }} />}
                            </div>
                            <input type="radio" checked={selected === opt.id} onChange={() => { setSelected(opt.id); onSelectOption?.(opt); }} style={{ display: 'none' }} />
                            <div style={{ flex: 1 }}>
                                <span style={{ fontFamily: M, fontWeight: 600, fontSize: 14, color: c.heading, display: 'block', lineHeight: '20px', transition: 'color 200ms' }}>{opt.label}</span>
                                {opt.description && (
                                    <span style={{ fontFamily: M, fontWeight: 400, fontSize: 12, color: c.meta, lineHeight: '16px', transition: 'color 200ms' }}>{opt.description}</span>
                                )}
                            </div>
                            <span style={{ fontFamily: M, fontWeight: 600, fontSize: 14, color: c.heading, flexShrink: 0, transition: 'color 200ms' }}>
                                {opt.price === 0 ? 'FREE' : `₹${opt.price.toFixed(2)}`}
                            </span>
                        </label>
                    ))}
                </div>
            )}

            <button
                onClick={onNext}
                disabled={loading || methods.length === 0}
                style={{ width: '100%', backgroundColor: loading || methods.length === 0 ? '#9c9ea3' : RED, borderRadius: 98, height: 40, border: 'none', cursor: loading || methods.length === 0 ? 'not-allowed' : 'pointer', fontFamily: M, fontWeight: 600, fontSize: 14, color: 'white', letterSpacing: '1px', textTransform: 'uppercase', transition: 'background-color 200ms' }}
            >
                NEXT
            </button>
        </div>
    );
}

/* ─── Step 4 – Age Verification ─────────────────────────────────────────── */
function AgeVerificationCard({ onNext, c }: { onNext: (isoDob: string) => void; c: C }) {
    // Pre-fill from the age gate / signup (stored as ISO, shown as DD/MM/YYYY)
    const [dob, setDob] = useState(() => isoToDisplay(readStoredDob()));
    const [ageChecked, setAgeChecked] = useState(false);
    const [termsChecked, setTermsChecked] = useState(false);
    const [dobError, setDobError] = useState('');
    const canProceed = ageChecked && termsChecked;

    const handleDobChange = (val: string) => {
        const digits = val.replace(/\D/g, '').slice(0, 8);
        let formatted = digits;
        if (digits.length > 4) formatted = digits.slice(0, 2) + '/' + digits.slice(2, 4) + '/' + digits.slice(4);
        else if (digits.length > 2) formatted = digits.slice(0, 2) + '/' + digits.slice(2);
        setDob(formatted);
        if (dobError) setDobError('');
    };

    const handleNext = () => {
        if (!dob || dob.length < 10) { setDobError('Please enter your date of birth.'); return; }
        const isoDob = displayToIso(dob);
        if (!isoDob) { setDobError('Please enter a valid date of birth (DD/MM/YYYY).'); return; }
        if (!isOfAge(isoDob)) { setDobError(`You are not above ${MIN_AGE} years old. You must be at least ${MIN_AGE} to purchase.`); return; }
        setDobError('');
        storeDob(isoDob);
        onNext(isoDob);
    };

    const Cb = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
        <div onClick={onChange} style={{ width: 20, height: 20, flexShrink: 0, borderRadius: 2, border: `1.5px solid ${checked ? RED : c.cardBorder}`, backgroundColor: checked ? RED : c.inputBg, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', marginTop: 1, transition: 'background-color 200ms, border-color 200ms' }}>
            {checked && <svg width="12" height="10" viewBox="0 0 12 10" fill="none"><path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </div>
    );

    return (
        <div style={{ backgroundColor: c.cardBg, borderRadius: 8, padding: 24, transition: 'background-color 200ms' }}>
            <h2 style={{ fontFamily: M, fontWeight: 600, fontSize: 16, color: c.heading, letterSpacing: '0.96px', margin: '0 0 16px', textTransform: 'capitalize', transition: 'color 200ms' }}>Age Verification</h2>

            {/* Description */}
            <p style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.body, lineHeight: '22px', margin: '0 0 24px', transition: 'color 200ms' }}>
                Tobacco products are sold only to customers aged 21 and above. Please enter your date of birth — we may ask for a government photo ID before dispatch or on delivery to confirm your age.</p>

            {/* Date of birth */}
            <div style={{ marginBottom: 20 }}>
                <Label text="Date of birth" required c={c} />
                <input
                    type="text"
                    placeholder="DD/MM/YYYY"
                    value={dob}
                    onChange={e => handleDobChange(e.target.value)}
                    maxLength={10}
                    style={{ width: '100%', height: 56, borderRadius: 8, outline: 'none', boxSizing: 'border-box', border: `1px solid ${dobError ? '#b61c11' : c.inputBorder}`, padding: '0 16px', backgroundColor: c.inputBg, fontFamily: M, fontWeight: 400, fontSize: 14, color: c.inputText, letterSpacing: '2px', transition: 'background-color 200ms, border-color 200ms, color 200ms' }}
                />
                {dobError && (
                    <p style={{ fontFamily: M, fontSize: 13, color: '#b61c11', margin: '8px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="11" fill="#b61c11" />
                            <path d="M12 7v6" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                            <circle cx="12" cy="17" r="1.2" fill="white" />
                        </svg>
                        {dobError}
                    </p>
                )}
            </div>

            {/* Age consent checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
                <Cb checked={ageChecked} onChange={() => setAgeChecked(v => !v)} />
                <span style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.heading, lineHeight: '22px', transition: 'color 200ms' }}>
                    I verify that I am of legal age (over 21) to purchase tobacco products nationally and consent to age verification.
                </span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: c.divider, margin: '0 0 24px', transition: 'background-color 200ms' }} />

            {/* Terms and Conditions */}
            <p style={{ fontFamily: M, fontWeight: 600, fontSize: 16, color: c.heading, margin: '0 0 16px', transition: 'color 200ms' }}>Terms and Conditions</p>

            {/* Scrollable T&C box */}
            <div style={{ border: `1px solid ${c.inputBorder}`, borderRadius: 4, height: 160, overflowY: 'auto', padding: '12px 16px', marginBottom: 16, transition: 'border-color 200ms' }}>
                <p style={{ fontFamily: M, fontWeight: 700, fontSize: 14, color: c.heading, margin: '0 0 8px', transition: 'color 200ms' }}>The Hookah Store – Terms and Conditions</p>
                <p style={{ fontFamily: M, fontWeight: 700, fontSize: 13, color: c.heading, margin: '0 0 4px', transition: 'color 200ms' }}>Introduction</p>
                <p style={{ fontFamily: M, fontWeight: 400, fontSize: 13, color: c.body, lineHeight: '20px', margin: '0 0 12px', transition: 'color 200ms' }}>
                    These Terms and Conditions ("Terms") govern your use of The Hookah Store website. By accessing or using this website, you agree to comply with and be bound by these Terms.
                </p>
                <p style={{ fontFamily: M, fontWeight: 700, fontSize: 13, color: c.heading, margin: '0 0 4px', transition: 'color 200ms' }}>Age Verification</p>
                <p style={{ fontFamily: M, fontWeight: 400, fontSize: 13, color: c.body, lineHeight: '20px', margin: '0 0 12px', transition: 'color 200ms' }}>
                    By using this website, you certify that you are at least 21 years of age and legally permitted to purchase tobacco products. We sell only to adults in accordance with Indian law, including COTPA 2003, and may ask for proof of age before dispatch or on delivery.
                </p>
                <p style={{ fontFamily: M, fontWeight: 700, fontSize: 13, color: c.heading, margin: '0 0 4px', transition: 'color 200ms' }}>Legal Compliance</p>
                <p style={{ fontFamily: M, fontWeight: 400, fontSize: 13, color: c.body, lineHeight: '20px', margin: '0 0 12px', transition: 'color 200ms' }}>
                    Users must comply with all applicable laws and regulations regarding the purchase and use of tobacco products. A signature upon delivery will be required as mandated by all applicable laws.
                </p>
                <p style={{ fontFamily: M, fontWeight: 700, fontSize: 13, color: c.heading, margin: '0 0 4px', transition: 'color 200ms' }}>Return and Exchange Policy</p>
                <p style={{ fontFamily: M, fontWeight: 400, fontSize: 13, color: c.body, lineHeight: '20px', margin: '0 0 12px', transition: 'color 200ms' }}>
                    Unopened and unused products may be returned within 30 days of purchase for a refund, excluding shipping charges. Exchanges are permitted for unused products within 30 days of purchase.
                </p>
                <p style={{ fontFamily: M, fontWeight: 700, fontSize: 13, color: c.heading, margin: '0 0 4px', transition: 'color 200ms' }}>Health Warnings</p>
                <p style={{ fontFamily: M, fontWeight: 400, fontSize: 13, color: c.body, lineHeight: '20px', margin: '0 0 12px', transition: 'color 200ms' }}>
                    Certain products contain nicotine, an addictive chemical. Users are advised of the health risks associated with tobacco use.
                </p>
                <p style={{ fontFamily: M, fontWeight: 700, fontSize: 13, color: c.heading, margin: '0 0 4px', transition: 'color 200ms' }}>Limitation of Liability</p>
                <p style={{ fontFamily: M, fontWeight: 400, fontSize: 13, color: c.body, lineHeight: '20px', margin: '0 0 4px', transition: 'color 200ms' }}>
                    Our maximum liability for any product sold is limited to the purchase price of the product. We disclaim all warranties, express or implied, including merchantability and fitness for a particular purpose.
                </p>
            </div>

            {/* T&C agreement checkbox */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
                <Cb checked={termsChecked} onChange={() => setTermsChecked(v => !v)} />
                <span style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.heading, lineHeight: '22px', transition: 'color 200ms' }}>
                    By continuing, I agree to the Terms and Conditions
                </span>
            </div>

            {/* NEXT button */}
            <button
                onClick={handleNext}
                disabled={!canProceed}
                style={{ width: '100%', backgroundColor: canProceed ? RED : '#9c9ea3', borderRadius: 98, height: 40, border: 'none', cursor: canProceed ? 'pointer' : 'not-allowed', fontFamily: M, fontWeight: 600, fontSize: 14, color: 'white', letterSpacing: '1px', textTransform: 'uppercase', transition: 'background-color 200ms' }}
            >
                NEXT
            </button>
        </div>
    );
}

/* ─── Step 5 – Make Payment (Razorpay) ──────────────────────────────────── */
interface CartItemMin { productId: number; variationId: number | null; name: string; price: string; quantity: number; size: string | null; image: string; }
function MakePaymentCard({ subtotal, shippingCost, discountAmount = 0, appliedCoupon, email, customerDob, cart, shippingForm, shippingMethodId, shippingMethodLabel, clearCart, c }: {
    subtotal: number; shippingCost: number; discountAmount?: number; appliedCoupon?: string | null; email: string;
    /** ISO date of birth from the Age Verification step — re-checked server-side */
    customerDob: string;
    cart: CartItemMin[]; shippingForm: ShippingForm;
    shippingMethodId: string; shippingMethodLabel: string;
    clearCart: () => void; c: C;
}) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const discounted = Math.max(0, subtotal - discountAmount);
    const total = discounted + shippingCost;
    const fmt = (v: number) => `₹${v.toFixed(2)}`;
    const router = useRouter();

    const loadRazorpayScript = () => new Promise<boolean>(resolve => {
        if ((window as any).Razorpay) { resolve(true); return; }
        const s = document.createElement('script');
        s.src = 'https://checkout.razorpay.com/v1/checkout.js';
        s.onload = () => resolve(true);
        s.onerror = () => resolve(false);
        document.body.appendChild(s);
    });

    const handlePayment = async () => {
        setLoading(true);
        setError('');
        try {
            const loaded = await loadRazorpayScript();
            if (!loaded) { setError('Could not load payment gateway. Check your internet connection.'); setLoading(false); return; }

            const res = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // The server prices the order itself (WooCommerce prices, coupon, shipping) —
                // we only send what's in the cart, never an amount.
                body: JSON.stringify({
                    items: cart.map(i => ({ productId: i.productId, variationId: i.variationId, quantity: i.quantity })),
                    couponCode: appliedCoupon ?? null,
                    shipping: { methodId: shippingMethodId, postcode: shippingForm.postalCode },
                    customerDob,
                }),
            });
            const data = await res.json() as { orderId?: string; amount?: number; error?: string };
            if (!data.orderId || !data.amount) { setError(data.error || 'Could not create payment order.'); setLoading(false); return; }

            const razorpayOrderId = data.orderId;

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount, // server-computed amount (paise)
                currency: 'INR',
                name: 'The Hookah Store',
                description: 'Order Payment',
                order_id: razorpayOrderId,
                prefill: { email },
                theme: { color: '#D32F2F' },
                handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
                    // Verify + place WooCommerce order
                    try {
                        const completeRes = await fetch('/api/payment/complete-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                email,
                                cart: cart.map(i => ({ productId: i.productId, variationId: i.variationId, name: i.name, price: i.price, quantity: i.quantity, size: i.size })),
                                shippingAddress: shippingForm,
                                shippingMethodId,
                                shippingMethodLabel,
                                shippingCost,
                                couponCode: appliedCoupon ?? null,
                                discountAmount,
                                customerDob,
                            }),
                        });
                        const orderData = await completeRes.json() as { orderId?: number; orderNumber?: string; dateCreated?: string; error?: string };
                        if (!orderData.orderId) throw new Error(orderData.error || 'Order creation failed');

                        // Store receipt for the order-received page
                        const receipt = {
                            orderId: orderData.orderId,
                            orderNumber: orderData.orderNumber,
                            paymentId: response.razorpay_payment_id,
                            dateCreated: orderData.dateCreated ?? new Date().toISOString(),
                            email,
                            items: cart.map(i => ({ name: i.name, size: i.size, quantity: i.quantity, price: i.price, image: i.image })),
                            billing: { firstName: shippingForm.firstName, lastName: shippingForm.lastName, address1: shippingForm.street, address2: shippingForm.addressLine2, city: shippingForm.city, state: shippingForm.state, country: shippingForm.country, phone: shippingForm.phone },
                            subtotal, shippingCost, discountAmount, total,
                            shippingMethodLabel,
                            couponCode: appliedCoupon,
                        };
                        sessionStorage.setItem('hookah_order_receipt', JSON.stringify(receipt));
                        clearCart();
                        router.push('/order-received');
                    } catch (err: any) {
                        setError(err.message || 'Order placement failed after payment. Please contact support.');
                        setLoading(false);
                    }
                },
                modal: { ondismiss: () => setLoading(false) },
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', (resp: any) => {
                setError(`Payment failed: ${resp.error?.description ?? 'Unknown error'}`);
                setLoading(false);
            });
            rzp.open();
        } catch {
            setError('Payment failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: c.cardBg, borderRadius: 8, padding: 24, transition: 'background-color 200ms' }}>
            <h2 style={{ fontFamily: M, fontWeight: 600, fontSize: 16, color: c.heading, letterSpacing: '0.96px', margin: '0 0 24px', textTransform: 'capitalize', transition: 'color 200ms' }}>Make Payment</h2>

            {/* Order total summary */}
            <div style={{ backgroundColor: c.benefitsBg, borderRadius: 8, padding: '16px', marginBottom: 24, transition: 'background-color 200ms' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.body, transition: 'color 200ms' }}>Subtotal</span>
                    <span style={{ fontFamily: M, fontWeight: 500, fontSize: 14, color: c.heading, transition: 'color 200ms' }}>{fmt(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <span style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: '#22c55e' }}>Discount{appliedCoupon ? ` (${appliedCoupon})` : ''}</span>
                        <span style={{ fontFamily: M, fontWeight: 500, fontSize: 14, color: '#22c55e' }}>-{fmt(discountAmount)}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontFamily: M, fontWeight: 400, fontSize: 14, color: c.body, transition: 'color 200ms' }}>Shipping</span>
                    <span style={{ fontFamily: M, fontWeight: 500, fontSize: 14, color: c.heading, transition: 'color 200ms' }}>{shippingCost === 0 ? 'FREE' : fmt(shippingCost)}</span>
                </div>
                <div style={{ height: 1, backgroundColor: c.divider, margin: '12px 0', transition: 'background-color 200ms' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: M, fontWeight: 600, fontSize: 16, color: c.heading, transition: 'color 200ms' }}>Total</span>
                    <span style={{ fontFamily: M, fontWeight: 700, fontSize: 16, color: c.heading, transition: 'color 200ms' }}>{fmt(total)}</span>
                </div>
            </div>

            {error && <p style={{ fontFamily: M, fontSize: 13, color: '#b61c11', marginBottom: 16 }}>{error}</p>}

            <button
                onClick={handlePayment}
                disabled={loading}
                style={{ width: '100%', backgroundColor: loading ? '#9c9ea3' : RED, borderRadius: 98, height: 44, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: M, fontWeight: 600, fontSize: 14, color: 'white', letterSpacing: '1px', textTransform: 'uppercase', transition: 'background-color 200ms' }}
            >
                {loading ? 'Processing…' : 'MAKE PAYMENT'}
            </button>
        </div>
    );
}

export default function CartPageClient() {

    const { dark } = useTheme();
    const { refresh } = useAuth();
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
    const [userState, setUserState] = useState<UserState>('guest');
    const [checkoutStep, setCheckoutStep] = useState<'step1' | 'step2' | 'step3' | 'step4' | 'step5'>('step1');
    const [email, setEmail] = useState('');
    const [mobileOrderOpen, setMobileOrderOpen] = useState(false);
    const [shippingForm, setShippingForm] = useState<ShippingForm>({ firstName: '', lastName: '', country: 'India', phone: '', street: '', addressLine2: '', city: '', state: '', postalCode: '' });
    const [selectedShipping, setSelectedShipping] = useState('');
    const [shippingPrice, setShippingPrice] = useState(0);
    const [shippingLabel, setShippingLabel] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [couponApplied, setCouponApplied] = useState<string | null>(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [couponError, setCouponError] = useState('');
    const [promoOpen, setPromoOpen] = useState(false);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true); setCouponError('');
        try {
            const res = await fetch('/api/coupons/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode.trim(), subtotal }),
            });
            const data = await res.json() as { error?: string; coupon?: { code: string; discountAmount: number } };
            if (!res.ok || data.error) { setCouponError(data.error || 'Invalid coupon.'); }
            else if (data.coupon) { setCouponDiscount(data.coupon.discountAmount); setCouponApplied(data.coupon.code); setPromoOpen(false); setCouponError(''); }
        } catch { setCouponError('Could not validate coupon. Please try again.'); }
        finally { setCouponLoading(false); }
    };

    const handleRemoveCoupon = () => { setCouponApplied(null); setCouponDiscount(0); setCouponCode(''); setCouponError(''); setPromoOpen(false); };

    const c = makeColors(dark);
    const subtotal = getCartTotal();
    const subtotalFmt = `₹${subtotal.toFixed(2)}`;

    /* Step handlers */
    const handleSetExisting = () => setUserState('existing');
    const handleSetNew = () => setUserState('new');
    const handleContinueAsGuest = () => setCheckoutStep('step2');
    const handleBack = () => { setUserState('guest'); setCheckoutStep('step1'); };
    const handleAuthSuccess = () => { refresh(); setCheckoutStep('step2'); };
    const handleShippingNext = () => setCheckoutStep('step3');
    const handleShippingMethodNext = () => setCheckoutStep('step4');
    const [customerDob, setCustomerDob] = useState('');
    const handleAgeVerificationNext = (isoDob: string) => { setCustomerDob(isoDob); setCheckoutStep('step5'); };

    const authSummary = email || 'Guest Checkout';
    const shippingSummary = shippingForm.firstName ? `${shippingForm.firstName} ${shippingForm.lastName}, ${shippingForm.city || '—'}, ${shippingForm.country}` : 'Address saved';
    const remainingSteps = checkoutStep === 'step1' ? INACTIVE_STEPS : checkoutStep === 'step2' ? ['Shipping Methods', 'Age Verification'] : checkoutStep === 'step3' ? ['Age Verification'] : [];

    const summaryProps = { cart, removeFromCart, updateQuantity, subtotal, c,
        couponCode, setCouponCode, couponDiscount, couponApplied, couponLoading,
        couponError, promoOpen, setPromoOpen, onApplyCoupon: handleApplyCoupon, onRemoveCoupon: handleRemoveCoupon };

    return (
        <div style={{ backgroundColor: c.pageBg, minHeight: '100vh', position: 'relative', zIndex: 10, transition: 'background-color 200ms' }}>

            {/* Mobile – collapsible order summary */}
            <div className="min-[768px]:hidden">
                <button
                    onClick={() => setMobileOrderOpen(v => !v)}
                    style={{ width: '100%', backgroundColor: c.mobileToggleBg, height: 56, display: 'flex', alignItems: 'center', padding: '0 16px', border: 'none', cursor: 'pointer', transition: 'background-color 200ms' }}>
                    <span style={{ fontFamily: M, fontWeight: 600, fontSize: 14, color: c.mobileToggleText, textTransform: 'uppercase', letterSpacing: '0.499px', flex: 1, textAlign: 'left', transition: 'color 200ms' }}>
                        Order Summary
                    </span>
                    <span style={{ fontFamily: M, fontWeight: 600, fontSize: 14, color: c.mobileToggleText, marginRight: 8, transition: 'color 200ms' }}>{subtotalFmt}</span>
                    <ChevronDown open={mobileOrderOpen} c={c} />
                </button>
                {mobileOrderOpen && (
                    <div style={{ backgroundColor: c.cardBg, padding: '0 16px 24px', transition: 'background-color 200ms' }}>
                        <OrderSummaryPanel {...summaryProps} />
                    </div>
                )}
            </div>

            {/* Main layout */}
            <div className="min-[1280px]:px-[120px] min-[768px]:px-6 px-0 pt-16 pb-20">
                <div className="min-[768px]:flex gap-6 items-start">
                    {/* LEFT */}
                    <div className="min-[768px]:flex-1 flex flex-col gap-3 px-4 min-[768px]:px-0">

                        {/* ── Step 1 – Auth ── */}
                        {checkoutStep === 'step1' && (
                            userState === 'existing'
                                ? <ExistingUserCard email={email} onBack={handleBack} onSuccess={handleAuthSuccess} c={c} />
                                : userState === 'new'
                                    ? <NewUserCard email={email} onBack={handleBack} onSuccess={handleAuthSuccess} onContinueAsGuest={handleContinueAsGuest} c={c} />
                                    : <GuestCard email={email} setEmail={setEmail} onSetExisting={handleSetExisting} onSetNew={handleSetNew} onContinueAsGuest={handleContinueAsGuest} c={c} />
                        )}
                        {checkoutStep !== 'step1' && (
                            <CompletedStep title="Email Address" summary={authSummary} onEdit={() => { setCheckoutStep('step1'); setUserState('guest'); }} c={c} />
                        )}

                        {/* ── Step 2 – Shipping Address ── */}
                        {checkoutStep === 'step2' && (
                            <ShippingAddressCard form={shippingForm} setForm={setShippingForm} onNext={handleShippingNext} c={c} />
                        )}
                        {(checkoutStep === 'step3' || checkoutStep === 'step4' || checkoutStep === 'step5') && (
                            <CompletedStep title="Shipping Address" summary={shippingSummary} onEdit={() => setCheckoutStep('step2')} c={c} />
                        )}

                        {/* ── Step 3 – Shipping Methods ── */}
                        {checkoutStep === 'step3' && (
                            <ShippingMethodCard
                                selected={selectedShipping}
                                setSelected={setSelectedShipping}
                                onSelectOption={opt => { setShippingPrice(opt.price); setShippingLabel(opt.label); }}
                                onNext={handleShippingMethodNext}
                                deliveryPostcode={shippingForm.postalCode}
                                cartWeight={Math.max(0.5, cart.reduce((sum, item) => sum + item.quantity * 0.5, 0))}
                                subtotal={subtotal}
                                c={c}
                            />
                        )}

                        {/* ── Step 4 – Age Verification ── */}
                        {(checkoutStep === 'step4' || checkoutStep === 'step5') && (
                            <CompletedStep title="Shipping Method" summary={shippingLabel || selectedShipping || 'Saved'} onEdit={() => setCheckoutStep('step3')} c={c} />
                        )}
                        {checkoutStep === 'step4' && (
                            <AgeVerificationCard onNext={handleAgeVerificationNext} c={c} />
                        )}
                        {checkoutStep === 'step4' && (
                            <InactiveStep label="Make Payment" c={c} />
                        )}

                        {/* ── Step 5 – Age Verification completed + Make Payment ── */}
                        {checkoutStep === 'step5' && (
                            <CompletedStep title="Age Verification" summary="Verified ✔" onEdit={() => setCheckoutStep('step4')} c={c} />
                        )}

                        {/* ── Step 5 – Make Payment ── */}
                        {checkoutStep === 'step5' && (
                            <MakePaymentCard
                                subtotal={subtotal}
                                shippingCost={shippingPrice}
                                discountAmount={couponDiscount}
                                appliedCoupon={couponApplied}
                                email={email}
                                customerDob={customerDob}
                                cart={cart}
                                shippingForm={shippingForm}
                                shippingMethodId={selectedShipping}
                                shippingMethodLabel={shippingLabel}
                                clearCart={clearCart}
                                c={c}
                            />
                        )}

                        {/* Remaining inactive steps */}
                        {remainingSteps.map(label => (
                            <InactiveStep key={label} label={label} c={c} />
                        ))}
                    </div>

                    {/* RIGHT (tablet+) */}
                    <div className="hidden min-[768px]:block min-[768px]:w-[340px] min-[1280px]:w-[420px] flex-shrink-0">
                        <OrderSummaryPanel {...summaryProps} />
                    </div>
                </div>
            </div>
        </div>
    );
}


