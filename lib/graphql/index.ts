/**
 * GraphQL utility for WordPress/WooCommerce queries
 * Server-side only - do NOT import in client components
 */

/**
 * Fetch data from WordPress GraphQL endpoint.
 *
 * @param query     - GraphQL query string
 * @param variables - Query variables
 * @param revalidate - ISR revalidation window in seconds.
 *                     Pass 0 to opt into `cache: 'no-store'` (for auth/mutations).
 *                     Defaults to 3600 (1 hour) for public read-only content.
 *
 * DO NOT call this from auth-graphql.ts or wc-client.ts — those use their own
 * fetch calls with explicit `cache: 'no-store'` and must remain uncached.
 */
export async function fetchGraphQL(
  query: string,
  variables: Record<string, any> = {},
  revalidate: number = 3600,
) {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://cms.thehookahstore.in/graphql';

  const fetchOptions: RequestInit = revalidate === 0
    ? { next: { revalidate: 0 } }
    : { next: { revalidate } };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    ...fetchOptions,
  });

  const json = await response.json();

  if (json.errors) {
    console.error('GraphQL Errors:', json.errors);
    throw new Error('GraphQL query error');
  }

  return json.data;
}

/**
 * Like fetchGraphQL but NEVER throws.
 * Returns null when the query fails (network error, GraphQL errors, etc.).
 * Use this for optional/decorative data (e.g. ACF hero slides) so the page
 * always renders with the hardcoded fallback — no error overlay in dev.
 */
/** Operation name from a query string, e.g. "GetHomepageBrands" (for logs). */
function queryName(query: string): string {
  return query.match(/\b(?:query|mutation)\s+(\w+)/)?.[1] ?? 'anonymous query';
}

export async function fetchGraphQLSafe(
  query: string,
  variables: Record<string, any> = {},
  revalidate: number = 3600,
): Promise<any | null> {
  const name = queryName(query);
  try {
    const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'https://cms.thehookahstore.in/graphql';

    const fetchOptions: RequestInit = revalidate === 0
      ? { next: { revalidate: 0 } }
      : { next: { revalidate } };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables }),
      ...fetchOptions,
    });

    const json = await response.json();

    if (json.errors) {
      // Logged in every environment (visible in Cloudflare Pages → Functions logs)
      // so a broken query never silently looks like "no products".
      console.error(
        `[fetchGraphQLSafe] ${name} failed — page will use fallback data:`,
        (json.errors as Array<{ message?: string }>).map(e => e.message).join(' | '),
        JSON.stringify(variables),
      );
      return null;
    }

    return json.data ?? null;
  } catch (err) {
    console.error(`[fetchGraphQLSafe] ${name} network/parse error — page will use fallback data:`, err);
    return null;
  }
}

/**
 * Consumer Search Query
 * Fetches products with price and categories
 * Note: Uses WooCommerce-specific fields
 */
export const CONSUMER_SEARCH_QUERY = `
  query ProductLiveSearch($query: String!) {
    products(
      first: 10
      where: {
        search: $query
      }
    ) {
      nodes {
        id
        name
        slug
        image {
          sourceUrl
        }
        ... on SimpleProduct {
          price
          productCategories {
            nodes {
              name
              slug
            }
          }
        }
        ... on VariableProduct {
          price
          productCategories {
            nodes {
              name
              slug
            }
          }
        }
      }
    }
  }
`;

/**
 * Wholesale search no longer uses GraphQL (the metaQuery extension isn't
 * installed). See searchWholesaleProducts() in lib/woocommerce/wholesale-catalog.ts.
 */

/**
 * Blog Posts Query
 * Fetches published posts with featured image, tags, categories and author
 */
export const GET_POSTS_QUERY = `
  query GetPosts($first: Int!) {
    posts(first: $first, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        slug
        date
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        tags {
          nodes {
            name
            slug
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
        author {
          node {
            name
          }
        }
      }
    }
  }
`;

export type WPPost = {
  id: string;
  title: string;
  slug: string;
  date: string;
  excerpt: string;
  featuredImage: { node: { sourceUrl: string; altText: string } } | null;
  tags: { nodes: { name: string; slug: string }[] };
  categories: { nodes: { name: string; slug: string }[] };
  author: { node: { name: string } };
};

/**
 * Blog Categories Query
 * Fetches all non-empty categories (categories that have at least 1 published post)
 */
