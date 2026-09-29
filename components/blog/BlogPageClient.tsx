'use client';

import { useRef } from 'react';
import Link from 'next/link';
import BlogHeader from './BlogHeader';
import BlogFooter from './BlogFooter';
import { useTheme } from '../providers/ThemeProvider';
import type { WPPost, WPCategory } from '../../lib/graphql';

// ── Static category image map ─────────────────────────────────────────────
const CATEGORY_IMAGES: Record<string, string> = {
    'guides': '/blog/acf5784fff453eb48cac18f9bd39db7f61236140.png',
    'how-to': '/blog/acf5784fff453eb48cac18f9bd39db7f61236140.png',
    'how-to-hookah-education': '/blog/acf5784fff453eb48cac18f9bd39db7f61236140.png',
    'reviews': '/blog/90a90f50fc04ee517afce5f60ecdfefe56f7a61c.png',
    'tobacco': '/blog/ad658a296743b22bc5418a67e5a780069fa20850.png',
    'shisha-tobacco': '/blog/ad658a296743b22bc5418a67e5a780069fa20850.png',
    'hookahs': '/blog/ac184356f6d23985f61959adde0b56a5b413ca32.png',
    'general': '/blog/acf5784fff453eb48cac18f9bd39db7f61236140.png',
    'news': '/blog/90a90f50fc04ee517afce5f60ecdfefe56f7a61c.png',
    'business': '/blog/ad658a296743b22bc5418a67e5a780069fa20850.png',
    'hookah-blog-for-business': '/blog/ad658a296743b22bc5418a67e5a780069fa20850.png',
    'hookah-cleaning': '/blog/ac184356f6d23985f61959adde0b56a5b413ca32.png',
    'hookah-accessories': '/blog/acf5784fff453eb48cac18f9bd39db7f61236140.png',
    'hookah-bowls': '/blog/ac184356f6d23985f61959adde0b56a5b413ca32.png',
    'hookah-set-up': '/blog/ac184356f6d23985f61959adde0b56a5b413ca32.png',
    'heat-management-devices': '/blog/90a90f50fc04ee517afce5f60ecdfefe56f7a61c.png',
    'frequently-asked-hookah-questions': '/blog/acf5784fff453eb48cac18f9bd39db7f61236140.png',
};
const FALLBACK_IMG = '/blog/9a11ae8c8f10a3e0c0f5077db36d33da082a6a69.png';
const FALLBACK_CAT_IMG = '/blog/acf5784fff453eb48cac18f9bd39db7f61236140.png';

