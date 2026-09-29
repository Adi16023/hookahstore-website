'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from '../../../../components/providers/ThemeProvider';
import { getWholesaleUrl } from '../../../../lib/config';
import { readStoredDob, storeDob, isOfAge, MIN_AGE } from '../../../../lib/utils/dob';

/* ── Checkmark icon ── */
function CheckmarkIcon({ stroke }: { stroke: string }) {
    return (
        <div className="relative shrink-0 overflow-hidden" style={{ width: '24px', height: '24px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: 'block', width: '100%', height: '100%' }}>
                <path d="M10.2552 0.70002L4.01204 8.30002L0.7 4.96932" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" transform="translate(6.52 7.5)" />
            </svg>
        </div>
    );
}

function BenefitItem({ text, checkStroke, textCol }: { text: string; checkStroke: string; textCol: string }) {
    return (
        <div className="flex items-center" style={{ gap: 0 }}>
            <CheckmarkIcon stroke={checkStroke} />
            <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textCol }}>{text}</span>
        </div>
    );
}

const benefits = [
    'Fast, secure and convenient checkout',
    'New product alerts + Expert tips',
    'Loyalty and referral programs',
    'Expert customer service',
];

/* ── Password rule checker ── */
function getRules(password: string) {
    return [
        { label: 'More than 7 characters', ok: password.length > 7 },
        { label: 'One uppercase letter (A–Z)', ok: /[A-Z]/.test(password) },
        { label: 'One lowercase letter (a–z)', ok: /[a-z]/.test(password) },
        { label: 'One special character (!@#…)', ok: /[^A-Za-z0-9]/.test(password) },
    ];
}

/* ── Success screen ── */
function SuccessScreen({ firstName, email, dark }: { firstName: string; email: string; dark: boolean }) {
    const pageBg = dark ? '#121212' : '#ffffff';
    const textPrim = dark ? '#ffffff' : '#101114';
    const textMuted = dark ? 'rgba(255,255,255,0.55)' : '#6c6d73';

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center', transition: 'background-color 200ms' }}>

            {/* Logo mark */}
            <div style={{ marginBottom: '28px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#D32F2F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <path d="M4 12L9 17L20 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>

            {/* Heading */}
            <h1 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: '26px', lineHeight: '36px', color: textPrim, margin: '0 0 12px 0', transition: 'color 200ms' }}>
                Welcome, {firstName}!
            </h1>

            {/* Sub-text */}
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '15px', lineHeight: '24px', color: textMuted, margin: '0 0 32px 0', maxWidth: '440px', transition: 'color 200ms' }}>
                Your account has been successfully created. Thank you for registering. We&apos;re excited to have you on board.
            </p>

            {/* CTA */}
            <Link
                href="/category/hookahs"
                style={{ display: 'inline-block', backgroundColor: '#D32F2F', color: '#ffffff', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '1.5px', textTransform: 'uppercase', textDecoration: 'none', padding: '14px 40px', borderRadius: '98px' }}
            >
                Shop the Catalog
            </Link>

            {/* Verification note */}
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '13px', lineHeight: '20px', color: textMuted, margin: '20px 0 0 0', transition: 'color 200ms' }}>
                A verification email has been sent to <strong style={{ color: textPrim }}>{email}</strong>
            </p>
        </div>
    );
}

