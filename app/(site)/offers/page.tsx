'use client';
export const runtime = 'edge';

import Link from 'next/link';
import { useTheme } from '../../../components/providers/ThemeProvider';

const OFFERS = [
    {
        tag: 'Free Shipping',
        title: 'Free Shipping on Orders ₹1,000+',
        desc: 'Spend ₹1,000 or more and get free standard shipping on your entire order — no coupon needed.',
        color: '#CD142C',
    },
    {
        tag: 'Bundle Deal',
        title: 'Buy 2 Get 1 Free on Shisha Tobacco',
        desc: 'Mix and match any shisha tobacco flavours — add 3 to your cart and the cheapest one is automatically free.',
        color: '#CD142C',
    },
    {
        tag: 'New Arrivals',
        title: '10% Off All New Products This Month',
        desc: 'Be the first to try our latest arrivals. New hookah accessories, tobacco flavours, and hardware added weekly.',
        color: '#CD142C',
    },
    {
        tag: 'Members Only',
        title: 'Earn Rewards Points on Every Order',
        desc: 'Sign up for a free account and earn points with every purchase. Redeem them for discounts on future orders.',
        color: '#CD142C',
    },
];

export default function OffersPage() {
    const { dark } = useTheme();

    const pageBg     = dark ? 'transparent' : '#ffffff';
    const borderCol  = dark ? '#5D5D5D' : '#d7d8db';
    const textPrimary = dark ? '#ffffff' : '#101114';
    const textMuted  = dark ? 'rgba(255,255,255,0.55)' : '#6c6d73';
    const textBody   = dark ? 'rgba(255,255,255,0.80)' : '#3a3b3f';
    const cardBg     = dark ? 'rgba(255,255,255,0.04)' : '#f6f5f8';

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', fontFamily: "var(--font-montserrat), sans-serif", transition: 'background-color 200ms' }}>

            {/* Hero */}
            <div
                className="relative flex items-center justify-center h-[220px] md:h-[300px]"
                style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d0a0a 100%)' }}
            >
                <div className="text-center px-4">
                    <p style={{ color: '#CD142C', fontWeight: 700, fontSize: '12px', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '8px' }}>
                        Exclusive Deals
                    </p>
                    <h1 style={{ color: '#ffffff', fontWeight: 700, fontSize: 'clamp(28px, 5vw, 48px)', lineHeight: 1.2 }}>
                        Current Offers &amp; Promotions
                    </h1>
                </div>
            </div>

            {/* Breadcrumb */}
            <div style={{ borderBottom: `1px solid ${borderCol}`, minHeight: '49px', display: 'flex', alignItems: 'center', transition: 'border-color 200ms' }}>
                <div className="flex items-center pl-[16px] md:pl-[64px] xl:pl-[312px]" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                    <Link href="/" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', color: textMuted, whiteSpace: 'nowrap' }}>
                        Home
                    </Link>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ margin: '0 4px', flexShrink: 0 }}>
                        <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
                    </svg>
                    <span aria-current="page" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', color: textPrimary, whiteSpace: 'nowrap', transition: 'color 200ms' }}>
                        Offers
                    </span>
                </div>
            </div>

            {/* Content */}
            <div className="px-[16px] md:px-[64px] xl:px-[312px] pt-[48px] pb-[80px]">

                <h2 style={{ fontWeight: 700, fontSize: 'clamp(22px, 3vw, 36px)', color: textPrimary, marginBottom: '12px', transition: 'color 200ms' }}>
                    Deals You Don&apos;t Want to Miss
                </h2>
                <p style={{ fontSize: '16px', lineHeight: '26px', color: textBody, marginBottom: '48px', maxWidth: '640px', transition: 'color 200ms' }}>
                    Check back regularly — we update our offers and promotions often.
                </p>

                {/* Offer cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {OFFERS.map((offer) => (
                        <div
                            key={offer.title}
                            className="rounded-[14px] px-7 py-8 flex flex-col gap-3"
                            style={{ backgroundColor: cardBg, border: `1px solid ${borderCol}`, transition: 'background-color 200ms, border-color 200ms' }}
                        >
                            <span
                                className="self-start text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                                style={{ backgroundColor: offer.color, color: '#ffffff' }}
                            >
                                {offer.tag}
                            </span>
                            <h3 style={{ fontSize: '18px', fontWeight: 700, color: textPrimary, lineHeight: '1.4', transition: 'color 200ms' }}>
                                {offer.title}
                            </h3>
                            <p style={{ fontSize: '14px', lineHeight: '22px', color: textBody, transition: 'color 200ms' }}>
                                {offer.desc}
                            </p>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-16 text-center">
                    <p style={{ fontSize: '15px', color: textMuted, marginBottom: '16px', transition: 'color 200ms' }}>
                        Looking for coupon codes? Check out our dedicated coupons page.
                    </p>
                    <Link
                        href="/coupons"
                        className="inline-block px-8 py-3 rounded-full text-[13px] font-bold uppercase tracking-widest text-white transition-opacity hover:opacity-80"
                        style={{ backgroundColor: '#CD142C' }}
                    >
                        View Coupon Codes
                    </Link>
                </div>
            </div>
        </div>
    );
}