function formatDate(iso: string): string {
    const d = new Date(iso);
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

function Tag({ children }: { children: string }) {
    return (
        <span
            className="inline-flex items-center px-2 bg-[#D32F2F] text-white text-[12px] font-montserrat font-medium rounded-[4px] whitespace-nowrap"
            style={{ height: '24px' }}
        >
            {children}
        </span>
    );
}

function ArticleMeta({ tags, date, author, dark }: { tags: string[]; date: string; author: string; dark: boolean }) {
    return (
        <div className="pt-3 mt-3" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : '#ebebed'}` }}>
            {tags.length > 0 && (
                <div className="flex flex-wrap gap-[8px] mb-2">
                    {tags.map((t, i) => <Tag key={i}>{t}</Tag>)}
                </div>
            )}
            <div
                className="flex items-center gap-2 text-[12px] font-montserrat mt-1"
                style={{ color: dark ? 'rgba(255,255,255,0.55)' : '#6c6d73' }}
            >
                <span>{date}</span>
                <span>by {author}</span>
            </div>
        </div>
    );
}

// ── Category Slider ────────────────────────────────────────────────────────
function CategorySlider({ categories, dark }: { categories: WPCategory[]; dark: boolean }) {
    const sliderRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: 'prev' | 'next') => {
        const container = sliderRef.current;
        if (!container) return;
        // Scroll by full visible width so exactly 4 cards flip at once
        container.scrollBy({ left: dir === 'next' ? container.clientWidth : -container.clientWidth, behavior: 'smooth' });
    };

    const arrowBg = dark ? 'rgba(255,255,255,0.08)' : '#ffffff';
    const arrowBorder = dark ? 'rgba(255,255,255,0.15)' : '#d7d8db';
    const arrowStroke = dark ? '#ffffff' : '#35363B';

    return (
        <section className="blog-alt-bg" style={{ padding: '64px 0', transition: 'background-color 200ms' }}>
            <div className="max-w-[1425px] mx-auto px-4 md:px-6 lg:px-[64.5px]">
                {/* Header */}
                <div className="flex items-center justify-between mb-[32px]">
                    <h2
                        className="font-montserrat font-semibold text-[18px] md:text-[26px] leading-[36px]"
                        style={{ color: dark ? '#ffffff' : '#1b1c1f' }}
                    >
                        Categories
                    </h2>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scroll('prev')}
                            className="w-[40px] h-[40px] rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                            style={{ backgroundColor: arrowBg, border: `1px solid ${arrowBorder}` }}
                            aria-label="Previous categories"
                        >
                            <svg width="15" height="11" viewBox="0 0 11.451 10.196" fill="none">
                                <path d="M4.889 9.49L0.706 5.098M0.706 5.098L4.889 0.706M0.706 5.098H10.745" stroke={arrowStroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.412" />
                            </svg>
                        </button>
                        <button
                            onClick={() => scroll('next')}
                            className="w-[40px] h-[40px] rounded-full flex items-center justify-center flex-shrink-0 transition-colors"
                            style={{ backgroundColor: arrowBg, border: `1px solid ${arrowBorder}` }}
                            aria-label="Next categories"
                        >
                            <svg width="15" height="11" viewBox="0 0 11.451 10.196" fill="none">
                                <path d="M6.562 0.706L10.745 5.098M10.745 5.098L6.562 9.49M10.745 5.098H0.706" stroke={arrowStroke} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.412" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Single-row slider — exactly 4 visible, no peek */}
                <div
                    ref={sliderRef}
                    className="flex gap-[24px] overflow-x-hidden"
                >
                    {categories.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/blog/category/${cat.slug}`}
                            className="relative rounded-[12px] overflow-hidden flex-shrink-0"
                            style={{ width: 'calc(25% - 18px)', aspectRatio: '306 / 409' }}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={CATEGORY_IMAGES[cat.slug] ?? FALLBACK_CAT_IMG}
                                alt={cat.name}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div
                                className="absolute inset-0"
                                style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%)' }}
                            />
                            <div className="absolute bottom-0 inset-x-0 pb-[76px] flex items-center justify-center px-2">
                                <span className="font-montserrat font-semibold text-white text-[21px] leading-[31.5px] text-center">
                                    {cat.name}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ── Main Client Page ───────────────────────────────────────────────────────
