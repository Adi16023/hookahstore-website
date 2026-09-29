'use client';

/**
 * Wholesale product detail.
 *
 * The product arrives from the server (WooCommerce REST, show_in_wholesale = "1")
 * WITHOUT any price. Approved wholesalers load their tier price from
 * /api/wholesale/prices; everyone else sees "Login for pricing".
 */

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '../../../../components/providers/ThemeProvider';
import { useCart } from '../../../../components/providers/CartProvider';
import type { CartableProduct } from '../../../../components/providers/CartProvider';
import { useAuth } from '../../../../components/providers/AuthProvider';
import { useWholesaleHref } from '../../../../lib/config/use-wholesale-path';
import { useWholesalePricing, priceFor, formatInr } from '../../../../lib/wholesale/use-wholesale-prices';
import { clampWholesaleKg, WHOLESALE_MAX_KG, WHOLESALE_MIN_KG } from '../../../../lib/wholesale/weight';
import type { WholesaleProduct } from '../../../../lib/woocommerce/wholesale-catalog';

/* ─── Shared icons ──────────────────────────────────────────────────────── */
function CheckIcon() {
    return (
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5L5.5 10L11 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function LockIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="white" strokeWidth="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
    );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function WholesaleProductClient({ product }: { product: WholesaleProduct }) {
    const { dark } = useTheme();
    const { addToCart, cart } = useCart();
    const { role } = useAuth();
    const href = useWholesaleHref();

    const sellsByKg = product.sellsByKg;
    const sizes = product.options;
    const kgUnit = sellsByKg ? (sizes[0] ?? null) : null;
    const [selectedSize, setSelectedSize] = useState(sizes[0] ?? '');
    const [quantity, setQuantity] = useState(product.moq ?? 1);
    const [kg, setKg] = useState(WHOLESALE_MIN_KG);
    const [addedFeedback, setAddedFeedback] = useState(false);
    const [limitNote, setLimitNote] = useState('');

    const isApproved = role === 'wholesale_customer';
    const { loading: priceLoading, pricing } = useWholesalePricing(isApproved ? product.id : undefined);
    const { price, variationId } = priceFor(pricing, sellsByKg ? kgUnit : selectedSize);

    const handleAddToCart = () => {
        if (!isApproved) return;
        const productObj: CartableProduct = {
            databaseId: product.id,
            name: product.name,
            price: price != null ? formatInr(price) : '',
            image: { sourceUrl: product.image || '' },
        };
        const sizeLabel = sellsByKg ? kgUnit : (selectedSize || null);
        const already = cart.find(item => item.productId === product.id && item.variationId === variationId)?.quantity ?? 0;
        const requested = sellsByKg ? kg : quantity;
        const room = sellsByKg ? Math.max(0, WHOLESALE_MAX_KG - already) : requested;
        const times = sellsByKg ? Math.min(requested, room) : requested;
        if (times < 1) {
            setLimitNote(`Maximum is ${WHOLESALE_MAX_KG} kg.`);
            return;
        }
        for (let i = 0; i < times; i++) addToCart(productObj, variationId, sizeLabel);
        setLimitNote(sellsByKg && times < requested ? `Added ${times} kg. Maximum is ${WHOLESALE_MAX_KG} kg.` : '');
        setAddedFeedback(true);
        setTimeout(() => setAddedFeedback(false), 2000);
    };

    /* ── Colour tokens (identical to retail ProductDetailPageClient) ── */
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

    const imgSrc = product.image || '/placeholder-product.png';
    const primaryCat = product.categories[0];
    const outOfStock = product.stockStatus === 'outofstock';
    const minQty = product.moq ?? 1;

    const loginButton = (
        <Link href={href('/login')}
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                height: 48, borderRadius: 30, border: 'none', cursor: 'pointer',
                background: '#CD142C',
                boxShadow: '0 0 14px 3px rgba(205,20,44,0.4)',
                color: '#fff', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700,
                fontSize: 14, letterSpacing: '1.5px', textTransform: 'uppercase',
                textDecoration: 'none', width: '100%',
            }}>
            <LockIcon />
            Login for pricing
        </Link>
    );

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', fontFamily: "var(--font-montserrat), sans-serif", transition: 'background-color 200ms' }}>

            {/* Breadcrumb */}
            <div style={{ borderBottom: `1px solid ${border}`, transition: 'border-color 200ms' }}>
                <div className="max-w-[1280px] mx-auto px-4 md:px-10 xl:px-[120px] py-4 flex items-center gap-2 flex-wrap">
                    {[
                        { href: href('/'), label: 'Wholesale Home' },
                        ...(primaryCat ? [{ href: href(`/category/${primaryCat.slug}`), label: primaryCat.name }] : []),
                    ].map(({ href: h, label }) => (
                        <span key={label} className="flex items-center gap-2">
                            <Link href={h} style={{ fontSize: 13, color: breadcrumbMuted, fontWeight: 400, transition: 'color 200ms' }} className="hover:underline">{label}</Link>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M4 2L8 6L4 10" stroke={breadcrumbMuted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </span>
                    ))}
                    <span style={{ fontSize: 13, color: textPrim, fontWeight: 500 }}>{product.name}</span>
                </div>
            </div>

            <div className="max-w-[1280px] mx-auto px-4 md:px-10 xl:px-[120px] py-10 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-20 items-start">

                    {/* LEFT: Image */}
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 16, overflow: 'hidden', background: grayBg, transition: 'background 200ms' }}>
                        <Image src={imgSrc} alt={product.name} fill className="object-contain p-8" sizes="(min-width:1024px) 40vw, (min-width:640px) 50vw, 100vw" priority />
                    </div>

                    {/* RIGHT: Info */}
                    <div className="flex flex-col gap-6">
                        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#CD142C', margin: 0 }}>The Hookah Store — Wholesale</p>

                        <h1 style={{ fontWeight: 700, fontSize: 'clamp(24px,3vw,38px)', lineHeight: 1.15, color: textPrim, margin: 0, transition: 'color 200ms' }}>
                            {product.name}
                        </h1>

                        {product.description && (
                            <p style={{ fontSize: 15, lineHeight: 1.75, color: textMuted, margin: 0, transition: 'color 200ms' }}>
                                {product.description.length > 220 ? product.description.slice(0, 220) + '…' : product.description}
                            </p>
                        )}

                        {sellsByKg ? (
                            <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>
                                Sold by the kilogram, from <strong style={{ color: textPrim }}>1 kg</strong> up to <strong style={{ color: textPrim }}>5 kg</strong>.
                            </p>
                        ) : product.moq ? (
                            <p style={{ fontSize: 13, color: textMuted, margin: 0 }}>
                                Minimum order: <strong style={{ color: textPrim }}>{product.moq} units</strong>
                            </p>
                        ) : null}

                        <div style={{ borderTop: `1px solid ${border}` }} />

                        {role === 'loading' ? (
                            <div style={{ height: 48, borderRadius: 30, background: dark ? 'rgba(255,255,255,0.06)' : '#f0f0f0', animation: 'pulse 1.4s ease-in-out infinite' }} />
                        ) : !isApproved ? (
                            loginButton
                        ) : (
                            <>
                                {/* Size selector — weight products use a kg amount instead of 50g packs */}
                                {!sellsByKg && sizes.length > 0 && (
                                    <div>
                                        <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: textMuted, marginBottom: 12, transition: 'color 200ms' }}>
                                            {product.optionName ?? 'Size'}: <span style={{ color: textPrim }}>{selectedSize}</span>
                                        </p>
                                        <div className="flex gap-3 flex-wrap">
                                            {sizes.map(size => {
                                                const sel = selectedSize === size;
                                                return (
                                                    <button key={size} type="button" onClick={() => setSelectedSize(size)}
                                                        style={{
                                                            height: 40, minWidth: 72, padding: '0 18px', borderRadius: 8,
                                                            border: `1.5px solid ${sel ? (dark ? '#fff' : '#101114') : (dark ? '#3a3a3a' : '#d7d8db')}`,
                                                            background: sel ? pillSelBg : pillBg,
                                                            color: sel ? pillSelTxt : pillTxt,
                                                            fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: 13,
                                                            letterSpacing: '0.5px', textTransform: 'uppercase', cursor: 'pointer',
                                                            transition: 'all 150ms', display: 'flex', alignItems: 'center', gap: 6,
                                                        }}>
                                                        {sel && <CheckIcon />}{size}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Tier price */}
                                {priceLoading ? (
                                    <div style={{ height: 38, width: 160, borderRadius: 6, background: dark ? 'rgba(255,255,255,0.06)' : '#f0f0f0', animation: 'pulse 1.4s ease-in-out infinite' }} />
                                ) : (
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                                        <p style={{ fontSize: price != null ? 32 : 22, fontWeight: 800, color: textPrim, margin: 0, transition: 'color 200ms' }}>
                                            {price != null ? formatInr(price) : 'Price on request'}
                                        </p>
                                        {price != null && <span style={{ fontSize: 13, color: textMuted, transition: 'color 200ms' }}>{sellsByKg ? 'per kg' : 'your wholesale price'}</span>}
                                    </div>
                                )}

                                <div style={{ borderTop: `1px solid ${border}` }} />

                                <p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: textMuted, margin: 0, transition: 'color 200ms' }}>
                                    {sellsByKg ? 'Weight' : 'Quantity'}
                                </p>

                                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', height: 48, width: sellsByKg ? 168 : 130,
                                        borderRadius: 24, border: `1px solid ${border}`,
                                        background: stepperBg, flexShrink: 0, transition: 'background 200ms, border-color 200ms',
                                    }}>
                                        <button type="button"
                                            onClick={() => sellsByKg ? setKg(q => clampWholesaleKg(q - 1)) : setQuantity(q => Math.max(minQty, q - 1))}
                                            aria-label={sellsByKg ? 'Decrease weight' : 'Decrease'}
                                            style={{ flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', color: textMuted, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none' }}>−</button>
                                        {sellsByKg ? (
                                            <input
                                                type="number"
                                                min={WHOLESALE_MIN_KG}
                                                max={WHOLESALE_MAX_KG}
                                                inputMode="numeric"
                                                aria-label="Weight in kilograms"
                                                value={kg}
                                                onChange={e => {
                                                    const next = Math.floor(Number(e.target.value));
                                                    if (Number.isFinite(next)) setKg(clampWholesaleKg(next));
                                                }}
                                                style={{ width: 36, textAlign: 'center', background: 'transparent', border: 'none', color: textPrim, fontWeight: 700, fontSize: 17, outline: 'none' }}
                                            />
                                        ) : (
                                            <span style={{ minWidth: 28, textAlign: 'center', fontWeight: 700, fontSize: 17, color: textPrim, userSelect: 'none', transition: 'color 200ms' }}>{quantity}</span>
                                        )}
                                        <button type="button"
                                            onClick={() => sellsByKg ? setKg(q => clampWholesaleKg(q + 1)) : setQuantity(q => q + 1)}
                                            aria-label={sellsByKg ? 'Increase weight' : 'Increase'}
                                            style={{ flex: 1, height: '100%', background: 'none', border: 'none', cursor: 'pointer', color: textPrim, fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none', transition: 'color 200ms' }}>+</button>
                                        {sellsByKg && <span style={{ paddingRight: 14, fontSize: 13, fontWeight: 700, color: textMuted }}>kg</span>}
                                    </div>

                                    <button type="button" onClick={handleAddToCart} disabled={outOfStock}
                                        style={{
                                            flex: 1, minWidth: 160, height: 48, borderRadius: 30, border: 'none',
                                            cursor: outOfStock ? 'not-allowed' : 'pointer', opacity: outOfStock ? 0.5 : 1,
                                            background: addedFeedback ? '#1e7e34' : '#CD142C',
                                            boxShadow: addedFeedback ? '0 0 14px 3px rgba(30,126,52,0.5)' : '0 0 14px 3px rgba(205,20,44,0.4)',
                                            color: '#fff', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: 14,
                                            letterSpacing: '1.5px', textTransform: 'uppercase',
                                            transition: 'background 250ms, box-shadow 250ms',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        }}>
                                        {outOfStock ? 'Out of stock' : addedFeedback ? <><CheckIcon />Added to Cart</> : 'Add to Cart'}
                                    </button>
                                </div>
                                {sellsByKg && (
                                    <p style={{ fontSize: 12, color: limitNote ? '#D32F2F' : textMuted, margin: 0 }}>
                                        {limitNote || 'Enter a whole number from 1 kg to 5 kg, for example 2 kg or 3 kg.'}
                                    </p>
                                )}

                                <Link href={href('/cart')} style={{ fontSize: 13, color: '#CD142C', fontWeight: 600, textDecoration: 'underline' }}>
                                    View cart &amp; send order →
                                </Link>
                            </>
                        )}

                        {/* Trust badges — shown regardless of role */}
                        <div className="flex gap-5 flex-wrap pt-2">
                            {['Bulk Order Discounts', '100% Authentic', 'Nationwide Delivery'].map(t => (
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
