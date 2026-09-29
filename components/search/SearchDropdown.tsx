'use client';

import Image from 'next/image';

interface Product {
    id: string;
    name: string;
    slug: string;
    price?: string;
    image?: {
        sourceUrl: string;
    };
    productCategories?: {
        nodes: Array<{
            name: string;
            slug: string;
        }>;
    };
}

interface Category {
    name: string;
    slug: string;
}

interface SearchDropdownProps {
    products: Product[];
    categories: Category[];
    totalCount: number;
    loading: boolean;
    query: string;
    mode: 'consumer' | 'wholesale';
    onClose: () => void;
}

function SkeletonItem() {
    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
            <div className="w-12 h-12 bg-gray-700/30 rounded animate-pulse flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700/30 rounded w-3/4 animate-pulse" />
                <div className="h-3 bg-gray-700/30 rounded w-1/2 animate-pulse" />
            </div>
        </div>
    );
}

export default function SearchDropdown({
    products,
    categories,
    totalCount,
    loading,
    query,
    mode,
    onClose,
}: SearchDropdownProps) {
    const baseUrl = mode === 'wholesale' ? '/wholesale' : '';

    return (
        <div
            className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-2xl overflow-hidden z-50"
            style={{ maxHeight: '500px' }}
        >
            {loading ? (
                <div className="overflow-y-auto" style={{ maxHeight: '450px' }}>
                    {[1, 2, 3, 4].map((i) => (
                        <SkeletonItem key={i} />
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="px-4 py-8 text-center">
                    <p className="text-white/60 font-montserrat text-sm">
                        No products found for "{query}"
                    </p>
                </div>
            ) : (
                <>
                    {/* Categories Section (TOP) */}
                    {categories.length > 0 && (
                        <div className="px-4 py-3 border-b border-white/10">
                            <p className="text-white/40 font-montserrat text-xs uppercase mb-2">Categories</p>
                            <div className="flex gap-2 flex-wrap">
                                {categories.map((category) => (
                                    <a
                                        key={category.slug}
                                        href={mode === 'wholesale' ? `/wholesale/category/${category.slug}` : `/category/${category.slug}?q=${encodeURIComponent(query)}`}
                                        onClick={onClose}
                                        className="inline-flex items-center px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors"
                                    >
                                        <span className="text-xs font-montserrat text-white">
                                            {category.name}
                                        </span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Products Section (MIDDLE) - Max 5 products */}
                    <div className="overflow-y-auto" style={{ maxHeight: '350px' }}>
                        {products.slice(0, 5).map((product) => (
                            <a
                                key={product.id}
                                href={`${baseUrl}/product/${product.slug}`}
                                onClick={onClose}
                                className="flex items-center gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors group"
                            >
                                {/* Product Image */}
                                <div className="relative w-12 h-12 flex-shrink-0 bg-gray-800 rounded overflow-hidden">
                                    {product.image?.sourceUrl ? (
                                        <Image
                                            src={product.image.sourceUrl}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            sizes="48px"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-700/30" />
                                    )}
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-montserrat font-medium text-white text-sm truncate group-hover:text-[#00EBD8] transition-colors">
                                        {product.name}
                                    </p>

                                    {/* Category Pills (under product name) */}
                                    {product.productCategories?.nodes && product.productCategories.nodes.length > 0 && (
                                        <div className="flex gap-1 mt-1 flex-wrap">
                                            {product.productCategories.nodes.slice(0, 2).map((category) => (
                                                <span
                                                    key={category.slug}
                                                    className="text-[10px] font-montserrat text-white/50 bg-white/5 px-2 py-0.5 rounded"
                                                >
                                                    {category.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Price (Consumer Only) */}
                                {mode === 'consumer' && product.price && (
                                    <div className="flex-shrink-0">
                                        <span className="font-montserrat font-semibold text-white text-sm">
                                            {product.price}
                                        </span>
                                    </div>
                                )}
                            </a>
                        ))}
                    </div>

                    {/* Show All Results CTA (BOTTOM) */}
                    <a
                        href={`/search?q=${encodeURIComponent(query)}`}
                        onClick={onClose}
                        className="flex items-center justify-center px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors border-t border-white/10"
                    >
                        <span className="font-montserrat font-semibold text-[#00EBD8] text-sm uppercase">
                            Show all {totalCount} result{totalCount !== 1 ? 's' : ''}
                        </span>
                        <svg
                            className="w-4 h-4 ml-2 text-[#00EBD8]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </a>
                </>
            )}
        </div>
    );
}
