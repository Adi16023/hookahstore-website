'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '../../../components/providers/ThemeProvider';
import { useAuth } from '../../../components/providers/AuthProvider';
import AccountSidebar from '../../../components/account/AccountSidebar';

const SVG_PATHS = {
    account: 'M5.125 19.5C5.60539 18.962 7.85526 16.4861 8.51459 16.4861H15.4858C16.4413 16.4861 18.3916 18.5384 18.875 19.2619M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15.5821 8.59162C15.5821 6.6838 13.9716 5.125 12.0003 5.125C10.0291 5.125 8.41848 6.6838 8.41848 8.59162C8.41848 10.4994 10.0291 12.0582 12.0003 12.0582C13.9715 12.0582 15.5821 10.4994 15.5821 8.59162Z',
    ordersCart: 'M3.75487 3.78882H17.5292C18.4475 3.78882 19.2857 4.20421 18.9066 7.25584C18.4475 9.33605 17.8791 12.8031 15.4631 12.8031H4.44359L3.06615 2.40201C2.83658 1.70861 2.40659 0.877828 1 1.0152',
    ordersLine: 'M4.5166 12.8594C4.5166 13.5248 5.78253 16.1866 8.03307 16.1866H15.7693',
    ordersWheelLeft: 'M6 20.2C6.66274 20.2 7.2 19.6627 7.2 19C7.2 18.3373 6.66274 17.8 6 17.8C5.33726 17.8 4.8 18.3373 4.8 19C4.8 19.6627 5.33726 20.2 6 20.2Z',
    ordersWheelRight: 'M15 20.2C15.6627 20.2 16.2 19.6627 16.2 19C16.2 18.3373 15.6627 17.8 15 17.8C14.3373 17.8 13.8 18.3373 13.8 19C13.8 19.6627 14.3373 20.2 15 20.2Z',
    rewardsCircle: 'M10 19.3C15.1362 19.3 19.3 15.1362 19.3 10C19.3 4.86375 15.1362 0.7 10 0.7C4.86375 0.7 0.7 4.86375 0.7 10C0.7 15.1362 4.86375 19.3 10 19.3Z',
    rewardsStar: 'M9.63067 4.88797C9.76731 4.55945 10.2327 4.55945 10.3693 4.88797L11.4932 7.59007C11.5508 7.72856 11.681 7.82319 11.8306 7.83518L14.7477 8.06904C15.1024 8.09748 15.2462 8.54008 14.976 8.77155L12.7534 10.6754C12.6395 10.773 12.5897 10.9261 12.6245 11.072L13.3036 13.9186C13.3861 14.2647 13.0096 14.5383 12.706 14.3528L10.2085 12.8274C10.0805 12.7492 9.9195 12.7492 9.7915 12.8274L7.29402 14.3528C6.99038 14.5383 6.61388 14.2647 6.69643 13.9186L7.37546 11.072C7.41026 10.9261 7.36051 10.773 7.2466 10.6754L5.02404 8.77155C4.75383 8.54008 4.89764 8.09748 5.2523 8.06904L8.16944 7.83518C8.31896 7.82319 8.4492 7.72856 8.50681 7.59007L9.63067 4.88797Z',
    addressPin: 'M12.0001 22.0027C12.0001 22.0027 20.0024 15.0489 20.0042 9.83148C20.0057 5.50925 16.4251 2.00419 12.0068 2.0027C7.58856 2.00121 4.00565 5.50386 4.0042 9.82609C4.00244 15.0435 12.0001 22.0027 12.0001 22.0027Z',
    addressCircle: 'M14.5602 9.50372C14.5597 10.8844 13.4152 12.0033 12.0038 12.0029C10.5924 12.0024 9.44861 10.8827 9.44908 9.502C9.44954 8.12128 10.5941 7.00238 12.0055 7.00286C13.4169 7.00333 14.5607 8.12301 14.5602 9.50372Z',
    payment: 'M2.62452 9.36034H21.3746M6.37455 13.6212H9.49956M4.50002 5.09961H19.4997C20.8804 5.09961 21.9997 6.18885 21.9997 7.53351L22 16.6659C22 18.0106 20.8807 19.0996 19.5 19.0996L4.50026 19.0995C3.11958 19.0995 2.00031 18.0094 2.00027 16.6647L2 7.53446C1.99996 6.18974 3.11927 5.09961 4.50002 5.09961Z',
    pencil: 'M9.28806 4.50854L11.9365 7.15699M2.66699 13.7781L5.87896 13.1309C6.04947 13.0966 6.20604 13.0126 6.329 12.8896L13.5193 5.69532C13.864 5.3504 13.8638 4.79129 13.5188 4.44665L11.9956 2.92521C11.6507 2.58072 11.0919 2.58095 10.7473 2.92573L3.55625 10.1207C3.43353 10.2435 3.34974 10.3998 3.31535 10.5699L2.66699 13.7781Z',
    chevronDown: 'M7 10L12.0008 14.58L17 10',
};

