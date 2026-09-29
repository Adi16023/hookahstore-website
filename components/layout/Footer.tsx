"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SiteLogo from "./SiteLogo";
import { SITE, LEGAL_LINES, mailtoHref, FREE_SHIPPING_TEXT } from "../../lib/config/site";
import { getRetailUrl, getWholesaleUrl } from "../../lib/config";
import { TOP_CATEGORIES } from "../../lib/config/categories";

// ── Static asset paths ──
const imgPhone = "/footer-assets/a28728b99c945bce22bbf4edcb916d4116ddb6da.png";
const imgMail = "/footer-assets/3ea8960df4c7e6d1022b7a11603021522cd07688.png";
const imgInstagram = "/footer-assets/5e80a04ae402f191e059bee4d5b819a7d4603238.png";
const imgYoutube = "/footer-assets/31e1e18cfe866db9d035bb85dcee7387aea1e2ee.png";
const imgVisa = "/footer-assets/c8f7dad57f431805f6b522b263e386c2bb511e12.png";
const imgMasterCard = "/footer-assets/eaa52c2a80b3c3a91a4e7a8a165f7bd214f44376.png";
const imgSslSecure = "/footer-assets/f70a57e8e19cfef876d5a3344bb9d4c29ae2a37d.png";

// ── Inline SVG icons (paths preserved exactly from Figma source) ──────────────

function IconFreeShipping() {
    return (
        <svg width="24" height="24" viewBox="0 0 19.2 15.2" fill="none">
            <path
                d="M6.8069 12.0545C6.8069 13.4604 5.69533 14.6 4.32414 14.6C2.95295 14.6 1.84138 13.4604 1.84138 12.0545M6.8069 12.0545C6.8069 10.6487 5.69533 9.5091 4.32414 9.5091C2.95295 9.5091 1.84138 10.6487 1.84138 12.0545M6.8069 12.0545H12.3931M1.84138 12.0545H0.6V1.6C0.6 1.04771 1.04772 0.6 1.6 0.6H12.3931V12.0545M12.3931 12.0545V3.78182H15.4966L18.6 6.9636V12.0545H17.9793M12.3931 12.0545H13.0138M17.9793 12.0545C17.9793 13.4604 16.8677 14.6 15.4966 14.6C14.1254 14.6 13.0138 13.4604 13.0138 12.0545M17.9793 12.0545C17.9793 10.6487 16.8677 9.5091 15.4966 9.5091C14.1254 9.5091 13.0138 10.6487 13.0138 12.0545"
                stroke="#D6D6D6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.2"
            />
        </svg>
    );
}

function IconCustomerService() {
    return (
        <svg width="24" height="24" viewBox="0 0 21.7496 18.4" fill="none">
            <path
                d="M0.6 17.8L0.60041 14.1996C0.60063 12.2115 2.21234 10.6 4.20041 10.6H11.6996M12.6 4.2C12.6 6.18823 10.9882 7.80001 9 7.80001C7.01177 7.80001 5.4 6.18823 5.4 4.2C5.4 2.21178 7.01177 0.6 9 0.6C10.9882 0.6 12.6 2.21178 12.6 4.2Z"
                stroke="#D6D6D6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.2"
            />
            <path
                d="M15.1996 12.2372V12.1996M17.1996 12.2372V12.1996M19.1996 12.2372V12.1996M17.0692 15.1126L14.9822 17.1996V15.1126H14.1996C13.6473 15.1126 13.1996 14.6649 13.1996 14.1126V10.1996C13.1996 9.64731 13.6473 9.19961 14.1996 9.19961H20.1996C20.7519 9.19961 21.1996 9.64731 21.1996 10.1996V14.1126C21.1996 14.6649 20.7519 15.1126 20.1996 15.1126H17.0692Z"
                stroke="#D6D6D6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.1"
            />
        </svg>
    );
}

