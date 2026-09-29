'use client';

import { useState } from 'react';
import HeaderDesktop from './header/HeaderDesktop';
import HeaderTablet from './header/HeaderTablet';
import HeaderMobile from './header/HeaderMobile';
import CartSidebar from '../cart/CartSidebar';

export default function HeaderTopBar() {
    const [cartOpen, setCartOpen] = useState(false);
    return (
        <div className="w-full">
            {/* Desktop (≥1024px) — scrolls inside the sticky header */}
            <div className="hidden lg:block">
                <HeaderDesktop onCartOpen={() => setCartOpen(true)} />
            </div>

            {/* Tablet (768px–1023px) */}
            <div className="hidden md:block lg:hidden hookah-header-bg transition-colors duration-200">
                <HeaderTablet onCartOpen={() => setCartOpen(true)} />
            </div>

            {/* Mobile (<768px) */}
            <div className="md:hidden hookah-header-bg transition-colors duration-200">
                <HeaderMobile onCartOpen={() => setCartOpen(true)} />
            </div>

            <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
        </div>
    );
}