function AccountIcon({ size = 24, stroke }: { size?: number; stroke: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d={SVG_PATHS.account} stroke={stroke} strokeWidth="1.4" />
        </svg>
    );
}

function OrdersIcon({ size = 20, stroke }: { size?: number; stroke: string }) {
    return (
        <svg width={size} height={size + 1} viewBox="0 0 20 21" fill="none">
            <clipPath id="ordersClip2"><rect fill="white" height="21" width="20" /></clipPath>
            <g clipPath="url(#ordersClip2)">
                <path d={SVG_PATHS.ordersCart} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
                <path d={SVG_PATHS.ordersLine} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
                <path d={SVG_PATHS.ordersWheelLeft} fill={stroke} />
                <path d={SVG_PATHS.ordersWheelRight} fill={stroke} />
            </g>
        </svg>
    );
}

function RewardsIcon({ size = 20, stroke }: { size?: number; stroke: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
            <clipPath id="rewardsClip2"><rect fill="white" height="20" width="20" /></clipPath>
            <g clipPath="url(#rewardsClip2)">
                <path d={SVG_PATHS.rewardsCircle} stroke={stroke} strokeWidth="1.4" />
                <path d={SVG_PATHS.rewardsStar} fill={stroke} />
            </g>
        </svg>
    );
}

function AddressIcon({ size = 24, stroke }: { size?: number; stroke: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d={SVG_PATHS.addressPin} stroke={stroke} strokeWidth="1.4" />
            <path d={SVG_PATHS.addressCircle} stroke={stroke} strokeWidth="1.4" />
        </svg>
    );
}

function PaymentIcon({ size = 24, stroke }: { size?: number; stroke: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d={SVG_PATHS.payment} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
        </svg>
    );
}

function PencilIcon({ stroke }: { stroke: string }) {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d={SVG_PATHS.pencil} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
        </svg>
    );
}

interface DarkColors {
    iconStroke: string;
    labelColor: string;
    headingColor: string;
    sectionBorder: string;
    sidebarBorderRight: string;
    cardBorder: string;
    editBtnBg: string;
    editBtnBorder: string;
    editIconStroke: string;
    nameColor: string;
    metaColor: string;
    noOrdersColor: string;
    linkColor: string;
    mobileBg: string;
    mobileNavBorder: string;
    mobileNavBarBorder: string;
    cardTitleColor: string;
}

function AddressCard({ title, name, address1, address2, country, phone, c }: {
    title: string; name: string; address1: string; address2: string; country: string; phone: string;
    c: DarkColors;
}) {
    return (
        <div style={{ border: `1px solid ${c.cardBorder}`, borderRadius: '8px', padding: '16px', flex: 1, transition: 'border-color 200ms' }}>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: '20px', color: c.cardTitleColor, margin: '0 0 12px 0', transition: 'color 200ms' }}>{title}</p>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: c.metaColor, margin: '0 0 20px 0', transition: 'color 200ms' }}>{name}</p>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: c.metaColor, margin: '0 0 4px 0', transition: 'color 200ms' }}>{address1}</p>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: c.metaColor, margin: '0 0 4px 0', transition: 'color 200ms' }}>{address2}</p>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: c.metaColor, margin: '0 0 20px 0', transition: 'color 200ms' }}>{country}</p>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: c.metaColor, margin: 0, transition: 'color 200ms' }}>{phone}</p>
        </div>
    );
}

