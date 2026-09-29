'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../providers/ThemeProvider';
import MobileMenu from '../MobileMenu';
import MobileSearchOverlay from '../MobileSearchOverlay';
import ThemeToggle from '../../wholesale/ThemeToggle';
import SiteLogo from '../SiteLogo';
import WholesaleCartLink from '../../wholesale/WholesaleCartLink';
import { useWholesaleHref } from '../../../lib/config/use-wholesale-path';


export default function WholesaleHeaderMobile() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { dark } = useTheme();
    const href = useWholesaleHref();
    const iconColor = dark ? 'text-white' : 'text-[#101114]';

    return (
        <>
            <div className="hookah-header-bg flex items-center justify-between px-4 py-4 w-full transition-colors duration-200">
                {/* Left: Hamburger + Logo */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Open menu"
                        className={`transition-colors p-1 ${dark ? 'text-white hover:text-[#cd142c]' : 'text-[#101114] hover:text-[#cd142c]'}`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <Link href={href('/')}>
                        <SiteLogo dark={dark} size="sm" />
                    </Link>
                </div>

                {/* Right: Search + Account + Theme */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        aria-label="Search"
                        className={`transition-colors ${dark ? 'text-white hover:text-[#cd142c]' : 'text-[#101114] hover:text-[#cd142c]'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" strokeWidth="2" />
                            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>

                    <Link
                        href={href('/account')}
                        aria-label="Wholesale account"
                        className={`transition-colors duration-200 ${iconColor}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </Link>

                    <WholesaleCartLink iconColor={iconColor} size="sm" />

                    <ThemeToggle size="sm" />
                </div>
            </div>

            <MobileMenu mode="wholesale" isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
            <MobileSearchOverlay mode="wholesale" isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
