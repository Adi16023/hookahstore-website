'use client';

import type { WPProductCategory } from '../../../../lib/graphql';
import { findParent } from '../../../../lib/config/categories';

/* ─── Category meta (hero copy per slug) ───────────────────────────────── */
export const CATEGORY_COPY: Record<string, { gradient: string; description: string }> = {
    'hookah-bowls': {
        gradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1654 40%, #4a1942 70%, #6b2737 100%)',
        description: 'Shop premium hookah bowls — from classic clay phunnels to modern silicone designs for every smoking style.',
    },
    'hookah-hoses': {
        gradient: 'linear-gradient(135deg, #0a1a2e 0%, #163054 40%, #194a42 70%, #277367 100%)',
        description: 'Discover our range of hookah hoses — washable silicone, traditional leather, and wide-bore for maximum airflow.',
    },
    'other-hookah-accessories': {
        gradient: 'linear-gradient(135deg, #1a1a0a 0%, #4a3a10 40%, #6b5010 70%, #8b6914 100%)',
        description: 'Everything else you need — heat management devices, replacement parts, charcoal accessories, and cleaning supplies.',
    },
    'hookah-charcoal': {
        gradient: 'linear-gradient(135deg, #1a0a0a 0%, #3a1010 40%, #5a2010 70%, #6b2d0a 100%)',
        description: 'Premium hookah charcoal for the perfect session — natural coconut coals, quick-light, and long-lasting options.',
    },
    'coco-nara': {
        gradient: 'linear-gradient(135deg, #0a1a0a 0%, #1a3a10 40%, #2a5010 70%, #3a6a14 100%)',
        description: 'Coco Nara natural coconut charcoal — the #1 choice for hookah enthusiasts. Clean burn, no smell, long-lasting heat.',
    },
    'cocous': {
        gradient: 'linear-gradient(135deg, #0a0a1a 0%, #101040 40%, #1a1a60 70%, #202080 100%)',
        description: 'CocoUS premium coconut shell charcoal — eco-friendly, odourless, and perfect for long hookah sessions.',
    },
    'afzal': {
        gradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1654 40%, #6b2737 70%, #8b1a1a 100%)',
        description: 'Afzal hookah tobacco — premium Indian-made shisha with bold flavours and a smooth, rich smoke.',
    },
    'al-fakher': {
        gradient: 'linear-gradient(135deg, #1a0a2e 0%, #2d1654 40%, #4a1942 70%, #6b2737 100%)',
        description: 'Al Fakher hookah tobacco — world\'s #1 shisha brand. Consistent quality, iconic flavours, smooth sessions.',
    },
    'mya': {
        gradient: 'linear-gradient(135deg, #0a0a1a 0%, #101060 40%, #1a1a80 70%, #202090 100%)',
        description: 'MYA hookah tobacco — smooth and aromatic blends crafted for a premium hookah experience.',
    },
    'oduman-blend': {
        gradient: 'linear-gradient(135deg, #0a1a10 0%, #104030 40%, #1a6040 70%, #207050 100%)',
        description: 'Oduman Blend shisha — artisan-crafted hookah tobacco with unique, complex flavour profiles.',
    },
    'royal-smokin': {
        gradient: 'linear-gradient(135deg, #1a1000 0%, #402800 40%, #603800 70%, #804000 100%)',
        description: 'Royal Smokin hookah tobacco — rich, full-bodied flavours that deliver a truly royal session.',
    },
    'hookahs': {
        gradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 40%, #2a1a60 70%, #1a0a2e 100%)',
        description: 'Shop our full collection of premium hookahs — traditional Egyptian pipes, modern multi-hose setups, and everything in between.',
    },
    'hookah-flavours': {
        gradient: 'linear-gradient(135deg, #1a0a1a 0%, #3a1060 40%, #5a2070 70%, #2a0a3a 100%)',
        description: 'Explore hundreds of shisha tobacco flavours — fruity, minty, sweet and floral blends from the world\'s top brands.',
    },
    'traditional-hookahs': {
        gradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 40%, #2a1a60 70%, #1a0a2e 100%)',
        description: 'Classic Egyptian and Syrian-style hookahs — hand-finished stems, glass bases and the timeless look of a traditional session.',
    },
    'modern-hookahs': {
        gradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 40%, #2a1a60 70%, #1a0a2e 100%)',
        description: 'Modern hookahs with stainless-steel stems, click-lock bases and smooth, precise airflow for today’s smokers.',
    },
    'mini-portable-hookahs': {
        gradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 40%, #2a1a60 70%, #1a0a2e 100%)',
        description: 'Compact mini and portable hookahs — easy to carry, quick to set up and perfect for travel or small spaces.',
    },
    'multi-hose-hookahs': {
        gradient: 'linear-gradient(135deg, #0a0a1a 0%, #1a1040 40%, #2a1a60 70%, #1a0a2e 100%)',
        description: 'Multi-hose hookahs built for sharing — two, three and four-hose setups for group sessions.',
    },
    'fruity-flavours': {
        gradient: 'linear-gradient(135deg, #1a0a1a 0%, #3a1060 40%, #5a2070 70%, #2a0a3a 100%)',
        description: 'Fruity shisha flavours — juicy grape, watermelon, mango, berries and more for a bright, refreshing session.',
    },
    'minty-flavours': {
        gradient: 'linear-gradient(135deg, #1a0a1a 0%, #3a1060 40%, #5a2070 70%, #2a0a3a 100%)',
        description: 'Minty shisha flavours — cool, icy blends that add a fresh finish to every puff.',
    },
    'floral-flavours': {
        gradient: 'linear-gradient(135deg, #1a0a1a 0%, #3a1060 40%, #5a2070 70%, #2a0a3a 100%)',
        description: 'Floral shisha flavours — rose, jasmine and other aromatic blends for a smooth, elegant smoke.',
    },
    'sweet-flavours': {
        gradient: 'linear-gradient(135deg, #1a0a1a 0%, #3a1060 40%, #5a2070 70%, #2a0a3a 100%)',
        description: 'Sweet shisha flavours — dessert, candy and caramel-style blends for a rich, indulgent session.',
    },
    'coconut-shell-charcoal': {
        gradient: 'linear-gradient(135deg, #1a0a0a 0%, #3a1010 40%, #5a2010 70%, #6b2d0a 100%)',
        description: 'Natural coconut shell charcoal — clean burn, low ash and long-lasting heat with no chemical taste.',
    },
    'quick-light-charcoal': {
        gradient: 'linear-gradient(135deg, #1a0a0a 0%, #3a1010 40%, #5a2010 70%, #6b2d0a 100%)',
        description: 'Quick-light charcoal that ignites in seconds — convenient for outdoor sessions and when you are on the go.',
    },
    'mya-coal': {
        gradient: 'linear-gradient(135deg, #1a0a0a 0%, #3a1010 40%, #5a2010 70%, #6b2d0a 100%)',
        description: 'MYA coconut coal — available in 16, 36, 72, 96 and 112 piece packs for every session size.',
    },
    'sheesha-n-flavours-coal': {
        gradient: 'linear-gradient(135deg, #1a0a0a 0%, #3a1010 40%, #5a2010 70%, #6b2d0a 100%)',
        description: 'Sheesha N Flavours coconut coal — 24 piece packs of consistent, even-burning cubes.',
    },
    'ifraz-coal': {
        gradient: 'linear-gradient(135deg, #1a0a0a 0%, #3a1010 40%, #5a2010 70%, #6b2d0a 100%)',
        description: 'Ifraz coconut coal — 18 cube, 30 flat, 72 cube and 120 flat packs to suit any bowl and heat setup.',
    },
    'hookah-accessories': {
        gradient: 'linear-gradient(135deg, #1a1a0a 0%, #4a3a10 40%, #6b5010 70%, #8b6914 100%)',
        description: 'Everything you need for a better session — bowls, hoses, heat management, bases, cleaning gear and starter kits.',
    },
    'heat-management-devices': {
        gradient: 'linear-gradient(135deg, #1a1a0a 0%, #4a3a10 40%, #6b5010 70%, #8b6914 100%)',
        description: 'Heat management devices that replace foil — steady, adjustable heat for longer, more flavourful sessions.',
    },
    'bases-vases': {
        gradient: 'linear-gradient(135deg, #1a1a0a 0%, #4a3a10 40%, #6b5010 70%, #8b6914 100%)',
        description: 'Replacement hookah bases and vases — glass and crystal bases in a range of shapes, sizes and colours.',
    },
    'cleaning-maintenance': {
        gradient: 'linear-gradient(135deg, #1a1a0a 0%, #4a3a10 40%, #6b5010 70%, #8b6914 100%)',
        description: 'Cleaning brushes, grommets and maintenance essentials to keep your hookah fresh and smoking perfectly.',
    },
    'starter-kits-bundles': {
        gradient: 'linear-gradient(135deg, #1a1a0a 0%, #4a3a10 40%, #6b5010 70%, #8b6914 100%)',
        description: 'Hookah starter kits and bundles — everything you need to get started, packaged together at great value.',
    },
};

