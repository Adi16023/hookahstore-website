# IMPLEMENTATION_TASK_LIST.md
# The Hookah Store — Engineering Task Checklist

> **Source documents:** PROJECT_ARCHITECTURE.md · PROJECT_DEEP_ANALYSIS.md · PROJECT_OPTIMIZATION_PLAN.md  
> **Date:** March 2026  
> **Format:** Each task is atomic — one commit per task.

---

## Quick Reference

| Phase | Tasks | Focus |
|---|---|---|
| Phase 1 | TASK-001 → TASK-007 | Critical architecture fixes |
| Phase 2 | TASK-008 → TASK-016 | Performance improvements |
| Phase 3 | TASK-017 → TASK-024 | Refactor and code quality |
| Phase 4 | TASK-025 → TASK-031 | Security and cleanup |

**Legend:**  
🔴 Do not skip — critical  
🟡 High impact  
🟢 Standard  
✅ Checkbox for tracking completion

---

## Phase 1 — Critical Architecture Fixes

> These tasks directly affect SEO, security, and core functionality. Complete before any other work.

---

### TASK-001
**Enforce mandatory `WHOLESALE_WEBHOOK_SECRET` on webhook endpoints**

- [ ] Task complete

**Why:** If the env var is missing, `/api/wholesale/approved` and `/api/wholesale/rejected` accept unauthenticated POST requests from anyone, triggering arbitrary approval/rejection emails. 🔴

**Files to modify:**
```
frontend/app/api/wholesale/approved/route.ts
frontend/app/api/wholesale/rejected/route.ts
```

**Expected changes:**
- Remove the `if (WEBHOOK_SECRET) { ... } else { warn }` branching pattern
- Replace with: if `WEBHOOK_SECRET` is falsy, immediately return `500` with body `{ error: 'Webhook not configured.' }` and log a clear error
- Token mismatch must always return `401`
- No code path should allow the email send to proceed without a valid token match

**Complexity:** Low

---

### TASK-002
**Convert product detail page from CSR to ISR server component**

- [ ] Task complete

**Why:** Currently the page shell is empty HTML. Google cannot index product names, prices, or descriptions without JS rendering. Every user sees a loading spinner instead of product content. 🔴

**Files to modify:**
```
frontend/app/(site)/product/[slug]/page.tsx
frontend/app/(site)/product/[slug]/ProductDetailPageClient.tsx
```

**Expected changes in `page.tsx`:**
- Remove `export const runtime = 'edge'`
- Add `export const revalidate = 300`
- Import `fetchGraphQL` from `lib/graphql`
- Add `PRODUCT_QUERY` import (or define server-side)
- Fetch product data server-side: `const product = await fetchGraphQL(PRODUCT_QUERY, { slug }, 300)`
- Pass `product` as a prop to `<ProductDetailPageClient product={product} />`
- Handle 404 case: if `product` is null, call `notFound()`

**Expected changes in `ProductDetailPageClient.tsx`:**
- Remove the `useEffect` fetch block (lines ~70–108)
- Remove `useState` for `product`, `loading`, `notFound`
- Add `product: WPProduct` to the component props interface
- Remove the loading skeleton JSX (3-dot spinner)
- Remove the 404 JSX (let `page.tsx` call `notFound()` instead)
- Keep all interactive state: `selectedSize`, `selectedPrice`, `quantity`, `addedFeedback`
- Keep `handleSizeSelect`, `handleAddToCart`, all rendering JSX

**Complexity:** High

---

### TASK-003
**Remove 3 hardcoded hero slides — render ACF slides only**

- [ ] Task complete

**Why:** All 3 hardcoded slides use the same placeholder image (`/hero-vanilla.webp`). Real CMS content is pushed past slot 3. Customers see repeated placeholder images before brand content. 🔴

**Files to modify:**
```
frontend/components/HeroSlider.tsx
```

**Expected changes:**
- Delete the entire `hardcodedSlides: Slide[]` array (lines ~67–95)
- Change `const slides: Slide[] = [...hardcodedSlides, ...fromAcf]` to `const slides: Slide[] = fromAcf`
- Add a fallback: if `fromAcf.length === 0`, render a single default slide with a sensible image and CTA (e.g. the existing `/hero-vanilla.webp` image pointing to `/category/hookah-flavours`)
- The rest of the slider logic (`extendedSlides`, navigation, autoplay) remains unchanged

**Complexity:** Low

---

### TASK-004
**Enable Next.js image optimisation — remove `unoptimized: true`**

- [ ] Task complete

**Why:** All images are served at full-resolution from the WordPress media library. No WebP conversion, no resizing. Hero images can be 3–5MB on mobile. LCP score is severely affected. 🔴

**Files to modify:**
```
frontend/next.config.mjs
frontend/components/HeroSlider.tsx
```