/* ── Main component ── */
export default function CreateAccountClient() {
    const { dark } = useTheme();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [marketingOptIn, setMarketingOptIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState('');
    const [success, setSuccess] = useState<{ firstName: string; email: string } | null>(null);
    // Optional DOB (ISO) — pre-filled from the age gate (localStorage 'ageDOB')
    const [dob, setDob] = useState('');
    const [todayIso, setTodayIso] = useState<string | undefined>(undefined); // set after mount — avoids SSR/client date mismatch
    useEffect(() => { setDob(readStoredDob()); setTodayIso(new Date().toISOString().slice(0, 10)); }, []);

    /* ── Colour tokens ── */
    const pageBg = dark ? '#121212' : '#ffffff';
    const topBarBg = dark ? 'rgba(255,255,255,0.04)' : '#f6f5f8';
    const textPrim = dark ? '#ffffff' : '#101114';
    const textMuted = dark ? 'rgba(255,255,255,0.50)' : '#6c6d73';
    const textBody = dark ? 'rgba(255,255,255,0.80)' : '#4c4e52';
    const inputBg = dark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const inputBorder = dark ? 'rgba(255,255,255,0.25)' : '#6c6d73';
    const divider = dark ? 'rgba(255,255,255,0.12)' : '#d7d8db';
    const checkBorder = dark ? 'rgba(255,255,255,0.30)' : '#6b7280';
    const required = '#b61c11';
    const linkRed = '#D32F2F';

    const allRulesPass = getRules(password).every(r => r.ok);
    const btnBg = loading ? (dark ? 'rgba(255,255,255,0.06)' : '#ebebed')
        : !allRulesPass ? (dark ? 'rgba(255,255,255,0.06)' : '#ebebed')
            : '#D32F2F';
    const btnText = loading || !allRulesPass
        ? (dark ? 'rgba(255,255,255,0.30)' : '#6c6d73')
        : '#ffffff';

    const inputStyle = {
        width: '100%',
        backgroundColor: inputBg,
        border: `1px solid ${inputBorder}`,
        borderRadius: '8px',
        height: '48px',
        padding: '0 12px',
        outline: 'none',
        color: textPrim,
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 400,
        fontSize: '14px',
        transition: 'background-color 200ms, border-color 200ms, color 200ms',
    };

    const labelStyle = {
        display: 'block',
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '20px',
        color: textPrim,
        marginBottom: '8px',
        transition: 'color 200ms',
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!allRulesPass) return;
        setError('');
        setLoading(true);

        const form = new FormData(e.currentTarget);
        const firstName = (form.get('firstName') as string ?? '').trim();
        const lastName = (form.get('lastName') as string ?? '').trim();
        const email = (form.get('email') as string ?? '').trim();

        if (dob && !isOfAge(dob)) {
            setError(`You must be at least ${MIN_AGE} years old to create an account.`);
            setLoading(false);
            return;
        }
        if (dob) storeDob(dob);

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password, marketingOptIn, ...(dob ? { dob } : {}) }),
            });
            const data = await res.json() as { error?: string };

            if (!res.ok) {
                setError(data.error ?? 'Something went wrong. Please try again.');
                return;
            }

            setSuccess({ firstName, email });
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }

    /* ── Success screen ── */
    if (success) {
        return <SuccessScreen firstName={success.firstName} email={success.email} dark={dark} />;
    }

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', width: '100%', transition: 'background-color 200ms' }}>

            {/* ── Top bar ── */}
            <div style={{ backgroundColor: topBarBg, height: '72px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 200ms' }}>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', lineHeight: '20px' }}>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, color: textPrim, transition: 'color 200ms' }}>Have a Business?</span>
                    <a href={getWholesaleUrl('/register')} style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: linkRed, marginLeft: '4px', textDecoration: 'underline' }}>Create Business Account</a>
                </div>
            </div>

            {/* ── Main container ── */}
            <div className="w-full px-[16px] md:px-[89px] xl:px-[297px]" style={{ paddingTop: '48px', paddingBottom: 0 }}>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <h1 className="text-[18px] leading-[28px] md:text-[26px] md:leading-[40px]"
                        style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: textPrim, margin: 0, transition: 'color 200ms' }}>
                        Create an Account
                    </h1>
                </div>

                {/* Benefits box */}
                <div className="rounded-[8px]" style={{ backgroundColor: topBarBg, padding: '20px 16px 16px 16px', marginBottom: '44px', transition: 'background-color 200ms' }}>
                    <div className="text-[14px] leading-[20px] md:text-[16px] md:leading-[24px]"
                        style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: textPrim, marginBottom: '12px' }}>
                        Account Creation Benefits
                    </div>
                    <div className="block md:hidden">
                        <div className="flex flex-col">
                            {benefits.map(b => <BenefitItem key={b} text={b} checkStroke={textPrim} textCol={textPrim} />)}
                        </div>
                    </div>
                    <div className="hidden md:grid md:grid-cols-2">
                        <div className="flex flex-col">
                            <BenefitItem text={benefits[0]} checkStroke={textPrim} textCol={textPrim} />
                            <BenefitItem text={benefits[2]} checkStroke={textPrim} textCol={textPrim} />
                        </div>
                        <div className="flex flex-col">
                            <BenefitItem text={benefits[1]} checkStroke={textPrim} textCol={textPrim} />
                            <BenefitItem text={benefits[3]} checkStroke={textPrim} textCol={textPrim} />
                        </div>
                    </div>
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} noValidate>

                    {/* Error banner */}
                    {error && (
                        <div style={{ backgroundColor: dark ? 'rgba(211,47,47,0.12)' : '#fff0f0', border: '1px solid #f5c6cb', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px' }}>
                            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '14px', color: '#D32F2F', margin: 0 }}>{error}</p>
                        </div>
                    )}

                    {/* Row 1: First + Last */}
                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/2" style={{ marginBottom: '24px' }}>
                            <div className="md:pr-[12px]">
                                <label style={labelStyle}>First Name <span style={{ color: required, fontSize: '12px' }}>*</span></label>
                                <input type="text" name="firstName" autoComplete="given-name" required style={inputStyle} />
                            </div>
                        </div>
                        <div className="w-full md:w-1/2" style={{ marginBottom: '24px' }}>
                            <div className="md:pl-[12px]">
                                <label style={labelStyle}>Last Name <span style={{ color: required, fontSize: '12px' }}>*</span></label>
                                <input type="text" name="lastName" autoComplete="family-name" required style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    {/* Row 1b: Date of birth (optional, pre-filled from age verification) */}
                    <div style={{ marginBottom: '24px' }}>
                        <div className="w-full md:w-1/2 md:pr-[12px]">
                            <label htmlFor="register-dob" style={labelStyle}>Date of Birth <span style={{ color: textMuted, fontSize: '12px' }}>(optional)</span></label>
                            <input
                                id="register-dob"
                                type="date"
                                name="dob"
                                autoComplete="bday"
                                value={dob}
                                max={todayIso}
                                onChange={e => setDob(e.target.value)}
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    {/* Row 2: Email + Password */}
                    <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/2" style={{ marginBottom: '24px' }}>
                            <div className="md:pr-[12px]">
                                <label style={labelStyle}>Email <span style={{ color: required, fontSize: '12px' }}>*</span></label>
                                <input type="email" name="email" autoComplete="email" required style={inputStyle} />
                            </div>
                        </div>
                        <div className="w-full md:w-1/2" style={{ marginBottom: '8px' }}>
                            <div className="md:pl-[12px]">
                                <label style={labelStyle}>Password <span style={{ color: required, fontSize: '12px' }}>*</span></label>

                                {/* Password input + eye toggle */}
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        autoComplete="new-password"
                                        required
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                        style={{ ...inputStyle, padding: '0 44px 0 12px' }}
                                    />
                                    {/* Eye icon — clickable toggle */}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted }}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            /* Eye-off SVG */
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                                <line x1="1" y1="1" x2="23" y2="23" />
                                            </svg>
                                        ) : (
                                            /* Eye SVG */
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                <circle cx="12" cy="12" r="3" />
                                            </svg>
                                        )}
                                    </button>
                                </div>

                                {/* Live password rules */}
                                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {getRules(password).map(rule => (
                                        <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: rule.ok ? '#2e7d32' : (dark ? 'rgba(255,255,255,0.15)' : '#e0e0e0'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background-color 200ms' }}>
                                                {rule.ok && (
                                                    <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                                                        <path d="M1 3L3 5L7 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '12px', lineHeight: '16px', color: rule.ok ? '#2e7d32' : textMuted, transition: 'color 200ms' }}>
                                                {rule.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Marketing opt-in */}
                    <div style={{ marginTop: '24px' }}>
                        <div className="w-full flex items-start md:border-t-0 md:pt-0" style={{ borderTop: `1px solid ${divider}`, paddingTop: '24px' }}>
                            <button type="button" onClick={() => setMarketingOptIn(v => !v)} className="shrink-0"
                                style={{ width: '20px', height: '20px', marginTop: '2px', border: `1px solid ${marketingOptIn ? linkRed : checkBorder}`, borderRadius: '4px', backgroundColor: marketingOptIn ? linkRed : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 200ms', padding: 0 }}
                                aria-checked={marketingOptIn} role="checkbox">
                                {marketingOptIn && (
                                    <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                                        <path d="M1 4L4.5 7.5L11 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                )}
                            </button>
                            <span onClick={() => setMarketingOptIn(v => !v)} style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textBody, marginLeft: '8px', cursor: 'pointer' }}>
                                Yes, keep me up to date on news and exclusive offers on products including tobacco.
                            </span>
                        </div>
                    </div>

                    {/* Create Account button */}
                    <div style={{ marginTop: '28px' }}>
                        <button type="submit" disabled={loading || !allRulesPass}
                            className="w-full flex items-center justify-center rounded-[98px]"
                            style={{ backgroundColor: btnBg, height: '48px', border: 'none', cursor: loading || !allRulesPass ? 'not-allowed' : 'pointer', transition: 'background-color 200ms' }}>
                            <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: '20px', color: btnText, textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 200ms' }}>
                                {loading ? 'Creating Account…' : 'Create Account'}
                            </span>
                        </button>
                    </div>

                    {/* Legal */}
                    <div style={{ marginTop: '28px', textAlign: 'center' }}>
                        <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '12px', lineHeight: '16px', color: textMuted, margin: 0 }}>
                            By creating an account, I agree to the,{' '}
                            <a href="/terms-and-conditions" style={{ color: textMuted, textDecoration: 'underline' }}>Terms and Conditions</a>
                            {' '}and{' '}
                            <a href="/privacy-policy" style={{ color: textMuted, textDecoration: 'underline' }}>Privacy Policy</a>
                            {' '}and I certify that I am at least 21 years of age.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-center" style={{ marginTop: '28px', borderTop: `1px solid ${divider}`, paddingTop: '24px', paddingBottom: '24px', textAlign: 'center' }}>
                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textPrim }}>Have an account already?</span>
                        <Link href="/login" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', lineHeight: '20px', color: linkRed, marginLeft: '4px', textDecoration: 'underline' }}>Log In</Link>
                    </div>

                </form>
            </div>
        </div>
    );
}
