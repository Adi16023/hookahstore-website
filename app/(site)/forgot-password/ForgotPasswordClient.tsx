'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../components/providers/ThemeProvider';

const MAX_RESENDS = 3;
const COOLDOWN_SECONDS = 30;

export default function ForgotPasswordClient() {
    const { dark } = useTheme();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    // Resend state
    const [resendCount, setResendCount] = useState(0);
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSuccess, setResendSuccess] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const hasEmail = email.trim().length > 0;
    const resendBlocked = resendCount >= MAX_RESENDS || cooldown > 0;

    const pageBg = dark ? '#121212' : '#ffffff';
    const titleColor = dark ? '#ffffff' : '#000000';
    const bodyColor = dark ? '#d6d7db' : '#1b1c1f';
    const labelColor = dark ? '#ffffff' : '#101114';
    const inputBg = dark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const inputBorder = dark ? 'rgba(255,255,255,0.22)' : '#6c6d73';
    const inputText = dark ? '#ffffff' : '#101114';
    const btnBg = hasEmail ? '#D32F2F' : (dark ? 'rgba(255,255,255,0.10)' : '#ebebed');
    const btnText = hasEmail ? '#ffffff' : (dark ? 'rgba(255,255,255,0.45)' : '#6c6d73');
    const divider = dark ? 'rgba(255,255,255,0.12)' : '#d7d8db';
    const backText = dark ? 'rgba(255,255,255,0.70)' : '#101114';
    const hintText = dark ? 'rgba(255,255,255,0.45)' : '#9ca3af';
    const successText = dark ? '#6ee7b7' : '#1b7a4a';
    const required = '#b61c11';

    const headingStyle = (fontSize: string, lineHeight: string): React.CSSProperties => ({
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 600, fontSize, lineHeight,
        color: titleColor, textAlign: 'center', margin: 0, transition: 'color 200ms',
    });

    const bodyStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 400, fontSize: '14px', lineHeight: '20px',
        color: bodyColor, textAlign: 'center', transition: 'color 200ms', ...extra,
    });

    /* Start cooldown timer */
    function startCooldown() {
        setCooldown(COOLDOWN_SECONDS);
        if (cooldownRef.current) clearInterval(cooldownRef.current);
        cooldownRef.current = setInterval(() => {
            setCooldown(prev => {
                if (prev <= 1) {
                    clearInterval(cooldownRef.current!);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }

    useEffect(() => () => { if (cooldownRef.current) clearInterval(cooldownRef.current); }, []);

    async function callApi(emailAddr: string) {
        const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: emailAddr }),
        });
        if (!res.ok) {
            const data = await res.json() as { error?: string };
            throw new Error(data?.error || 'Something went wrong.');
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!hasEmail || loading) return;
        setLoading(true); setError('');
        try {
            await callApi(email.trim().toLowerCase());
            setSent(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        if (resendBlocked || resendLoading) return;
        setResendLoading(true); setResendSuccess(false);
        try {
            await callApi(email.trim().toLowerCase());
            setResendCount(c => c + 1);
            setResendSuccess(true);
            startCooldown();
            // Auto-hide the success message after 4s
            setTimeout(() => setResendSuccess(false), 4000);
        } catch {
            // Silent — still show the success screen
        } finally {
            setResendLoading(false);
        }
    }

    /* ── Resend section (shared between desktop/mobile) ─── */
    function ResendSection() {
        return (
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', color: hintText, lineHeight: '20px', margin: '0 0 4px', transition: 'color 200ms' }}>
                    The email may take a few minutes to arrive.
                </p>
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', color: hintText, lineHeight: '20px', margin: '0 0 20px', transition: 'color 200ms' }}>
                    Please check your spam folder.
                </p>

                {/* Resend button */}
                {resendCount < MAX_RESENDS ? (
                    <button
                        onClick={handleResend}
                        disabled={resendBlocked || resendLoading}
                        style={{
                            fontFamily: "var(--font-montserrat), sans-serif",
                            fontWeight: 600,
                            fontSize: '14px',
                            color: resendBlocked ? hintText : '#D32F2F',
                            textDecoration: resendBlocked ? 'none' : 'underline',
                            background: 'none', border: 'none',
                            cursor: resendBlocked ? 'not-allowed' : 'pointer',
                            transition: 'color 200ms',
                        }}
                    >
                        {resendLoading
                            ? 'Sending…'
                            : cooldown > 0
                                ? `Resend available in ${cooldown}s`
                                : 'Resend the Email'}
                    </button>
                ) : (
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '13px', color: hintText, margin: 0 }}>
                        Maximum resend limit reached. Please try again later.
                    </p>
                )}

                {/* ✓ Confirmation message */}
                {resendSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '12px' }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M2.5 8L6.5 12L13.5 4" stroke={successText} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '14px', color: successText, transition: 'color 200ms' }}>
                            A new email has been sent to you.
                        </span>
                    </div>
                )}
            </div>
        );
    }

    /* ── Success screen ─────────────────────────────────────── */
    if (sent) {
        return (
            <div style={{ backgroundColor: pageBg, minHeight: '100vh', width: '100%', transition: 'background-color 200ms' }}>
                {/* Desktop & Tablet */}
                <div className="hidden min-[768px]:flex flex-col items-center" style={{ paddingTop: '300px', paddingBottom: '80px' }}>
                    <h1 style={headingStyle('26px', '40px')}>Check Your Email</h1>
                    <p style={bodyStyle({ marginTop: '24px', marginBottom: 0, maxWidth: '520px' })}>
                        A link to reset your password has been sent to <strong style={{ color: titleColor }}>{email}</strong>. Please click on the link (valid for 2 hours) to create a new password.
                    </p>
                    <div style={{ width: '399px', marginTop: '32px' }}>
                        <div style={{ borderTop: `1px solid ${divider}`, paddingTop: '24px', transition: 'border-color 200ms' }}>
                            <ResendSection />
                        </div>
                    </div>
                </div>

                {/* Mobile */}
                <div className="flex flex-col items-center min-[768px]:hidden" style={{ padding: '220px 24px 64px' }}>
                    <h1 style={headingStyle('20px', '30px')}>Check Your Email</h1>
                    <p style={bodyStyle({ marginTop: '20px', marginBottom: 0, maxWidth: 'calc(100vw - 48px)' })}>
                        A link to reset your password has been sent to <strong style={{ color: titleColor }}>{email}</strong>. Please click on the link (valid for 2 hours) to create a new password.
                    </p>
                    <div style={{ width: '100%', maxWidth: '390px', marginTop: '28px' }}>
                        <div style={{ borderTop: `1px solid ${divider}`, paddingTop: '24px', transition: 'border-color 200ms' }}>
                            <ResendSection />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Main form ──────────────────────────────────────────── */
    function EmailLabel() {
        return (
            <div style={{ marginBottom: '8px' }}>
                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: labelColor, textTransform: 'capitalize', transition: 'color 200ms' }}>Email</span>
                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '12px', lineHeight: '16px', color: required, marginLeft: '4px' }}>*</span>
            </div>
        );
    }

    function EmailInputField() {
        return (
            <input
                type="email" placeholder="Email" autoComplete="email"
                value={email} onChange={e => setEmail(e.target.value)}
                style={{ width: '100%', backgroundColor: inputBg, border: `1px solid ${inputBorder}`, borderRadius: '8px', height: '48px', padding: '0 16px', outline: 'none', color: inputText, fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', transition: 'background-color 200ms, border-color 200ms, color 200ms', boxSizing: 'border-box' }}
            />
        );
    }

    function SendButton({ fullWidth }: { fullWidth?: boolean }) {
        return (
            <button type="submit" disabled={loading} style={{ backgroundColor: btnBg, borderRadius: '98px', height: '48px', width: fullWidth ? '100%' : '208.52px', border: 'none', cursor: hasEmail ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 200ms' }}>
                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: '20px', color: btnText, letterSpacing: '1px', textTransform: 'uppercase', transition: 'color 200ms' }}>
                    {loading ? 'Sending…' : 'Send Reset link'}
                </span>
            </button>
        );
    }

    function BackToLogin({ marginTop }: { marginTop: string }) {
        return (
            <div style={{ marginTop, borderTop: `1px solid ${divider}`, paddingTop: '25px', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'border-color 200ms' }}>
                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: backText, transition: 'color 200ms' }}>Back to </span>
                <Link href="/login" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', lineHeight: '20px', color: '#D32F2F', textDecoration: 'underline', marginLeft: '4px' }}>
                    Log In
                </Link>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', width: '100%', transition: 'background-color 200ms' }}>
            <form onSubmit={handleSubmit}>
                <div className="hidden min-[768px]:flex flex-col items-center" style={{ paddingTop: '356px', paddingBottom: '80px' }}>
                    <h1 style={headingStyle('26px', '40px')}>Reset Your Password</h1>
                    <p style={bodyStyle({ marginTop: '28px', marginBottom: 0, width: '399px' })}>
                        Enter the email address associated with your account, and we will send you a link to reset your password.
                    </p>
                    <div style={{ width: '399px', marginTop: '28px' }}>
                        <EmailLabel />
                        <EmailInputField />
                        {error && <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: '13px', color: '#D32F2F', margin: '6px 0 0', textAlign: 'left' }}>{error}</p>}
                        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'center' }}>
                            <SendButton />
                        </div>
                        <BackToLogin marginTop="32px" />
                    </div>
                </div>
            </form>

            <form onSubmit={handleSubmit}>
                <div className="flex flex-col items-center min-[768px]:hidden" style={{ paddingTop: '256px', paddingBottom: '64px' }}>
                    <h1 style={headingStyle('18px', '28px')}>Reset Your Password</h1>
                    <p style={bodyStyle({ marginTop: '24px', marginBottom: 0, width: '349px', maxWidth: 'calc(100vw - 32px)' })}>
                        Enter the email address associated with your account, and we will send you a link to reset your password.
                    </p>
                    <div style={{ width: '100%', maxWidth: '390px', marginTop: '16px', padding: '0 16px', boxSizing: 'border-box' }}>
                        <EmailLabel />
                        <EmailInputField />
                        {error && <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: '13px', color: '#D32F2F', margin: '6px 0 0', textAlign: 'left' }}>{error}</p>}
                        <div style={{ marginTop: '28px' }}>
                            <SendButton fullWidth />
                        </div>
                        <BackToLogin marginTop="28px" />
                    </div>
                </div>
            </form>
        </div>
    );
}
