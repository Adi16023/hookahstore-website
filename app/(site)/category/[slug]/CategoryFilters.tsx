'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/* ─── Shared icons ─────────────────────────────────────────────────────── */
function ChevronSmall({ open }: { open: boolean }) {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ flexShrink: 0, transition: 'transform 180ms', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <path d="M2 4.5L6 7.5L10 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
function CloseIcon({ color }: { color: string }) {
    return (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
    );
}

const SORT_OPTIONS = [
    { label: 'Popularity',  value: 'popularity'  },
    { label: 'High Price',  value: 'price-desc'  },
    { label: 'Low Price',   value: 'price-asc'   },
    { label: 'Newest',      value: 'newest'       },
    { label: 'Name: A – Z', value: 'name-asc'    },
];

const PRICE_OPTIONS = ['Under ₹500', '₹500 – ₹1,500', '₹1,500 – ₹4,000', 'Over ₹4,000'];

/* ─── FilterBtn ─────────────────────────────────────────────────────────── */
interface FilterBtnProps {
    label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void;
    dark: boolean; textPrim: string; borderCol: string; panelBg: string;
}
function FilterBtn({ label, options, selected, onChange, textPrim, borderCol, panelBg }: FilterBtnProps) {
    const [open, setOpen] = useState(false);
    const [pending, setPending] = useState<string[]>(selected);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, [open]);

    const handleOpen = () => { setPending(selected); setOpen(v => !v); };
    const toggle = (opt: string) => setPending(prev => prev.includes(opt) ? prev.filter(x => x !== opt) : [...prev, opt]);
    const apply = () => { onChange(pending); setOpen(false); };
    const cancel = () => { setPending(selected); setOpen(false); };
    const isActive = selected.length > 0;

    if (options.length === 0) return null;

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button onClick={handleOpen} style={{
                background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: 5, fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: 13,
                color: textPrim, letterSpacing: '0.5px', padding: '8px 4px',
                borderBottom: isActive ? '2px solid #D32F2F' : open ? `2px solid ${textPrim}` : '2px solid transparent',
                transition: 'border-color 150ms, color 200ms',
            }}>
                {label.toUpperCase()}
                {isActive && (
                    <span style={{ background: '#D32F2F', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                        {selected.length}
                    </span>
                )}
                <ChevronSmall open={open} />
            </button>
            {open && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 200, minWidth: 220, background: panelBg, borderRadius: 12, boxShadow: '0 4px 24px rgba(0,0,0,0.15)', padding: '12px 0 0', border: `1px solid ${borderCol}` }}>
                    <div style={{ maxHeight: 280, overflowY: 'auto', padding: '4px 20px 8px' }}>
                        {options.map(opt => (
                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', cursor: 'pointer', borderBottom: `1px solid ${borderCol}` }}>
                                <input type="checkbox" checked={pending.includes(opt)} onChange={() => toggle(opt)}
                                    style={{ width: 18, height: 18, accentColor: '#471169', cursor: 'pointer', flexShrink: 0 }} />
                                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 14, fontWeight: 400, color: textPrim }}>{opt}</span>
                            </label>
                        ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10, padding: '12px 20px', borderTop: `1px solid ${borderCol}` }}>
                        <button onClick={cancel} style={{ flex: 1, height: 40, borderRadius: 98, border: `1px solid ${borderCol}`, background: 'none', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: 13, color: textPrim, cursor: 'pointer' }}>CANCEL</button>
                        <button onClick={apply} style={{ flex: 1, height: 40, borderRadius: 98, border: 'none', background: '#471169', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: 13, color: '#fff', cursor: 'pointer' }}>APPLY</button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ─── SortDropdown ──────────────────────────────────────────────────────── */
function SortDropdown({ value, onChange, textPrim, borderCol, panelBg }: { value: string; onChange: (v: string) => void; textPrim: string; borderCol: string; panelBg: string }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 13, fontWeight: 500, color: textPrim, whiteSpace: 'nowrap' }}>Sort by</span>
            <div style={{ position: 'relative' }}>
                <select value={value} onChange={e => onChange(e.target.value)} style={{ appearance: 'none', WebkitAppearance: 'none', border: `1px solid ${borderCol}`, borderRadius: 6, backgroundColor: panelBg, fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: 13, color: textPrim, padding: '7px 28px 7px 12px', cursor: 'pointer' }}>
                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value} style={{ backgroundColor: panelBg, color: textPrim }}>{o.label}</option>)}
                </select>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <path d="M2 4.5L6 8L10 4.5" stroke={textPrim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
}