**Expected changes in `next.config.mjs`:**
- Remove the line: `unoptimized: true`
- Ensure `remotePatterns` includes `cms.thehookahstore.in`:
  ```js
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cms.thehookahstore.in',
      pathname: '/wp-content/uploads/**',
    },
  ],
  ```

**Expected changes in `HeroSlider.tsx`:**
- On the first slide's `<Image>` component, add `priority` prop
- Add a `sizes` prop to all hero `<Image>` components:
  ```
  sizes="(max-width: 639px) 100vw, (max-width: 1024px) calc(100vw - 140px), 1440px"
  ```
- For the mobile `<Image>`, add `sizes="100vw"`

**Complexity:** Low

---

### TASK-005
**Add a combined GraphQL query for all homepage brand products**

- [ ] Task complete

**Why:** The homepage currently fires 5 independent `useEffect` GraphQL fetches from the browser — one per brand section (Alfakher, Afzal, Royal Smoking, Oduman, Mya). These are uncached and hit WordPress on every user visit. 🔴

**Files to modify:**
```
frontend/lib/graphql/index.ts
```

**Expected changes:**
- Add a new exported query constant `GET_HOMEPAGE_BRANDS`:
  ```graphql
  query GetHomepageBrands {
    alfakher: products(first: 5, where: { tagIn: ["Alfakher"], orderby: { field: DATE, order: DESC } }) { nodes { ...ProductFields } }
    afzal:    products(first: 5, where: { tagIn: ["Afzal"],    orderby: { field: DATE, order: DESC } }) { nodes { ...ProductFields } }
    royal:    products(first: 5, where: { tagIn: ["Royal Smokin"], orderby: { field: DATE, order: DESC } }) { nodes { ...ProductFields } }
    oduman:   products(first: 5, where: { tagIn: ["Oduman Blend"], orderby: { field: DATE, order: DESC } }) { nodes { ...ProductFields } }
    mya:      products(first: 5, where: { tagIn: ["Mya"],      orderby: { field: DATE, order: DESC } }) { nodes { ...ProductFields } }
  }
  ```
- Add a `HomepageBrandsData` TypeScript type for the response shape
- Define a `ProductFields` fragment (or inline fields) matching the existing `PRODUCTS_QUERY` field set

**Note:** GraphQL fragments in WPGraphQL require inline spreading if fragment definitions are not supported. Test the combined query in the WPGraphQL IDE first.

**Complexity:** Medium

---

### TASK-006
**Move homepage brand product fetches to server — remove client-side fetches from ProductSlider**

- [ ] Task complete

**Why:** Follows from TASK-005. The `ProductSlider` component currently owns the data fetch. It must become a pure presentation carousel. 🔴

**Files to modify:**
```
frontend/app/(site)/page.tsx
frontend/components/pages/HomePageContent.tsx
frontend/components/ProductSlider.tsx
```

**Expected changes in `page.tsx`:**
- Import `GET_HOMEPAGE_BRANDS` and `HomepageBrandsData`
- Add: `const brandsData = await fetchGraphQLSafe(GET_HOMEPAGE_BRANDS, {}, 300)`
- Extract per-brand arrays: `alfakherProducts`, `afzalProducts`, etc.
- Pass them as props to `<HomePageContent brandProducts={...} />`

**Expected changes in `HomePageContent.tsx`:**
- Accept `brandProducts: HomepageBrandsData` prop
- Pass `products={brandProducts.alfakher.nodes}` to each `<ProductSlider />` respectively
- Remove the `ProductSliderLazy` dynamic imports if sliders now receive props synchronously (re-evaluate if lazy loading is still desired)

**Expected changes in `ProductSlider.tsx`:**
- Remove `PRODUCTS_QUERY` constant (entire query string block)
- Remove `fetchProducts()` function
- Remove `useEffect` that calls `fetchProducts` and `[tag]` dependency
- Remove `tag`, `limit` props (no longer needed — data arrives as `products` prop)
- Add `products: Product[]` to `ProductSliderProps`
- Remove `useState<Product[]>([])` and `useState(true)` for loading
- Keep all layout, carousel, touch, dimension logic unchanged

**Complexity:** High

---

### TASK-007
**Fix hero slide ISR revalidation conflict (30s vs 300s)**

- [ ] Task complete

**Why:** `page.tsx` exports `revalidate = 300` but calls `fetchGraphQLSafe(GET_HOME_HERO_SLIDES, {}, 30)`. The fetch-level value (30s) overrides the page-level value, causing the hero content to refresh every 30 seconds unnecessarily. 🔴

**Files to modify:**
```
frontend/app/(site)/page.tsx
```

