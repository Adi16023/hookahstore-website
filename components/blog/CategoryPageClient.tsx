'use client';

import Link from 'next/link';
import BlogHeader from './BlogHeader';
import BlogFooter from './BlogFooter';
import { useTheme } from '../providers/ThemeProvider';
import type { WPPost } from '../../lib/graphql';

const FALLBACK_IMG = '/blog/9a11ae8c8f10a3e0c0f5077db36d33da082a6a69.png';

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function Tag({ name }: { name: string }) {
    return (
        <span
            className="inline-flex items-center px-2 bg-[#D32F2F] text-white text-[12px] font-montserrat font-medium rounded-[4px] whitespace-nowrap"
            style={{ height: '24px' }}
        >
            {name}
        </span>
    );
}

function ArticleMeta({ tags, date, author, borderCol, mutedCol }: {
    tags: string[];
    date: string;
    author: string;
    borderCol: string;
    mutedCol: string;
}) {
    return (
        <div className="pt-3 mt-3" style={{ borderTop: `1px solid ${borderCol}` }}>
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((t, i) => <Tag key={i} name={t} />)}
                </div>
            )}
            <div className="flex items-center gap-2 text-[12px] font-montserrat mt-1" style={{ color: mutedCol }}>
                <span>{date}</span>
                <span>by {author}</span>
            </div>
        </div>
    );
}

