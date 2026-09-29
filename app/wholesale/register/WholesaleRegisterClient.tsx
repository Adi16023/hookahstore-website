'use client';

import { useState, useRef } from 'react';
import { useTheme } from '../../../components/providers/ThemeProvider';
import { getRetailUrl } from '../../../lib/config';

/* ── Password rule checker (identical to retail) ── */
function getRules(pw: string) {
    return [
        { label: 'More than 7 characters',        ok: pw.length > 7 },
        { label: 'One uppercase letter (A–Z)',     ok: /[A-Z]/.test(pw) },
        { label: 'One lowercase letter (a–z)',     ok: /[a-z]/.test(pw) },
        { label: 'One special character (!@#…)',   ok: /[^A-Za-z0-9]/.test(pw) },
    ];
}

/* ── Checkmark icon (identical to retail) ── */
function CheckIcon({ stroke }: { stroke: string }) {
    return (
        <div className="relative shrink-0 overflow-hidden" style={{ width: '24px', height: '24px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ display: 'block', width: '100%', height: '100%' }}>
                <path d="M10.2552 0.70002L4.01204 8.30002L0.7 4.96932" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" transform="translate(6.52 7.5)" />
            </svg>
        </div>
    );
}

/* ── File picker (styled to match retail form inputs) ── */
function FileField({ id, label, required: req, disabled, onChange, filename, dark, inputBg, inputBorder, textPrim }: {
    id: string; label: string; required: boolean; disabled: boolean;
    onChange: (f: File | null) => void; filename: string;
    dark: boolean; inputBg: string; inputBorder: string; textPrim: string;
}) {
    const ref = useRef<HTMLInputElement>(null);
    const hasFile = Boolean(filename);
    return (
        <div>
            <label htmlFor={id} style={{ display: 'block', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textPrim, marginBottom: '8px', transition: 'color 200ms' }}>
                {label}{req && <span style={{ color: '#b61c11', fontSize: '12px' }}> *</span>}
                <span style={{ fontWeight: 400, fontSize: '11px', color: dark ? 'rgba(255,255,255,0.35)' : '#9ca3af', marginLeft: 6 }}>PDF, JPG or PNG — max 10 MB</span>
            </label>
            <div
                onClick={() => !disabled && ref.current?.click()}
                style={{
                    width: '100%', boxSizing: 'border-box',
                    backgroundColor: inputBg,
                    border: `1px dashed ${hasFile ? '#4ade80' : inputBorder}`,
                    borderRadius: '8px', height: '48px',
                    display: 'flex', alignItems: 'center', padding: '0 12px', gap: 10,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    transition: 'border-color 200ms',
                }}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: hasFile ? '#4ade80' : (dark ? 'rgba(255,255,255,0.35)' : '#9ca3af') }}>
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 13, color: hasFile ? '#4ade80' : (dark ? 'rgba(255,255,255,0.35)' : '#9ca3af'), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {filename || 'Click to select file…'}
                </span>
                {hasFile && (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, color: '#4ade80' }}>
                        <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                )}
            </div>
            <input ref={ref} id={id} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} disabled={disabled}
                onChange={e => onChange(e.target.files?.[0] ?? null)} />
        </div>
    );
}

/* ── Wholesale benefits (replaces retail benefits box) ── */
const wholesaleBenefits = [
    'Exclusive wholesale pricing on all products',
    'Dedicated account manager support',
    'Bulk order discounts and priority fulfilment',
    'Early access to new product launches',
];

function BenefitItem({ text, checkStroke, textCol }: { text: string; checkStroke: string; textCol: string }) {
    return (
        <div className="flex items-center" style={{ gap: 0 }}>
            <CheckIcon stroke={checkStroke} />
            <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textCol }}>{text}</span>
        </div>
    );
}