**Expected changes:**
- Change: `fetchGraphQLSafe(GET_HOME_HERO_SLIDES, {}, 30)`
- To: `fetchGraphQLSafe(GET_HOME_HERO_SLIDES, {}, 300)`
- Both the page-level `export const revalidate = 300` and the fetch-level value now agree

**Complexity:** Low

---

## Phase 2 — Performance Improvements

> Complete after Phase 1. These tasks reduce client-side network requests and improve render performance.

---

### TASK-008
**Create `/api/search` proxy route — remove direct browser→GraphQL calls from LiveSearch**

- [ ] Task complete

**Why:** `LiveSearch.tsx` calls `cms.thehookahstore.in/graphql` directly from the browser. This exposes the WordPress GraphQL endpoint to all users, bypasses any future caching or auth, and duplicates query strings that exist in `lib/graphql`. 🟡

**Files to modify:**
```
frontend/app/api/search/route.ts    (new file)
frontend/components/search/LiveSearch.tsx
```

**Expected changes — new `route.ts`:**
- Accept `GET /api/search?q=<query>&mode=consumer|wholesale`
- Import `CONSUMER_SEARCH_QUERY`, `WHOLESALE_SEARCH_QUERY` from `lib/graphql`
- Call `fetchGraphQL(query, { query: q }, 0)` (no-cache — live search)
- Return the product nodes as JSON
- Validate `q` length >= 2, return empty array if too short
- Set `export const dynamic = 'force-dynamic'`

**Expected changes in `LiveSearch.tsx`:**
- Remove both local query string constants (`CONSUMER_SEARCH_QUERY`, `WHOLESALE_SEARCH_QUERY`)
- Remove the local `endpoint` variable pointing to WordPress
- Replace `fetch(endpoint, { body: graphqlBody })` with `fetch(\`/api/search?q=${encodeURIComponent(debouncedQuery)}&mode=${mode}\`)`
- Parse the response as the existing product shape (no change to downstream SearchDropdown)
- Keep AbortController logic as-is (still needed for debounce cancellation)

**Complexity:** Medium

---

### TASK-009
**Add `React.memo` to `ProductCard` to prevent mass re-renders**

- [ ] Task complete

**Why:** 60 `ProductCard` instances on a category page all re-render whenever cart state, theme, or auth role changes — even for cards unaffected by the change. 🟡

**Files to modify:**
```
frontend/components/ProductCard.tsx
```

**Expected changes:**
- Wrap the default export with `React.memo`:
  ```tsx
  export default React.memo(function ProductCard({ ... }) { ... });
  ```
- Add a custom comparison function if needed (compare only `productId`, `price`, `selectedVariation`) — only necessary if memo alone doesn't prevent enough re-renders
- Verify no prop types are objects/arrays passed inline at the call site (those break memo) — `variations` and `variationPrices` may need to be stabilised with `useMemo` in the parent

**Complexity:** Low

---

### TASK-010
**Split CartProvider into CartActionsContext + CartStateContext**

- [ ] Task complete

**Why:** All cart consumers (including 60 `ProductCard` instances) re-render on every cart mutation because they share one context. Splitting actions from state means ProductCards only subscribe to actions (stable), not to the cart array. 🟡

**Files to modify:**
```
frontend/components/providers/CartProvider.tsx
```

**Expected changes:**
- Create `CartActionsContext` with: `{ addToCart, removeFromCart, updateQuantity, clearCart }`
- Create `CartStateContext` with: `{ cart, count, total }`
- Export two hooks: `useCartActions()` and `useCartState()`
- Keep `useCart()` as a combined hook for backward compatibility (wraps both)
- `ProductCard` should be updated to use `useCartActions()` only (no subscription to cart state array)
- `HeaderNav` cart count should use `useCartState()` only

**Complexity:** Medium

---

### TASK-011
**Fix HeroSlider autoplay interval re-creation on every slide transition**

- [ ] Task complete

**Why:** The autoplay `useEffect` depends on `[isPaused, isTransitioning]`. Since `isTransitioning` toggles twice per slide cycle (true → false), `setInterval` is cleared and re-created after every slide, resetting the 12-second countdown. 🟡

**Files to modify:**
```
frontend/components/HeroSlider.tsx
```

**Expected changes:**
- Change `isTransitioning` from `useState` to `useRef<boolean>`:
  ```tsx
  const isTransitioningRef = useRef(false);
  ```
- Replace all `setIsTransitioning(true/false)` with `isTransitioningRef.current = true/false`
- Update the autoplay guard: `if (!isTransitioningRef.current) { ... }`
- Remove `isTransitioning` from the autoplay `useEffect` dependency array — it now depends only on `[isPaused]`
- The transition-end `useEffect` can watch `activeIndex` to detect when a wrap-around reset is needed

**Complexity:** Medium

---

### TASK-012
**Replace JS inline colour tokens with CSS custom properties in ProductCard**