function IconGift() {
    return (
        <svg width="24" height="24" viewBox="0 0 19.4 19.3996" fill="none">
            <path
                d="M0.70018 11.5805L0.7 6.8527C0.69996 5.66305 1.70731 4.69862 2.94996 4.69861L16.45 4.69851C17.6926 4.6985 18.7 5.66289 18.7 6.85253V11.5805M0.70018 11.5805H18.7M0.70018 11.5805L0.7 16.5455C0.69996 17.7352 1.70732 18.6996 2.94998 18.6996H16.45C17.6927 18.6996 18.7 17.7352 18.7 16.5456V11.5805M9.8637 18.6996V4.6985M8.729 4.24508C8.8975 4.23846 9.0533 4.15366 9.137 4.01477C9.2208 3.87589 9.2195 3.70431 9.1414 3.56137C8.8426 3.04018 7.7945 1.30721 7.11042 0.929116C6.25817 0.458056 5.16347 0.735996 4.67386 1.54786C4.18428 2.35967 4.48011 3.40627 5.33241 3.87736C6.02767 4.26164 8.1082 4.258 8.729 4.24508ZM10.295 3.56122C10.2168 3.70421 10.2156 3.87574 10.2994 4.01463C10.3831 4.15351 10.539 4.23827 10.7073 4.24494C11.3282 4.25785 13.4199 4.25531 14.104 3.87721C14.9562 3.40615 15.2522 2.35958 14.7625 1.54772C14.273 0.735906 13.1783 0.457876 12.326 0.928966C11.6307 1.31325 10.5937 3.04004 10.295 3.56122Z"
                stroke="#D6D6D6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.4"
            />
        </svg>
    );
}

function IconShieldCheck() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
                d="M15.5 8.5L10.6641 13.5L8.5 11.2625"
                stroke="#EBEBED"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.4"
            />
            <path
                d="M5 2.7002H19C19.718 2.7002 20.2998 3.28203 20.2998 4V13C20.2998 17.584 16.584 21.2998 12 21.2998C7.41604 21.2998 3.7002 17.584 3.7002 13V4C3.7002 3.28203 4.28203 2.7002 5 2.7002Z"
                stroke="#EBEBED"
                strokeWidth="1.4"
            />
        </svg>
    );
}

function IconGears() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
                d="M9.47266 3.15039C10.6053 1.21658 13.3948 1.2166 14.5273 3.15039L14.5781 3.2373C15.3499 4.55507 16.758 5.37015 18.2842 5.38086H18.3848C20.6205 5.39672 22.0191 7.81819 20.9121 9.77051L20.8623 9.8584C20.1093 11.1866 20.1093 12.8134 20.8623 14.1416V14.1426L20.9121 14.2295C21.9845 16.1209 20.7055 18.4521 18.5918 18.6104L18.3848 18.6191H18.2842C16.758 18.6299 15.3499 19.445 14.5781 20.7627L14.5273 20.8496C13.3948 22.7834 10.6053 22.7834 9.47266 20.8496L9.42188 20.7627C8.65013 19.445 7.24199 18.6299 5.71582 18.6191H5.61523C3.44943 18.6037 2.06915 16.331 2.99121 14.4141L3.08789 14.2295L3.1377 14.1426V14.1416C3.89063 12.8134 3.89063 11.1866 3.1377 9.8584L3.08789 9.77051C1.98097 7.81819 3.3795 5.39674 5.61523 5.38086H5.71523C7.24202 5.37015 8.65013 4.55513 9.42188 3.2373L9.47266 3.15039Z"
                stroke="#EBEBED"
                strokeWidth="1.4"
            />
            <path
                d="M13.1113 9.49512C13.2698 9.87583 13.628 10.136 14.0391 10.1689L16.9229 10.3994L14.7256 12.2832C14.4127 12.5515 14.2765 12.9721 14.3721 13.373L15.043 16.1885L12.5732 14.6797C12.2653 14.4917 11.8878 14.4683 11.5625 14.6094L11.4268 14.6797L8.95605 16.1885L9.62793 13.373C9.72346 12.9721 9.58731 12.5515 9.27441 12.2832L7.07617 10.3994L9.96094 10.1689C10.372 10.136 10.7302 9.87584 10.8887 9.49512L12 6.82324L13.1113 9.49512Z"
                stroke="#EBEBED"
                strokeWidth="1.4"
            />
        </svg>
    );
}

