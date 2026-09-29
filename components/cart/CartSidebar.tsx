'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../providers/CartProvider';
import { useTheme } from '../providers/ThemeProvider';
import { SITE } from '../../lib/config/site';

const FREE_SHIPPING_THRESHOLD = SITE.freeShippingThreshold;
const T = 'transition: background-color 200ms, color 200ms, border-color 200ms';

/* ─── Theme tokens ───────────────────────────────────────────────────────── */
function makeColors(dark: boolean) {
    return dark ? {
        panelBg: '#121212',
        headerBg: '#1e1e1e',
        headerBorder: 'rgba(255,255,255,0.10)',
        heading: '#ffffff',
        body: 'rgba(255,255,255,0.65)',
        meta: 'rgba(255,255,255,0.45)',
        itemsBg: '#1a1a1a',
        divider: 'rgba(255,255,255,0.10)',
        progressTrack: 'rgba(255,255,255,0.12)',
        removeBtnClr: 'rgba(255,255,255,0.55)',
        stepperBg: '#2a2a2a',
        stepperBorder: 'rgba(255,255,255,0.15)',
        stepperQtyBg: '#333333',
        stepperText: '#ffffff',
        footerBg: '#1e1e1e',
        footerBorder: 'rgba(255,255,255,0.10)',
        detailsBg: '#151515',
        detailsText: 'rgba(255,255,255,0.55)',
        detailsVal: '#ffffff',
        totalLabel: 'rgba(255,255,255,0.70)',
        totalValue: '#ffffff',
        closeStroke: 'rgba(255,255,255,0.80)',
        chevronStroke: 'rgba(255,255,255,0.70)',
        thumbBg: '#2a2a2a',
        emptyIcon: 'rgba(255,255,255,0.20)',
        emptyText: 'rgba(255,255,255,0.40)',
    } : {
        panelBg: '#f6f5f8',
        headerBg: '#ffffff',
        headerBorder: '#d7d8db',
        heading: '#1b1c1f',
        body: '#1b1c1f',
        meta: '#4c4e52',
        itemsBg: '#ffffff',
        divider: '#ebebed',
        progressTrack: '#ebebed',
        removeBtnClr: '#35363b',
        stepperBg: '#ffffff',
        stepperBorder: '#d7d8db',
        stepperQtyBg: '#f6f5f8',
        stepperText: '#000000',
        footerBg: '#ffffff',
        footerBorder: '#d7d8db',
        detailsBg: '#f6f5f8',
        detailsText: '#1b1c1f',
        detailsVal: '#101114',
        totalLabel: '#101114',
        totalValue: '#101114',
        closeStroke: '#1B1C1F',
        chevronStroke: '#1B1C1F',
        thumbBg: '#f6f5f8',
        emptyIcon: '#9c9ea3',
        emptyText: '#6c6d73',
    };
}

/* ─── Icons ──────────────────────────────────────────────────────────────── */
function CloseIcon({ stroke }: { stroke: string }) {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M13.5 0.5L0.5 13.5M13.5 13.5L0.5 0.5" stroke={stroke} strokeLinecap="round" strokeWidth="1.4" />
        </svg>
    );
}
function PlusIcon({ id, stroke }: { id: string; stroke: string }) {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <g clipPath={`url(#plus_${id})`}>
                <path d="M6.99984 1.66669V12.3334M12.3332 7.00002H1.6665" stroke={stroke} strokeLinecap="round" strokeWidth="1.4" />
            </g>
            <defs><clipPath id={`plus_${id}`}><rect fill="white" height="14" width="14" /></clipPath></defs>
        </svg>
    );
}
function MinusIcon({ id, stroke, disabled }: { id: string; stroke: string; disabled: boolean }) {
    return (
        <svg width="14" height="2" viewBox="0 0 14 2" fill="none">
            <g clipPath={`url(#minus_${id})`}>
                <path d="M12.3332 0.999999L1.6665 1" stroke={disabled ? 'rgba(150,150,150,0.4)' : stroke} strokeLinecap="round" strokeWidth="1.4" />
            </g>
            <defs><clipPath id={`minus_${id}`}><rect fill="white" height="2" width="14" /></clipPath></defs>
        </svg>
    );
}
function ChevronIcon({ open, stroke }: { open: boolean; stroke: string }) {
    return (
        <svg width="11" height="6" viewBox="0 0 10.7333 5.40001" fill="none"
            style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 200ms', display: 'inline-flex' }}>
            <path d="M10.0333 4.7L5.36592 0.7L0.700013 4.7" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.4" />
        </svg>
    );
}

