'use client';

/**
 * SiteLogo — pure text logo, no images.
 * Adapts color automatically for light/dark mode.
 *
 * Usage:
 *   <SiteLogo dark={dark} />                   // main logo
 *   <SiteLogo dark={dark} variant="blog" />     // blog header logo
 */

interface SiteLogoProps {
    dark: boolean;
    variant?: 'main' | 'blog';
    size?: 'sm' | 'md' | 'lg';
}

export default function SiteLogo({ dark, variant = 'main', size = 'md' }: SiteLogoProps) {
    const color = dark ? '#ffffff' : '#101114';
    const subColor = dark ? 'rgba(255,255,255,0.50)' : 'rgba(16,17,20,0.45)';

    const fontSizes = {
        sm: { sub: '8px',  main: '17px', blog: '14px', spacing: '0.22em' },
        md: { sub: '9px',  main: '22px', blog: '17px', spacing: '0.20em' },
        lg: { sub: '11px', main: '28px', blog: '21px', spacing: '0.18em' },
    };

    const fs = fontSizes[size];

    if (variant === 'blog') {
        return (
            <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: '6px', userSelect: 'none' }}>
                <span style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontWeight: 900,
                    fontSize: fs.main,
                    letterSpacing: fs.spacing,
                    color,
                    textTransform: 'uppercase',
                    lineHeight: 1,
                    transition: 'color 200ms',
                }}>
                    Hookah Store
                </span>
                <span style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontWeight: 400,
                    fontSize: fs.blog,
                    letterSpacing: '0.06em',
                    color,
                    lineHeight: 1,
                    transition: 'color 200ms',
                }}>
                    Blog
                </span>
            </span>
        );
    }

    return (
        <span style={{
            display: 'inline-flex',
            flexDirection: 'column',
            lineHeight: 1,
            userSelect: 'none',
        }}>
            <span style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontWeight: 500,
                fontSize: fs.sub,
                letterSpacing: '0.30em',
                color: subColor,
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '2px',
                transition: 'color 200ms',
            }}>
                The
            </span>
            <span style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontWeight: 900,
                fontSize: fs.main,
                letterSpacing: fs.spacing,
                color,
                textTransform: 'uppercase',
                display: 'block',
                lineHeight: 1,
                transition: 'color 200ms',
            }}>
                Hookah Store
            </span>
        </span>
    );
}