export default function CategoryPageClient({
    categoryName,
    categoryDescription,
    posts,
}: {
    categoryName: string;
    categoryDescription: string;
    posts: WPPost[];
}) {
    const { dark } = useTheme();

    const pageBg = dark ? 'transparent' : '#ffffff';
    const textCol = dark ? '#e8e9ef' : '#1b1c1f';
    const mutedCol = dark ? 'rgba(255,255,255,0.5)' : '#6c6d73';
    const borderCol = dark ? 'rgba(255,255,255,0.12)' : '#ebebed';
    const borderBot = dark ? 'rgba(255,255,255,0.08)' : '#ebebeb';
    const sectionBg = dark ? 'transparent' : '#f6f5f8';
    const headingCol = dark ? '#ffffff' : '#1b1c1f';
    const loadMoreBg = dark ? 'rgba(255,255,255,0.08)' : '#ffffff';
    const loadMoreBdr = dark ? 'rgba(255,255,255,0.15)' : '#ebebed';

    const featuredPost = posts[0] ?? null;
    const gridPosts = posts.slice(1);

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', transition: 'background-color 200ms', fontFamily: "var(--font-montserrat), sans-serif" }}>
            <BlogHeader />

            <main>
                {/* ── Breadcrumb — aligned with header logo ── */}
                <div style={{ borderBottom: `1px solid ${borderBot}`, minHeight: '49px', display: 'flex', alignItems: 'center', transition: 'border-color 200ms' }}>
                    <div className="w-full max-w-[1425px] mx-auto flex items-center px-4 md:px-6 lg:px-[64.5px]" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                        <Link
                            href="/blog"
                            style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: mutedCol, whiteSpace: 'nowrap' }}
                        >
                            Home
                        </Link>
                        <div style={{ width: '16px', height: '16px', margin: '0 4px', flexShrink: 0 }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
                            </svg>
                        </div>
                        <Link
                            href="/blog"
                            style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: mutedCol, whiteSpace: 'nowrap' }}
                        >
                            Blog
                        </Link>
                        <div style={{ width: '16px', height: '16px', margin: '0 4px', flexShrink: 0 }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span aria-current="page" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textCol, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '50vw' }}>
                            {categoryName}
                        </span>
                    </div>
                </div>

                {/* ── Category Header ── */}
                <div
                    className="max-w-[1425px] mx-auto px-4 md:px-6 lg:px-[64.5px] pt-6 pb-8"
                    style={{ borderBottom: `1px solid ${borderCol}` }}
                >
                    <h1
                        className="font-montserrat font-semibold text-[28px] md:text-[40px] leading-[36px] md:leading-[56px]"
                        style={{ color: headingCol }}
                    >
                        {categoryName}
                    </h1>
                    {categoryDescription && (
                        <p
                            className="font-montserrat text-[14px] leading-[20px] mt-2 max-w-[722px]"
                            style={{ color: mutedCol }}
                            dangerouslySetInnerHTML={{ __html: categoryDescription }}
                        />
                    )}
                </div>

                {/* ── Featured Article (first post) ── */}
                {featuredPost && (
                    <div className="max-w-[1425px] mx-auto px-4 md:px-6 lg:px-[64.5px] pt-[40px] pb-[40px] md:pb-[64px]">
                        <Link href={`/blog/${featuredPost.slug}`}>
                            <div className="flex flex-col md:flex-row gap-6 md:gap-[48px] group cursor-pointer">
                                {/* Featured image */}
                                <div
                                    className="relative rounded-[12px] overflow-hidden flex-shrink-0 w-full md:w-1/2"
                                    style={{ height: 'clamp(200px, 30vw, 364px)' }}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={featuredPost.featuredImage?.node.sourceUrl ?? FALLBACK_IMG}
                                        alt={featuredPost.featuredImage?.node.altText ?? featuredPost.title}
                                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                </div>

                                {/* Featured content */}
                                <div className="flex flex-col justify-start md:w-1/2">
                                    <h2
                                        className="font-montserrat font-semibold text-[24px] md:text-[30px] leading-[34px] md:leading-[48px] group-hover:opacity-80 transition-opacity"
                                        style={{ color: headingCol }}
                                    >
                                        {featuredPost.title}
                                    </h2>
                                    {featuredPost.excerpt && (
                                        <p
                                            className="font-montserrat text-[15px] leading-[24px] mt-3 max-w-[579px]"
                                            style={{ color: mutedCol }}
                                            dangerouslySetInnerHTML={{ __html: featuredPost.excerpt.replace(/<[^>]+>/g, '').slice(0, 180) + '…' }}
                                        />
                                    )}
                                    <ArticleMeta
                                        tags={featuredPost.tags.nodes.map(t => t.name)}
                                        date={formatDate(featuredPost.date)}
                                        author={featuredPost.author.node.name}
                                        borderCol={borderCol}
                                        mutedCol={mutedCol}
                                    />
                                </div>
                            </div>
                        </Link>
                    </div>
                )}

                {/* ── All Articles grid ── */}
                {gridPosts.length > 0 && (
                    <section
                        style={{ backgroundColor: sectionBg, paddingTop: '40px', paddingBottom: '96px', transition: 'background-color 200ms' }}
                    >
                        <div className="max-w-[1425px] mx-auto px-4 md:px-6 lg:px-[64.5px]">
                            <h2
                                className="font-montserrat font-semibold text-[18px] md:text-[26px] leading-[36px] mb-[32px] md:mb-[40px]"
                                style={{ color: headingCol }}
                            >
                                All Articles
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-x-[24px] gap-y-[32px] md:gap-y-[48px]">
                                {gridPosts.map((post) => (
                                    <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                                        <article>
                                            <div className="relative rounded-[12px] overflow-hidden w-full" style={{ height: '172px' }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={post.featuredImage?.node.sourceUrl ?? FALLBACK_IMG}
                                                    alt={post.featuredImage?.node.altText ?? post.title}
                                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-[rgba(22,22,22,0.4)] rounded-[12px]" />
                                            </div>
                                            <h3
                                                className="font-montserrat font-semibold text-[18px] leading-[28px] mt-4 group-hover:opacity-80 transition-opacity"
                                                style={{ color: textCol, minHeight: '56px' }}
                                            >
                                                {post.title}
                                            </h3>
                                            <ArticleMeta
                                                tags={post.tags.nodes.map(t => t.name)}
                                                date={formatDate(post.date)}
                                                author={post.author.node.name}
                                                borderCol={borderCol}
                                                mutedCol={mutedCol}
                                            />
                                        </article>
                                    </Link>
                                ))}
                            </div>

                            {posts.length === 0 && (
                                <p className="text-center py-20 font-montserrat text-[16px]" style={{ color: mutedCol }}>
                                    No articles in this category yet.
                                </p>
                            )}

                            {gridPosts.length >= 11 && (
                                <div className="flex justify-center mt-[48px] md:mt-[60px]">
                                    <button
                                        className="rounded-[70px] font-montserrat font-semibold text-[14px] uppercase tracking-[1px] flex items-center justify-center transition-colors"
                                        style={{ height: '40px', width: '155.81px', backgroundColor: loadMoreBg, border: `1px solid ${loadMoreBdr}`, color: textCol }}
                                    >
                                        Load More
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* Empty state */}
                {posts.length === 0 && (
                    <div className="max-w-[1425px] mx-auto px-4 md:px-6 lg:px-[64.5px] py-24 text-center">
                        <p className="font-montserrat text-[16px]" style={{ color: mutedCol }}>
                            No articles in this category yet. Check back soon!
                        </p>
                        <Link
                            href="/blog"
                            className="inline-block mt-6 font-montserrat font-semibold text-[14px] uppercase tracking-[1px] rounded-[70px] px-6 py-2"
                            style={{ backgroundColor: '#D32F2F', color: '#ffffff' }}
                        >
                            Back to Blog
                        </Link>
                    </div>
                )}
            </main>

            <BlogFooter />
        </div>
    );
}
