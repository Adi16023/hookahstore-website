'use client';

import HeroSlider from '../HeroSlider';
import ProductSlider from '../ProductSlider';
import Image from 'next/image';
import Link from 'next/link';
import type { AcfHeroSlide, HomepageBrandsData, HomepageProduct, WPPost } from '../../lib/graphql';
import MarqueeBar from '../layout/MarqueeBar';
import { FREE_SHIPPING_TEXT } from '../../lib/config/site';
import { getPublicAppUrl } from '../../lib/config';

interface HomePageContentProps {
    isWholesale?: boolean;
    /** ACF hero slides fetched server-side */
    acfHeroSlides?: AcfHeroSlide[];
    /** Brand product data fetched server-side via fetchHomepageBrands() */
    brandProducts?: HomepageBrandsData;
    /** Latest 3 WordPress posts (section hidden when empty) */
    blogPosts?: WPPost[];
}

/** Plain text from WordPress HTML (titles / excerpts) */
function wpText(html: string | null | undefined, max?: number): string {
    const text = (html ?? '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/&#8217;|&rsquo;/g, '’').replace(/&#8216;|&lsquo;/g, '‘')
        .replace(/&#8220;|&ldquo;/g, '“').replace(/&#8221;|&rdquo;/g, '”')
        .replace(/&#8211;|&ndash;/g, '–').replace(/&#8212;|&mdash;/g, '—')
        .replace(/&hellip;|&#8230;|\[&hellip;\]/g, '…').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ').trim();
    return max && text.length > max ? text.slice(0, max).replace(/\s+\S*$/, '') + '…' : text;
}

export default function HomePageContent({ isWholesale = false, acfHeroSlides = [], brandProducts, blogPosts = [] }: HomePageContentProps) {
    // Blog lives on the retail site — absolute links from the wholesale subdomain
    const blogBase = isWholesale ? getPublicAppUrl() : '';
    // Extract per-brand product arrays, defaulting to empty if WordPress returned nothing.
    const empty: HomepageProduct[] = [];
    const alfakherProducts = brandProducts?.alfakher?.nodes ?? empty;
    const afzalProducts    = brandProducts?.afzal?.nodes    ?? empty;
    const royalProducts    = brandProducts?.royal?.nodes    ?? empty;
    const odumanProducts   = brandProducts?.oduman?.nodes   ?? empty;
    const myaProducts      = brandProducts?.mya?.nodes      ?? empty;

    // Brand links must be absolute when rendered on the wholesale subdomain so
    // Next.js doesn't prefetch them as wholesale routes (→ 404).
    // Brand links: retail brand pages, or the wholesale catalog on the wholesale site
    const brandHref = (slug: string) => (isWholesale ? `/wholesale/category/${slug}` : `/brand/${slug}`);

    return (
        <div className="relative overflow-x-hidden">
            {/* Marquee bar — homepage only, above the slider */}
            <MarqueeBar
                animationId={isWholesale ? 'ws-marquee' : 'consumer-marquee'}
                text={
                    isWholesale
                        ? 'TRUSTED WHOLESALE HOOKAH SUPPLIER\u00a0\u00a0✦\u00a0\u00a0PREMIUM SHISHA TOBACCO, HOOKAHS, ACCESSORIES FOR SMOKE SHOPS & LOUNGES\u00a0\u00a0✦\u00a0\u00a0BULK ORDERS WELCOME\u00a0\u00a0✦\u00a0\u00a0NATIONWIDE DELIVERY'
                        : 'PREMIUM HOOKAH & SHISHA TOBACCO\u00a0\u00a0✦\u00a0\u00a0AUTHENTIC BRANDS — AL FAKHER · FUMARI · STARBUZZ\u00a0\u00a0✦\u00a0\u00a0FREE DELIVERY ON ORDERS OF \u20b91,000 OR MORE\u00a0\u00a0✦\u00a0\u00a0HOOKAHS, CHARCOAL & ACCESSORIES\u00a0\u00a0✦\u00a0\u00a0NEW ARRIVALS EVERY WEEK'
                }
            />

            <HeroSlider acfSlides={acfHeroSlides} />

            {/* ─── Al Fakher ─────────────────────────────────────────────── */}
            <div className="hp-section">
                {/* BG decoration — LEFT — white for dark mode, black for light mode */}
                <div aria-hidden="true" className="absolute pointer-events-none select-none z-0 left-[-61px] top-0 w-[912px] h-[510px] max-sm:left-0 max-sm:w-[280px] max-sm:h-[156px]">
                    <Image src="/homepage/alfakher_bg_left.png" alt="" fill className="object-contain opacity-20 brand-bg-white" priority={false} />
                    <Image src="/homepage/alfakher_bg_black.png" alt="" fill className="object-contain opacity-10 brand-bg-black" priority={false} />
                </div>
                <Link
                    href={brandHref('al-fakher')}
                    className="relative z-10 flex justify-center w-full pt-[67px] pb-[67px] max-sm:pt-[32px] max-sm:pb-[32px] cursor-pointer"
                    aria-label="Shop Al Fakher products"
                >
                    {/*
                     * Logo switching: both images are position:absolute inside the
                     * same fixed-size container. Visibility is controlled by
                     * .brand-logo-white / .brand-logo-black in globals.css
                     * (and the blocking inline style in layout.tsx for zero-flicker).
                     */}
                    {/* Logo — 3× bigger than before */}
                    <div className="relative w-[100px] h-[100px] max-sm:w-[60px] max-sm:h-[60px]">
                        {/* Dark mode — white logo */}
                        <Image
                            src="/homepage/alfakher.png"
                            alt="Al Fakher"
                            fill
                            className="object-contain brand-logo-white"
                            priority={false}
                        />
                        {/* Light mode — black logo */}
                        <Image
                            src="/homepage/alfakher_black.png"
                            alt="Al Fakher"
                            fill
                            className="object-contain brand-logo-black"
                            priority={false}
                        />
                    </div>
                </Link>
                <div className="relative z-10">
                    <ProductSlider products={alfakherProducts} viewMoreHref={brandHref('al-fakher')} forceWholesale={isWholesale} />
                </div>
            </div>

            {/* ─── Afzal ─────────────────────────────────────────────────── */}
            <div className="hp-section">
                {/* BG decoration — RIGHT */}
                <div aria-hidden="true" className="absolute pointer-events-none select-none z-0 right-0 top-0 w-[1154px] h-[779px] max-sm:w-[280px] max-sm:h-[190px]">
                    <Image src="/homepage/afzal_bg_right.png" alt="" fill className="object-contain opacity-20 brand-bg-white" priority={false} />
                    <Image src="/homepage/afzal_bg_black.png" alt="" fill className="object-contain opacity-10 brand-bg-black" priority={false} />
                </div>
                <div aria-hidden="true" className="pointer-events-none select-none relative z-10 flex justify-center w-full pt-[67px] pb-[67px] max-sm:pt-[32px] max-sm:pb-[32px]">
                    <div className="relative w-[100px] h-[100px] max-sm:w-[60px] max-sm:h-[60px]">
                        {/* Dark mode — white logo */}
                        <Image
                            src="/homepage/afzal.png"
                            alt="Afzal"
                            fill
                            className="object-contain brand-logo-white"
                            priority={false}
                        />
                        {/* Light mode — black logo */}
                        <Image
                            src="/homepage/afzal_black.png"
                            alt="Afzal"
                            fill
                            className="object-contain brand-logo-black"
                            priority={false}
                        />
                    </div>
                </div>
                <div className="relative z-10">
                    <ProductSlider products={afzalProducts} accentColor="#FF751F" viewMoreHref={brandHref('afzal')} forceWholesale={isWholesale} />
                </div>
            </div>

            {/* ─── Royal Smoking ─────────────────────────────────────────── */}
            <div className="hp-section">
                {/* BG decoration — LEFT */}
                <div aria-hidden="true" className="absolute pointer-events-none select-none z-0 left-[-40px] top-0 w-[824px] h-[359px] max-sm:left-0 max-sm:w-[260px] max-sm:h-[113px]">
                    <Image src="/homepage/royal_smoking_bg_left.png" alt="" fill className="object-contain opacity-20 brand-bg-white" priority={false} />
                    <Image src="/homepage/royal_smoking_bg_black.png" alt="" fill className="object-contain opacity-10 brand-bg-black" priority={false} />
                </div>
                <div aria-hidden="true" className="pointer-events-none select-none relative z-10 flex justify-center w-full pt-[67px] pb-[67px] max-sm:pt-[32px] max-sm:pb-[32px]">
                    <div className="relative w-[120px] h-[120px] max-sm:w-[72px] max-sm:h-[72px]">
                        {/* Dark mode — white logo */}
                        <Image
                            src="/homepage/royal_smoking.png"
                            alt="Royal Smoking"
                            fill
                            className="object-contain brand-logo-white"
                            priority={false}
                        />
                        {/* Light mode — black logo */}
                        <Image
                            src="/homepage/royal_smoking_black.png"
                            alt="Royal Smoking"
                            fill
                            className="object-contain brand-logo-black"
                            priority={false}
                        />
                    </div>
                </div>
                <div className="relative z-10">
                    <ProductSlider products={royalProducts} accentColor="#7A14E8" viewMoreHref={brandHref('royal-smokin')} forceWholesale={isWholesale} />
                </div>
            </div>

            {/* ─── Oduman ────────────────────────────────────────────────── */}
            <div className="hp-section">
                {/* BG decoration — RIGHT */}
                <div aria-hidden="true" className="absolute pointer-events-none select-none z-0 right-0 top-0 w-[841px] h-[520px] max-sm:w-[260px] max-sm:h-[161px]">
                    <Image src="/homepage/odumen_bg_right.png" alt="" fill className="object-contain opacity-20 brand-bg-white" priority={false} />
                    <Image src="/homepage/odumen_bg_black.png" alt="" fill className="object-contain opacity-10 brand-bg-black" priority={false} />
                </div>
                <div aria-hidden="true" className="pointer-events-none select-none relative z-10 flex justify-center w-full pt-[67px] pb-[67px] max-sm:pt-[32px] max-sm:pb-[32px]">
                    <div className="relative w-[100px] h-[100px] max-sm:w-[60px] max-sm:h-[60px]">
                        {/* Dark mode — white logo */}
                        <Image
                            src="/homepage/odumen.png"
                            alt="Oduman"
                            fill
                            className="object-contain brand-logo-white"
                            priority={false}
                        />
                        {/* Light mode — black logo */}
                        <Image
                            src="/homepage/odumen_black.png"
                            alt="Oduman"
                            fill
                            className="object-contain brand-logo-black"
                            priority={false}
                        />
                    </div>
                </div>
                <div className="relative z-10">
                    <ProductSlider products={odumanProducts} accentColor="#CFE814" buttonColor="#000000" imageWidth={152} imageHeight={228} viewMoreHref={brandHref('oduman-blend')} forceWholesale={isWholesale} />
                </div>
            </div>

            {/* ─── Mya ───────────────────────────────────────────────────── */}
            <div className="hp-section">
                {/* BG decoration — LEFT */}
                <div aria-hidden="true" className="absolute pointer-events-none select-none z-0 left-[-40px] top-0 w-[609px] h-[319px] max-sm:left-0 max-sm:w-[240px] max-sm:h-[126px]">
                    <Image src="/homepage/mya_bg_left.png" alt="" fill className="object-contain opacity-20 brand-bg-white" priority={false} />
                    <Image src="/homepage/mya_bg_black.png" alt="" fill className="object-contain opacity-10 brand-bg-black" priority={false} />
                </div>
                <div aria-hidden="true" className="pointer-events-none select-none relative z-10 flex justify-center w-full pt-[67px] pb-[67px] max-sm:pt-[32px] max-sm:pb-[32px]">
                    <div className="relative w-[100px] h-[100px] max-sm:w-[60px] max-sm:h-[60px]">
                        {/* Dark mode — white logo */}
                        <Image
                            src="/homepage/mya.png"
                            alt="Mya"
                            fill
                            className="object-contain brand-logo-white"
                            priority={false}
                        />
                        {/* Light mode — black logo */}
                        <Image
                            src="/homepage/mya_black.png"
                            alt="Mya"
                            fill
                            className="object-contain brand-logo-black"
                            priority={false}
                        />
                    </div>
                </div>
                <div className="relative z-10">
                    <ProductSlider products={myaProducts} accentColor="#00EBD8" buttonColor="#000000" imageWidth={197} imageHeight={197} viewMoreHref={brandHref('mya')} forceWholesale={isWholesale} />
                </div>
            </div>

            {/* ─── Blog Section — latest 3 real posts; hidden when there are none ─── */}
            {blogPosts.length > 0 && (
            <div className="relative mt-[60px] pb-[80px]">
                {/* Divider */}
                <div style={{ height: 1, background: 'var(--clr-border)', margin: '0 40px 48px' }} />

                <div className="flex flex-col items-center text-center mb-[48px]">
                    <h2
                        className="font-montserrat font-semibold"
                        style={{ fontSize: '36px', color: 'var(--clr-text)' }}
                    >
                        Blogs
                    </h2>
                    <p
                        className="font-montserrat font-normal mt-[10px]"
                        style={{ fontSize: '16px', color: 'var(--clr-text-muted)' }}
                    >
                        Let&apos;s boost your knowledge.
                    </p>
                </div>

                <div className="flex gap-[16px] px-[16px] overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden md:overflow-visible md:snap-none md:flex-nowrap md:justify-center md:gap-[24px] md:px-[24px] xl:gap-[24px] xl:px-[16px]">
                    {blogPosts.slice(0, 3).map((post) => (
                        <div
                            key={post.id}
                            className="w-[85vw] h-[500px] flex-shrink-0 snap-center md:flex-1 md:w-0 md:min-w-0 md:max-w-[296px] md:h-[600px] xl:flex-none xl:w-[413px] xl:max-w-none xl:h-[365px] xl:flex-shrink-0"
                            style={{
                                background: 'linear-gradient(135deg, var(--clr-surface-2) 0%, var(--clr-surface-3) 70%)',
                                padding: '1px',
                                borderRadius: '18px',
                            }}
                        >
                            <div style={{ borderRadius: '17px', overflow: 'hidden', position: 'relative', width: '100%', height: '100%' }}>
                                <Image
                                    src={post.featuredImage?.node?.sourceUrl || '/homepage/blogbox.png'}
                                    alt={post.featuredImage?.node?.altText || wpText(post.title)}
                                    fill
                                    className="object-cover"
                                    sizes="(min-width:1280px) 413px, (min-width:768px) 33vw, 85vw"
                                    priority={false}
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)' }} />
                                <div style={{ position: 'absolute', bottom: '24px', left: 0, right: 0, padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <h3 className="font-montserrat font-semibold text-white" style={{ fontSize: '26px', marginBottom: '8px' }}>
                                        {wpText(post.title, 60)}
                                    </h3>
                                    <p className="font-montserrat font-normal text-white/80" style={{ fontSize: '12px', marginBottom: '16px' }}>
                                        {wpText(post.excerpt, 110)}
                                    </p>
                                    <Link
                                        href={`${blogBase}/blog/${post.slug}`}
                                        className="font-montserrat font-semibold uppercase text-white cursor-pointer inline-flex items-center"
                                        style={{ fontSize: '13px', height: '35px', paddingLeft: '24px', paddingRight: '24px', borderRadius: '26px', border: 'none', backgroundColor: '#FF8D0A', boxShadow: '0px 0px 8px 2px rgba(255,141,10,0.85)', textDecoration: 'none' }}
                                    >
                                        LEARN MORE
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            )}
        </div>
    );
}
