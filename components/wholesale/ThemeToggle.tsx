'use client';

/**
 * Shared ThemeToggle for all wholesale header breakpoints.
 *
 * Uses suppressHydrationWarning so the SSR-rendered toggle (always dark=false)
 * does not produce a React hydration mismatch warning when the client-side
 * ThemeProvider reads data-dark from <html> and sets dark=true.
 *
 * Visual fix: the toggle starts as the blocking-script's data-dark value rather
 * than the SSR default, eliminating the white-flash on dark-mode pages.
 */

import { useTheme } from '../providers/ThemeProvider';

interface Props {
    /** sm = 24×48  (mobile),  md = 28×56  (tablet/desktop) */
    size?: 'sm' | 'md';
}

export default function ThemeToggle({ size = 'md' }: Props) {
    const { dark, toggleDark } = useTheme();

    const h  = size === 'sm' ? 24 : 28;
    const w  = size === 'sm' ? 48 : 56;
    const tw = size === 'sm' ? 16 : 20;
    const translateOn = size === 'sm' ? 22 : 26;
    const iconPad    = size === 'sm' ? 4  : 6;
    const iconSize   = size === 'sm' ? 8  : 10;

    return (
        <button
            type="button"
            onClick={toggleDark}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            suppressHydrationWarning
            style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                height: `${h}px`,
                width:  `${w}px`,
                flexShrink: 0,
                cursor:  'pointer',
                borderRadius: '9999px',
                border:  `2px solid ${dark ? '#444' : '#C8C8C8'}`,
                backgroundColor: dark ? '#1a1a1a' : '#C8C8C8',
                transition: 'background-color 200ms, border-color 200ms',
                outline: 'none',
            }}
        >
            {/* Thumb */}
            <span
                suppressHydrationWarning
                style={{
                    pointerEvents: 'none',
                    display: 'inline-block',
                    height: `${tw}px`,
                    width:  `${tw}px`,
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    transform: dark ? `translateX(${translateOn}px)` : 'translateX(2px)',
                    transition: 'transform 200ms',
                    marginLeft: '2px',
                }}
            />
            {/* Sun icon — left, visible in light mode */}
            <span
                suppressHydrationWarning
                style={{
                    position: 'absolute',
                    left: `${iconPad}px`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: `${iconSize}px`,
                    fontWeight: 600,
                    userSelect: 'none',
                    color: dark ? 'transparent' : '#555',
                    transition: 'color 200ms',
                }}
            >☀</span>
            {/* Moon icon — right, visible in dark mode */}
            <span
                suppressHydrationWarning
                style={{
                    position: 'absolute',
                    right: `${iconPad}px`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    fontSize: `${iconSize}px`,
                    fontWeight: 600,
                    userSelect: 'none',
                    color: dark ? 'rgba(255,255,255,0.7)' : 'transparent',
                    transition: 'color 200ms',
                }}
            >☾</span>
        </button>
    );
}
