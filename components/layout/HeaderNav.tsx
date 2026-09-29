'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from '../providers/ThemeProvider';
import { usePathname } from 'next/navigation';
import { TOP_CATEGORIES, BRANDS, type TopCategory } from '../../lib/config/categories';

/* ─────────────────────────────────────────────────────────────────────────
   PER-NAV MEGA MENU CONTENT
   Category columns come from lib/config/categories.ts (single source of
   truth). Only extra, non-category columns (brands, "more ways to shop")
   are defined here.
───────────────────────────────────────────────────────────────────────── */
type Col = {
    heading: string;
    shopAll?: string;
    items: { label: string; href: string; helper?: string }[];
};

type MegaColumns = { type: 'columns'; cols: Col[] };
type MegaWithImage = { type: 'columns-image'; cols: Col[]; image: string; imageAlt: string };
type MegaDef = MegaColumns | MegaWithImage | null;

/* Extra columns appended after a category's own groups */
const EXTRA_COLS: Record<string, Col[]> = {
    'hookahs': [
        {
            heading: 'More Ways to Shop',
            items: [
                { label: 'Shop by Brand', href: '/hookahs/shop-by-brand' },
                { label: 'Shop by Price', href: '/hookahs/shop-by-price' },
            ],
        },
    ],
    'hookah-flavours': [
        {
            heading: 'Shop by Brand',
            items: BRANDS.map(b => ({ label: b.label, href: b.href })),
        },
    ],
};

const megaFor = (top: TopCategory): MegaDef => ({
    type: 'columns',
    cols: [
        ...top.groups.map((g, i) => ({
            heading: g.heading,
            // "Shop All" only on the first column — it always points at the parent
            ...(i === 0 ? { shopAll: top.href } : {}),
            items: g.items.map(c => ({ label: c.label, href: c.href, helper: c.helper })),
        })),
        ...(EXTRA_COLS[top.slug] ?? []),
    ],
});

const NAV_MEGA: Record<string, MegaDef> = {
    ...Object.fromEntries(TOP_CATEGORIES.map(t => [t.label, megaFor(t)])),
    'Resources': null,
    'Offers': null,
};

const NAV_ITEMS = [...TOP_CATEGORIES.map(t => t.label), 'Resources', 'Offers'];

const NAV_HREFS: Record<string, string> = {
    ...Object.fromEntries(TOP_CATEGORIES.map(t => [t.label, t.href])),
    'Resources': '/blog',
    'Offers': '/offers',
};

