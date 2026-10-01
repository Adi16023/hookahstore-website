'use client';

import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useCart } from './providers/CartProvider';
import type { CartableProduct } from './providers/CartProvider';
import { useWholesaleSession } from '../lib/auth/use-wholesale-session';
import { useWholesalePricing, priceFor, formatInr } from '../lib/wholesale/use-wholesale-prices';
import { optionWeightKg, WHOLESALE_MAX_KG } from '../lib/wholesale/weight';
import { useWholesaleHref } from '../lib/config/use-wholesale-path';
import type { ProductBadge } from '../lib/utils/badges';
import { hasPrice } from '../lib/utils/variations';


interface ProductCardProps {
    productId?: number;
    image: string;
    title: string;
    description: string;
    price: string;
    variations: string[];
    badge?: ProductBadge | null;
    variationPrices?: { [key: string]: string };
    /** option → WooCommerce variation databaseId (retail add-to-cart) */
    variationIds?: { [key: string]: number };
    /** option → in stock AND priced. Omit to treat every option as available. */
    variationAvailable?: { [key: string]: boolean };
    /** Product-level stock (false → "Out of stock", Add to Cart disabled) */
    inStock?: boolean;
    cardWidth?: number;
    cardHeight?: number;
    accentColor?: string;
    buttonColor?: string;
    imageWidth?: number;
    imageHeight?: number;
    /** When provided, clicking anywhere on the card navigates to this URL.
     *  Add to Cart and variant pill buttons stop propagation so they still work. */
    href?: string;
    /** Force wholesale mode (overrides pathname detection — needed on wholesale domain). */
    forceWholesale?: boolean;
}

