'use client';

import { useTheme } from '../../../../components/providers/ThemeProvider';
import AccountSidebar from '../../../../components/account/AccountSidebar';

export default function OrdersPageClient() {
    const { dark } = useTheme();

    const pageBg = dark ? '#121212' : '#ffffff';
    const sidebarBorderRight = dark ? 'rgba(255,255,255,0.10)' : '#d7d8db';
    const sectionBorder = dark ? 'rgba(255,255,255,0.10)' : '#d7d8db';
    const iconStroke = dark ? 'rgba(255,255,255,0.75)' : '#101114';
    const labelColor = dark ? 'rgba(255,255,255,0.85)' : '#101114';
    const headingColor = dark ? '#ffffff' : '#000000';
    const subtitleColor = dark ? 'rgba(255,255,255,0.70)' : '#4c4e52';
    const noOrdersColor = dark ? 'rgba(255,255,255,0.40)' : '#6c6d73';

    const sidebarProps = { iconStroke, labelColor, sidebarBorderRight, sectionBorder };

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', transition: 'background-color 200ms' }}>

            {/* ── Desktop ≥1280px ── */}
            <div className="hidden min-[1280px]:flex">
                <AccountSidebar active="orders" variant="desktop" {...sidebarProps} />
                <OrdersContent headingColor={headingColor} subtitleColor={subtitleColor} noOrdersColor={noOrdersColor} isMobile={false} />
            </div>

            {/* ── Tablet 768–1279px ── */}
            <div className="hidden min-[768px]:flex min-[1280px]:hidden">
                <AccountSidebar active="orders" variant="tablet" {...sidebarProps} />
                <OrdersContent headingColor={headingColor} subtitleColor={subtitleColor} noOrdersColor={noOrdersColor} isMobile={false} />
            </div>

            {/* ── Mobile ≤767px ── */}
            <div className="flex flex-col min-[768px]:hidden">
                <OrdersContent headingColor={headingColor} subtitleColor={subtitleColor} noOrdersColor={noOrdersColor} isMobile />
            </div>
        </div>
    );
}

function OrdersContent({
    headingColor, subtitleColor, noOrdersColor, isMobile,
}: {
    headingColor: string; subtitleColor: string; noOrdersColor: string; isMobile: boolean;
}) {
    return (
        <div style={{ flex: 1, padding: isMobile ? '24px 16px 40px' : '48px 32px 80px' }}>
            <h1 style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontWeight: 700,
                fontSize: isMobile ? '28px' : '40px',
                lineHeight: isMobile ? '36px' : '52px',
                color: headingColor,
                margin: '0 0 24px',
                transition: 'color 200ms',
            }}>
                ORDERS
            </h1>

            <p style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '22px',
                color: subtitleColor,
                margin: '0 0 6px',
                transition: 'color 200ms',
            }}>
                Orders are displayed for the past three-month period only
            </p>

            <p style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontWeight: 400,
                fontSize: '12px',
                lineHeight: '16px',
                color: noOrdersColor,
                margin: 0,
                transition: 'color 200ms',
            }}>
                No Orders found
            </p>
        </div>
    );
}