export default function BlogPageClient({
    posts,
    categories,
}: {
    posts: WPPost[];
    categories: WPCategory[];
}) {
    const { dark } = useTheme();

    const pageBg = dark ? 'transparent' : '#ffffff';
    const headingCol = dark ? '#ffffff' : '#1b1c1f';
    const articleTitle = dark ? '#e8e9ef' : '#1b1c1f';
    const sectionBg = dark ? 'transparent' : '#f6f5f8';
    const loadMoreBg = dark ? 'rgba(255,255,255,0.08)' : '#ffffff';
    const loadMoreBorder = dark ? 'rgba(255,255,255,0.15)' : '#ebebed';
    const loadMoreText = dark ? '#ffffff' : '#1b1c1f';

    const heroPost = posts[0] ?? null;
    const recentPosts = posts.slice(0, 3);
    const allPosts = posts;

    return (
        <div className="blog-bg" style={{ minHeight: '100vh', transition: 'background-color 200ms' }}>
            <BlogHeader />

            <main>
                {/* ── Hero ── */}
                {heroPost && (
                    <Link href={`/blog/${heroPost.slug}`}>
                        <section className="relative overflow-hidden h-[329px] md:h-[596px] w-full md:max-w-[1296px] md:mx-auto mt-0 md:mt-[40px] rounded-none md:rounded-[12px] cursor-pointer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={heroPost.featuredImage?.node.sourceUrl ?? FALLBACK_IMG}
                                alt={heroPost.featuredImage?.node.altText ?? heroPost.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 60%)' }} />
                            <div className="absolute inset-0 rounded-[4px]" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.7) 39.5%, rgba(0,0,0,0) 100%)' }} />
                            <div className="absolute inset-0 flex flex-col justify-end">
                                <div className="px-4 md:px-[48px] pb-[16px] md:pb-[34px]">
                                    <h1 className="text-white font-montserrat font-semibold mb-3 md:mb-4" style={{ fontSize: 'clamp(26px, 4vw, 40px)', lineHeight: 'clamp(36px, 5vw, 56px)' }}>
                                        {heroPost.title}
                                    </h1>
                                    {heroPost.excerpt && (
                                        <div className="hidden md:block text-white font-montserrat text-[18px] leading-[24px] mb-4 max-w-[526px]" dangerouslySetInnerHTML={{ __html: heroPost.excerpt }} />
                                    )}
                                    <div className="border-t border-[rgba(255,255,255,0.24)] pt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                                        {heroPost.tags.nodes.map((t) => <Tag key={t.slug}>{t.name}</Tag>)}
                                        <span className="font-montserrat text-[rgba(255,255,255,0.64)] text-[12px]">{formatDate(heroPost.date)}</span>
                                        <span className="font-montserrat text-[rgba(255,255,255,0.64)] text-[12px]">by {heroPost.author.node.name}</span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </Link>
                )}

                {/* ── Most Recent ── */}
                {recentPosts.length > 0 && (
                    <section className="max-w-[1425px] mx-auto px-4 md:px-6 lg:px-[64.5px] pt-[40px] md:pt-[64px] pb-[40px] md:pb-[64px]">
                        <h2 className="font-montserrat font-semibold text-[18px] md:text-[26px] leading-[36px] mb-[24px] md:mb-[32px]" style={{ color: headingCol }}>
                            Most Recent
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-[24px] gap-y-[32px]">
                            {recentPosts.map((post) => (
                                <Link key={post.id} href={`/blog/${post.slug}`}>
                                    <article>
                                        <div className="relative rounded-[12px] overflow-hidden w-full" style={{ height: 'clamp(171px, 20vw, 234px)' }}>
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={post.featuredImage?.node.sourceUrl ?? FALLBACK_IMG}
                                                alt={post.featuredImage?.node.altText ?? post.title}
                                                className="absolute inset-0 w-full h-full object-cover"
                                            />
                                        </div>
                                        <h3 className="font-montserrat font-semibold text-[18px] leading-[28px] mt-4 transition-colors" style={{ color: articleTitle, minHeight: '56px' }}>{post.title}</h3>
                                        <ArticleMeta
                                            tags={post.tags.nodes.map((t) => t.name)}
                                            date={formatDate(post.date)}
                                            author={post.author.node.name}
                                            dark={dark}
                                        />
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Categories Slider ── */}
                {categories.length > 0 && <CategorySlider categories={categories} dark={dark} />}

                {/* ── All Articles ── */}
                {allPosts.length > 0 && (
                    <section className="blog-alt-bg" style={{ paddingTop: '40px', paddingBottom: '96px', transition: 'background-color 200ms' }}>
                        <div className="max-w-[1425px] mx-auto px-4 md:px-6 lg:px-[64.5px]">
                            <h2 className="font-montserrat font-semibold text-[18px] md:text-[26px] leading-[36px] mb-[32px] md:mb-[40px]" style={{ color: headingCol }}>
                                All Articles
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-[24px] gap-y-[32px] md:gap-y-[48px]">
                                {allPosts.map((post) => (
                                    <Link key={post.id} href={`/blog/${post.slug}`}>
                                        <article>
                                            <div className="relative rounded-[12px] overflow-hidden w-full" style={{ height: '172px' }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={post.featuredImage?.node.sourceUrl ?? FALLBACK_IMG}
                                                    alt={post.featuredImage?.node.altText ?? post.title}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-[rgba(22,22,22,0.4)] rounded-[12px]" />
                                            </div>
                                            <h3 className="font-montserrat font-semibold text-[18px] leading-[28px] mt-4 transition-colors" style={{ color: articleTitle, minHeight: '56px' }}>{post.title}</h3>
                                            <ArticleMeta
                                                tags={post.tags.nodes.map((t) => t.name)}
                                                date={formatDate(post.date)}
                                                author={post.author.node.name}
                                                dark={dark}
                                            />
                                        </article>
                                    </Link>
                                ))}
                            </div>

                            {allPosts.length >= 12 && (
                                <div className="flex justify-center mt-[48px] md:mt-[60px]">
                                    <button
                                        className="rounded-[70px] font-montserrat font-semibold text-[14px] uppercase tracking-[1px] flex items-center justify-center transition-colors"
                                        style={{ height: '40px', width: '155.81px', backgroundColor: loadMoreBg, border: `1px solid ${loadMoreBorder}`, color: loadMoreText }}
                                    >
                                        Load More
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </main>

            <BlogFooter />
        </div>
    );
}
