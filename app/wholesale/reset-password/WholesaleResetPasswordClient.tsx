'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '../../../components/providers/ThemeProvider';
import { useWholesaleHref } from '../../../lib/config/use-wholesale-path';

/* Same rules as /api/auth/reset-password */
const RULES = [
    { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p: string) => /[A-Z]/.test(p) },
    { label: 'One special character', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function WholesaleResetPasswordClient() {
    const { dark } = useTheme();
    const href = useWholesaleHref();
    const token = useSearchParams().get('token') ?? '';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [done, setDone] = useState<'sent' | 'reset' | null>(null);

    /* ── Theme tokens (match wholesale login) ── */
    const textPrim    = dark ? '#ffffff' : '#101114';
    const textMuted   = dark ? 'rgba(255,255,255,0.55)' : '#6c6d73';
    const inputBg     = dark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const inputBorder = dark ? 'rgba(255,255,255,0.22)' : '#6c6d73';
    const cardBorder  = dark ? 'rgba(255,255,255,0.12)' : '#d7d8db';
    const ok          = dark ? '#4caf50' : '#2e7d32';
    const M = "var(--font-montserrat), sans-serif";

    const inputStyle: React.CSSProperties = { width: '100%', backgroundColor: inputBg, border: `1px solid ${inputBorder}`, borderRadius: 8, height: 48, padding: '0 16px', outline: 'none', color: textPrim, fontFamily: M, fontSize: 14, boxSizing: 'border-box', transition: 'background-color 200ms, border-color 200ms, color 200ms' };
    const labelStyle: React.CSSProperties = { display: 'block', fontFamily: M, fontWeight: 500, fontSize: 13, color: textPrim, marginBottom: 6 };
    const btnStyle = (disabled: boolean): React.CSSProperties => ({ width: '100%', height: 48, borderRadius: 98, border: 'none', background: disabled ? (dark ? 'rgba(255,255,255,0.08)' : '#ebebed') : '#D32F2F', color: disabled ? textMuted : '#ffffff', fontFamily: M, fontWeight: 700, fontSize: 14, letterSpacing: '1.2px', textTransform: 'uppercase', cursor: disabled ? 'not-allowed' : 'pointer' });

    const allRulesPass = RULES.every(r => r.test(password));
    const canReset = allRulesPass && password === confirm && !loading;

    async function requestLink(e: React.FormEvent) {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true); setError('');
        try {
            await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), source: 'wholesale' }),
            });
            setDone('sent'); // always the same message (no account enumeration)
        } catch {
            setError('Network error — please try again.');
        } finally {
            setLoading(false);
        }
    }

    async function resetPassword(e: React.FormEvent) {
        e.preventDefault();
        if (!canReset) return;
        setLoading(true); setError('');
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });
            const data = await res.json() as { error?: string };
            if (!res.ok) { setError(data.error ?? 'Could not reset your password.'); return; }
            setDone('reset');
        } catch {
            setError('Network error — please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20" style={{ fontFamily: M }}>
            <div style={{ width: '100%', maxWidth: 440 }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <span style={{ display: 'inline-block', backgroundColor: '#D32F2F', color: '#ffffff', fontWeight: 700, fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '3px 10px', borderRadius: 4, marginBottom: 16 }}>
                        Wholesale Portal
                    </span>
                    <h1 style={{ fontWeight: 700, fontSize: 28, color: textPrim, margin: '0 0 8px', transition: 'color 200ms' }}>
                        {token ? 'Choose a New Password' : 'Reset Your Password'}
                    </h1>
                    <p style={{ fontSize: 14, color: textMuted, margin: 0, lineHeight: '22px' }}>
                        {token ? 'Enter a new password for your wholesale account.' : "Enter your account email and we'll send you a reset link."}
                    </p>
                </div>

                {done === 'sent' ? (
                    <div role="status" style={{ border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '20px 18px', textAlign: 'center' }}>
                        <p style={{ fontWeight: 600, fontSize: 15, color: textPrim, margin: '0 0 6px' }}>Check your email</p>
                        <p style={{ fontSize: 14, color: textMuted, margin: 0, lineHeight: '22px' }}>
                            If an account exists for <strong style={{ color: textPrim }}>{email}</strong>, a reset link is on its way. It expires in 1 hour — check your spam folder too.
                        </p>
                    </div>
                ) : done === 'reset' ? (
                    <div role="status" style={{ border: `1px solid ${cardBorder}`, borderRadius: 12, padding: '20px 18px', textAlign: 'center' }}>
                        <p style={{ fontWeight: 600, fontSize: 15, color: ok, margin: '0 0 12px' }}>Your password has been updated.</p>
                        <Link href={href('/login')} style={{ ...btnStyle(false), display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 'auto', padding: '0 28px', textDecoration: 'none' }}>
                            Log in
                        </Link>
                    </div>
                ) : token ? (
                    <form onSubmit={resetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label htmlFor="ws-new-pw" style={labelStyle}>New password</label>
                            <input id="ws-new-pw" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} required />
                        </div>
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {RULES.map(r => (
                                <li key={r.label} style={{ fontSize: 12, color: r.test(password) ? ok : textMuted }}>{r.test(password) ? '✓' : '•'} {r.label}</li>
                            ))}
                        </ul>
                        <div>
                            <label htmlFor="ws-confirm-pw" style={labelStyle}>Confirm password</label>
                            <input id="ws-confirm-pw" type="password" autoComplete="new-password" value={confirm} onChange={e => setConfirm(e.target.value)} style={inputStyle} required />
                            {confirm && confirm !== password && <p style={{ fontSize: 12, color: '#D32F2F', margin: '6px 0 0' }}>Passwords don&apos;t match.</p>}
                        </div>
                        {error && <p role="alert" style={{ fontSize: 13, color: '#D32F2F', margin: 0 }}>{error}</p>}
                        <button type="submit" disabled={!canReset} style={btnStyle(!canReset)}>{loading ? 'Saving…' : 'Update password'}</button>
                    </form>
                ) : (
                    <form onSubmit={requestLink} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div>
                            <label htmlFor="ws-reset-email" style={labelStyle}>Email <span style={{ color: '#D32F2F' }}>*</span></label>
                            <input id="ws-reset-email" type="email" autoComplete="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} required />
                        </div>
                        {error && <p role="alert" style={{ fontSize: 13, color: '#D32F2F', margin: 0 }}>{error}</p>}
                        <button type="submit" disabled={loading || !email.trim()} style={btnStyle(loading || !email.trim())}>{loading ? 'Sending…' : 'Send reset link'}</button>
                    </form>
                )}

                <p style={{ fontSize: 13, color: textMuted, textAlign: 'center', marginTop: 24 }}>
                    Back to{' '}
                    <Link href={href('/login')} style={{ color: '#D32F2F', textDecoration: 'underline' }}>Wholesale Login</Link>
                </p>
            </div>
        </div>
    );
}
