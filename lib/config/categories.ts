/**
 * lib/config/categories.ts
 *
 * SINGLE SOURCE OF TRUTH for the retail category tree.
 * Header mega menu, mobile menu, footer, breadcrumbs and category heroes all
 * read from here. Every `slug` must match a WooCommerce product category slug
 * (WP Admin → Products → Categories).
 *
 * Pack sizes (50g / 250g / 1kg, 16 / 36 / 72 pcs…) are product VARIATIONS,
 * not categories.
 */

export interface CategoryLink {
    label: string;
    /** WooCommerce product_cat slug */
    slug: string;
    href: string;
    /** Optional small helper text shown under the label (e.g. pack sizes) */
    helper?: string;
}

export interface CategoryGroup {
    heading: string;
    items: CategoryLink[];
}

export interface TopCategory extends CategoryLink {
    /** Hero copy used when WooCommerce has no category description */
    description: string;
    groups: CategoryGroup[];
}

const cat = (label: string, slug: string, helper?: string): CategoryLink => ({
    label,
    slug,
    href: `/category/${slug}`,
    ...(helper ? { helper } : {}),
});

export const TOP_CATEGORIES: TopCategory[] = [
    {
        label: 'Hookahs',
        slug: 'hookahs',
        href: '/hookahs',
        description: 'Shop our full collection of premium hookahs — traditional Egyptian pipes, modern multi-hose setups, and everything in between.',
        groups: [
            {
                heading: 'Shop by Type',
                items: [
                    cat('Traditional', 'traditional-hookahs'),
                    cat('Modern', 'modern-hookahs'),
                    cat('Mini / Portable', 'mini-portable-hookahs'),
                    cat('Multi-Hose', 'multi-hose-hookahs'),
                ],
            },
        ],
    },
    {
        label: 'Hookah Flavours',
        slug: 'hookah-flavours',
        href: '/category/hookah-flavours',
        description: 'Explore shisha tobacco flavours — fruity, minty, sweet and floral blends from the world\'s top brands.',
        groups: [
            {
                heading: 'Shop by Flavour',
                items: [
                    cat('Fruity', 'fruity-flavours'),
                    cat('Minty', 'minty-flavours'),
                    cat('Floral', 'floral-flavours'),
                    cat('Sweet', 'sweet-flavours'),
                ],
            },
        ],
    },
    {
        label: 'Charcoal',
        slug: 'hookah-charcoal',
        href: '/category/hookah-charcoal',
        description: 'Premium hookah charcoal for the perfect session — natural coconut coals, quick-light, and long-lasting options.',
        groups: [
            {
                heading: 'Shop by Type',
                items: [
                    cat('Coconut Shell', 'coconut-shell-charcoal'),
                    cat('Quick Light', 'quick-light-charcoal'),
                ],
            },
            {
                heading: 'Shop by Size / Shape',
                items: [
                    cat('MYA Coal', 'mya-coal', '16, 36, 72, 96, 112 Pcs'),
                    cat('Sheesha N Flavours', 'sheesha-n-flavours-coal', '24 Pcs'),
                    cat('Ifraz', 'ifraz-coal', '18 Cube, 30 Flat, 72 Cube, 120 Flat'),
                ],
            },
        ],
    },
    {
        label: 'Hookah Accessories',
        slug: 'hookah-accessories',
        href: '/category/hookah-accessories',
        description: 'Everything you need for a better session — bowls, hoses, heat management, bases, cleaning gear and starter kits.',
        groups: [
            {
                heading: 'Shop by Type',
                items: [
                    cat('Hookah Bowls', 'hookah-bowls'),
                    cat('Hoses & Mouthpieces', 'hookah-hoses'),
                    cat('Heat Management Devices', 'heat-management-devices'),
                    cat('Bases & Vases', 'bases-vases'),
                    cat('Cleaning & Maintenance', 'cleaning-maintenance'),
                    cat('Starter Kits / Bundles', 'starter-kits-bundles'),
                ],
            },
        ],
    },
];

/* ── Brands (also WooCommerce product categories) ─────────────────────────── */
export const BRANDS: CategoryLink[] = [
    { label: 'Al Fakher', slug: 'al-fakher', href: '/brand/al-fakher' },
    { label: 'Afzal', slug: 'afzal', href: '/brand/afzal' },
    { label: 'Mya', slug: 'mya', href: '/brand/mya' },
    { label: 'Oduman Blend', slug: 'oduman-blend', href: '/brand/oduman-blend' },
    { label: 'Royal Smokin', slug: 'royal-smokin', href: '/brand/royal-smokin' },
];

export const BRAND_SLUGS: string[] = BRANDS.map(b => b.slug);

/** Brands belong under Hookah Flavours for breadcrumbs. */
const BRAND_PARENT_SLUG = 'hookah-flavours';

/**
 * Older WooCommerce categories that still exist but are no longer in the menu.
 * Kept only so their pages get a sensible breadcrumb parent.
 */
const LEGACY_PARENTS: Record<string, string> = {
    'coco-nara': 'hookah-charcoal',
    'cocous': 'hookah-charcoal',
    'other-hookah-accessories': 'hookah-accessories',
};

/* ── Helpers ──────────────────────────────────────────────────────────────── */

export const childrenOf = (top: TopCategory): CategoryLink[] =>
    top.groups.flatMap(g => g.items);

export const findTopCategory = (slug: string): TopCategory | undefined =>
    TOP_CATEGORIES.find(t => t.slug === slug);

/** Find any category (top-level, child or brand) by slug. */
export function findCategory(slug: string): CategoryLink | undefined {
    for (const top of TOP_CATEGORIES) {
        if (top.slug === slug) return top;
        const child = childrenOf(top).find(c => c.slug === slug);
        if (child) return child;
    }
    return BRANDS.find(b => b.slug === slug);
}

/** Breadcrumb parent for a category slug (top-level categories → Home). */
export function findParent(slug: string): { label: string; href: string; slug?: string } {
    for (const top of TOP_CATEGORIES) {
        if (childrenOf(top).some(c => c.slug === slug)) {
            return { label: top.label, href: top.href, slug: top.slug };
        }
    }
    const parentSlug = BRAND_SLUGS.includes(slug) ? BRAND_PARENT_SLUG : LEGACY_PARENTS[slug];
    const parent = parentSlug ? findTopCategory(parentSlug) : undefined;
    if (parent) return { label: parent.label, href: parent.href, slug: parent.slug };
    return { label: 'Home', href: '/' };
}