function SidebarNav({ variant, c }: { variant: 'desktop' | 'tablet'; c: DarkColors }) {
    const isTablet = variant === 'tablet';
    const labelStyle: React.CSSProperties = { fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', lineHeight: '16px', letterSpacing: '0.499px', textTransform: 'uppercase', color: c.labelColor, transition: 'color 200ms' };

    return (
        <div style={{ borderRight: `1px solid ${c.sidebarBorderRight}`, paddingTop: '48px', paddingBottom: '80px', width: isTablet ? '222px' : '307px', paddingLeft: isTablet ? '60px' : '80px', flexShrink: 0, minHeight: '100vh', boxSizing: 'border-box', transition: 'border-color 200ms' }}>
            <div style={{ borderBottom: `1px solid ${c.sectionBorder}`, paddingBottom: '4px', marginBottom: '0', transition: 'border-color 200ms' }}>
                <div style={{ borderLeft: '3px solid #D32F2F', marginTop: '20px', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', cursor: 'pointer' }}>
                        <AccountIcon size={24} stroke={c.iconStroke} />
                        <span style={labelStyle}>ACCOUNT</span>
                    </div>
                </div>

                <div style={{ marginBottom: '40px', paddingLeft: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <OrdersIcon size={20} stroke={c.iconStroke} />
                        <span style={labelStyle}>ORDERS</span>
                    </div>
                </div>

                <div style={{ marginBottom: '40px', paddingLeft: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <RewardsIcon size={20} stroke={c.iconStroke} />
                        <span style={labelStyle}>REWARDS</span>
                    </div>
                </div>

                <div style={{ marginBottom: '40px', paddingLeft: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <AddressIcon size={24} stroke={c.iconStroke} />
                        <span style={labelStyle}>Addresses</span>
                    </div>
                </div>

                <div style={{ marginBottom: '16px', paddingLeft: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <PaymentIcon size={24} stroke={c.iconStroke} />
                        <span style={{ ...labelStyle, ...(isTablet ? { lineHeight: '16px', display: 'inline-block', maxWidth: '100px' } : {}) }}>
                            {isTablet ? (<>PAYMENT<br />OPTIONS</>) : 'PAYMENT OPTIONS'}
                        </span>
                    </div>
                </div>
            </div>

            <div style={{ paddingTop: '4px' }}>
                <Link href="/login" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '16px 12px', display: 'block', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#D32F2F', textDecoration: 'none' }}>
                    log out
                </Link>
            </div>
        </div>
    );
}

function AccountContent({ variant, c, firstName, lastName, email }: {
    variant: 'desktop' | 'tablet' | 'mobile';
    c: DarkColors;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
}) {
    const isMobile = variant === 'mobile';
    const isDesktop = variant === 'desktop';

    const titleSize = isMobile ? '28px' : '40px';
    const titleLineHeight = isMobile ? '36px' : '54px';
    const sectionHeadingSize = isMobile ? '14px' : '16px';
    const sectionHeadingLineHeight = isMobile ? '20px' : '24px';
    const cardMaxWidth = isDesktop ? '456px' : '100%';

    return (
        <div style={{ flex: 1, padding: isMobile ? '0 16px 40px' : '48px 32px 80px', overflowY: 'auto' }}>
            <h1 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: titleSize, lineHeight: titleLineHeight, color: c.headingColor, margin: isMobile ? '16px 0 16px' : '4px 0 24px', transition: 'color 200ms' }}>
                ACCOUNT
            </h1>

            <h2 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: sectionHeadingSize, lineHeight: sectionHeadingLineHeight, color: c.headingColor, margin: '0 0 16px', transition: 'color 200ms' }}>
                Account Information
            </h2>

            <div style={{ border: `1px solid ${c.cardBorder}`, borderRadius: '8px', padding: '24px', position: 'relative', marginBottom: '32px', maxWidth: cardMaxWidth, transition: 'border-color 200ms' }}>
                <button style={{ position: 'absolute', top: '24px', right: '24px', width: '40px', height: '40px', borderRadius: '50%', border: `1px solid ${c.editBtnBorder}`, background: c.editBtnBg, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 200ms, border-color 200ms' }}>
                    <PencilIcon stroke={c.editIconStroke} />
                </button>

                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: '20px', color: c.nameColor, margin: '0 0 8px', transition: 'color 200ms' }}>
                    {firstName || lastName ? `${firstName ?? ''} ${lastName ?? ''}`.trim() : '—'}
                </p>
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', lineHeight: '20px', color: c.metaColor, margin: '0 0 24px', transition: 'color 200ms' }}>
                    {email ?? '—'}
                </p>

                <a href="#" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: c.linkColor, textDecoration: 'underline' }}>
                    Change Password
                </a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: sectionHeadingSize, lineHeight: sectionHeadingLineHeight, color: c.headingColor, margin: 0, transition: 'color 200ms' }}>Addresses</h2>
                <a href="#" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: c.linkColor, textDecoration: 'underline', textTransform: 'capitalize' }}>View All</a>
            </div>

            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '16px', marginBottom: '32px' }}>
                <div style={{ border: `1px solid ${c.cardBorder}`, borderRadius: '8px', padding: '16px', flex: 1, transition: 'border-color 200ms' }}>
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: '20px', color: c.cardTitleColor, margin: '0 0 12px', transition: 'color 200ms' }}>Default Shipping Address</p>
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', color: c.metaColor, margin: 0, transition: 'color 200ms' }}>No address saved.</p>
                </div>
                <div style={{ border: `1px solid ${c.cardBorder}`, borderRadius: '8px', padding: '16px', flex: 1, transition: 'border-color 200ms' }}>
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '16px', lineHeight: '20px', color: c.cardTitleColor, margin: '0 0 12px', transition: 'color 200ms' }}>Default Billing Address</p>
                    <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', color: c.metaColor, margin: 0, transition: 'color 200ms' }}>No address saved.</p>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: sectionHeadingSize, lineHeight: sectionHeadingLineHeight, color: c.headingColor, margin: 0, transition: 'color 200ms' }}>Recent Orders</h2>
                <a href="#" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: c.linkColor, textDecoration: 'underline', textTransform: 'capitalize' }}>View All</a>
            </div>

            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '12px', lineHeight: '16px', color: c.noOrdersColor, margin: 0, transition: 'color 200ms' }}>
                No Orders found
            </p>
        </div>
    );
}

