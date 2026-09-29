export const runtime = 'edge';
// ISR: revalidate individual blog posts every 3600 seconds (1 hour).
export const revalidate = 3600;
// Note: generateStaticParams is intentionally omitted — this would pre-build
// every post at deploy time; on-demand ISR is preferred for large post counts.
import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
    fetchGraphQL,
    GET_POST_QUERY,
    GET_POSTS_QUERY,
    WPPostFull,
    WPPost,
} from '../../../lib/graphql';
import BlogPostPageClient from '../../../components/blog/BlogPostPageClient';

// ── Request-level deduplication ────────────────────────────────────────────
// React.cache() memoises the result per (slug) per render pass so that
// generateMetadata and the page body share one network round-trip.
const getPost = cache((slug: string) =>
    fetchGraphQL(GET_POST_QUERY, { slug }, 3600)
);


// ── Dynamic metadata ───────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const data = await getPost(slug); // deduplicated via React.cache
        const post: WPPostFull = data?.post;
        if (!post) return { title: 'Blog Post' };
        return {
            title: post.title,
            description: post.excerpt?.replace(/<[^>]+>/g, '').slice(0, 160) ?? '',
        };
    } catch {
        return { title: 'Blog Post' };
    }
}

// ── Page ──────────────────────────────────────────────────────────────────
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // getPost(slug) is memoised — returns the same promise already resolved
    // by generateMetadata above; no second network call to WordPress.
    const [postResult, allPostsResult] = await Promise.allSettled([
        getPost(slug),
        fetchGraphQL(GET_POSTS_QUERY, { first: 5 }, 3600),
    ]);

    const post: WPPostFull | null =
        postResult.status === 'fulfilled' ? postResult.value?.post ?? null : null;

    if (!post) notFound();

    // Related = other posts excluding current
    const related: WPPost[] = (
        allPostsResult.status === 'fulfilled'
            ? allPostsResult.value?.posts?.nodes ?? []
            : []
    ).filter((p: WPPost) => p.slug !== slug).slice(0, 4);

    return <BlogPostPageClient post={post} related={related} />;
}
