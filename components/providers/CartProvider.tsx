'use client';

import { createContext, useContext, useState, useEffect, useRef, useMemo, ReactNode } from 'react';

/* ─── Public product shape required by addToCart ─────────────────────────── */
export interface CartableProduct {
    databaseId: number;
    name: string;
    price: string;
    image?: {
        sourceUrl: string;
    };
}

interface CartItem {
    productId: number;
    variationId: number | null;
    name: string;
    price: string;
    image: string;
    size: string | null;
    quantity: number;
}

interface ToastState {
    id: number;         // unique key so re-adds restart the timer
    productName: string;
}

/* ─── Split contexts ─────────────────────────────────────────────────────── */

interface CartStateType {
    cart: CartItem[];
    count: number;
    total: number;
}

interface CartActionsType {
    addToCart: (product: CartableProduct, variationId?: number | null, selectedSize?: string | null) => void;
    removeFromCart: (productId: number, variationId?: number | null) => void;
    updateQuantity: (productId: number, variationId: number | null, quantity: number) => void;
    clearCart: () => void;
}

/**
 * CartStateContext — changes whenever cart items change.
 * Subscribe here if you only read cart data (Header counter, CartSidebar, CartPage).
 */
const CartStateContext = createContext<CartStateType | undefined>(undefined);

/**
 * CartActionsContext — NEVER changes reference.
 * Actions are stable functions; subscribing here never triggers a re-render.
 * ProductCard, AddToCart buttons → use useCartActions().
 */
const CartActionsContext = createContext<CartActionsType | undefined>(undefined);

/**
 * Legacy combined context — kept so existing useCart() callers compile unchanged.
 * New code should prefer useCartState() / useCartActions().
 */
interface CartContextType extends CartStateType, CartActionsType {
    getCartCount: () => number;
    getCartTotal:  () => number;
}
const CartContext = createContext<CartContextType | undefined>(undefined);

/* ─── Toast UI ───────────────────────────────────────────────────────────── */

function CartToast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
    const [visible, setVisible] = useState(false);

    /* Slide in on mount, slide out just before dismissal */
    useEffect(() => {
        const showTimer = requestAnimationFrame(() => setVisible(true));
        const hideTimer = setTimeout(() => setVisible(false), 2700);   // start exit anim
        const closeTimer = setTimeout(onDismiss, 3000);                 // remove from DOM

        return () => {
            cancelAnimationFrame(showTimer);
            clearTimeout(hideTimer);
            clearTimeout(closeTimer);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [toast.id]);

    return (
        <>
            <style>{`
                @keyframes cartToastIn  { from { opacity:0; transform:translateY(-16px) scale(0.96); } to { opacity:1; transform:translateY(0) scale(1); } }
                @keyframes cartToastOut { from { opacity:1; transform:translateY(0) scale(1); }        to { opacity:0; transform:translateY(-12px) scale(0.96); } }
            `}</style>
            <div
                role="status"
                aria-live="polite"
                style={{
                    position: 'fixed',
                    top: 80,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 99999,
                    minWidth: 260,
                    maxWidth: 'min(420px, calc(100vw - 32px))', // never bleeds off-screen on mobile
                    width: 'auto',
                    backgroundColor: '#f0fdf4',
                    border: '1.5px solid #22c55e',
                    borderRadius: 12,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                    animation: visible
                        ? 'cartToastIn 250ms cubic-bezier(0.34,1.56,0.64,1) forwards'
                        : 'cartToastOut 250ms ease-in forwards',
                    pointerEvents: 'auto',
                }}
            >
                {/* ✓ icon */}
                <div style={{ flexShrink: 0, marginTop: 1 }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <circle cx="10" cy="10" r="10" fill="#22c55e" />
                        <path d="M6 10.5l2.8 2.8L14.5 7.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>

                {/* Message */}
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 13, lineHeight: 1.5, color: '#15803d', margin: 0, flex: 1 }}>
                    <strong style={{ fontWeight: 700 }}>Added to cart!</strong>{' '}
                    {toast.productName}
                </p>

                {/* × dismiss */}
                <button
                    onClick={() => { setVisible(false); setTimeout(onDismiss, 250); }}
                    aria-label="Dismiss notification"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: '#16a34a', flexShrink: 0, marginTop: 1, lineHeight: 1 }}
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </>
    );
}

/* ─── Provider ───────────────────────────────────────────────────────────── */

