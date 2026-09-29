'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../../../components/providers/ThemeProvider';
import { getWholesaleUrl } from '../../../../lib/config';

export default function LoginClient() {
    const { dark } = useTheme();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const pageBg = dark ? '#121212' : '#ffffff';
    const topBarBg = dark ? 'rgba(255,255,255,0.04)' : '#f6f5f8';
    const textPrim = dark ? '#ffffff' : '#101114';
    const textMuted = dark ? 'rgba(255,255,255,0.45)' : '#6c6d73';
    const inputBg = dark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const inputBorder = dark ? 'rgba(255,255,255,0.22)' : '#6c6d73';
    const divider = dark ? 'rgba(255,255,255,0.12)' : '#d7d8db';
    const required = '#b61c11';
    const linkRed = '#D32F2F';

    const btnBg = loading ? (dark ? 'rgba(255,255,255,0.06)' : '#ebebed') : '#D32F2F';
    const btnText = loading ? (dark ? 'rgba(255,255,255,0.30)' : '#6c6d73') : '#ffffff';

    const labelStyle: React.CSSProperties = {
        display: 'flex',
        alignItems: 'center',
        height: '20px',
        marginBottom: '8px',
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        backgroundColor: inputBg,
        border: `1px solid ${inputBorder}`,
        borderRadius: '8px',
        height: '48px',
        padding: '0 16px',
        outline: 'none',
        color: textPrim,
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 400,
        fontSize: '14px',
        transition: 'background-color 200ms, border-color 200ms, color 200ms',
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const form = new FormData(e.currentTarget);
        const email = (form.get('email') as string ?? '').trim();
        const password = (form.get('password') as string ?? '');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json() as { error?: string };

            if (!res.ok) {
                setError(data.error ?? 'Invalid email or password.');
                return;
            }

            router.push('/account');
        } catch {
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', width: '100%', fontFamily: "var(--font-montserrat), sans-serif", transition: 'background-color 200ms' }}>

            <div style={{ backgroundColor: topBarBg, height: '72px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 200ms' }}>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '14px', lineHeight: '20px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, color: textPrim, transition: 'color 200ms' }}>Have a Business?</span>
                    <span style={{ display: 'inline-block', width: '4px' }} />
                    <a href={getWholesaleUrl('/login')} style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: linkRed, textDecoration: 'underline' }}>Log in Business Account</a>
                </div>
            </div>

            <div className="login-page-container" style={{ position: 'relative' }}>

                <h1 className="login-page-title" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: textPrim, textAlign: 'center', margin: 0, transition: 'color 200ms' }}>
                    Log In
                </h1>

                <form className="login-page-form" onSubmit={handleSubmit} noValidate style={{ position: 'relative' }}>

                    {error && (
                        <div style={{ backgroundColor: dark ? 'rgba(211,47,47,0.12)' : '#fff2f2', border: '1px solid #D32F2F', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                            {/* Warning icon */}
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#D32F2F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="12" y1="9" x2="12" y2="13" stroke="#D32F2F" strokeWidth="1.6" strokeLinecap="round" />
                                <line x1="12" y1="17" x2="12.01" y2="17" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '22px', color: '#D32F2F', margin: 0 }}>
                                {error}&nbsp;
                                <a href="/forgot-password" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: '14px', color: '#D32F2F', textDecoration: 'none' }}>
                                    Did you forget your password?
                                </a>
                            </p>
                        </div>
                    )}

                    <div style={labelStyle}>
                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textPrim, transition: 'color 200ms' }}>Email</span>
                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '12px', lineHeight: '16px', color: required, marginLeft: '3.69px' }}>*</span>
                    </div>
                    <input type="email" name="email" autoComplete="email" placeholder="Email" required style={inputStyle} />

                    <div style={{ ...labelStyle, marginTop: '16px' }}>
                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textPrim, transition: 'color 200ms' }}>Password</span>
                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '12px', lineHeight: '16px', color: required, marginLeft: '3.61px' }}>*</span>
                    </div>
                    <div style={{ position: 'relative' }}>
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            autoComplete="current-password"
                            placeholder="Password"
                            required
                            style={{ ...inputStyle, paddingRight: '44px' }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(v => !v)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted }}
                        >
                            {showPassword ? (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                    <line x1="1" y1="1" x2="23" y2="23" />
                                </svg>
                            ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <Link href="/forgot-password" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', lineHeight: '20px', color: linkRed, textDecoration: 'underline' }}>
                            Forgot password?
                        </Link>
                    </div>

                    <div className="login-page-btn-wrapper" style={{ marginTop: '16px', display: 'flex' }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="login-page-btn"
                            style={{ backgroundColor: btnBg, borderRadius: '98px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background-color 200ms' }}
                        >
                            <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: '20px', color: btnText, letterSpacing: '1px', textTransform: 'uppercase', transition: 'color 200ms' }}>
                                {loading ? 'Logging in…' : 'Log In'}
                            </span>
                        </button>
                    </div>

                    <div style={{ marginTop: '16px', textAlign: 'center' }}>
                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '12px', lineHeight: '16px', color: textMuted, transition: 'color 200ms' }}>
                            I confirm that I&apos;m 21 years old or above
                        </span>
                    </div>

                    <div style={{ marginTop: '24px', borderTop: `1px solid ${divider}`, paddingTop: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '4px', transition: 'border-color 200ms', paddingBottom: '48px' }}>
                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textPrim, transition: 'color 200ms' }}>
                            Don&apos;t have an account already?
                        </span>
                        <Link href="/register" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', lineHeight: '20px', color: linkRed, textDecoration: 'underline' }}>
                            Create Account
                        </Link>
                    </div>

                </form>
            </div>

            <style>{`
                .login-page-container { margin-left: 515px; margin-right: 515px; padding-top: 120px; }
                .login-page-title     { font-size: 26px; line-height: 40px; margin-bottom: 24px; }
                .login-page-form      { width: 100%; }
                .login-page-btn-wrapper { justify-content: center; }
                .login-page-btn       { width: 122.21px; }

                @media (min-width: 768px) and (max-width: 1279px) {
                    .login-page-container { margin-left: 307px; margin-right: 307px; padding-top: 120px; }
                    .login-page-title     { font-size: 26px; line-height: 40px; margin-bottom: 24px; }
                    .login-page-btn-wrapper { justify-content: center; }
                    .login-page-btn       { width: 122.21px; }
                }

                @media (max-width: 767px) {
                    .login-page-container { margin-left: 0; margin-right: 0; padding-left: 16px; padding-right: 16px; padding-top: 56px; }
                    .login-page-title     { font-size: 18px; line-height: 28px; margin-bottom: 24px; }
                    .login-page-btn-wrapper { justify-content: flex-start; }
                    .login-page-btn       { width: 100%; }
                }
            `}</style>
        </div>
    );
}
