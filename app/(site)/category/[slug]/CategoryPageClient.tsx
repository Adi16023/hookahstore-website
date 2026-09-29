'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from '../../../../components/providers/ThemeProvider';
import type { WPProductNode, WPProductCategory } from '../../../../lib/graphql';
import { findCategory, findParent, BRANDS } from '../../../../lib/config/categories';

import CategoryHero from './CategoryHero';
import CategoryFilters from './CategoryFilters';
import CategoryGrid from './CategoryGrid';

/* ─── Price parser ────────────────────────────────────────────────────────── */
function parsePrice(raw?: string): number {
    if (!raw) return 0;
    return parseFloat(raw.replace(/[^0-9.]/g, '')) || 0;
}

/* ─── Shared SVGs ─────────────────────────────────────────────────────────── */
function Sep() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
        </svg>
    );
}
function FaqChevron({ open, dark }: { open: boolean; dark: boolean }) {
    return (
        <svg width="22" height="24" viewBox="0 0 22.16 24.004" fill="none"
            style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}>
            <path d="M3.69332 8.30861L11.0812 15.6953L18.4667 8.30861"
                stroke={dark ? '#ffffff' : '#857149'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.923333" />
        </svg>
    );
}

/* ─── FAQ data per category ─────────────────────────────────────────────── */
const CATEGORY_FAQS: Record<string, { q: string; a: string }[]> = {
    'hookah-bowls': [
        { q: 'What is the best hookah bowl material?', a: 'Clay and ceramic bowls are the most traditional and offer excellent heat distribution. Silicone bowls are great for beginners as they are unbreakable and easy to clean. Phunnel-style bowls with a raised spire keep the juice from draining into the stem for longer sessions.' },
        { q: 'How do I pack a hookah bowl properly?', a: 'For a fluff pack, gently break apart the shisha and fill loosely to just below the rim to allow airflow. For a dense pack (good for darker leaf tobacco), pack tightly. Always ensure the holes are not blocked.' },
        { q: 'How often should I replace my hookah bowl?', a: 'Clay and ceramic bowls can last for years if handled with care. Inspect them after each session for cracks. Silicone bowls essentially last indefinitely and are dishwasher safe.' },
    ],
    'hookah-hoses': [
        { q: 'What type of hookah hose gives the best airflow?', a: 'Wide-bore silicone hoses provide the best airflow and are also washable, making them the most hygienic option. Traditional leather hoses offer a classic feel but cannot be washed as water can cause them to mold.' },
        { q: 'Can I wash my hookah hose?', a: 'Only silicone and food-grade rubber hoses can be safely rinsed with water. Traditional leather or fabric-wrapped hoses should never be washed — simply blow air through them to clear any residue after each session.' },
        { q: 'How long should a hookah hose be?', a: 'Standard hoses are between 150–180 cm (60–70 inches). Longer hoses cool the smoke more but can restrict airflow. For the best balance of draw resistance and smoke cooling, 150 cm is ideal.' },
    ],
    'other-hookah-accessories': [
        { q: 'What is a heat management device (HMD)?', a: 'An HMD is a disc or tray that sits between your coals and your bowl, regulating heat distribution. Popular options include the Kaloud Lotus and Provari Orbit. They eliminate the need for foil and give a more consistent heat.' },
        { q: 'How often should I replace hookah parts?', a: 'Grommets and gaskets should be inspected every few months and replaced when they lose elasticity. Down stems and base vases should be cleaned after every session. Hoses should be replaced when airflow becomes restricted.' },
        { q: 'What cleaning supplies do I need for my hookah?', a: 'A long brush kit (for the stem and base), pipe cleaners (for the hose ports), and isopropyl alcohol or lemon juice for deep cleans. Rinse everything with warm water after each session to prevent buildup.' },
    ],
    'hookah-charcoal': [
        { q: 'What is the best hookah charcoal?', a: 'Natural coconut shell charcoal is widely considered the best for hookah. It burns cleaner, lasts longer (45–60 minutes), produces less ash, and has no chemical taste compared to quick-light charcoal.' },
        { q: 'How many coals do I need for a hookah session?', a: 'Typically 2–3 coals for a standard Egyptian hookah using a foil setup, or 1–2 coals when using a heat management device (HMD) like a Kaloud Lotus. Start with 2 and adjust based on heat preference.' },
        { q: 'How do I light natural coconut charcoal?', a: 'Use a coil burner or gas stove on high heat. Place the coals flat on the burner for 3–4 minutes, flip once, and heat for another 3 minutes until the entire coal glows orange with no black spots.' },
    ],
    'coco-nara': [
        { q: 'What makes Coco Nara charcoal special?', a: 'Coco Nara charcoal is made from 100% natural compressed coconut shell. It burns cleanly with no chemical odour, produces minimal ash, and provides consistent heat for 45–60 minutes per piece.' },
        { q: 'How should I light Coco Nara coals?', a: 'Place Coco Nara cubes flat on a coil burner at maximum heat. Heat for 3–4 minutes per side until the entire cube glows orange evenly. Never use a lighter — always use a dedicated coal burner.' },
        { q: 'Are Coco Nara coals compatible with all hookah bowls?', a: 'Yes, Coco Nara cubes work with all bowl types — phunnel, vortex, Egyptian, and modern bowls. They work especially well with heat management devices due to their consistent heat output.' },
    ],
    'cocous': [
        { q: 'What is CocoUS charcoal made from?', a: 'CocoUS charcoal is made from compressed coconut shells, making it an eco-friendly and sustainable option. It is free from chemicals and additives, giving you a pure, clean hookah experience.' },
        { q: 'How long do CocoUS coals burn?', a: 'CocoUS coals typically burn for 45–60 minutes under normal conditions. Using a heat management device can extend burn time and maintain consistent temperature throughout your session.' },
        { q: 'Can I reuse CocoUS charcoal?', a: 'Partially burned CocoUS coals can be saved and relit, but they will burn for a shorter time. For the best experience, always start with fresh coals to ensure optimal heat and clean flavour.' },
    ],
};
// Accessories parent shares the general accessories FAQs
CATEGORY_FAQS['hookah-accessories'] = CATEGORY_FAQS['other-hookah-accessories'];