- [ ] Task complete

**Why:** `ProductCard` computes 8+ colour values from `const { dark } = useTheme()` and applies them as inline styles. Any theme toggle re-renders all 60 cards. The root layout already defines CSS custom properties. 🟡

**Files to modify:**
```
frontend/components/ProductCard.tsx
```

**Expected changes:**
- Remove all `const cardBg`, `cardBorder`, `titleColor`, `descColor`, `priceColor`, `pillBorder`, `cardShadow` JS variables derived from `dark`
- Remove `const { dark } = useTheme()` (only keep it if still needed for `hexToRgba` glow)
- Replace inline styles with CSS variable references:
  ```tsx
  style={{ color: 'var(--clr-text)' }}
  style={{ backgroundColor: 'var(--clr-surface)' }}
  style={{ borderColor: 'var(--clr-border)' }}
  ```
- The accent-colour glow (`hexToRgba(accentColor, 0.85)`) can remain as JS since it depends on a prop, not the theme
- Add any missing CSS variable definitions to the root layout's inline `<style>` block if needed

**Complexity:** Medium

---

### TASK-013
**Replace JS inline colour tokens with CSS custom properties in HomePageContent**

- [ ] Task complete

**Why:** `HomePageContent` is `'use client'` primarily to read `useTheme()` for colour tokens. Removing this dependency could allow the component to be a Server Component. 🟡

**Files to modify:**
```
frontend/components/pages/HomePageContent.tsx
```

**Expected changes:**
- Remove `const { dark } = useTheme()` and all derived colour variables (`headingColor`, `subTextColor`, `dividerColor`)
- Replace with CSS variables: `var(--clr-text)`, `var(--clr-text-muted)`, `var(--clr-border)`
- Evaluate if `'use client'` can be removed after this change. If no other client hooks remain, remove it and convert to a Server Component — but keep `HeroSlider` and `ProductSlider` as explicit client co-imports

**Complexity:** Medium

---

### TASK-014
**Add 30-minute ISR cache to shipping methods route**

- [ ] Task complete

**Why:** `/api/shipping/methods` fires N+1 WooCommerce REST calls per checkout with `cache: 'no-store'`. Shipping zones change at most weekly. Every checkout session hits WooCommerce unnecessarily. 🟡

**Files to modify:**
```
frontend/app/api/shipping/methods/route.ts
```

**Expected changes:**
- In `wcFetch` calls for shipping zones and methods, replace `cache: 'no-store'` with `next: { revalidate: 1800 }`
- Alternatively, use Next.js `unstable_cache` to wrap the entire shipping fetch function with a 30-minute TTL
- The Route Handler itself should keep `export const dynamic = 'force-dynamic'` (browser cache is bypassed), but the internal fetch to WooCommerce will be cached at the Next.js data cache layer

**Complexity:** Low

---

### TASK-015
**Fix `window.location.href` navigation in LiveSearch — use `router.push`**

- [ ] Task complete

**Why:** The search form's submit handler uses `window.location.href = /search?q=...` which triggers a full browser page reload, bypassing the `SiteLoader` progress bar and the Next.js client-side router. 🟢

**Files to modify:**
```
frontend/components/search/LiveSearch.tsx
```

**Expected changes:**
- Import `useRouter` from `next/navigation`
- Add: `const router = useRouter()`
- In `handleSubmit`, replace:
  ```tsx
  window.location.href = `/search?q=${encodeURIComponent(query)}`;
  ```
  With:
  ```tsx
  router.push(`/search?q=${encodeURIComponent(query)}`);
  setIsOpen(false);
  ```

**Complexity:** Low

---

### TASK-016
**Add `priority` to first hero slide image for LCP optimisation**

- [ ] Task complete

**Why:** The hero image is the Largest Contentful Paint element on every page that shows it. Without `priority`, the browser does not preload it, delaying LCP. 🟢

**Files to modify:**
```
frontend/components/HeroSlider.tsx
```

**Expected changes:**
- In the slide rendering loop, pass `priority={index === 0}` (or `index === 1` if using the extended clone array — check which real index corresponds to the first visible slide) to the `<Image>` component
- Only one image should receive `priority={true}` — the one that is visible above the fold on initial render
- All other slide images should have `loading="lazy"` or no priority flag

**Complexity:** Low

---

## Phase 3 — Refactor and Code Quality

> These tasks improve maintainability, eliminate duplication, and make the codebase easier to extend.

---

### TASK-017
**Centralise all GraphQL queries — remove duplicates from component files**

- [ ] Task complete

**Why:** `CONSUMER_SEARCH_QUERY` and `WHOLESALE_SEARCH_QUERY` are defined in both `lib/graphql/index.ts` and `LiveSearch.tsx`. `PRODUCTS_QUERY` is defined in both `lib/graphql/index.ts` and `ProductSlider.tsx`. Schema changes require editing multiple files. 🟡