export const GET_CATEGORIES_QUERY = `
  query GetCategories {
    categories(first: 50, where: { hideEmpty: true }) {
      nodes {
        id
        name
        slug
        count
      }
    }
  }
`;

export type WPCategory = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

/**
 * Single Post Query — fetch full post by slug
 */
export const GET_POST_QUERY = `
  query GetPost($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      id
      title
      slug
      date
      content
      excerpt
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      tags {
        nodes {
          name
          slug
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      author {
        node {
          name
        }
      }
    }
  }
`;

/**
 * All Post Slugs — used for generateStaticParams
 */
export const GET_ALL_SLUGS_QUERY = `
  query GetAllSlugs {
    posts(first: 100, where: { status: PUBLISH }) {
      nodes {
        slug
      }
    }
  }
`;

export type WPPostFull = WPPost & {
  content: string;
};

/**
 * Category Posts Query — fetch category info + all posts in that category
 */
export const GET_CATEGORY_POSTS_QUERY = `
  query GetCategoryPosts($slug: ID!) {
    category(id: $slug, idType: SLUG) {
      id
      name
      slug
      description
      count
      posts(first: 100, where: { status: PUBLISH }) {
        nodes {
          id
          title
          slug
          date
          excerpt
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
          tags {
            nodes {
              name
              slug
            }
          }
          categories {
            nodes {
              name
              slug
            }
          }
          author {
            node {
              name
            }
          }
        }
      }
    }
  }
`;

/**
 * Hero Slider — ACF slides from the WordPress Home page
 * Field group: heroSlider > slides (Repeater)
 *
 * NOTE: ACF Image fields in WPGraphQL return a media object, NOT a plain URL.
 * You must query { sourceUrl } on the image field.
 */
export const GET_HOME_HERO_SLIDES = `
  query GetHomeHeroSlides {
    page(id: "home", idType: URI) {
      heroSlider {
        slides {
          slideImage { node { sourceUrl } }
          mobileImage { node { sourceUrl } }
          badgeText
          title
          description
          buttonText
          buttonLink
        }
      }
    }
  }
`;

export const GET_WHOLESALE_HERO_SLIDES = `
  query GetWholesaleHeroSlides {
    page(id: "wholesale-home", idType: URI) {
      heroSlider {
        slides {
          slideImage { node { sourceUrl } }
          mobileImage { node { sourceUrl } }
          badgeText
          title
          description
          buttonText
          buttonLink
        }
      }
    }
  }
`;

export type AcfHeroSlide = {
  slideImage:   { node: { sourceUrl: string } } | null;
  mobileImage:  { node: { sourceUrl: string } } | null;
  badgeText:    string | null;
  title:        string | null;
  description:  string | null;
  buttonText:   string | null;
  buttonLink:   string | null;
};

/**
 * WooCommerce Products by Category Slug
 * Used by /category/[slug] to fetch all products in a given product category.
 */
export const GET_PRODUCTS_BY_CATEGORY = `
  query GetProductsByCategory($slug: String!, $first: Int!) {
    products(
      first: $first
      where: { category: $slug }
    ) {
      nodes {
        id
        databaseId
        name
        slug
        image {
          sourceUrl
          altText
        }
        # Used by the BRAND filter (brands are product categories).
        # Must be inside a fragment — ProductUnion has no direct productCategories field.
        ... on Product { productCategories(first: 20) { nodes { slug name } } }
        ... on Product { productTags(first: 20) { nodes { name slug } } }
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
          shortDescription
          stockStatus
          attributes { nodes { name options } }
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          shortDescription
          stockStatus
          attributes { nodes { name options } }
          variations(first: 50) { nodes { databaseId price regularPrice stockStatus attributes { nodes { name value } } } }
        }
      }
    }
  }
`;

/**
 * Category products + ACF ribbons, merged. Same shape as
 * fetchGraphQLSafe(GET_PRODUCTS_BY_CATEGORY) ({ products: { nodes } } | null);
 * the ribbon query is optional, so a missing ACF field never empties a page.
 */
