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

const sections: { title: string; content: React.ReactNode }[] = [
    {
        title: "Where We Ship",
        content: (
            <p style={pLast}>
                We ship across India to all serviceable pin codes via reputable courier partners. Enter your pin code at checkout to confirm serviceability before placing your order. We do not currently ship internationally.
            </p>
        ),
    },
    {
        title: "Processing Time",
        content: (
            <p style={pLast}>
                Orders are processed and dispatched within 1–3 business days of payment confirmation (Monday to Saturday, excluding public holidays). You will receive a dispatch confirmation with a tracking number once your order is on its way.
            </p>
        ),
    },
    {
        title: "Estimated Delivery Times",
        content: (
            <>
                <ul style={ul}>
                    <li>Metro cities (Chennai, Bengaluru, Mumbai, Delhi, Hyderabad, Kolkata): 2–4 business days after dispatch</li>
                    <li>Other cities and towns: 4–7 business days after dispatch</li>
                    <li>Remote or rural pin codes: 7–10 business days after dispatch</li>
                </ul>
                <p style={pLast}>
                    Delivery timelines are estimates only and not guaranteed. Delays may occur due to courier capacity, weather, public holidays, or unforeseen circumstances beyond our control.
                </p>
            </>
        ),
    },
    {
        title: "Shipping Charges",
        content: (
            <p style={pLast}>
                Shipping charges are calculated at checkout based on your delivery location and order weight. Free shipping may be available above a minimum order value; refer to the current offer displayed on the Website.
            </p>
        ),
    },
    {
        title: "Age Verification at Delivery",
        content: (
            <>
                <p style={p}>
                    All orders containing tobacco products require age verification at the point of delivery. The recipient must present a valid government-issued photo ID (Aadhaar, PAN Card, Passport, or Voter ID) confirming they are 21 years of age or above (our voluntary company policy; the legal minimum under COTPA 2003 is 18).
                </p>
                <ul style={ulLast}>
                    <li>Our delivery partners are instructed not to leave parcels unattended</li>
                    <li>If the recipient cannot produce valid ID or appears to be under 21, delivery will be refused</li>
                    <li>In such cases the order will be cancelled and the COD convenience charge (if applicable) forfeited</li>
                    <li>For prepaid orders where delivery is refused due to failed age verification, a restocking fee may be deducted from the refund</li>
                </ul>
            </>
        ),
    },
    {
        title: "Cash on Delivery (COD)",
        content: (
            <p style={pLast}>
                COD is available at select pin codes. A non-refundable convenience charge of ₹99 applies to all COD orders. This charge is shown at checkout before you confirm your order. The ₹99 charge is forfeited if delivery fails for any reason attributable to the customer (failed age verification, unavailability, refusal to accept).
            </p>
        ),
    },
    {
        title: "Returns: General Policy",
        content: (
            <p style={pLast}>
                We do not accept general returns. All sales of hookah tobacco (shisha/molasses) and charcoal are final once dispatched. These products cannot be returned, refunded, or exchanged under any circumstances due to health, hygiene, and regulatory reasons. Returns for hookahs, pipes, accessories, and non-consumable items are accepted only in the specific circumstances below.
            </p>
        ),
    },
    {
        title: "Damaged or Incomplete Items",
        content: (
            <>
                <p style={p}>
                    If your order arrives damaged or with missing parts, we will replace the affected item, subject to verification of actual proof.
                </p>
                <p style={p}><strong>How to raise a damaged / incomplete item claim:</strong></p>
                <ul style={ul}>
                    <li>Email {SITE.email} within 48 hours of delivery</li>
                    <li>Subject line: &#8220;Return Request: Order #[your order number]&#8221;</li>
                    <li>Include your order number, the specific item(s) affected, and a complete unboxing video recorded from the moment you open the outer packaging through to every individual product, clearly showing any damage or missing parts. The video must be continuous and unedited with no cuts.</li>
                    <li>Claims submitted without a complete unboxing video will not be considered. Photographs alone are not sufficient.</li>
                </ul>
                <p style={pLast}>
                    Return requests are accepted by email only. Phone, WhatsApp, or chat requests will not be processed. You must raise your request within 48 hours of delivery. Claims after this window will not be entertained.
                </p>
            </>
        ),
    },
    {
        title: "Refunds",
        content: (
            <ul style={ulLast}>
                <li>Once your claim is reviewed and approved, we will provide return instructions where applicable</li>
                <li>Approved refunds or replacements are processed within 7–10 business days of receipt and inspection</li>
                <li>Refunds are credited to the original payment method only</li>
                <li>For COD orders, refunds are processed via bank transfer; you will be asked for your account details</li>
                <li>₹99 COD convenience charge is non-refundable in all cases</li>
            </ul>
        ),
    },
    {
        title: "Exchanges",
        content: (
            <ul style={ulLast}>
                <li>The item must be unused, unassembled, and in its original undamaged packaging</li>
                <li>You must have a valid reason (e.g., wrong size ordered, wrong product received)</li>
                <li>Email {SITE.email} within 48 hours of delivery with your order number, the item(s) to exchange, and the reason</li>
                <li>Exchanges are subject to stock availability</li>
                <li>Tobacco products and charcoal are not eligible for exchange under any circumstances</li>
                <li>Return shipping for exchanges is at the customer&#8217;s own cost unless the exchange is due to our error</li>
            </ul>
        ),
    },
    {
        title: "Transit Damage: Courier Liability",
        content: (
            <>
                <p style={p}>
                    We package all orders securely. Once an order is dispatched, transit risk passes to the courier company. If your order is damaged due to handling during shipping, your primary recourse is a direct claim with the courier company. We are not liable for transit damage.
                </p>
                <p style={pLast}>
                    To support your courier claim: photograph the outer packaging before opening; record your unboxing video; retain all packaging; raise your courier claim within the courier&#8217;s timeframe. Your unboxing video also serves as evidence for the courier claim.
                </p>
            </>
        ),
    },
    {
        title: "Return Shipping Costs",
        content: (
            <p style={pLast}>
                We bear the cost of return shipping for approved damaged or incomplete item claims. For exchanges raised for reasons of customer preference (e.g., wrong size ordered), return shipping is at the customer&#8217;s own cost unless the exchange resulted from our error.
            </p>
        ),
    },
    {
        title: "Cancellations",
        content: (
            <ul style={ulLast}>
                <li>Cancellations only possible before the order has been dispatched</li>
                <li>Email {SITE.email} or call {SITE.phone.display} with your order number as soon as possible</li>
                <li>Once dispatch is confirmed, cancellation is not possible</li>
                <li>Pre-dispatch cancellations receive a full refund within 5–7 business days</li>
                <li>₹99 COD convenience charge is non-refundable even for pre-dispatch cancellations</li>
            </ul>
        ),
    },
    {
        title: "Contact for Returns and Refunds",
        content: (
            <p style={pLast}>
                Email: {SITE.email} &nbsp;·&nbsp; Phone: {SITE.phone.display}. Hours: Monday to Saturday, 10:00 AM – 6:00 PM IST. Grievance Officer: Santhosh, Director, Al Dhuvor LLP. Nothing in this policy limits your statutory rights under the Consumer Protection Act, 2019.
            </p>
        ),
    },
];

export default function ShippingAndReturnsPage() {
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
                        Shipping And Returns
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
                    Shipping And Returns
                </h1>

                {/* Company info */}
                <div
                    style={{
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontWeight: 400,
                        lineHeight: "20px",
                        color: dark ? "rgba(255,255,255,0.7)" : "#101114",
                        transition: "color 200ms",
                    }}
                    className="mt-[20px] md:mt-[24px] text-[14px]"
                >
                    <p style={{ margin: 0, fontWeight: 600, color: textPrimary }}>Al Dhuvor LLP</p>
                    <p style={{ margin: "4px 0 0 0" }}>{SITE.address}</p>
                    <p style={{ margin: "4px 0 0 0" }}>LLPIN: AAR-9587 &nbsp;·&nbsp; GSTIN: {SITE.gstin}</p>
                    <p style={{ margin: "4px 0 0 0" }}>{SITE.email} &nbsp;·&nbsp; {SITE.phone.display}</p>
                    <p style={{ margin: "12px 0 0 0", opacity: 0.6 }}>Last updated: July 10, 2026</p>
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
