'use client';

import Link from 'next/link';
import { useTheme } from '../components/providers/ThemeProvider';

export default function NotFound() {
    const { dark } = useTheme();

    const pageBg   = dark ? '#121212' : '#ffffff';
    const textPrim = dark ? '#ffffff' : '#101114';
    const textMuted = dark ? 'rgba(255,255,255,0.50)' : '#6c6d73';
    const borderCol = dark ? 'rgba(255,255,255,0.10)' : '#e8e8e8';

    const links = [
        { label: 'Hookah Flavours', href: '/category/hookah-flavours' },
        { label: 'Hookahs',         href: '/hookahs'                  },
        { label: 'Accessories',     href: '/category/hookah-accessories' },
        { label: 'Offers',          href: '/offers'                   },
    ];

    return (
        <div
            style={{
                backgroundColor: pageBg,
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px',
                fontFamily: "var(--font-montserrat), sans-serif",
                transition: 'background-color 200ms',
                textAlign: 'center',
            }}
        >
            {/* Large 404 */}
            <p
                style={{
                    fontSize: 'clamp(80px, 18vw, 160px)',
                    fontWeight: 700,
                    lineHeight: 1,
                    margin: 0,
                    background: 'linear-gradient(135deg, #CD142C 0%, #ff6b6b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-4px',
                }}
            >
                404
            </p>

            {/* Heading */}
            <h1
                style={{
                    fontSize: 'clamp(20px, 4vw, 28px)',
                    fontWeight: 600,
                    color: textPrim,
                    margin: '24px 0 12px',
                    letterSpacing: '-0.3px',
                }}
            >
                Page Not Found
            </h1>

            {/* Subtext */}
            <p
                style={{
                    fontSize: 15,
                    fontWeight: 400,
                    color: textMuted,
                    margin: '0 0 40px',
                    maxWidth: 400,
                    lineHeight: 1.6,
                }}
            >
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
                Let&apos;s get you back to the good stuff.
            </p>

            {/* Primary CTA */}
            <Link
                href="/"
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#CD142C',
                    color: '#ffffff',
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: '1.5px',
                    textTransform: 'uppercase',
                    textDecoration: 'none',
                    padding: '14px 40px',
                    borderRadius: 50,
                    boxShadow: '0 0 20px rgba(205,20,44,0.35)',
                    transition: 'opacity 150ms',
                    marginBottom: 40,
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
                Back to Home
            </Link>

            {/* Divider */}
            <div
                style={{
                    width: '100%',
                    maxWidth: 480,
                    height: 1,
                    backgroundColor: borderCol,
                    marginBottom: 32,
                }}
            />

            {/* Quick links */}
            <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: textMuted, margin: '0 0 20px' }}>
                Browse Categories
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
                {links.map(l => (
                    <Link
                        key={l.href}
                        href={l.href}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '10px 22px',
                            borderRadius: 50,
                            border: `1.5px solid ${borderCol}`,
                            fontFamily: "var(--font-montserrat), sans-serif",
                            fontWeight: 600,
                            fontSize: 13,
                            color: textPrim,
                            textDecoration: 'none',
                            transition: 'border-color 150ms, opacity 150ms',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#CD142C'; e.currentTarget.style.color = '#CD142C'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = borderCol; e.currentTarget.style.color = textPrim; }}
                    >
                        {l.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
