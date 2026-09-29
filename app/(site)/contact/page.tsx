"use client";
export const runtime = 'edge';
import { useState } from "react";
import Link from "next/link";
import { useTheme } from "../../../components/providers/ThemeProvider";
import { SITE, mailtoHref } from "../../../lib/config/site";

function EnvelopeIcon() {
    return (
        <svg width="96" height="96" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Glow circle */}
            <circle cx="48" cy="52" r="30" fill="#EDE9FE" />
            {/* Envelope body */}
            <rect x="20" y="34" width="52" height="38" rx="4" fill="#A78BFA" />
            <rect x="20" y="34" width="52" height="38" rx="4" fill="url(#envGrad)" />
            {/* Envelope flap */}
            <path d="M20 38L48 56L76 38" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {/* Sparkles */}
            <circle cx="18" cy="28" r="2.5" fill="#C4B5FD" />
            <circle cx="78" cy="30" r="2" fill="#C4B5FD" />
            <circle cx="72" cy="20" r="3" fill="#DDD6FE" />
            <path d="M24 22L26 18L28 22L24 22Z" fill="#A78BFA" />
            <path d="M68 60L70 56L72 60L68 60Z" fill="#C4B5FD" />
            {/* Speed lines */}
            <path d="M14 48H24" stroke="#C4B5FD" strokeWidth="2" strokeLinecap="round" />
            <path d="M12 54H20" stroke="#DDD6FE" strokeWidth="1.5" strokeLinecap="round" />
            <defs>
                <linearGradient id="envGrad" x1="20" y1="34" x2="76" y2="72" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#8B5CF6" />
                    <stop offset="1" stopColor="#6D28D9" />
                </linearGradient>
            </defs>
        </svg>
    );
}

const RED_BTN = "inline-flex items-center justify-center no-underline bg-[#cd142c] text-white rounded-[98px] h-[40px] px-5 text-[14px] uppercase tracking-[1px] font-semibold leading-[16px] whitespace-nowrap hover:bg-[#b01225] transition-colors duration-150";

