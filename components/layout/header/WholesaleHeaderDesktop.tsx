'use client';

import Link from 'next/link';
import { useTheme } from '../../providers/ThemeProvider';
import LiveSearch from '../../search/LiveSearch';
import ShopConsumerButton from '../../wholesale/ShopConsumerButton';
import ThemeToggle from '../../wholesale/ThemeToggle';
import SiteLogo from '../SiteLogo';
import WholesaleCartLink from '../../wholesale/WholesaleCartLink';
import { useWholesaleHref } from '../../../lib/config/use-wholesale-path';


export default function WholesaleHeaderDesktop() {
    const { dark } = useTheme();
    const href = useWholesaleHref();
    const iconColor = dark ? 'text-white' : 'text-[#101114]';

    return (
        <div
            className="hookah-header-bg w-full py-8 transition-colors duration-200"
            style={{ paddingLeft: '124px', paddingRight: '124px' }}
        >
            <div className="grid items-center" style={{ gridTemplateColumns: 'auto 1fr auto', gap: '32px' }}>
                {/* Left: Search */}
                <LiveSearch
                    mode="wholesale"
                    placeholder="Search wholesale..."
                    inputClassName={`w-full h-full bg-transparent text-[18px] font-montserrat font-normal focus:outline-none transition-colors rounded-[6px] pl-6 pr-14 ${dark
                        ? 'text-white placeholder:text-white/60 border border-[#5C5C5C]'
                        : 'text-[#101114] placeholder:text-[#101114]/50 border border-[#d7d8db]'
                        }`}
                    className="w-[277px] h-[52px]"
                />

                {/* Center: Logo — links to wholesale home */}
                <div className="flex justify-center">
                    <Link href={href('/')} className="focus:outline-none focus:ring-2 focus:ring-red-500 rounded">
                        <SiteLogo dark={dark} size="lg" />
                    </Link>
                </div>

                {/* Right: Toggle + LOGIN/ACCOUNT button + Account icon */}
                <div className="flex items-center justify-end" style={{ gap: '16px' }}>
                    <ThemeToggle size="md" />

                    <ShopConsumerButton variant="header" />

                    <div className="flex items-center" style={{ gap: '15px' }}>
                        {/* Account icon */}
                        <Link
                            href={href('/account')}
                            aria-label="Wholesale account"
                            className={`transition-colors duration-200 ${iconColor}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </Link>

                        {/* Cart icon → wholesale cart page */}
                        <WholesaleCartLink iconColor={iconColor} />
                    </div>
                </div>
            </div>
        </div>
    );
}