/* ── Success screen ── */
function SuccessScreen({ firstName, dark }: { firstName: string; dark: boolean }) {
    const pageBg   = dark ? '#121212' : '#ffffff';
    const textPrim = dark ? '#ffffff' : '#101114';
    const textMuted = dark ? 'rgba(255,255,255,0.55)' : '#6c6d73';
    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center', transition: 'background-color 200ms' }}>
            <div style={{ marginBottom: '28px' }}>
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#D32F2F', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                        <path d="M4 12L9 17L20 7" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            </div>
            <h1 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: '26px', lineHeight: '36px', color: textPrim, margin: '0 0 12px 0' }}>
                Application Submitted, {firstName}!
            </h1>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '15px', lineHeight: '24px', color: textMuted, margin: '0 0 32px 0', maxWidth: '440px' }}>
                Thank you for applying for a wholesale account. Our team will review your application and notify you via email once approved.
            </p>
            <a href="/wholesale" style={{ display: 'inline-block', backgroundColor: '#D32F2F', color: '#ffffff', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: '14px', letterSpacing: '1.5px', textTransform: 'uppercase', textDecoration: 'none', padding: '14px 40px', borderRadius: '98px' }}>
                Back to Wholesale
            </a>
        </div>
    );
}

/* ════════════════════════════════════════════════════════════
   Main component
════════════════════════════════════════════════════════════ */
export default function WholesaleRegisterClient() {
    const { dark } = useTheme();

    /* ── Colour tokens (identical to retail CreateAccountClient) ── */
    const pageBg      = dark ? '#121212' : '#ffffff';
    const topBarBg    = dark ? 'rgba(255,255,255,0.04)' : '#f6f5f8';
    const textPrim    = dark ? '#ffffff' : '#101114';
    const textMuted   = dark ? 'rgba(255,255,255,0.50)' : '#6c6d73';
    const inputBg     = dark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const inputBorder = dark ? 'rgba(255,255,255,0.25)' : '#6c6d73';
    const divider     = dark ? 'rgba(255,255,255,0.12)' : '#d7d8db';
    const required    = '#b61c11';
    const linkRed     = '#D32F2F';

    const inputStyle = { width: '100%', backgroundColor: inputBg, border: `1px solid ${inputBorder}`, borderRadius: '8px', height: '48px', padding: '0 12px', outline: 'none', color: textPrim, fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', transition: 'background-color 200ms, border-color 200ms, color 200ms' };
    const labelStyle = { display: 'block', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textPrim, marginBottom: '8px', transition: 'color 200ms' };
    const sectionStyle: React.CSSProperties = { fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '11px', color: dark ? 'rgba(255,255,255,0.40)' : '#6c6d73', letterSpacing: '0.1em', textTransform: 'uppercase', margin: '24px 0 16px', borderTop: `1px solid ${divider}`, paddingTop: '24px' };

    /* ── State ── */
    const [loading, setLoading]     = useState(false);
    const [step, setStep]           = useState<'idle' | 'registering' | 'uploading'>('idle');
    const [error, setError]         = useState('');
    const [password, setPassword]   = useState('');
    const [showPw, setShowPw]       = useState(false);
    const [success, setSuccess]     = useState<string | null>(null); // stores firstName
    const [gstCert, setGstCert]     = useState<File | null>(null);
    const [bizLicense, setBizLicense] = useState<File | null>(null);
    const [idDoc, setIdDoc]         = useState<File | null>(null);

    const allRulesPass = getRules(password).every(r => r.ok);
    const btnBg   = loading || !allRulesPass ? (dark ? 'rgba(255,255,255,0.06)' : '#ebebed') : '#D32F2F';
    const btnText = loading || !allRulesPass ? (dark ? 'rgba(255,255,255,0.30)' : '#6c6d73') : '#ffffff';

    if (success) return <SuccessScreen firstName={success} dark={dark} />;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!allRulesPass) return;
        setError('');

        if (!gstCert)    { setError('GST Certificate is required.'); return; }
        if (!bizLicense) { setError('Business License is required.'); return; }

        const ALLOWED = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        const MAX = 10 * 1024 * 1024;
        for (const [name, file] of [['GST Certificate', gstCert], ['Business License', bizLicense], ...(idDoc ? [['Identity Document', idDoc]] : [])] as [string, File][]) {
            if (!ALLOWED.includes(file.type)) { setError(`${name} must be a PDF, JPG, or PNG file.`); return; }
            if (file.size > MAX)              { setError(`${name} must be smaller than 10 MB.`); return; }
        }

        setLoading(true);
        setStep('registering');

        const fd = new FormData(e.currentTarget);
        const firstName = (fd.get('firstName') as string ?? '').trim();
        const lastName  = (fd.get('lastName')  as string ?? '').trim();
        const email     = (fd.get('email')     as string ?? '').trim();
        const businessName    = (fd.get('businessName')    as string ?? '').trim();
        const businessAddress = (fd.get('businessAddress') as string ?? '').trim();
        const businessPhone   = (fd.get('businessPhone')   as string ?? '').trim();
        const gstNumber       = (fd.get('gstNumber')       as string ?? '').trim();
        const businessWebsite = (fd.get('businessWebsite') as string ?? '').trim();

        let customerId = '';
        let res: Response;
        try {
            res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, lastName, email, password, registrationSource: 'wholesale', businessName, businessAddress, businessPhone, gstNumber, businessWebsite }),
            });
        } catch {
            setError('Could not reach the server. Please check your connection and try again.');
            setLoading(false); setStep('idle');
            return;
        }

        let data: { error?: string; customerId?: string } = {};
        try {
            data = await res.json();
        } catch {
            setError(`Server error (${res.status}). Please try again or contact support.`);
            setLoading(false); setStep('idle');
            return;
        }

        if (!res.ok) { setError(data.error ?? 'Registration failed. Please try again.'); setLoading(false); setStep('idle'); return; }
        customerId = data.customerId ?? '';
        if (!customerId) { setSuccess(firstName); return; }

        setStep('uploading');
        try {
            const docFd = new FormData();
            docFd.append('customerId', customerId);
            docFd.append('gstCertificate', gstCert);
            docFd.append('businessLicense', bizLicense);
            if (idDoc) docFd.append('identityDocument', idDoc);
            await fetch('/api/wholesale/upload-documents', { method: 'POST', body: docFd });
        } catch { /* non-fatal */ } finally {
            setLoading(false);
            setStep('idle');
        }
        setSuccess(firstName);
    }

    const btnLabel = step === 'registering' ? 'Creating Account…' : step === 'uploading' ? 'Uploading Documents…' : 'Apply for Wholesale Account';

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', width: '100%', transition: 'background-color 200ms' }}>

            {/* Top bar */}
            <div style={{ backgroundColor: topBarBg, height: '72px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background-color 200ms' }}>
                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: linkRed, fontSize: '14px' }}>
                    Wholesale Partner Application
                </span>
            </div>

            <div className="w-full px-[16px] md:px-[89px] xl:px-[297px]" style={{ paddingTop: '48px', paddingBottom: '0' }}>

                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '64px' }}>
                    <h1 className="text-[18px] leading-[28px] md:text-[26px] md:leading-[40px]"
                        style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: textPrim, margin: 0, transition: 'color 200ms' }}>
                        Apply for a Wholesale Account
                    </h1>
                </div>

                {/* Wholesale benefits box */}
                <div className="rounded-[8px]" style={{ backgroundColor: topBarBg, padding: '20px 16px 16px 16px', marginBottom: '44px', transition: 'background-color 200ms' }}>
                    <div className="text-[14px] leading-[20px] md:text-[16px] md:leading-[24px]"
                        style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: textPrim, marginBottom: '12px' }}>
                        Wholesale Partner Benefits
                    </div>
                    <div className="block md:hidden">
                        <div className="flex flex-col">
                            {wholesaleBenefits.map(b => <BenefitItem key={b} text={b} checkStroke={textPrim} textCol={textPrim} />)}
                        </div>
                    </div>
                    <div className="hidden md:grid md:grid-cols-2">
                        <div className="flex flex-col">
                            <BenefitItem text={wholesaleBenefits[0]} checkStroke={textPrim} textCol={textPrim} />
                            <BenefitItem text={wholesaleBenefits[2]} checkStroke={textPrim} textCol={textPrim} />
                        </div>
                        <div className="flex flex-col">
                            <BenefitItem text={wholesaleBenefits[1]} checkStroke={textPrim} textCol={textPrim} />
                            <BenefitItem text={wholesaleBenefits[3]} checkStroke={textPrim} textCol={textPrim} />
                        </div>
                    </div>
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit} noValidate>

                    {error && (
                        <div style={{ backgroundColor: dark ? 'rgba(211,47,47,0.12)' : '#fff0f0', border: '1px solid #f5c6cb', borderRadius: '8px', padding: '12px 16px', marginBottom: '24px' }}>
                            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '14px', color: '#D32F2F', margin: 0 }}>{error}</p>
                        </div>
                    )}

                    {/* ── Personal Information ── */}
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

                    {/* Email + Password */}
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
                                <div style={{ position: 'relative' }}>
                                    <input type={showPw ? 'text' : 'password'} name="password" autoComplete="new-password" required value={password} onChange={e => setPassword(e.target.value)} style={{ ...inputStyle, padding: '0 44px 0 12px' }} />
                                    <button type="button" onClick={() => setShowPw(v => !v)} aria-label={showPw ? 'Hide password' : 'Show password'}
                                        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: textMuted }}>
                                        {showPw ? (
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

                                {/* Live password rules — identical to retail */}
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

                    {/* ── Business Information ── */}
                    <p style={sectionStyle}>Business Information</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        {([
                            { label: 'Business Name',    name: 'businessName',    type: 'text', placeholder: 'Your Business Pvt. Ltd.', req: true },
                            { label: 'Business Address', name: 'businessAddress', type: 'text', placeholder: '123 Business St, City', req: false },
                            { label: 'Phone Number',     name: 'businessPhone',   type: 'tel',  placeholder: '+91 98765 43210', req: false },
                            { label: 'GST Number',       name: 'gstNumber',       type: 'text', placeholder: 'GSTIN (optional)', req: false },
                            { label: 'Website',          name: 'businessWebsite', type: 'url',  placeholder: 'https://yourbusiness.com (optional)', req: false },
                        ] as const).map(f => (
                            <div key={f.name}>
                                <label style={labelStyle}>{f.label} {f.req && <span style={{ color: required, fontSize: '12px' }}>*</span>}</label>
                                <input type={f.type} name={f.name} placeholder={f.placeholder} required={f.req} style={inputStyle} />
                            </div>
                        ))}
                    </div>

                    {/* ── Business Documents ── */}
                    <p style={sectionStyle}>Business Documents</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <FileField id="ws-reg-gst"     label="GST Certificate"   required={true}  disabled={loading} onChange={setGstCert}    filename={gstCert?.name ?? ''}    dark={dark} inputBg={inputBg} inputBorder={inputBorder} textPrim={textPrim} />
                        <FileField id="ws-reg-license" label="Business License"  required={true}  disabled={loading} onChange={setBizLicense} filename={bizLicense?.name ?? ''} dark={dark} inputBg={inputBg} inputBorder={inputBorder} textPrim={textPrim} />
                        <FileField id="ws-reg-id"      label="Identity Document" required={false} disabled={loading} onChange={setIdDoc}      filename={idDoc?.name ?? ''}      dark={dark} inputBg={inputBg} inputBorder={inputBorder} textPrim={textPrim} />
                    </div>

                    {step === 'uploading' && (
                        <div style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#f9f9f9', border: `1px solid ${divider}`, borderRadius: '8px', padding: '12px 16px', marginTop: '24px', textAlign: 'center' }}>
                            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: '13px', color: textMuted, margin: 0 }}>Uploading your documents to secure storage…</p>
                        </div>
                    )}

                    {/* Submit */}
                    <div style={{ marginTop: '28px' }}>
                        <button type="submit" disabled={loading || !allRulesPass}
                            className="w-full flex items-center justify-center rounded-[98px]"
                            style={{ backgroundColor: btnBg, height: '48px', border: 'none', cursor: loading || !allRulesPass ? 'not-allowed' : 'pointer', transition: 'background-color 200ms' }}>
                            <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: '20px', color: btnText, textTransform: 'uppercase', letterSpacing: '1px', transition: 'color 200ms' }}>
                                {btnLabel}
                            </span>
                        </button>
                    </div>

                    {/* Legal */}
                    <div style={{ marginTop: '28px', textAlign: 'center' }}>
                        <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '12px', lineHeight: '16px', color: textMuted, margin: 0 }}>
                            By applying, I agree to the{' '}
                            <a href={getRetailUrl('/terms-and-conditions')} target="_blank" rel="noopener noreferrer" style={{ color: textMuted, textDecoration: 'underline' }}>Terms and Conditions</a>
                            {' '}and{' '}
                            <a href={getRetailUrl('/privacy-policy')} target="_blank" rel="noopener noreferrer" style={{ color: textMuted, textDecoration: 'underline' }}>Privacy Policy</a>.
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-center" style={{ marginTop: '28px', borderTop: `1px solid ${divider}`, paddingTop: '24px', paddingBottom: '24px', textAlign: 'center' }}>
                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textPrim }}>Already a wholesale partner?</span>
                        <a href="/wholesale/login" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', lineHeight: '20px', color: linkRed, marginLeft: '4px', textDecoration: 'underline' }}>Log In</a>
                    </div>

                </form>
            </div>
        </div>
    );
}