function IconChecklist() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 4L5.54578 8L4 6.20997" stroke="#EBEBED" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
            <path d="M11.5 6.5H20.5" stroke="#EBEBED" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
            <path d="M9 10L5.54578 14L4 12.21" stroke="#EBEBED" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
            <path d="M11.5 12.5H20.5" stroke="#EBEBED" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
            <path d="M9 16L5.54578 20L4 18.21" stroke="#EBEBED" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
            <path d="M11.5 18.5H20.5" stroke="#EBEBED" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
        </svg>
    );
}

function IconChevronDown({ open }: { open: boolean }) {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 10.7334 5.40002"
            fill="none"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        >
            <path
                d="M0.700013 0.700013L5.36744 4.70002L10.0334 0.700013"
                stroke="#D6D6D6"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.4"
            />
        </svg>
    );
}

// ── Feature data ──────────────────────────────────────────────────────────────

const features = [
    {
        id: "free-shipping",
        icon: <IconFreeShipping />,
        label: "Free Shipping",
        description: `Free delivery across India on orders of ${FREE_SHIPPING_TEXT} or more.`,
    },
    {
        id: "customer-service",
        icon: <IconCustomerService />,
        label: "Friendly Customer Support",
        description: "Call, WhatsApp or email us — our hookah experts are happy to help you choose.",
    },
    {
        id: "secure-checkout",
        icon: <IconGift />,
        label: "Secure Checkout",
        description: "Pay safely with UPI, RuPay, Visa or Mastercard through Razorpay. GST invoice with every order.",
    },
    {
        id: "verified-authentic",
        icon: <IconShieldCheck />,
        label: "Always Verified Authentic",
        description: "Genuine products from Al Fakher and other leading hookah brands — every item is authentic and verified.",
    },
    {
        id: "hookah-experts",
        icon: <IconGears />,
        label: "True Hookah Experts",
        description: "We know what real smokers want: quality gear, fresh flavours and honest advice.",
    },
    {
        id: "tested-by-pros",
        icon: <IconChecklist />,
        label: "Tested by Pros, Trusted by You",
        description: "Every hookah, flavour and accessory we sell is hand-selected and tested by our team.",
    },
];

// Per-item border classes (preserved exactly from Figma source)
const featureBorderClasses = [
    "border-r border-b border-[#292929]",
    "border-b border-[#292929] md:border-r",
    "border-r border-b border-[#292929] md:border-r-0",
    "border-b border-[#292929] md:border-r md:border-b-0",
    "border-r border-[#292929]",
    "border-[#292929]",
];

// ── Nav data ──────────────────────────────────────────────────────────────────

// Shop column — top-level categories from lib/config/categories.ts
const shopLinks = TOP_CATEGORIES.map(t => t.label);
const aboutLinks = [
    "About Us",
    "Blog",
    "FAQs",
    "Business Opportunities",
    "Coupon Codes",
];
const supportLinks = [
    "Contact Us",
    "My Orders",
    "Shipping & Returns",
    "Accessibility",
    "Terms and Conditions",
    "Privacy Policy",
    "Cookies Policy",
];