interface CategoryHeroProps {
    category: WPProductCategory | null;
    slug: string;
    title: string;
}

export default function CategoryHero({ category, slug, title }: CategoryHeroProps) {
    // Copy for this slug → its parent's copy → generic hookahs copy
    const parentSlug = findParent(slug).slug;
    const meta = CATEGORY_COPY[slug] ?? (parentSlug ? CATEGORY_COPY[parentSlug] : undefined) ?? CATEGORY_COPY['hookahs'];

    return (
        <div className="w-full relative overflow-hidden" style={{ height: 300 }}>
            {category?.image?.sourceUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={category.image.sourceUrl}
                    alt=""
                    fetchPriority="high"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />
            ) : (
                <div className="absolute inset-0" style={{ background: meta.gradient }} />
            )}
            <div className="absolute inset-0 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,200,100,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(200,100,255,0.3) 0%, transparent 50%)' }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center" style={{ background: 'rgba(0,0,0,0.35)' }}>
                <h1 className="text-white text-[28px] md:text-[40px]" style={{ fontWeight: 600, lineHeight: '1.35' }}>
                    {title}
                </h1>
                <p className="text-white mt-4 max-w-[720px] text-[15px] md:text-[18px]" style={{ fontWeight: 400, lineHeight: '1.6', opacity: 0.9 }}>
                    {category?.description || meta.description}
                </p>
            </div>
        </div>
    );
}