/* ─────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────── */
export default function HeaderNav() {
    const { dark } = useTheme();
    const pathname = usePathname();

    const [activeNav, setActiveNav] = useState<string | null>(null);
    const [panelTop, setPanelTop] = useState(0);
    const [mounted, setMounted] = useState(false);

    const navRef = useRef<HTMLDivElement>(null);
    const hoverNav = useRef(false);  // mouse is over a nav item
    const hoverPanel = useRef(false);  // mouse is over the mega panel
    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { setMounted(true); }, []);

    const syncTop = useCallback(() => {
        if (navRef.current) setPanelTop(navRef.current.getBoundingClientRect().bottom);
    }, []);

    /* Keep panel top in sync */
    useEffect(() => {
        syncTop();
        window.addEventListener('scroll', syncTop, { passive: true });
        window.addEventListener('resize', syncTop);
        return () => { window.removeEventListener('scroll', syncTop); window.removeEventListener('resize', syncTop); };
    }, [syncTop]);

    /* Close on route change */
    useEffect(() => { setActiveNav(null); }, [pathname]);

    /* ── Hover helpers ───────────────────────────────────────────────────── */
    const cancelClose = () => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } };
    const cancelOpen = () => { if (openTimer.current) { clearTimeout(openTimer.current); openTimer.current = null; } };

    const scheduleClose = useCallback(() => {
        cancelClose();
        closeTimer.current = setTimeout(() => {
            if (!hoverNav.current && !hoverPanel.current) setActiveNav(null);
        }, 220);
    }, []);

    const handleNavEnter = (label: string) => {
        hoverNav.current = true;
        cancelClose();
        cancelOpen();
        if (!NAV_MEGA[label]) return; // no mega for this item
        // Small delay so fast mouse sweeps don't flicker
        openTimer.current = setTimeout(() => {
            syncTop();
            setActiveNav(label);
        }, 80);
    };

    const handleNavLeave = () => {
        hoverNav.current = false;
        cancelOpen();
        scheduleClose();
    };

    const handlePanelEnter = () => { hoverPanel.current = true; cancelClose(); };
    const handlePanelLeave = () => { hoverPanel.current = false; scheduleClose(); };

    /* Click: toggle (keyboard / tap support) */
    const handleNavClick = (label: string) => {
        if (!NAV_MEGA[label]) return;
        syncTop();
        setActiveNav(prev => (prev === label ? null : label));
    };

    const close = () => {
        hoverNav.current = false;
        hoverPanel.current = false;
        cancelClose(); cancelOpen();
        setActiveNav(null);
    };

    /* ── Theme tokens ─────────────────────────────────────────────────────── */
    const panelBg = dark ? '#141414' : '#ffffff';
    const panelBorder = dark ? '#2a2a2a' : '#e8e8e8';
    const colDivider = dark ? '#2a2a2a' : '#e4e4e4';
    const headingColor = dark ? '#b0b0b0' : '#101114';
    const itemColor = dark ? '#d4d4d4' : '#222222';
    const shopAllColor = '#CD142C';
    const helperColor = dark ? 'rgba(255,255,255,0.45)' : '#6c6d73';
    const rowHoverBg = dark ? 'rgba(255,255,255,0.05)' : 'rgba(16,17,20,0.04)';

    /* ── Link row style helper ────────────────────────────────────────────── */
    const linkStyle = (isShopAll: boolean): React.CSSProperties => ({
        display: 'block',
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: '14px',
        fontWeight: isShopAll ? 500 : 400,
        color: isShopAll ? shopAllColor : itemColor,
        padding: '6px 10px',
        marginLeft: '-10px',
        borderRadius: '6px',
        textDecoration: 'none',
        transition: 'background-color 100ms',
        marginBottom: isShopAll ? '4px' : '0',
    });

    /* ── Render columns ───────────────────────────────────────────────────── */
    const renderCols = (cols: Col[]) => cols.map((col, ci) => (
        <div
            key={ci}
            style={{
                borderRight: ci < cols.length - 1 ? `1px solid ${colDivider}` : 'none',
                paddingRight: ci < cols.length - 1 ? '40px' : '0',
                paddingLeft: ci > 0 ? '40px' : '0',
            }}
        >
            <p style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontWeight: 700,
                fontSize: '13px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: headingColor,
                marginBottom: '14px',
            }}>
                {col.heading}
            </p>
            {col.shopAll && (
                <Link href={col.shopAll} onClick={close} style={linkStyle(true)}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = rowHoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >Shop All</Link>
            )}
            {col.items.map(item => (
                <Link key={item.label} href={item.href} onClick={close} style={linkStyle(false)}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = rowHoverBg)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                    {item.label}
                    {item.helper && (
                        <span style={{ display: 'block', fontSize: '12px', lineHeight: '16px', color: helperColor, marginTop: '2px' }}>
                            {item.helper}
                        </span>
                    )}
                </Link>
            ))}
        </div>
    ));

    /* ── Mega panel content ───────────────────────────────────────────────── */
    const renderPanelContent = (def: MegaDef) => {
        if (!def) return null;
        if (def.type === 'columns') {
            return (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${def.cols.length}, 1fr)`,
                    padding: '36px 124px 40px',
                }}>
                    {renderCols(def.cols)}
                </div>
            );
        }
        // columns-image layout
        return (
            <div style={{
                display: 'grid',
                gridTemplateColumns: '220px 1fr',
                gap: '0',
                padding: '36px 124px 40px',
                alignItems: 'start',
            }}>
                {/* Left: columns */}
                <div style={{
                    borderRight: `1px solid ${colDivider}`,
                    paddingRight: '40px',
                }}>
                    {renderCols(def.cols)}
                </div>
                {/* Right: promo image */}
                <div style={{ paddingLeft: '40px' }}>
                    <div style={{ position: 'relative', width: '100%', height: '220px', borderRadius: '12px', overflow: 'hidden' }}>
                        <Image
                            src={def.image}
                            alt={def.imageAlt}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 60vw, 100vw"
                        />
                    </div>
                </div>
            </div>
        );
    };

    /* ── Portal panel ─────────────────────────────────────────────────────── */
    const def = activeNav ? NAV_MEGA[activeNav] : null;
    const megaPanel = mounted && activeNav && def
        ? createPortal(
            <>
                {/* Transparent backdrop captures clicks outside */}
                <div
                    aria-hidden="true"
                    onMouseDown={close}
                    style={{ position: 'fixed', inset: 0, top: panelTop, zIndex: 99990 }}
                />
                {/* Panel */}
                <div
                    onMouseEnter={handlePanelEnter}
                    onMouseLeave={handlePanelLeave}
                    style={{
                        position: 'fixed',
                        top: panelTop,
                        left: 0,
                        width: '100vw',
                        zIndex: 99991,
                        backgroundColor: panelBg,
                        borderTop: `1px solid ${panelBorder}`,
                        borderBottom: `1px solid ${panelBorder}`,
                        boxShadow: '0 16px 48px rgba(0,0,0,0.13)',
                        animation: 'megaSlideDown 160ms cubic-bezier(0.25,0.46,0.45,0.94) both',
                    }}
                >
                    <style>{`
                        @keyframes megaSlideDown {
                            from { opacity:0; transform:translateY(-6px); }
                            to   { opacity:1; transform:translateY(0);    }
                        }
                    `}</style>
                    {renderPanelContent(def)}
                </div>
            </>,
            document.body
        )
        : null;

    /* ── Render ───────────────────────────────────────────────────────────── */
    return (
        <>
            <div
                ref={navRef}
                className="hookah-header-bg hookah-nav-border hidden lg:block transition-colors duration-200"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', overflow: 'visible' }}
            >
                <nav aria-label="Main navigation">
                    <div className="px-6 py-5">
                        <ul className="flex items-center justify-center min-w-max gap-12 md:gap-8">
                            {NAV_ITEMS.map(label => {
                                const isActive = activeNav === label;
                                const hasMega = !!NAV_MEGA[label];
                                return (
                                    <li
                                        key={label}
                                        onMouseEnter={() => handleNavEnter(label)}
                                        onMouseLeave={handleNavLeave}
                                    >
                                        {hasMega ? (
                                            /* Split: Link navigates, chevron button toggles dropdown */
                                            <span className="flex items-center gap-1">
                                                <Link
                                                    href={NAV_HREFS[label]}
                                                    onClick={close}
                                                    className="outline-none rounded px-2 py-1"
                                                    style={{ textDecoration: 'none' }}
                                                >
                                                    <span
                                                        className="hookah-nav-text font-montserrat font-semibold text-base uppercase tracking-wider transition-colors"
                                                        style={{ color: isActive ? '#CD142C' : (dark ? '#ffffff' : '#101114') }}
                                                    >
                                                        {label}
                                                    </span>
                                                </Link>
                                                {/* Chevron — only controls the dropdown */}
                                                <button
                                                    type="button"
                                                    aria-label={`${isActive ? 'Close' : 'Open'} ${label} menu`}
                                                    aria-expanded={isActive}
                                                    onClick={(e) => { e.preventDefault(); handleNavClick(label); }}
                                                    className="outline-none rounded p-1 flex items-center"
                                                    style={{ cursor: 'pointer', background: 'none', border: 'none' }}
                                                >
                                                    <svg
                                                        className="w-3.5 h-3.5 transition-transform duration-200"
                                                        style={{
                                                            transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                                                            color: isActive ? '#CD142C' : (dark ? 'rgba(255,255,255,0.4)' : 'rgba(16,17,20,0.4)'),
                                                        }}
                                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            </span>
                                        ) : (
                                            <Link
                                                href={NAV_HREFS[label]}
                                                className="flex items-center gap-2 outline-none rounded px-2 py-1"
                                            >
                                                <span
                                                    className="hookah-nav-text font-montserrat font-semibold text-base uppercase tracking-wider transition-colors"
                                                    style={{ color: dark ? '#ffffff' : '#101114' }}
                                                >
                                                    {label}
                                                </span>
                                            </Link>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </nav>
            </div>

            {megaPanel}
        </>
    );
}