/* ═══════════════════════════════════════════════════════════════════════════
   Main Component
═══════════════════════════════════════════════════════════════════════════ */
interface Props {
    category: WPProductCategory | null;
    products: WPProductNode[];
    slug: string;
    parentLabel?: string;
    parentHref?: string;
}

export default function CategoryPageClient({ category, products, slug, parentLabel: parentLabelProp, parentHref: parentHrefProp }: Props) {
    const { dark } = useTheme();

    /* ── Filter state ── */
    const [priceFilter, setPriceFilter] = useState<string[]>([]);
    const [sizeFilter,  setSizeFilter]  = useState<string[]>([]);
    const [brandFilter, setBrandFilter] = useState<string[]>([]);  // brand labels
    const [sortBy,      setSortBy]      = useState('popularity');

    /* ── Mobile panels ── */
    const [mobileSortOpen,   setMobileSortOpen]   = useState(false);
    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    /* ── FAQ state ── */
    const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set());

    /* ── Portal guard ── */
    const [portalMounted, setPortalMounted] = useState(false);
    useEffect(() => { setPortalMounted(true); }, []);

    /* ── Colour tokens ── */
    const pageBg    = dark ? 'transparent' : '#ffffff';
    const grayBg    = dark ? 'rgba(255,255,255,0.03)' : '#f6f5f8';
    const faqBg     = dark ? 'rgba(255,255,255,0.02)' : '#ffffff';
    const borderCol = dark ? '#5D5D5D' : '#d7d8db';
    const textPrim  = dark ? '#ffffff' : '#101114';
    const textMuted = dark ? 'rgba(255,255,255,0.55)' : '#6c6d73';
    const faqBodyCol= dark ? 'rgba(255,255,255,0.70)' : '#4c4e52';
    const panelBg   = dark ? '#1e1e1e' : '#ffffff';
    const mobileBarBg = dark ? 'rgba(255,255,255,0.04)' : '#f9f8f6';

    const title = category?.name ?? findCategory(slug)?.label ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    // Breadcrumb parent from lib/config/categories.ts (props override, e.g. /hookahs pages)
    const parent = findParent(slug);
    // FAQs: this category → its parent → none (section hidden)
    const faqs  = CATEGORY_FAQS[slug] ?? (parent.slug ? CATEGORY_FAQS[parent.slug] : undefined) ?? [];

    /* ── Dynamic filter options derived from real product attributes ── */
    const allAttributes = useMemo(() =>
        products.flatMap(p => p.attributes?.nodes ?? []),
        [products]
    );

    // Show options from any attribute that looks like a size/weight/quantity.
    // Falls back to ALL attribute options if no size/weight name match is found,
    // so products with non-standard attribute names still get a working filter.
    const sizeOptions = useMemo(() => {
        const sizeAttrs = allAttributes.filter(
            a => a.name.toLowerCase().includes('size') || a.name.toLowerCase().includes('weight') || a.name.toLowerCase().includes('pack')
        );
        const opts = [...new Set((sizeAttrs.length > 0 ? sizeAttrs : allAttributes).flatMap(a => a.options))];
        return opts;
    }, [allAttributes]);

    // Brands are WooCommerce categories — offer every known brand (lib/config/categories.ts)
    // that at least one product on this page is assigned to.
    const brandOptions = useMemo(() => {
        const present = new Set(products.flatMap(p => (p.productCategories?.nodes ?? []).map(c => c.slug)));
        return BRANDS.filter(b => present.has(b.slug)).map(b => b.label);
    }, [products]);

    /* ── Filter + sort pipeline ── */
    const displayed = useMemo(() => {
        let list = [...products];

        // Brand filter (label → slug via config)
        if (brandFilter.length) {
            const slugs = BRANDS.filter(b => brandFilter.includes(b.label)).map(b => b.slug);
            list = list.filter(p =>
                (p.productCategories?.nodes ?? []).some(c => slugs.includes(c.slug))
            );
        }

        // Size filter
        if (sizeFilter.length) {
            list = list.filter(p =>
                p.attributes?.nodes?.some(a =>
                    (a.name.toLowerCase().includes('size') || a.name.toLowerCase().includes('weight')) &&
                    a.options?.some(o => sizeFilter.includes(o))
                )
            );
        }

        // Price filter
        if (priceFilter.length) {
            list = list.filter(p => {
                const base = parsePrice(p.price);
                return priceFilter.some(r => {
                    if (r === 'Under ₹500')        return base < 500;
                    if (r === '₹500 – ₹1,500')     return base >= 500  && base < 1500;
                    if (r === '₹1,500 – ₹4,000')   return base >= 1500 && base < 4000;
                    if (r === 'Over ₹4,000')        return base >= 4000;
                    return true;
                });
            });
        }

        // Sort
        switch (sortBy) {
            case 'price-asc':  list.sort((a, b) => parsePrice(a.price) - parsePrice(b.price)); break;
            case 'price-desc': list.sort((a, b) => parsePrice(b.price) - parsePrice(a.price)); break;
            case 'name-asc':   list.sort((a, b) => a.name.localeCompare(b.name)); break;
        }

        return list;
    }, [products, brandFilter, sizeFilter, priceFilter, sortBy]);

    const totalActive = brandFilter.length + priceFilter.length + sizeFilter.length;

    const clearAll = () => { setBrandFilter([]); setPriceFilter([]); setSizeFilter([]); };

    const toggleFaq = (i: number) => setOpenFaqs(prev => {
        const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n;
    });

    return (
        <div className="w-full min-h-screen" style={{ backgroundColor: pageBg, fontFamily: "var(--font-montserrat), sans-serif", transition: 'background-color 200ms' }}>

            {/* ── Hero ── */}
            <CategoryHero category={category} slug={slug} title={title} />

            {/* ── Content wrapper ── */}
            <div className="w-full" style={{ backgroundColor: grayBg, transition: 'background-color 200ms' }}>

                {/* ── Breadcrumb ── */}
                {(() => {
                    const parentLabel = parentLabelProp ?? parent.label;
                    const parentHref  = parentHrefProp  ?? parent.href;
                    return (
                        <div style={{ borderBottom: `1px solid ${borderCol}`, minHeight: 49, display: 'flex', alignItems: 'center', transition: 'border-color 200ms' }}>
                            <div className="flex items-center px-6 md:px-10 xl:px-[120px] flex-wrap" style={{ paddingTop: 10, paddingBottom: 10, gap: 4 }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Link href={parentHref} style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: 16, color: textMuted, whiteSpace: 'nowrap', textDecoration: 'none', transition: 'color 200ms' }}>
                                        {parentLabel}
                                    </Link>
                                    <Sep />
                                </span>
                                <span aria-current="page" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: 16, color: textPrim, whiteSpace: 'nowrap' }}>{title}</span>
                            </div>
                        </div>
                    );
                })()}

                {/* ── Filters ── */}
                <CategoryFilters
                    sizeOptions={sizeOptions}
                    brandOptions={brandOptions}
                    brandFilter={brandFilter}
                    setBrandFilter={setBrandFilter}
                    priceFilter={priceFilter}
                    sizeFilter={sizeFilter}
                    sortBy={sortBy}
                    setPriceFilter={setPriceFilter}
                    setSizeFilter={setSizeFilter}
                    setSortBy={setSortBy}
                    totalActive={totalActive}
                    onClearAll={clearAll}
                    portalMounted={portalMounted}
                    mobileSortOpen={mobileSortOpen}
                    mobileFilterOpen={mobileFilterOpen}
                    setMobileSortOpen={setMobileSortOpen}
                    setMobileFilterOpen={setMobileFilterOpen}
                    dark={dark}
                    textPrim={textPrim}
                    borderCol={borderCol}
                    panelBg={panelBg}
                    mobileBarBg={mobileBarBg}
                />

                {/* ── Product grid ── */}
                <CategoryGrid
                    displayed={displayed}
                    totalProducts={products.length}
                    textPrim={textPrim}
                    textMuted={textMuted}
                    onClearFilters={clearAll}
                    shopAllHref={parentHrefProp ?? parent.href}
                    shopAllLabel={parentLabelProp ?? parent.label}
                />

                {/* ── FAQ ── */}
                {faqs.length > 0 && (
                <div style={{ backgroundColor: faqBg, paddingTop: 64, paddingBottom: 64, transition: 'background-color 200ms' }}>
                    <h2 className="text-center text-[28px] md:text-[40px]" style={{ fontWeight: 600, lineHeight: '1.35', color: textPrim, marginBottom: 50, transition: 'color 200ms' }}>
                        {title} FAQs
                    </h2>
                    <div className="max-w-[848px] mx-auto px-6 md:px-0">
                        {faqs.map(({ q, a }, i) => {
                            const isOpen = openFaqs.has(i);
                            return (
                                <div key={i} style={{ borderTop: `1px solid ${borderCol}`, transition: 'border-color 200ms' }}>
                                    <button onClick={() => toggleFaq(i)} className="w-full flex items-center justify-between text-left"
                                        style={{ minHeight: 73, paddingTop: 24, paddingBottom: 24, cursor: 'pointer', background: 'none', border: 'none', paddingLeft: 8 }}>
                                        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: 18, lineHeight: '24px', color: textPrim, transition: 'color 200ms', flex: 1 }}>{q}</span>
                                        <FaqChevron open={isOpen} dark={dark} />
                                    </button>
                                    {isOpen && (
                                        <div style={{ paddingBottom: 24, paddingLeft: 8, paddingRight: 8 }}>
                                            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: 16, lineHeight: '1.7', color: faqBodyCol, transition: 'color 200ms' }}>{a}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        <div style={{ borderBottom: `1px solid ${borderCol}`, transition: 'border-color 200ms' }} />
                    </div>
                </div>
                )}

            </div>
        </div>
    );
}
