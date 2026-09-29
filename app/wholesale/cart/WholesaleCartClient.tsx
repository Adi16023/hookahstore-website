'use client';

/**
 * Wholesale cart — no online payment.
 *
 * Items come from CartProvider (localStorage "wholesale_cart"); prices are the
 * customer's LIVE tier prices from /api/wholesale/prices (never the stored
 * cart price). The order can be sent:
 *   a) on WhatsApp — opens wa.me with a pre-filled order summary
 *   b) by email    — POST /api/wholesale/enquiry (server re-prices, creates an
 *                    on-hold WooCommerce order, emails store + customer)
 * Both include the same order reference.
 */

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '../../../components/providers/ThemeProvider';
import { useCart } from '../../../components/providers/CartProvider';
import { useAuth } from '../../../components/providers/AuthProvider';
import { useWholesaleHref } from '../../../lib/config/use-wholesale-path';
import { useWholesalePricingMap, formatInr, type ProductPricing } from '../../../lib/wholesale/use-wholesale-prices';
import { newEnquiryRef } from '../../../lib/wholesale/enquiry-ref';
import { SITE } from '../../../lib/config/site';

type Profile = { firstName: string; lastName: string; email: string; businessName: string; phone: string; gstNumber: string; tier: string };
type Sent = { reference: string; orderNumber: string; emails: { store: boolean; customer: boolean } };

/** Unit price for a cart line from live tier pricing (variation → parent → null). */
function unitPrice(p: ProductPricing | null | undefined, variationId: number | null): number | null {
    if (!p) return null;
    if (variationId) {
        const v = p.variations.find(x => x.id === variationId);
        if (v) return v.price;
    }
    return p.price;
}

