export const runtime = 'edge';
// ISR: revalidate blog list every 600 seconds (10 minutes).
export const revalidate = 600;
import { fetchGraphQL, GET_POSTS_QUERY, GET_CATEGORIES_QUERY, WPPost, WPCategory } from '../../lib/graphql';
import BlogPageClient from '../../components/blog/BlogPageClient';

export default async function BlogPage() {
    const [postsResult, categoriesResult] = await Promise.allSettled([
        fetchGraphQL(GET_POSTS_QUERY, { first: 50 }, 600),
        fetchGraphQL(GET_CATEGORIES_QUERY, {}, 600),
    ]);

    const posts: WPPost[] =
        postsResult.status === 'fulfilled' ? postsResult.value?.posts?.nodes ?? [] : [];

    const categories: WPCategory[] =
        categoriesResult.status === 'fulfilled'
            ? categoriesResult.value?.categories?.nodes ?? []
            : [];

    return <BlogPageClient posts={posts} categories={categories} />;
}
