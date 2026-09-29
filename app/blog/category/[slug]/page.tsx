export const runtime = 'edge';
// Edge runtime: category pages render on-demand at the Cloudflare edge.
// generateStaticParams is intentionally omitted — incompatible with runtime='edge'.
import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    fetchGraphQL,
    GET_CATEGORY_POSTS_QUERY,
    WPPost,
    WPCategory,
} from '../../../../lib/graphql';
import CategoryPageClient from '../../../../components/blog/CategoryPageClient';

// ── Request-level deduplication ────────────────────────────────────────────
// React.cache() memoises the result per (slug) per render pass so that
// generateMetadata and the page body share one network round-trip.
const getCategoryPosts = cache((slug: string) =>
    fetchGraphQL(GET_CATEGORY_POSTS_QUERY, { slug }, 3600)
);


// ── Dynamic metadata ───────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const data = await getCategoryPosts(slug); // deduplicated via React.cache
        const cat = data?.category;
        if (!cat) return { title: 'Blog Category' };
        return {
            title: `${cat.name} — Hookah Blog`,
            description: cat.description?.replace(/<[^>]+>/g, '').slice(0, 160) || `Browse all ${cat.name} articles on The Hookah Store blog.`,
        };
    } catch {
        return { title: 'Blog Category' };
    }
}

// ── Page ──────────────────────────────────────────────────────────────────
export default async function BlogCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let categoryName = '';
    let categoryDescription = '';
    let posts: WPPost[] = [];

    try {
        // getCategoryPosts(slug) is memoised — returns the same promise already
        // resolved by generateMetadata above; no second network call to WordPress.
        const data = await getCategoryPosts(slug);
        const cat = data?.category;

        if (!cat) notFound();

        categoryName = cat.name ?? '';
        categoryDescription = cat.description ?? '';
        posts = cat.posts?.nodes ?? [];
    } catch {
        notFound();
    }

    return (
        <CategoryPageClient
            categoryName={categoryName}
            categoryDescription={categoryDescription}
            posts={posts}
        />
    );
}