const navHrefs: Record<string, Record<string, string>> = {
    shop: Object.fromEntries(TOP_CATEGORIES.map(t => [t.label, getRetailUrl(t.href)])),
    about: {
        "About Us": getRetailUrl("/about"),
        "Blog": getRetailUrl("/blog"),
        "FAQs": getRetailUrl("/faqs"),
        "Business Opportunities": getRetailUrl("/business-opportunities"),
        "Coupon Codes": getRetailUrl("/coupons"),
    },
    support: {
        "Contact Us": getRetailUrl("/contact"),
        "My Orders": getRetailUrl("/account/orders"),
        "Shipping & Returns": getRetailUrl("/shipping-and-returns"),
        "Accessibility": getRetailUrl("/accessibility-statement"),
        "Terms and Conditions": getRetailUrl("/terms-and-conditions"),
        "Privacy Policy": getRetailUrl("/privacy-policy"),
        "Cookies Policy": getRetailUrl("/cookies-policy"),
    },
};

const navTargets: Record<string, Record<string, string>> = {
    about: {
        "Blog": "_blank",
    },
};

const navSections = [
    { id: "shop", title: "Shop", links: shopLinks },
    { id: "about", title: "About", links: aboutLinks },
    { id: "support", title: "Support", links: supportLinks },
];

// ── Sub-components ────────────────────────────────────────────────────────────

const navLinkClass = "block [font-family:var(--font-montserrat),sans-serif] font-normal text-[14px] leading-[20px] text-[#d6d6d6] no-underline cursor-pointer hover:text-white transition-colors duration-150";