export default function ContactPage() {
    const { dark } = useTheme();
    const [submitted, setSubmitted] = useState(false);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitted(true);
    }

    const inputCls = `w-full h-[49px] md:h-[53px] border rounded-[8px] px-3 outline-none ${dark ? "bg-white/10 border-[#555] text-white" : "bg-white border-[#bcbec4] text-[#101114]"}`;
    const labelCls = `block text-[14px] leading-normal mb-[10px] ${dark ? "text-white/80" : "text-[#101114]"}`;

    return (
        <main className={`min-h-screen font-montserrat transition-colors duration-200 pb-[80px] ${dark ? "bg-transparent text-white" : "bg-white text-[#101114]"}`}>

            {/* ── Breadcrumb ── */}
            <nav
                aria-label="Breadcrumb"
                className={`border-b h-[49px] flex items-center pl-[16px] md:pl-[64px] xl:pl-[312px] ${dark ? "border-[#333]" : "border-[#d7d8db]"}`}
            >
                <Link href="/" className={`text-[14px] capitalize leading-[20px] hover:underline ${dark ? "text-white/70 hover:text-white" : "text-[#1b1c1f] hover:text-black"}`}>
                    Home
                </Link>
                <span className="mx-[3px] inline-flex items-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
                    </svg>
                </span>
                <span aria-current="page" className={`text-[14px] capitalize leading-[20px] ${dark ? "text-white" : "text-[#1b1c1f]"}`}>
                    Contact Us
                </span>
            </nav>

            {/* ── Page Content ── */}
            <div className="px-4 md:px-16 xl:px-[312px]">

                {/* Page Title */}
                <h1 className={`not-italic font-semibold leading-[36px] md:leading-[54px] text-[28px] md:text-[40px] mt-[22px] md:mt-[47px] mb-[19px] md:mb-[23px] ${dark ? "text-white" : "text-[#101114]"}`}>
                    Contact Us
                </h1>

                {/* ── Contact Cards Grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] md:gap-[24px]">

                    {/* Email Card */}
                    <div className={`border rounded-[12px] px-6 pt-[24px] pb-[24px] ${dark ? "border-[#444] bg-white/5" : "border-[#d7d8db] bg-white"}`}>
                        <h2 className={`font-semibold text-[16px] leading-[20px] mb-[22px] ${dark ? "text-white" : "text-[#101114]"}`}>Email</h2>
                        <p className={`text-[14px] leading-[20px] mb-[38px] ${dark ? "text-white/80" : "text-black"}`}>{SITE.email}</p>
                        <a href={mailtoHref()} className={RED_BTN}>Send us an email</a>
                    </div>

                    {/* WhatsApp Card */}
                    <div className={`border rounded-[12px] px-6 pt-[24px] pb-[24px] ${dark ? "border-[#444] bg-white/5" : "border-[#d7d8db] bg-white"}`}>
                        <h2 className={`font-semibold text-[16px] leading-[20px] mb-[22px] ${dark ? "text-white" : "text-[#101114]"}`}>WhatsApp</h2>
                        <div className={`text-[14px] leading-[20px] mb-[38px] ${dark ? "text-white/80" : "text-black"}`}>
                            <p className="m-0">{SITE.supportHours}</p>
                        </div>
                        <a href={SITE.whatsapp.href} target="_blank" rel="noopener noreferrer" className={RED_BTN}>Chat on WhatsApp</a>
                    </div>

                    {/* Phone Card */}
                    <div className={`border rounded-[12px] px-6 pt-[24px] pb-[24px] ${dark ? "border-[#444] bg-white/5" : "border-[#d7d8db] bg-white"}`}>
                        <h2 className={`font-semibold text-[16px] leading-[20px] mb-[14px] ${dark ? "text-white" : "text-[#101114]"}`}>Phone</h2>
                        <p className={`text-[18px] leading-[24px] mb-[10px] ${dark ? "text-white/80" : "text-black"}`}>
                            For immediate assistance, give us a call<span className="hidden md:inline"> </span><span className="inline md:hidden"><br /></span>at:
                        </p>
                        <p className={`text-[18px] leading-[24px] mb-[18px] ${dark ? "text-white/80" : "text-black"}`}>
                            <a href={SITE.phone.href} className="underline" style={{ color: 'inherit' }}>{SITE.phone.display}</a>
                        </p>
                        <div className={`text-[14px] leading-[20px] ${dark ? "text-white/80" : "text-black"}`}>
                            <p className="m-0">{SITE.supportHours}</p>
                        </div>
                    </div>

                    {/* Address Card */}
                    <div className={`border rounded-[12px] px-6 pt-[24px] pb-[24px] ${dark ? "border-[#444] bg-white/5" : "border-[#d7d8db] bg-white"}`}>
                        <h2 className={`font-semibold text-[16px] leading-[20px] mb-[14px] ${dark ? "text-white" : "text-[#101114]"}`}>Address</h2>
                        <div className={`text-[18px] leading-[24px] ${dark ? "text-white/80" : "text-black"}`}>
                            {SITE.addressLines.map((line) => (
                                <p key={line} className="m-0">{line}</p>
                            ))}
                            <p className="m-0 mt-[12px] text-[14px] leading-[20px]">{SITE.company} · GSTIN: {SITE.gstin}</p>
                        </div>
                    </div>

                </div>

                {/* ── Contact Form ── */}
                <div className="mt-[32px]">

                    <h2 className={`font-semibold text-[16px] leading-normal mb-[20px] md:mb-[41px] ${dark ? "text-white" : "text-black"}`}>
                        Send us a message
                    </h2>

                    {/* ── Success State ── */}
                    {submitted ? (
                        <div className="flex flex-col items-center justify-center py-[80px] gap-[20px]">
                            <EnvelopeIcon />
                            <h3 className={`font-bold text-[28px] leading-tight ${dark ? "text-white" : "text-[#101114]"}`}>
                                Thank You!
                            </h3>
                            <p className={`text-[16px] ${dark ? "text-white/70" : "text-[#6b7280]"}`}>
                                Your message has been sent
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {/* Row 1: First Name + Last Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[20px] gap-y-[16px] mb-[16px]">
                                <div>
                                    <label className={labelCls}>First Name <span className="text-red-500 text-[13px]">*</span></label>
                                    <input type="text" required className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Last Name <span className="text-red-500 text-[13px]">*</span></label>
                                    <input type="text" required className={inputCls} />
                                </div>
                            </div>

                            {/* Row 2: Order Number + Email */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[20px] gap-y-[16px] mb-[16px]">
                                <div>
                                    <label className={labelCls}>Order Number</label>
                                    <input type="text" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Email <span className="text-red-500 text-[13px]">*</span></label>
                                    <input type="email" required className={inputCls} />
                                </div>
                            </div>

                            {/* Row 3: Phone + Reason */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-[20px] gap-y-[16px] mb-[16px]">
                                <div>
                                    <label className={labelCls}>Phone</label>
                                    <input type="tel" className={inputCls} />
                                </div>
                                <div>
                                    <label className={labelCls}>Reason for contacting us <span className="text-red-500 text-[13px]">*</span></label>
                                    <div className="relative">
                                        <select
                                            required
                                            defaultValue=""
                                            className={`w-full h-[53px] border rounded-[6px] appearance-none px-4 pr-10 text-[14px] outline-none ${dark ? "bg-white/10 border-[#555] text-white" : "bg-[#efefef] border-[#bdbcbb] text-[#35363B]"}`}
                                        >
                                            <option value="" disabled></option>
                                            <optgroup label="My Order">
                                                <option value="tracking">Tracking Information</option>
                                                <option value="order-status">Order Status</option>
                                                <option value="defective">Defective Item</option>
                                                <option value="missing">Missing Item</option>
                                                <option value="cancel">Cancel</option>
                                                <option value="lost-package">Lost Package</option>
                                                <option value="order-other">Other</option>
                                            </optgroup>
                                            <optgroup label="Account Help">
                                                <option value="update-account">Update Account Information</option>
                                                <option value="forgot-password">Forgot Password</option>
                                                <option value="other-login">Other Login Issue</option>
                                                <option value="login-issue">Login Issue</option>
                                            </optgroup>
                                            <optgroup label="Website Support">
                                                <option value="promo-code">Promo Code Issue</option>
                                                <option value="website-issue">Website Issue</option>
                                                <option value="website-other">Other</option>
                                            </optgroup>
                                            <optgroup label="Wholesale Inquiry">
                                                <option value="wholesale-account">Wholesale Account Information</option>
                                            </optgroup>
                                            <optgroup label="General Inquiries">
                                                <option value="product-assembly">Product Assembly</option>
                                                <option value="affiliate">Affiliate Information Request</option>
                                                <option value="marketing">Marketing Inquiry</option>
                                                <option value="product-request">Product Request</option>
                                                <option value="vendor">Vendor Inquiry</option>
                                                <option value="general-other">Other</option>
                                            </optgroup>
                                        </select>
                                        <div className="pointer-events-none absolute right-[14px] top-1/2 -translate-y-1/2">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <path d="M7 10L12.0008 14.58L17 10" stroke={dark ? "#fff" : "#35363B"} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subject */}
                            <div className="mb-[16px]">
                                <label className={labelCls}>Subject <span className="text-red-500 text-[13px]">*</span></label>
                                <input type="text" required className={inputCls} />
                            </div>

                            {/* Message */}
                            <div className="mb-[24px]">
                                <label className={labelCls}>Message</label>
                                <textarea className={`w-full h-[120px] md:h-[220px] border rounded-[8px] px-3 py-3 outline-none resize-none ${dark ? "bg-white/10 border-[#555] text-white" : "bg-white border-[#bcbec4] text-[#101114]"}`} />
                            </div>

                            {/* Submit */}
                            <div className="mb-[48px]">
                                <button
                                    type="submit"
                                    className="bg-[#cd142c] h-[51px] w-[131.25px] rounded-[40px] text-white font-semibold text-[16px] uppercase leading-normal hover:bg-[#b01225] transition-colors duration-150"
                                    style={{
                                        boxShadow: "0px 1px 2px 0px rgba(0,0,0,0.15)",
                                        textShadow: "0px 1px 0px rgba(0,0,0,0.25)",
                                    }}
                                >
                                    SUBMIT
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </main>
    );
}
