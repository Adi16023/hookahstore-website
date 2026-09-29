"use client";
export const runtime = 'edge';
import Link from "next/link";
import { useTheme } from "../../../components/providers/ThemeProvider";
import { SITE } from "../../../lib/config/site";

export default function CookiesPolicyPage() {
    const { dark } = useTheme();

    const borderColor = dark ? "#5D5D5D" : "#d7d8db";
    const textPrimary = dark ? "#ffffff" : "#101114";
    const textSecondary = dark ? "rgba(255,255,255,0.75)" : "#101114";
    const textMuted = dark ? "rgba(255,255,255,0.5)" : "#6b7280";
    const bg = dark ? "transparent" : "#ffffff";

    const h2Style: React.CSSProperties = {
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 700,
        fontSize: "28px",
        lineHeight: "36px",
        color: textPrimary,
        margin: "0 0 16px 0",
        transition: "color 200ms",
    };

    const h3Style: React.CSSProperties = {
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 600,
        fontSize: "20px",
        lineHeight: "28px",
        color: textPrimary,
        margin: "0 0 12px 0",
        transition: "color 200ms",
    };

    const pStyle: React.CSSProperties = {
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 400,
        fontSize: "16px",
        lineHeight: "26px",
        color: textSecondary,
        margin: "0 0 32px 0",
        transition: "color 200ms",
    };

    const liStyle: React.CSSProperties = {
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 400,
        fontSize: "16px",
        lineHeight: "26px",
        color: textSecondary,
        transition: "color 200ms",
    };

    return (
        <div style={{ backgroundColor: bg, width: "100%", minHeight: "100vh", transition: "background-color 200ms" }}>

            {/* ── Breadcrumb ── */}
            <div
                style={{
                    borderBottom: `1px solid ${borderColor}`,
                    minHeight: "49px",
                    display: "flex",
                    alignItems: "center",
                    transition: "border-color 200ms",
                }}
            >
                <div
                    className="flex items-center pl-[16px] md:pl-[64px] xl:pl-[312px]"
                    style={{ paddingTop: "10px", paddingBottom: "10px" }}
                >
                    <Link
                        href="/"
                        style={{
                            fontFamily: "var(--font-montserrat), sans-serif",
                            fontWeight: 400,
                            fontSize: "14px",
                            lineHeight: "20px",
                            color: dark ? "rgba(255,255,255,0.7)" : "#1b1c1f",
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Home
                    </Link>
                    <div style={{ width: "16px", height: "16px", margin: "0 4px", flexShrink: 0 }}>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
                        </svg>
                    </div>
                    <span
                        aria-current="page"
                        style={{
                            fontFamily: "var(--font-montserrat), sans-serif",
                            fontWeight: 400,
                            fontSize: "14px",
                            lineHeight: "20px",
                            color: dark ? "#ffffff" : "#1b1c1f",
                            textTransform: "capitalize",
                            whiteSpace: "nowrap",
                        }}
                    >
                        Cookies Policy
                    </span>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="px-[16px] md:px-[64px] xl:px-[312px] pt-[40px] md:pt-[60px] pb-[80px]">

                {/* Page Title */}
                <h1
                    style={{
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontWeight: 600,
                        color: textPrimary,
                        margin: "0 0 20px 0",
                        transition: "color 200ms",
                    }}
                    className="text-[28px] leading-[36px] md:text-[40px] md:leading-[54px]"
                >
                    Cookies Policy
                </h1>

                {/* Company info / Updated date */}
                <p style={{ ...pStyle, fontSize: "14px", color: textMuted, marginBottom: "8px" }}>
                    <strong style={{ color: textPrimary }}>Al Dhuvor LLP</strong> &nbsp;·&nbsp; {SITE.address}
                </p>
                <p style={{ ...pStyle, fontSize: "14px", color: textMuted, marginBottom: "8px" }}>
                    LLPIN: AAR-9587 &nbsp;·&nbsp; GSTIN: {SITE.gstin} &nbsp;·&nbsp; {SITE.email} &nbsp;·&nbsp; {SITE.phone.display}
                </p>
                <p style={{ ...pStyle, fontSize: "14px", color: textMuted, marginBottom: "40px" }}>
                    <strong style={{ color: textPrimary }}>Last updated:</strong> July 10, 2026
                </p>

                {/* ── Section 1 ── */}
                <h2 style={h2Style}>What Are Cookies?</h2>
                <p style={pStyle}>
                    Cookies are small text files placed on your device when you visit a website. They allow the website to recognise your device, remember your preferences, and function correctly across pages and sessions. We also use similar technologies such as web beacons and local storage for some of the same purposes.
                </p>

                {/* ── Section 2 ── */}
                <h2 style={h2Style}>How We Use Cookies</h2>
                <p style={pStyle}>
                    We use cookies for three purposes only: to keep the Website working, to understand how it is used, and to remember your preferences. We do not use cookies to serve tobacco advertising, build marketing profiles, or track you across other websites.
                </p>

                {/* ── Section 3 ── */}
                <h2 style={{ ...h2Style, marginBottom: "24px" }}>Types of Cookies We Use</h2>

                <h3 style={h3Style}>3.1 &nbsp;Strictly Necessary Cookies</h3>
                <p style={{ ...pStyle, marginBottom: "32px" }}>
                    These cookies are essential for the Website to function. Without them, you cannot browse, add items to your cart, log in, or complete a purchase. They cannot be switched off.
                </p>

                <h3 style={h3Style}>3.2 &nbsp;Analytics Cookies</h3>
                <p style={{ ...pStyle, marginBottom: "12px" }}>
                    These cookies help us understand which pages are visited, how long users stay, and where they arrive from. All data is aggregated and anonymised; we cannot identify individual users from analytics data.
                </p>
                <p style={{ ...pStyle, marginBottom: "32px" }}>
                    You can opt out of Google Analytics at: tools.google.com/dlpage/gaoptout
                </p>

                <h3 style={h3Style}>3.3 &nbsp;Preference Cookies</h3>
                <p style={{ ...pStyle, marginBottom: "32px" }}>
                    These cookies remember choices you make on the Website.
                </p>

                <h3 style={h3Style}>3.4 &nbsp;What We Do NOT Use Cookies For</h3>
                <ul style={{ marginBottom: "32px", paddingLeft: "20px", listStyleType: "disc" }}>
                    <li style={{ ...liStyle, marginBottom: "6px" }}>Tobacco advertising or promotion</li>
                    <li style={{ ...liStyle, marginBottom: "6px" }}>Remarketing or retargeting on other websites</li>
                    <li style={{ ...liStyle, marginBottom: "6px" }}>Building individual marketing profiles</li>
                    <li style={{ ...liStyle, marginBottom: "6px" }}>Tracking your activity outside of thehookahstore.in</li>
                    <li style={{ ...liStyle, marginBottom: "6px" }}>Sharing your data with advertising networks</li>
                </ul>

                {/* ── Section 4 ── */}
                <h2 style={h2Style}>Third-Party Cookies</h2>
                <p style={pStyle}>
                    Some third-party services we use may set their own cookies. We do not control these and they are subject to the relevant third party&#8217;s own policies.
                </p>

                {/* ── Section 5 ── */}
                <h2 style={{ ...h2Style, marginBottom: "24px" }}>How to Manage Cookies</h2>
                <p style={{ ...pStyle, marginBottom: "12px" }}>
                    You can control and delete cookies through your browser settings at any time.
                </p>
                <ul style={{ marginBottom: "24px", paddingLeft: "20px", listStyleType: "disc" }}>
                    <li style={{ ...liStyle, marginBottom: "6px" }}>Chrome: Settings → Privacy and Security → Cookies and other site data</li>
                    <li style={{ ...liStyle, marginBottom: "6px" }}>Firefox: Settings → Privacy &amp; Security → Cookies and Site Data</li>
                    <li style={{ ...liStyle, marginBottom: "6px" }}>Safari: Preferences → Privacy → Manage Website Data</li>
                    <li style={{ ...liStyle, marginBottom: "6px" }}>Edge: Settings → Cookies and Site Permissions</li>
                </ul>
                <p style={pStyle}>
                    Disabling strictly necessary cookies will prevent the Website from functioning correctly. You will not be able to log in, use your cart, or complete a purchase. Disabling analytics and preference cookies will not affect your ability to shop.
                </p>

                {/* ── Section 6 ── */}
                <h2 style={h2Style}>Your Consent</h2>
                <p style={pStyle}>
                    When you first visit the Website, we will ask for your consent to set non-essential cookies. You can accept all, accept only necessary cookies, or manage your preferences individually. You can change your cookie preferences at any time by clicking &#8220;Cookie Settings&#8221; in the website footer. Strictly necessary cookies do not require consent as they are essential for the Website to function.
                </p>

                {/* ── Section 7 ── */}
                <h2 style={h2Style}>Updates to This Policy</h2>
                <p style={pStyle}>
                    We may update this Cookies Policy from time to time. The &#8220;Last updated&#8221; date at the top of this page will always reflect the most recent version. Continued use of the Website after an update constitutes acceptance.
                </p>

                {/* ── Section 8 ── */}
                <h2 style={h2Style}>Contact</h2>
                <p style={{ ...pStyle, marginBottom: "12px" }}>
                    For any questions about how we use cookies or to exercise your data rights, contact us at: {SITE.email} &nbsp;·&nbsp; {SITE.phone.display}
                </p>
                <p style={{ ...pStyle, marginBottom: 0 }}>
                    Grievance Officer: Santhosh, Director, Al Dhuvor LLP, {SITE.address}
                </p>

            </div>
        </div>
    );
}
