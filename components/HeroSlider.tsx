'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import type { AcfHeroSlide } from '../lib/graphql';

/* ─── Types ──────────────────────────────────────────────────────────────── */
interface Slide {
    id: number | string;
    image: string;
    mobileImage?: string;
    tag: string;
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
    isExternal?: boolean;
}

interface HeroSliderProps {
    acfSlides?: AcfHeroSlide[];
}

interface HeroDims {
    slideW: number;
    gap: number;
    padSide: number;
    height: number;
}

const AUTO_PLAY_MS = 12000;

function computeHeroDims(vw: number): HeroDims {
    // Guard: never let vw be 0 or negative
    const w = vw > 50 ? vw : 1440;
    if (w >= 1025) {
        const peekVisible = 80;
        const gap = 12;
        const padSide = peekVisible + gap;
        const slideW = Math.max(600, w - 2 * padSide);
        return { slideW, gap, padSide, height: 449 };
    }
    if (w >= 640) {
        const peekVisible = 60;
        const gap = 10;
        const padSide = peekVisible + gap;
        const slideW = Math.max(300, w - 2 * padSide);
        return { slideW, gap, padSide, height: 400 };
    }
    return { slideW: w, gap: 0, padSide: 0, height: 400 };
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function HeroSlider({ acfSlides = [] }: HeroSliderProps) {
    const [activeIndex, setActiveIndex] = useState(1);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [dims, setDims] = useState<HeroDims>({ slideW: 1256, gap: 12, padSide: 92, height: 449 });
    const [isMobile, setIsMobile] = useState(false);
    const outerRef = useRef<HTMLDivElement>(null);

    // Use ResizeObserver on the actual container — far more reliable than window.innerWidth
    useEffect(() => {
        const el = outerRef.current;
        if (!el) return;

        const update = () => {
            const w = el.getBoundingClientRect().width;
            const vw = w > 50 ? w : window.innerWidth;
            setDims(computeHeroDims(vw));
            setIsMobile(vw < 640);
        };

        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    /* ── Slide data ────────────────────────────────────────────────────── */
    const fromAcf: Slide[] = acfSlides.map((s, i) => {
        const slideUrl  = s.slideImage?.node?.sourceUrl  || null;
        const mobileUrl = s.mobileImage?.node?.sourceUrl || null;
        const imageUrl       = slideUrl || mobileUrl || '/hero-vanilla.webp';
        const mobileImageUrl = mobileUrl || imageUrl;
        return {
            id: `acf-${i + 1}`,
            image:       imageUrl,
            mobileImage: mobileImageUrl,
            tag:         s.badgeText   || '',
            title:       s.title       || '',
            description: s.description || '',
            buttonText:  s.buttonText  || 'EXPLORE',
            buttonLink:  s.buttonLink  || '/',
            isExternal:  imageUrl.startsWith('http'),
        };
    });

    const slides: Slide[] = fromAcf.length > 0
        ? fromAcf
        : [{
            id: 'default-1',
            image: '/hero-vanilla.webp',
            tag: '',
            title: 'Premium Hookah Flavours',
            description: 'Explore our collection of authentic shisha tobacco.',
            buttonText: 'SHOP NOW',
            buttonLink: '/category/hookah-flavours',
        }];

    const extendedSlides = [
        { ...slides[slides.length - 1], id: 'clone-last' },
        ...slides,
        { ...slides[0], id: 'clone-first' },
    ];

    /* ── Navigation ─────────────────────────────────────────────────────── */
    const nextSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setActiveIndex(prev => prev + 1);
    }, [isTransitioning]);

    const prevSlide = useCallback(() => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setActiveIndex(prev => prev - 1);
    }, [isTransitioning]);

    /* ── Autoplay ────────────────────────────────────────────────────────── */
    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            if (!isTransitioning) {
                setIsTransitioning(true);
                setActiveIndex(prev => prev + 1);
            }
        }, AUTO_PLAY_MS);
        return () => clearInterval(timer);
    }, [isPaused, isTransitioning]);

    /* ── Infinite loop correction ────────────────────────────────────────── */
    useEffect(() => {
        if (!isTransitioning) return;
        const timer = setTimeout(() => {
            setIsTransitioning(false);
            if (activeIndex === 0) setActiveIndex(slides.length);
            else if (activeIndex === extendedSlides.length - 1) setActiveIndex(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [activeIndex, extendedSlides.length, slides.length, isTransitioning]);

    /* ── Dot helpers ───────────────────────────────────────────────────── */
    const activeDotIndex = ((activeIndex - 1) % slides.length + slides.length) % slides.length;

    const goToSlide = (realIndex: number) => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setActiveIndex(realIndex + 1);
    };

    /* ── Render ──────────────────────────────────────────────────────────── */
    return (
        <div
            ref={outerRef}
            className="w-full relative hero-outer"
            style={{ overflowX: 'hidden' }}
        >
            <style jsx global>{`
                .hero-outer { margin-top: 0; }
                .hero-track {
                    display: flex;
                    align-items: center;
                    will-change: transform;
                }
                .hero-slide-base {
                    position: relative;
                    overflow: hidden;
                    border-radius: 36px;
                    border: 1px solid #6E6E6E;
                    transition: opacity 0.5s ease;
                }
                .hero-slide-inactive {
                    opacity: 0.5;
                    pointer-events: none;
                }
                .hero-slide-active {
                    opacity: 1;
                    z-index: 2;
                }
                .hero-content-mobile {
                    padding-left: 600px;
                    padding-right: 80px;
                    z-index: 3;
                }
                .hero-gradient-mobile {
                    width: 50%;
                    z-index: 2;
                }
                @media (max-width: 1024px) {
                    .hero-gradient-mobile {
                        width: 70% !important;
                        background: linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 40%) !important;
                    }
                    .hero-content-mobile {
                        padding-left: 42% !important;
                        padding-right: 80px !important;
                    }
                }
                @media (max-width: 639px) {
                    .hero-outer { margin-top: 0 !important; }
                    .hero-slide-base {
                        border: none !important;
                        border-radius: 0 !important;
                    }
                    .hero-slide-inactive {
                        opacity: 0 !important;
                        pointer-events: none !important;
                    }
                    .hero-content-mobile {
                        left: 0 !important;
                        right: 0 !important;
                        padding-left: 24px !important;
                        padding-right: 24px !important;
                        align-items: center !important;
                        text-align: center !important;
                        width: 100% !important;
                    }
                    .hero-content-mobile > * {
                        max-width: 100% !important;
                        text-align: center !important;
                    }
                    .hero-content-mobile .hero-tag-mobile   { font-size: 12px !important; }
                    .hero-content-mobile .hero-title-mobile { font-size: 22px !important; line-height: 1.3 !important; }
                    .hero-content-mobile .hero-desc-mobile  { font-size: 12px !important; }
                    .hero-content-mobile .hero-btn-mobile   { width: 180px !important; height: 32px !important; font-size: 11px !important; }
                    .hero-slide-base button { display: none !important; }
                    .hero-gradient-mobile {
                        inset: 0 !important;
                        left: 0 !important;
                        width: 100% !important;
                        background: linear-gradient(
                            to bottom,
                            rgba(0,0,0,0.55) 0%,
                            rgba(0,0,0,0.75) 50%,
                            rgba(0,0,0,0.55) 100%
                        ) !important;
                    }
                }
                .hero-dots { display: none; }
                @media (max-width: 639px) {
                    .hero-dots {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        gap: 6px;
                        position: absolute;
                        bottom: 16px;
                        left: 0;
                        right: 0;
                        z-index: 10;
                    }
                }
                .hero-dot {
                    width: 7px;
                    height: 7px;
                    border-radius: 50%;
                    border: none;
                    background: rgba(255,255,255,0.40);
                    cursor: pointer;
                    transition: background 250ms ease, transform 250ms ease, width 250ms ease, border-radius 250ms ease;
                    padding: 0;
                    flex-shrink: 0;
                }
                .hero-dot-active {
                    background: #CD142C;
                    transform: scale(1.15);
                    width: 18px;
                    border-radius: 4px;
                    box-shadow: 0 0 6px 2px rgba(205,20,44,0.55);
                }
            `}</style>

            <div style={{ position: 'relative', height: `${dims.height}px`, overflow: 'hidden' }}>
                <div
                    className="hero-track"
                    style={{
                        height: '100%',
                        gap: `${dims.gap}px`,
                        paddingLeft: `${dims.padSide}px`,
                        paddingRight: `${dims.padSide}px`,
                        transform: `translateX(-${activeIndex * (dims.slideW + dims.gap)}px)`,
                        transition: isTransitioning
                            ? 'transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                            : 'none',
                    }}
                >
                    {extendedSlides.map((slide, index) => {
                        const isActive = index === activeIndex;
                        return (
                            <div
                                key={`${slide.id}-${index}`}
                                className={`hero-slide-base flex-shrink-0 ${isActive ? 'hero-slide-active' : 'hero-slide-inactive'}`}
                                style={{ width: `${dims.slideW}px`, height: `${dims.height}px` }}
                            >
                                <div className="absolute inset-0" style={{ zIndex: 1 }}>
                                    {(() => {
                                        const imgSrc = isMobile && slide.mobileImage
                                            ? slide.mobileImage
                                            : slide.image;
                                        const isExt = (slide.isExternal || imgSrc.startsWith('http')) &&
                                            !imgSrc.includes('cms.thehookahstore.in');
                                        const isFirstSlide = index === 1;
                                        return isExt ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                                src={imgSrc}
                                                alt={slide.title}
                                                loading={isFirstSlide ? 'eager' : 'lazy'}
                                                fetchPriority={isFirstSlide ? 'high' : 'auto'}
                                                decoding="async"
                                                style={{
                                                    width: '100%', height: '100%', objectFit: 'cover',
                                                    objectPosition: isActive ? 'center' : (index < activeIndex ? 'right center' : 'left center'),
                                                }}
                                            />
                                        ) : (
                                            <Image
                                                src={imgSrc}
                                                alt={slide.title}
                                                fill
                                                priority={isFirstSlide}
                                                sizes="(max-width: 639px) 100vw, (max-width: 1024px) calc(100vw - 140px), calc(100vw - 184px)"
                                                style={{
                                                    objectFit: 'cover',
                                                    objectPosition: isActive ? 'center' : (index < activeIndex ? 'right center' : 'left center'),
                                                }}
                                            />
                                        );
                                    })()}
                                </div>

                                <div
                                    className="hero-gradient-mobile absolute inset-0 pointer-events-none"
                                    style={{
                                        background: 'linear-gradient(to right, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.15) 30%, rgba(0,0,0,0.85) 60%, rgba(0,0,0,0.98) 100%)',
                                        right: 0,
                                        left: 'auto',
                                        opacity: isActive ? 1 : 0,
                                        transition: 'opacity 400ms ease',
                                    }}
                                />

                                <div
                                    className="absolute right-0 top-0 h-full flex flex-col justify-center items-end text-right hero-content-mobile"
                                    style={{
                                        opacity: isActive ? 1 : 0,
                                        transition: 'opacity 400ms ease',
                                        pointerEvents: isActive ? 'auto' : 'none',
                                    }}
                                >
                                    <div className="font-montserrat font-semibold text-white mb-3 hero-tag-mobile" style={{ fontSize: '16px' }}>
                                        {slide.tag}
                                    </div>
                                    <h2 className="font-montserrat font-semibold text-white mb-4 hero-title-mobile" style={{ fontSize: '32px', lineHeight: '122%', whiteSpace: 'pre-line' }}>
                                        {slide.title}
                                    </h2>
                                    <p className="font-montserrat font-normal text-white mb-6 hero-desc-mobile" style={{ fontSize: '14px', lineHeight: '1.6', maxWidth: '400px', whiteSpace: 'pre-line' }}>
                                        {slide.description}
                                    </p>
                                    <a
                                        href={slide.buttonLink}
                                        className="font-montserrat text-white uppercase transition-all hover:shadow-[0_0_12px_4px_rgba(191,0,255,0.6)] hero-btn-mobile"
                                        style={{ width: '229px', height: '35px', borderRadius: '26px', backgroundColor: '#181818', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 600, border: '2px solid #BF00FF', boxShadow: '0 0 8px 2px rgba(191, 0, 255, 0.5)' }}
                                    >
                                        {slide.buttonText}
                                    </a>
                                </div>

                                {isActive && (
                                    <>
                                        <button
                                            className="absolute left-6 top-1/2 -translate-y-1/2 z-10 transition-transform hover:scale-110"
                                            aria-label="Previous slide"
                                            onClick={e => { e.stopPropagation(); prevSlide(); }}
                                            style={{ width: '42px', height: '42px', backgroundColor: '#FFFFFF', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        <button
                                            className="absolute top-1/2 -translate-y-1/2 z-10 transition-transform hover:scale-110"
                                            aria-label="Next slide"
                                            onClick={e => { e.stopPropagation(); nextSlide(); }}
                                            style={{ right: '16px', width: '42px', height: '42px', backgroundColor: '#FFFFFF', borderRadius: '50%', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="hero-dots" role="tablist" aria-label="Slide indicators">
                    {slides.map((slide, i) => (
                        <button
                            key={slide.id}
                            role="tab"
                            aria-label={`Go to slide ${i + 1}`}
                            aria-selected={i === activeDotIndex}
                            className={`hero-dot${i === activeDotIndex ? ' hero-dot-active' : ''}`}
                            onClick={() => goToSlide(i)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
