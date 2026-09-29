# PROJECT_OPTIMIZATION_PLAN.md
# The Hookah Store — Architecture Improvement Plan

> **Type:** Planning document — no code is modified here  
> **Based on:** PROJECT_ARCHITECTURE.md + PROJECT_DEEP_ANALYSIS.md  
> **Date:** March 2026  
> **Author:** Senior Full-Stack Architecture Review

---

## Table of Contents

1. [Critical Architecture Fixes](#1-critical-architecture-fixes)
2. [Data Fetching Strategy](#2-data-fetching-strategy)
3. [GraphQL Request Architecture](#3-graphql-request-architecture)
4. [Image Optimization Plan](#4-image-optimization-plan)
5. [Performance Improvements](#5-performance-improvements)
6. [Caching Strategy](#6-caching-strategy)
7. [Security Improvements](#7-security-improvements)
8. [Code Refactor Plan](#8-code-refactor-plan)
9. [Implementation Phases](#9-implementation-phases)
10. [Expected Performance Gains](#10-expected-performance-gains)

---

## 1. Critical Architecture Fixes

These are the highest-priority issues — each directly impacts SEO, performance, security, or correctness.

---

### 1.1 — Product Detail Pages Are Fully CSR

**Current state:** `app/(site)/product/[slug]/page.tsx` uses `export const runtime = 'edge'` and renders an empty HTML shell. All product data is fetched inside a `useEffect` in `ProductDetailPageClient`. The user sees a loading spinner instead of content.

**Why it's critical:**
- **SEO** — Google sees empty HTML for all `/product/*` pages. Product names, descriptions, and prices are invisible to crawlers unless they execute JavaScript (which may be delayed by days in Google's crawl budget).
- **Performance** — Every visit fetches GraphQL from the browser. No caching, no ISR. High-traffic product URLs hit WPGraphQL on every request.
- **User experience** — Customers see a spinner before any product information appears.

**Fix:** Convert `ProductDetailPageClient` to a server component that fetches data via `fetchGraphQL` with ISR revalidation. Only the interactive parts (add-to-cart button, variation selector) remain client components.

---

### 1.2 — Homepage Fires 5 Uncached Browser-Side GraphQL Calls

**Current state:** Each `ProductSlider` on the homepage (`Alfakher`, `Afzal`, `Royal Smoking`, `Oduman`, `Mya`) fetches `cms.thehookahstore.in/graphql` directly from the browser inside `useEffect`. These calls are:
- Not cached (browser fetch has no `next: { revalidate }`)
- Not deduplicated
- Not batched

**Why it's critical:**
- **Performance** — On every homepage visit by every user, 5 independent GraphQL requests go to WordPress. Under moderate traffic, this creates significant load on WordPress/WPGraphQL.
- **Page weight/speed** — Users on slow connections wait for 5 sequential/parallel fetches after the initial paint.
- **Server load** — The WordPress server handles browser-originating queries for every visitor vs. the Next.js server handling them once per ISR cycle.

**Fix:** Move brand product queries server-side. Fetch all 5 brands in one batched GraphQL query at server time. Pass results as props to `HomePageContent`.

---

### 1.3 — Image Optimization Globally Disabled

**Current state:** `next.config.mjs` sets `unoptimized: true`. All `<Image>` components serve images at their original uploaded resolution directly from `cms.thehookahstore.in`. No WebP conversion, no resizing, no srcset.

**Why it's critical:**
- **Performance / LCP** — Hero images may be 2–5MB served to mobile users expecting a 300px-wide slot. LCP (Largest Contentful Paint) is heavily impacted.
- **Data cost** — Indian users on mobile data pay for oversized images.
- **Core Web Vitals** — Unoptimised images directly harm Google PageSpeed score and CWV (LCP, CLS).

**Fix:** Remove `unoptimized: true`. Configure `remotePatterns` for `cms.thehookahstore.in`. Add `sizes` props to `<Image>` components. Mark hero images with `priority`.

---

### 1.4 — Duplicated GraphQL Query Strings

**Current state:** Three query strings are defined twice in the codebase:
- `CONSUMER_SEARCH_QUERY` — `lib/graphql/index.ts` + `LiveSearch.tsx`
- `WHOLESALE_SEARCH_QUERY` — `lib/graphql/index.ts` + `LiveSearch.tsx`
- `PRODUCTS_QUERY` — `lib/graphql/index.ts` (as `GET_PRODUCTS_BY_TAG`) + `ProductSlider.tsx`

**Why it's critical:**
- **Maintainability** — A WPGraphQL schema change requires updates in multiple places. Divergent queries will silently return different shapes.
- **Reliability** — The component-local queries may fall behind the canonical versions in `lib/graphql`.

**Fix:** Remove all component-local query definitions. Import from `lib/graphql/index.ts` exclusively.

---

### 1.5 — Category Filter UI Is Non-Functional

**Current state:** `CategoryPageClient.tsx` renders filter panels for Brand, Material, Price, Size, and Type. The filter options (`BRAND_OPTIONS`, `MATERIAL_OPTIONS`, etc.) are hardcoded static arrays. The filter logic does not map to real product attributes from WooCommerce.

**Why it's critical:**
- **User trust** — Customers click filters and see no change. This is a broken UI experience that signals poor quality.
- **Conversion** — Inability to filter products causes frustration and abandonment, especially on large categories.

**Fix:** Replace hardcoded filter arrays with values derived from the products already fetched. Filter logic should be implemented via `useMemo` against the actual product `attributes` and `price` fields.

---

### 1.6 — Webhook Endpoints Have No Mandatory Authentication

**Current state:** `/api/wholesale/approved` and `/api/wholesale/rejected` check `WHOLESALE_WEBHOOK_SECRET` only if the env var is set. If it is missing, the endpoints allow any POST request to trigger wholesale approval/rejection emails.

**Why it's critical:**
- **Security** — An attacker discovering these endpoints could spam approval emails or flood Resend's sending quota.
- **Data integrity** — Fake approval emails breach user trust.

**Fix:** Make the secret check unconditional. Return `500 Internal Server Error` (not `200`) if `WHOLESALE_WEBHOOK_SECRET` is not configured. Log a startup warning and block the request.

---

### 1.7 — Hero Slider Shows 3 Hardcoded Placeholder Slides

**Current state:** `HeroSlider.tsx` always prepends 3 hardcoded slides (all using `/hero-vanilla.webp`) before ACF-driven slides. Customers always see 3 duplicated-image placeholders before real content.

**Why it's critical:**
- **Brand quality** — Placeholder content in production is unprofessional and confusing.
- **CMS investment** — ACF slides are configured in WordPress but customers rarely see them because they appear after slot 3.

**Fix:** Remove the 3 hardcoded slides. The slider should render only ACF slides. If ACF returns empty, fall back to a single default slide.

---

## 2. Data Fetching Strategy

The correct fetching method for each page type, based on content volatility and traffic patterns:

| Page | Correct Method | Revalidation | Reason |
|---|---|---|---|
| **Homepage** | ISR | 300s (5 min) | High traffic, content changes rarely. Server fetches once per cycle. |
| **Category page** | ISR | 300s products, 3600s meta | Product list changes daily, not hourly. Category name/description rarely changes. |
| **Product detail** | ISR | 300s | Products update occasionally. Server-side fetch means full HTML for SEO and no client spinner. |
| **Blog list** | ISR | 600s | Blog posts publish a few times per week. |
| **Blog post** | ISR | 3600s | Individual posts rarely update after publication. |
| **Search** | CSR (debounced) | None (live) | Search must be real-time and query-variable. Cannot be ISR. Build a Next.js API proxy instead of direct browser calls. |
| **Wholesale product detail** | ISR | 300s | Same as retail — full HTML avoids client spinner for logged-in users. |
| **Account/dashboard** | CSR | None | Auth-gated, user-specific data. Must be client-rendered after auth check. |
| **Cart / Checkout** | CSR | None | Session-specific state, localStorage-driven. |

### Key Principle

> **Server fetches are ISR. Browser fetches are for user-specific, session-specific, or truly real-time data only.**

The current project incorrectly uses CSR for product data (product detail, product sliders) that is not user-specific. Moving these to server-side ISR reduces WordPress load and eliminates client-side spinners.

---

## 3. GraphQL Request Architecture

### Current Pattern (Broken)

```
Browser → WordPress GraphQL (direct, no cache)
```

Used in: `ProductSlider`, `ProductDetailPageClient`, `LiveSearch`

### Correct Pattern

```
Browser → Next.js (ISR cache) → WordPress GraphQL
                 ↑
          Returns cached HTML props
          (no browser-to-WordPress connection)
```

For real-time queries (search): a Next.js API proxy prevents direct browser→WordPress exposure:

```
Browser → GET/POST /api/search?q=mint
             → Next.js Route Handler
             → POST cms.thehookahstore.in/graphql
             → Returns filtered results
```

### Fix: ProductSlider

- Remove `fetchProducts()` from `useEffect` inside the component
- Move the products query server-side (in the parent page server component)
- Pass products as props: `<ProductSlider products={alFakherProducts} />`
- All 5 brand sliders fetched in one server-side call using GraphQL aliases or a combined query

### Fix: ProductDetailPageClient

- Remove the entire `useEffect` + `fetch` block
- Rename to `ProductDetailView` (pure presentation component, no data fetching)
- Page server component (`page.tsx`) calls `fetchGraphQL(PRODUCT_QUERY, { slug }, 300)`
- Passes product data as props: `<ProductDetailView product={product} />`
- Only the add-to-cart button and variation selector need `'use client'`

### Fix: LiveSearch

- Keep the debounced input in `LiveSearch` as client-side (correct — query is user-driven)
- Replace the direct `fetch(NEXT_PUBLIC_GRAPHQL_URL, ...)` call with `fetch('/api/search?q=...&mode=consumer')`
- Create `app/api/search/route.ts` as a Next.js proxy to WordPress GraphQL
- Import query strings from `lib/graphql/index.ts` (not duplicated locally)
- This hides the WordPress origin from the browser

---

## 4. Image Optimization Plan

### Step 1 — Remove `unoptimized: true`

```js
// next.config.mjs
images: {
  // Remove: unoptimized: true
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cms.thehookahstore.in',
      pathname: '/wp-content/uploads/**',
    },
  ],
},
```

### Step 2 — Priority Images (LCP)

Mark the first visible hero slide image with `priority` so the browser preloads it:

```tsx
<Image
  src={heroImageUrl}
  alt={slide.title}
  fill
  priority   // ← Add this on slide index 0
  sizes="(max-width: 639px) 100vw, (max-width: 1024px) calc(100vw - 140px), 1440px"
/>
```

All below-the-fold images retain `loading="lazy"` (already set on ProductCard — keep this).

### Step 3 — Responsive `sizes` Props

| Component | Correct `sizes` value |
|---|---|
| Hero slide (desktop) | `(max-width: 639px) 100vw, (max-width: 1024px) calc(100vw - 140px), 1440px` |
| Hero slide (mobile) | `100vw` |
| ProductCard image | `168px` (already set — keep) |
| Category page image | `(max-width: 640px) 168px, 295px` |
| Blog post thumbnail | `(max-width: 640px) 85vw, 413px` |
| Brand logo (decorative bg) | Consider removing heavy decorative BGs or replacing with CSS gradients |

### Step 4 — Decorative Background Images

The homepage brand section backgrounds (`alfakher_bg_left.png` at 912px, `afzal_bg_right.png` at 1154px) are displayed at 20% opacity as pure decoration. Options:
- Replace with CSS `radial-gradient` or `linear-gradient` approximations (zero byte cost)
- Or compress them heavily (80%+ quality reduction acceptable at 20% opacity) and serve via Next.js Image optimisation

---

## 5. Performance Improvements

### 5.1 — Memoize ProductCard

`ProductCard` re-renders whenever `cart`, `theme`, or `auth` context changes — across all 60 cards on a category page simultaneously.

**Plan:** Wrap `ProductCard` in `React.memo`. Use a stable `key` based only on `productId + variationId`. Extract the `isWholesale` boolean outside the card (pass as prop from parent) to reduce hook count from 4 to 2 per card.

### 5.2 — Split Cart Context

`CartProvider` exposes `{ cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartCount, getCartTotal }` in a single context. Any cart mutation causes ALL consumers to re-render — including the 60 ProductCards if they read `cart` directly.

**Plan:** Split into two contexts:
- `CartActionsContext` — `{ addToCart, removeFromCart, updateQuantity, clearCart }` — stable, never changes
- `CartStateContext` — `{ cart, count, total }` — updates on mutation

ProductCards only need `CartActionsContext`. The header cart count reads `CartStateContext`. This eliminates cascading re-renders on cart mutation.

### 5.3 — HeroSlider Autoplay Fix

The autoplay `setInterval` re-creates on every transition because `isTransitioning` is in the dependency array.

**Plan:** Move `isTransitioning` to a `useRef` instead of `useState`. The ref does not trigger effect re-subscriptions. The visual transition is still controlled by CSS `transition` applied to the track transform.

### 5.4 — Replace JS Inline Colour Tokens with CSS Variables

Every component that reads `const { dark } = useTheme()` and computes inline colours forces a re-render when the theme toggles. The root layout already defines CSS custom properties (`--clr-bg`, `--clr-text`, `--clr-border`, etc.) via the blocking inline script.

**Plan:** Replace JS-computed inline styles with CSS variables:
```css
/* Before (JS) */
style={{ color: dark ? '#ffffff' : '#101114' }}

/* After (CSS var) */
style={{ color: 'var(--clr-text)' }}
```
This removes the need for `useTheme()` in most components, reducing context subscriptions and re-renders.

### 5.5 — Reduce Footer Size

`Footer.tsx` is 630 lines of static HTML rendered on every page. It can be safely split into named sub-components (each ~60–80 lines) within the same file, improving readability without changing bundle size.

### 5.6 — Fix `window.location.href` in Search

`LiveSearch.tsx` uses `window.location.href = /search?q=...` on form submit, causing a full page reload and bypassing the SiteLoader transition. Replace with `router.push()` from `useRouter`.

### 5.7 — Batch Homepage Brand Queries

Replace 5 separate `ProductSlider` GraphQL queries with a single named aliases query:

```graphql
query GetHomepageBrands {
  alfakher: products(where: { tagIn: ["Alfakher"], first: 5 }) { nodes { ... } }
  afzal:    products(where: { tagIn: ["Afzal"],    first: 5 }) { nodes { ... } }
  royal:    products(where: { tagIn: ["Royal Smokin"], first: 5 }) { nodes { ... } }
  oduman:   products(where: { tagIn: ["Oduman Blend"], first: 5 }) { nodes { ... } }
  mya:      products(where: { tagIn: ["Mya"],       first: 5 }) { nodes { ... } }
}
```
One server request replaces 5 browser requests. Cached at 300s ISR.

---

## 6. Caching Strategy

### Recommended TTL Values

| Data | Strategy | TTL | Notes |
|---|---|---|---|
| Homepage hero slides | ISR fetch | **300s** | Fix current 30s/300s conflict — align to 300s |
| Homepage brand products (all 5) | ISR fetch | **300s** | Server-side batched query |
| Category meta (name, description) | ISR fetch | **3600s** | Rarely changes |
| Category products | ISR fetch | **300s** | Acceptable staleness for pricing/stock |
| Product detail | ISR fetch | **300s** | Most important fix — currently 0 (CSR) |
| Blog post list | ISR fetch | **600s** | Posts publish occasionally |
| Blog single post | ISR fetch | **3600s** | Stable after publication |
| Search results | No cache | **0** | Query-variable, must be real-time |
| Shipping methods | Route Handler cache | **1800s (30 min)** | Zones change at most weekly; current `no-store` is wasteful |
| Wholesale product detail | ISR fetch | **300s** | Same as retail |
| Auth state (authenticated user) | `sessionStorage` | **300s** | Already implemented |
| Auth state (guest) | Not cached | **0** | Already correct |

### Shipping Methods Caching

Currently `/api/shipping/methods` fires N+1 WooCommerce REST calls with `cache: 'no-store'` on every checkout. Shipping zones change at most weekly.

**Plan:** Add `next: { revalidate: 1800 }` to the shipping zone and methods fetches inside the Route Handler. This caches at the Next.js data cache layer, not the browser. The browser still gets fresh data but the server only reaches WooCommerce every 30 minutes.

---

## 7. Security Improvements

### 7.1 — Mandatory Webhook Secret

Make `WHOLESALE_WEBHOOK_SECRET` required, not optional:

```
If WHOLESALE_WEBHOOK_SECRET is not set:
  → Log error at startup
  → Return 500 on any webhook call
  → Do NOT send any email
```

Also: add a secondary check that the `userId` in the payload matches the email — this prevents an attacker who knows the secret from approving arbitrary emails.

### 7.2 — Rate Limiting on Auth Routes

Add rate limiting to the following routes using an in-memory or Redis-backed store:

| Route | Limit | Window |
|---|---|---|
| `POST /api/auth/login` | 10 attempts | per IP per 15 minutes |
| `POST /api/auth/signup` | 5 attempts | per IP per hour |
| `POST /api/auth/forgot-password` | 5 attempts | per IP per hour |
| `POST /api/auth/check-email` | 20 attempts | per IP per 15 minutes |

**Implementation options:**
- Vercel: Use `@vercel/kv` (Redis) with a sliding window counter
- Self-hosted: Use `node-cache` for in-memory rate limiting (resets on restart — acceptable for this threat model)
- Immediate low-effort option: Check the `X-Forwarded-For` header and reject after N failures in a fixed window stored in a module-level `Map` (cleared on cold start)

### 7.3 — Enforce Email Verification

The `emailVerified: false` field is set in the JWT but never checked. Options:
1. **Soft enforcement** — Gate specific features (e.g. leave reviews) behind `emailVerified: true` without blocking basic shopping
2. **Hard enforcement** — Block login entirely until email is verified (send a new verification email if expired)

Recommendation: soft enforcement first. Add a visible banner on the account page prompting unverified users to verify.

### 7.4 — GraphQL Security Hardening (WordPress Side)

This requires WordPress configuration, not Next.js changes:

- Enable WPGraphQL query depth limiting (WPGraphQL has a `graphql_config` filter)
- Disable GraphQL introspection in production (prevents schema enumeration)
- Consider IP allowlisting WPGraphQL to accept requests only from the Next.js server IP and Cloudflare ranges

### 7.5 — CSP Header for Razorpay

Ensure the Razorpay JS CDN domain is explicitly allowed in the Content Security Policy:
```
script-src: 'self' https://checkout.razorpay.com
frame-src:  https://api.razorpay.com
```
This prevents CSP violations from breaking the payment modal while restricting other script origins.

---

## 8. Code Refactor Plan

### 8.1 — `ProductDetailPageClient.tsx`

**Why:** Currently fetches data in `useEffect` — must become a presentation component only.

**Target state:**
- Rename to `ProductDetailView.tsx`
- Remove: `useState` for product data, `useEffect` with fetch, loading/notFound states
- Keep: interactive UI only — variation selector, quantity stepper, add-to-cart button, review section
- Mark `'use client'` only on the interactive sub-components

---

### 8.2 — `ProductSlider.tsx`

**Why:** Contains its own GraphQL query string and client-side fetch — duplicates lib/ and bypasses caching.

**Target state:**
- Remove: `PRODUCTS_QUERY`, `fetchProducts()`, `useEffect` fetch
- Add: `products: Product[]` prop (data provided by server parent)
- Keep: all the carousel layout logic (ResizeObserver, index management, touch handling, arrow rendering)
- This becomes a pure presentational carousel

---

### 8.3 — `CategoryPageClient.tsx`

**Why:** 612 lines combining layout, filter UI, sort logic, product grid, empty states, and portal rendering.

**Target state:** Split into three files:
- `CategoryHero.tsx` — category banner + gradient background
- `CategoryFilters.tsx` — filter panel UI + real attribute-driven filter state
- `CategoryGrid.tsx` — product grid with applied filters and sort

The actual filter logic should be implemented against real product data — derive filter options from `products.flatMap(p => p.attributes.nodes)` instead of hardcoded arrays.

---

### 8.4 — `Footer.tsx`

**Why:** 630 lines of a single function returning static HTML. Not buggy but hard to read and maintain.

**Target state:**
- Split into: `FooterBrand.tsx`, `FooterNav.tsx`, `FooterLegal.tsx`
- OR: extract named inner components within the same file with clear section comments
- No data fetching, no logic — purely structural split

---

### 8.5 — `HeroSlider.tsx`

**Why:** Hardcoded slides dilute CMS content. Autoplay effect has wrong dependency causing interval reset.

**Target state:**
- Remove the 3 hardcoded slides — render only ACF slides
- Move `isTransitioning` to a `useRef` to fix autoplay interval reset
- Add `priority` to the first slide image for LCP
- Extract `computeHeroDims` and `extendSlides` as pure utility functions outside the component

---

### 8.6 — `lib/graphql/index.ts` — Deduplication

**Why:** The library defines canonical query strings but they are bypassed by component-local duplicates.

**Target state:**
- Remove local `PRODUCTS_QUERY` from `ProductSlider.tsx` — use `GET_PRODUCTS_BY_TAG` from lib
- Remove local search queries from `LiveSearch.tsx` — import from lib
- Ensure every GraphQL query in the project is defined exactly once in `lib/graphql/index.ts`

---

## 9. Implementation Phases

### Phase 1 — Critical Architecture Fixes *(Highest Priority)*

> Goal: Fix broken SEO, open security holes, and the two most impactful performance problems.

| # | Task | Files Affected | Priority |
|---|---|---|---|
| 1.1 | Enforce `WHOLESALE_WEBHOOK_SECRET` (security) | `api/wholesale/approved/route.ts`, `api/wholesale/rejected/route.ts` | 🔴 Critical |
| 1.2 | Convert product detail page to ISR server component | `product/[slug]/page.tsx`, `ProductDetailPageClient.tsx` | 🔴 Critical |
| 1.3 | Remove 3 hardcoded hero slides, render ACF only | `HeroSlider.tsx` | 🔴 Critical |
| 1.4 | Enable Next.js image optimisation (remove `unoptimized: true`) | `next.config.mjs`, `HeroSlider.tsx` | 🔴 Critical |
| 1.5 | Move homepage brand product fetches to server + batch query | `page.tsx`, `HomePageContent.tsx`, `ProductSlider.tsx` | 🔴 Critical |

---

### Phase 2 — Performance Improvements

> Goal: Reduce client-side fetch volume, improve Web Vitals, fix re-render patterns.

| # | Task | Files Affected |
|---|---|---|
| 2.1 | Add `/api/search` proxy route; remove direct GraphQL from `LiveSearch` | `LiveSearch.tsx`, new `api/search/route.ts` |
| 2.2 | Add `React.memo` to `ProductCard` | `ProductCard.tsx` |
| 2.3 | Split `CartProvider` into actions + state contexts | `CartProvider.tsx` |
| 2.4 | Fix HeroSlider autoplay dependency (`useRef` for `isTransitioning`) | `HeroSlider.tsx` |
| 2.5 | Replace JS inline colour tokens with CSS custom properties | `ProductCard.tsx`, `HomePageContent.tsx`, `ProductDetailPageClient.tsx` |
| 2.6 | Cache shipping methods (30-min revalidate) | `api/shipping/methods/route.ts` |
| 2.7 | Fix hero slide ISR conflict (align to 300s) | `app/(site)/page.tsx` |
| 2.8 | Replace `window.location.href` in search with `router.push` | `LiveSearch.tsx` |

---

### Phase 3 — Refactor and Code Quality

> Goal: Eliminate duplication, improve maintainability, make queries single-source-of-truth.

| # | Task | Files Affected |
|---|---|---|
| 3.1 | Centralise all GraphQL queries in `lib/graphql/index.ts` | `ProductSlider.tsx`, `LiveSearch.tsx`, `ProductDetailPageClient.tsx` |
| 3.2 | Split `CategoryPageClient` into Hero + Filters + Grid | `CategoryPageClient.tsx` |
| 3.3 | Implement real attribute-driven category filters | `CategoryPageClient.tsx` |
| 3.4 | Split `Footer.tsx` into sub-components | `Footer.tsx` |
| 3.5 | Add `CartableProduct` interface to replace `product: any` | `CartProvider.tsx` |
| 3.6 | Add `priority` to first hero slide image | `HeroSlider.tsx` |

---

### Phase 4 — Security and Cleanup

> Goal: Harden auth, add rate limiting, enforce email verification, clean up dead code.

| # | Task | Files Affected |
|---|---|---|
| 4.1 | Add rate limiting to auth routes | `api/auth/login`, `api/auth/signup`, `api/auth/forgot-password` |
| 4.2 | Implement soft email verification enforcement | `app/(site)/account/`, `AuthProvider.tsx` |
| 4.3 | Add CSP headers for Razorpay | `next.config.mjs` or `middleware.ts` |
| 4.4 | Remove `console.log` statements from production paths | `lib/woocommerce/wholesale.ts`, API routes |
| 4.5 | Align `export const revalidate` page-level + fetch-level values | `app/(site)/page.tsx` |
| 4.6 | Add startup env var validation (log warning if critical vars missing) | New `lib/env-check.ts` |

---

## 10. Expected Performance Gains

The following estimates are based on the identified issues and are projections based on typical Next.js optimisation patterns. Actual results depend on server hardware, network conditions, and WordPress performance.

### Time to First Byte (TTFB)

| Page | Before | After | Reason |
|---|---|---|---|
| Homepage | ~200–400ms (ISR hit) | ~200–400ms | No change — already ISR |
| Category page | ~200–400ms (ISR hit) | ~200–400ms | No change — already ISR |
| Product detail | ~80ms (empty shell) + client fetch | ~200–400ms (ISR hit, full HTML) | Slower TTFB but full content delivered |

Product detail TTFB increases slightly (empty edge response is very fast) but total time to meaningful content decreases dramatically because the client no longer waits for a second round trip.

### Largest Contentful Paint (LCP)

| Scenario | Before | After | Improvement |
|---|---|---|---|
| Homepage hero (mobile) | 3–8s (full-res unoptimised image) | 1–2s (WebP, responsive, priority) | **~60–75% faster** |
| Product detail | 2–5s (client fetch + render) | 0.8–1.5s (ISR HTML + lazy image) | **~60% faster** |
| Category page | 0.8–1.5s | 0.8–1.5s | Minimal change |

### Homepage GraphQL Load on WordPress

| Before | After | Improvement |
|---|---|---|
| 5 browser GraphQL calls × every visitor | 1 batched server call per 300s ISR cycle | **~95% reduction in WPGraphQL traffic** for brand products |

For a site with 1,000 daily visitors, this reduces brand product queries from ~5,000 per day to fewer than 100 per day (one per 5-minute ISR cycle per server instance).

### Search Latency

| Before | After |
|---|---|
| Browser → WordPress directly | Browser → Next.js API → WordPress |
| Variable, no auth control | Controlled proxy, cacheable per query |

The added hop (Next.js proxy) adds ~10–20ms but gives the ability to add in-memory caching for repeated searches, more than compensating.

### SEO Impact

| Before | After | Improvement |
|---|---|---|
| Product pages: empty HTML for crawlers | Product pages: full HTML with name, price, description | Google can index product pages immediately without JS rendering |
| Product LCP > 3s | Product LCP < 2s | Positive CWV signal for ranking |
| Hero images: full-res PNG/JPG | Hero images: WebP, appropriately sized | Faster mobile page load, positive PageSpeed score |

**Estimated PageSpeed score improvement:** From ~35–55 (current typical for unoptimised images + CSR) to ~70–85 after Phase 1–2 completion.

### Server Load Reduction

| Resource | Before | After |
|---|---|---|
| WPGraphQL (brand products) | Per-visitor | Per ISR cycle (300s) |
| WC REST API (shipping) | Per checkout | Per 30-minute cache window |
| WPGraphQL (product detail) | Per visitor | Per ISR cycle (300s) |

Total estimated reduction in outbound requests from Next.js to WordPress/WooCommerce: **70–85%** under typical traffic, replacing per-visitor server hits with per-cycle ISR updates.

---

*End of PROJECT_OPTIMIZATION_PLAN.md*  
*This document defines the plan only. Implementation begins in Phase 1 as approved.*
