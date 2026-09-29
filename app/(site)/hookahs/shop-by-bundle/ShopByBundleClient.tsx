'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '../../../../components/providers/ThemeProvider';

const LOREM = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.';

/* ── Use the shop-by-brand hero image as a placeholder ── */
const HERO_IMG = '/shop-by-brand/2006ed7d062b3c3c66731b9174bea81468719a97.png';

const bundles = [
    { label: 'Starter Bundle', img: '/shop-by-brand/40da877ab714911cecadb60f1f1f56ec1720625f.png' },
    { label: 'Premium Bundle', img: '/shop-by-brand/392f5ae21d7e15006552bd697c63e1aacab55594.png' },
    { label: 'Party Bundle', img: '/shop-by-brand/6213e108b4203d02bb91146533eb760c7fa5e7ec.png' },
    { label: 'Flavour Bundle', img: '/shop-by-brand/dc3d908d0a16d334b480bf3660f7ec5528d2f572.png' },
    { label: 'Charcoal Bundle', img: '/shop-by-brand/dc176b9ed919eb6666e68ffca810edaf8501fa06.png' },
    { label: 'Accessories Bundle', img: '/shop-by-brand/c90b0c3d9990cb4b2bc538515cf069f28b797488.png' },
    { label: 'Shisha Bundle', img: '/shop-by-brand/20d3ff1f6398c50cbd759b7be63d47a39232b3cf.png' },
    { label: 'Ultimate Bundle', img: '/shop-by-brand/32c7d704fc416ee70ccf953dcf2686a38e7d6738.png' },
];

const faqs = [
    { q: 'What is included in a hookah bundle?', a: LOREM },
    { q: 'Are hookah bundles better value than individual products?', a: LOREM },
    { q: 'Can I customise my hookah bundle?', a: LOREM },
];

/* ── Chevron — same as Privacy Policy ── */
function Chevron({ open, dark }: { open: boolean; dark: boolean }) {
    return (
        <svg
            width="22" height="24" viewBox="0 0 22.16 24.004" fill="none"
            style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}
        >
            <path
                d="M3.69332 8.30861L11.0812 15.6953L18.4667 8.30861"
                stroke={dark ? '#ffffff' : '#857149'}
                strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.923333"
            />
        </svg>
    );
}