/* ─── MobileSortPanel ───────────────────────────────────────────────────── */
function MobileSortPanel({ sortBy, onSort, onClose, textPrim, borderCol, panelBg }: {
    sortBy: string; onSort: (v: string) => void; onClose: () => void;
    textPrim: string; borderCol: string; panelBg: string;
}) {
    const [visible, setVisible] = useState(false);
    useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
    const close = () => { setVisible(false); setTimeout(onClose, 280); };
    return createPortal(
        <>
            <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, transition: 'opacity 280ms', opacity: visible ? 1 : 0 }} />
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1001, background: panelBg, borderRadius: '20px 20px 0 0', boxShadow: '0 -4px 32px rgba(0,0,0,0.18)', transition: 'transform 280ms cubic-bezier(0.32,0.72,0,1)', transform: visible ? 'translateY(0)' : 'translateY(100%)' }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: borderCol, margin: '12px auto 0' }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 12px', borderBottom: `1px solid ${borderCol}` }}>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: 16, color: textPrim }}>Sort by</span>
                    <button onClick={close} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><CloseIcon color={textPrim} /></button>
                </div>
                <div style={{ padding: '8px 0 16px' }}>
                    {SORT_OPTIONS.map(opt => (
                        <button key={opt.value} onClick={() => { onSort(opt.value); close(); }}
                            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer', borderBottom: `1px solid ${borderCol}`, fontFamily: "var(--font-montserrat), sans-serif", fontSize: 15, fontWeight: sortBy === opt.value ? 700 : 400, color: textPrim }}>
                            {opt.label}
                            {sortBy === opt.value && (
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3.5 9L7.5 13L14.5 5.5" stroke="#471169" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </>,
        document.body
    );
}

/* ─── MobileFilterPanel ─────────────────────────────────────────────────── */
function MobileFilterPanel({
    priceFilter, sizeFilter, brandFilter, brandOptions, sizeOptions,
    onApply, onClose, textPrim, borderCol, panelBg
}: {
    priceFilter: string[]; sizeFilter: string[]; brandFilter: string[];
    brandOptions: string[]; sizeOptions: string[];
    onApply: (p: string[], s: string[], b: string[]) => void;
    onClose: () => void; textPrim: string; borderCol: string; panelBg: string;
}) {
    const [visible, setVisible] = useState(false);
    const [pPrice, setPPrice] = useState(priceFilter);
    const [pSize, setPSize] = useState(sizeFilter);
    const [pBrand, setPBrand] = useState(brandFilter);
    const [openSection, setOpenSection] = useState<string | null>(brandOptions.length > 0 ? 'Brand' : 'Price');
    useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);
    const close = () => { setVisible(false); setTimeout(onClose, 280); };
    const apply = () => { onApply(pPrice, pSize, pBrand); close(); };
    const clearAll = () => { setPPrice([]); setPSize([]); setPBrand([]); };
    const totalPending = pPrice.length + pSize.length + pBrand.length;

    const sections = [
        ...(brandOptions.length > 0 ? [{ name: 'Brand', options: brandOptions, selected: pBrand, setFn: setPBrand }] : []),
        ...(sizeOptions.length > 0 ? [{ name: 'Size', options: sizeOptions, selected: pSize, setFn: setPSize }] : []),
        { name: 'Price', options: PRICE_OPTIONS, selected: pPrice, setFn: setPPrice },
    ];

    function toggleOption(set: string[], setFn: (v: string[]) => void, opt: string) {
        setFn(set.includes(opt) ? set.filter(x => x !== opt) : [...set, opt]);
    }

    return createPortal(
        <>
            <div onClick={close} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, transition: 'opacity 280ms', opacity: visible ? 1 : 0 }} />
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1001, background: panelBg, borderRadius: '20px 20px 0 0', boxShadow: '0 -4px 32px rgba(0,0,0,0.18)', transition: 'transform 280ms cubic-bezier(0.32,0.72,0,1)', transform: visible ? 'translateY(0)' : 'translateY(100%)', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: borderCol, margin: '12px auto 0', flexShrink: 0 }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 12px', borderBottom: `1px solid ${borderCol}`, flexShrink: 0 }}>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: 16, color: textPrim }}>Filter by</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        {totalPending > 0 && <button onClick={clearAll} style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 13, fontWeight: 600, color: '#D32F2F', background: 'none', border: 'none', cursor: 'pointer' }}>Clear all</button>}
                        <button onClick={close} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}><CloseIcon color={textPrim} /></button>
                    </div>
                </div>
                <div style={{ overflowY: 'auto', flex: 1 }}>
                    {sections.map(({ name, options, selected, setFn }) => {
                        const isOpen = openSection === name;
                        return (
                            <div key={name} style={{ borderBottom: `1px solid ${borderCol}` }}>
                                <button onClick={() => setOpenSection(prev => prev === name ? null : name)}
                                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: 14, color: textPrim, letterSpacing: '0.5px' }}>
                                        {name.toUpperCase()}
                                        {selected.length > 0 && <span style={{ marginLeft: 8, background: '#D32F2F', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, verticalAlign: 'middle' }}>{selected.length}</span>}
                                    </span>
                                    <ChevronSmall open={isOpen} />
                                </button>
                                {isOpen && (
                                    <div style={{ padding: '0 20px 12px' }}>
                                        {options.map(opt => (
                                            <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', cursor: 'pointer', borderBottom: `1px solid ${borderCol}` }}>
                                                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggleOption(selected, setFn as (v: string[]) => void, opt)} style={{ width: 20, height: 20, accentColor: '#471169', cursor: 'pointer', flexShrink: 0 }} />
                                                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 14, fontWeight: 400, color: textPrim }}>{opt}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div style={{ display: 'flex', gap: 12, padding: '16px 20px', borderTop: `1px solid ${borderCol}`, flexShrink: 0 }}>
                    <button onClick={close} style={{ flex: 1, height: 48, borderRadius: 98, border: `1px solid ${borderCol}`, background: 'none', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: 14, color: textPrim, cursor: 'pointer' }}>CANCEL</button>
                    <button onClick={apply} style={{ flex: 2, height: 48, borderRadius: 98, border: 'none', background: '#471169', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: 14, color: '#fff', cursor: 'pointer' }}>APPLY {totalPending > 0 ? `(${totalPending})` : ''}</button>
                </div>
            </div>
        </>,
        document.body
    );
}

/* ─── CategoryFilters (main export) ────────────────────────────────────── */
export interface CategoryFiltersState {
    priceFilter: string[];
    sizeFilter: string[];
    sortBy: string;
}

interface CategoryFiltersProps {
    /* Dynamic options derived from real product attributes */
    sizeOptions: string[];
    brandOptions: string[];
    /* Current filter state */
    brandFilter: string[];
    setBrandFilter: (v: string[]) => void;
    priceFilter: string[];
    sizeFilter: string[];
    sortBy: string;
    /* Setters */
    setPriceFilter: (v: string[]) => void;
    setSizeFilter: (v: string[]) => void;
    setSortBy: (v: string) => void;
    /* Counts */
    totalActive: number;
    onClearAll: () => void;
    /* Mobile portals */
    portalMounted: boolean;
    mobileSortOpen: boolean;
    mobileFilterOpen: boolean;
    setMobileSortOpen: (v: boolean) => void;
    setMobileFilterOpen: (v: boolean) => void;
    /* Theme */
    dark: boolean;
    textPrim: string;
    borderCol: string;
    panelBg: string;
    mobileBarBg: string;
}

export default function CategoryFilters({
    sizeOptions, brandOptions, brandFilter, setBrandFilter,
    priceFilter, sizeFilter, sortBy,
    setPriceFilter, setSizeFilter, setSortBy,
    totalActive, onClearAll,
    portalMounted, mobileSortOpen, mobileFilterOpen,
    setMobileSortOpen, setMobileFilterOpen,
    dark, textPrim, borderCol, panelBg, mobileBarBg,
}: CategoryFiltersProps) {
    const currentSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Popularity';

    return (
        <>
            {/* ── Desktop filter + sort bar ── */}
            <div className="hidden md:flex items-center justify-between px-6 md:px-10 xl:px-[120px] py-0"
                style={{ borderBottom: `1px solid ${borderCol}`, minHeight: 56, transition: 'border-color 200ms' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
                    {/* Brand — options are brand categories present on this page (hidden if none) */}
                    <FilterBtn label="Brand" options={brandOptions} selected={brandFilter} onChange={setBrandFilter} dark={dark} textPrim={textPrim} borderCol={borderCol} panelBg={panelBg} />
                    <FilterBtn label="Size"  options={sizeOptions}  selected={sizeFilter}  onChange={setSizeFilter}  dark={dark} textPrim={textPrim} borderCol={borderCol} panelBg={panelBg} />
                    <FilterBtn label="Price" options={PRICE_OPTIONS} selected={priceFilter} onChange={setPriceFilter} dark={dark} textPrim={textPrim} borderCol={borderCol} panelBg={panelBg} />
                    {totalActive > 0 && (
                        <button onClick={onClearAll}
                            style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 12, fontWeight: 600, color: '#D32F2F', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>
                            Clear All ({totalActive})
                        </button>
                    )}
                </div>
                <SortDropdown value={sortBy} onChange={setSortBy} textPrim={textPrim} borderCol={borderCol} panelBg={panelBg} />
            </div>

            {/* ── Mobile filter + sort triggers ── */}
            <div className="flex md:hidden items-stretch gap-0" style={{ borderBottom: `1px solid ${borderCol}`, background: mobileBarBg }}>
                <button onClick={() => setMobileFilterOpen(true)}
                    style={{ flex: 1, height: 48, background: 'none', border: 'none', borderRight: `1px solid ${borderCol}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: 13, color: textPrim, letterSpacing: '0.5px' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 8h8M6 12h4" stroke={textPrim} strokeWidth="1.6" strokeLinecap="round" /></svg>
                    FILTERS
                    {totalActive > 0 && <span style={{ background: '#D32F2F', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{totalActive}</span>}
                </button>
                <button onClick={() => setMobileSortOpen(true)}
                    style={{ flex: 1, height: 48, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 700, fontSize: 13, color: textPrim, letterSpacing: '0.5px' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 3v10M4 13l-2-2M4 13l2-2M12 3v10M12 3l-2 2M12 3l2 2" stroke={textPrim} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    {currentSortLabel.toUpperCase()}
                </button>
            </div>

            {/* ── Portals ── */}
            {portalMounted && mobileSortOpen && (
                <MobileSortPanel sortBy={sortBy} onSort={setSortBy} onClose={() => setMobileSortOpen(false)} textPrim={textPrim} borderCol={borderCol} panelBg={panelBg} />
            )}
            {portalMounted && mobileFilterOpen && (
                <MobileFilterPanel
                    priceFilter={priceFilter} sizeFilter={sizeFilter} brandFilter={brandFilter}
                    brandOptions={brandOptions} sizeOptions={sizeOptions}
                    onApply={(p, s, b) => { setPriceFilter(p); setSizeFilter(s); setBrandFilter(b); }}
                    onClose={() => setMobileFilterOpen(false)}
                    textPrim={textPrim} borderCol={borderCol} panelBg={panelBg}
                />
            )}
        </>
    );
}
