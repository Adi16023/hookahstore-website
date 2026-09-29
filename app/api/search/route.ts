export const runtime = 'edge';
/**
 * GET /api/search
 *
 * Proxy that keeps browser → WordPress calls off the client.
 *
 * Query params:
 *   q    — search string (min 2 chars)
 *   mode — "consumer" (default) | "wholesale"
 *
 * consumer  → WPGraphQL (includes price)
 * wholesale → WooCommerce REST, filtered server-side to show_in_wholesale = "1",
 *             NO price fields (tier prices are only served to approved wholesalers).
 *
 * Never returns 500: on any upstream failure it logs and returns empty results.
 */
import { NextResponse } from 'next/server';
import { fetchGraphQL, CONSUMER_SEARCH_QUERY } from '../../../lib/graphql';
import { searchWholesaleProducts } from '../../../lib/woocommerce/wholesale-catalog';

const EMPTY = { products: { nodes: [] } };

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') ?? '').trim().slice(0, 100);
    const mode  = searchParams.get('mode') ?? 'consumer';

    if (query.length < 2) {
        return NextResponse.json(EMPTY);
    }

    try {
        if (mode === 'wholesale') {
            const products = await searchWholesaleProducts(query, 10);
            return NextResponse.json({
                products: {
                    nodes: products.map(p => ({
                        id: String(p.id),
                        name: p.name,
                        slug: p.slug,
                        image: p.image ? { sourceUrl: p.image } : null,
                        productCategories: { nodes: p.categories },
                    })),
                },
            });
        }

        // revalidate: 0 → no ISR cache; search results must always be fresh.
        const data = await fetchGraphQL(CONSUMER_SEARCH_QUERY, { query }, 0);
        return NextResponse.json(data ?? EMPTY);
    } catch (err) {
        console.error(`[api/search] ${mode} search failed for "${query}":`, err);
        return NextResponse.json(EMPTY);
    }
}
