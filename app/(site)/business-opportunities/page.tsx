'use client';
export const runtime = 'edge';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '../../../components/providers/ThemeProvider';
import { getWholesaleUrl } from '../../../lib/config';

function Chevron({ open, dark }: { open: boolean; dark: boolean }) {
    return (
        <svg width="22" height="24" viewBox="0 0 22.16 24.004" fill="none"
            style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}>
            <path d="M3.69332 8.30861L11.0812 15.6953L18.4667 8.30861"
                stroke={dark ? '#ffffff' : '#857149'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.923333" />
        </svg>
    );
}

const faqs = [
    {
        q: 'What types of businesses can partner with us?',
        a: "We work with hookah lounges, smoke shops, retail stores, wholesale distributors, and online retailers. Whether you're a small boutique or a large chain, we have wholesale programmes to suit your needs.",
    },
    {
        q: 'What are the minimum order quantities for wholesale?',
        a: 'Minimum order quantities vary by product category. Hookahs typically start at 5 units per SKU, while shisha tobacco and charcoal orders can be placed in case quantities. Contact our B2B team for a full price list.',
    },
    {
        q: 'Do you ship internationally for business orders?',
        a: 'Yes — we support domestic shipping across India and international shipping via your preferred freight forwarder. Our team can assist with documentation, customs clearance, and logistics coordination.',
    },
    {
        q: 'How do I apply for a wholesale account?',
        a: 'Click the "Sign Up" button to create a wholesale account. Our team will review your application within 2 business days and provide access to wholesale pricing and exclusive catalogues.',
    },
];

