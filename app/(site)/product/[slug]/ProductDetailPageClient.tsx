'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '../../../../components/providers/ThemeProvider';
import { useCart } from '../../../../components/providers/CartProvider';
import type { CartableProduct } from '../../../../components/providers/CartProvider';

import type { WPProductDetail } from '../../../../lib/graphql';
import { matchVariation, pickSizeAttribute, isInStock, hasPrice } from '../../../../lib/utils/variations';
import { FREE_SHIPPING_TEXT } from '../../../../lib/config/site';

function CheckIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5L5.5 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export default function ProductDetailPageClient({ product }: { product: WPProductDetail }) {
    const { dark } = useTheme();
    const { addToCart } = useCart();

    // Size pills come from the size/weight attribute; each option maps to a
    // variation by EXACT attribute match ("50g" never matches "250g").
    const sizeOptions = pickSizeAttribute(product.attributes?.nodes)?.options ?? [];
    const isVariable = (product.variations?.nodes?.length ?? 0) > 0;
    const [selectedSize, setSelectedSize] = useState(() => sizeOptions[0] ?? '');
    const [quantity, setQuantity] = useState(1);
    const [addedFeedback, setAddedFeedback] = useState(false);

    const selectedVariation = isVariable ? matchVariation(product.variations?.nodes, selectedSize) : undefined;
    const selectedPrice = (isVariable ? selectedVariation?.price : product.price) || '';

    // Purchasable = in stock + has a real price (+ a matching variation for variable products)
    const inStock = isInStock(product.stockStatus) && (!isVariable || isInStock(selectedVariation?.stockStatus));
    const canAdd = inStock && hasPrice(selectedPrice) && (!isVariable || !!selectedVariation?.databaseId);
    const unavailableLabel = !inStock ? 'Out of stock' : 'Unavailable';

    const handleSizeSelect = (size: string) => setSelectedSize(size);

    const handleAddToCart = () => {
        if (!canAdd) return;
        const productObj: CartableProduct = {
            databaseId: product.databaseId,
            name: product.name,
            price: selectedPrice,
            image: { sourceUrl: product.image?.sourceUrl || '' },
        };
        for (let i = 0; i < quantity; i++) {
            addToCart(productObj, selectedVariation?.databaseId ?? null, selectedSize || null);
        }
        setAddedFeedback(true);
        setTimeout(() => setAddedFeedback(false), 2000);
    };

    /* ── Colour tokens ── */
    const pageBg = dark ? 'transparent' : '#ffffff';
    const grayBg = dark ? 'rgba(255,255,255,0.03)' : '#f6f5f8';
    const textPrim = dark ? '#ffffff' : '#101114';
    const textMuted = dark ? '#9a9a9a' : '#6c6d73';
    const border = dark ? 'rgba(255,255,255,0.10)' : '#e8e6e0';
    const pillSelBg = dark ? '#ffffff' : '#101114';
    const pillSelTxt = dark ? '#111' : '#fff';
    const pillBg = dark ? '#2a2a2a' : '#f0f0f0';
    const pillTxt = dark ? '#ccc' : '#444';
    const stepperBg = dark ? '#262626' : '#f0f0f0';
    const breadcrumbMuted = dark ? '#666' : '#9ca3af';
    const arrowStr = dark ? '#fff' : '#101114';

    // No loading state — product arrived as a server-side prop.
    // No notFound check — page.tsx calls notFound() before this component mounts.

    const cleanDescription = product.description?.replace(/<[^>]*>/g, '').trim() || '';
    const sizes = sizeOptions;
    const imgSrc = product.image?.sourceUrl || '/placeholder-product.png';

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', fontFamily: "var(--font-montserrat), sans-serif", transition: 'background-color 200ms' }}>

            {/* Breadcrumb */}
            <div style={{ borderBottom: `1px solid ${border}`, transition: 'border-color 200ms' }}>
                <div className="max-w-[1280px] mx-auto px-4 md:px-10 xl:px-[120px] py-4 flex items-center gap-2 flex-wrap">
                    {[{ href: '/', label: 'Home' }].map(({ href, label }) => (
                        <span key={href} className="flex items-center gap-2">
                            <Link href={href} style={{ fontSize: 13, color: breadcrumbMuted, fontWeight: 400, transition: 'color 200ms' }}
                                className="hover:underline">{label}</Link>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M4 2L8 6L4 10" stroke={breadcrumbMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    ))}
                    <span style={{ fontSize: 13, color: textPrim, fontWeight: 500 }}>{product.name}</span>
                </div>
            </div>

            {/* Two-column layout */}
            <div className="max-w-[1280px] mx-auto px-4 md:px-10 xl:px-[120px] py-10 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-start">

                    {/* LEFT: Image */}
                    <div className="flex flex-col gap-5">
                        <div style={{
                            position: 'relative', width: '100%', aspectRatio: '1/1',
                            borderRadius: 16, overflow: 'hidden',
                            background: grayBg, transition: 'background 200ms',
                        }}>
                            <Image src={imgSrc} alt={product.image?.altText || product.name} fill
                                className="object-contain p-8" sizes="(min-width:1024px) 40vw, (min-width:640px) 50vw, 100vw" priority />
                        </div>
                        {/* Arrow nav row (cosmetic — single image for now) */}
                        <div className="flex items-center justify-between px-1">
                            {['left', 'right'].map((dir) => (
                                <button key={dir} type="button" disabled aria-label={`${dir} image`}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        width: 40, height: 40, borderRadius: '50%',
                                        border: `1.5px solid ${border}`, background: 'none', cursor: 'not-allowed',
                                        opacity: 0.3, transition: 'border-color 200ms',
                                    }}>
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <path d={dir === 'left' ? 'M9 11L5 7L9 3' : 'M5 3L9 7L5 11'}
                                            stroke={arrowStr} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Info */}
                    <div className="flex flex-col gap-6">
                        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CD142C', margin: 0 }}>
                            The Hookah Store
                        </p>

                        <h1 style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,38px)', lineHeight: 1.15, color: textPrim, margin: 0, transition: 'color 200ms' }}>
                            {product.name}
                        </h1>

                        {cleanDescription && (
                            <p style={{ fontSize: 15, lineHeight: 1.75, color: textMuted, margin: 0, transition: 'color 200ms' }}>
                                {cleanDescription.length > 220 ? cleanDescription.slice(0, 220) + '…' : cleanDescription}
                            </p>
                        )}

                        <div style={{ borderTop: `1px solid ${border}` }} />

                        {/* Size selector */}
                        {sizes.length > 0 && (
                            <div>
                                <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: textMuted, marginBottom: 12, transition: 'color 200ms' }}>
                                    Size: <span style={{ color: textPrim }}>{selectedSize}</span>
                                </p>
                                <div className="flex gap-3 flex-wrap">
                                    {sizes.map(size => {
                                        const sel = selectedSize === size;
                                        return (
                                            <button key={size} type="button" onClick={() => handleSizeSelect(size)}
                                                style={{
                                                    height: 40, minWidth: 72, padding: '0 18px', borderRadius: 8,
                                                    border: `1.5px solid ${sel ? (dark ? '#fff' : '#101114') : (dark ? '#3a3a3a' : '#d7d8db')}`,
                                                    background: sel ? pillSelBg : pillBg,
                                                    color: sel ? pillSelTxt : pillTxt,
                                                    fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: 13,
                                                    letterSpacing: '0.5px', textTransform: 'uppercase', cursor: 'pointer',
                                                    transition: 'all 150ms',
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                }}>
                                                {sel && <CheckIcon />}{size}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Price */}
                        {(selectedPrice || product.price) && (
                            <div className="flex items-baseline gap-3">
                                <p style={{ fontSize: 32, fontWeight: 800, color: textPrim, margin: 0, transition: 'color 200ms' }}>
                                    {selectedPrice || product.price}
                                </p>
                                <span style={{ fontSize: 13, color: textMuted, transition: 'color 200ms' }}>incl. taxes</span>
                            </div>
                        )}

                        <div style={{ borderTop: `1px solid ${border}` }} />

                        {/* Quantity label */}
                        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: textMuted, margin: 0, transition: 'color 200ms' }}>Quantity</p>

                        {/* Stepper + Add to Cart */}
                        <div className="flex items-center gap-4 flex-wrap">
                            <div style={{
                                display: 'flex', alignItems: 'center', height: 48, width: 130,
                                borderRadius: 24, border: `1px solid ${border}`,
                                background: stepperBg, flexShrink: 0, transition: 'background 200ms, border-color 200ms',
                            }}>
                                <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))} aria-label="Decrease"
                                    style={{ flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', color: textMuted, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>−</button>
                                <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 17, color: textPrim, userSelect: 'none', transition: 'color 200ms' }}>{quantity}</span>
                                <button type="button" onClick={() => setQuantity(q => q + 1)} aria-label="Increase"
                                    style={{ flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', color: textPrim, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none', transition: 'color 200ms' }}>+</button>
                            </div>

                            <button id="product-page-add-to-cart" type="button" onClick={handleAddToCart} disabled={!canAdd}
                                style={{
                                    flex: 1, minWidth: 160, height: 48, borderRadius: 30, border: 'none',
                                    cursor: canAdd ? 'pointer' : 'not-allowed', opacity: canAdd ? 1 : 0.5,
                                    background: addedFeedback ? '#1e7e34' : '#CD142C',
                                    boxShadow: addedFeedback ? '0 0 14px 3px rgba(30,126,52,0.5)' : '0 0 14px 3px rgba(205,20,44,0.4)',
                                    color: '#fff', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: 14,
                                    letterSpacing: '1.5px', textTransform: 'uppercase',
                                    transition: 'background 250ms, box-shadow 250ms',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                }}>
                                {!canAdd ? unavailableLabel : addedFeedback ? <><CheckIcon />Added to Cart</> : 'Add to Cart'}
                            </button>
                        </div>

                        {/* Trust badges */}
                        <div className="flex gap-5 flex-wrap pt-2">
                            {[`Free Shipping over ${FREE_SHIPPING_TEXT}`, '100% Authentic', 'Easy Returns'].map(t => (
                                <div key={t} className="flex items-center gap-1.5">
                                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                        <circle cx="7" cy="7" r="6.5" stroke="#CD142C" />
                                        <path d="M4 7L6 9L10 5" stroke="#CD142C" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <span style={{ fontSize: 12, color: textMuted, fontWeight: 500, transition: 'color 200ms' }}>{t}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