/* ─── Quantity stepper ───────────────────────────────────────────────────── */
function QuantityStepper({ quantity, id, onIncrease, onDecrease, c }: {
    quantity: number; id: string;
    onIncrease: () => void; onDecrease: () => void;
    c: ReturnType<typeof makeColors>;
}) {
    return (
        <div
            style={{
                backgroundColor: c.stepperBg, border: `1px solid ${c.stepperBorder}`,
                height: 42, width: 130, borderRadius: 9999,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
                transition: 'background-color 200ms, border-color 200ms',
            }}
        >
            <button style={{ width: 44, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: quantity <= 1 ? 'default' : 'pointer' }}
                aria-label="Decrease quantity" onClick={onDecrease}>
                <MinusIcon id={id} stroke={c.removeBtnClr} disabled={quantity <= 1} />
            </button>
            <div style={{ backgroundColor: c.stepperQtyBg, height: 32, width: 40, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'clip', transition: 'background-color 200ms' }}>
                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: 14, color: c.stepperText, lineHeight: '20px', transition: 'color 200ms' }}>
                    {quantity}
                </span>
            </div>
            <button style={{ width: 44, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="Increase quantity" onClick={onIncrease}>
                <PlusIcon id={id} stroke={c.removeBtnClr} />
            </button>
        </div>
    );
}