**Files to modify:**
```
frontend/lib/graphql/index.ts
frontend/components/search/LiveSearch.tsx    (remove local definitions)
frontend/components/ProductSlider.tsx        (remove local definition — already done in TASK-006)
```

**Expected changes:**
- Verify `CONSUMER_SEARCH_QUERY`, `WHOLESALE_SEARCH_QUERY`, `GET_PRODUCTS_BY_TAG` are fully defined and exported from `lib/graphql/index.ts`
- In `LiveSearch.tsx`: remove the two local query string constants. Import `CONSUMER_SEARCH_QUERY`, `WHOLESALE_SEARCH_QUERY` from `lib/graphql` — but note: after TASK-008 the queries are used server-side in the proxy route anyway, so LiveSearch itself may no longer need them imported
- Confirm no other component files define their own query strings

**Complexity:** Low

---

### TASK-018
**Implement real attribute-driven filter options in CategoryPageClient**

- [ ] Task complete

**Why:** Category page filters (Brand, Material, Size, Type, Price) are hardcoded static arrays with no real filtering logic. Customers click filters and nothing changes. This is a broken UX feature. 🟡

**Files to modify:**
```
frontend/app/(site)/category/[slug]/CategoryPageClient.tsx
```

**Expected changes:**
- Remove `BRAND_OPTIONS`, `MATERIAL_OPTIONS`, `SIZE_OPTIONS`, `TYPE_OPTIONS` hardcoded arrays
- Derive filter options dynamically from the `products` prop:
  ```tsx
  const allAttributes = useMemo(() =>
    products.flatMap(p => p.attributes?.nodes ?? []), [products]);
  const sizeOptions = useMemo(() =>
    [...new Set(allAttributes.filter(a => a.name.toLowerCase().includes('weight') || a.name.toLowerCase().includes('size')).flatMap(a => a.options))],
    [allAttributes]);
  ```
- Add `useState` for selected filter values: `selectedBrand`, `selectedSize`, `selectedPrice`, etc.
- Wire `useMemo` filtered products:
  ```tsx
  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedSize) result = result.filter(p => /* attribute match */);
    if (selectedPrice) result = result.filter(p => parsePrice(p.price) within range);
    return result;
  }, [products, selectedSize, selectedPrice]);
  ```
- Keep `PRICE_OPTIONS` as-is (static price bands are fine)
- Ensure clear-all filter button resets all selections

**Complexity:** High

---

### TASK-019
**Split CategoryPageClient into focused sub-components**

- [ ] Task complete

**Why:** `CategoryPageClient.tsx` is 612 lines handling hero banner, filter panel, sort controls, product grid, and empty states — all in one file. Hard to read, test, and maintain. 🟢

**Files to modify / create:**
```
frontend/app/(site)/category/[slug]/CategoryPageClient.tsx
frontend/app/(site)/category/[slug]/CategoryHero.tsx       (new)
frontend/app/(site)/category/[slug]/CategoryFilters.tsx    (new)
frontend/app/(site)/category/[slug]/CategoryGrid.tsx       (new)
```

**Expected changes:**
- Extract the category hero banner section into `CategoryHero.tsx`: accepts `category`, `slug`, gradient config as props
- Extract the filter panel (sidebar + mobile portal) into `CategoryFilters.tsx`: accepts filter options + selected state + onChange callbacks
- Extract the product grid into `CategoryGrid.tsx`: accepts `filteredProducts`, `sortValue`, `loading` state
- `CategoryPageClient.tsx` becomes a thin orchestrator: manages shared filter/sort state and composes the three sub-components
- `CATEGORY_COPY` record stays in `CategoryPageClient.tsx` or moves to a `category-config.ts` constants file

**Complexity:** Medium

---

### TASK-020
**Add `CartableProduct` interface to CartProvider — remove `product: any`**

- [ ] Task complete

**Why:** `addToCart(product: any, ...)` in `CartProvider` provides zero TypeScript safety on the cart item shape. Cart corruption from incorrectly shaped objects cannot be caught at compile time. 🟢

**Files to modify:**
```
frontend/components/providers/CartProvider.tsx
```

**Expected changes:**
- Add a new exported interface:
  ```tsx
  export interface CartableProduct {
    databaseId: number;
    name: string;
    price: string;
    image?: { sourceUrl: string };
  }
  ```
- Replace `product: any` in `addToCart` signature with `product: CartableProduct`
- Update all call sites (`ProductCard.tsx`, `ProductDetailPageClient.tsx`, `WholesaleProductClient.tsx`) to ensure the object passed satisfies `CartableProduct`

**Complexity:** Low

---

