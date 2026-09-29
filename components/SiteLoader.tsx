'use client';

/**
 * SiteLoader — slim red progress bar at the top of the page during route transitions.
 *
 * Works by:
 *  1. Listening for clicks on <a> tags pointing to internal routes → starts the bar
 *  2. Watching usePathname() → when path changes, navigation is complete → finishes the bar
 *
 * This covers client-side SPA navigation between pages.
 * Server-side loading fallback is handled by app/loading.tsx (Suspense boundary).
 */

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function SiteLoader() {
    const pathname = usePathname();
    const [active, setActive]     = useState(false);
    const [progress, setProgress] = useState(0);
    const [fading, setFading]     = useState(false);

    const prevPath  = useRef(pathname);
    const timers    = useRef<ReturnType<typeof setTimeout>[]>([]);

    const clearAll = () => { timers.current.forEach(clearTimeout); timers.current = []; };

    const schedule = (fn: () => void, ms: number) => {
        const id = setTimeout(fn, ms);
        timers.current.push(id);
    };

    /* ── Complete the bar when path changes ────────────────────────────── */
    useEffect(() => {
        if (prevPath.current === pathname) return;
        prevPath.current = pathname;

        // Jump to 100 % then fade out
        clearAll();
        setProgress(100);
        setFading(false);

        schedule(() => setFading(true),  250);
        schedule(() => { setActive(false); setProgress(0); setFading(false); }, 600);
    }, [pathname]);

    /* ── Listen for internal link clicks ───────────────────────────────── */
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const link = (e.target as HTMLElement).closest('a');
            if (!link) return;

            const href = link.getAttribute('href') ?? '';
            // Skip: external, hash-only, mailto/tel, same page, or non-navigation
            if (
                !href ||
                href.startsWith('http') ||
                href.startsWith('#')    ||
                href.startsWith('mailto') ||
                href.startsWith('tel')  ||
                href === pathname
            ) return;

            // Start progress animation
            clearAll();
            setFading(false);
            setActive(true);
            setProgress(15);

            // Simulate realistic incremental progress
            schedule(() => setProgress(35),  150);
            schedule(() => setProgress(55),  400);
            schedule(() => setProgress(72),  800);
            schedule(() => setProgress(85), 1400);
            schedule(() => setProgress(92), 2500);
            // Safety: auto-hide after 8 s in case navigation never completes
            schedule(() => { setFading(true); schedule(() => setActive(false), 350); }, 8000);
        };

        document.addEventListener('click', handleClick, true);
        return () => {
            document.removeEventListener('click', handleClick, true);
            clearAll();
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    if (!active) return null;

    return (
        <>
            {/* ── Slim progress bar ── */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: `${progress}%`,
                    height: 3,
                    background: 'linear-gradient(to right, #CD142C, #ff4545)',
                    zIndex: 9999999,
                    borderRadius: '0 2px 2px 0',
                    boxShadow: '0 0 8px rgba(205,20,44,0.6)',
                    transition: `width ${progress === 100 ? '250ms' : '600ms'} cubic-bezier(0.4,0,0.2,1),
                                 opacity 300ms ease`,
                    opacity: fading ? 0 : 1,
                    pointerEvents: 'none',
                }}
            />
            {/* ── Glow dot at leading edge ── */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: `${progress}%`,
                    width: 60,
                    height: 3,
                    background: 'linear-gradient(to right, rgba(205,20,44,0.8), transparent)',
                    zIndex: 9999999,
                    transform: 'translateX(-100%)',
                    opacity: fading ? 0 : 1,
                    transition: 'opacity 300ms ease',
                    pointerEvents: 'none',
                }}
            />
        </>
    );
}