function MobileSidebarMenu({ onClose, c }: { onClose: () => void; c: DarkColors }) {
    const labelStyle: React.CSSProperties = { fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', lineHeight: '16px', letterSpacing: '0.499px', textTransform: 'uppercase', color: c.labelColor, transition: 'color 200ms' };
    const itemStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 0', cursor: 'pointer' };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.mobileBg, zIndex: 50, overflowY: 'auto', transition: 'background-color 200ms' }}>
            <div style={{ padding: '16px 20px' }}>
                <div style={{ borderBottom: `1px solid ${c.mobileNavBorder}`, marginBottom: '8px', transition: 'border-color 200ms' }}>
                    <div style={itemStyle}><AccountIcon size={24} stroke={c.iconStroke} /><span style={labelStyle}>ACCOUNT</span></div>
                    <div style={itemStyle}><OrdersIcon size={20} stroke={c.iconStroke} /><span style={labelStyle}>ORDERS</span></div>
                    <div style={itemStyle}><RewardsIcon size={20} stroke={c.iconStroke} /><span style={labelStyle}>REWARDS</span></div>
                    <div style={itemStyle}><AddressIcon size={24} stroke={c.iconStroke} /><span style={labelStyle}>ADDRESSES</span></div>
                    <div style={itemStyle}><PaymentIcon size={24} stroke={c.iconStroke} /><span style={labelStyle}>PAYMENT OPTIONS</span></div>
                </div>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '16px 0', display: 'block' }} onClick={onClose}>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#D32F2F' }}>log out</span>
                </button>
            </div>
        </div>
    );
}