### TASK-021
**Refactor `Footer.tsx` — extract into named sub-components**

- [ ] Task complete

**Why:** `Footer.tsx` is 630 lines of a single function returning static JSX. No logic, but very hard to navigate and update. 🟢

**Files to modify:**
```
frontend/components/layout/Footer.tsx
```

**Expected changes:**
- Within the same file (no new files required), extract named inner components:
  - `FooterBrand` — logo, tagline, social icons
  - `FooterNavColumn` — reusable for Shop / About / Support columns
  - `FooterLegal` — bottom bar with copyright, policy links, health warning
- Main `Footer` function assembles these components
- No logic changes — purely structural reorganisation
- Estimated result: each section ~80–100 lines, main function ~50 lines

**Complexity:** Low

---

### TASK-022
**Add `WPProduct` TypeScript type to `lib/graphql/index.ts` for product detail**

- [ ] Task complete

**Why:** `ProductDetailPageClient.tsx` defines its own local `WPProduct` type. `lib/graphql/index.ts` already has `WPProductNode` for category pages. The product detail type is a superset. Having both promotes divergence. 🟢

**Files to modify:**
```
frontend/lib/graphql/index.ts
frontend/app/(site)/product/[slug]/ProductDetailPageClient.tsx
```

**Expected changes:**
- In `lib/graphql/index.ts`, add or extend `WPProductNode` to include `stockStatus` and `variations.nodes[].id`
- In `ProductDetailPageClient.tsx`, remove the local `WPProduct` type definition
- Import the canonical type from `lib/graphql`

**Complexity:** Low

---

### TASK-023
**Resolve `useTheme()` dependency in `ProductCard` — enable memo to work correctly**

- [ ] Task complete

**Why:** After TASK-009 (React.memo) and TASK-012 (CSS variables), `ProductCard` should not subscribe to `ThemeContext` at all for colour tokens. Any remaining `useTheme()` call re-enables re-renders on theme toggle. 🟢

**Files to modify:**
```
frontend/components/ProductCard.tsx
```