function NavLinkList({ links, hrefs = {}, targets = {} }: { links: string[]; hrefs?: Record<string, string>; targets?: Record<string, string> }) {
    return (
        <ul className="mt-0 space-y-[22px]">
            {links.map((link) => (
                <li key={link}>
                    {hrefs[link] ? (
                        <Link
                            href={hrefs[link]}
                            target={targets[link]}
                            rel={targets[link] === "_blank" ? "noopener noreferrer" : undefined}
                            className={navLinkClass}
                        >
                            {link}
                        </Link>
                    ) : (
                        <span className={`${navLinkClass} opacity-50 cursor-not-allowed`}>
                            {link}
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
}

/** FooterBrand — logo, contact info, social links, wholesale link */
function FooterBrand() {
    return (
        <div>
            {/* Logo */}
            <div className="mb-2">
                <SiteLogo dark={true} size="lg" />
            </div>

            {/* Contact info */}
            <div className="mt-[32px] space-y-[16px]">
                <div className="flex items-center gap-[4px]">
                    <Image src={imgPhone} alt="" width={16} height={16} className="block flex-none" />
                    <a href={SITE.phone.href} className="[font-family:var(--font-montserrat),sans-serif] font-normal text-[16px] leading-[20px] text-[#d6d6d6] no-underline hover:text-white transition-colors duration-150">
                        {SITE.phone.display}
                    </a>
                </div>
                <div className="flex items-center gap-[4px]">
                    <Image src={imgMail} alt="" width={16} height={16} className="block flex-none" />
                    <a href={mailtoHref()} className="[font-family:var(--font-montserrat),sans-serif] font-normal text-[16px] leading-[20px] text-[#d6d6d6] no-underline hover:text-white transition-colors duration-150">
                        {SITE.email}
                    </a>
                </div>
            </div>

            {/* Social icons */}
            <div className="mt-[32px] flex items-center gap-[36px]">
                <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <Image src={imgInstagram} alt="Instagram" width={22} height={22} className="block" />
                </a>
                {/* YouTube icon only renders once a real channel URL is set in lib/config/site.ts */}
                {SITE.social.youtube && (
                    <a href={SITE.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                        <Image src={imgYoutube} alt="YouTube" width={22} height={16} className="block" />
                    </a>
                )}
            </div>

            {/* Shop Wholesale */}
            <div className="mt-[42px]">
                <a
                    href={getWholesaleUrl()}
                    className="[font-family:var(--font-montserrat),sans-serif] font-medium text-[14px] leading-[20px] text-[#e6e7ed] underline decoration-solid hover:text-white transition-colors duration-150"
                >
                    Shop Wholesale
                </a>
            </div>
        </div>
    );
}

/**
 * FooterNavColumn — a single nav section with title + links.
 * Rendered in both the desktop 3-column grid and the mobile accordion.
 */
interface FooterNavColumnProps {
    section: { id: string; title: string; links: string[] };
    /** When true, renders as an accordion item (mobile view) */
    accordion?: boolean;
    isOpen?: boolean;
    onToggle?: () => void;
}
function FooterNavColumn({ section, accordion = false, isOpen = false, onToggle }: FooterNavColumnProps) {
    if (accordion) {
        return (
            <div className="border-b border-[#292929]">
                <button
                    type="button"
                    onClick={onToggle}
                    className="
                        w-full flex items-center justify-between
                        h-[56px] px-0
                        bg-transparent border-none cursor-pointer
                    "
                >
                    <span
                        className="
                            [font-family:var(--font-montserrat),sans-serif] font-normal
                            text-[14px] leading-[20px] tracking-[0.499px]
                            text-[#d6d6d6]
                        "
                    >
                        {section.title}
                    </span>
                    <IconChevronDown open={isOpen} />
                </button>

                {isOpen && (
                    <div className="pb-[24px]">
                        <ul className="space-y-[16px]">
                            {section.links.map((link) => {
                                const href = navHrefs[section.id]?.[link];
                                const target = navTargets[section.id]?.[link];
                                const rel = target === "_blank" ? "noopener noreferrer" : undefined;
                                return (
                                    <li key={link}>
                                        {href ? (
                                            <Link
                                                href={href}
                                                target={target}
                                                rel={rel}
                                                className={navLinkClass}
                                            >
                                                {link}
                                            </Link>
                                        ) : (
                                            <span className={`${navLinkClass} opacity-50 cursor-not-allowed`}>
                                                {link}
                                            </span>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                )}
            </div>
        );
    }

    // Desktop column
    return (
        <div>
            <p
                className="
                    [font-family:var(--font-montserrat),sans-serif] font-normal
                    text-[14px] leading-[16px] tracking-[0.499px] uppercase
                    text-white mb-[28px]
                "
            >
                {section.title}
            </p>
            <NavLinkList links={section.links} hrefs={navHrefs[section.id]} targets={navTargets[section.id]} />
        </div>
    );
}

/** Simple text payment mark (UPI / RuPay) sized like the card icons — swap for official logo files if preferred. */
function PaymentMark({ label }: { label: string }) {
    return (
        <span
            aria-label={label}
            className="inline-flex items-center justify-center [font-family:var(--font-montserrat),sans-serif] font-bold text-[12px] tracking-[0.5px]"
            style={{ width: 46, height: 32, borderRadius: 4, backgroundColor: '#ffffff', color: label === 'UPI' ? '#097939' : '#0a3a82' }}
        >
            {label}
        </span>
    );
}

/** FooterLegal — payment icons + copyright bar */
function FooterLegal() {
    return (
        <>
            {/* Payment row */}
            <div className="px-[24px] md:px-[80px] pt-[40px] pb-[24px] flex flex-col md:flex-row md:justify-end md:items-center gap-[16px] md:gap-[12px]">
                <span
                    className="
                        text-center md:text-right
                        [font-family:var(--font-montserrat),sans-serif] font-normal
                        text-[14px] leading-[20px] text-[#9c9ea3]
                    "
                >
                    100% Secure Payment
                </span>
                <div className="flex items-center justify-center md:justify-end gap-[8px]">
                    <PaymentMark label="UPI" />
                    <Image src={imgVisa} alt="Visa" width={46} height={32} className="block" />
                    <Image src={imgMasterCard} alt="Mastercard" width={46} height={32} className="block" />
                    <PaymentMark label="RuPay" />
                    <Image src={imgSslSecure} alt="SSL Secure" width={50} height={24} className="block" />
                </div>
            </div>

            {/* Copyright bar */}
            <div
                className="
                    px-[24px] md:px-[80px] pb-[40px]
                    flex flex-col md:flex-row md:flex-wrap md:items-center
                    gap-[8px] md:gap-x-[32px] md:gap-y-[8px]
                "
            >
                {LEGAL_LINES.map((line) => (
                    <span
                        key={line}
                        className="
                            text-center md:text-left
                            [font-family:var(--font-montserrat),sans-serif] font-normal
                            text-[12px] leading-[16px] text-[#9c9ea3]
                        "
                    >
                        {line}
                    </span>
                ))}
            </div>
        </>
    );
}

// ── Main Footer component ─────────────────────────────────────────────────────

export default function Footer() {
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [newsletterMsg, setNewsletterMsg] = useState('');

    const toggleAccordion = (id: string) => {
        setOpenAccordion((prev) => (prev === id ? null : id));
    };

    const handleNewsletterSubscribe = async () => {
        if (!newsletterEmail.trim()) return;
        setNewsletterStatus('loading');
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newsletterEmail }),
            });
            const data = await res.json() as { success?: boolean; error?: string };
            if (data.success) {
                setNewsletterStatus('success');
                setNewsletterMsg('You\'re subscribed!');
                setNewsletterEmail('');
            } else {
                setNewsletterStatus('error');
                setNewsletterMsg(data.error ?? 'Something went wrong.');
            }
        } catch {
            setNewsletterStatus('error');
            setNewsletterMsg('Something went wrong. Please try again.');
        }
    };

    return (
        <footer className="bg-black w-full">

            {/* ── Feature strip ─────────────────────────────────────────────────── */}
            <div className="px-[24px] md:px-[80px] pt-[48px] md:pt-[64px]">
                {/* Tagline */}
                <h2
                    className="
            text-center text-[#f5f6fa]
            [font-family:var(--font-montserrat),sans-serif] font-semibold
            text-[22px] md:text-[30px]
            leading-[28px] md:leading-[40px]
            mb-[48px] md:mb-[64px]
          "
                >
                    India&#39;s destination for premium hookahs and shisha
                </h2>

                {/* Feature grid: 2-col mobile, 3-col md+ */}
                <div className="grid grid-cols-2 md:grid-cols-3">
                    {features.map((feature, i) => (
                        <div
                            key={feature.id}
                            className={`flex flex-col items-center text-center px-4 md:px-6 py-[40px] ${featureBorderClasses[i]}`}
                        >
                            <div className="mb-[16px] flex items-center justify-center w-[24px] h-[24px]">
                                {feature.icon}
                            </div>
                            <p
                                className="
                  [font-family:var(--font-montserrat),sans-serif] font-semibold
                  text-[14px] leading-[16px] tracking-[0.499px] uppercase
                  text-[#f5f6fa] mb-[12px]
                "
                            >
                                {feature.label}
                            </p>
                            <p
                                className="
                  [font-family:var(--font-montserrat),sans-serif] font-normal
                  text-[14px] leading-[20px] text-[#999ba3]
                  m-0
                "
                            >
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Horizontal divider ────────────────────────────────────────────── */}
            <div className="mx-[24px] md:mx-[80px] mt-0 border-b border-[#292929]" />

            {/* ── Newsletter section ────────────────────────────────────────────── */}
            <div className="px-[24px] md:px-[80px] py-[40px] md:py-[64px] flex flex-col items-center">
                <h3
                    className="
            text-center text-[#f5f6fa]
            [font-family:var(--font-montserrat),sans-serif] font-semibold not-italic
            text-[22px] md:text-[30px]
            leading-[28px] md:leading-[40px]
            mb-[12px] md:mb-[16px]
          "
                >
                    Subscribe to Newsletter
                </h3>
                <p
                    className="
            text-center text-[#d6d6d6]
            [font-family:var(--font-montserrat),sans-serif] font-normal
            text-[14px] md:text-[16px] leading-[20px]
            mb-[20px] md:mb-[32px]
          "
                >
                    Be the first to know about new arrivals, sales &amp; promos!
                </p>

                {/* Form container */}
                <div className="w-full max-w-[628px]">
                    <div className="flex flex-col md:flex-row md:items-center gap-[12px] md:gap-0">
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={newsletterEmail}
                            onChange={(e) => { setNewsletterEmail(e.target.value); setNewsletterStatus('idle'); }}
                            onKeyDown={(e) => e.key === 'Enter' && handleNewsletterSubscribe()}
                            disabled={newsletterStatus === 'loading' || newsletterStatus === 'success'}
                            className="
                w-full h-[56px]
                bg-white border border-[#6a6b73] rounded-[8px]
                px-[16px]
                [font-family:var(--font-montserrat),sans-serif] font-normal
                text-[14px] leading-[20px] text-[#6a6b73]
                outline-none disabled:opacity-60
                md:flex-1 md:w-auto
              "
                        />
                        <button
                            type="button"
                            onClick={handleNewsletterSubscribe}
                            disabled={newsletterStatus === 'loading' || newsletterStatus === 'success'}
                            className="
                mx-auto md:mx-0 block
                w-[200px] md:w-[159px] md:ml-[16px] md:flex-none
                h-[48px] self-center
                bg-[#cd142c] rounded-[98px]
                [font-family:var(--font-montserrat),sans-serif] font-semibold
                text-[16px] leading-[20px] tracking-[1px] uppercase
                text-white disabled:opacity-50
                cursor-pointer
              "
                        >
                            {newsletterStatus === 'loading' ? '...' : newsletterStatus === 'success' ? 'Done!' : 'Subscribe'}
                        </button>
                    </div>

                    {/* Subscribe feedback */}
                    {newsletterMsg && (
                        <p className={`mt-2 text-center [font-family:var(--font-montserrat),sans-serif] text-[13px] ${newsletterStatus === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                            {newsletterMsg}
                        </p>
                    )}

                    {/* Disclaimer */}
                    <p
                        className="
              mt-[14px] md:mt-[16px]
              text-center text-[#999ba3]
              [font-family:var(--font-montserrat),sans-serif] font-normal
              text-[12px] md:text-[14px] leading-[18px] md:leading-[20px]
              mx-auto md:mx-0
            "
                    >
                        I confirm that I am 21 years old or above and I consent to receive promotional material for
                        products including tobacco
                    </p>
                </div>
            </div>

            {/* ── Horizontal divider ────────────────────────────────────────────── */}
            <div className="hidden md:block mx-[80px] border-b border-[#292929]" />

            {/* ── Nav section ───────────────────────────────────────────────────── */}
            <div className="px-[24px] md:px-[80px] py-[48px] md:py-[64px]">
                <div className="flex flex-col xl:flex-row xl:gap-[64px]">

                    {/* ── Nav columns ─────────────────────────────────────── */}
                    <div className="order-1 xl:order-2 xl:flex-1">

                        {/* Mobile: Accordion (hidden on md+) */}
                        <div className="md:hidden border-t border-[#292929]">
                            {navSections.map((section) => (
                                <FooterNavColumn
                                    key={section.id}
                                    section={section}
                                    accordion
                                    isOpen={openAccordion === section.id}
                                    onToggle={() => toggleAccordion(section.id)}
                                />
                            ))}
                        </div>

                        {/* Tablet + Desktop: 3-column grid (hidden on mobile) */}
                        <div className="hidden md:grid grid-cols-3 gap-x-[32px]">
                            {navSections.map((section) => (
                                <FooterNavColumn key={section.id} section={section} />
                            ))}
                        </div>
                    </div>

                    {/* ── Logo & contact block ─────────────────────────────── */}
                    <div className="order-2 xl:order-1 xl:w-[280px] mt-[48px] md:mt-[48px] xl:mt-0">
                        <FooterBrand />
                    </div>
                </div>
            </div>

            {/* ── Horizontal divider ────────────────────────────────────────────── */}
            <div className="mx-[24px] md:mx-[80px] border-b border-[#292929]" />

            {/* ── Legal (payment icons + copyright) ─────────────────────────────── */}
            <FooterLegal />

        </footer>
    );
}