export async function fetchCategoryProducts(slug: string, first = 60, revalidate = 300): Promise<{ products: { nodes: WPProductNode[] } } | null> {
  const [prodData, ribbonData] = await Promise.all([
    fetchGraphQLSafe(GET_PRODUCTS_BY_CATEGORY, { slug, first }, revalidate),
    fetchGraphQLSafe(GET_CATEGORY_RIBBONS, { slug, first }, revalidate),
  ]);
  if (!prodData) return null;
  const ribbons = new Map<number, { ribbonType?: string | null }>(
    (ribbonData?.products?.nodes ?? [])
      .filter((n: { productRibbon?: unknown }) => n?.productRibbon)
      .map((n: { databaseId: number; productRibbon: { ribbonType?: string | null } }) => [n.databaseId, n.productRibbon]),
  );
  const nodes: WPProductNode[] = (prodData.products?.nodes ?? []).map((p: WPProductNode) => ({
    ...p,
    productRibbon: ribbons.get(p.databaseId) ?? null,
  }));
  return { products: { nodes } };
}

/** Optional ACF ribbons for a category (separate so a missing field can't break the listing). */
export const GET_CATEGORY_RIBBONS = `
  query GetCategoryRibbons($slug: String!, $first: Int!) {
    products(first: $first, where: { category: $slug }) {
      nodes {
        databaseId
        ... on SimpleProduct { productRibbon { ribbonType } }
        ... on VariableProduct { productRibbon { ribbonType } }
      }
    }
  }
`;

/**
 * WooCommerce Product Category by Slug
 * Fetches the category name/description for the page heading.
 */
export const GET_PRODUCT_CATEGORY = `
  query GetProductCategory($slug: ID!) {
    productCategory(id: $slug, idType: SLUG) {
      id
      name
      slug
      description
      count
      image {
        sourceUrl
        altText
      }
    }
  }
`;

export type WPProductNode = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  image: { sourceUrl: string; altText: string } | null;
  productCategories?: { nodes: { slug: string; name: string }[] };
  productTags?: { nodes: { name: string; slug?: string }[] };
  productRibbon?: { ribbonType?: string | null } | null;
  stockStatus?: string;
  price?: string;
  regularPrice?: string;
  salePrice?: string | null;
  shortDescription?: string | null;
  attributes?: { nodes: { name: string; options: string[] }[] };
  variations?: { nodes: { databaseId: number; price: string; regularPrice: string; stockStatus?: string; attributes: { nodes: { name?: string; value: string }[] } }[] };
};

export type WPProductCategory = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  count: number;
  image: { sourceUrl: string; altText: string } | null;
};


export type WPProductTag = {
  id: string;
  name: string;
  slug: string;
  count: number;
};

/**
 * Product Detail Query — used for /product/[slug] ISR pages
 */
export const GET_PRODUCT_DETAIL = `
  query GetProduct($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      image { sourceUrl altText }
      productTags(first: 20) { nodes { name slug } }
      ... on SimpleProduct {
        price
        stockStatus
        attributes { nodes { name options } }
      }
      ... on VariableProduct {
        price
        stockStatus
        attributes { nodes { name options } }
        variations(first: 50) { nodes { id databaseId name price stockStatus attributes { nodes { name value } } } }
      }
    }
  }
`;

export type WPProductDetail = {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description: string;
  price?: string;
  stockStatus?: string;
  image?: { sourceUrl: string; altText?: string };
  attributes?: { nodes: Array<{ name: string; options: string[] }> };
  productTags?: { nodes: Array<{ name: string; slug?: string }> };
  variations?: { nodes: Array<{ id: string; databaseId: number; name: string; price: string; stockStatus?: string; attributes?: { nodes: Array<{ name?: string; value: string }> } }> };
};

/**
 * Homepage Brands — one query PER BRAND, run in parallel.
 *
 * Previously a single batched query also requested the ACF field
 * `productRibbon`; if that field wasn't exposed to GraphQL the whole query
 * errored and all five sliders went blank. Now:
 *   - each brand's products are fetched independently (Promise.allSettled),
 *     so one failing brand can't blank the others;
 *   - ribbons come from a separate optional query and are merged in by
 *     databaseId — if it fails, products still show (just without ribbons).
 */
export const HOMEPAGE_BRAND_ALIASES = {
  alfakher: 'al-fakher',
  afzal: 'afzal',
  royal: 'royal-smokin',
  oduman: 'oduman-blend',
  mya: 'mya',
} as const;

type HomepageBrandAlias = keyof typeof HOMEPAGE_BRAND_ALIASES;

