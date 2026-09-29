"use client";
export const runtime = 'edge';
import Link from "next/link";
import { useTheme } from "../../../components/providers/ThemeProvider";
import { SITE } from "../../../lib/config/site";

const imgBackground = "/about/e57827aa0f93bb10ce8dfd0508e8383b30c99926.png";
const imgAboutus01 = "/about/8e940bf99e24994600e0f033e8f888279241ef89.png";
const imgAboutus02 = "/about/857bb7849478e34f2cecc5715deb3973da9c644f.png";

export default function AboutPage() {
    const { dark } = useTheme();

    const borderColor = dark ? "#5D5D5D" : "#d7d8db";
    const textPrimary = dark ? "#ffffff" : "#101114";
    const textBody = dark ? "rgba(255,255,255,0.80)" : "#000000";

    return (
        <main
            className="w-full min-h-screen font-montserrat transition-colors duration-200"
            style={{ backgroundColor: dark ? "transparent" : "#ffffff" }}
        >
            {/* ── Hero ── */}
            <section className="relative h-[300px] w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={imgBackground}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <h1
                        className="not-italic text-[#f5f6fa] text-center text-[28px] md:text-[40px]"
                        style={{ fontWeight: 600, lineHeight: "1.35" }}
                    >
                        About Us
                    </h1>
                </div>
            </section>

            {/* ── Breadcrumb ── */}
            <nav
                aria-label="Breadcrumb"
                className="h-[49px] flex items-center pl-[16px] md:pl-[64px] xl:pl-[312px]"
                style={{
                    borderBottom: `1px solid ${borderColor}`,
                    transition: "border-color 200ms",
                }}
            >
                <Link
                    href="/"
                    className="text-[14px] capitalize leading-[20px] hover:underline transition-colors"
                    style={{ color: dark ? "rgba(255,255,255,0.7)" : "#1b1c1f" }}
                >
                    Home
                </Link>
                <span className="mx-[3px] inline-flex items-center">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
                    </svg>
                </span>
                <span
                    aria-current="page"
                    className="text-[14px] capitalize leading-[20px] transition-colors"
                    style={{ color: dark ? "#ffffff" : "#1b1c1f" }}
                >
                    About Us
                </span>
            </nav>

            {/* ── Page Content ── */}
            <div className="px-4 md:px-16 xl:px-[312px] pb-20">

                {/* Company info block */}
                <section className="mt-12">
                    <p
                        className="font-semibold text-[18px] transition-colors"
                        style={{ lineHeight: "24px", color: textPrimary }}
                    >
                        Al Dhuvor LLP
                    </p>
                    <p
                        className="mt-2 font-normal text-[15px] transition-colors"
                        style={{ lineHeight: "22px", color: textBody, opacity: 0.85 }}
                    >
                        {SITE.address}
                        <br />
                        LLPIN: AAR-9587 &nbsp;·&nbsp; GSTIN: {SITE.gstin}
                        <br />
                        {SITE.email} &nbsp;·&nbsp; {SITE.phone.display}
                    </p>
                    <p
                        className="mt-3 font-normal text-[13px] transition-colors"
                        style={{ color: textBody, opacity: 0.6 }}
                    >
                        Last updated: July 10, 2026
                    </p>
                </section>

                {/* Who We Are */}
                <section className="mt-10">
                    <h2
                        className="not-italic text-[28px] md:text-[40px] transition-colors"
                        style={{ fontWeight: 600, lineHeight: "1.35", color: textPrimary }}
                    >
                        Who We Are
                    </h2>
                    <p
                        className="mt-6 font-normal text-[18px] transition-colors"
                        style={{ lineHeight: "24px", color: textBody }}
                    >
                        thehookahstore.in is operated by Al Dhuvor LLP, a Limited Liability Partnership incorporated in India in 2020 and based in Chennai, Tamil Nadu. We exist for one reason: to bring transparency, authenticity, and reliable standards to the online hookah and shisha market in India.
                    </p>
                    <p
                        className="mt-6 font-normal text-[18px] transition-colors"
                        style={{ lineHeight: "24px", color: textBody }}
                    >
                        We sell only to adults aged 21 and above. This is our own voluntary company policy, set above the legal minimum age of 18 prescribed under COTPA 2003, because we believe responsible retailing means going further than the law requires. Age and identity verification is required at account creation and at the point of purchase.
                    </p>
                </section>

                {/* Born in 2020 */}
                <section className="mt-4">
                    <h2
                        className="not-italic text-[28px] md:text-[40px] transition-colors"
                        style={{ fontWeight: 600, lineHeight: "1.35", color: textPrimary }}
                    >
                        Born in 2020: Organising the Market
                    </h2>
                    <p
                        className="mt-6 font-normal text-[18px] transition-colors"
                        style={{ lineHeight: "24px", color: textBody }}
                    >
                        Our journey began during the disruptions of the COVID-19 pandemic, when the problems with India&#39;s hookah supply chain became impossible to ignore: counterfeit products, inconsistent quality, no price transparency, and no accountable seller to turn to when something went wrong.
                    </p>
                    <p
                        className="mt-6 font-normal text-[18px] transition-colors"
                        style={{ lineHeight: "24px", color: textBody }}
                    >
                        Al Dhuvor LLP was incorporated to address exactly this. Our mission from day one has been to replace a fragmented, unorganised market with a structured, legally compliant online marketplace that adult customers and lounge operators can genuinely rely on.
                    </p>
                </section>

                {/* Authorised Distributors */}
                <section className="mt-4">
                    <h2
                        className="not-italic text-[28px] md:text-[40px] transition-colors"
                        style={{ fontWeight: 600, lineHeight: "1.35", color: textPrimary }}
                    >
                        Authorised Distributors and Verified Brands
                    </h2>
                    <p
                        className="mt-6 font-normal text-[18px] transition-colors"
                        style={{ lineHeight: "24px", color: textBody }}
                    >
                        We are authorised distributors of{" "}
                        <Link href="/brand/al-fakher" className="underline decoration-solid [text-decoration-skip-ink:none] hover:opacity-80 transition-opacity">Al Fakher</Link>
                        {" "}and Afzal, two of the most widely recognised shisha brands in the world. Working directly with these manufacturers means no intermediaries, no substitutions, and no uncertainty about what you are receiving.
                    </p>
                    <p
                        className="mt-6 font-normal text-[18px] transition-colors"
                        style={{ lineHeight: "24px", color: textBody }}
                    >
                        We also carry a curated selection of other established brands, including Mya, Royal, Qehwa, and more, sourced as an authorised retailer through legitimate, verified wholesale channels within India. Every product on our site, regardless of brand, is procured through traceable supply chains and is genuine.
                    </p>
                </section>

                {/* Curated Products */}
                <section className="mt-4">
                    <h2
                        className="not-italic text-[28px] md:text-[40px] transition-colors"
                        style={{ fontWeight: 600, lineHeight: "1.35", color: textPrimary }}
                    >
                        Curated Products, Verified Quality
                    </h2>
                    <p
                        className="mt-6 font-normal text-[18px] transition-colors"
                        style={{ lineHeight: "24px", color: textBody }}
                    >
                        Every product we carry, from hookah pipes and bowls to hoses, charcoal, accessories, and tobacco, is selected against consistent quality criteria. We do not list products we cannot stand behind. If a product does not meet our standards, it does not appear on this site.
                    </p>
                </section>

                {/* Images */}
                <div className="mt-24 flex flex-col md:flex-row gap-10 md:gap-6">
                    <div className="flex-1 rounded-[12px] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imgAboutus01}
                            alt="A man and a woman sit on a couch, smoking hookah. Smoke billows around them, with a cozy atmosphere and dim lighting."
                            className="w-full h-[201px] md:h-[245px] xl:h-[223px] object-cover rounded-[12px]"
                        />
                    </div>
                    <div className="flex-1 rounded-[12px] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imgAboutus02}
                            alt="A person is preparing shisha tobacco from a box labeled Alfakher Two Apples Flavour, using a fork to scoop it from a small bowl."
                            className="w-full h-[201px] md:h-[245px] xl:h-[223px] object-cover rounded-[12px]"
                        />
                    </div>
                </div>

                {/* Serving Customers and Businesses Across India */}
                <section className="mt-16">
                    <h2
                        className="not-italic text-[28px] md:text-[40px] transition-colors"
                        style={{ fontWeight: 600, lineHeight: "1.35", color: textPrimary }}
                    >
                        Serving Customers and Businesses Across India
                    </h2>
                    <p
                        className="mt-6 font-normal text-[18px] transition-colors"
                        style={{ lineHeight: "24px", color: textBody }}
                    >
                        From Chennai, we ship nationwide to individual adult customers and commercial lounge operators alike. Whether you are setting up your first home kit or managing regular stock for a high-volume venue, our team is available to help you find what you need and ensure it reaches you reliably.
                    </p>
                    <p
                        className="mt-6 font-normal text-[18px] transition-colors"
                        style={{ lineHeight: "24px", color: textBody }}
                    >
                        All deliveries containing tobacco products require the recipient to present valid photo ID confirming they are 21 or above. Our delivery partners are instructed not to hand over parcels where this cannot be confirmed.
                    </p>
                </section>

                {/* Compliance and Trust */}
                <section className="mt-4">
                    <h2
                        className="not-italic text-[28px] md:text-[40px] transition-colors"
                        style={{ fontWeight: 600, lineHeight: "1.35", color: textPrimary }}
                    >
                        Compliance and Trust
                    </h2>
                    <p
                        className="mt-6 font-normal text-[18px] transition-colors"
                        style={{ lineHeight: "24px", color: textBody }}
                    >
                        We operate under Indian e-commerce law, including the Consumer Protection (E-Commerce) Rules 2020. All purchases are issued GST-compliant tax invoices. Our checkout is encrypted and processed through licensed payment gateways.
                    </p>
                    <p
                        className="mt-6 font-normal text-[18px] transition-colors"
                        style={{ lineHeight: "24px", color: textBody }}
                    >
                        Our voluntary 21+ age policy reflects our commitment to responsible retailing. The legal minimum under COTPA 2003 is 18 years; we hold ourselves to a higher standard. Age verification is not a checkbox; it is a real requirement enforced at account creation, checkout, and delivery.
                    </p>
                    <p
                        className="mt-6 font-normal text-[18px] transition-colors"
                        style={{ lineHeight: "24px", color: textBody }}
                    >
                        Tobacco is a regulated, age-restricted product. We take that responsibility seriously: in our sourcing, our verification processes, and our obligations as a registered Indian business.
                    </p>
                </section>

                {/* Closing company info */}
                <section
                    className="mt-16 pt-8"
                    style={{ borderTop: `1px solid ${borderColor}`, transition: "border-color 200ms" }}
                >
                    <p
                        className="font-semibold text-[16px] transition-colors"
                        style={{ lineHeight: "22px", color: textPrimary }}
                    >
                        Al Dhuvor LLP &nbsp;·&nbsp; LLPIN: AAR-9587 &nbsp;·&nbsp; GSTIN: {SITE.gstin}
                    </p>
                    <p
                        className="mt-2 font-normal text-[14px] transition-colors"
                        style={{ lineHeight: "20px", color: textBody, opacity: 0.75 }}
                    >
                        {SITE.address}
                    </p>
                    <p
                        className="mt-2 font-normal text-[14px] transition-colors"
                        style={{ lineHeight: "20px", color: textBody, opacity: 0.75 }}
                    >
                        {SITE.email} &nbsp;·&nbsp; {SITE.phone.display}
                    </p>
                </section>

            </div>
        </main>
    );
}
