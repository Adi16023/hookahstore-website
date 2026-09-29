'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../../components/providers/ThemeProvider';

/* ── SVG icons (same as AccountPageClient) ── */
const SVG_PATHS = {
    account: 'M5.125 19.5C5.60539 18.962 7.85526 16.4861 8.51459 16.4861H15.4858C16.4413 16.4861 18.3916 18.5384 18.875 19.2619M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM15.5821 8.59162C15.5821 6.6838 13.9716 5.125 12.0003 5.125C10.0291 5.125 8.41848 6.6838 8.41848 8.59162C8.41848 10.4994 10.0291 12.0582 12.0003 12.0582C13.9715 12.0582 15.5821 10.4994 15.5821 8.59162Z',
    ordersCart: 'M3.75487 3.78882H17.5292C18.4475 3.78882 19.2857 4.20421 18.9066 7.25584C18.4475 9.33605 17.8791 12.8031 15.4631 12.8031H4.44359L3.06615 2.40201C2.83658 1.70861 2.40659 0.877828 1 1.0152',
    ordersLine: 'M4.5166 12.8594C4.5166 13.5248 5.78253 16.1866 8.03307 16.1866H15.7693',
    ordersWleft: 'M6 20.2C6.66274 20.2 7.2 19.6627 7.2 19C7.2 18.3373 6.66274 17.8 6 17.8C5.33726 17.8 4.8 18.3373 4.8 19C4.8 19.6627 5.33726 20.2 6 20.2Z',
    ordersWright: 'M15 20.2C15.6627 20.2 16.2 19.6627 16.2 19C16.2 18.3373 15.6627 17.8 15 17.8C14.3373 17.8 13.8 18.3373 13.8 19C13.8 19.6627 14.3373 20.2 15 20.2Z',
    rewardsCircle: 'M10 19.3C15.1362 19.3 19.3 15.1362 19.3 10C19.3 4.86375 15.1362 0.7 10 0.7C4.86375 0.7 0.7 4.86375 0.7 10C0.7 15.1362 4.86375 19.3 10 19.3Z',
    rewardsStar: 'M9.63067 4.88797C9.76731 4.55945 10.2327 4.55945 10.3693 4.88797L11.4932 7.59007C11.5508 7.72856 11.681 7.82319 11.8306 7.83518L14.7477 8.06904C15.1024 8.09748 15.2462 8.54008 14.976 8.77155L12.7534 10.6754C12.6395 10.773 12.5897 10.9261 12.6245 11.072L13.3036 13.9186C13.3861 14.2647 13.0096 14.5383 12.706 14.3528L10.2085 12.8274C10.0805 12.7492 9.9195 12.7492 9.7915 12.8274L7.29402 14.3528C6.99038 14.5383 6.61388 14.2647 6.69643 13.9186L7.37546 11.072C7.41026 10.9261 7.36051 10.773 7.2466 10.6754L5.02404 8.77155C4.75383 8.54008 4.89764 8.09748 5.2523 8.06904L8.16944 7.83518C8.31896 7.82319 8.4492 7.72856 8.50681 7.59007L9.63067 4.88797Z',
    addressPin: 'M12.0001 22.0027C12.0001 22.0027 20.0024 15.0489 20.0042 9.83148C20.0057 5.50925 16.4251 2.00419 12.0068 2.0027C7.58856 2.00121 4.00565 5.50386 4.0042 9.82609C4.00244 15.0435 12.0001 22.0027 12.0001 22.0027Z',
    addressDot: 'M14.5602 9.50372C14.5597 10.8844 13.4152 12.0033 12.0038 12.0029C10.5924 12.0024 9.44861 10.8827 9.44908 9.502C9.44954 8.12128 10.5941 7.00238 12.0055 7.00286C13.4169 7.00333 14.5607 8.12301 14.5602 9.50372Z',
    payment: 'M2.62452 9.36034H21.3746M6.37455 13.6212H9.49956M4.50002 5.09961H19.4997C20.8804 5.09961 21.9997 6.18885 21.9997 7.53351L22 16.6659C22 18.0106 20.8807 19.0996 19.5 19.0996L4.50026 19.0995C3.11958 19.0995 2.00031 18.0094 2.00027 16.6647L2 7.53446C1.99996 6.18974 3.11927 5.09961 4.50002 5.09961Z',
};

