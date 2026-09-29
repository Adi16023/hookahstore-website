'use client';
export const runtime = 'edge';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SiteLogo from '../../../components/layout/SiteLogo';
import { toIsoDob, storeDob } from '../../../lib/utils/dob';

// Keep in sync with AgeGate.tsx — true = always show flow for testing
const DEV_TEST_MODE = false;

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

function calculateAge(month: number, day: number, year: number): number {
    const today = new Date();
    const birth = new Date(year, month - 1, day);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
}

export default function AgeVerificationPage() {
    const router = useRouter();

    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [year, setYear] = useState('');
    const [error, setError] = useState('');
    const [checking, setChecking] = useState(true);

    // If already verified (and not in test mode), redirect home immediately
    useEffect(() => {
        if (!DEV_TEST_MODE && localStorage.getItem('ageVerified') === 'true') {
            router.replace('/');
        } else {
            setChecking(false);
        }
    }, [router]);

    const handleVerify = () => {
        setError('');

        if (!month || !day || !year) {
            setError('Please fill in all fields — Month, Day, and Year.');
            return;
        }

        const m = parseInt(month);
        const d = parseInt(day);
        const y = parseInt(year);

        if (isNaN(m) || isNaN(d) || isNaN(y) || y < 1900 || y > new Date().getFullYear()) {
            setError('Please enter a valid date of birth.');
            return;
        }

        // Rejects impossible dates such as 31/02
        const isoDob = toIsoDob(y, m, d);
        if (!isoDob) {
            setError('Please enter a valid date of birth.');
            return;
        }

        const age = calculateAge(m, d, y);

        if (age >= 21) {
            localStorage.setItem('ageVerified', 'true');
            // Saved as ISO so signup + checkout can pre-fill the date of birth
            storeDob(isoDob);
            router.replace('/');
        } else {
            // Under 21 — show brief message then redirect away
            setError('You must be at least 21 years old to enter this site. Redirecting you away…');
            setTimeout(() => {
                window.location.href = 'https://www.google.com';
            }, 2500);
        }
    };

    const handleDayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 31)) setDay(val);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '');
        if (val.length <= 4) setYear(val);
    };

    if (checking) return null;

    const selectStyle: React.CSSProperties = {
        height: 56,
        backgroundColor: '#181818',
        border: '2px solid transparent',
        borderRadius: 10,
        color: month ? '#ffffff' : '#888',
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 600,
        fontSize: 16,
        padding: '0 16px',
        cursor: 'pointer',
        outline: 'none',
        boxShadow: '0 0 0 2px rgba(91,46,166,0.4)',
        width: '100%',
        appearance: 'none' as const,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='white' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 16px center',
        backgroundSize: '12px 8px',
        transition: 'box-shadow 200ms',
    };

    const inputStyle: React.CSSProperties = {
        height: 56,
        backgroundColor: '#181818',
        border: 'none',
        borderRadius: 10,
        color: '#ffffff',
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 600,
        fontSize: 18,
        textAlign: 'center',
        outline: 'none',
        boxShadow: '0 0 0 2px rgba(91,46,166,0.4)',
        width: '100%',
        transition: 'box-shadow 200ms',
    };

    return (
        <div
            style={{
                minHeight: 'calc(100vh - 120px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 16px',
                backgroundImage: 'url(/assets/age-verification-bg.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundColor: '#0a0a0a',
                position: 'relative',
            }}
        >
            {/* Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)' }} />

            {/* Card */}
            <div
                role="main"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    background: 'rgba(15,14,23,0.92)',
                    border: '1px solid rgba(91,46,166,0.35)',
                    borderRadius: 24,
                    padding: 'clamp(32px, 6vw, 56px)',
                    maxWidth: 560,
                    width: '100%',
                    textAlign: 'center',
                    boxShadow: '0 0 48px rgba(91,46,166,0.25), 0 24px 64px rgba(0,0,0,0.5)',
                    fontFamily: "var(--font-montserrat), sans-serif",
                }}
            >
                {/* Logo */}
                <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'center' }}>
                    <SiteLogo dark={true} size="lg" />
                </div>

                <h1 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 700, color: '#ffffff', marginBottom: 12, lineHeight: 1.2 }}>
                    Age Verification
                </h1>

                <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: 36 }}>
                    This portal contains premium tobacco and hookah products.<br />
                    Please enter your date of birth to confirm you are at least <strong style={{ color: '#fff' }}>21 years old</strong>.
                </p>

                {/* Form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
                    {/* Month select */}
                    <div>
                        <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', textAlign: 'left', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Month
                        </label>
                        <select
                            value={month}
                            onChange={e => setMonth(e.target.value)}
                            style={selectStyle}
                        >
                            <option value="">Select Month</option>
                            {MONTHS.map((m, i) => (
                                <option key={m} value={String(i + 1)} style={{ backgroundColor: '#181818', color: '#fff' }}>
                                    {m}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Day + Year row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', textAlign: 'left', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Day
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="DD"
                                value={day}
                                onChange={handleDayChange}
                                maxLength={2}
                                style={inputStyle}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.45)', textAlign: 'left', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Year
                            </label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="YYYY"
                                value={year}
                                onChange={handleYearChange}
                                maxLength={4}
                                style={inputStyle}
                            />
                        </div>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div
                        style={{
                            background: 'rgba(200,0,0,0.15)',
                            border: '1px solid rgba(200,0,0,0.4)',
                            borderRadius: 10,
                            padding: '12px 16px',
                            color: '#ff6b6b',
                            fontSize: 14,
                            fontWeight: 500,
                            marginBottom: 20,
                        }}
                    >
                        {error}
                    </div>
                )}

                {/* Verify button */}
                <button
                    onClick={handleVerify}
                    style={{
                        width: '100%',
                        height: 54,
                        background: 'linear-gradient(135deg, #5b2ea6 0%, #7b3fc4 100%)',
                        border: 'none',
                        borderRadius: 98,
                        color: '#ffffff',
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontWeight: 700,
                        fontSize: 15,
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        transition: 'opacity 180ms, transform 150ms',
                        marginBottom: 20,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                    Verify Age
                </button>

                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                    By entering this site, you agree to our{' '}
                    <a href="/terms-and-conditions" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'underline' }}>
                        Terms &amp; Conditions
                    </a>.
                    This information is used solely for age verification.
                </p>
            </div>
        </div>
    );
}
