'use client';

import { useState } from 'react';
import Link from 'next/link';
import BlogHeader from './BlogHeader';
import BlogFooter from './BlogFooter';
import { useTheme } from '../providers/ThemeProvider';
import type { WPPostFull, WPPost } from '../../lib/graphql';

const svgFacebook = "M13.397 20.997v-8.196h2.765l.411-3.209h-3.176V7.548c0-.926.258-1.56 1.587-1.56h1.684V3.127A22.336 22.336 0 0 0 14.201 3c-2.444 0-4.122 1.492-4.122 4.231v2.355H7.332v3.209h2.753v8.202h3.312z";
const svgTwitter = "M8.60156 20.4922H3L9.60938 11.6797L3.35156 4.50781H5.48438L10.5938 10.3906L15 4.50781H20.6016L13.7109 13.6719L19.6406 20.4922H17.5312L12.7266 14.9844L8.60156 20.4922ZM15.7969 6.10156L6.21094 18.8984H7.80469L17.3906 6.10156H15.7969Z";
const svgLink = "M13.0547 16.3906L14.4844 14.9844C15.1562 14.2969 15.6641 13.5234 16.0078 12.6641C16.3516 11.8047 16.5234 10.9258 16.5234 10.0273C16.5234 9.12891 16.3516 8.25 16.0078 7.39062C15.6641 6.53125 15.1562 5.75781 14.4844 5.07031L14.1328 4.71875C13.4453 4.03125 12.6719 3.52344 11.8125 3.19531C10.9531 2.85156 10.0742 2.67969 9.17578 2.67969C8.27734 2.67969 7.39844 2.85156 6.53906 3.19531C5.67969 3.52344 4.90625 4.03125 4.21875 4.71875C3.53125 5.40625 3.02344 6.17969 2.69531 7.03906C2.35156 7.89844 2.17969 8.77734 2.17969 9.67578C2.17969 10.5742 2.35156 11.4531 2.69531 12.3125C3.02344 13.1719 3.53125 13.9453 4.21875 14.6328L5.625 13.2031C5.14063 12.7188 4.78125 12.1719 4.54688 11.5625C4.29687 10.9375 4.17188 10.3047 4.17188 9.66406C4.17188 9.02344 4.29687 8.39844 4.54688 7.78906C4.78125 7.17969 5.14063 6.625 5.625 6.125C6.125 5.64063 6.67969 5.28125 7.28906 5.04688C7.89844 4.79687 8.52344 4.67188 9.16406 4.67188C9.80469 4.67188 10.4375 4.79687 11.0625 5.04688C11.6719 5.28125 12.2188 5.64063 12.7031 6.125L13.0547 6.5C13.5391 6.98437 13.9062 7.53125 14.1562 8.14062C14.4063 8.75 14.5312 9.375 14.5312 10.0156C14.5312 10.6563 14.4063 11.2891 14.1562 11.9141C13.9062 12.5234 13.5391 13.0703 13.0547 13.5547L11.6484 14.9844L13.0547 16.3906ZM19.7812 10.3672L18.375 11.7969C18.8594 12.2812 19.2188 12.8281 19.4531 13.4375C19.7031 14.0625 19.8281 14.6953 19.8281 15.3359C19.8281 15.9766 19.7031 16.6016 19.4531 17.2109C19.2188 17.8203 18.8594 18.375 18.375 18.875C17.875 19.3594 17.3203 19.7188 16.7109 19.9531C16.1016 20.2031 15.4766 20.3281 14.8359 20.3281C14.1953 20.3281 13.5625 20.2031 12.9375 19.9531C12.3281 19.7188 11.7812 19.3594 11.2969 18.875L10.9453 18.5C10.4453 18.0156 10.0781 17.4688 9.84375 16.8594C9.59375 16.25 9.46875 15.625 9.46875 14.9844C9.46875 14.3437 9.59375 13.7109 9.84375 13.0859C10.0781 12.4766 10.4453 11.9297 10.9453 11.4453L12.3516 10.0156L10.9453 8.60938L9.51562 10.0156C8.84375 10.7031 8.33594 11.4766 7.99219 12.3359C7.64844 13.1953 7.47656 14.0742 7.47656 14.9727C7.47656 15.8711 7.64844 16.75 7.99219 17.6094C8.33594 18.4688 8.84375 19.2422 9.51562 19.9297L9.86719 20.2812C10.5547 20.9688 11.3281 21.4766 12.1875 21.8047C13.0469 22.1484 13.9258 22.3203 14.8242 22.3203C15.7227 22.3203 16.6016 22.1484 17.4609 21.8047C18.3203 21.4766 19.0937 20.9688 19.7812 20.2812C20.4688 19.5937 20.9766 18.8203 21.3047 17.9609C21.6484 17.1016 21.8203 16.2227 21.8203 15.3242C21.8203 14.4258 21.6484 13.5469 21.3047 12.6875C20.9766 11.8281 20.4688 11.0547 19.7812 10.3672Z";
const svgArrowLeft = "M4.88888 9.49019L0.705882 5.09803M0.705882 5.09803L4.88888 0.705884M0.705882 5.09803H10.7451";
const svgArrowRight = "M6.56209 0.705884L10.7451 5.09803M10.7451 5.09803L6.56209 9.49019M10.7451 5.09803H0.705882";

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default function BlogPostPageClient({
    post,
    related,
}: {
    post: WPPostFull;
    related: WPPost[];
}) {
    const { dark } = useTheme();
    const [copied, setCopied] = useState(false);

    const pageUrl = typeof window !== 'undefined' ? window.location.href : `https://thehookahstore.in/blog/${post.slug}`;

    function shareOnFacebook() {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`, '_blank', 'width=600,height=400');
    }

    function shareOnTwitter() {
        const text = encodeURIComponent(post.title);
        const url = encodeURIComponent(pageUrl);
        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'width=600,height=400');
    }

    function copyLink() {
        navigator.clipboard.writeText(pageUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    const pageBg = dark ? 'transparent' : '#ffffff';
    const textCol = dark ? '#e8e9ef' : '#1b1c1f';
    const mutedCol = dark ? 'rgba(255,255,255,0.5)' : '#6c6d73';
    const borderCol = dark ? 'rgba(255,255,255,0.12)' : '#ebebed';
    const borderTop = dark ? 'rgba(255,255,255,0.08)' : '#ebebeb';
    const iconBg = dark ? 'rgba(255,255,255,0.1)' : '#f3f3f3';
    const iconFill = dark ? '#ffffff' : '#1B1C1F';
    const arrowBg = dark ? 'rgba(255,255,255,0.08)' : '#ffffff';
    const arrowBorder = dark ? 'rgba(255,255,255,0.15)' : '#d7d8db';
    const newsBg = dark ? 'rgba(255,255,255,0.06)' : '#f6f5f8';

    const tags = post.tags.nodes;
    const date = formatDate(post.date);
    const author = post.author.node.name;

    return (
        <div style={{ backgroundColor: pageBg, minHeight: '100vh', fontFamily: "var(--font-montserrat), sans-serif", transition: 'background-color 200ms', position: 'relative' }}>
            {/* URL Copied toast */}
            {copied && (
                <div style={{ position: 'fixed', bottom: '32px', left: '50%', transform: 'translateX(-50%)', backgroundColor: dark ? '#ffffff' : '#1b1c1f', color: dark ? '#1b1c1f' : '#ffffff', fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 500, fontSize: '14px', padding: '10px 20px', borderRadius: '100px', zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                    URL copied
                </div>
            )}
            <BlogHeader />

            <main>
                {/* Breadcrumb — same style as Privacy Policy page */}
                <div style={{ borderBottom: `1px solid ${borderCol}`, minHeight: '49px', display: 'flex', alignItems: 'center', transition: 'border-color 200ms' }}>
                    <div className="flex items-center px-4 md:px-[64px] xl:px-[312px]" style={{ paddingTop: '10px', paddingBottom: '10px' }}>
                        <Link
                            href="/blog"
                            style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: mutedCol, textTransform: 'capitalize', whiteSpace: 'nowrap' }}
                        >
                            Home
                        </Link>
                        <div style={{ width: '16px', height: '16px', margin: '0 4px', flexShrink: 0 }}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4.5 11.5L11.5 4.5" stroke="#BCBEC4" strokeLinecap="round" />
                            </svg>
                        </div>
                        <span aria-current="page" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 400, fontSize: '14px', lineHeight: '20px', color: textCol, textTransform: 'capitalize', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '60vw' }}>
                            {post.title}
                        </span>
                    </div>
                </div>

                {/* Content area — relative container so sidebar can be absolutely positioned */}
                <div className="relative xl:pt-[56px] md:pt-[44px] pt-6 pb-0">

                    {/* Sticky Social Sidebar — ~100px left of the centered article */}
                    <div className="hidden xl:block" style={{ position: 'absolute', left: 'calc(50% - 480px)', top: '56px', width: '40px' }}>
                        <div className="sticky top-[100px] flex flex-col gap-3">
                            <button onClick={shareOnFacebook} className="flex items-center justify-center w-[40px] h-[40px] rounded-[20px] cursor-pointer" style={{ backgroundColor: iconBg, border: 'none' }}>
                                <svg width="24" height="25" viewBox="0 0 24 25" fill="none"><path d={svgFacebook} fill={iconFill} /></svg>
                            </button>
                            <button onClick={shareOnTwitter} className="flex items-center justify-center w-[40px] h-[40px] rounded-[20px] cursor-pointer" style={{ backgroundColor: iconBg, border: 'none' }}>
                                <svg width="24" height="25" viewBox="0 0 24 25" fill="none"><path d={svgTwitter} fill={iconFill} /></svg>
                            </button>
                            <button onClick={copyLink} className="flex items-center justify-center w-[40px] h-[40px] rounded-[20px] cursor-pointer" style={{ backgroundColor: iconBg, border: 'none' }}>
                                <svg width="24" height="25" viewBox="0 0 24 25" fill="none"><path d={svgLink} fill={iconFill} /></svg>
                            </button>
                        </div>
                    </div>

                    {/* Article — centered max-width column */}
                    <div className="max-w-[676px] mx-auto px-4 md:px-6 xl:px-0">

                        {/* Title */}
                        <h1 className="mb-0 xl:text-[40px] xl:leading-[56px] text-[26px] leading-[36px]"
                            style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, color: textCol }}>
                            {post.title}
                        </h1>

                        {/* Tags + meta */}
                        <div className="mt-[16px]">
                            <div className="flex flex-wrap gap-[12px] items-center">
                                {tags.map(t => (
                                    <Link key={t.slug} href={`/blog/category/${t.slug}`}
                                        className="inline-flex items-center h-[24px] px-[8px] bg-[#D32F2F] rounded-[4px] text-white text-[12px] leading-[16px]"
                                        style={{ fontWeight: 500 }}>
                                        {t.name}
                                    </Link>
                                ))}
                                <span className="text-[12px] leading-[16px]" style={{ color: mutedCol }}>{date}</span>
                                <span className="text-[12px] leading-[16px]" style={{ color: mutedCol }}>by {author}</span>
                            </div>
                        </div>

                        {/* Featured Image */}
                        {post.featuredImage && (
                            <div className="mt-[24px] xl:mt-[40px] rounded-[12px] overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={post.featuredImage.node.sourceUrl}
                                    alt={post.featuredImage.node.altText || post.title}
                                    className="w-full object-cover"
                                    style={{ aspectRatio: '676 / 451' }}
                                />
                            </div>
                        )}

                        {/* WordPress post content */}
                        <div
                            className="mt-[32px] wp-content"
                            style={{ color: textCol }}
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />

                        {/* Post Footer */}
                        <div className="mt-[48px] xl:mt-[64px] pt-[16px]" style={{ borderTop: `1px solid ${borderCol}` }}>
                            {/* Desktop post footer */}
                            <div className="hidden md:flex items-center flex-wrap gap-[12px]">
                                {tags.map(t => (
                                    <Link key={t.slug} href={`/blog/category/${t.slug}`}
                                        className="inline-flex items-center h-[24px] px-[8px] bg-[#D32F2F] rounded-[4px] text-white text-[12px] leading-[16px]"
                                        style={{ fontWeight: 500 }}>
                                        {t.name}
                                    </Link>
                                ))}
                                <span className="text-[12px]" style={{ color: mutedCol }}>{date}</span>
                                <span className="text-[12px]" style={{ color: mutedCol }}>by {author}</span>
                                <div className="ml-auto flex items-center gap-[16px]">
                                    <button onClick={shareOnFacebook} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                        <svg width="24" height="25" viewBox="0 0 24 25" fill="none"><path d={svgFacebook} fill={iconFill} /></svg>
                                    </button>
                                    <button onClick={shareOnTwitter} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                        <svg width="24" height="25" viewBox="0 0 24 25" fill="none"><path d={svgTwitter} fill={iconFill} /></svg>
                                    </button>
                                    <button onClick={copyLink} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                        <svg width="24" height="25" viewBox="0 0 24 25" fill="none"><path d={svgLink} fill={iconFill} /></svg>
                                    </button>
                                </div>
                            </div>
                            {/* Mobile post footer */}
                            <div className="flex md:hidden flex-col gap-[16px]">
                                <div className="flex flex-wrap gap-[8px]">
                                    {tags.map(t => (
                                        <Link key={t.slug} href={`/blog/category/${t.slug}`}
                                            className="inline-flex items-center h-[24px] px-[8px] bg-[#D32F2F] rounded-[4px] text-white text-[12px] leading-[16px]"
                                            style={{ fontWeight: 500 }}>
                                            {t.name}
                                        </Link>
                                    ))}
                                </div>
                                <div className="flex items-center gap-[12px]">
                                    <span className="text-[12px]" style={{ color: mutedCol }}>{date}</span>
                                    <span className="text-[12px]" style={{ color: mutedCol }}>by {author}</span>
                                </div>
                                <div className="flex items-center gap-[16px]">
                                    <button onClick={shareOnFacebook} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                        <svg width="24" height="25" viewBox="0 0 24 25" fill="none"><path d={svgFacebook} fill={iconFill} /></svg>
                                    </button>
                                    <button onClick={shareOnTwitter} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                        <svg width="24" height="25" viewBox="0 0 24 25" fill="none"><path d={svgTwitter} fill={iconFill} /></svg>
                                    </button>
                                    <button onClick={copyLink} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                                        <svg width="24" height="25" viewBox="0 0 24 25" fill="none"><path d={svgLink} fill={iconFill} /></svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Newsletter */}
                        <div className="mt-[32px] rounded-[12px] h-[186px] relative overflow-hidden" style={{ backgroundColor: newsBg }}>
                            <div className="hidden md:block">
                                <div className="absolute left-[48px] top-[40px]">
                                    <p className="m-0" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '26px', lineHeight: '36px', color: textCol }}>
                                        Subscribe to<br />our newsletter
                                    </p>
                                </div>
                                <div className="absolute right-[48px] top-[40px]" style={{ width: 'calc(100% - 306px - 48px)' }}>
                                    <div className="relative bg-white border border-[#bcbec4] rounded-[8px] h-[58px]">
                                        <span className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#6c6d73] text-[16px]">Email Address</span>
                                        <button className="absolute right-[16px] top-1/2 -translate-y-1/2 rounded-[70px] px-4 py-1"
                                            style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', color: '#7a6336', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                            Subscribe
                                        </button>
                                    </div>
                                    <p className="text-[#6c6d73] text-[12px] leading-[16px] mt-[8px] m-0">Get the latest offers, exclusive deals and new product announcements!</p>
                                </div>
                            </div>
                            <div className="block md:hidden px-[24px] pt-[24px]">
                                <p className="m-0 mb-[16px]" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '18px', lineHeight: '28px', color: textCol }}>Subscribe to our newsletter</p>
                                <div className="relative bg-white border border-[#bcbec4] rounded-[8px] h-[58px]">
                                    <span className="absolute left-[16px] top-1/2 -translate-y-1/2 text-[#6c6d73] text-[16px]">Email Address</span>
                                    <button className="absolute right-[16px] top-1/2 -translate-y-1/2 rounded-[70px] px-3 py-1"
                                        style={{ fontFamily: "var(--font-montserrat), sans-serif", fontWeight: 600, fontSize: '14px', color: '#7a6336', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                        Subscribe
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>{/* end article */}
                </div>{/* end content area */}

                {/* Recommended for You */}
                {related.length > 0 && (
                    <div className="mt-[48px] xl:mt-[64px] px-[16px] md:px-[24px] xl:px-[64.5px] pb-[48px]">
                        <div className="flex items-center justify-between mb-[24px]">
                            <h2 className="m-0" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '26px', lineHeight: '36px', color: textCol }}>
                                Recommended for You
                            </h2>
                            <div className="flex gap-[8px]">
                                <button className="w-[40px] h-[40px] rounded-[20px] flex items-center justify-center" style={{ backgroundColor: arrowBg, border: `1px solid ${arrowBorder}` }}>
                                    <svg width="11.451" height="10.196" viewBox="0 0 11.451 10.1961" fill="none"><path d={svgArrowLeft} stroke={dark ? '#fff' : '#35363B'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.41176" /></svg>
                                </button>
                                <button className="w-[40px] h-[40px] rounded-[20px] flex items-center justify-center" style={{ backgroundColor: arrowBg, border: `1px solid ${arrowBorder}` }}>
                                    <svg width="11.451" height="10.196" viewBox="0 0 11.451 10.1961" fill="none"><path d={svgArrowRight} stroke={dark ? '#fff' : '#35363B'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.41176" /></svg>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-[24px]">
                            {related.map(p => (
                                <Link key={p.id} href={`/blog/${p.slug}`} className="flex flex-col">
                                    <div className="relative rounded-[12px] overflow-hidden" style={{ height: '207px' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={p.featuredImage?.node.sourceUrl ?? '/blog/9a11ae8c8f10a3e0c0f5077db36d33da082a6a69.png'}
                                            alt={p.featuredImage?.node.altText ?? p.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-[rgba(22,22,22,0.4)] rounded-[12px]" />
                                    </div>
                                    <div className="mt-[16px]">
                                        <h3 className="m-0 overflow-hidden leading-[24px]"
                                            style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: '16px', minHeight: '48px', color: textCol }}>
                                            {p.title}
                                        </h3>
                                        <div className="mt-[16px] pt-[16px]" style={{ borderTop: `1px solid ${borderCol}` }}>
                                            <div className="flex flex-wrap gap-[8px] mb-[8px]">
                                                {p.tags.nodes.slice(0, 2).map(t => (
                                                    <span key={t.slug} className="inline-flex items-center h-[24px] px-[8px] bg-[#D32F2F] rounded-[4px] text-white text-[12px]" style={{ fontWeight: 500 }}>
                                                        {t.name}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-[8px] mt-[8px]">
                                                <span className="text-[12px]" style={{ color: mutedCol }}>{formatDate(p.date)}</span>
                                                <span className="text-[12px]" style={{ color: mutedCol }}>by {p.author.node.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            <BlogFooter />
        </div>
    );
}
