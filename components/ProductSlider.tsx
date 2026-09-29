'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { HomepageProduct } from '../lib/graphql';
import { usePathname } from 'next/navigation';
import ProductCard from './ProductCard';
import { computeDims } from '../lib/utils/slider-dims';
import { getBadge } from '../lib/utils/badges';
import { buildVariationMaps, pickSizeAttribute, isInStock } from '../lib/utils/variations';

// Use the shared HomepageProduct type from lib/graphql.
// Aliased locally as Product so all internal card-rendering code is unchanged.
type Product = HomepageProduct;

// Card box-shadow bleed: 0 0 8px 2px → max bleed = 10px on every side.
// The left gutter (padding-left on the track) is larger than this so the
// left shadow is never clipped by the section's overflow-x:clip boundary.
// ──────────────────────────────────────────────────────────────────────────

interface ProductSliderProps {
    /** Products fetched server-side and passed as a prop. */
    products: Product[];
    /** Override the accent colour (border glow, badge, arrow). Default: #CD142C */
    accentColor?: string;
    /** Override Add to Cart button color. Defaults to accentColor. */
    buttonColor?: string;
    /** Product image width in px. Default 168. */
    imageWidth?: number;
    /** Product image height in px. Default 168. */
    imageHeight?: number;
    /** If provided, "VIEW MORE" becomes a link to this URL. */
    viewMoreHref?: string;
    /** Force wholesale mode on all child ProductCards (needed on wholesale domain). */
    forceWholesale?: boolean;
}

