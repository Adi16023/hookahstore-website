'use client';

import Link from 'next/link';
import ProductCard from '../../../../components/ProductCard';
import type { WPProductNode } from '../../../../lib/graphql';
import { getBadge } from '../../../../lib/utils/badges';
import { buildVariationMaps, pickSizeAttribute, isInStock } from '../../../../lib/utils/variations';

interface CategoryGridProps {
    displayed: WPProductNode[];
    /** Products in the category before filters — 0 means "coming soon" */
    totalProducts: number;
    textPrim: string;
    textMuted: string;
    onClearFilters: () => void;
    /** Where the "coming soon" state sends shoppers instead */
    shopAllHref?: string;
    shopAllLabel?: string;
}

export default function CategoryGrid({ displayed, totalProducts, textPrim, textMuted, onClearFilters, shopAllHref = '/', shopAllLabel = 'Home' }: CategoryGridProps) {
    // Empty or not-yet-created WooCommerce category → friendly placeholder
    if (totalProducts === 0) {
        return (
            <div className="px-4 md:px-10 xl:px-[120px] pt-8 pb-16">
                <div style={{ textAlign: 'center', padding: '72px 16px', fontFamily: "var(--font-montserrat), sans-serif" }}>
                    <p style={{ fontSize: 22, fontWeight: 600, color: textPrim, marginBottom: 10, transition: 'color 200ms' }}>
                        Products coming soon
                    </p>
                    <p style={{ fontSize: 15, lineHeight: '22px', color: textMuted, marginBottom: 24, transition: 'color 200ms' }}>
                        We&apos;re stocking this category right now. Check back shortly, or browse what&apos;s already in store.
                    </p>
                    <Link href={shopAllHref}
                        style={{ display: 'inline-block', backgroundColor: '#CD142C', color: '#ffffff', borderRadius: 98, padding: '12px 28px', fontWeight: 600, fontSize: 14, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none' }}>
                        {shopAllHref === '/' ? 'Back to Home' : `Shop ${shopAllLabel}`}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 md:px-10 xl:px-[120px] pt-8 pb-16">
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 13, color: textMuted, marginBottom: 20 }}>
                Showing <strong style={{ color: textPrim }}>{displayed.length}</strong> products
            </p>

            {displayed.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: textMuted }}>
                    <p style={{ fontSize: 16, marginBottom: 8, fontFamily: "var(--font-montserrat), sans-serif" }}>No products match your filters.</p>
                    <button onClick={onClearFilters}
                        style={{ background: 'none', color: '#D32F2F', border: 'none', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: 14, cursor: 'pointer', textDecoration: 'underline' }}>
                        Clear all filters
                    </button>
                </div>
            )}

            {displayed.length > 0 && (
                <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                    {displayed.map(product => {
                        // ── Size pills: the size/weight/pack attribute's options (not every attribute) ──
                        const isVariable = (product.variations?.nodes?.length ?? 0) > 0;
                        const variations: string[] = isVariable
                            ? (pickSizeAttribute(product.attributes?.nodes)?.options ?? [])
                            : [];

                        // ── Per-option price / variation ID / availability by EXACT attribute match.
                        //    Keys are the same values on both sides (WooGraphQL option = variation value). ──
                        const { prices: variationPrices, ids: variationIds, available: variationAvailable } =
                            buildVariationMaps(variations, product.variations?.nodes);

                        // ── Badge: ACF ribbon → product tags (never guessed from the name) ──
                        const badge = getBadge({ ribbon: product.productRibbon, tags: product.productTags?.nodes });

                        return (
                            <ProductCard
                                key={product.id}
                                productId={product.databaseId}
                                image={product.image?.sourceUrl || '/placeholder.png'}
                                title={product.name}
                                description={product.shortDescription?.replace(/<[^>]*>/g, '').trim() || ''}
                                price={product.price || ''}
                                variations={variations}
                                variationPrices={variationPrices}
                                variationIds={variationIds}
                                variationAvailable={variationAvailable}
                                inStock={isInStock(product.stockStatus)}
                                badge={badge}
                                accentColor="#FF6B2B"
                                href={`/product/${product.slug}`}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}