export const GET_HOMEPAGE_BRAND_PRODUCTS = `
  query GetHomepageBrandProducts($slug: String!) {
    products(first: 5, where: { orderby: { field: DATE, order: DESC }, category: $slug }) {
      nodes {
        id
        databaseId
        slug
        name
        description
        image { sourceUrl }
        ... on SimpleProduct {
          price
          stockStatus
          productTags { nodes { name } }
          attributes { nodes { name options } }
        }
        ... on VariableProduct {
          price
          stockStatus
          productTags { nodes { name } }
          attributes { nodes { name options } }
          variations(first: 50) { nodes { id databaseId name price stockStatus attributes { nodes { name value } } } }
        }
      }
    }
  }
`;

/** Optional ACF ribbons for all homepage brands (may fail independently). */
export const GET_HOMEPAGE_BRAND_RIBBONS = `
  query GetHomepageBrandRibbons {
${Object.entries(HOMEPAGE_BRAND_ALIASES).map(([alias, slug]) => `    ${alias}: products(first: 5, where: { orderby: { field: DATE, order: DESC }, category: "${slug}" }) {
      nodes {
        databaseId
        ... on SimpleProduct { productRibbon { ribbonType } }
        ... on VariableProduct { productRibbon { ribbonType } }
      }
    }`).join('\n')}
  }
`;

/**
 * Fetch all homepage brand sliders. Never throws; a brand that fails
 * returns an empty list and is logged by fetchGraphQLSafe.
 */
export async function fetchHomepageBrands(revalidate = 300): Promise<HomepageBrandsData> {
  const aliases = Object.keys(HOMEPAGE_BRAND_ALIASES) as HomepageBrandAlias[];

  const [ribbonResult, ...brandResults] = await Promise.allSettled([
    fetchGraphQLSafe(GET_HOMEPAGE_BRAND_RIBBONS, {}, revalidate),
    ...aliases.map(alias =>
      fetchGraphQLSafe(GET_HOMEPAGE_BRAND_PRODUCTS, { slug: HOMEPAGE_BRAND_ALIASES[alias] }, revalidate)
    ),
  ]);

  const ribbonData = ribbonResult.status === 'fulfilled' ? ribbonResult.value : null;
  const ribbonById = new Map<number, { ribbonType?: string }>();
  if (ribbonData) {
    for (const alias of aliases) {
      for (const n of ribbonData[alias]?.nodes ?? []) {
        if (n?.productRibbon) ribbonById.set(n.databaseId, n.productRibbon);
      }
    }
  }

  const out: NonNullable<HomepageBrandsData> = {};
  aliases.forEach((alias, i) => {
    const r = brandResults[i];
    const nodes: HomepageProduct[] = r.status === 'fulfilled' ? (r.value?.products?.nodes ?? []) : [];
    out[alias] = {
      nodes: nodes.map(p => ({ ...p, productRibbon: ribbonById.get(p.databaseId) ?? p.productRibbon })),
    };
  });
  return out;
}

/** A single product node as returned by fetchHomepageBrands */
export type HomepageProduct = {
  id: string;
  databaseId: number;
  slug: string;
  name: string;
  description: string;
  price?: string;
  stockStatus?: string;
  image?: { sourceUrl: string };
  productRibbon?: { ribbonType?: string };
  productTags?: { nodes: Array<{ name: string }> };
  attributes?: { nodes: Array<{ name: string; options: string[] }> };
  variations?: { nodes: Array<{ id: string; databaseId?: number; name: string; price: string; stockStatus?: string; attributes?: { nodes: Array<{ name?: string; value: string }> } }> };
};

/** Shape of the data object returned by fetchHomepageBrands */
export type HomepageBrandsData = {
  alfakher?: { nodes: HomepageProduct[] };
  afzal?:    { nodes: HomepageProduct[] };
  royal?:    { nodes: HomepageProduct[] };
  oduman?:   { nodes: HomepageProduct[] };
  mya?:      { nodes: HomepageProduct[] };
} | null;

/**
 * Canonical WPProduct — single unified type for a WooCommerce product node.
 * Import this instead of defining local product types in components.
 * Encompasses both SimpleProduct and VariableProduct fields.
 */
export interface WPProduct {
    id: string;
    databaseId: number;
    name: string;
    slug: string;
    description: string;
    price?: string;
    stockStatus?: string;
    image?: { sourceUrl: string; altText?: string };
    attributes?: { nodes: Array<{ name: string; options: string[] }> };
    variations?: { nodes: Array<{ id: string; name: string; price: string }> };
}