export default function WholesaleCartClient() {
    const { dark } = useTheme();
    const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
    const { role } = useAuth();
    const href = useWholesaleHref();
    const isApproved = role === 'wholesale_customer';

    const [reference, setReference] = useState('');
    const [profile, setProfile] = useState<Profile | null>(null);
    const [note, setNote] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [sent, setSent] = useState<Sent | null>(null);

    // Reference generated in the browser once per cart visit (same for WhatsApp + email)
    useEffect(() => { setReference(newEnquiryRef()); }, []);

    useEffect(() => {
        if (!isApproved) return;
        fetch('/api/wholesale/profile', { cache: 'no-store' })
            .then(r => (r.ok ? r.json() : null))
            .then(p => p && setProfile(p as Profile))
            .catch(() => {});
    }, [isApproved]);

    const productIds = useMemo(() => cart.map(i => i.productId), [cart]);
    const { loading: pricesLoading, map: pricing } = useWholesalePricingMap(productIds, isApproved);

    const lines = cart.map(item => {
        const p = pricing[item.productId];
        const unavailable = !pricesLoading && isApproved && p === null; // not wholesale-visible any more
        const unit = unitPrice(p, item.variationId);
        return { item, unit, lineTotal: unit != null ? unit * item.quantity : null, unavailable };
    });
    const subtotal = lines.reduce((s, l) => s + (l.lineTotal ?? 0), 0);
    const anyOnRequest = lines.some(l => l.unit == null && !l.unavailable);
    const anyUnavailable = lines.some(l => l.unavailable);
    const canSend = isApproved && cart.length > 0 && !pricesLoading && !anyUnavailable && !sending && !!reference;

    /* ── a) WhatsApp ── */
    const sendWhatsApp = () => {
        const name = profile ? `${profile.firstName} ${profile.lastName}`.trim() : '';
        const text = [
            `*Wholesale order ${reference}*`,
            profile?.businessName ? `Business: ${profile.businessName}` : null,
            name ? `Name: ${name}` : null,
            profile?.phone ? `Phone: ${profile.phone}` : null,
            profile?.gstNumber ? `GST: ${profile.gstNumber}` : null,
            '',
            ...lines.map(({ item, unit, lineTotal }) =>
                `• ${item.name}${item.size ? ` (${item.size})` : ''} × ${item.quantity} — ${unit != null ? `${formatInr(unit)} each = ${formatInr(lineTotal ?? 0)}` : 'price on request'}`),
            '',
            `Subtotal: ${formatInr(subtotal)}${anyOnRequest ? ' (+ items on request)' : ''}`,
            note ? `Note: ${note}` : null,
            `Ref: ${reference}`,
        ].filter(l => l !== null).join('\n');
        window.open(`https://wa.me/${SITE.whatsapp.number}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    };

    /* ── b) Email (server creates the order + sends emails) ── */
    const sendEmail = async () => {
        setSending(true);
        setError('');
        try {
            const res = await fetch('/api/wholesale/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    reference,
                    note,
                    items: cart.map(i => ({ productId: i.productId, variationId: i.variationId, quantity: i.quantity })),
                }),
            });
            const data = await res.json() as Sent & { error?: string };
            if (!res.ok || !data.orderNumber) {
                setError(data.error ?? 'Could not send your order. Please try again or use WhatsApp.');
                return;
            }
            setSent({ reference: data.reference, orderNumber: data.orderNumber, emails: data.emails });
            clearCart();
            setReference(newEnquiryRef());
        } catch {
            setError('Network error — please check your connection and try again.');
        } finally {
            setSending(false);
        }
    };

    /* ── Theme tokens ── */
    const pageBg = dark ? 'transparent' : '#ffffff';
    const cardBg = dark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const border = dark ? 'rgba(255,255,255,0.12)' : '#e4e4e4';
    const textPrim = dark ? '#ffffff' : '#101114';
    const textMuted = dark ? 'rgba(255,255,255,0.55)' : '#6c6d73';
    const stepperBg = dark ? '#262626' : '#f0f0f0';
    const inputBg = dark ? 'rgba(255,255,255,0.05)' : '#ffffff';
    const M = "var(--font-montserrat), sans-serif";

    const btn = (bg: string, disabled: boolean): React.CSSProperties => ({
        width: '100%', height: 48, borderRadius: 30, border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
        background: bg, color: '#ffffff', fontFamily: M, fontWeight: 700, fontSize: 14, letterSpacing: '1px',
        textTransform: 'uppercase', opacity: disabled ? 0.5 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    });

    /* ── Thank-you state ── */
    if (sent) {
        return (
            <div className="px-4 md:px-10 xl:px-[120px] py-20 flex flex-col items-center text-center" style={{ backgroundColor: pageBg, fontFamily: M, minHeight: '60vh' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#1e7e34', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                    <svg width="28" height="28" viewBox="0 0 13 13" fill="none"><path d="M2 6.5L5.5 10L11 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <h1 className="text-[26px] md:text-[34px]" style={{ fontWeight: 700, color: textPrim, margin: '0 0 12px' }}>Thank you — order sent</h1>
                <p style={{ fontSize: 15, lineHeight: '24px', color: textMuted, maxWidth: 520, margin: '0 0 8px' }}>
                    Reference <strong style={{ color: textPrim }}>{sent.reference}</strong> · Order <strong style={{ color: textPrim }}>#{sent.orderNumber}</strong>
                </p>
                <p style={{ fontSize: 15, lineHeight: '24px', color: textMuted, maxWidth: 520, margin: '0 0 28px' }}>
                    Our wholesale team will confirm availability, final pricing and delivery with you shortly.
                    {sent.emails.customer ? ' A confirmation has been emailed to you.' : ' (We could not email your confirmation — your order was still received.)'}
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                    <Link href={href('/account/orders')} style={{ ...btn('#CD142C', false), width: 'auto', padding: '0 28px', textDecoration: 'none' }}>View my orders</Link>
                    <Link href={href('/')} style={{ ...btn(dark ? '#333' : '#101114', false), width: 'auto', padding: '0 28px', textDecoration: 'none' }}>Continue shopping</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-10 xl:px-[120px] py-10 md:py-14" style={{ backgroundColor: pageBg, fontFamily: M, minHeight: '70vh', transition: 'background-color 200ms' }}>
            <h1 className="text-[28px] md:text-[40px]" style={{ fontWeight: 600, color: textPrim, margin: '0 0 6px', transition: 'color 200ms' }}>Wholesale Cart</h1>
            <p style={{ fontSize: 14, color: textMuted, margin: '0 0 28px' }}>
                No online payment — send your order and our team will confirm it with you.
                {reference && <> Reference <strong style={{ color: textPrim }}>{reference}</strong>.</>}
            </p>

            {cart.length === 0 ? (
                <div style={{ border: `1px solid ${border}`, borderRadius: 12, padding: '48px 24px', textAlign: 'center', background: cardBg }}>
                    <p style={{ fontSize: 18, fontWeight: 600, color: textPrim, margin: '0 0 8px' }}>Your wholesale cart is empty</p>
                    <p style={{ fontSize: 14, color: textMuted, margin: '0 0 20px' }}>Browse the catalog and add products to build your order.</p>
                    <Link href={href('/category/hookahs')} style={{ ...btn('#CD142C', false), width: 'auto', display: 'inline-flex', padding: '0 28px', textDecoration: 'none' }}>Browse catalog</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
                    {/* ── Items ── */}
                    <div style={{ border: `1px solid ${border}`, borderRadius: 12, background: cardBg, overflow: 'hidden' }}>
                        {lines.map(({ item, unit, lineTotal, unavailable }) => (
                            <div key={`${item.productId}-${item.variationId ?? 'x'}`} className="flex gap-4 p-4 flex-wrap sm:flex-nowrap items-center" style={{ borderBottom: `1px solid ${border}` }}>
                                <div style={{ position: 'relative', width: 72, height: 72, borderRadius: 8, overflow: 'hidden', background: dark ? '#1a1a1a' : '#f6f5f8', flexShrink: 0 }}>
                                    {item.image && <Image src={item.image} alt={item.name} fill style={{ objectFit: 'contain' }} sizes="72px" />}
                                </div>
                                <div style={{ flex: 1, minWidth: 160 }}>
                                    <p style={{ fontSize: 15, fontWeight: 600, color: textPrim, margin: 0 }}>{item.name}</p>
                                    {item.size && <p style={{ fontSize: 13, color: textMuted, margin: '2px 0 0' }}>{item.size}</p>}
                                    <p style={{ fontSize: 13, color: unavailable ? '#D32F2F' : textMuted, margin: '4px 0 0' }}>
                                        {unavailable ? 'No longer available — please remove'
                                            : pricesLoading ? 'Loading price…'
                                            : unit != null ? `${formatInr(unit)} each` : 'Price on request'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div style={{ display: 'flex', alignItems: 'center', height: 40, borderRadius: 20, border: `1px solid ${border}`, background: stepperBg }}>
                                        <button type="button" aria-label="Decrease quantity" onClick={() => updateQuantity(item.productId, item.variationId, Math.max(1, item.quantity - 1))}
                                            style={{ width: 36, height: '100%', background: 'none', border: 'none', cursor: 'pointer', color: textPrim, fontSize: 18 }}>−</button>
                                        <input
                                            type="number" min={1} inputMode="numeric" aria-label={`Quantity for ${item.name}`}
                                            value={item.quantity}
                                            onChange={e => {
                                                const q = Math.floor(Number(e.target.value));
                                                if (Number.isFinite(q) && q >= 1) updateQuantity(item.productId, item.variationId, Math.min(q, 100000));
                                            }}
                                            style={{ width: 56, textAlign: 'center', background: 'transparent', border: 'none', color: textPrim, fontWeight: 700, fontSize: 15, outline: 'none' }}
                                        />
                                        <button type="button" aria-label="Increase quantity" onClick={() => updateQuantity(item.productId, item.variationId, item.quantity + 1)}
                                            style={{ width: 36, height: '100%', background: 'none', border: 'none', cursor: 'pointer', color: textPrim, fontSize: 18 }}>+</button>
                                    </div>
                                    <p style={{ width: 100, textAlign: 'right', fontSize: 15, fontWeight: 700, color: textPrim, margin: 0 }}>
                                        {lineTotal != null ? formatInr(lineTotal) : '—'}
                                    </p>
                                    <button type="button" aria-label={`Remove ${item.name}`} onClick={() => removeFromCart(item.productId, item.variationId)}
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: textMuted, fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* ── Summary + send ── */}
                    <div style={{ border: `1px solid ${border}`, borderRadius: 12, background: cardBg, padding: 20 }} className="flex flex-col gap-4">
                        <div className="flex justify-between items-baseline">
                            <span style={{ fontSize: 15, color: textMuted }}>Subtotal</span>
                            <span style={{ fontSize: 22, fontWeight: 800, color: textPrim }}>{pricesLoading ? '…' : formatInr(subtotal)}</span>
                        </div>
                        {anyOnRequest && <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>Excludes items marked &quot;Price on request&quot; — we&apos;ll quote those.</p>}
                        {profile?.tier && <p style={{ fontSize: 12, color: textMuted, margin: 0 }}>Your pricing tier: <strong style={{ color: textPrim, textTransform: 'capitalize' }}>{profile.tier}</strong></p>}

                        <label style={{ fontSize: 13, fontWeight: 600, color: textPrim }}>
                            Note for our team <span style={{ fontWeight: 400, color: textMuted }}>(optional)</span>
                            <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} maxLength={2000}
                                placeholder="Delivery address, preferred date, questions…"
                                style={{ display: 'block', width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: `1px solid ${border}`, background: inputBg, color: textPrim, fontFamily: M, fontSize: 14, resize: 'vertical' }} />
                        </label>

                        {error && <p role="alert" style={{ fontSize: 13, color: '#D32F2F', margin: 0 }}>{error}</p>}
                        {anyUnavailable && <p style={{ fontSize: 13, color: '#D32F2F', margin: 0 }}>Remove unavailable items to send your order.</p>}

                        <button type="button" onClick={sendWhatsApp} disabled={!canSend} style={btn('#1f9d55', !canSend)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.8 11.9 11.9 0 0 0 4.6 4c1.7.7 2.4.8 3.2.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3z"/></svg>
                            Send order on WhatsApp
                        </button>
                        <button type="button" onClick={sendEmail} disabled={!canSend} style={btn('#CD142C', !canSend)}>
                            {sending ? 'Sending…' : 'Send order by email'}
                        </button>
                        <p style={{ fontSize: 12, color: textMuted, margin: 0, textAlign: 'center' }}>
                            Prices shown are your current tier prices and are re-checked when you send.
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
