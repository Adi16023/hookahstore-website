'use client';

import { useState } from 'react';
import Link from 'next/link';
import SiteLogo from '../layout/SiteLogo';
import { SITE, LEGAL_LINES } from '../../lib/config/site';

const imgLogoFooter = "/blog/4531da30b9fe9ea74ba24505d02e7368aca6863a.png";
const imgInstagram = "/blog/d9dc893b7f59efe71f8f12ee8c5d0740b17e9e00.png";
const imgYouTube = "/blog/a97fe6e7c0186e03cb96e152417636a38fc5a843.png";

export default function BlogFooter() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubscribe = async () => {
        if (!email.trim()) return;
        setStatus('loading');
        try {
            const res = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await res.json() as { success?: boolean; error?: string };
            if (data.success) {
                setStatus('success');
                setMessage('You\'re subscribed!');
                setEmail('');
            } else {
                setStatus('error');
                setMessage(data.error ?? 'Something went wrong.');
            }
        } catch {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        }
    };

    return (
        <footer className="bg-[#000000]" style={{ minHeight: "467px" }}>
            <div className="max-w-[1425px] mx-auto px-4 md:px-6 lg:px-[64.5px] pt-[64px] pb-[40px]">
                {/* Top: Logo + Nav + Newsletter */}
                <div className="flex flex-col lg:flex-row gap-10 lg:gap-0">
                    {/* Logo */}
                    <div className="flex-shrink-0 lg:w-[290px] mb-6 lg:mb-0">
                        <SiteLogo dark={true} variant="blog" size="md" />
                    </div>

                    {/* Nav columns */}
                    <div className="flex flex-wrap gap-10 lg:gap-0 flex-1">
                        {/* Blog */}
                        <div className="min-w-[130px] lg:flex-1">
                            <p className="font-montserrat font-semibold text-white text-[14px] uppercase mb-5 tracking-normal">
                                Blog
                            </p>
                            <ul className="space-y-[22px]">
                                {[
                                    { label: "General", href: "/blog/category/general" },
                                    { label: "How-To", href: "/blog/category/how-to-hookah-education" },
                                    { label: "Accessories", href: "/blog/category/hookah-accessories" },
                                    { label: "Tobacco", href: "/blog/category/shisha-tobacco" },
                                    { label: "Hookahs", href: "/blog/category/hookahs" },
                                    { label: "Business", href: "/blog/category/hookah-blog-for-business" },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="font-montserrat text-[#d6d6d6] text-[14px] leading-[20px] hover:text-white transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Shop */}
                        <div className="min-w-[130px] lg:flex-1">
                            <p className="font-montserrat font-semibold text-white text-[14px] uppercase mb-5">
                                Shop
                            </p>
                            <ul className="space-y-[22px]">
                                {[
                                    { label: "Hookahs", href: "/" },
                                    { label: "Shisha Tobacco", href: "/" },
                                    { label: "OOKA", href: "/" },
                                    { label: "Hookah Accessories", href: "/" },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="font-montserrat text-[#d6d6d6] text-[14px] leading-[20px] hover:text-white transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* About */}
                        <div className="min-w-[130px] lg:flex-1">
                            <p className="font-montserrat font-semibold text-white text-[14px] uppercase mb-5">
                                About
                            </p>
                            <ul className="space-y-[22px]">
                                {[
                                    { label: "About Us", href: "/about" },
                                ].map((item) => (
                                    <li key={item.label}>
                                        <Link
                                            href={item.href}
                                            className="font-montserrat text-[#d6d6d6] text-[14px] leading-[20px] hover:text-white transition-colors"
                                        >
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Newsletter */}
                    <div className="lg:w-[297px] lg:ml-10 flex-shrink-0">
                        <p className="font-montserrat font-semibold text-white text-[14px] uppercase mb-8 tracking-normal">
                            Subscribe to our newsletter
                        </p>
                        {/* Email input with embedded button */}
                        <div className="relative">
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setStatus('idle'); }}
                                onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                                disabled={status === 'loading' || status === 'success'}
                                className="w-full bg-white border border-[#bcbec4] rounded-[8px] font-montserrat text-[#6c6d73] text-[16px] outline-none disabled:opacity-60"
                                style={{ height: "58px", paddingLeft: "16px", paddingRight: "110px" }}
                            />
                            <button
                                onClick={handleSubscribe}
                                disabled={status === 'loading' || status === 'success'}
                                className="absolute right-4 top-1/2 -translate-y-1/2 font-montserrat font-semibold text-[14px] text-[#7a6336] uppercase tracking-[1px] disabled:opacity-50 cursor-pointer"
                            >
                                {status === 'loading' ? '...' : status === 'success' ? 'Done!' : 'Subscribe'}
                            </button>
                        </div>
                        {message && (
                            <p className={`font-montserrat text-[12px] leading-[16px] mt-2 ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                {message}
                            </p>
                        )}
                        <p className="font-montserrat text-[#999ba3] text-[12px] leading-[16px] mt-3">
                            Get the latest offers, exclusive deals and new product announcements!
                        </p>

                        {/* Follow Us */}
                        <div className="mt-8">
                            <p className="font-montserrat font-semibold text-white text-[14px] uppercase mb-4">
                                Follow Us
                            </p>
                            <div className="flex items-center gap-4">
                                <a href={SITE.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-[20px] h-[20px] block">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={imgInstagram}
                                        alt="Instagram"
                                        width={20}
                                        height={20}
                                        className="block"
                                        style={{ filter: "grayscale(1) brightness(10)" }}
                                    />
                                </a>
                                {/* YouTube icon only renders once a real channel URL is set in lib/config/site.ts */}
                                {SITE.social.youtube && (
                                    <a href={SITE.social.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-[20px] h-[20px] block">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={imgYouTube}
                                            alt="YouTube"
                                            width={20}
                                            height={20}
                                            className="block"
                                            style={{ filter: "grayscale(1) brightness(10)" }}
                                        />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Horizontal Divider */}
                <div className="mt-[56px] mb-6 h-px bg-[#292929]" />

                {/* Bottom row */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/terms-and-conditions"
                            className="font-montserrat text-[#9c9ea3] text-[12px] leading-[16px] hover:text-white transition-colors"
                        >
                            Terms of Use
                        </Link>
                        <Link
                            href="/privacy-policy"
                            className="font-montserrat text-[#9c9ea3] text-[12px] leading-[16px] hover:text-white transition-colors"
                        >
                            Privacy Policy
                        </Link>
                    </div>
                    <div className="flex flex-col gap-1 md:items-end">
                        {LEGAL_LINES.map((line) => (
                            <p key={line} className="font-montserrat text-[#9c9ea3] text-[12px] leading-[16px] m-0 md:text-right">
                                {line}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
