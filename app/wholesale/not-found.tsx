import Link from 'next/link';
import { TOP_CATEGORIES } from '../../lib/config/categories';

/**
 * Wholesale 404 — shown for notFound() inside /wholesale and for any unmatched
 * /wholesale/* URL (via app/wholesale/[...rest]/page.tsx).
 * Links use the /wholesale prefix, which works on both hosts
 * (middleware serves /wholesale/* directly on the subdomain).
 * Colours come from the --clr-* theme tokens, so it works in dark and light mode.
 */
export default function WholesaleNotFound() {
    return (
        <div className="w-full flex flex-col items-center justify-center px-6 py-24 text-center" style={{ fontFamily: "var(--font-montserrat), sans-serif", minHeight: '60vh' }}>
            <p style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#CD142C', margin: '0 0 12px' }}>
                Wholesale · 404
            </p>
            <h1 className="text-[28px] md:text-[40px]" style={{ fontWeight: 600, lineHeight: 1.3, color: 'var(--clr-text)', margin: '0 0 12px' }}>
                We couldn&apos;t find that page
            </h1>
            <p style={{ fontSize: 15, lineHeight: '24px', color: 'var(--clr-text-muted)', maxWidth: 520, margin: '0 0 32px' }}>
                The link may be out of date. Browse the wholesale catalog below, or head back to the wholesale home page.
            </p>

            <div className="flex flex-wrap justify-center gap-3" style={{ marginBottom: 28 }}>
                {TOP_CATEGORIES.map(c => (
                    <Link key={c.slug} href={`/wholesale/category/${c.slug}`}
                        style={{ padding: '10px 20px', borderRadius: 98, border: '1px solid var(--clr-border)', backgroundColor: 'var(--clr-surface)', color: 'var(--clr-text)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
                        {c.label}
                    </Link>
                ))}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
                <Link href="/wholesale"
                    style={{ backgroundColor: '#CD142C', color: '#ffffff', borderRadius: 98, padding: '12px 28px', fontWeight: 600, fontSize: 14, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none' }}>
                    Wholesale Home
                </Link>
                <Link href="/wholesale/account"
                    style={{ border: '1px solid var(--clr-border)', color: 'var(--clr-text)', borderRadius: 98, padding: '12px 28px', fontWeight: 600, fontSize: 14, letterSpacing: '1px', textTransform: 'uppercase', textDecoration: 'none' }}>
                    My Account
                </Link>
            </div>
        </div>
    );
}
