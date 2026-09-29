/**
 * Shared slider dimension utilities.
 *
 * Extracted from HeroSlider.tsx and ProductSlider.tsx so the layout
 * logic lives in one place and can be unit-tested independently.
 *
 * Neither function has side-effects — they are pure calculations.
 */

/* ─── Hero slider ─────────────────────────────────────────────────────────── */

export interface HeroDims {
    slideW: number;
    gap: number;
    padSide: number;
    height: number;
}

/**
 * Computes the slide width, gap, side-padding, and track height for the
 * HeroSlider based on the current viewport width.
 *
 * @param vw  Current viewport width in CSS pixels (window.innerWidth).
 */
export function computeHeroDims(vw: number): HeroDims {
    // Guard: if vw is 0 or very small (can happen during SSR or before paint),
    // fall back to a safe desktop default so the slider never renders at 0px wide.
    const safeVw = vw > 100 ? vw : 1440;
    if (safeVw >= 1025) {
        const peekVisible = 80;
        const gap = 12;
        const padSide = peekVisible + gap;
        const slideW = Math.max(600, safeVw - 2 * padSide);
        return { slideW, gap, padSide, height: 449 };
    }
    if (safeVw >= 640) {
        const peekVisible = 60;
        const gap = 10;
        const padSide = peekVisible + gap;
        const slideW = Math.max(300, safeVw - 2 * padSide);
        return { slideW, gap, padSide, height: 400 };
    }
    return { slideW: safeVw, gap: 0, padSide: 0, height: 400 };
}

/* ─── Product slider ──────────────────────────────────────────────────────── */

export interface ProductSliderDims {
    cardW: number;
    cardH: number;
    gap: number;
    padLeft: number;
    padRight: number;
    visibleCards: number;
    hasPeek: boolean;
    arrowRight: number;
}

/**
 * Computes the card dimensions, gap, padding, and arrow position for the
 * ProductSlider.
 *
 * @param containerW  Actual rendered width of the ps-outer element.
 * @param vw          Current viewport width (window.innerWidth) — used only
 *                    for breakpoint thresholds.
 */
export function computeDims(containerW: number, vw: number): ProductSliderDims {
    if (vw >= 1025) {
        // Desktop: 5 cards visible, 5th card's last 10px clipped off the right edge.
        const cardW = 295, cardH = 510, gap = 24, padLeft = 40, padRight = 0, visibleCards = 5;
        const arrowRight = 120;
        return { cardW, cardH, gap, padLeft, padRight, visibleCards, hasPeek: false, arrowRight };
    }
    if (vw >= 640) {
        // Tablet (640–1024px): exactly 3 fixed cards.
        const cardW = 295, cardH = 510, visibleCards = 3;
        const targetW = 957; // 3 cards + natural gaps & padding
        const availableW = Math.min(vw, targetW);
        const shortage = targetW - availableW;

        const padLeft = Math.max(12, 16 - shortage * 0.15);
        const padRight = padLeft;
        const gap = (availableW - visibleCards * cardW - padLeft - padRight) / (visibleCards - 1);
        const arrowRight = vw < targetW ? 4 : -22;

        return { cardW, cardH, gap, padLeft, padRight, visibleCards, hasPeek: false, arrowRight };
    }
    // Mobile (<640px): fixed 295×510 cards + 10px peek of next card.
    const cardW = 295, cardH = 510, padLeft = 16, padRight = 0, gap = 24, visibleCards = 1;
    return { cardW, cardH, gap, padLeft, padRight, visibleCards, hasPeek: true, arrowRight: -17 };
}