function hexToRgba(hex: string, alpha: number): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function ProductCard({
    productId,
    image,
    title,
    description,
    price,
    variations = [],
    badge = null,
    variationPrices = {},
    variationIds = {},
    variationAvailable,
    inStock = true,
    cardWidth = 295,
    cardHeight = 510,
    accentColor = '#CD142C',
    buttonColor,
    imageWidth = 220,
    imageHeight = 220,
    href,
    forceWholesale = false,
}: ProductCardProps) {
    const [selectedVariation, setSelectedVariation] = useState(variations[0]);
    const [btnPressed, setBtnPressed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const isWholesale = forceWholesale || (pathname?.startsWith('/wholesale') ?? false);
    const { addToCart, cart } = useCart();
    const { loading: sessionLoading, isApproved } = useWholesaleSession();
    const wsHref = useWholesaleHref();

    // Wholesale: tier price for approved accounts only (never fetched when logged out)
    const { loading: priceLoading, pricing } = useWholesalePricing(
        isWholesale && isApproved && productId ? productId : undefined
    );
    const tierPrice = priceFor(pricing, selectedVariation);

    const btnTextColor = buttonColor ?? '#EEEEEE';

    // ── Reactive theme detection ────────────────────────────────────────────
    // Read data-dark from <html> reactively so card glow / button shadow
    // update the moment the user toggles the theme, with no page reload.
    const [isDark, setIsDark] = useState<boolean>(() => {
        if (typeof document === 'undefined') return true; // SSR → default dark
        return document.documentElement.getAttribute('data-dark') === 'true';
    });

    useEffect(() => {
        const root = document.documentElement;
        const observer = new MutationObserver(() => {
            setIsDark(root.getAttribute('data-dark') === 'true');
        });
        observer.observe(root, { attributes: true, attributeFilter: ['data-dark'] });
        return () => observer.disconnect();
    }, []);

    // Dark mode  → neon colour glow
    // Light mode → no shadow at all (clean, premium)
    const cardShadow = isDark
        ? `0px 0px 8px 2px ${hexToRgba(accentColor, 0.85)}`
        : 'none';

    // Same logic for the Add to Cart button
    const btnGlow = isDark
        ? `0px 0px 8px 2px ${hexToRgba(accentColor, 0.85)}`
        : 'none';

    const displayPrice = (() => {
        if (variationPrices[selectedVariation]) return variationPrices[selectedVariation];
        if (price.includes(' - ')) return price.split(' - ')[0];
        return price;
    })();

    // ── Availability ──
    // Retail: in stock + a real price (+ a matching variation for variable products).
    // Wholesale: in stock only ("Price on request" items can still be enquired about).
    const optionAvailable = variations.length === 0
        || !variationAvailable
        || variationAvailable[selectedVariation] === true;
    const retailPurchasable = inStock && optionAvailable
        && (variations.length > 0 ? variationIds[selectedVariation] != null || !variationAvailable : hasPrice(displayPrice));
    const canAdd = isWholesale ? inStock : retailPurchasable;
    const unavailableLabel = !inStock || (variationAvailable && variationAvailable[selectedVariation] === false && variationIds[selectedVariation] != null)
        ? 'OUT OF STOCK' : 'UNAVAILABLE';

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent card navigation
        if (!canAdd) return;
        const productObj: CartableProduct = {
            databaseId: productId ?? 0,
            name: title,
            // Wholesale cart shows live tier prices; this is only a display hint
            price: isWholesale ? (tierPrice.price != null ? formatInr(tierPrice.price) : '') : displayPrice,
            image: { sourceUrl: image },
        };
        const variationId = isWholesale ? tierPrice.variationId : (variationIds[selectedVariation] ?? null);
        if (isWholesale && selectedVariation && optionWeightKg(selectedVariation) != null) {
            const already = cart.find(item => item.productId === (productId ?? 0) && item.variationId === variationId)?.quantity ?? 0;
            if (already >= WHOLESALE_MAX_KG) return;
        }
        addToCart(productObj, variationId, selectedVariation || null);
        setBtnPressed(true);
        setTimeout(() => setBtnPressed(false), 200);
    };

    const handleCardClick = () => {
        if (href) router.push(href);
    };

    return (
        <div
            className="relative flex-shrink-0"
            style={{
                width: `${cardWidth}px`,
                minWidth: `${cardWidth}px`,
                height: `${cardHeight}px`,
                cursor: href ? 'pointer' : 'default',
            }}
            onClick={handleCardClick}
        >
            <div
                className="w-full h-full rounded-[12px] flex flex-col pt-[24px] pb-[20px] px-[26px] relative overflow-hidden"
                style={{
                    backgroundColor: 'var(--clr-surface)',
                    boxShadow: cardShadow,
                    border: isDark
                        ? '1px solid transparent'
                        : '1px solid var(--clr-border)',
                }}
            >
                {/* Badge */}
                {badge && (
                    <div
                        className="absolute top-0 left-0 h-[24px] px-[8px] rounded-tl-[9px] rounded-br-[9px] flex items-center justify-center z-10"
                        style={{ backgroundColor: accentColor }}
                    >
                        <span className="text-white text-[10px] font-semibold uppercase whitespace-nowrap font-montserrat">
                            {badge}
                        </span>
                    </div>
                )}

                {/* Image */}
                <div className="relative mx-auto flex-shrink-0" style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}>
                    <Image
                        src={image}
                        alt={title}
                        fill
                        loading="lazy"
                        className="object-contain pointer-events-none"
                        sizes={`${imageWidth ?? 168}px`}
                    />
                </div>

                {/* Variation pills — stopPropagation so card click doesn't fire */}
                {variations.length > 0 && (
                    <div className="flex gap-x-[7px] mt-[13px] flex-shrink-0">
                        {variations.map((v) => (
                            <button
                                key={v}
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setSelectedVariation(v); }}
                                className="h-[27px] w-[47px] shrink-0 rounded-[4px] border border-solid text-[11px] font-medium font-montserrat transition-colors duration-150 cursor-pointer"
                                style={{
                                    ...(selectedVariation === v
                                        ? {
                                            borderColor: accentColor,
                                            backgroundColor: hexToRgba(accentColor, 0.18),
                                            color: 'var(--clr-text)',
                                        }
                                        : {
                                            borderColor: 'var(--clr-border)',
                                            color: 'var(--clr-text)',
                                        }),
                                    // Unavailable sizes stay selectable (to show why) but look muted
                                    opacity: variationAvailable && variationAvailable[v] === false ? 0.45 : 1,
                                }}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                )}

                {/* Divider */}
                <div className="h-px mt-[15px] flex-shrink-0" style={{ backgroundColor: 'var(--clr-border)' }} />

                {/* Title */}
                <h3
                    className="text-[16px] font-semibold leading-[1.54] capitalize font-montserrat mt-[8px] line-clamp-2"
                    style={{ color: 'var(--clr-text)' }}
                >
                    {title}
                </h3>

                {/* Description */}
                <p
                    className="text-[10px] font-normal leading-[1.54] capitalize font-montserrat mt-[5px] line-clamp-2"
                    style={{ color: 'var(--clr-text-muted)' }}
                >
                    {description}
                </p>

                {/* Price + Add to Cart — wholesale-aware */}
                {isWholesale ? (
                    sessionLoading ? (
                        /* Skeleton while session loads — prevents layout shift */
                        <div style={{ marginTop: 'auto', paddingTop: 16, height: 18, width: 80, borderRadius: 4, background: 'rgba(255,255,255,0.08)', animation: 'pulse 1.4s ease-in-out infinite' }} />
                    ) : isApproved ? (
                        /* Approved wholesale_customer — tier price (or "Price on request") + cart */
                        <>
                            {priceLoading ? (
                                <div style={{ marginTop: 'auto', paddingTop: 16, height: 18, width: 80, borderRadius: 4, background: 'var(--clr-overlay)', animation: 'pulse 1.4s ease-in-out infinite' }} />
                            ) : (
                                <p
                                    className="text-[12px] font-semibold uppercase font-montserrat"
                                    style={{ color: 'var(--clr-text)', marginTop: 'auto', paddingTop: 16 }}
                                >
                                    {tierPrice.price != null ? formatInr(tierPrice.price) : 'Price on request'}
                                </p>
                            )}
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={!canAdd}
                                className="w-full h-[35px] rounded-[26px] text-[13px] font-semibold uppercase font-montserrat focus-visible:outline-none"
                                style={{
                                    marginTop: '25px',
                                    backgroundColor: accentColor,
                                    boxShadow: btnGlow,
                                    color: btnTextColor,
                                    cursor: canAdd ? 'pointer' : 'not-allowed',
                                    filter: canAdd ? 'none' : 'grayscale(1)',
                                    transform: btnPressed ? 'scale(0.94)' : 'scale(1)',
                                    transition: btnPressed
                                        ? 'transform 80ms ease-in'
                                        : 'transform 200ms cubic-bezier(0.34,1.56,0.64,1), opacity 150ms',
                                    opacity: btnPressed ? 0.85 : 1,
                                }}
                            >
                                {!canAdd ? unavailableLabel : btnPressed ? 'Added!' : 'ADD TO CART'}
                            </button>
                        </>
                    ) : (
                        /* Logged out / not approved — no price data is ever loaded */
                        <a
                            href={wsHref('/login')}
                            onClick={(e) => e.stopPropagation()}
                            className="font-montserrat"
                            style={{
                                display: 'inline-block',
                                marginTop: 'auto',
                                paddingTop: 16,
                                fontSize: '12px',
                                fontWeight: 600,
                                color: '#CD142C',
                                textDecoration: 'underline',
                                textUnderlineOffset: '3px',
                                cursor: 'pointer',
                            }}
                        >
                            Login for pricing
                        </a>
                    )
                ) : (
                    /* Retail — show price and cart button as before */
                    <>
                        <p
                            className="text-[12px] font-semibold uppercase font-montserrat"
                            style={{ color: 'var(--clr-text)', marginTop: 'auto', paddingTop: 16 }}
                        >
                            {displayPrice}
                        </p>
                        <button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!canAdd}
                            className="w-full h-[35px] rounded-[26px] text-[13px] font-semibold uppercase font-montserrat focus-visible:outline-none"
                            style={{
                                marginTop: '25px',
                                backgroundColor: accentColor,
                                boxShadow: btnGlow,
                                color: btnTextColor,
                                cursor: canAdd ? 'pointer' : 'not-allowed',
                                filter: canAdd ? 'none' : 'grayscale(1)',
                                transform: btnPressed ? 'scale(0.94)' : 'scale(1)',
                                transition: btnPressed
                                    ? 'transform 80ms ease-in'
                                    : 'transform 200ms cubic-bezier(0.34,1.56,0.64,1), opacity 150ms',
                                opacity: btnPressed ? 0.85 : 1,
                            }}
                        >
                            {!canAdd ? unavailableLabel : btnPressed ? 'Added!' : 'ADD TO CART'}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

// React.memo prevents re-renders when props are unchanged.
// Without this, every cart update causes all visible ProductCards to re-render
// because they subscribe to CartContext via useCart().
export default React.memo(ProductCard);