export default function ShopByBundleClient() {
    const { dark } = useTheme();
    const [openSet, setOpenSet] = useState<Set<number>>(new Set());

    function toggle(i: number) {
        setOpenSet(prev => {
            const next = new Set(prev);
            next.has(i) ? next.delete(i) : next.add(i);
            return next;
        });
    }

    /* ── Colour tokens ── */
    const pageBg = dark ? 'transparent' : '#ffffff';
    const grayBg = dark ? 'rgba(255,255,255,0.03)' : '#f6f5f8';
    const faqBg = dark ? 'rgba(255,255,255,0.02)' : '#ffffff';
    const borderCol = dark ? '#5D5D5D' : '#d7d8db';
    const textPrim = dark ? '#ffffff' : '#101114';
    const textMuted = dark ? 'rgba(255,255,255,0.55)' : '#6c6d73';
    const labelCol = dark ? '#ffffff' : '#12091d';
    const faqBodyCol = dark ? 'rgba(255,255,255,0.70)' : '#4c4e52';

    return (
        <div className="w-full min-h-screen" style={{ backgroundColor: pageBg, fontFamily: "var(--font-montserrat), sans-serif", transition: 'background-color 200ms' }}>

            {/* ── Hero ── */}
            <div className="w-full relative overflow-hidden" style={{ height: '300px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={HERO_IMG}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
                    <h1 className="text-white text-[28px] md:text-[40px]" style={{ fontWeight: 600, lineHeight: '1.35' }}>
                        Shop Hookahs By Bundle
                    </h1>
                    <p className="text-white mt-4 max-w-[720px] text-[16px] md:text-[18px]" style={{ fontWeight: 400, lineHeight: '1.6' }}>
                        Get more for less with our curated hookah bundles — everything you need for the perfect session, all in one place.
                    </p>
                </div>
            </div>

            {/* ── Gray content wrapper ── */}
            <div className="w-full" style={{ backgroundColor: grayBg, transition: 'background-color 200ms' }}>

                {/* ── Breadcrumb — Privacy Policy style ── */}
                <div style={{ borderBottom: `1px solid ${borderCol}`, minHeight: '49px', display: 'flex', alignItems: 'center', transition: 'border-color 200ms' }}>
                    <div className="flex items-center pl-[16px] md:pl-[64px] xl:pl-[312px]" style={{ paddingTop: '10px', paddingBottom: '10px', gap: '4px' }}>
                        <Link href="/" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textMuted, whiteSpace: 'nowrap', transition: 'color 200ms' }}>
                            Home
                        </Link>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
                        </svg>
                        <Link href="/hookahs" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textMuted, whiteSpace: 'nowrap', transition: 'color 200ms' }}>
                            Hookahs
                        </Link>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
                        </svg>
                        <span aria-current="page" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textPrim, whiteSpace: 'nowrap', transition: 'color 200ms' }}>
                            Shop by Bundle
                        </span>
                    </div>
                </div>

                {/* ── Bundle Cards Grid ── */}
                <div className="px-4 md:px-16 lg:px-20 pt-6 lg:pt-16 pb-16">
                    <h2 className="text-center text-[28px] md:text-[40px] mb-6 md:mb-10"
                        style={{ fontWeight: 600, lineHeight: '1.35', color: textPrim, transition: 'color 200ms' }}>
                        Shop Hookahs By Bundle
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 md:gap-x-6 md:gap-y-14">
                        {bundles.map(({ label, img }) => (
                            <div key={label} className="flex flex-col">
                                <div className="rounded-[12px] overflow-hidden aspect-square w-full relative">
                                    <Image src={img} alt={label} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                                </div>
                                <p className="mt-3 text-[18px] md:text-[26px]"
                                    style={{ fontWeight: 600, lineHeight: '1.54', color: labelCol, transition: 'color 200ms' }}>
                                    {label}
                                </p>
                                {/* SHOP NOW — red */}
                                <button
                                    className="mt-3 flex-shrink-0 hover:opacity-90 active:scale-95 transition-all"
                                    style={{
                                        backgroundColor: '#D32F2F',
                                        border: 'none',
                                        color: '#ffffff',
                                        borderRadius: '98px',
                                        fontFamily: "var(--font-montserrat), sans-serif",
                                        fontWeight: 600,
                                        fontSize: '14px',
                                        letterSpacing: '1px',
                                        textTransform: 'uppercase',
                                        height: '40px',
                                        width: '135px',
                                        cursor: 'pointer',
                                    }}
                                >
                                    SHOP NOW
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── FAQ Section ── */}
                <div style={{ backgroundColor: faqBg, paddingTop: '64px', paddingBottom: '64px', transition: 'background-color 200ms' }}>
                    <h2 className="text-center text-[28px] md:text-[40px]"
                        style={{ fontWeight: 600, lineHeight: '1.35', color: textPrim, marginBottom: '63px', transition: 'color 200ms' }}>
                        Hookah Bundle FAQs
                    </h2>

                    <div className="max-w-[848px] mx-auto px-10 md:px-0">
                        {faqs.map(({ q, a }, i) => {
                            const isOpen = openSet.has(i);
                            return (
                                <div key={i} style={{ borderTop: `1px solid ${borderCol}`, transition: 'border-color 200ms' }}>
                                    <button
                                        onClick={() => toggle(i)}
                                        className="w-full flex items-center justify-between text-left"
                                        style={{ minHeight: '73px', paddingTop: '24px', paddingBottom: '24px', cursor: 'pointer', background: 'none', border: 'none', paddingLeft: '8px' }}
                                    >
                                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '18px', lineHeight: '24px', color: textPrim, transition: 'color 200ms', flex: 1 }}>
                                            {q}
                                        </span>
                                        <Chevron open={isOpen} dark={dark} />
                                    </button>
                                    {isOpen && (
                                        <div style={{ paddingBottom: '24px', paddingLeft: '8px', paddingRight: '8px' }}>
                                            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '16px', lineHeight: '1.7', color: faqBodyCol, transition: 'color 200ms' }}>
                                                {a}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div style={{ borderBottom: `1px solid ${borderCol}`, transition: 'border-color 200ms' }} />
                    </div>
                </div>

            </div>
        </div>
    );
}