export function CartProvider({
    children,
    storageKey = 'cart',
}: {
    children: ReactNode;
    storageKey?: string;
}) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [toast, setToast] = useState<ToastState | null>(null);
    const toastIdRef = useRef(0);

    useEffect(() => {
        const savedCart = localStorage.getItem(storageKey);
        if (savedCart) {
            try { setCart(JSON.parse(savedCart)); } catch (e) { console.error('Error loading cart:', e); }
        }
    }, [storageKey]);

    useEffect(() => {
        localStorage.setItem(storageKey, JSON.stringify(cart));
    }, [cart, storageKey]);

    /* ── Action functions — wrapped in useMemo so reference is stable.
     *    CartActionsContext will never cause a re-render in subscribers. ── */
    const actions = useMemo<CartActionsType>(() => ({
        addToCart(product: CartableProduct, variationId: number | null = null, selectedSize: string | null = null) {
            setCart(prevCart => {
                const existingItemIndex = prevCart.findIndex(
                    item => item.productId === product.databaseId && item.variationId === variationId
                );

                if (existingItemIndex > -1) {
                    const newCart = [...prevCart];
                    newCart[existingItemIndex].quantity += 1;
                    return newCart;
                }

                return [
                    ...prevCart,
                    {
                        productId: product.databaseId,
                        variationId,
                        name: product.name,
                        price: product.price,
                        image: product.image?.sourceUrl || '',
                        size: selectedSize,
                        quantity: 1,
                    },
                ];
            });

            /* Show toast */
            toastIdRef.current += 1;
            setToast({ id: toastIdRef.current, productName: product.name });
        },

        removeFromCart(productId: number, variationId: number | null = null) {
            setCart(prevCart =>
                prevCart.filter(item => !(item.productId === productId && item.variationId === variationId))
            );
        },

        updateQuantity(productId: number, variationId: number | null, quantity: number) {
            setCart(prevCart =>
                prevCart.map(item =>
                    item.productId === productId && item.variationId === variationId
                        ? { ...item, quantity }
                        : item
                )
            );
        },

        clearCart() { setCart([]); },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }), []); // ← empty deps: actions never change reference

    /* ── Derived state — memoised so CartStateContext only changes when
     *    cart actually changes, not on every render. ── */
    const count = useMemo(() => cart.reduce((t, item) => t + item.quantity, 0), [cart]);
    const total = useMemo(() => cart.reduce((t, item) => {
        const price = parseFloat(item.price.replace(/[^0-9.-]+/g, ''));
        return t + (price * item.quantity);
    }, 0), [cart]);

    const stateValue = useMemo<CartStateType>(() => ({ cart, count, total }), [cart, count, total]);

    /* ── Legacy combined context value (for backward-compatible useCart()) ── */
    const legacyValue = useMemo<CartContextType>(() => ({
        ...stateValue,
        ...actions,
        getCartCount: () => count,
        getCartTotal:  () => total,
    }), [stateValue, actions, count, total]);

    return (
        <CartActionsContext.Provider value={actions}>
            <CartStateContext.Provider value={stateValue}>
                <CartContext.Provider value={legacyValue}>
                    {children}
                    {toast && <CartToast key={toast.id} toast={toast} onDismiss={() => setToast(null)} />}
                </CartContext.Provider>
            </CartStateContext.Provider>
        </CartActionsContext.Provider>
    );
}

/* ─── Hooks ──────────────────────────────────────────────────────────────── */

/**
 * useCartActions — stable reference, never triggers a re-render.
 * Use in ProductCard, AddToCart buttons, WholesaleCartGuard — any component that
 * only calls cart mutations and doesn't display cart state.
 */
export function useCartActions(): CartActionsType {
    const context = useContext(CartActionsContext);
    if (context === undefined) throw new Error('useCartActions must be used within a CartProvider');
    return context;
}

/**
 * useCartState — re-renders when cart changes.
 * Use in Header counters, CartSidebar, CartPage — components that display cart data.
 */
export function useCartState(): CartStateType {
    const context = useContext(CartStateContext);
    if (context === undefined) throw new Error('useCartState must be used within a CartProvider');
    return context;
}

/**
 * useCart — legacy hook. Kept for backward compatibility.
 * All existing call sites compile unchanged.
 * New code should prefer useCartActions() or useCartState().
 */
export function useCart(): CartContextType {
    const context = useContext(CartContext);
    if (context === undefined) throw new Error('useCart must be used within a CartProvider');
    return context;
}
