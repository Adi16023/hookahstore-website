'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '../../../components/providers/ThemeProvider';

/* ── SVG path constants (same icon set as retail) ── */
const P = {
    account:    'M5.125 19.5C5.60539 18.962 7.85526 16.4861 8.51459 16.4861H15.4858C16.4413 16.4861 18.3916 18.5384 18.875 19.2619M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15.5821 8.59162C15.5821 6.6838 13.9716 5.125 12.0003 5.125C10.0291 5.125 8.41848 6.6838 8.41848 8.59162C8.41848 10.4994 10.0291 12.0582 12.0003 12.0582C13.9715 12.0582 15.5821 10.4994 15.5821 8.59162Z',
    ordersCart: 'M3.75487 3.78882H17.5292C18.4475 3.78882 19.2857 4.20421 18.9066 7.25584C18.4475 9.33605 17.8791 12.8031 15.4631 12.8031H4.44359L3.06615 2.40201C2.83658 1.70861 2.40659 0.877828 1 1.0152',
    ordersLine: 'M4.5166 12.8594C4.5166 13.5248 5.78253 16.1866 8.03307 16.1866H15.7693',
    ordersWl:   'M6 20.2C6.66274 20.2 7.2 19.6627 7.2 19C7.2 18.3373 6.66274 17.8 6 17.8C5.33726 17.8 4.8 18.3373 4.8 19C4.8 19.6627 5.33726 20.2 6 20.2Z',
    ordersWr:   'M15 20.2C15.6627 20.2 16.2 19.6627 16.2 19C16.2 18.3373 15.6627 17.8 15 17.8C14.3373 17.8 13.8 18.3373 13.8 19C13.8 19.6627 14.3373 20.2 15 20.2Z',
    bookmark:   'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z',
    building:   'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM9 22V12h6v10',
    chevron:    'M7 10L12.0008 14.58L17 10',
    pencil:     'M9.28806 4.50854L11.9365 7.15699M2.66699 13.7781L5.87896 13.1309C6.04947 13.0966 6.20604 13.0126 6.329 12.8896L13.5193 5.69532C13.864 5.3504 13.8638 4.79129 13.5188 4.44665L11.9956 2.92521C11.6507 2.58072 11.0919 2.58095 10.7473 2.92573L3.55625 10.1207C3.43353 10.2435 3.34974 10.3998 3.31535 10.5699L2.66699 13.7781Z',
};

