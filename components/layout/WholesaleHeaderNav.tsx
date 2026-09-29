'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { useTheme } from '../providers/ThemeProvider';
import { TOP_CATEGORIES, BRANDS, type CategoryGroup } from '../../lib/config/categories';
import { useWholesaleHref } from '../../lib/config/use-wholesale-path';

/* ── Wholesale nav — same category tree as retail (lib/config/categories.ts),
      every link points at the wholesale category page /wholesale/category/<slug>. ── */

type DropdownGroup = { heading?: string; items: { label: string; slug: string; helper?: string }[] };

/** Groups shown in a top-level item's dropdown: "Shop All" + its groups (+ brands for flavours). */
function groupsFor(slug: string, groups: CategoryGroup[]): DropdownGroup[] {
    const out: DropdownGroup[] = groups.map(g => ({
        heading: groups.length > 1 || slug === 'hookah-flavours' ? g.heading : undefined,
        items: g.items.map(i => ({ label: i.label, slug: i.slug, helper: i.helper })),
    }));
    if (slug === 'hookah-flavours') {
        out.push({ heading: 'Shop by Brand', items: BRANDS.map(b => ({ label: b.label, slug: b.slug })) });
    }
    return out;
}

export default function WholesaleHeaderNav() {
    const { dark } = useTheme();
    const href = useWholesaleHref();
    const [openSlug, setOpenSlug] = useState<string | null>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
    const [mounted, setMounted] = useState(false);

    const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const hoverLi = useRef(false);
    const hoverPanel = useRef(false);

    useEffect(() => { setMounted(true); }, []);

    const clearClose = () => {
        if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
    };

    const scheduleClose = useCallback(() => {
        clearClose();
        closeTimer.current = setTimeout(() => {
            if (!hoverLi.current && !hoverPanel.current) setOpenSlug(null);
        }, 250);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleLiEnter = (slug: string, el: HTMLElement) => {
        hoverLi.current = true;
        clearClose();
        const r = el.getBoundingClientRect();
        setDropdownPos({ top: r.bottom, left: r.left });
        setOpenSlug(slug);
    };

    const handleLiLeave = () => { hoverLi.current = false; scheduleClose(); };
    const handlePanelEnter = () => { hoverPanel.current = true; clearClose(); };
    const handlePanelLeave = () => { hoverPanel.current = false; scheduleClose(); };
    const closeNow = () => { setOpenSlug(null); hoverLi.current = false; hoverPanel.current = false; };

    useEffect(() => {
        const hide = () => {
            hoverLi.current = false; hoverPanel.current = false;
            clearClose(); setOpenSlug(null);
        };
        window.addEventListener('scroll', hide, { passive: true });
        window.addEventListener('resize', hide);
        return () => { window.removeEventListener('scroll', hide); window.removeEventListener('resize', hide); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const dropdownBg = dark ? '#1a1a1a' : '#ffffff';
    const dropdownBorder = dark ? '#3a3a3a' : '#e5e5e5';
    const dropdownText = dark ? '#ffffff' : '#101114';
    const dropdownHover = dark ? '#2a2a2a' : '#f5f5f5';
    const headingColor = dark ? 'rgba(255,255,255,0.45)' : '#6c6d73';

    const openTop = TOP_CATEGORIES.find(t => t.slug === openSlug);
    const linkStyle: React.CSSProperties = { display: 'block', padding: '10px 20px', color: dropdownText, fontFamily: "var(--font-montserrat), sans-serif", fontSize: '14px', fontWeight: 500, textDecoration: 'none', transition: 'background-color 150ms' };

    const dropdownPanel = mounted && openTop
        ? createPortal(
            <div
                style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, zIndex: 99999, paddingTop: '6px' }}
                onMouseEnter={handlePanelEnter}
                onMouseLeave={handlePanelLeave}
            >
                <div style={{ backgroundColor: dropdownBg, border: `1px solid ${dropdownBorder}`, borderRadius: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: '240px', maxHeight: '70vh', overflowY: 'auto', padding: '6px 0' }}>
                    <Link
                        href={href(`/category/${openTop.slug}`)}
                        onClick={closeNow}
                        style={{ ...linkStyle, color: '#CD142C', fontWeight: 600 }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = dropdownHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        Shop All {openTop.label}
                    </Link>
                    {groupsFor(openTop.slug, openTop.groups).map((group, gi) => (
                        <div key={group.heading ?? gi}>
                            {group.heading && (
                                <p style={{ margin: 0, padding: '12px 20px 4px', fontFamily: "var(--font-montserrat), sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: headingColor }}>
                                    {group.heading}
                                </p>
                            )}
                            {group.items.map(item => (
                                <Link
                                    key={item.slug}
                                    href={href(`/category/${item.slug}`)}
                                    onClick={closeNow}
                                    style={linkStyle}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = dropdownHover)}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                >
                                    {item.label}
                                    {item.helper && (
                                        <span style={{ display: 'block', fontSize: 12, fontWeight: 400, color: headingColor, marginTop: 2 }}>{item.helper}</span>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ))}
                </div>
            </div>,
            document.body
        )
        : null;

    return (
        <>
            <div className="hookah-header-bg hookah-nav-border hidden lg:block transition-colors duration-200"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.08)', transition: 'box-shadow 300ms ease' }}
            >
                <nav aria-label="Wholesale navigation">
                    <div className="px-6 py-4 flex items-center justify-center">
                        <ul className="flex items-center gap-8 flex-1 justify-center">
                            {TOP_CATEGORIES.map((top) => (
                                <li
                                    key={top.slug}
                                    style={{ position: 'relative' }}
                                    onMouseEnter={(e) => handleLiEnter(top.slug, e.currentTarget)}
                                    onMouseLeave={handleLiLeave}
                                >
                                    <span className="flex items-center gap-1">
                                        {/* Title → category "Shop All" page */}
                                        <Link
                                            href={href(`/category/${top.slug}`)}
                                            onClick={closeNow}
                                            className="outline-none rounded px-1 py-1"
                                            style={{ textDecoration: 'none' }}
                                        >
                                            <span className={`hookah-nav-text font-montserrat font-semibold text-sm uppercase tracking-wider transition-colors ${dark ? 'text-white' : 'text-[#101114]'}`}>
                                                {top.label}
                                            </span>
                                        </Link>
                                        <svg className={`w-3 h-3 ${dark ? 'text-white/40' : 'text-[#101114]/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </nav>
            </div>

            {dropdownPanel}
        </>
    );
}
