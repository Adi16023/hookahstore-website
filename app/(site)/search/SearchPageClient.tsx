'use client';

/**
 * /search?q=… — full results from /api/search (the same endpoint as the
 * header live search). Results link to the product page, where the size is
 * chosen and the item is added to the cart.
 */

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTheme } from '../../../components/providers/ThemeProvider';

type Result = {
    id: string;
    name: string;
    slug: string;
    price?: string | null;
    image?: { sourceUrl: string } | null;
    productCategories?: { nodes: { name: string; slug: string }[] };
};

/** "₹850.00 - ₹5,500.00" → "From ₹850.00" */
const displayPrice = (p?: string | null) => {
    if (!p) return '';
    const parts = p.split(/\s[-–]\s/);
    return parts.length > 1 ? `From ${parts[0].trim()}` : p;
};

export default function SearchPageClient() {
    const { dark } = useTheme();
    const router = useRouter();
    const q = (useSearchParams().get('q') ?? '').trim();

    const [input, setInput] = useState(q);
    const [results, setResults] = useState<Result[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => { setInput(q); }, [q]);

    useEffect(() => {
        if (q.length < 2) { setResults([]); return; }
        const ctrl = new AbortController();
        setLoading(true);
        fetch(`/api/search?q=${encodeURIComponent(q)}&mode=consumer`, { signal: ctrl.signal })
            .then(r => r.json())
            .then((d: { products?: { nodes?: Result[] } }) => setResults(d.products?.nodes ?? []))
            .catch(e => { if (e.name !== 'AbortError') setResults([]); })
            .finally(() => setLoading(false));
        return () => ctrl.abort();
    }, [q]);

    const categories = [...new Map(results.flatMap(r => r.productCategories?.nodes ?? []).map(c => [c.slug, c])).values()].slice(0, 6);

    const M = 'var(--font-montserrat), sans-serif';
    const pageBg = dark ? 'transparent' : '#ffffff';
    const textPrim = dark ? '#ffffff' : '#101114';
    const textMuted = dark ? 'rgba(255,255,255,0.55)' : '#6c6d73';
    const border = dark ? 'rgba(255,255,255,0.12)' : '#e4e4e4';
    const cardBg = dark ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const imgBg = dark ? '#1a1a1a' : '#f6f5f8';

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const v = input.trim();
        if (v) router.push(`/search?q=${encodeURIComponent(v)}`);
    };

    return (
        <div className="px-4 md:px-10 xl:px-[120px] py-10 md:py-14" style={{ backgroundColor: pageBg, fontFamily: M, minHeight: '70vh', transition: 'background-color 200ms' }}>
            <h1 className="text-[28px] md:text-[40px]" style={{ fontWeight: 600, color: textPrim, margin: '0 0 20px', transition: 'color 200ms' }}>
                {q ? <>Results for &ldquo;{q}&rdquo;</> : 'Search'}
            </h1>

            <form role="search" onSubmit={submit} className="flex gap-3 mb-8 max-w-[640px]">
                <input
                    type="search" value={input} onChange={e => setInput(e.target.value)}
                    placeholder="Search hookahs, flavours, charcoal…" aria-label="Search products"
                    style={{ flex: 1, height: 48, borderRadius: 8, border: `1px solid ${border}`, padding: '0 16px', fontFamily: M, fontSize: 15, color: textPrim, background: 'transparent' }}
                />
                <button type="submit" style={{ height: 48, padding: '0 24px', borderRadius: 98, border: 'none', background: '#CD142C', color: '#fff', fontFamily: M, fontWeight: 600, fontSize: 14, letterSpacing: '1px', textTransform: 'uppercase', cursor: 'pointer' }}>
                    Search
                </button>
            </form>

            {categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map(c => (
                        <Link key={c.slug} href={`/category/${c.slug}`}
                            style={{ padding: '8px 16px', borderRadius: 98, border: `1px solid ${border}`, color: textPrim, fontSize: 13, fontWeight: 500, textDecoration: 'none' }}>
                            {c.name}
                        </Link>
                    ))}
                </div>
            )}

            {q.length < 2 ? (
                <p style={{ color: textMuted, fontSize: 15 }}>Type at least 2 characters to search.</p>
            ) : loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} style={{ height: 260, borderRadius: 12, background: imgBg, animation: 'pulse 1.4s ease-in-out infinite' }} />)}
                </div>
            ) : results.length === 0 ? (
                <div style={{ border: `1px solid ${border}`, borderRadius: 12, padding: '40px 24px', textAlign: 'center' }}>
                    <p style={{ fontSize: 18, fontWeight: 600, color: textPrim, margin: '0 0 8px' }}>No products found for &ldquo;{q}&rdquo;</p>
                    <p style={{ fontSize: 14, color: textMuted, margin: 0 }}>Try a brand name (Al Fakher, Afzal, Mya) or a product type (bowl, hose, charcoal).</p>
                </div>
            ) : (
                <>
                    <p style={{ fontSize: 13, color: textMuted, marginBottom: 16 }}>
                        Showing <strong style={{ color: textPrim }}>{results.length}</strong> result{results.length === 1 ? '' : 's'}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {results.map(r => (
                            <Link key={r.id} href={`/product/${r.slug}`}
                                style={{ display: 'flex', flexDirection: 'column', borderRadius: 12, border: `1px solid ${border}`, background: cardBg, overflow: 'hidden', textDecoration: 'none' }}>
                                <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 1', background: imgBg }}>
                                    {r.image?.sourceUrl && <Image src={r.image.sourceUrl} alt={r.name} fill className="object-contain p-4" sizes="(min-width:1024px) 20vw, 50vw" />}
                                </div>
                                <div style={{ padding: '12px 14px 16px' }}>
                                    <p style={{ fontSize: 14, fontWeight: 600, color: textPrim, margin: 0, lineHeight: '20px' }}>{r.name}</p>
                                    {r.price && <p style={{ fontSize: 13, color: textMuted, margin: '6px 0 0' }}>{displayPrice(r.price)}</p>}
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