/* ── Icons ── */
function AccountIcon({ stroke }: { stroke: string }) {
    return <svg width={24} height={24} viewBox="0 0 24 24" fill="none"><path d={P.account} stroke={stroke} strokeWidth="1.4" /></svg>;
}
function OrdersIcon({ stroke }: { stroke: string }) {
    return (
        <svg width={20} height={21} viewBox="0 0 20 21" fill="none">
            <clipPath id="woc"><rect fill="white" height="21" width="20" /></clipPath>
            <g clipPath="url(#woc)">
                <path d={P.ordersCart} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
                <path d={P.ordersLine} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
                <path d={P.ordersWl} fill={stroke} /><path d={P.ordersWr} fill={stroke} />
            </g>
        </svg>
    );
}
function BuildingIcon({ stroke }: { stroke: string }) {
    return <svg width={24} height={24} viewBox="0 0 24 24" fill="none"><path d={P.building} stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function PencilIcon({ stroke }: { stroke: string }) {
    return <svg width={16} height={16} viewBox="0 0 16 16" fill="none"><path d={P.pencil} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" /></svg>;
}

/* ── Wholesale nav items with real hrefs ── */
const WS_NAV = [
    { key: 'overview', href: '/wholesale/account',          label: 'ACCOUNT OVERVIEW', icon: (s: string) => <AccountIcon stroke={s} /> },
    { key: 'orders',   href: '/wholesale/account/orders',   label: 'WHOLESALE ORDERS',  icon: (s: string) => <OrdersIcon stroke={s} /> },
    { key: 'profile',  href: '/wholesale/account/business', label: 'BUSINESS PROFILE',  icon: (s: string) => <BuildingIcon stroke={s} /> },
] as const;

interface C {
    iconStroke: string; labelColor: string; headingColor: string; sectionBorder: string;
    sidebarBorderRight: string; cardBorder: string; editBtnBg: string; editBtnBorder: string;
    editIconStroke: string; nameColor: string; metaColor: string; noOrdersColor: string;
    linkColor: string; mobileBg: string; mobileNavBorder: string; mobileNavBarBorder: string;
    cardTitleColor: string; statusPendingBg: string; statusPendingText: string; statusPendingBorder: string;
    divider: string;
}

/* ── Logout helper — POST to /api/auth/logout, clear wholesale_cart, redirect ── */
function useLogout() {
    const router = useRouter();
    return async function logout() {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch { /* ignore */ }
        // Clear wholesale cart from localStorage
        try { localStorage.removeItem('wholesale_cart'); } catch { /* ignore */ }
        router.push('/wholesale/login');
        router.refresh();
    };
}

/* ── Sidebar ── */
function WholesaleSidebar({ variant, c }: { variant: 'desktop' | 'tablet'; c: C }) {
    const pathname = usePathname();
    const logout = useLogout();
    const isTablet = variant === 'tablet';

    const labelStyle: React.CSSProperties = {
        fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px',
        lineHeight: '16px', letterSpacing: '0.499px', textTransform: 'uppercase',
        color: c.labelColor, transition: 'color 200ms',
    };

    return (
        <div style={{ borderRight: `1px solid ${c.sidebarBorderRight}`, paddingTop: '48px', paddingBottom: '80px', width: isTablet ? '222px' : '307px', paddingLeft: isTablet ? '60px' : '80px', flexShrink: 0, minHeight: '100vh', boxSizing: 'border-box', transition: 'border-color 200ms' }}>
            <div style={{ borderBottom: `1px solid ${c.sectionBorder}`, paddingBottom: '4px', transition: 'border-color 200ms' }}>
                {WS_NAV.map((item, i) => {
                    // Active if: exact match for overview, startsWith for sub-routes
                    const isActive = item.key === 'overview'
                        ? pathname === item.href
                        : pathname.startsWith(item.href);
                    const isLast = i === WS_NAV.length - 1;
                    return (
                        <div key={item.key} style={{ borderLeft: isActive ? '3px solid #D32F2F' : '3px solid transparent', marginTop: i === 0 ? '20px' : '0', marginBottom: isLast ? '16px' : '40px', transition: 'border-color 200ms' }}>
                            <Link href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', textDecoration: 'none' }}>
                                {item.icon(c.iconStroke)}
                                <span style={labelStyle}>{item.label}</span>
                            </Link>
                        </div>
                    );
                })}
            </div>
            <div style={{ paddingTop: '4px' }}>
                <button
                    onClick={logout}
                    style={{ display: 'block', padding: '16px 12px', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#D32F2F', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    log out
                </button>
            </div>
        </div>
    );
}

/* ── Account content (overview tab — shown at /wholesale/account) ── */
export interface SessionData { firstName: string; lastName: string; email: string; role?: string; accountType: string; }

export function WholesaleAccountContent({ variant, c, session }: { variant: 'desktop' | 'tablet' | 'mobile'; c: C; session: SessionData }) {
    const isMobile = variant === 'mobile';
    const isDesktop = variant === 'desktop';
    const titleSize = isMobile ? '28px' : '40px';
    const titleLH = isMobile ? '36px' : '54px';
    const secSize = isMobile ? '14px' : '16px';
    const secLH = isMobile ? '20px' : '24px';
    const cardMax = isDesktop ? '456px' : '100%';

    const isPending = session.role === 'wholesale_pending';
    const isApproved = session.role === 'wholesale_customer';

    const statusLabel = isApproved ? 'Approved' : isPending ? 'Under Review' : session.role ?? '—';
    const statusBg    = isApproved ? 'rgba(46,125,50,0.12)' : c.statusPendingBg;
    const statusBorder = isApproved ? 'rgba(46,125,50,0.35)' : c.statusPendingBorder;
    const statusColor  = isApproved ? '#4caf50' : c.statusPendingText;

    return (
        <div style={{ flex: 1, padding: isMobile ? '0 16px 40px' : '48px 32px 80px', overflowY: 'auto' }}>
            <h1 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: titleSize, lineHeight: titleLH, color: c.headingColor, margin: isMobile ? '16px 0 16px' : '4px 0 24px', transition: 'color 200ms' }}>
                ACCOUNT
            </h1>

            {isPending && (
                <div style={{ backgroundColor: c.statusPendingBg, border: `1px solid ${c.statusPendingBorder}`, borderRadius: '8px', padding: '16px 20px', marginBottom: '24px' }}>
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', color: c.statusPendingText, margin: '0 0 4px' }}>Account Under Review</p>
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '13px', color: c.statusPendingText, margin: 0, opacity: 0.85 }}>
                        Your wholesale account is currently under review. You will receive an email once your application has been approved.
                    </p>
                </div>
            )}

            <h2 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: secSize, lineHeight: secLH, color: c.headingColor, margin: '0 0 16px', transition: 'color 200ms' }}>Account Information</h2>

            <div style={{ border: `1px solid ${c.cardBorder}`, borderRadius: '8px', padding: '24px', position: 'relative', marginBottom: '32px', maxWidth: cardMax, transition: 'border-color 200ms' }}>
                <button style={{ position: 'absolute', top: '24px', right: '24px', width: '40px', height: '40px', borderRadius: '50%', border: `1px solid ${c.editBtnBorder}`, background: c.editBtnBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 200ms, border-color 200ms' }}>
                    <PencilIcon stroke={c.editIconStroke} />
                </button>
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: '20px', color: c.nameColor, margin: '0 0 8px', transition: 'color 200ms' }}>{session.firstName} {session.lastName}</p>
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', lineHeight: '20px', color: c.metaColor, margin: '0 0 16px', transition: 'color 200ms' }}>{session.email}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: statusBg, border: `1px solid ${statusBorder}`, borderRadius: '6px', padding: '4px 12px', marginBottom: '16px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: statusColor }} />
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '12px', color: statusColor }}>{statusLabel}</span>
                </div>
                <div style={{ borderTop: `1px solid ${c.divider}`, paddingTop: '16px' }}>
                    <a href="/wholesale/reset-password" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: c.linkColor, textDecoration: 'underline' }}>Change Password</a>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: secSize, lineHeight: secLH, color: c.headingColor, margin: 0, transition: 'color 200ms' }}>Recent Wholesale Orders</h2>
                <Link href="/wholesale/account/orders" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: c.linkColor, textDecoration: 'underline', textTransform: 'capitalize' }}>View All</Link>
            </div>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '12px', lineHeight: '16px', color: c.noOrdersColor, margin: '0 0 32px', transition: 'color 200ms' }}>No wholesale orders yet.</p>

            <h2 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: secSize, lineHeight: secLH, color: c.headingColor, margin: '0 0 16px', transition: 'color 200ms' }}>Bulk Order Information</h2>
            <div style={{ border: `1px solid ${c.cardBorder}`, borderRadius: '8px', padding: '20px 24px', maxWidth: cardMax, transition: 'border-color 200ms' }}>
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '22px', color: c.metaColor, margin: 0 }}>
                    For bulk or custom orders, contact your account manager or email{' '}
                    <a href="mailto:wholesale@thehookahstore.in" style={{ color: c.linkColor, textDecoration: 'underline' }}>wholesale@thehookahstore.in</a>
                </p>
            </div>
        </div>
    );
}

