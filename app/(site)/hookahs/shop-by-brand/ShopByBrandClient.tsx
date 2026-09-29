'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '../../../../components/providers/ThemeProvider';

// Each brand links to /brand/<slug>. The slug must exist as a WooCommerce
// product category (WP Admin → Products → Categories), otherwise the brand
// page returns 404.
const brands = [
    { id: 1, name: 'Khalil Mamoon Hookahs', slug: 'khalil-mamoon', img: '/shop-by-brand/40da877ab714911cecadb60f1f1f56ec1720625f.png' },
    { id: 2, name: 'OOKA', slug: 'ooka', img: '/shop-by-brand/5ed7c4e772fb4548461f647368babb63cae80d73.png' },
    { id: 3, name: 'INVI Hookahs', slug: 'invi', img: '/shop-by-brand/392f5ae21d7e15006552bd697c63e1aacab55594.png' },
    { id: 4, name: 'Mya Hookahs', slug: 'mya-hookahs', img: '/shop-by-brand/6213e108b4203d02bb91146533eb760c7fa5e7ec.png' },
    { id: 5, name: 'Smokezilla Hookahs', slug: 'smokezilla', img: '/shop-by-brand/32c7d704fc416ee70ccf953dcf2686a38e7d6738.png' },
    { id: 6, name: 'Starbuzz Hookahs', slug: 'starbuzz-hookahs', img: '/shop-by-brand/dc3d908d0a16d334b480bf3660f7ec5528d2f572.png' },
    { id: 7, name: 'Pharaohs Hookahs', slug: 'pharaohs', img: '/shop-by-brand/dc176b9ed919eb6666e68ffca810edaf8501fa06.png' },
    { id: 8, name: 'Shishabucks Hookahs', slug: 'shishabucks', img: '/shop-by-brand/c90b0c3d9990cb4b2bc538515cf069f28b797488.png' },
    { id: 9, name: 'BYO & Amira Hookahs', slug: 'byo-amira', img: '/shop-by-brand/20d3ff1f6398c50cbd759b7be63d47a39232b3cf.png' },
];

const faqs = [
    {
        q: 'Which hookah brand should I choose?',
        a: 'It depends on the style you want. Egyptian brands like Khalil Mamoon give a traditional look and draw, while modern brands like OOKA and INVI use stainless-steel stems that are easy to clean. If it is your first hookah, a mid-size model from a well-known brand is a safe, good-value start.',
    },
    {
        q: 'Are the hookahs sold here genuine?',
        a: 'Yes. Every hookah we sell is sourced from authorised suppliers and checked before dispatch, so you get the authentic brand product — not a copy.',
    },
    {
        q: 'Do I need to be of legal age to buy a hookah?',
        a: 'Yes. We only sell to customers aged 21 and above, and you will be asked to confirm your date of birth before checkout. Orders from customers under 21 are cancelled.',
    },
];

/* ── Chevron — identical to Privacy Policy ── */
function Chevron({ open, dark }: { open: boolean; dark: boolean }) {
    return (
        <svg
            width="22"
            height="24"
            viewBox="0 0 22.16 24.004"
            fill="none"
            style={{
                flexShrink: 0,
                transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms ease',
            }}
        >
            <path
                d="M3.69332 8.30861L11.0812 15.6953L18.4667 8.30861"
                stroke={dark ? '#ffffff' : '#857149'}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.923333"
            />
        </svg>
    );
}