export default function AccountPageClient() {
    const { dark } = useTheme();
    const { role, emailVerified, email, firstName, lastName } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [resendSent, setResendSent] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (role === 'not_approved') {
            router.replace('/login');
        }
    }, [role, router]);

    const handleResendVerification = async () => {
        try {
            await fetch('/api/auth/resend-verification', { method: 'POST', credentials: 'include' });
        } catch { /* ignore */ }
        setResendSent(true);
    };

    // Only show banner when logged in AND not verified.
    const showVerificationBanner =
        role !== 'loading' && role !== 'not_approved' && !emailVerified;

    const c: DarkColors = {
        iconStroke: dark ? 'rgba(255,255,255,0.75)' : '#1B1C1F',
        labelColor: dark ? 'rgba(255,255,255,0.85)' : '#1b1c1f',
        headingColor: dark ? '#ffffff' : '#000000',
        sectionBorder: dark ? 'rgba(255,255,255,0.10)' : '#d7d8db',
        sidebarBorderRight: dark ? 'rgba(255,255,255,0.10)' : '#e5e7eb',
        cardBorder: dark ? 'rgba(255,255,255,0.12)' : '#d7d8db',
        editBtnBg: dark ? 'rgba(255,255,255,0.06)' : '#ffffff',
        editBtnBorder: dark ? 'rgba(255,255,255,0.15)' : '#d7d8db',
        editIconStroke: dark ? 'rgba(255,255,255,0.70)' : '#101114',
        nameColor: dark ? 'rgba(255,255,255,0.95)' : '#101114',
        metaColor: dark ? 'rgba(255,255,255,0.55)' : '#4c4e52',
        noOrdersColor: dark ? 'rgba(255,255,255,0.40)' : '#6c6d73',
        linkColor: '#D32F2F',
        mobileBg: dark ? '#1e1e1e' : '#f6f5f8',
        mobileNavBorder: dark ? 'rgba(255,255,255,0.10)' : '#d7d8db',
        mobileNavBarBorder: dark ? 'rgba(255,255,255,0.10)' : '#d7d8db',
        cardTitleColor: dark ? '#ffffff' : '#000000',
    };

    const pageBg = dark ? '#121212' : '#ffffff';

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', width: '100%', transition: 'background-color 200ms' }}>

            {/* ── Email verification soft banner ── */}
            {showVerificationBanner && (
                <div style={{
                    backgroundColor: dark ? 'rgba(205,20,44,0.12)' : '#fff3f3',
                    borderBottom: `1px solid ${dark ? 'rgba(205,20,44,0.35)' : '#ffc1c1'}`,
                    padding: '12px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                }}>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: '14px', fontWeight: 500, color: dark ? '#ff9999' : '#c0392b' }}>
                        Please verify your email address.
                    </span>
                    {resendSent ? (
                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: '13px', fontWeight: 600, color: dark ? '#66bb6a' : '#2e7d32' }}>
                            Verification email sent!
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={handleResendVerification}
                            style={{
                                fontFamily: "var(--font-montserrat), sans-serif", fontSize: '13px', fontWeight: 700,
                                color: '#CD142C', background: 'none', border: 'none',
                                cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '3px',
                            }}
                        >
                            Resend verification email
                        </button>
                    )}
                </div>
            )}

            {/* Desktop ≥1280px */}
            <div className="hidden min-[1280px]:flex min-h-screen">
                <AccountSidebar
                    active="account" variant="desktop"
                    iconStroke={c.iconStroke} labelColor={c.labelColor}
                    sidebarBorderRight={c.sidebarBorderRight} sectionBorder={c.sectionBorder}
                />
                <AccountContent variant="desktop" c={c} firstName={firstName} lastName={lastName} email={email} />
            </div>

            {/* Tablet 768–1279px */}
            <div className="hidden min-[768px]:flex min-[1280px]:hidden min-h-screen">
                <AccountSidebar
                    active="account" variant="tablet"
                    iconStroke={c.iconStroke} labelColor={c.labelColor}
                    sidebarBorderRight={c.sidebarBorderRight} sectionBorder={c.sectionBorder}
                />
                <AccountContent variant="tablet" c={c} firstName={firstName} lastName={lastName} email={email} />
            </div>

            {/* Mobile ≤767px */}
            <div className="flex flex-col min-h-screen min-[768px]:hidden">
                <div
                    style={{ borderTop: `1px solid ${c.mobileNavBarBorder}`, borderBottom: `1px solid ${c.mobileNavBarBorder}`, height: '58px', display: 'flex', alignItems: 'center', padding: '0 16px', cursor: 'pointer', transition: 'border-color 200ms' }}
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <AccountIcon size={24} stroke={c.iconStroke} />
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', lineHeight: '16px', letterSpacing: '0.499px', textTransform: 'uppercase', color: c.headingColor, marginLeft: '8px', flex: 1, transition: 'color 200ms' }}>
                        ACCOUNT
                    </span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d={SVG_PATHS.chevronDown} stroke={c.iconStroke} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                <AccountContent variant="mobile" c={c} firstName={firstName} lastName={lastName} email={email} />

                {mobileMenuOpen && <MobileSidebarMenu onClose={() => setMobileMenuOpen(false)} c={c} />}
            </div>
        </div>
    );
}
