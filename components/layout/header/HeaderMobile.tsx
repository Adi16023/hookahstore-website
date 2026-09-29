'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../../providers/CartProvider';
import { useTheme } from '../../providers/ThemeProvider';
import { useAuth } from '../../providers/AuthProvider';
import MobileMenu from '../MobileMenu';
import MobileSearchOverlay from '../MobileSearchOverlay';
import SiteLogo from '../SiteLogo';

function ThemeToggle() {
    const { dark, toggleDark } = useTheme();
    return (
        <button
            type="button"
            onClick={toggleDark}
            aria-label="Toggle theme"
            className={`relative inline-flex h-[24px] w-[48px] flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none ${dark ? 'bg-[#1a1a1a] border-[#444]' : 'bg-[#C8C8C8] border-[#C8C8C8]'
                }`}
        >
            <span
                className={`pointer-events-none inline-block h-[16px] w-[16px] rounded-full bg-white shadow transform transition-transform duration-200 mt-[2px] ml-[2px] ${dark ? 'translate-x-[22px]' : 'translate-x-0'
                    }`}
            />
            <span className={`absolute left-[4px] top-1/2 -translate-y-1/2 text-[8px] font-semibold select-none ${dark ? 'text-transparent' : 'text-[#555]'}`}>☀</span>
            <span className={`absolute right-[4px] top-1/2 -translate-y-1/2 text-[8px] font-semibold select-none ${dark ? 'text-white/70' : 'text-transparent'}`}>☾</span>
        </button>
    );
}

export default function HeaderMobile({ onCartOpen }: { onCartOpen?: () => void }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const { getCartCount } = useCart();
    const cartCount = getCartCount();
    const { dark } = useTheme();
    const { role } = useAuth();
    const pathname = usePathname();
    void pathname;
    const iconColor = dark ? 'text-white' : 'text-[#101114]';
    const isGuest = role === 'not_approved' || role === 'loading';

    return (
        <>
            {/* Mobile Header Bar */}
            <div
                className="flex items-center justify-between px-4 py-4 w-full transition-colors duration-200"
            >
                {/* Left: Hamburger + Logo */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="Open menu"
                        className={`transition-colors p-1 ${dark ? 'text-white hover:text-[#00ebd8]' : 'text-[#101114] hover:text-[#00ebd8]'}`}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <Link href="/">
                        <SiteLogo dark={dark} size="sm" />
                    </Link>
                </div>

                {/* Right: Search + User + Cart Icons */}
                <div className="flex items-center gap-4">
                    {/* Search Icon */}
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        aria-label="Search"
                        className={`transition-colors ${dark ? 'text-white hover:text-[#00ebd8]' : 'text-[#101114] hover:text-[#00ebd8]'}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" strokeWidth="2" />
                            <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>

                    {/* User/Account Icon */}
                    <Link
                        href={isGuest ? '/login' : '/account'}
                        aria-label={isGuest ? 'Login or sign up' : 'My account'}
                        className={`transition-colors duration-200 ${iconColor}`}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </Link>

                    {/* Cart Icon */}
                    <button
                        aria-label={`Shopping cart, ${cartCount} items`}
                        className={`relative cursor-pointer transition-colors duration-200 ${iconColor} bg-transparent border-0 p-0`}
                        onClick={onCartOpen}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[#cd142c] text-white text-[10px] font-montserrat font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                {cartCount}
                            </span>
                        )}
                    </button>
                    <ThemeToggle />
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

            {/* Mobile Search Overlay */}
            <MobileSearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        </>
    );
}