export default function ShopByBrandClient() {
    const { dark } = useTheme();
    const [openSet, setOpenSet] = useState<Set<number>>(new Set());

    function toggle(i: number) {
        setOpenSet((prev) => {
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
    const brandNameCol = dark ? '#ffffff' : '#12091d';
    const faqBodyCol = dark ? 'rgba(255,255,255,0.70)' : '#4c4e52';

    return (
        <div className="w-full min-h-screen" style={{ backgroundColor: pageBg, transition: 'background-color 200ms', fontFamily: "var(--font-montserrat), sans-serif" }}>

            {/* ── Hero ── */}
            <div className="w-full relative h-[300px] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/shop-by-brand/2006ed7d062b3c3c66731b9174bea81468719a97.png"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
                <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
                    <h1 className="text-white text-[28px] md:text-[40px]" style={{ fontWeight: 600, lineHeight: '1.35' }}>
                        Shop Hookahs By Brand
                    </h1>
                    <p className="text-white mt-4 max-w-[720px] text-[16px] md:text-[18px]" style={{ fontWeight: 400, lineHeight: '1.6' }}>
                        Explore our collection of hookahs, organized by brand so you can easily find your favorites or discover something new from the top names in the industry.
                    </p>
                </div>
            </div>

            {/* ── Gray content wrapper ── */}
            <div className="w-full" style={{ backgroundColor: grayBg, transition: 'background-color 200ms' }}>

                {/* ── Breadcrumb — Privacy Policy style ── */}
                <div style={{ borderBottom: `1px solid ${borderCol}`, minHeight: '49px', display: 'flex', alignItems: 'center', transition: 'border-color 200ms' }}>
                    <div className="flex items-center pl-[16px] md:pl-[64px] xl:pl-[312px]" style={{ paddingTop: '10px', paddingBottom: '10px', gap: '4px' }}>
                        <Link href="/" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textMuted, textTransform: 'capitalize', whiteSpace: 'nowrap', transition: 'color 200ms' }}>
                            Home
                        </Link>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
                        </svg>
                        <Link href="/hookahs" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textMuted, textTransform: 'capitalize', whiteSpace: 'nowrap', transition: 'color 200ms' }}>
                            Hookahs
                        </Link>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
                        </svg>
                        <span aria-current="page" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textPrim, textTransform: 'capitalize', whiteSpace: 'nowrap', transition: 'color 200ms' }}>
                            Shop by Brand
                        </span>
                    </div>
                </div>

                {/* ── Brand Grid ── */}
                <div className="pt-6 lg:pt-16 pb-16 px-4 md:px-16 lg:px-20">
                    <h2 className="text-center text-[28px] md:text-[40px] mb-6 md:mb-10" style={{ fontWeight: 600, lineHeight: '1.35', color: textPrim, transition: 'color 200ms' }}>
                        Shop Hookahs By Brand
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-10 md:gap-x-6 md:gap-y-14">
                        {brands.map((brand) => (
                            <div key={brand.id} className="flex flex-col">
                                <div className="rounded-[12px] overflow-hidden aspect-square w-full relative">
                                    <Image src={brand.img} alt={brand.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 25vw" />
                                </div>
                                <p className="mt-3 text-[18px] md:text-[26px]" style={{ fontWeight: 600, lineHeight: '1.54', color: brandNameCol, transition: 'color 200ms' }}>
                                    {brand.name}
                                </p>
                                {/* SHOP NOW — red bg, white text → brand page */}
                                <Link
                                    href={`/brand/${brand.slug}`}
                                    className="mt-3 flex-shrink-0 flex items-center justify-center hover:opacity-90 active:scale-95 transition-all"
                                    style={{
                                        textDecoration: 'none',
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
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── FAQ Section — Privacy Policy accordion structure ── */}
                <div style={{ backgroundColor: faqBg, paddingTop: '64px', paddingBottom: '64px', transition: 'background-color 200ms' }}>
                    <h2
                        className="text-center text-[28px] md:text-[40px]"
                        style={{ fontWeight: 600, lineHeight: '1.35', color: textPrim, marginBottom: '63px', transition: 'color 200ms' }}
                    >
                        Hookah Brands FAQs
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
                        {/* bottom border */}
                        <div style={{ borderBottom: `1px solid ${borderCol}`, transition: 'border-color 200ms' }} />
                    </div>
                </div>

            </div>
        </div>
    );
}