/* ─── CartSidebar ────────────────────────────────────────────────────────── */
interface CartSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
    const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const { dark } = useTheme();
    const c = makeColors(dark);

    const [mounted, setMounted] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setMounted(true); }, []);

    /* Close on Escape */
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isOpen, onClose]);

    /* Lock body scroll while open */
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    const subtotal = getCartTotal();
    const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
    const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
    const fmtINR = (v: number) => `₹${v.toFixed(2)}`;

    if (!mounted) return null;

    return createPortal(
        <div
            aria-modal="true"
            role="dialog"
            aria-label="Shopping cart"
            style={{ position: 'fixed', inset: 0, zIndex: 99998, pointerEvents: isOpen ? 'auto' : 'none' }}
        >
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: dark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.3)',
                    opacity: isOpen ? 1 : 0,
                    transition: 'opacity 250ms ease',
                }}
            />

            {/* Sidebar panel */}
            <div
                ref={sidebarRef}
                data-name="CartSidebar"
                style={{
                    position: 'absolute', top: 0, right: 0,
                    width: 'min(576px, 100vw)',
                    height: '100%',
                    display: 'flex', flexDirection: 'column',
                    backgroundColor: c.panelBg,
                    boxShadow: '0px 20px 25px -5px rgba(0,0,0,0.2), 0px 8px 10px -6px rgba(0,0,0,0.2)',
                    transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 300ms cubic-bezier(0.4,0,0.2,1), background-color 200ms',
                    overflow: 'hidden',
                }}
            >
                {/* ── Header ─────────────────────────────────────────────── */}
                <div
                    data-name="cart-header"
                    style={{
                        backgroundColor: c.headerBg, borderBottom: `1px solid ${c.headerBorder}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0 32px', height: 73, flexShrink: 0,
                        transition: 'background-color 200ms, border-color 200ms',
                    }}
                >
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: 16, color: c.heading, lineHeight: '24px', transition: 'color 200ms' }}>
                        My Cart
                    </span>
                    <button
                        style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer' }}
                        aria-label="Close cart"
                        onClick={onClose}
                    >
                        <CloseIcon stroke={c.closeStroke} />
                    </button>
                </div>

                {/* ── Free Shipping Progress ──────────────────────────────── */}
                <div
                    data-name="shipping-progress"
                    style={{
                        backgroundColor: c.headerBg, borderBottom: `1px solid ${c.headerBorder}`,
                        flexShrink: 0, padding: '20px 32px 0', height: 73,
                        transition: 'background-color 200ms, border-color 200ms',
                    }}
                >
                    <div style={{ backgroundColor: c.progressTrack, height: 8, borderRadius: 9999, transition: 'background-color 200ms' }}>
                        <div
                            style={{ backgroundColor: '#857149', height: '100%', borderRadius: 9999, width: `${progress}%`, transition: 'width 500ms ease' }}
                        />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                        {remaining > 0 ? (
                            <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: c.body, fontSize: 14, lineHeight: '20px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8, transition: 'color 200ms' }}>
                                Add {fmtINR(remaining)} more to get FREE shipping
                            </span>
                        ) : (
                            <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: '#857149', fontSize: 14, lineHeight: '20px', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 8 }}>
                                🎉 You've unlocked FREE shipping!
                            </span>
                        )}
                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: c.body, fontSize: 14, lineHeight: '20px', flexShrink: 0, transition: 'color 200ms' }}>
                            {fmtINR(subtotal)}
                        </span>
                    </div>
                </div>

                {/* ── Items ──────────────────────────────────────────────── */}
                <div
                    data-name="cart-items"
                    style={{
                        backgroundColor: c.itemsBg, flex: 1, overflowY: 'auto',
                        borderTop: `1px solid ${c.divider}`,
                        transition: 'background-color 200ms, border-color 200ms',
                    }}
                >
                    {cart.length === 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, padding: '48px 0' }}>
                            <svg width="48" height="48" fill="none" stroke={c.emptyIcon} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: 15, color: c.emptyText, transition: 'color 200ms' }}>Your cart is empty</p>
                        </div>
                    ) : (
                        cart.map((item, idx) => {
                            const itemId = `${item.productId}-${item.variationId ?? 'nv'}`;
                            return (
                                <div key={itemId}>
                                    <div style={{ padding: '24px 32px 0' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                                            {/* Thumbnail */}
                                            <div style={{ flexShrink: 0, width: 64, height: 64, overflow: 'hidden', borderRadius: 4, backgroundColor: c.thumbBg, position: 'relative', transition: 'background-color 200ms' }}>
                                                {item.image && (
                                                    <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} />
                                                )}
                                            </div>
                                            {/* Info */}
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                                                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: c.heading, fontSize: 14, lineHeight: '20px', transition: 'color 200ms' }}>
                                                        {item.name}
                                                    </span>
                                                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: c.heading, fontSize: 14, lineHeight: '20px', flexShrink: 0, transition: 'color 200ms' }}>
                                                        {item.price}
                                                    </span>
                                                </div>
                                                {item.size && (
                                                    <div style={{ marginTop: 6 }}>
                                                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, color: c.meta, fontSize: 12, lineHeight: '16px', transition: 'color 200ms' }}>
                                                            {item.size}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Remove + Stepper row */}
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingBottom: 24 }}>
                                            <button
                                                style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, color: c.removeBtnClr, fontSize: 14, lineHeight: '20px', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', transition: 'color 200ms' }}
                                                onClick={() => removeFromCart(item.productId, item.variationId)}
                                            >
                                                Remove
                                            </button>
                                            <QuantityStepper
                                                quantity={item.quantity}
                                                id={itemId}
                                                c={c}
                                                onDecrease={() => item.quantity > 1 && updateQuantity(item.productId, item.variationId, item.quantity - 1)}
                                                onIncrease={() => updateQuantity(item.productId, item.variationId, item.quantity + 1)}
                                            />
                                        </div>
                                    </div>

                                    {idx < cart.length - 1 && (
                                        <div style={{ height: 1, backgroundColor: c.divider, margin: '0 32px', transition: 'background-color 200ms' }} />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* ── Footer ─────────────────────────────────────────────── */}
                <div
                    data-name="cart-footer"
                    style={{
                        backgroundColor: c.footerBg, borderTop: `1px solid ${c.footerBorder}`,
                        flexShrink: 0, boxShadow: dark ? '0px -8px 20px 0px rgba(0,0,0,0.4)' : '0px -8px 10px 0px rgba(0,0,0,0.1)',
                        transition: 'background-color 200ms, border-color 200ms',
                    }}
                >
                    {/* Show Details row */}
                    <button
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0 16px', height: 49, background: 'none', border: 'none', cursor: 'pointer',
                            borderBottom: `1px solid ${c.footerBorder}`,
                            transition: 'border-color 200ms',
                        }}
                        onClick={() => setShowDetails(v => !v)}
                    >
                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: c.heading, fontSize: 14, lineHeight: '20px', transition: 'color 200ms' }}>
                            Show Details
                        </span>
                        <ChevronIcon open={showDetails} stroke={c.chevronStroke} />
                    </button>

                    {/* Expandable totals */}
                    {showDetails && (
                        <div style={{ padding: '12px 32px', borderBottom: `1px solid ${c.footerBorder}`, backgroundColor: c.detailsBg, transition: 'background-color 200ms, border-color 200ms' }}>
                            {[['Subtotal', fmtINR(subtotal)], ['Shipping', 'To be calculated']].map(([k, v]) => (
                                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: 13, color: c.detailsText, transition: 'color 200ms' }}>{k}</span>
                                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: 13, color: c.detailsVal, transition: 'color 200ms' }}>{v}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Total + Checkout */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', height: 76 }}>
                        <div>
                            <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, color: c.totalLabel, fontSize: 14, lineHeight: '20px', transition: 'color 200ms' }}>Total</div>
                            <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: c.totalValue, fontSize: 22, lineHeight: '28px', transition: 'color 200ms' }}>
                                {fmtINR(subtotal)}
                            </div>
                        </div>
                        <Link
                            href="/cart"
                            onClick={onClose}
                            style={{
                                backgroundColor: '#D32F2F', height: 48, width: 192, borderRadius: 98,
                                fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: 16,
                                color: 'white', letterSpacing: 1, textTransform: 'uppercase', flexShrink: 0,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
                            }}
                        >
                            CHECKOUT
                        </Link>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
