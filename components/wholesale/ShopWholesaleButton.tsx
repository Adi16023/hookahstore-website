'use client';

/**
 * ShopWholesaleButton
 *
 * Reads auth role from shared AuthProvider — NO network requests here.
 * Routing (always the wholesale subdomain, never thehookahstore.in/wholesale):
 *   Approved wholesale_customer → wholesale.thehookahstore.in/account
 *   Everyone else               → wholesale.thehookahstore.in (new tab; prices gated)
 */

import { useAuth } from '../providers/AuthProvider';
import { getWholesaleUrl } from '../../lib/config';

type Variant = 'header' | 'banner';

interface Props {
    variant?: Variant;
}

const STYLES: Record<Variant, React.CSSProperties> = {
    header: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '184.8px',
        height: '35px',
        minWidth: '184.8px',
        minHeight: '35px',
        backgroundColor: '#00EBD8',
        borderRadius: '26px',
        boxShadow: '0px 0px 7.2px 1px rgba(0,235,216,1)',
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 600,
        fontSize: '14px',
        textTransform: 'uppercase',
        color: '#000000',
        textDecoration: 'none',
        flexShrink: 0,
        transition: 'opacity 150ms',
        letterSpacing: '0.04em',
    },
    banner: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        fontFamily: "var(--font-montserrat), sans-serif",
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#003d38',
        backgroundColor: '#00EBD8',
        padding: '14px 40px',
        borderRadius: 50,
        textDecoration: 'none',
        boxShadow: '0 0 24px rgba(0,235,216,0.45)',
        position: 'relative',
        transition: 'opacity 150ms',
    },
};

export default function ShopWholesaleButton({ variant = 'banner' }: Props) {
    const { role } = useAuth();
    const href = role === 'wholesale_customer' ? getWholesaleUrl('/account') : getWholesaleUrl('/');

    return (
        <a
            href={href}
            target={role !== 'wholesale_customer' ? '_blank' : undefined}
            rel={role !== 'wholesale_customer' ? 'noopener noreferrer' : undefined}
            style={STYLES[variant]}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
        >
            Shop Wholesale
            {variant === 'banner' && (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                        d="M3 8h10M9 4l4 4-4 4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </a>
    );
}
