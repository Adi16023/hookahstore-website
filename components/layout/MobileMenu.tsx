'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../providers/ThemeProvider';
import SiteLogo from './SiteLogo';
import { getWholesaleUrl, getRetailUrl } from '../../lib/config';
import { TOP_CATEGORIES } from '../../lib/config/categories';
import { useWholesaleHref } from '../../lib/config/use-wholesale-path';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
    /** 'wholesale' → category links go to the wholesale catalog, retail pages open on the retail domain */
    mode?: 'retail' | 'wholesale';
}

export default function MobileMenu({ isOpen, onClose, mode = 'retail' }: MobileMenuProps) {
    const { dark } = useTheme();
    const wsHref = useWholesaleHref();
    const isWs = mode === 'wholesale';
    // Retail pages: relative on retail, absolute retail URL on the wholesale subdomain
    const retail = (path: string) => (isWs ? getRetailUrl(path) : path);
    // Category links: retail category pages, or /wholesale/category/<slug>
    const catHref = (slug: string, retailHref: string) => (isWs ? wsHref(`/category/${slug}`) : retailHref);

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // ── Primary nav — categories from lib/config/categories.ts (expandable) ──
    const [expanded, setExpanded] = useState<string | null>(null);
    const plainItems = isWs ? [] : [
        { label: 'Resources', href: '/blog' },
        { label: 'Offers',    href: '/offers' },
    ];

    // ── About — mirrors footer About column ────────────────────────────────
    const aboutItems = (isWs ? [
        { label: 'About Us',               href: '/about' },
        { label: 'Blog',                   href: '/blog' },
        { label: 'FAQs',                   href: '/faqs' },
        { label: 'Business Opportunities', href: '/business-opportunities' },
    ] : [
        { label: 'About Us',               href: '/about' },
        { label: 'Blog',                   href: '/blog' },
        { label: 'FAQs',                   href: '/faqs' },
        { label: 'Business Opportunities', href: '/business-opportunities' },
        { label: 'Coupon Codes',           href: '/coupons' },
    ]).map(i => ({ ...i, href: retail(i.href) }));

    // ── Support — mirrors footer Support column ────────────────────────────
    const supportItems = [
        { label: 'Contact Us',         href: '/contact' },
        ...(isWs ? [] : [{ label: 'My Orders', href: '/account/orders' }]),
        { label: 'Shipping & Returns', href: '/shipping-and-returns' },
        { label: 'Terms & Conditions', href: '/terms-and-conditions' },
        { label: 'Privacy Policy',     href: '/privacy-policy' },
    ].map(i => ({ ...i, href: retail(i.href) }));

    // ── Account ────────────────────────────────────────────────────────────
    const accountItems = isWs ? [
        { label: 'Wholesale Account', href: wsHref('/account') },
        { label: 'Wholesale Orders',  href: wsHref('/account/orders') },
        { label: 'Cart',              href: wsHref('/cart') },
        { label: 'Log In',            href: wsHref('/login') },
        { label: 'Apply for Wholesale', href: wsHref('/register') },
    ] : [
        { label: 'My Account',     href: '/account' },
        { label: 'Log In',         href: '/login' },
        { label: 'Create Account', href: '/register' },
    ];

    if (!isOpen) return null;

    const menuBg      = dark ? '#0a0a0a' : '#ffffff';
    const divider     = dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const navText     = dark ? '#ffffff' : '#101114';
    const navHoverBg  = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    const secHead     = dark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
    const secLink     = dark ? 'rgba(255,255,255,0.72)' : '#383838';
    const accountText = dark ? 'rgba(255,255,255,0.6)' : 'rgba(16,17,20,0.6)';
    const closeColor  = dark ? '#ffffff' : '#101114';

    // Reusable secondary link item
    const SecLink = ({ href, label, helper }: { href: string; label: string; helper?: string }) => (
        <li>
            <Link
                href={href}
                onClick={onClose}
                className="flex flex-col justify-center px-5 py-[10px] transition-colors"
                style={{ color: secLink }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = navHoverBg)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
                <span className="font-montserrat font-normal text-[14px]">{label}</span>
                {helper && (
                    <span className="font-montserrat font-normal text-[12px]" style={{ color: secHead }}>{helper}</span>
                )}
            </Link>
        </li>
    );

    return (
        <div
            className="fixed inset-0 z-[9999] overflow-y-auto"
            style={{ backgroundColor: menuBg, transition: 'background-color 200ms' }}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
        >
            {/* ── Logo + Close ── */}
            <div
                className="flex items-center justify-between px-4 py-4"
                style={{ borderBottom: `1px solid ${divider}` }}
            >
                <Link href={isWs ? wsHref('/') : '/'} onClick={onClose}>
                    <SiteLogo dark={dark} size="sm" />
                </Link>
                <button
                    onClick={onClose}
                    aria-label="Close menu"
                    className="transition-colors p-2 hover:text-[#00ebd8]"
                    style={{ color: closeColor }}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* ── Primary nav ── */}
            <nav className="py-2">
                <ul>
                    {TOP_CATEGORIES.map((top) => {
                        const isExpanded = expanded === top.slug;
                        return (
                            <li key={top.slug}>
                                <div className="flex items-stretch" style={{ minHeight: '56px' }}>
                                    {/* Title → category "Shop All" page */}
                                    <Link
                                        href={catHref(top.slug, top.href)}
                                        onClick={onClose}
                                        className="flex flex-1 items-center px-5 py-4 transition-colors group"
                                        style={{ color: navText }}
                                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = navHoverBg)}
                                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                                    >
                                        <span className="font-montserrat font-medium text-[15px] uppercase group-hover:text-[#00ebd8]">
                                            {top.label}
                                        </span>
                                    </Link>
                                    {/* Chevron → expand sub-categories */}
                                    <button
                                        type="button"
                                        onClick={() => setExpanded(isExpanded ? null : top.slug)}
                                        aria-expanded={isExpanded}
                                        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${top.label}`}
                                        className="flex items-center justify-center px-5"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: navText }}
                                    >
                                        <svg
                                            className="w-4 h-4 transition-transform duration-200"
                                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>
                                </div>

                                {isExpanded && (
                                    <div className="pb-3" style={{ backgroundColor: navHoverBg }}>
                                        <ul>
                                            <SecLink href={catHref(top.slug, top.href)} label={`Shop All ${top.label}`} />
                                        </ul>
                                        {top.groups.map(group => (
                                            <div key={group.heading}>
                                                {top.groups.length > 1 && (
                                                    <p className="font-montserrat font-semibold text-[11px] uppercase tracking-[0.08em] px-5 pt-3 pb-1 m-0"
                                                        style={{ color: secHead }}>{group.heading}</p>
                                                )}
                                                <ul>
                                                    {group.items.map(item => (
                                                        <SecLink key={item.slug} href={catHref(item.slug, item.href)} label={item.label} helper={item.helper} />
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                    {plainItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                onClick={onClose}
                                className="flex items-center px-5 py-4 transition-colors group"
                                style={{ minHeight: '56px', color: navText }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = navHoverBg)}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <span className="font-montserrat font-medium text-[15px] uppercase group-hover:text-[#00ebd8]">
                                    {item.label}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="mx-5" style={{ borderTop: `1px solid ${divider}` }} />

            {/* ── About ── */}
            <div className="px-5 pt-4 pb-1">
                <p className="font-montserrat font-semibold text-[11px] uppercase tracking-[0.08em]"
                    style={{ color: secHead }}>About</p>
            </div>
            <nav><ul>{aboutItems.map(i => <SecLink key={i.href} {...i} />)}</ul></nav>

            <div className="mx-5 my-3" style={{ borderTop: `1px solid ${divider}` }} />

            {/* ── Support ── */}
            <div className="px-5 pt-1 pb-1">
                <p className="font-montserrat font-semibold text-[11px] uppercase tracking-[0.08em]"
                    style={{ color: secHead }}>Support</p>
            </div>
            <nav><ul>{supportItems.map(i => <SecLink key={i.href} {...i} />)}</ul></nav>

            <div className="mx-5 my-3" style={{ borderTop: `1px solid ${divider}` }} />

            {/* ── Account ── */}
            <nav className="py-2">
                <ul>
                    {accountItems.map((item) => (
                        <li key={item.href}>
                            <Link
                                href={item.href}
                                onClick={onClose}
                                className="flex items-center px-5 py-3 transition-colors"
                                style={{ minHeight: '44px', color: accountText }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = navHoverBg)}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                            >
                                <span className="font-montserrat font-normal text-[14px]">{item.label}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* ── Shop Wholesale (retail) / Shop Consumer (wholesale) — always the other domain ── */}
            <div className="px-5 py-6">
                {isWs ? (
                    <a
                        href={getRetailUrl()}
                        onClick={onClose}
                        className="flex items-center justify-center w-full text-white font-montserrat font-semibold text-[14px] uppercase"
                        style={{ height: '48px', backgroundColor: '#CD142C', borderRadius: '26px', boxShadow: '0px 0px 7.2px 1px rgba(205,20,44,0.8)' }}
                    >
                        SHOP CONSUMER
                    </a>
                ) : (
                    <a
                        href={getWholesaleUrl()}
                        onClick={onClose}
                        className="flex items-center justify-center w-full text-black font-montserrat font-semibold text-[14px] uppercase"
                        style={{ height: '48px', backgroundColor: '#00EBD8', borderRadius: '26px', boxShadow: '0px 0px 7.2px 1px rgba(0,235,216,1)' }}
                    >
                        SHOP WHOLESALE
                    </a>
                )}
            </div>
        </div>
    );
}
