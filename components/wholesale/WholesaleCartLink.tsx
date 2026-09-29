'use client';

/**
 * Wholesale header cart icon → wholesale cart page, with item-count badge.
 * Shared by the desktop, tablet and mobile wholesale headers.
 */

import Link from 'next/link';
import { useCart } from '../providers/CartProvider';
import { useWholesaleHref } from '../../lib/config/use-wholesale-path';

export default function WholesaleCartLink({ iconColor, size = 'md' }: { iconColor: string; size?: 'sm' | 'md' }) {
    const { getCartCount } = useCart();
    const cartCount = getCartCount();
    const href = useWholesaleHref();
    const icon = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

    return (
        <Link
            href={href('/cart')}
            aria-label={`Wholesale cart, ${cartCount} items`}
            className={`relative transition-colors duration-200 ${iconColor}`}
        >
            <svg className={icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#cd142c] text-white text-[10px] font-montserrat font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-[0_0_8px_rgba(205,20,44,0.6)]">
                    {cartCount}
                </span>
            )}
        </Link>
    );
}
