'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../../providers/CartProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import LiveSearch from '../../search/LiveSearch';
import SiteLogo from '../SiteLogo';

function ThemeToggle() {
    const { dark, toggleDark } = useTheme();
    return (
        <button
            type="button"
            onClick={toggleDark}
            aria-label="Toggle theme"
            className={`relative inline-flex h-[28px] w-[56px] flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none ${dark ? 'bg-[#1a1a1a] border-[#444]' : 'bg-[#C8C8C8] border-[#C8C8C8]'
                }`}
        >
            <span
                className={`pointer-events-none inline-block h-[20px] w-[20px] rounded-full bg-white shadow transform transition-transform duration-200 mt-[2px] ml-[2px] ${dark ? 'translate-x-[26px]' : 'translate-x-0'
                    }`}
            />
            <span className={`absolute left-[6px] top-1/2 -translate-y-1/2 text-[10px] font-semibold select-none ${dark ? 'text-transparent' : 'text-[#555]'}`}>☀</span>
            <span className={`absolute right-[6px] top-1/2 -translate-y-1/2 text-[10px] font-semibold select-none ${dark ? 'text-white/70' : 'text-transparent'}`}>☾</span>
        </button>
    );
}

export default function HeaderTablet({ onCartOpen }: { onCartOpen?: () => void }) {
    const { getCartCount } = useCart();
    const cartCount = getCartCount();
    const { dark } = useTheme();
    const { role } = useAuth();
    const pathname = usePathname();
    void pathname;
    const iconColor = dark ? 'text-white' : 'text-[#101114]';
    const isGuest = role === 'not_approved' || role === 'loading';

    return (
        <div
            className="w-full py-8 transition-colors duration-200"
            style={{
                paddingLeft: '10px',
                paddingRight: '24px',
            }}
        >
            <div className="grid grid-cols-3 items-center gap-4">
                {/* Left: Search Box */}
                <LiveSearch
                    mode="consumer"
                    placeholder="Search..."
                    inputClassName={`w-full h-full bg-transparent text-[18px] font-montserrat font-normal focus:outline-none transition-colors rounded-[6px] pl-6 pr-14 ${dark
                        ? 'text-white placeholder:text-white/60 border border-[#5C5C5C]'
                        : 'text-[#101114] placeholder:text-[#101114]/50 border border-[#d7d8db]'
                        }`}
                    className="w-[180px] h-[52px]"
                />

                {/* Center: Site Title */}
                <div className="flex justify-center">
                    <Link href="/" className="focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded">
                        <SiteLogo dark={dark} size="md" />
                    </Link>
                </div>

                {/* Right: Toggle + SHOP WHOLESALE + Icons */}
                <div className="flex items-center justify-end" style={{ gap: '16px' }}>
                    <ThemeToggle />

                    <div
                        className="flex items-center justify-center text-black font-montserrat font-semibold text-[14px] uppercase cursor-default"
                        style={{
                            width: '184.8px',
                            height: '35px',
                            minWidth: '184.8px',
                            minHeight: '35px',
                            backgroundColor: '#00EBD8',
                            borderRadius: '26px',
                            boxShadow: '0px 0px 7.2px 1px rgba(0, 235, 216, 1)',
                            flexShrink: 0,
                        }}
                    >
                        SHOP WHOLESALE
                    </div>

                    <div className="flex items-center" style={{ gap: '15px' }}>
                        <Link
                            href={isGuest ? '/login' : '/account'}
                            aria-label={isGuest ? 'Login or sign up' : 'My account'}
                            className={`transition-colors duration-200 ${iconColor}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </Link>

                        <button
                            aria-label={`Shopping cart, ${cartCount} items`}
                            className={`relative cursor-pointer transition-colors duration-200 ${iconColor} bg-transparent border-0 p-0`}
                            onClick={onCartOpen}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-[#cd142c] text-white text-[10px] font-montserrat font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-[0_0_8px_rgba(205,20,44,0.6)]">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </div>
    );
}