export default function BusinessOpportunitiesPage() {
    const { dark } = useTheme();
    const [openSet, setOpenSet] = useState<Set<number>>(new Set());

    function toggle(i: number) {
        setOpenSet(prev => {
            const next = new Set(prev);
            next.has(i) ? next.delete(i) : next.add(i);
            return next;
        });
    }

    const pageBg    = dark ? '#0d0d0d' : '#ffffff';
    const borderCol = dark ? '#2e2e2e' : '#e4e4e4';
    const textPrim  = dark ? '#f5f5f5' : '#111111';
    const textMuted = dark ? 'rgba(255,255,255,0.50)' : '#777777';
    const textBody  = dark ? 'rgba(255,255,255,0.78)' : '#333333';
    const ctaBg     = dark ? 'rgba(255,255,255,0.05)' : '#f5f4ef';
    const faqBg     = dark ? 'rgba(255,255,255,0.025)' : '#f8f7f4';

    const H2: React.CSSProperties = { fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 700, color: textPrim, margin: '40px 0 14px', lineHeight: 1.3 };
    const H3: React.CSSProperties = { fontSize: 'clamp(18px, 2.5vw, 22px)', fontWeight: 700, color: textPrim, margin: '36px 0 12px', lineHeight: 1.3 };
    const P:  React.CSSProperties = { fontSize: 15, lineHeight: 1.85, color: textBody, marginBottom: 14 };

    return (
        <div style={{ backgroundColor: pageBg, fontFamily: "var(--font-montserrat), sans-serif", transition: 'background-color 200ms' }}>

            {/* ── Hero ─────────────────────────────────────────────────────── */}
            <div className="w-full relative overflow-hidden" style={{ height: 'clamp(220px, 35vw, 360px)' }}>
                <Image src="/biz-opp-hero.png" alt="Business Opportunities" fill className="object-cover object-center" priority />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4"
                    style={{ background: 'linear-gradient(160deg, rgba(20,0,40,0.78) 0%, rgba(70,0,35,0.68) 100%)' }}>
                    <h1 className="text-white" style={{ fontSize: 'clamp(24px, 5vw, 44px)', fontWeight: 700, lineHeight: 1.2, letterSpacing: '-0.5px' }}>
                        Business opportunities
                    </h1>
                </div>
            </div>

            {/* ── Breadcrumb ───────────────────────────────────────────────── */}
            <div style={{ borderBottom: `1px solid ${borderCol}` }}>
                <div className="w-full max-w-[960px] mx-auto px-5 md:px-8 flex flex-wrap items-center" style={{ gap: 4, minHeight: 44, paddingTop: 8, paddingBottom: 8 }}>
                    <Link href="/" style={{ fontSize: 13, color: textMuted, textDecoration: 'none' }}>Home</Link>
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                        <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
                    </svg>
                    <span style={{ fontSize: 13, color: textPrim, fontWeight: 500 }}>Business Opportunities</span>
                </div>
            </div>

            {/* ── Main Content ─────────────────────────────────────────────── */}
            <div className="w-full max-w-[960px] mx-auto px-5 md:px-8 pb-16">

                {/* Section 1 */}
                <h2 style={H2}>Buying Wholesale with The Hookah Store Wholesale</h2>
                <p style={P}>
                    Do you own a hookah store, hookah lounge, or smoke shop? We offer a complete line of hookah products for all hookah suppliers!
                </p>
                <p style={P}>
                    Partner up today with The Hookah Store Wholesale! As hookah smoking continues to grow more popular, so too does the demand for high quality products. Selling hookah wholesale allows you to meet this increasing demand by providing your customers with the best hookahs, tobacco, shisha, and hookah accessories.
                </p>
                <p style={{ ...P, marginBottom: 0 }}>
                    At thehookahstore.in, our number-one goal is to see your hookah lounge, or wholesale and distribution company flourish by getting you top-quality hookahs and hookah accessories.
                </p>

                {/* CTA box */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-10 mb-2 px-6 py-5 rounded-xl"
                    style={{ background: ctaBg, border: `1px solid ${borderCol}` }}>
                    <p style={{ margin: 0, fontSize: 15, fontWeight: 400, color: textBody }}>
                        <strong style={{ color: textPrim, fontWeight: 700 }}>Create a Hookah Account!</strong>{' '}
                        <span style={{ color: textMuted }}>Partner Up Today!</span>
                    </p>
                    <a href={getWholesaleUrl('/register')}
                        style={{
                            background: '#7a6840', color: '#fff', borderRadius: 98,
                            padding: '11px 32px', fontWeight: 700, fontSize: 13,
                            letterSpacing: '1.2px', textTransform: 'uppercase',
                            textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                            transition: 'background 200ms',
                        }}>
                        SIGN UP
                    </a>
                </div>

                {/* Section 2 */}
                <h2 style={H2}>Why Buy Hookah Wholesale from The Hookah Store Wholesale?</h2>
                <p style={P}>
                    There is no shortage of hookah wholesalers out there for you to choose from. Here's what sets us apart from the competition:
                </p>

                {/* Full-width lounge image */}
                <div className="w-full rounded-xl overflow-hidden relative my-8" style={{ aspectRatio: '16/9' }}>
                    <Image src="/biz-opp-lounge.png" alt="Premium hookah lounge" fill className="object-cover" />
                </div>

                {/* Section 3 */}
                <h3 style={H3}>We are a top-rated wholesale hookah shop</h3>
                <p style={P}>
                    The wholesale hookahs, flavoured tobacco, and other hookah accessories that are featured on our website are currently rated as some of the best products on the market. We offer a complete line of wholesale hookah for sale for smoke shops, hookah lounges, and hookah suppliers. We specialize in delivering our high quality hookahs to customers, so we know just what it takes to sell wholesale hookahs to businesses like yours.
                </p>

                {/* Section 4 */}
                <h3 style={H3}>Buying Wholesale with The Hookah Store Wholesale</h3>
                <p style={P}>
                    Oftentimes, getting hookah wholesale products is easier said than done. Expanding your stock to include some of the truly exotic products can be a complicated affair. However, we at thehookahstore.in are more than up to the task. As a registered hookah wholesale distributor, we follow all applicable Indian regulations, including COTPA 2003, to help you get the products you need.
                </p>
                <p style={P}>
                    Whether you're a hookah lounge, retail store, or wholesaler — <strong style={{ color: textPrim }}>thehookahstore.in</strong> offers a diverse selection of exotic hookah pipes and top-quality shisha for your business needs. In addition to hookah pipes, we offer hookah tobacco wholesale including all major hookah shisha brands. Buy shisha wholesale at the best prices in the business and get the brands your customers want like Al Fakher and Starbuzz shisha tobacco wholesale.
                </p>

                {/* Section 5 */}
                <h3 style={H3}>We specialize in authentic hookah supplies &amp; merchandise</h3>
                <p style={P}>
                    We take the authenticity of our products very seriously. Too often, many hookah wholesalers fall into the trap of buying cheap products to sell en masse in order to turn a quick profit. Not so with thehookahstore.in. Every hookah we sell, including exotic Chinese and Egyptian hookahs for sale, are the real deal.
                </p>
                <p style={{ ...P, marginBottom: 24 }}>
                    All of our wholesale hookah supplies undergo a rigorous inspection process to offer you the utmost quality assurance and confidence. You will even save by buying your hookah wholesale through thehookahstore.in. With so many kinds of products, you are sure to find something to like.
                </p>

                {/* Two image grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                    <div className="rounded-xl overflow-hidden relative" style={{ aspectRatio: '4/3' }}>
                        <Image src="/biz-opp-wholesale.png" alt="Friends enjoying hookah" fill className="object-cover" />
                    </div>
                    <div className="rounded-xl overflow-hidden relative" style={{ aspectRatio: '4/3' }}>
                        <Image src="/biz-opp-hero.png" alt="Premium hookah pipes" fill className="object-cover object-bottom" />
                    </div>
                </div>
            </div>

            {/* ── FAQ ──────────────────────────────────────────────────────── */}
            <div style={{ backgroundColor: faqBg, paddingTop: 56, paddingBottom: 64, transition: 'background-color 200ms' }}>
                <h2 className="text-center px-5" style={{ fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: 600, color: textPrim, marginBottom: 40 }}>
                    Business Opportunities FAQs
                </h2>
                <div className="max-w-[848px] mx-auto px-5 md:px-0">
                    {faqs.map(({ q, a }, i) => {
                        const isOpen = openSet.has(i);
                        return (
                            <div key={i} style={{ borderTop: `1px solid ${borderCol}` }}>
                                <button onClick={() => toggle(i)}
                                    className="w-full flex items-center justify-between text-left"
                                    style={{ minHeight: 68, paddingTop: 20, paddingBottom: 20, cursor: 'pointer', background: 'none', border: 'none', paddingLeft: 4 }}>
                                    <span style={{ fontWeight: 500, fontSize: 16, color: textPrim, flex: 1, paddingRight: 12 }}>
                                        {q}
                                    </span>
                                    <Chevron open={isOpen} dark={dark} />
                                </button>
                                {isOpen && (
                                    <div style={{ paddingBottom: 20, paddingLeft: 4, paddingRight: 4 }}>
                                        <p style={{ fontSize: 15, lineHeight: 1.75, color: textBody, margin: 0 }}>{a}</p>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div style={{ borderBottom: `1px solid ${borderCol}` }} />
                </div>
            </div>

        </div>
    );
}