export default function ProductSlider({ products, accentColor = '#CD142C', buttonColor, imageWidth = 168, imageHeight = 168, viewMoreHref, forceWholesale = false }: ProductSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const outerRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const isWholesale = forceWholesale || (pathname?.startsWith('/wholesale') ?? false);
    const [dims, setDims] = useState(() => {
        const vw = typeof window !== 'undefined' ? window.innerWidth : 1440;
        return computeDims(vw, vw); // best-guess until ResizeObserver fires
    });

    // ResizeObserver measures the actual container width (handles parent max-width/padding).
    // Falls back to window.innerWidth for the breakpoint threshold.
    useEffect(() => {
        const update = () => {
            const containerW = outerRef.current?.offsetWidth ?? window.innerWidth;
            setDims(computeDims(containerW, window.innerWidth));
        };
        const observer = new ResizeObserver(update);
        if (outerRef.current) observer.observe(outerRef.current);
        update(); // immediate first measurement
        return () => observer.disconnect();
    }, []);

    // Reset scroll index when breakpoint changes
    useEffect(() => { setCurrentIndex(0); }, [dims]);

    const { cardW, cardH, gap, padLeft, padRight, visibleCards, hasPeek, arrowRight } = dims;
    const step = cardW + gap;
    const maxIndex = Math.max(0, products.length - visibleCards + 1);
    const isAtEnd = currentIndex >= maxIndex;
    const next = () => setCurrentIndex(i => Math.min(i + 1, maxIndex));
    const prev = () => setCurrentIndex(i => Math.max(i - 1, 0));

    // Touch swipe support (mobile only — desktop/tablet use the arrow button)
    const touchStartX = useRef<number | null>(null);
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStartX.current === null) return;
        const delta = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(delta) > 50) {
            if (delta < 0) next();   // swipe left → next card
            else prev();             // swipe right → previous card
        }
        touchStartX.current = null;
    };

    // Always render ALL products — the overflow-x:clip container handles clipping.
    // Previously we sliced to visibleCards+1 which prevented mobile from reaching card 3+.
    const makeCards = () => products.map(product => {
        // One shared rule for badges: ACF ribbon first, then product tags
        const badge = getBadge({ ribbon: product.productRibbon, tags: product.productTags?.nodes });

        const desc = product.description
            ? product.description.replace(/<[^>]*>/g, '').substring(0, 100) + '...'
            : 'Premium hookah tobacco';

        // Only show variation pills for variable products (those with actual variation nodes)
        const hasVariations = (product.variations?.nodes?.length ?? 0) > 0;
        const variations: string[] = hasVariations
            ? (pickSizeAttribute(product.attributes?.nodes)?.options ?? [])
            : [];

        // Exact attribute matching ("50g" never matches "250g") → price, variation ID, availability
        const { prices: varPrices, ids: varIds, available: varAvailable } =
            buildVariationMaps(variations, product.variations?.nodes);

        return (
            <ProductCard
                key={product.id}
                productId={product.databaseId}
                image={product.image?.sourceUrl || '/placeholder-product.png'}
                title={product.name}
                description={desc}
                price={isWholesale ? '' : (product.price || '₹0.00')}
                variations={variations}
                variationPrices={varPrices}
                variationIds={varIds}
                variationAvailable={isWholesale ? undefined : varAvailable}
                inStock={isInStock(product.stockStatus)}
                badge={badge}
                cardWidth={cardW}
                cardHeight={cardH}
                accentColor={accentColor}
                buttonColor={buttonColor}
                imageWidth={imageWidth}
                imageHeight={imageHeight}
                href={product.slug
                    ? (isWholesale ? `/wholesale/product/${product.slug}` : `/product/${product.slug}`)
                    : undefined}
                forceWholesale={forceWholesale}
            />
        );
    });

    // Products are pre-fetched server-side — no loading state needed.
    // Render an empty state gracefully if WordPress returns zero products.
    if (!products.length) return (
        <div className="py-20 text-center">
            <p className="font-montserrat text-lg" style={{ color: 'var(--clr-text-muted)' }}>No products found</p>
        </div>
    );

    return (
        <>
            {/*
             * ─── WHY overflow-x:clip (not overflow:hidden) ──────────────────
             *
             * overflow:hidden on a container creates a Block Formatting Context (BFC).
             * A BFC forces overflow-y to be "auto" even if you set overflow-y:visible.
             * That means top/bottom box-shadows get hard-clipped at the container edge,
             * creating the "red glow cut at bottom" bug.
             *
             * overflow-x:clip does NOT create a BFC.
             * overflow-y stays truly "visible" — shadows breathe above and below freely.
             * Content is still clipped at the horizontal edges.
             *
             * ─── WHY no inner fixed-width viewport ──────────────────────────
             *
             * MacBook Air M2 has a 1280px CSS viewport.
             * A fixed 1324px inner viewport + 60px left margin = 1384px total.
             * 1384px > 1280px → the browser clips the whole right side of the
             * viewport box, showing a sliver of card 5 and dead space.
             *
             * Solution: ps-outer (full viewport width) is the clip container.
             * The screen edge IS the right clip boundary.
             * Card 5 is naturally half-visible because the screen ends there.
             *
             * On MacBook Air M2 (1280px) with 40px left padding:
             *   Card 5 starts at 40 + 4×281 = 1164px
             *   Visible from 1164 to 1280 = 116px ≈ 45% of card — clear peek ✅
             *
             * Left shadow safety:
             *   Card 1 left edge at 40px, shadow extends to 30px from page left.
             *   Section clip boundary is at 0px (page left).
             *   30px > 0px → shadow is NOT clipped. ✅
             */}
            <style>{`
                /*
                 * Base (Desktop: >= 1025px)
                 * Full bleed, overflow-x: clip so card shadows breathe vertically.
                 * Natural peek behavior (5 cards + fractional).
                 */
                .ps-wrapper {
                    position: relative;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                }

                .ps-outer {
                    position: relative;
                    overflow-x: clip;
                    padding-top: 20px;
                    padding-bottom: 32px;
                    padding-right: ${padRight}px;
                    width: 100%;
                    /* 40 + 5*(295+24) - 24 + 295 - 10 = 1601px
                     * Shows 5 cards with the last 10px of card 5 clipped */
                    max-width: 1601px;
                }

                /* SCROLLING TRACK */
                .ps-track {
                    display: flex;
                    justify-content: flex-start;
                    align-items: flex-start;
                    gap: ${gap}px;
                    padding-left: ${padLeft}px;
                    padding-right: ${padRight}px; 
                    transition: transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    will-change: transform;
                }

                /* ARROW — position/size only; color applied via inline style per-instance */
                .ps-arrow {
                    position: absolute;
                    right: ${arrowRight}px;
                    top: ${20 + Math.round(cardH / 2) - 22}px;
                    z-index: 10;
                    width: 44px;
                    height: 44px;
                    border: none;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: opacity 0.2s ease;
                }
                .ps-arrow:hover {
                    opacity: 0.85;
                }

                /* Tablet (640px - 1024px)
                 * 1) Fully contains 3 cards
                 * 2) Limits to 100% viewport width so no horizontal scroll
                 * 3) JS dynamic gap/padding maintains layout proportions
                 */
                @media (min-width: 640px) and (max-width: 1024px) {
                    .ps-wrapper {
                        width: 100%;
                        max-width: 957px; 
                        margin: 0 auto;
                    }
                    .ps-outer {
                        width: 100%;
                        overflow-x: hidden;          /* Strict containment */
                        padding-left: 0;
                        padding-right: 0;
                    }
                }

                /* VIEW MORE
                 * margin-top: space between the last card row and the button.
                 * padding-bottom is intentionally 0 — the parent .hp-section
                 * owns the bottom gap (80px / 60px / 40px responsive).
                 * Removing the old 48px here prevents double-spacing.          */
                .ps-view-more {
                    display: flex;
                    justify-content: center;
                    margin-top: 32px;
                    padding-bottom: 0;
                }
                .ps-view-more-btn {
                    font-family: var(--font-montserrat), sans-serif;
                    font-weight: 600;
                    font-size: 13px;
                    letter-spacing: 0.08em;
                    color: var(--clr-text);
                    background: transparent;
                    border: 1.5px solid var(--clr-border);
                    border-radius: 26px;
                    padding: 10px 40px;
                    cursor: pointer;
                    transition: opacity 0.2s ease;
                }
                .ps-view-more-btn:hover {
                    opacity: 0.7;
                }

                /* Mobile (< 640px): hide arrow */
                @media (max-width: 639px) {
                    .ps-arrow {
                        display: none !important;
                    }
                }

                /* All responsive values (gap, padLeft, arrowRight, top) are
                 * computed in JS by computeDims() and applied via template literals.
                 * No static media query overrides needed here. */
            `}</style>

            <div className="ps-wrapper">
                <div className="ps-outer" ref={outerRef}>
                    <div
                        className="ps-track"
                        style={{ transform: `translateX(-${currentIndex * step}px)` }}
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {makeCards()}
                    </div>

                    {/* Arrow — inside ps-outer so it stays on top of the 5th card.
                      * overflow-x: clip does not clip absolute children that are within bounds. */}
                    {!isAtEnd && (
                        <button
                            className="ps-arrow"
                            onClick={next}
                            aria-label="Show next products"
                            style={{
                                background: accentColor,
                                boxShadow: `0 0 10px 3px ${accentColor}b3`,
                            }}
                        >
                            <svg
                                width="18" height="18"
                                fill="none" stroke="white"
                                viewBox="0 0 24 24" strokeWidth="3"
                                aria-hidden="true"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* VIEW MORE — centered below the slider */}
            <div className="ps-view-more">
                {viewMoreHref ? (
                    <Link href={viewMoreHref} className="ps-view-more-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        VIEW MORE
                    </Link>
                ) : (
                    <button className="ps-view-more-btn">VIEW MORE</button>
                )}
            </div>
        </>
    );
}