**Expected changes:**
- After TASK-012 CSS variable migration, confirm that `useTheme()` is only called if the accent glow calculation still needs `dark` (it doesn't — glow uses `accentColor` prop)
- If `dark` is no longer needed, remove the entire `useTheme()` import and call from `ProductCard`
- This reduces `ProductCard` from 4 hook calls to 3 (`useCart`, `usePathname`, `useWholesaleSession`)
- Run type checking to confirm no residual `dark` references remain

**Complexity:** Low

---

### TASK-024
**Extract `computeHeroDims` and `computeDims` as pure utility functions**

- [ ] Task complete

**Why:** `computeHeroDims` in `HeroSlider.tsx` and `computeDims` in `ProductSlider.tsx` are pure functions with no side effects. Keeping them inside the component files makes unit testing impossible. 🟢

**Files to modify / create:**
```
frontend/lib/utils/slider-dims.ts    (new)
frontend/components/HeroSlider.tsx
frontend/components/ProductSlider.tsx
```

**Expected changes:**
- Create `lib/utils/slider-dims.ts`
- Move `computeHeroDims(vw)` from `HeroSlider.tsx` into this file and export it
- Move `computeDims(containerW, vw)` from `ProductSlider.tsx` into this file and export it
- In both components, import the functions: `import { computeHeroDims, computeDims } from '../../lib/utils/slider-dims'`
- No behaviour change — purely a file organisation move

**Complexity:** Low

---

## Phase 4 — Security and Cleanup

> Final polishing, security hardening, and environment hygiene.

---

### TASK-025
**Add rate limiting to authentication routes**

- [ ] Task complete

**Why:** `/api/auth/login`, `/api/auth/signup`, `/api/auth/forgot-password`, and `/api/auth/check-email` have no protection against brute-force or enumeration attacks. 🟡

**Files to modify / create:**
```
frontend/lib/rate-limit.ts              (new)
frontend/app/api/auth/login/route.ts
frontend/app/api/auth/signup/route.ts
frontend/app/api/auth/forgot-password/route.ts
frontend/app/api/auth/check-email/route.ts
```

**Expected changes — `lib/rate-limit.ts`:**
- Implement a sliding window in-memory counter using a module-level `Map<string, { count: number; resetAt: number }>`
- Export `checkRateLimit(ip: string, limit: number, windowMs: number): boolean`
- Extract caller IP from `request.headers.get('x-forwarded-for') ?? '127.0.0.1'`

**Expected changes in each route handler:**
- At the top of the `POST` handler, call `checkRateLimit(ip, limit, windowMs)`
- If limit exceeded, return `429 Too Many Requests` with `Retry-After` header

| Route | Limit | Window |
|---|---|---|
| `/api/auth/login` | 10 | 15 minutes |
| `/api/auth/signup` | 5 | 60 minutes |
| `/api/auth/forgot-password` | 5 | 60 minutes |
| `/api/auth/check-email` | 20 | 15 minutes |

**Complexity:** Medium

---

### TASK-026
**Add environment variable startup validation**

- [ ] Task complete

**Why:** If a critical env var (e.g. `JWT_SECRET`, `WHOLESALE_WEBHOOK_SECRET`, `RESEND_API_KEY`) is missing in a deployment, operations fail silently or with cryptic errors. A startup check surfaces issues immediately. 🟢

**Files to modify / create:**
```
frontend/lib/env-check.ts      (new)
frontend/app/layout.tsx
```

**Expected changes — `lib/env-check.ts`:**
- Define a list of required server-only env vars
- Export `validateEnv()` that checks each one:
  ```ts
  const REQUIRED = ['JWT_SECRET', 'WOOCOMMERCE_CONSUMER_KEY', 'WOOCOMMERCE_CONSUMER_SECRET',
    'WP_ADMIN_USERNAME', 'WP_ADMIN_APP_PASSWORD', 'NEXT_PUBLIC_APP_URL',
    'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET', 'RESEND_API_KEY', 'WHOLESALE_WEBHOOK_SECRET'];
  ```
- Log a `console.error` for each missing var
- In production (`NODE_ENV === 'production'`), throw an error that prevents startup if any required var is absent

**Expected changes in `app/layout.tsx`:**
- Call `validateEnv()` at the top of the file (server-side module execution, runs once per cold start)

**Complexity:** Low

---

### TASK-027
**Implement soft email verification enforcement**

- [ ] Task complete

**Why:** `emailVerified: false` users have identical access to `emailVerified: true` users. Email verification is issued but never checked. 🟢

**Files to modify:**
```
frontend/app/(site)/account/page.tsx   (or AccountClient component)
frontend/components/providers/AuthProvider.tsx
```

**Expected changes:**
- In `/api/auth/me`, include `emailVerified` in the response body (it's already in the JWT payload — just surface it)
- In `AuthProvider`, expose `emailVerified: boolean` alongside `role` and `userId`
- In the account page, if the user is logged in but `emailVerified === false`, show a dismissible banner:
  > "Please verify your email address. [Resend verification email]"
- The banner should link to a route that triggers `/api/auth/verify-email` resend
- Do not block access — this is soft enforcement

**Complexity:** Medium

---

### TASK-028
**Add Content Security Policy headers for Razorpay**

- [ ] Task complete

**Why:** Without explicit CSP headers, browsers may block Razorpay's CDN script. Conversely, without CSP, any injected script can run. A targeted CSP protects the checkout flow. 🟢

**Files to modify / create:**
```
frontend/next.config.mjs
```

**Expected changes:**
- Add `headers()` to `next.config.mjs`:
  ```js
  async headers() {
    return [{
      source: '/(.*)',
      headers: [{
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' https://checkout.razorpay.com",
          "frame-src https://api.razorpay.com https://checkout.razorpay.com",
          "img-src 'self' data: https://cms.thehookahstore.in",
          "connect-src 'self' https://api.razorpay.com https://cms.thehookahstore.in",
        ].join('; ')
      }]
    }];
  }
  ```
- Test that the Razorpay modal opens correctly after adding CSP
- Adjust `'unsafe-inline'` scope as needed (may be required for the blocking theme script)

**Complexity:** Medium

---

### TASK-029
**Remove development `console.log` statements from production paths**

- [ ] Task complete

**Why:** Several `console.log` and `console.warn` statements appear in production API routes (e.g. `lib/woocommerce/wholesale.ts`). These add noise to production logs and may leak implementation details. 🟢

**Files to audit and modify:**
```
frontend/lib/woocommerce/wholesale.ts
frontend/app/api/wholesale/approved/route.ts
frontend/app/api/wholesale/rejected/route.ts
frontend/app/api/auth/signup/route.ts
```

**Expected changes:**
- Run: `grep -rn "console.log" frontend/app/api frontend/lib --include="*.ts"` to find all instances
- Remove `console.log` statements that output routine operation data (not errors)
- Retain `console.error` for genuine error conditions
- Replace routine `console.log` with `console.info` where a server-side audit trail is genuinely needed
- Wrap debug logs in `if (process.env.NODE_ENV === 'development') { ... }` guards where useful

**Complexity:** Low

---

### TASK-030
**Align `export const revalidate` values — audit all page-level ISR settings**

- [ ] Task complete

**Why:** The deep analysis found that `app/(site)/page.tsx` exports `revalidate = 300` while the actual hero slides fetch uses `revalidate: 30`. Similar conflicts may exist elsewhere. 🟢

**Files to audit:**
```
frontend/app/(site)/page.tsx
frontend/app/(site)/category/[slug]/page.tsx
frontend/app/blog/page.tsx
frontend/app/blog/[slug]/page.tsx
frontend/app/wholesale/product/[slug]/page.tsx
```

**Expected changes:**
- For each page, compare the `export const revalidate = N` value against all `fetchGraphQL(..., N)` call values within the same page
- Align fetch-level revalidate to match or be less than the page-level value
- Recommended final values:
  - Homepage: page=300, fetches=300
  - Category: page=300, product fetch=300, meta fetch=3600
  - Blog list: page=600, posts fetch=600
  - Blog post: page=3600, content fetch=3600
  - Product detail (post TASK-002): page=300, product fetch=300

**Complexity:** Low

---

### TASK-031
**Add `loading="lazy"` audit — ensure no above-fold images are lazy-loaded**

- [ ] Task complete

**Why:** After enabling Next.js image optimisation (TASK-004), ensure that `loading="lazy"` is not applied to any image that appears above the fold. Lazy LCP images delay page rendering. 🟢

**Files to audit:**
```
frontend/components/HeroSlider.tsx
frontend/components/ProductCard.tsx
frontend/components/pages/HomePageContent.tsx
frontend/app/(site)/category/[slug]/CategoryPageClient.tsx
```

**Expected changes:**
- `HeroSlider.tsx` — first slide image: `priority` (done in TASK-004/016), no `loading="lazy"`; other slides: no `priority`, default lazy behaviour
- `ProductCard.tsx` — `loading="lazy"` is correct for all product card images (below fold in grids and carousels)
- `HomePageContent.tsx` — brand logo images (`alfakher.png`, `afzal.png`, etc.): these are small logos (~120px), `loading="lazy"` is fine; the large decorative backgrounds: consider removing or compressing
- `CategoryPageClient.tsx` — category hero banner image (if any): add `priority` if it is above the fold on desktop

**Complexity:** Low

---

## Summary Checklist

### Phase 1 — Critical (Complete first)
- [ ] TASK-001 — Enforce webhook secret (security)
- [ ] TASK-002 — Product pages: CSR → ISR (SEO + performance)
- [ ] TASK-003 — Remove hardcoded hero slides
- [ ] TASK-004 — Enable Next.js image optimisation
- [ ] TASK-005 — Add combined homepage brands GraphQL query
- [ ] TASK-006 — Move brand product fetches server-side
- [ ] TASK-007 — Fix hero slides revalidate conflict (30s → 300s)

### Phase 2 — Performance
- [ ] TASK-008 — Create `/api/search` proxy route
- [ ] TASK-009 — Add `React.memo` to ProductCard
- [ ] TASK-010 — Split CartProvider into actions + state contexts
- [ ] TASK-011 — Fix HeroSlider autoplay interval reset
- [ ] TASK-012 — CSS variables in ProductCard (remove `useTheme`)
- [ ] TASK-013 — CSS variables in HomePageContent (remove `useTheme`)
- [ ] TASK-014 — Cache shipping methods (30-min revalidate)
- [ ] TASK-015 — Fix `window.location.href` → `router.push` in search
- [ ] TASK-016 — Add `priority` to first hero slide image

### Phase 3 — Refactor
- [ ] TASK-017 — Centralise GraphQL queries in `lib/graphql/index.ts`
- [ ] TASK-018 — Implement real category filters from product attributes
- [ ] TASK-019 — Split CategoryPageClient into sub-components
- [ ] TASK-020 — Add `CartableProduct` interface (remove `any`)
- [ ] TASK-021 — Refactor Footer into named sub-components
- [ ] TASK-022 — Unify `WPProduct` type in `lib/graphql/index.ts`
- [ ] TASK-023 — Remove residual `useTheme` from ProductCard post-TASK-012
- [ ] TASK-024 — Extract slider dimension utils to `lib/utils/slider-dims.ts`

### Phase 4 — Security and Cleanup
- [ ] TASK-025 — Add rate limiting to auth routes
- [ ] TASK-026 — Add env var startup validation
- [ ] TASK-027 — Soft email verification enforcement
- [ ] TASK-028 — Add CSP headers for Razorpay
- [ ] TASK-029 — Remove dev `console.log` from production paths
- [ ] TASK-030 — Align ISR revalidate values across all pages
- [ ] TASK-031 — Audit `loading="lazy"` on above-fold images

---

**Total tasks: 31**  
**Phase 1: 7** | **Phase 2: 9** | **Phase 3: 8** | **Phase 4: 7**

> Each task is designed to be a single, reviewable commit. Complete tasks in order within each phase. Phases 3 and 4 can be worked in parallel once Phase 2 is complete.

---

*End of IMPLEMENTATION_TASK_LIST.md*  
*March 2026 — No code was modified in generating this document*
