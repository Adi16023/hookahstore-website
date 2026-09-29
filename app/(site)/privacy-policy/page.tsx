"use client";
export const runtime = 'edge';
import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../../components/providers/ThemeProvider";
import { SITE } from "../../../lib/config/site";

function Chevron({ open, dark }: { open: boolean; dark: boolean }) {
    return (
        <svg
            width="22"
            height="24"
            viewBox="0 0 22.16 24.004"
            fill="none"
            style={{
                flexShrink: 0,
                transform: open ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 200ms ease",
            }}
        >
            <path
                d="M3.69332 8.30861L11.0812 15.6953L18.4667 8.30861"
                stroke={dark ? "#ffffff" : "#857149"}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.923333"
            />
        </svg>
    );
}

const p = { margin: "0 0 12px 0" };
const pLast = { margin: 0 };
const ul = { margin: "0 0 12px 0", paddingLeft: "20px", listStyleType: "disc" as const };
const ulLast = { margin: 0, paddingLeft: "20px", listStyleType: "disc" as const };
const h4 = { margin: "0 0 6px 0", fontWeight: 600 };

const sections: { title: string; content: React.ReactNode }[] = [
    {
        title: "1. Who We Are",
        content: (
            <p style={pLast}>
                thehookahstore.in is operated by Al Dhuvor LLP, LLPIN: AAR-9587, GSTIN: {SITE.gstin}, registered at {SITE.address}. Contact: {SITE.email} &nbsp;·&nbsp; {SITE.phone.display}. Al Dhuvor LLP is the Data Fiduciary in respect of personal data collected through the Website, as defined under the Digital Personal Data Protection Act, 2023 (&#8220;DPDP Act&#8221;).
            </p>
        ),
    },
    {
        title: "2. What This Policy Covers",
        content: (
            <p style={pLast}>
                This Privacy Policy explains what personal data we collect, why we collect it, who we share it with, how long we keep it, your rights under Indian law, and how to contact us. By using the Website, you acknowledge that you have read and understood this Policy.
            </p>
        ),
    },
    {
        title: "3. Data We Collect",
        content: (
            <>
                <h4 style={h4}>3.1 &nbsp;Information you give us directly</h4>
                <ul style={ul}>
                    <li>Name, email address, phone number, and date of birth (for age verification)</li>
                    <li>Billing and delivery address</li>
                    <li>Government-issued photo ID submitted for age verification</li>
                    <li>Account login credentials and order history</li>
                    <li>Any information you provide when contacting customer support</li>
                </ul>
                <h4 style={h4}>3.2 &nbsp;Information collected automatically</h4>
                <ul style={ul}>
                    <li>IP address, browser type, and device information</li>
                    <li>Pages viewed, time spent, and referral source</li>
                    <li>Cookies and similar tracking technologies (see our Cookies Policy)</li>
                </ul>
                <h4 style={h4}>3.3 &nbsp;Information from third parties</h4>
                <p style={pLast}>
                    We may receive limited information from payment gateways (transaction reference numbers, payment status) and delivery partners (delivery status, confirmation). We do not receive your full card number or UPI PIN from any payment gateway.
                </p>
            </>
        ),
    },
    {
        title: "4. Why We Collect Your Data and How We Use It",
        content: (
            <>
                <ul style={ul}>
                    <li>To process, dispatch, and deliver your orders</li>
                    <li>To verify your age and identity, as required for the sale of tobacco products</li>
                    <li>To issue GST-compliant tax invoices and comply with accounting and legal obligations</li>
                    <li>To communicate order confirmations, dispatch updates, and delivery status</li>
                    <li>To respond to customer support requests and grievances</li>
                    <li>To detect and prevent fraud and to secure our systems</li>
                    <li>To maintain and improve the Website</li>
                </ul>
                <p style={pLast}>We do not use your personal data for tobacco marketing or promotional communications.</p>
            </>
        ),
    },
    {
        title: "5. Who We Share Your Data With",
        content: (
            <ul style={ulLast}>
                <li>Delivery partners: name, address, contact number, and age-verification status are shared solely for completing delivery and doorstep age verification.</li>
                <li>Payment gateways: your payment details are processed directly by our licensed third-party gateway. We receive only a transaction reference and payment status.</li>
                <li>Legal and regulatory authorities: we may disclose data to government bodies, law enforcement, or courts where required by law, court order, or legal obligation.</li>
                <li>Professional advisors: lawyers, accountants, or auditors on a strictly need-to-know basis and under confidentiality obligations.</li>
            </ul>
        ),
    },
    {
        title: "6. How Long We Keep Your Data",
        content: (
            <>
                <p style={p}>
                    We retain your account and order data for as long as your account remains active, and thereafter for the period required to meet our tax, accounting, and audit obligations under Indian law (currently up to 8 years for GST records).
                </p>
                <p style={pLast}>
                    Age-verification documents are retained only for the period required by applicable law and are then securely deleted. If you request erasure of your data, we will action it subject to these legal retention obligations.
                </p>
            </>
        ),
    },
    {
        title: "7. Your Rights Under the DPDP Act 2023",
        content: (
            <ul style={ulLast}>
                <li>Right to access: request a summary of the personal data we hold about you and the purposes for which it is processed.</li>
                <li>Right to correction and erasure: request correction of inaccurate data, or erasure of data no longer necessary, subject to our legal retention obligations.</li>
                <li>Right to withdraw consent: where processing is based on consent, you may withdraw it at any time. Note that withdrawal of consent for age verification may mean we can no longer provide services to you.</li>
                <li>Right to grievance redressal: you have the right to have grievances addressed by our Grievance Officer (see Section 11).</li>
                <li>Right to nominate: you may nominate another individual to exercise your rights on your behalf in the event of your death or incapacity.</li>
                <li>To exercise any right, email {SITE.email} with the subject line &#8220;Privacy Request: [your right]&#8221; and your registered name and email. We will respond within 30 days.</li>
            </ul>
        ),
    },
    {
        title: "8. Cookies",
        content: (
            <p style={pLast}>
                Our Website uses cookies and similar tracking technologies to function correctly and to help us understand how it is used. See our separate Cookies Policy for full details. We do not use cookies for tobacco advertising or to build marketing profiles. You can control cookies through your browser settings at any time.
            </p>
        ),
    },
    {
        title: "9. Data Security",
        content: (
            <>
                <p style={p}>
                    We implement reasonable technical and organisational measures to protect your personal data, including SSL/TLS encryption, payment processing by PCI-DSS compliant third-party gateways, and access restrictions on a need-to-know basis. No internet transmission is completely secure; if you become aware of any security concern, contact us immediately.
                </p>
                <p style={pLast}>
                    In the event of a data breach that is likely to affect your rights, we will notify you and the relevant authority in accordance with the DPDP Act 2023.
                </p>
            </>
        ),
    },
    {
        title: "10. Minors",
        content: (
            <p style={pLast}>
                Our Website is strictly restricted to persons aged 21 and above (our voluntary policy) and in no case to persons below 18 (the legal minimum under COTPA). We do not knowingly collect personal data from anyone below 21 years of age. If we discover that personal data has been provided by a person below 21, we will delete that data immediately and cancel any associated account or order.
            </p>
        ),
    },
    {
        title: "11. Grievance Officer",
        content: (
            <p style={pLast}>
                For privacy-related concerns, complaints, or requests under the DPDP Act 2023 or the Information Technology Act, 2000, contact our Grievance Officer: Santhosh, Director, Al Dhuvor LLP, {SITE.address}. Email: {SITE.email} &nbsp;·&nbsp; Phone: {SITE.phone.display}.
            </p>
        ),
    },
    {
        title: "12. Changes to This Policy",
        content: (
            <p style={pLast}>
                We may update this Privacy Policy from time to time. The &#8220;Last updated&#8221; date at the top of this page will always reflect the most recent version. Continued use of the Website after an update constitutes acceptance of the revised Policy.
            </p>
        ),
    },
    {
        title: "13. Governing Law",
        content: (
            <p style={pLast}>
                This Privacy Policy is governed by the laws of India. Any dispute arising from this Policy is subject to the exclusive jurisdiction of the courts at Chennai, Tamil Nadu.
            </p>
        ),
    },
];

export default function PrivacyPolicyPage() {
    const { dark } = useTheme();
    const [openSet, setOpenSet] = useState<Set<number>>(new Set([0]));

    function toggle(i: number) {
        setOpenSet((prev) => {
            const next = new Set(prev);
            next.has(i) ? next.delete(i) : next.add(i);
            return next;
        });
    }

    const borderColor = dark ? "#5D5D5D" : "#d7d8db";
    const textPrimary = dark ? "#ffffff" : "#101114";
    const textSecondary = dark ? "rgba(255,255,255,0.7)" : "#000000";
    const bg = dark ? "transparent" : "#ffffff";

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
                        Privacy Policy
                    </span>
                </div>
            </div>

            {/* ── Main content ── */}
            <div className="px-[16px] md:px-[64px] xl:px-[312px] pt-[40px] md:pt-[60px]">

                {/* Title */}
                <h1
                    style={{
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontWeight: 600,
                        fontStyle: "normal",
                        color: textPrimary,
                        margin: 0,
                        transition: "color 200ms",
                    }}
                    className="text-[28px] leading-[36px] mt-0 md:text-[40px] md:leading-[54px] md:mt-0"
                >
                    Privacy Policy
                </h1>

                {/* Company info */}
                <div
                    style={{
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontWeight: 400,
                        lineHeight: "20px",
                        color: textSecondary,
                        transition: "color 200ms",
                    }}
                    className="mt-[20px] md:mt-[24px] text-[14px]"
                >
                    <p style={{ margin: 0, fontWeight: 600, color: textPrimary }}>Al Dhuvor LLP</p>
                    <p style={{ margin: "4px 0 0 0" }}>{SITE.address}</p>
                    <p style={{ margin: "4px 0 0 0" }}>LLPIN: AAR-9587 &nbsp;&middot;&nbsp; GSTIN: {SITE.gstin}</p>
                    <p style={{ margin: "4px 0 0 0" }}>{SITE.email} &nbsp;&middot;&nbsp; {SITE.phone.display}</p>
                    <p style={{ margin: "12px 0 0 0", opacity: 0.6 }}>Last updated: July 10, 2026</p>
                </div>

                {/* Intro */}
                <div
                    style={{
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontWeight: 400,
                        lineHeight: "24px",
                        color: textSecondary,
                        transition: "color 200ms",
                    }}
                    className="mt-[20px] md:mt-[24px] text-[16px] md:text-[18px]"
                >
                    <p style={{ margin: 0 }}>
                        thehookahstore.in is operated by Al Dhuvor LLP, LLPIN: AAR-9587, GSTIN: {SITE.gstin}, registered at {SITE.address}. Al Dhuvor LLP is the Data Fiduciary in respect of personal data collected through the Website, as defined under the Digital Personal Data Protection Act, 2023 (&#8220;DPDP Act&#8221;). This Privacy Policy explains what personal data we collect, why we collect it, who we share it with, how long we keep it, your rights under Indian law, and how to contact us. By using the Website, you acknowledge that you have read and understood this Policy.
                    </p>
                </div>

                {/* ── Accordion ── */}
                <div
                    style={{ backgroundColor: bg, transition: "background-color 200ms" }}
                    className="mt-[17px] md:mt-[18px]"
                >
                    {sections.map((section, i) => {
                        const isOpen = openSet.has(i);
                        const isLast = i === sections.length - 1;
                        return (
                            <div
                                key={section.title}
                                style={{
                                    borderTop: `1px solid ${borderColor}`,
                                    borderBottom: isLast ? `1px solid ${borderColor}` : undefined,
                                    transition: "border-color 200ms",
                                }}
                            >
                                {/* Header button */}
                                <button
                                    type="button"
                                    onClick={() => toggle(i)}
                                    style={{
                                        width: "100%",
                                        height: "73px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        paddingLeft: "8px",
                                        paddingRight: "8px",
                                        background: "none",
                                        border: "none",
                                        cursor: "pointer",
                                        textAlign: "left",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontFamily: "var(--font-montserrat), sans-serif",
                                            fontWeight: 600,
                                            fontSize: "18px",
                                            lineHeight: "24px",
                                            color: textPrimary,
                                            transition: "color 200ms",
                                        }}
                                    >
                                        {section.title}
                                    </span>
                                    <Chevron open={isOpen} dark={dark} />
                                </button>

                                {/* Expanded body */}
                                {isOpen && (
                                    <div
                                        style={{ overflow: "hidden" }}
                                        className="py-[8.75px] pl-0 pr-0 md:pl-[12px] md:pr-[12px]"
                                    >
                                        <div
                                            style={{
                                                fontFamily: "var(--font-montserrat), sans-serif",
                                                fontWeight: 400,
                                                fontSize: "16px",
                                                lineHeight: "22px",
                                                color: dark ? "rgba(255,255,255,0.75)" : "#101114",
                                                transition: "color 200ms",
                                            }}
                                        >
                                            {section.content}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div style={{ height: "40px" }} />
            </div>
        </div>
    );
}
