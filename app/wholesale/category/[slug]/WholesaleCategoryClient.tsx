'use client';

import Link from 'next/link';
import { useTheme } from '../../../../components/providers/ThemeProvider';
import ProductCard from '../../../../components/ProductCard';
import CategoryHero from '../../../(site)/category/[slug]/CategoryHero';
import { findCategory, findParent, findTopCategory, childrenOf } from '../../../../lib/config/categories';
import { useWholesaleHref } from '../../../../lib/config/use-wholesale-path';
import type { WholesaleCategory, WholesaleProduct } from '../../../../lib/woocommerce/wholesale-catalog';
import { getBadge } from '../../../../lib/utils/badges';

interface Props {
    slug: string;
    category: WholesaleCategory | null;
    products: WholesaleProduct[];
}

function Sep() {
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
        </svg>
    );
}


export default function WholesaleCategoryClient({ slug, category, products }: Props) {
    const { dark } = useTheme();
    const href = useWholesaleHref();

    const title = category?.name ?? findCategory(slug)?.label ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const parent = findParent(slug);
    const top = findTopCategory(slug);
    const subCategories = top ? childrenOf(top) : [];

    const pageBg    = dark ? 'transparent' : '#ffffff';
    const grayBg    = dark ? 'rgba(255,255,255,0.03)' : '#f6f5f8';
    const borderCol = dark ? '#5D5D5D' : '#d7d8db';
    const textPrim  = dark ? '#ffffff' : '#101114';
    const textMuted = dark ? 'rgba(255,255,255,0.55)' : '#6c6d73';
    const chipBg    = dark ? 'rgba(255,255,255,0.06)' : '#ffffff';

    // Breadcrumb: Wholesale Home › [parent] › this category
    const crumbs = [
        { label: 'Wholesale Home', href: href('/') },
        ...(parent.slug ? [{ label: parent.label, href: href(`/category/${parent.slug}`) }] : []),
    ];

    return (
        <div className="w-full min-h-screen" style={{ backgroundColor: pageBg, fontFamily: "var(--font-montserrat), sans-serif", transition: 'background-color 200ms' }}>
            <CategoryHero
                category={category ? {
                    id: String(category.id),
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                    count: products.length,
                    image: category.image ? { sourceUrl: category.image, altText: '' } : null,
                } : null}
                slug={slug}
                title={title}
            />

            <div className="w-full" style={{ backgroundColor: grayBg, transition: 'background-color 200ms' }}>
                {/* Breadcrumb */}
                <div style={{ borderBottom: `1px solid ${borderCol}`, minHeight: 49, display: 'flex', alignItems: 'center', transition: 'border-color 200ms' }}>
                    <div className="flex items-center px-6 md:px-10 xl:px-[120px] flex-wrap" style={{ paddingTop: 10, paddingBottom: 10, gap: 4 }}>
                        {crumbs.map(c => (
                            <span key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Link href={c.href} style={{ fontSize: 16, color: textMuted, whiteSpace: 'nowrap', textDecoration: 'none', transition: 'color 200ms' }}>
                                    {c.label}
                                </Link>
                                <Sep />
                            </span>
                        ))}
                        <span aria-current="page" style={{ fontSize: 16, color: textPrim, whiteSpace: 'nowrap' }}>{title}</span>
                    </div>
                </div>

                {/* Sub-category chips (top-level categories only) */}
                {subCategories.length > 0 && (
                    <div className="px-4 md:px-10 xl:px-[120px] pt-6 flex flex-wrap gap-2">
                        {subCategories.map(c => (
                            <Link key={c.slug} href={href(`/category/${c.slug}`)}
                                style={{ display: 'inline-flex', alignItems: 'center', padding: '8px 16px', borderRadius: 98, border: `1px solid ${borderCol}`, backgroundColor: chipBg, color: textPrim, fontSize: 13, fontWeight: 500, textDecoration: 'none', transition: 'background-color 200ms, color 200ms, border-color 200ms' }}>
                                {c.label}
                            </Link>
                        ))}
                    </div>
                )}

                {/* Product grid */}
                <div className="px-4 md:px-10 xl:px-[120px] pt-8 pb-16">
                    {products.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '72px 16px' }}>
                            <p style={{ fontSize: 22, fontWeight: 600, color: textPrim, marginBottom: 10, transition: 'color 200ms' }}>
                                Products coming soon
                            </p>
                            <p style={{ fontSize: 15, lineHeight: '22px', color: textMuted, marginBottom: 24, transition: 'color 200ms' }}>
                                We&apos;re adding wholesale stock to this category. Browse another category or contact us for a quote.
                            </p>
                            <Link href={parent.slug ? href(`/category/${parent.slug}`) : href('/')}
                                style={{ display: 'inline-block', backgroundColor: '#CD142C', color: '#ffffff', borderRadius: 98, padding: '12px 28px', fontWeight: 600, fontSize: 14, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none' }}>
                                {parent.slug ? `Shop ${parent.label}` : 'Wholesale Home'}
                            </Link>
                        </div>
                    ) : (
                        <>
                            <p style={{ fontSize: 13, color: textMuted, marginBottom: 20 }}>
                                Showing <strong style={{ color: textPrim }}>{products.length}</strong> products
                            </p>
                            <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                                {products.map(p => (
                                    <ProductCard
                                        key={p.id}
                                        productId={p.id}
                                        image={p.image || '/placeholder.png'}
                                        title={p.name}
                                        description={p.description}
                                        price=""
                                        variations={p.options}
                                        badge={getBadge({ ribbon: p.ribbon })}
                                        inStock={p.stockStatus !== 'outofstock'}
                                        accentColor="#FF6B2B"
                                        href={href(`/product/${p.slug}`)}
                                        forceWholesale
                                    />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
