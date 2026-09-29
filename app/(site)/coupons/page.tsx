'use client';
export const runtime = 'edge';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '../../../components/providers/ThemeProvider';

const COUPON_IMG = '/img_contentchesslayout_shishatobaccobrand_02_1.webp';

type Coupon = {
    code: string;
    title: string;
    desc: React.ReactNode;
    landscape?: boolean;
};

/**
 * Live coupon codes shown on this page. Each code must also exist in
 * WP Admin → Marketing → Coupons (checkout validates it with WooCommerce).
 * The previous list was copied from a US template ($ offers, products we
 * don't stock) and was removed. Note: COTPA 2003 restricts tobacco
 * promotions — keep offers to accessories / shipping.
 *
 * Example:
 *   { code: 'FREESHIP', title: 'Free shipping', desc: 'Free delivery on orders above ₹999.', landscape: true },
 */
const coupons: Coupon[] = [];

export default function CouponsPage() {
    const { dark } = useTheme();
    const [toastVisible, setToastVisible] = useState(false);
    const [toastTimer, setToastTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

    // ── Derived colours ────────────────────────────────────────────────────
    const pageBg = dark ? 'transparent' : '#ffffff';
    const borderCol = dark ? '#5D5D5D' : '#d7d8db';
    const textPrimary = dark ? '#ffffff' : '#101114';
    const textMuted = dark ? 'rgba(255,255,255,0.55)' : '#6c6d73';
    const textBody = dark ? 'rgba(255,255,255,0.80)' : '#3a3b3f';
    const noteBoxBg = dark ? 'rgba(255,255,255,0.05)' : '#f6f5f8';
    const noteBoxText = dark ? 'rgba(255,255,255,0.65)' : '#4c4e52';

    // ── Copy handler ───────────────────────────────────────────────────────
    const handleCopy = useCallback((code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setToastVisible(true);
            if (toastTimer) clearTimeout(toastTimer);
            const t = setTimeout(() => setToastVisible(false), 3500);
            setToastTimer(t);
        });
    }, [toastTimer]);

    const dismissToast = () => {
        setToastVisible(false);
        if (toastTimer) clearTimeout(toastTimer);
    };

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', fontFamily: "var(--font-montserrat), sans-serif", transition: 'background-color 200ms' }}>

            {/* ── Success Toast ── */}
            {toastVisible && (
                <div
                    style={{
                        position: 'fixed',
                        top: '24px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        zIndex: 9999,
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #86efac',
                        borderRadius: '12px',
                        padding: '14px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        minWidth: '320px',
                        maxWidth: '90vw',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    }}
                >
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" style={{ flexShrink: 0 }}>
                        <circle cx="11" cy="11" r="11" fill="#16a34a" />
                        <path d="M6 11.5L9.5 15L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: '14px', color: '#166534', margin: 0 }}>
                        <strong style={{ fontWeight: 700 }}>Success!</strong> Coupon code copied to clipboard
                    </p>
                    <button
                        onClick={dismissToast}
                        style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, color: '#16a34a', fontSize: '20px', lineHeight: 1 }}
                        aria-label="Dismiss"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* ── Hero Banner ── */}
            <div className="relative h-[300px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <Image src={COUPON_IMG} alt="Coupon Codes" fill priority className="object-cover" sizes="100vw" />
                <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
                    <h1
                        className="text-white text-center text-[28px] md:text-[40px] leading-[36px] md:leading-[54px]"
                        style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600 }}
                    >
                        Coupon Codes
                    </h1>
                </div>
            </div>

            {/* ── Breadcrumb — matching Privacy Policy style ── */}
            <div
                style={{
                    borderBottom: `1px solid ${borderCol}`,
                    minHeight: '49px',
                    display: 'flex',
                    alignItems: 'center',
                    transition: 'border-color 200ms',
                }}
            >
                <div
                    className="flex items-center pl-[16px] md:pl-[64px] xl:pl-[312px]"
                    style={{ paddingTop: '10px', paddingBottom: '10px' }}
                >
                    <Link
                        href="/"
                        style={{
                            fontFamily: "var(--font-montserrat), sans-serif",
                            fontWeight: 400,
                            fontSize: '14px',
                            lineHeight: '20px',
                            color: textMuted,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Home
                    </Link>
                    <div style={{ width: '16px', height: '16px', margin: '0 4px', flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span
                        aria-current="page"
                        style={{
                            fontFamily: "var(--font-montserrat), sans-serif",
                            fontWeight: 400,
                            fontSize: '14px',
                            lineHeight: '20px',
                            color: textPrimary,
                            whiteSpace: 'nowrap',
                            transition: 'color 200ms',
                        }}
                    >
                        Coupons
                    </span>
                </div>
            </div>

            {/* ── Main Content ── */}
            <div className="px-[16px] md:px-[64px] xl:px-[312px] pt-[40px] md:pt-[60px]">

                {/* Page title */}
                <h2
                    className="text-[28px] md:text-[40px] leading-[36px] md:leading-[54px]"
                    style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: textPrimary, transition: 'color 200ms' }}
                >
                    Hookah Featured Coupon Codes &amp;{' '}
                    <br className="hidden md:inline" />
                    Discounts
                </h2>

                <p
                    className="text-[18px] leading-[28px] mt-5 md:mt-6"
                    style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, color: textBody, transition: 'color 200ms' }}
                >
                    If you&apos;re looking to save money or grab some awesome freebies on your next order, this is the
                    perfect page for you! All of the following coupon codes can be used with any order that you place on
                    our website as long as you meet the requirements for your selected coupon.
                </p>

                <p
                    className="text-[18px] leading-[28px] mt-[19px]"
                    style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, color: textBody, transition: 'color 200ms' }}
                >
                    These coupons will change so you should bookmark this page or stop by before you place your next order.
                </p>

                {/* Note box */}
                <div
                    className="mt-[50px] rounded-[12px] px-6 py-6"
                    style={{ backgroundColor: noteBoxBg, transition: 'background-color 200ms' }}
                >
                    <p
                        className="text-[16px] leading-[24px]"
                        style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, color: noteBoxText, transition: 'color 200ms' }}
                    >
                        Coupon codes can only be used one at a time during checkout. Thanks for stopping by and happy smoking!
                    </p>
                </div>

                {/* ── Empty state (no live coupons) ── */}
                {coupons.length === 0 && (
                    <div className="mt-16 mb-24 rounded-[12px] px-6 py-12 text-center" style={{ border: `1px solid ${borderCol}`, transition: 'border-color 200ms' }}>
                        <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: 18, color: textPrimary, margin: '0 0 8px' }}>
                            No coupon codes right now
                        </p>
                        <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 15, color: textMuted, margin: '0 0 20px' }}>
                            Check back soon — new offers on accessories and shipping are added here.
                        </p>
                        <Link href="/hookahs" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: 14, color: '#D32F2F', textDecoration: 'underline' }}>
                            Continue shopping
                        </Link>
                    </div>
                )}

                {/* ── Coupon Cards ── */}
                <div className="mt-16 flex flex-col gap-[56px] pb-24">
                    {coupons.map((coupon, index) => {
                        const isReversed = index % 2 === 0;
                        return (
                            <div
                                key={coupon.code}
                                className={`flex flex-col gap-6 ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'}`}
                            >
                                {/* Image */}
                                <div
                                    className="md:w-1/2 flex-shrink-0 rounded-[12px] overflow-hidden relative"
                                    style={{ aspectRatio: coupon.landscape ? '4/3' : '1/1' }}
                                >
                                    <Image
                                        src={COUPON_IMG}
                                        alt={coupon.title}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>

                                {/* Content */}
                                <div className="md:w-1/2 flex flex-col justify-start">
                                    <h3
                                        className="text-[18px] leading-[28px] md:text-[26px] md:leading-[40px]"
                                        style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: textPrimary, transition: 'color 200ms' }}
                                    >
                                        {coupon.title}
                                    </h3>

                                    <p
                                        className="text-[16px] md:text-[18px] leading-[26px] md:leading-[28px] mt-6 md:mt-10"
                                        style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, color: textBody, transition: 'color 200ms' }}
                                    >
                                        {coupon.desc}
                                    </p>

                                    <button
                                        className="mt-[14px] md:mt-[18px] self-start h-[40px] px-5 bg-[#857149] rounded-[98px] text-[14px] leading-[16px] uppercase tracking-[1px] text-white whitespace-nowrap hover:bg-[#6e5d3b] active:scale-95 transition-all"
                                        style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600 }}
                                        type="button"
                                        onClick={() => handleCopy(coupon.code)}
                                    >
                                        Copy Coupon &quot;{coupon.code}&quot;
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
