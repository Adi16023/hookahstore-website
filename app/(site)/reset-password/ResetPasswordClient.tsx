'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '../../../components/providers/ThemeProvider';

function EyeIcon({ open }: { open: boolean }) {
    return open ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20C5 20 1 12 1 12a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4C19 4 23 12 23 12a18.5 18.5 0 0 1-2.16 3.19M10.73 10.73a3 3 0 0 0 4.24 4.24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

const PASSWORD_RULES = [
    { label: 'More than 7 characters', test: (p: string) => p.length > 7 },
    { label: 'One uppercase letter (A–Z)', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter (a–z)', test: (p: string) => /[a-z]/.test(p) },
    { label: 'One special character (!@#…)', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

function ResetPasswordForm() {
    const { dark } = useTheme();
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get('token') ?? '';

    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [toastVisible, setToastVisible] = useState(false);

    /* Auto-redirect 3s after success */
    useEffect(() => {
        if (!success) return;
        const timer = setTimeout(() => router.push('/'), 3000);
        return () => clearTimeout(timer);
    }, [success]);

    const allRulesPassed = PASSWORD_RULES.every(r => r.test(password));
    const hasInput = password.length > 0;

    /* ── Theme tokens ── */
    const pageBg = dark ? '#121212' : '#ffffff';
    const titleColor = dark ? '#ffffff' : '#000000';
    const labelColor = dark ? '#ffffff' : '#101114';
    const inputBg = dark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const inputBorder = dark ? 'rgba(255,255,255,0.22)' : '#6c6d73';
    const inputText = dark ? '#ffffff' : '#101114';
    const iconColor = dark ? 'rgba(255,255,255,0.5)' : '#6c6d73';
    const hintText = dark ? 'rgba(255,255,255,0.45)' : '#6c6d73';
    const btnBg = allRulesPassed ? '#D32F2F' : (dark ? 'rgba(255,255,255,0.10)' : '#ebebed');
    const btnText = allRulesPassed ? '#ffffff' : (dark ? 'rgba(255,255,255,0.35)' : '#9ca3af');
    const required = '#b61c11';
    const rulePass = '#16a34a';
    const ruleFail = dark ? 'rgba(255,255,255,0.35)' : '#9ca3af';

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!allRulesPassed || loading) return;
        if (!token) { setError('Reset link is missing or invalid.'); return; }
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json() as { success?: boolean; error?: string };
            if (!res.ok || data.error) {
                setError(data.error || 'Something went wrong. Please try again.');
            } else {
                setSuccess(true);
                setToastVisible(true);
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', width: '100%', transition: 'background-color 200ms' }}>

            {/* ── Success Toast (fixed top) ── */}
            {toastVisible && (
                <div style={{
                    position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 9999, width: 'min(480px, calc(100vw - 32px))',
                    backgroundColor: '#f0fdf4', border: '1px solid #16a34a',
                    borderRadius: '12px', padding: '14px 16px',
                    display: 'flex', alignItems: 'flex-start', gap: '10px',
                    boxShadow: '0 4px 24px rgba(22,163,74,0.15)',
                    animation: 'fadeSlideIn 250ms ease',
                }}>
                    {/* Circle checkmark */}
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
                        <circle cx="10" cy="10" r="9.3" stroke="#16a34a" strokeWidth="1.4" fill="none" />
                        <path d="M5.5 10L8.5 13L14.5 7" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: '14px', lineHeight: '22px', color: '#15803d', margin: 0, flex: 1 }}>
                        <strong style={{ fontWeight: 700 }}>Success!</strong> Your password has been reset successfully.
                    </p>
                    <button
                        onClick={() => setToastVisible(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: '0 0 0 4px', display: 'flex', alignItems: 'center', flexShrink: 0 }}
                        aria-label="Dismiss"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4l8 8" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>
            )}

            <style>{`@keyframes fadeSlideIn { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>

            {/* Desktop & Tablet ≥768px */}
            <form onSubmit={handleSubmit}>
                <div className="hidden min-[768px]:flex flex-col items-center" style={{ paddingTop: '300px', paddingBottom: '80px' }}>
                    <h1 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: '32px', lineHeight: '44px', color: titleColor, textAlign: 'center', margin: '0 0 40px', transition: 'color 200ms' }}>
                        Create A New Password
                    </h1>

                    <div style={{ width: '480px' }}>
                        {/* Label */}
                        <div style={{ marginBottom: '8px' }}>
                            <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', color: labelColor, transition: 'color 200ms' }}>New Password</span>
                            <span style={{ color: required, marginLeft: '4px', fontSize: '12px' }}>*</span>
                        </div>

                        {/* Password input */}
                        <div style={{ position: 'relative', marginBottom: '10px' }}>
                            <input
                                type={showPw ? 'text' : 'password'}
                                placeholder="New Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="new-password"
                                style={{ width: '100%', backgroundColor: inputBg, border: `1px solid ${inputBorder}`, borderRadius: '8px', height: '52px', padding: '0 48px 0 16px', outline: 'none', color: inputText, fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', boxSizing: 'border-box', transition: 'background-color 200ms, border-color 200ms, color 200ms' }}
                            />
                            <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: iconColor, display: 'flex', alignItems: 'center', padding: 0 }}>
                                <EyeIcon open={showPw} />
                            </button>
                        </div>

                        {/* Password rules */}
                        {hasInput && (
                            <div style={{ marginBottom: '24px' }}>
                                {PASSWORD_RULES.map(rule => (
                                    <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <circle cx="7" cy="7" r="6.3" fill={rule.test(password) ? rulePass : 'transparent'} stroke={rule.test(password) ? rulePass : ruleFail} strokeWidth="1.2" />
                                            {rule.test(password) && <path d="M4 7L6.2 9.2L10 5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />}
                                        </svg>
                                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '12px', color: rule.test(password) ? rulePass : ruleFail, transition: 'color 200ms' }}>
                                            {rule.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!hasInput && (
                            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '13px', color: hintText, lineHeight: '20px', margin: '8px 0 24px', transition: 'color 200ms' }}>
                                Passwords must be longer than 7 characters and include special character and uppercase letter.
                            </p>
                        )}

                        {error && (
                            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: '13px', color: '#D32F2F', margin: '0 0 16px' }}>{error}</p>
                        )}

                        {/* Submit button */}
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <button type="submit" disabled={loading || !allRulesPassed} style={{ backgroundColor: btnBg, borderRadius: '98px', height: '52px', width: '280px', border: 'none', cursor: allRulesPassed ? 'pointer' : 'default', transition: 'background-color 200ms' }}>
                                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '1.5px', textTransform: 'uppercase', color: btnText, transition: 'color 200ms' }}>
                                    {loading ? 'Saving…' : 'Save Password'}
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Mobile ≤767px */}
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col items-center min-[768px]:hidden" style={{ padding: '120px 24px 64px' }}>
                    <h1 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: '24px', lineHeight: '34px', color: titleColor, textAlign: 'center', margin: '0 0 32px', transition: 'color 200ms' }}>
                        Create A New Password
                    </h1>

                    <div style={{ width: '100%', maxWidth: '390px' }}>
                        <div style={{ marginBottom: '8px' }}>
                            <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', color: labelColor, transition: 'color 200ms' }}>New Password</span>
                            <span style={{ color: required, marginLeft: '4px', fontSize: '12px' }}>*</span>
                        </div>

                        <div style={{ position: 'relative', marginBottom: '10px' }}>
                            <input
                                type={showPw ? 'text' : 'password'}
                                placeholder="New Password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                autoComplete="new-password"
                                style={{ width: '100%', backgroundColor: inputBg, border: `1px solid ${inputBorder}`, borderRadius: '8px', height: '48px', padding: '0 48px 0 16px', outline: 'none', color: inputText, fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', boxSizing: 'border-box', transition: 'background-color 200ms, border-color 200ms, color 200ms' }}
                            />
                            <button type="button" onClick={() => setShowPw(v => !v)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: iconColor, display: 'flex', alignItems: 'center', padding: 0 }}>
                                <EyeIcon open={showPw} />
                            </button>
                        </div>

                        {hasInput && (
                            <div style={{ marginBottom: '20px' }}>
                                {PASSWORD_RULES.map(rule => (
                                    <div key={rule.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                            <circle cx="7" cy="7" r="6.3" fill={rule.test(password) ? rulePass : 'transparent'} stroke={rule.test(password) ? rulePass : ruleFail} strokeWidth="1.2" />
                                            {rule.test(password) && <path d="M4 7L6.2 9.2L10 5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />}
                                        </svg>
                                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '12px', color: rule.test(password) ? rulePass : ruleFail, transition: 'color 200ms' }}>
                                            {rule.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!hasInput && (
                            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '13px', color: hintText, lineHeight: '20px', margin: '8px 0 20px', transition: 'color 200ms' }}>
                                Passwords must be longer than 7 characters and include special character and uppercase letter.
                            </p>
                        )}

                        {error && (
                            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: '13px', color: '#D32F2F', margin: '0 0 16px' }}>{error}</p>
                        )}

                        <button type="submit" disabled={loading || !allRulesPassed} style={{ width: '100%', backgroundColor: btnBg, borderRadius: '98px', height: '48px', border: 'none', cursor: allRulesPassed ? 'pointer' : 'default', transition: 'background-color 200ms' }}>
                            <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '1.5px', textTransform: 'uppercase', color: btnText, transition: 'color 200ms' }}>
                                {loading ? 'Saving…' : 'Save Password'}
                            </span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default function ResetPasswordClient() {
    return (
        <Suspense fallback={null}>
            <ResetPasswordForm />
        </Suspense>
    );
}