/* ── Mobile sidebar menu ── */
function MobileMenu({ onClose, onLogout, c }: { onClose: () => void; onLogout: () => void; c: C }) {
    const pathname = usePathname();
    const labelStyle: React.CSSProperties = { fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', lineHeight: '16px', letterSpacing: '0.499px', textTransform: 'uppercase', color: c.labelColor, transition: 'color 200ms' };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.mobileBg, zIndex: 50, overflowY: 'auto', transition: 'background-color 200ms' }}>
            <div style={{ padding: '16px 20px' }}>
                <div style={{ borderBottom: `1px solid ${c.mobileNavBorder}`, marginBottom: '8px', transition: 'border-color 200ms' }}>
                    {WS_NAV.map(item => {
                        const isActive = item.key === 'overview' ? pathname === item.href : pathname.startsWith(item.href);
                        return (
                            <Link key={item.key} href={item.href} onClick={onClose}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0', textDecoration: 'none', borderLeft: isActive ? '3px solid #D32F2F' : '3px solid transparent', paddingLeft: isActive ? '9px' : '12px' }}>
                                {item.icon(c.iconStroke)}
                                <span style={labelStyle}>{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '16px 0', display: 'block' }} onClick={onLogout}>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#D32F2F' }}>log out</span>
                </button>
            </div>
        </div>
    );
}

/* ── Shared shell (sidebar + slot for page content) ── */
export function WholesaleAccountShell({ session, children }: { session: SessionData; children: React.ReactNode }) {
    const { dark } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const logout = useLogout();

    const c: C = {
        iconStroke:        dark ? 'rgba(255,255,255,0.75)' : '#1B1C1F',
        labelColor:        dark ? 'rgba(255,255,255,0.85)' : '#1b1c1f',
        headingColor:      dark ? '#ffffff' : '#000000',
        sectionBorder:     dark ? 'rgba(255,255,255,0.10)' : '#d7d8db',
        sidebarBorderRight: dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb',
        cardBorder:        dark ? 'rgba(255,255,255,0.12)' : '#d7d8db',
        editBtnBg:         dark ? 'rgba(255,255,255,0.06)' : '#ffffff',
        editBtnBorder:     dark ? 'rgba(255,255,255,0.15)' : '#d7d8db',
        editIconStroke:    dark ? 'rgba(255,255,255,0.70)' : '#101114',
        nameColor:         dark ? 'rgba(255,255,255,0.95)' : '#101114',
        metaColor:         dark ? 'rgba(255,255,255,0.55)' : '#4c4e52',
        noOrdersColor:     dark ? 'rgba(255,255,255,0.40)' : '#6c6d73',
        linkColor:         '#D32F2F',
        mobileBg:          dark ? '#1e1e1e' : '#f6f5f8',
        mobileNavBorder:   dark ? 'rgba(255,255,255,0.10)' : '#d7d8db',
        mobileNavBarBorder: dark ? 'rgba(255,255,255,0.10)' : '#d7d8db',
        cardTitleColor:    dark ? '#ffffff' : '#000000',
        statusPendingBg:   dark ? 'rgba(251,191,36,0.08)' : '#fffbeb',
        statusPendingText: dark ? '#fbbf24' : '#92400e',
        statusPendingBorder: dark ? 'rgba(251,191,36,0.30)' : 'rgba(251,191,36,0.50)',
        divider:           dark ? 'rgba(255,255,255,0.10)' : '#d7d8db',
    };
    const pageBg = dark ? '#121212' : '#ffffff';

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', width: '100%', transition: 'background-color 200ms' }}>

            {/* Desktop ≥1280px */}
            <div className="hidden min-[1280px]:flex min-h-screen">
                <WholesaleSidebar variant="desktop" c={c} />
                <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
            </div>

            {/* Tablet 768–1279px */}
            <div className="hidden min-[768px]:flex min-[1280px]:hidden min-h-screen">
                <WholesaleSidebar variant="tablet" c={c} />
                <div style={{ flex: 1, overflowY: 'auto' }}>{children}</div>
            </div>

            {/* Mobile ≤767px */}
            <div className="flex flex-col min-h-screen min-[768px]:hidden">
                <div
                    style={{ borderTop: `1px solid ${c.mobileNavBarBorder}`, borderBottom: `1px solid ${c.mobileNavBarBorder}`, height: '58px', display: 'flex', alignItems: 'center', padding: '0 16px', cursor: 'pointer', transition: 'border-color 200ms' }}
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <AccountIcon stroke={c.iconStroke} />
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', lineHeight: '16px', letterSpacing: '0.499px', textTransform: 'uppercase', color: c.headingColor, marginLeft: '8px', flex: 1, transition: 'color 200ms' }}>ACCOUNT</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d={P.chevron} stroke={c.iconStroke} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                {children}
                {mobileMenuOpen && <MobileMenu onClose={() => setMobileMenuOpen(false)} onLogout={logout} c={c} />}
            </div>
        </div>
    );
}

/* ── Legacy default export kept for compatibility ── */
export default function WholesaleAccountClient({ session }: { session: SessionData }) {
    const { dark } = useTheme();

    const c: C = {
        iconStroke:        dark ? 'rgba(255,255,255,0.75)' : '#1B1C1F',
        labelColor:        dark ? 'rgba(255,255,255,0.85)' : '#1b1c1f',
        headingColor:      dark ? '#ffffff' : '#000000',
        sectionBorder:     dark ? 'rgba(255,255,255,0.10)' : '#d7d8db',
        sidebarBorderRight: dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb',
        cardBorder:        dark ? 'rgba(255,255,255,0.12)' : '#d7d8db',
        editBtnBg:         dark ? 'rgba(255,255,255,0.06)' : '#ffffff',
        editBtnBorder:     dark ? 'rgba(255,255,255,0.15)' : '#d7d8db',
        editIconStroke:    dark ? 'rgba(255,255,255,0.70)' : '#101114',
        nameColor:         dark ? 'rgba(255,255,255,0.95)' : '#101114',
        metaColor:         dark ? 'rgba(255,255,255,0.55)' : '#4c4e52',
        noOrdersColor:     dark ? 'rgba(255,255,255,0.40)' : '#6c6d73',
        linkColor:         '#D32F2F',
        mobileBg:          dark ? '#1e1e1e' : '#f6f5f8',
        mobileNavBorder:   dark ? 'rgba(255,255,255,0.10)' : '#d7d8db',
        mobileNavBarBorder: dark ? 'rgba(255,255,255,0.10)' : '#d7d8db',
        cardTitleColor:    dark ? '#ffffff' : '#000000',
        statusPendingBg:   dark ? 'rgba(251,191,36,0.08)' : '#fffbeb',
        statusPendingText: dark ? '#fbbf24' : '#92400e',
        statusPendingBorder: dark ? 'rgba(251,191,36,0.30)' : 'rgba(251,191,36,0.50)',
        divider:           dark ? 'rgba(255,255,255,0.10)' : '#d7d8db',
    };

    return (
        <WholesaleAccountShell session={session}>
            <WholesaleAccountContent variant="desktop" c={c} session={session} />
        </WholesaleAccountShell>
    );
}
