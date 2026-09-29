'use client';

/**
 * MarqueeBar
 *
 * Renders a single scrolling gold marquee strip.
 * Shown only on homepage (retail or wholesale). Not in the header — rendered
 * directly in the page component so it appears only on that one page.
 * Scrolls continuously — never pauses on hover. Reduced-motion users get a
 * slower scroll rather than a stopped one.
 */

import { useTheme } from '../providers/ThemeProvider';

interface Props {
    text: string;
    animationId?: string; // unique CSS animation name to avoid conflicts
}

export default function MarqueeBar({ text, animationId = 'page-marquee' }: Props) {
    const { dark } = useTheme();

    return (
        <div
            className="hidden lg:block w-full overflow-hidden"
            style={{
                backgroundColor: dark ? '#111111' : '#fafaf8',
                borderBottom: dark ? '1px solid #2a2a2a' : '1px solid #e8e4dc',
                padding: '9px 0',
            }}
        >
            <style>{`
                @keyframes ${animationId} {
                    0%   { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .${animationId}-track {
                    display: flex;
                    width: max-content;
                    animation: ${animationId} 28s linear infinite;
                }
                @media (prefers-reduced-motion: reduce) {
                    .${animationId}-track { animation-duration: 90s; }
                }
            `}</style>
            <div
                className={`${animationId}-track`}
            >
                {[0, 1].map((n) => (
                    <span
                        key={n}
                        style={{
                            fontFamily: "var(--font-montserrat), sans-serif",
                            fontStyle: 'italic',
                            fontWeight: 600,
                            fontSize: '12px',
                            letterSpacing: '0.12em',
                            textTransform: 'uppercase',
                            color: '#B8860B',
                            whiteSpace: 'nowrap',
                            paddingRight: '80px',
                        }}
                    >
                        {text}
                    </span>
                ))}
            </div>
        </div>
    );
}