const NAV_ITEMS = [
    {
        href: '/account',
        key: 'account',
        label: 'ACCOUNT',
        icon: (stroke: string) => (
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path d={SVG_PATHS.account} stroke={stroke} strokeWidth="1.4" />
            </svg>
        ),
    },
    {
        href: '/account/orders',
        key: 'orders',
        label: 'ORDERS',
        icon: (stroke: string) => (
            <svg width={20} height={21} viewBox="0 0 20 21" fill="none">
                <clipPath id="oc"><rect fill="white" height="21" width="20" /></clipPath>
                <g clipPath="url(#oc)">
                    <path d={SVG_PATHS.ordersCart} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
                    <path d={SVG_PATHS.ordersLine} stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
                    <path d={SVG_PATHS.ordersWleft} fill={stroke} />
                    <path d={SVG_PATHS.ordersWright} fill={stroke} />
                </g>
            </svg>
        ),
    },
    {
        href: '/account/addresses',
        key: 'addresses',
        label: 'ADDRESSES',
        icon: (stroke: string) => (
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
                <path d={SVG_PATHS.addressPin} stroke={stroke} strokeWidth="1.4" />
                <path d={SVG_PATHS.addressDot} stroke={stroke} strokeWidth="1.4" />
            </svg>
        ),
    },
] as const;

type NavKey = typeof NAV_ITEMS[number]['key'];

interface Props {
    /** which tab is active */
    active: NavKey;
    /** 'desktop' | 'tablet' */
    variant?: 'desktop' | 'tablet';
    iconStroke: string;
    labelColor: string;
    sidebarBorderRight: string;
    sectionBorder: string;
}

export default function AccountSidebar({
    active, variant = 'desktop',
    iconStroke, labelColor, sidebarBorderRight, sectionBorder,
}: Props) {
    const isTablet = variant === 'tablet';

    const labelStyle: React.CSSProperties = {
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 600, fontSize: '14px', lineHeight: '16px',
        letterSpacing: '0.499px', textTransform: 'uppercase',
        color: labelColor, transition: 'color 200ms',
    };

    return (
        <div style={{ borderRight: `1px solid ${sidebarBorderRight}`, paddingTop: '48px', paddingBottom: '80px', width: isTablet ? '222px' : '307px', paddingLeft: isTablet ? '60px' : '80px', flexShrink: 0, minHeight: '100vh', boxSizing: 'border-box', transition: 'border-color 200ms' }}>
            <div style={{ borderBottom: `1px solid ${sectionBorder}`, paddingBottom: '4px', transition: 'border-color 200ms' }}>
                {NAV_ITEMS.map((item, i) => {
                    const isActive = item.key === active;
                    const isLast = i === NAV_ITEMS.length - 1;
                    return (
                        <div
                            key={item.key}
                            style={{
                                borderLeft: isActive ? '3px solid #D32F2F' : '3px solid transparent',
                                marginTop: i === 0 ? '20px' : '0',
                                marginBottom: isLast ? '16px' : '40px',
                                transition: 'border-color 200ms',
                            }}
                        >
                            <Link
                                href={item.href}
                                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', textDecoration: 'none' }}
                            >
                                {item.icon(iconStroke)}
                                <span style={labelStyle}>
                                    {item.label}
                                </span>
                            </Link>
                        </div>
                    );
                })}
            </div>

            {/* Log out */}
            <div style={{ paddingTop: '4px' }}>
                <Link href="/login" style={{ display: 'block', padding: '16px 12px', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '14px', lineHeight: '20px', color: '#D32F2F', textDecoration: 'none' }}>
                    log out
                </Link>
            </div>
        </div>
    );
}
