'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../providers/ThemeProvider';
import LiveSearch from '../../search/LiveSearch';
import MobileMenu from '../MobileMenu';
import WholesaleCartLink from '../../wholesale/WholesaleCartLink';
import { useWholesaleHref } from '../../../lib/config/use-wholesale-path';
import ShopConsumerButton from '../../wholesale/ShopConsumerButton';
import ThemeToggle from '../../wholesale/ThemeToggle';
import SiteLogo from '../SiteLogo';


export default function WholesaleHeaderTablet() {
    const { dark } = useTheme();
    const href = useWholesaleHref();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const iconColor = dark ? 'text-white' : 'text-[#101114]';

    return (
        <>
        <div
            className="hookah-header-bg w-full py-8 transition-colors duration-200"
            style={{ paddingLeft: '10px', paddingRight: '24px' }}
        >
            <div className="grid grid-cols-3 items-center gap-4">
                {/* Left: Menu (tablet has no nav bar) + Search */}
                <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setIsMenuOpen(true)}
                    aria-label="Open menu"
                    className={`transition-colors p-1 flex-shrink-0 ${dark ? 'text-white hover:text-[#cd142c]' : 'text-[#101114] hover:text-[#cd142c]'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
                <LiveSearch
                    mode="wholesale"
                    placeholder="Search wholesale..."
                    inputClassName={`w-full h-full bg-transparent text-[18px] font-montserrat font-normal focus:outline-none transition-colors rounded-[6px] pl-6 pr-14 ${dark
                        ? 'text-white placeholder:text-white/60 border border-[#5C5C5C]'
                        : 'text-[#101114] placeholder:text-[#101114]/50 border border-[#d7d8db]'
                        }`}
                    className="w-[180px] h-[52px]"
                />
                </div>

                {/* Center: Logo */}
                <div className="flex justify-center">
                    <Link href={href('/')} className="focus:outline-none focus:ring-2 focus:ring-red-500 rounded">
                        <SiteLogo dark={dark} size="md" />
                    </Link>
                </div>

                {/* Right: Toggle + LOGIN/ACCOUNT + Account icon */}
                <div className="flex items-center justify-end" style={{ gap: '16px' }}>
                    <ThemeToggle size="md" />

                    <ShopConsumerButton variant="header" />

                    <div className="flex items-center" style={{ gap: '15px' }}>
                        <Link
                            href={href('/account')}
                            aria-label="Wholesale account"
                            className={`transition-colors duration-200 ${iconColor}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </Link>

                        <WholesaleCartLink iconColor={iconColor} />
                    </div>
                </div>
            </div>
        </div>
        <MobileMenu mode="wholesale" isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    );
}
