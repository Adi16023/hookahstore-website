'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// ── TESTING FLAG ─────────────────────────────────────────────────────────────
// Set to true  → popup shows on EVERY page load (ignores localStorage)
// Set to false → popup only shows once, then localStorage flag suppresses it
const DEV_TEST_MODE = false;
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AgeGate — Shows a "Are you 21 or older?" popup modal overlay.
 * YES → navigates to /age-verification for DOB check.
 * NO  → shows blocked message inside the modal.
 * Once verified (localStorage flag), popup never shows again.
 */
export default function AgeGate({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();

    const [showModal, setShowModal] = useState(false);
    const [denied, setDenied] = useState(false);

    useEffect(() => {
        // Skip popup on the verification page itself
        if (pathname === '/age-verification') return;

        if (DEV_TEST_MODE) {
            // Always show in test mode — ignores localStorage
            setShowModal(true);
        } else {
            const verified = localStorage.getItem('ageVerified');
            if (verified !== 'true') {
                setShowModal(true);
            }
        }
    }, [pathname]);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (showModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [showModal]);

    const handleYes = () => {
        router.push('/age-verification');
        setShowModal(false);
    };

    const handleNo = () => {
        setDenied(true);
        // After 3 seconds redirect away
        setTimeout(() => {
            window.location.href = 'https://www.google.com';
        }, 3000);
    };

    return (
        <>
            {/* Always render page content behind modal */}
            {children}

            {/* ── Popup modal ───────────────────────────────────────────── */}
            {showModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        backgroundColor: 'rgba(0,0,0,0.55)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                    }}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="age-gate-title"
                        style={{
                            background: '#111111',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: 24,
                            padding: '48px 40px 40px',
                            maxWidth: 520,
                            width: '100%',
                            textAlign: 'center',
                            boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
                            fontFamily: "var(--font-montserrat), sans-serif",
                        }}
                    >
                        {!denied ? (
                            <>
                                <h2
                                    id="age-gate-title"
                                    style={{ fontSize: 'clamp(24px, 5vw, 34px)', fontWeight: 700, color: '#ffffff', marginBottom: 16, lineHeight: 1.2 }}
                                >
                                    Are you 21 or older?
                                </h2>
                                <p style={{ fontSize: 16, fontWeight: 400, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65, marginBottom: 36 }}>
                                    This website is restricted to users 21 years of age or older only.
                                    <br />Please confirm that you are of legal age.
                                </p>
                                <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                                    <button
                                        onClick={handleNo}
                                        style={{
                                            padding: '14px 44px',
                                            borderRadius: 98,
                                            border: '1px solid rgba(255,255,255,0.15)',
                                            background: '#2a2a2a',
                                            color: '#ffffff',
                                            fontFamily: "var(--font-montserrat), sans-serif",
                                            fontWeight: 700,
                                            fontSize: 15,
                                            letterSpacing: '1.5px',
                                            cursor: 'pointer',
                                            transition: 'opacity 180ms',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.8')}
                                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                                    >
                                        NO
                                    </button>
                                    <button
                                        onClick={handleYes}
                                        style={{
                                            padding: '14px 44px',
                                            borderRadius: 98,
                                            border: 'none',
                                            background: '#5b2ea6',
                                            color: '#ffffff',
                                            fontFamily: "var(--font-montserrat), sans-serif",
                                            fontWeight: 700,
                                            fontSize: 15,
                                            letterSpacing: '1.5px',
                                            cursor: 'pointer',
                                            transition: 'opacity 180ms',
                                        }}
                                        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                                        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                                    >
                                        YES
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 style={{ fontSize: 24, fontWeight: 700, color: '#c00', marginBottom: 14 }}>
                                    Access Denied
                                </h2>
                                <p style={{ fontSize: 16, color: '#444', lineHeight: 1.6 }}>
                                    You must be at least 21 years old to enter this site.
                                    <br />
                                    <span style={{ fontSize: 14, color: '#888', marginTop: 8, display: 'block' }}>
                                        Redirecting you away…
                                    </span>
                                </p>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
