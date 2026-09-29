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
        title: "1. Introduction and Acceptance",
        content: (
            <p style={pLast}>
                These Terms and Conditions (&#8220;Terms&#8221;) govern your access to and use of thehookahstore.in (the &#8220;Website&#8221;) and the purchase of products through it. The Website is owned and operated by Al Dhuvor LLP, a Limited Liability Partnership incorporated under the laws of India, having its registered office at {SITE.address}, LLPIN: AAR-9587, GSTIN: {SITE.gstin} (&#8220;we&#8221;, &#8220;us&#8221;, &#8220;our&#8221;). By accessing the Website, creating an account, or placing an order, you confirm that you have read, understood, and agree to be bound by these Terms, our Privacy Policy, and our Shipping &amp; Returns Policy. If you do not agree, do not use the Website.
            </p>
        ),
    },
    {
        title: "2. Eligibility and Age Restriction",
        content: (
            <ul style={ulLast}>
                <li>The Website sells tobacco products. As a matter of our own voluntary company policy, we restrict access, account creation, and purchases to persons aged 21 years or above — a standard set deliberately above the statutory minimum age of 18 years prescribed under the Cigarettes and Other Tobacco Products Act, 2003 (&#8220;COTPA&#8221;).</li>
                <li>By using the Website you represent and warrant that you are 21 years of age or older, resident in India, and legally competent to enter into a contract under the Indian Contract Act, 1872.</li>
                <li>We may require age and identity verification, including a valid government-issued photo ID (Aadhaar, PAN card, Passport, or Voter ID), at registration, at checkout, and/or at delivery. We reserve the right to refuse or cancel any order, and to suspend or terminate any account, where age cannot be satisfactorily verified. No refund obligation arises where an order is cancelled solely due to failed age verification.</li>
                <li>Sale of tobacco products to persons below 18 years of age is a criminal offence under Section 6 of COTPA. Any attempt by a person below 21 to purchase from the Website is a breach of these Terms; any purchase by a person below 18 is additionally an offence under applicable law.</li>
                <li>We reserve the right to seek documentary evidence of age at any point. Where such evidence is not provided within a reasonable time, we may cancel the relevant order with a full refund.</li>
            </ul>
        ),
    },
    {
        title: "3. Statutory Health Warning",
        content: (
            <>
                <p style={p}>
                    <strong>STATUTORY HEALTH WARNING — TOBACCO CAUSES PAINFUL DEATH.</strong> Quit today: National Tobacco Quitline 1800-11-2356 &nbsp;|&nbsp; ntcp.mohfw.gov.in
                </p>
                <p style={p}>
                    Tobacco products sold on this Website carry the statutory pictorial and textual health warnings specified under the Cigarettes and Other Tobacco Products (Packaging and Labelling) Rules, 2008 as amended, with the current warning set under the Packaging and Labelling Amendment Rules 2024 effective 1 June 2025. By purchasing, you acknowledge the serious health risks associated with tobacco use.
                </p>
                <p style={pLast}>
                    Nothing on this Website constitutes medical advice or is intended to encourage non-users to begin using tobacco products. All product listings are provided solely as factual trade information for adult consumers who have independently chosen to access this Website.
                </p>
            </>
        ),
    },
    {
        title: "4. Products and Product Information",
        content: (
            <>
                <p style={p}>
                    The Website offers hookahs, hookah tobacco (shisha/molasses), charcoal, bowls, hoses, and related accessories. We do not sell, and have never sold, electronic cigarettes, e-liquids, vaping devices, heat-not-burn products, or any product prohibited under the Prohibition of Electronic Cigarettes Act, 2019 (PECA 2019).
                </p>
                <p style={p}>
                    We are authorised distributors of Al Fakher and Afzal. We also stock Mya, Royal, Qehwa, and additional brands as an authorised retailer sourcing through legitimate, verified wholesale channels within India. All products are procured through traceable, lawful supply chains and are genuine. We reserve the right to correct errors and cancel orders affected by material pricing errors (e.g., ₹0.00) with a full refund.
                </p>
                <p style={p}>
                    For imported products, the country of origin, importer details, and net weight are stated on the product listing and packaging in accordance with the Legal Metrology (Packaged Commodities) Rules, 2011. Al Fakher products are imported from the UAE; Afzal products are manufactured in India.
                </p>
                <p style={pLast}>
                    <strong>User&#8217;s responsibility to verify local law.</strong> The sale, possession, and use of tobacco products may be restricted or prohibited in certain states, union territories, or localities. It is solely your responsibility to verify that purchasing and receiving the products you order is lawful at your delivery address before placing an order. We do not accept any liability arising from your failure to verify applicable local laws. By placing an order, you represent and warrant that receipt of the products at your delivery address is lawful under all applicable laws.
                </p>
            </>
        ),
    },
    {
        title: "5. Orders, Pricing, and Payment",
        content: (
            <ul style={ulLast}>
                <li>All prices are in Indian Rupees (₹) and are inclusive of applicable GST unless otherwise stated. A GST-compliant tax invoice bearing GSTIN {SITE.gstin} will be issued electronically for every completed order.</li>
                <li>Placing an order constitutes an offer to purchase; a binding contract is formed only when we confirm dispatch. We may decline or cancel any order on grounds of suspected fraud, failed age verification, product unavailability, pricing error, or inability to process payment. Where an order is cancelled after payment, a full refund will be issued within 7 business days.</li>
                <li>Accepted payment methods include UPI (GPay, PhonePe, Paytm UPI, BHIM), Debit and Credit Cards (Visa, Mastercard, RuPay, Maestro), Net Banking, and Digital Wallets, as listed at checkout. Payments are processed by a licensed third-party payment gateway operating under RBI guidelines. We do not store your full card number, CVV, or UPI PIN.</li>
                <li>Cash on Delivery (COD): where available for your pin code, COD orders are subject to a non-refundable COD convenience charge of ₹99 per order, displayed at checkout. COD orders require the recipient to present valid government-issued photo ID confirming age 21+. If satisfactory ID is not presented or the recipient is unavailable, the parcel will not be handed over, the order will be cancelled, and the ₹99 charge will be forfeited.</li>
                <li>We are not responsible for any additional bank charges or transaction fees your payment provider may apply.</li>
            </ul>
        ),
    },
    {
        title: "6. Shipping and Delivery",
        content: (
            <ul style={ulLast}>
                <li>We ship within India only, to serviceable pin codes, using reputable courier partners. Estimated delivery timelines are indicative and not guaranteed.</li>
                <li>All deliveries containing tobacco products require the recipient to present a valid government-issued photo ID confirming age of 21 or above. Parcels will not be left unattended. Delivery to any person below 18 is prohibited under COTPA regardless of circumstances.</li>
                <li>Title to the products passes to you upon receipt of full payment and successful delivery.</li>
                <li>In the event of a failed delivery due to incorrect address, refusal to present ID, or absence of an eligible recipient, re-delivery charges may apply or the order may be cancelled.</li>
            </ul>
        ),
    },
    {
        title: "7. Returns, Refunds, Exchanges, and Cancellations",
        content: (
            <>
                <p style={p}><strong>General Returns Policy.</strong> We do not accept general returns. All sales of hookah tobacco, charcoal, and consumable products are final once dispatched; these items cannot be returned, refunded, or exchanged under any circumstances.</p>
                <p style={p}><strong>Damaged or Incomplete Items.</strong> If your order arrives damaged or with missing parts, we will replace the affected item subject to verification of actual proof. To raise a claim: email {SITE.email} within 48 hours of delivery with subject line &#8220;Return Request: Order #[your order number]&#8221;, and attach a complete, unedited unboxing video recorded continuously from opening the outer packaging through every individual product, with no cuts. Claims submitted without a complete unboxing video will not be considered. Return requests are accepted by email only — phone or chat requests will not be processed, and claims after the 48-hour window will not be entertained.</p>
                <p style={p}><strong>Refunds.</strong> Once your claim is reviewed and approved, we will provide return instructions where applicable. Approved refunds or replacements are processed within 7–10 business days of inspection. Refunds are credited to the original payment method; for COD orders, refunds are processed by bank transfer. The ₹99 COD convenience charge is non-refundable in all cases.</p>
                <p style={p}><strong>Exchanges.</strong> Items must be unused, unassembled, and in original undamaged packaging. Email {SITE.email} within 48 hours of delivery with your order number, item(s), and reason for exchange. Exchanges are subject to stock availability; return shipping is at the customer&#8217;s cost unless the exchange is due to our error. Tobacco products and charcoal are not eligible for exchange under any circumstances.</p>
                <p style={p}><strong>Transit Damage: Courier Liability.</strong> We package all orders securely. Once dispatched, transit risk passes to the courier. If your order is damaged during shipping, your recourse is a direct claim with the courier company; we are not liable for transit damage. Your unboxing video serves as evidence for the courier claim.</p>
                <p style={pLast}><strong>Cancellations.</strong> Cancellations are only possible before the order has been dispatched — email {SITE.email} or call {SITE.phone.display} with your order number as soon as possible. Pre-dispatch cancellations receive a full refund within 5–7 business days; the ₹99 COD convenience charge is non-refundable even for pre-dispatch cancellations.</p>
            </>
        ),
    },
    {
        title: "8. Account and Acceptable Use",
        content: (
            <ul style={ulLast}>
                <li>You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. You must provide accurate, current information at registration, including your date of birth.</li>
                <li>You must not: (a) misrepresent your age or identity; (b) purchase products for or on behalf of any person below 21 years of age, or supply tobacco products to any person below 18 (a criminal offence under COTPA); (c) resell products without applicable licences; (d) use the Website for any unlawful purpose; (e) scrape or republish Website content; or (f) interfere with the Website&#8217;s security or operation.</li>
                <li>We may suspend or permanently terminate any account found in breach of these Terms, with or without prior notice, and may report the breach to relevant authorities.</li>
            </ul>
        ),
    },
    {
        title: "9. Pricing, Advertising, and Communications Policy",
        content: (
            <>
                <p style={p}><strong>Competitive Pricing.</strong> We sell products at prices we set, which may be below the Maximum Retail Price (MRP) printed on the packaging — this is standard retail practice and does not constitute tobacco advertising or promotion under COTPA. We may also offer volume and quantity pricing (e.g., a lower per-gram price on a 1kg pack versus a 50g pack) as a standard commercial pricing structure, not a promotional scheme. Free shipping above a minimum order value, where offered, is a logistics and service offer, not a tobacco promotion.</p>
                <p style={p}>
                    <strong>COTPA Section 5: What Is Prohibited.</strong> All Website content is intended solely as factual trade and product information for adult consumers. It is not an advertisement, promotion, sponsorship, or inducement to use tobacco products. We do not operate, and this Website does not offer: loyalty or rewards programmes rewarding tobacco purchases; referral incentive schemes tied to tobacco products; coupon codes or campaigns marketed specifically as tobacco discounts; or sponsored content, influencer endorsements, or paid advertising for tobacco products.
                </p>
                <p style={p}>
                    What we may offer, subject to ongoing legal review: discount codes applicable to accessories only (hookahs, bowls, hoses, charcoal, non-tobacco items); platform-level welcome or first-order benefits for new account holders that are not tobacco-product specific; and free or reduced shipping benefits above a minimum basket value. Any new commercial feature will be reviewed for COTPA compliance before launch.
                </p>
                <p style={p}>
                    <strong>Communications.</strong> We do not send promotional or marketing communications relating to tobacco products via any channel, in accordance with Section 5 of COTPA 2003. Transactional communications are sent as required for contract performance. You may opt out of non-mandatory communications at any time by contacting {SITE.email}.
                </p>
                <p style={pLast}>
                    <strong>User Obligations.</strong> We do not direct any marketing or content at persons below 21 years of age. You must not reproduce, share, or distribute any content from this Website in any manner that constitutes advertisement or promotion of tobacco products, including on social media or messaging applications.
                </p>
            </>
        ),
    },
    {
        title: "10. Intellectual Property",
        content: (
            <p style={pLast}>
                All content on the Website, including text, graphics, logos, images, and software, is owned by or licensed to Al Dhuvor LLP and protected under the Copyright Act, 1957 and Indian trade mark law. Third-party brand names (Al Fakher, Afzal, Mya, Royal, Qehwa, and any other brands we carry from time to time) are the property of their respective owners and are used solely to identify genuine products. No licence is granted except to browse the Website for lawful personal purchases.
            </p>
        ),
    },
    {
        title: "11. Privacy and Data Protection",
        content: (
            <p style={pLast}>
                Our collection and processing of your personal data, including date of birth and identity documents for age verification, is governed by our Privacy Policy, framed in accordance with the Digital Personal Data Protection Act, 2023 and the Information Technology Act, 2000. Age verification documents are retained only for the period required by applicable law.
            </p>
        ),
    },
    {
        title: "12. Disclaimers and Limitation of Liability",
        content: (
            <ul style={ulLast}>
                <li>The Website is provided on an &#8220;as is&#8221; and &#8220;as available&#8221; basis. We do not warrant uninterrupted or error-free operation.</li>
                <li><strong>Health disclaimer.</strong> Tobacco use is inherently harmful and carries well-documented life-threatening risks. By purchasing, you acknowledge these risks and confirm your decision is an informed personal choice as a consenting adult. To the maximum extent permitted by Indian law, we accept no liability for any health consequence arising from use of tobacco products purchased through the Website.</li>
                <li><strong>Limitation of liability.</strong> To the maximum extent permitted by applicable Indian law, our total aggregate liability shall not exceed the total amount actually paid by you for the relevant order. We are not liable for loss of profits, loss of data, or any indirect, incidental, or consequential losses.</li>
                <li><strong>Consumer rights preserved.</strong> Nothing in these Terms excludes any right or remedy you may have under the Consumer Protection Act, 2019 or any other mandatory provision of Indian law that cannot lawfully be excluded.</li>
            </ul>
        ),
    },
    {
        title: "13. Indemnity",
        content: (
            <p style={pLast}>
                You agree to defend, indemnify, and hold harmless Al Dhuvor LLP and its designated partners, employees, and agents from and against any claims, liabilities, damages, and expenses (including reasonable legal fees) arising from: (a) your breach of these Terms; (b) your misrepresentation of age or identity; (c) your supply of products to a person below 21 (or 18) years of age; or (d) your unlawful use of the Website or products.
            </p>
        ),
    },
    {
        title: "14. Grievance Officer and Customer Support",
        content: (
            <p style={pLast}>
                In accordance with the Consumer Protection (E-Commerce) Rules, 2020 and the IT (Intermediary Guidelines) Rules, 2021, our Grievance Officer is: Santhosh, Director, Al Dhuvor LLP, {SITE.address}. Email: {SITE.email} &nbsp;·&nbsp; Phone: {SITE.phone.display}. Customer support hours: Monday to Saturday, 10:00 AM – 6:00 PM IST.
            </p>
        ),
    },
    {
        title: "15. Governing Law and Dispute Resolution",
        content: (
            <ul style={ulLast}>
                <li>These Terms are governed by the laws of the Republic of India.</li>
                <li>Subject to your rights under the Consumer Protection Act, 2019, the courts at Chennai, Tamil Nadu shall have exclusive jurisdiction.</li>
                <li>Either party may elect to refer any commercial dispute (other than consumer claims) to binding arbitration before a sole arbitrator under the Arbitration and Conciliation Act, 1996. Seat and venue: Chennai, Tamil Nadu. Language: English. The award shall be final and binding.</li>
                <li>Consumer disputes may be brought before appropriate consumer fora under the Consumer Protection Act, 2019, at the consumer&#8217;s election.</li>
            </ul>
        ),
    },
    {
        title: "16. General",
        content: (
            <ul style={ulLast}>
                <li><strong>Amendments.</strong> We may update these Terms at any time. Continued use of the Website after changes constitutes acceptance.</li>
                <li><strong>Severability.</strong> If any provision is held invalid, the remainder continues in full force.</li>
                <li><strong>Force majeure.</strong> We are not liable for delay or failure caused by circumstances beyond our reasonable control.</li>
                <li><strong>Entire agreement.</strong> These Terms, together with our Privacy Policy, Cookies Policy, and Shipping &amp; Returns Policy, constitute the entire agreement between you and Al Dhuvor LLP regarding the Website.</li>
                <li><strong>Communications.</strong> By providing your contact details during registration or checkout, you consent to receive transactional communications from us via SMS, WhatsApp, and email (order confirmations, invoices, dispatch notifications, delivery updates, age-verification requests). We do not send promotional or marketing communications relating to tobacco products, in accordance with our obligations under Section 5 of COTPA 2003.</li>
            </ul>
        ),
    },
];

export default function TermsAndConditionsPage() {
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
    const textSecondary = dark ? "rgba(255,255,255,0.7)" : "#101114";
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
                        Terms &amp; Conditions
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
                    Terms &amp; Conditions
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

                {/* Footer note */}
                <p
                    style={{
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontWeight: 400,
                        fontSize: "14px",
                        lineHeight: "28px",
                        color: textSecondary,
                        transition: "color 200ms",
                    }}
                    className="mt-[40px] md:mt-[48px] text-[14px] md:text-[18px]"
                >
                    By accessing or using thehookahstore.in, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you have any questions, please contact us at {SITE.email}.
                </p>

                <div style={{ height: "60px" }} />
            </div>
        </div>
    );
}
