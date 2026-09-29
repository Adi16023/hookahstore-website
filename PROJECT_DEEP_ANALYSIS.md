# PROJECT_DEEP_ANALYSIS.md
# The Hookah Store — Full Technical Deep Analysis

> **Type:** Read-only analysis — no code was modified  
> **Based on:** Source code review + PROJECT_ARCHITECTURE.md  
> **Date:** March 2026

---

## Table of Contents
1. [Architecture Reality Check](#1-architecture-reality-check)
2. [Full System Map](#2-full-system-map)
3. [Component Architecture](#3-component-architecture)
4. [API Call Analysis](#4-api-call-analysis)
5. [Performance Analysis](#5-performance-analysis)
6. [Rendering Model](#6-rendering-model)
7. [Caching Strategy](#7-caching-strategy)
8. [Authentication Flow Analysis](#8-authentication-flow-analysis)
9. [Cart System Analysis](#9-cart-system-analysis)
10. [Image Loading](#10-image-loading)
11. [WordPress Integration](#11-wordpress-integration)
12. [Code Quality](#12-code-quality)
13. [Security Review](#13-security-review)
14. [Bundle Analysis](#14-bundle-analysis)
15. [Final Observations](#15-final-observations)

---

## 1. Architecture Reality Check

### Documentation vs. Reality

The `PROJECT_ARCHITECTURE.md` is largely accurate but several real implementation details differ from what is documented.

#### ✅ Matched — Documentation is Accurate

- `AuthProvider` makes exactly one `/api/auth/me` call per JS session (module-level singleton confirmed in code)
- Cart is fully localStorage-based — no server-side cart
- WC REST API is used for orders, shipping, and customer meta
- WP REST API `/wp/v2/users/{id}` is used for role assignment (documented reason is correct)
- `jose` is used for all JWT operations
- Resend is lazy-instantiated (confirmed in `resend-client.ts`)
- Wholesale roles registered by the plugin on every `init` (idempotent)

#### ❌ Mismatches Found

**1. Product detail page is fully client-side (no ISR)**  
Documentation implies ISR-like server rendering for product pages. Reality: `app/(site)/product/[slug]/page.tsx` uses `export const runtime = 'edge'` and immediately delegates to `ProductDetailPageClient`, which fetches data client-side via `useEffect`. There is **no ISR, no SSR, and no server-side data fetch** for product detail pages. The page is an empty shell until the client fetches.

**2. ProductSlider fetches from GraphQL directly in the browser (client-side)**  
Documentation says "GraphQL queries are server-side via `fetchGraphQL`". In reality, `ProductSlider.tsx` contains its own `PRODUCTS_QUERY` string and calls `fetch(NEXT_PUBLIC_GRAPHQL_URL, ...)` inside `useEffect` — a **client-side GraphQL fetch with zero caching**. This exposes the GraphQL endpoint directly to the browser and bypasses the ISR caching layer entirely.

**3. LiveSearch also fetches GraphQL directly client-side**  
`LiveSearch.tsx` fetches `https://cms.thehookahstore.in/graphql` directly from the browser, duplicating the query strings already in `lib/graphql/index.ts`. Both `CONSUMER_SEARCH_QUERY` and `WHOLESALE_SEARCH_QUERY` are defined twice — once in `lib/graphql/index.ts` and again inside the component file.

**4. Homepage hero slides are fetched with `revalidate: 30` at runtime despite `revalidate: 300` at page level**  
`app/(site)/page.tsx` exports `export const revalidate = 300` at module level, but the actual `fetchGraphQLSafe(GET_HOME_HERO_SLIDES, {}, 30)` call uses `revalidate: 30`. The page-level constant and the per-call constant conflict. The per-call value takes precedence in Next.js fetch deduplication, meaning the hero data refreshes every 30 seconds not 300.

**5. Blog section on homepage uses placeholder/static content**  
The homepage blog section renders 3 hardcoded cards with the same image (`/homepage/blogbox.png`) and the same text "How to Hookah?". No actual blog posts are fetched. The "Blog" section in `HomePageContent.tsx` is a visual placeholder, not a real data-driven section.

**6. `ThemeProvider` exported function is `toggleDark` not `toggleTheme`**  
Documentation states: `{ dark, toggleTheme }`. Actual exported interface: `{ dark, toggleDark }`. Components consuming `useTheme()` use `toggleDark`, not `toggleTheme`.

**7. Category page filter options are hardcoded, not data-driven**  
`CategoryPageClient.tsx` defines static filter arrays: `BRAND_OPTIONS`, `MATERIAL_OPTIONS`, `PRICE_OPTIONS`, `SIZE_OPTIONS`, `TYPE_OPTIONS`. These filter options are not drawn from the actual products — they are decorative UI placeholders. Filtering by "Brand: Al Fakher" from the filter panel doesn't actually reduce results to only Al Fakher products unless the product names/attributes match.

**8. 3 hardcoded hero slides always show regardless of ACF content**  
The `HeroSlider` component has 3 hardcoded slides in `hardcodedSlides[]` that all use the same image (`/hero-vanilla.webp`). ACF slides are appended AFTER these. So even with good CMS content, customers always see 3 placeholder slides first.

#### 🔍 Undocumented Features Found in Code

- **`AgeGate` + `AgeVerification`**: Two separate components for age gating. The `AgeGate` is a server-aware wrapper; `AgeVerification` is the full UI. The docs mention "age verification gate" but don't document the two-component architecture.
- **`HeroSliderWrapper`**: A thin wrapper component exists but its purpose relative to `HeroSlider` is unclear from documentation.
- **`MobileMenu` has full About + Support nav sections** matching footer links — this is a non-trivial navigation structure not documented.
- **`livesearch` uses `AbortController`** to cancel in-flight requests on new keystrokes — a solid implementation detail not mentioned in docs.
- **`SiteLoader` attaches to `document` click events** (capture phase) rather than wrapping `<Link>` components — a global approach that catches all anchor clicks.
- **`CartProvider` always writes to localStorage on every cart state change** — even minor quantity updates cause a serialisation + write cycle.
- **`ProductCard` reads `usePathname()` and `useWholesaleSession()`** to detect if it's on a wholesale route — the card itself adapts its UI for wholesale context.
- **`CATEGORY_COPY` in `CategoryPageClient`**: A large hardcoded record mapping category slugs to gradient colours and description text. This is static content that could be CMS-driven.

---

## 2. Full System Map

### A. Homepage Load

```
Browser GET /
  → Next.js checks ISR cache (revalidate: 300s)
  → Cache miss or stale:
      Server: fetchGraphQLSafe(GET_HOME_HERO_SLIDES, {}, 30)
        → POST cms.thehookahstore.in/graphql
        → WPGraphQL resolves ACF repeater on "Home" page
        → Returns JSON { page: { heroSlider: { slides: [...] } } }
      Server renders <HomePageContent acfHeroSlides={slides} />
      HTML delivered to browser
  → Browser hydrates React
  → AuthProvider effect fires:
      Check sessionStorage('hs_auth_v1') → hit or miss
      Miss: GET /api/auth/me (once, module-level singleton)
        → Server reads 'hookah_session' cookie
        → Verifies JWT (jose)
        → Returns { role, sub, email } or 401
  → CartProvider effect fires:
      Read localStorage('cart') → restore cart state
  → ThemeProvider effect fires:
      Read document.documentElement[data-dark] → sync dark state
  → HeroSlider renders with hardcoded + ACF slides
  → ProductSlider (Al Fakher, 1st slider NOT lazy):
      fetch(NEXT_PUBLIC_GRAPHQL_URL, { query: PRODUCTS_QUERY, tag: "Alfakher" })
      → DIRECT browser-to-GraphQL call, no cache
      → Renders products
  → ProductSliderLazy (Afzal, Royal, Oduman, Mya — code-split):
      Loaded only after initial paint (dynamic import, ssr:false)
      Each fires its own fetch() to GraphQL independently
      Total: 4 lazy GraphQL calls per homepage load
```

### B. Category Page Load

```
Browser GET /category/hookah-flavours
  → Next.js checks ISR cache (revalidate: 300s on page, 3600s on category meta)
  → Cache miss:
      Promise.all([
        fetchGraphQLSafe(GET_PRODUCT_CATEGORY, { slug }, 3600),
        fetchGraphQLSafe(GET_PRODUCTS_BY_CATEGORY, { slug, first: 60 }, 300)
      ])
      → 2 parallel POST requests to cms.thehookahstore.in/graphql
  → Server renders <CategoryPageClient products={products} category={category} />
  → HTML with full product list delivered as props
  → Browser hydrates
  → No additional data fetches (all data is in server props)
  → Client-side: filtering/sorting is done in memory via useMemo
```

### C. Product Detail Page Load

```
Browser GET /product/al-fakher-double-apple
  → Next.js Edge runtime: page.tsx runs on Cloudflare edge
  → Server renders empty shell: <ProductDetailPageClient slug={slug} />
  → HTML is a loading skeleton — NO product data in HTML
  → Browser hydrates
  → ProductDetailPageClient useEffect fires:
      fetch(NEXT_PUBLIC_GRAPHQL_URL, { query: PRODUCT_QUERY, slug })
      → Direct browser-to-GraphQL call, no cache, no revalidate
      → Response parsed, product state set
  → Product detail UI renders
  Note: Page is blank/skeleton until client-side fetch completes
  Note: No ISR — every visit fetches from GraphQL at runtime
```

### D. Search Request

```
User types "mint" in search bar (HeaderNav → LiveSearch)
  → State: query = "m", "mi", "min", "mint"
  → useDebounce(query, 300ms) delays execution
  → After 300ms idle:
      AbortController cancels any previous in-flight request
      fetch(NEXT_PUBLIC_GRAPHQL_URL, {
        query: CONSUMER_SEARCH_QUERY | WHOLESALE_SEARCH_QUERY,
        variables: { query: "mint" }
      })
      → Direct browser fetch, no caching
      → Returns up to 10 products
  → SearchDropdown renders results + category chips
```

### E. Add to Cart

```
User clicks "ADD TO CART" on ProductCard
  → e.stopPropagation() (prevent card navigation)
  → CartProvider.addToCart(productObj, variationId, selectedSize)
      → React state update (setCart)
      → localStorage.setItem('cart', JSON.stringify(newCart)) [immediate]
  → CartToast animates in (3s then auto-dismiss)
  → Cart count in header reactively updates via context
  → No server call — fully local
```

### F. Checkout / Payment Flow

```
User on /cart → clicks "Proceed to Checkout"
  → POST /api/shipping/methods (no body)
      → Server: wcGet('shipping/zones')
      → Per-zone: wcGet('shipping/zones/{id}/methods')
      → Returns sorted shipping options
  → User fills address form + selects shipping
  → User clicks "Pay Now"
      → POST /api/payment/create-order { amount: totalInPaise }
          → Server: POST api.razorpay.com/v1/orders
          → Returns { orderId }
      → Razorpay modal opens in browser (Razorpay JS loaded via CDN)
      → User completes payment in Razorpay modal
      → Razorpay calls onSuccess callback: { payment_id, order_id, signature }
      → POST /api/payment/complete-order { razorpay_*, cart, shippingAddress }
          → Server: HMAC-SHA256 verify(order_id + "|" + payment_id, KEY_SECRET)
          → Server: wcPost('orders', { line_items, billing, shipping, meta_data })
          → WooCommerce creates order: status=processing, payment_method=razorpay
          → Returns { orderId, orderNumber, dateCreated }
  → Browser redirects to /order-received?order={orderId}
  → Cart cleared locally
```

### G. Retail Login

```
User submits /login form { email, password }
  → POST /api/auth/login { email, password }
      → graphqlLogin(email, password)
          → POST cms.thehookahstore.in/graphql (login mutation)
          → WPGraphQL JWT Auth plugin validates credentials
          → Returns { authToken, user }
      → wcGetCustomerRoleByEmail(email)
          → GET cms.thehookahstore.in/wp-json/wc/v3/customers?email=...
          → Returns customer.role
      → If role = wholesale_pending → 403
      → If loginSource = 'wholesale' and role ≠ wholesale_customer → 403
      → createSessionToken({ sub, email, firstName, role, accountType })
          → jose SignJWT HS256 7d expiry
      → Set-Cookie: hookah_session=<JWT>; httpOnly; SameSite=Lax; 7d
  → Browser: cookie stored, redirect to account or homepage
  → AuthProvider: on next render, reads /api/auth/me → returns session data
  → AuthProvider: writes { role, userId } to sessionStorage (5 min)
```

### H. Wholesale Registration Multi-Step

```
Step 1: User on /wholesale/register fills business form
  → POST /api/auth/signup { registrationSource: "wholesale", ...businessFields }
      → graphqlCheckEmailExists(email) → GraphQL users query
      → graphqlRegisterCustomer(...) → WooGraphQL registerCustomer mutation
      → wcSetCustomerRole(customerId, 'wholesale_pending')
          → PUT cms.thehookahstore.in/wp-json/wp/v2/users/{id} { roles: ['wholesale_pending'] }
          → Auth: Basic btoa(WP_ADMIN_USERNAME:WP_ADMIN_APP_PASSWORD)
      → wcSetWholesaleMeta(customerId, { account_type, approval_status, ...businessInfo })
          → PUT cms.thehookahstore.in/wp-json/wc/v3/customers/{id} { meta_data: [...] }
      → sendWholesaleApplicationEmail → Resend API
      → Return 202 (no session cookie)

Step 2: User on /wholesale/auth/upload-documents
  → POST /api/wholesale/upload-documents (multipart/form-data)
      For each file { gstCertificate, businessLicense, identityDocument? }:
          → uploadToWordPressMedia(file, filename)
              → POST cms.thehookahstore.in/wp-json/wp/v2/media
              → Returns { source_url }
      → wcSaveDocumentUrls(customerId, { gst_url, license_url, id_url })
          → PUT /wc/v3/customers/{id} { meta_data: [...] }
```

### I. Wholesale Approval Webhook

```
Admin in WP Admin → Wholesale Applications → Approve
  → WordPress: actions.php sets role wholesale_customer
      → PUT /wp/v2/users/{id} { roles: ['wholesale_customer'] }
  → WordPress: POST https://thehookahstore.in/api/wholesale/approved
      { userId, email, name }
      Authorization: Bearer {WHOLESALE_WEBHOOK_SECRET}
  → Next.js /api/wholesale/approved:
      → Verify Bearer token === WHOLESALE_WEBHOOK_SECRET
      → sendWholesaleApprovedEmail({ name, email, loginUrl })
          → Resend API → Approval email delivered
  → Returns 200 { success: true }
```

---

## 3. Component Architecture

### Server vs. Client Component Classification

| Component | Type | Notes |
|---|---|---|
| `app/(site)/page.tsx` | **Server** | Fetches ACF hero slides via ISR |
| `app/(site)/category/[slug]/page.tsx` | **Server** | Fetches category + products via ISR |
| `app/(site)/product/[slug]/page.tsx` | **Server (shell only)** | Edge runtime, delegates all data to client |
| `app/layout.tsx` | **Server** | Root layout, ThemeProvider + AuthProvider are client |
| `HomePageContent` | **Client** | Needs `useTheme()`, renders ProductSliders |
| `HeroSlider` | **Client** | useState, useEffect, intervals, touch events |
| `ProductSlider` | **Client** | GraphQL fetch, ResizeObserver, touch swipe |
| `ProductCard` | **Client** | useCart, useTheme, usePathname, useWholesaleSession |
| `ProductDetailPageClient` | **Client** | Fetches product data via useEffect |
| `CategoryPageClient` | **Client** | Client-side filter/sort on server-passed data |
| `AuthProvider` | **Client** | Context provider, fetch /api/auth/me |
| `CartProvider` | **Client** | Context provider, localStorage |
| `ThemeProvider` | **Client** | Context provider, data-dark attribute sync |
| `SiteLoader` | **Client** | Document click listener, usePathname |
| `HeaderNav` | **Client** | Mega menus, dropdowns, useScrolledPast |
| `Footer` | **Server-compatible** | No hooks — but likely treated as client via layout |
| `MobileMenu` | **Client** | State for open/close, links |
| `LiveSearch` | **Client** | Debounced GraphQL fetch, AbortController |
| `WholesaleCartGuard` | **Client** | useAuth + useCart, effect |
| `AgeGate` | **Client** | localStorage check |

### Unnecessary Client Components

**`ProductDetailPageClient`** — The product detail page is server-rendered shell + client fetch. This means:
- The `/product/[slug]` page has **no server-side data** — it's effectively a CSR page
- The page shell is rendered at the edge (no ISR) but is empty
- The user sees a spinner until the client fetches GraphQL
- This entire component could be converted to a Server Component, eliminating the client spinner

**`HomePageContent`** — This is `'use client'` primarily to access `useTheme()` for colour tokens. If CSS custom properties were used instead of inline JS-computed colours, this could be a Server Component (with `HeroSlider` and `ProductSlider` as client islands).

**`WholesaleCartGuard`** — Currently a client component that reads context. It could be a server-side middleware check instead.

### Components Causing Heavy Re-renders

**`ProductCard`** — Calls 4 hooks: `useCart`, `useTheme`, `usePathname`, `useWholesaleSession`. Any change in cart state, theme, or navigation causes re-renders across all visible ProductCards simultaneously. On a category page with 60 products, 60 ProductCard instances would all re-render on any cart mutation.

**`CartProvider`** — Triggers `localStorage.setItem` on every render of the effect `[cart, storageKey]`. Any cart state change serialises the entire cart to localStorage on every re-render.

**`HeroSlider`** — Has 3 separate `useEffect` hooks: one for resize, one for autoplay (runs every `[isPaused, isTransitioning]` change), one for transition end. The autoplay effect IS re-subscribed whenever `isTransitioning` changes — which happens at least twice per auto-advance cycle (start transition → end transition). This means `setInterval` is re-created on every slide transition.

### Top 20 Most Important Components

| # | Component | Role |
|---|---|---|
| 1 | `AuthProvider` | Global auth state, single /api/auth/me call, sessionStorage cache |
| 2 | `CartProvider` | Global cart state, localStorage persistence, toast notifications |
| 3 | `ThemeProvider` | Global dark/light theme, syncs data-dark attribute |
| 4 | `HeroSlider` | Hero carousel with auto-advance, touch, mobile/desktop images |
| 5 | `ProductSlider` | Horizontal product carousel, client-side GraphQL fetch |
| 6 | `ProductCard` | Core product display unit used in both grid and slider views |
| 7 | `HomePageContent` | Homepage assembly (slider + 5 brand sections + blog placeholder) |
| 8 | `CategoryPageClient` | 612-line page handling display + filter + sort for category products |
| 9 | `ProductDetailPageClient` | Full product detail with variants, quantity, add-to-cart |
| 10 | `HeaderNav` | Desktop navigation with mega menus, search, cart, theme toggle |
| 11 | `LiveSearch` | Debounced GraphQL search with AbortController |
| 12 | `Footer` | Full site footer, 630 lines, all static nav links |
| 13 | `MobileMenu` | Mobile navigation overlay with full link structure |
| 14 | `SiteLoader` | Route transition progress bar |
| 15 | `WholesaleCartGuard` | Clears wholesale cart for non-approved users |
| 16 | `AgeGate` + `AgeVerification` | Blocks site access until age confirmed |
| 17 | `CartSidebar` | Cart slide-over panel (404 lines) |
| 18 | `CategoryPageClient` | Category filter/sort system (612 lines) |
| 19 | `WholesaleProductClient` | Wholesale product detail with approval-gated pricing |
| 20 | `BlogPageClient` | Blog list with posts from WPGraphQL |

---

## 4. API Call Analysis

### GraphQL Calls (WPGraphQL)

| Query | Trigger Location | Frequency | Cache |
|---|---|---|---|
| `GET_HOME_HERO_SLIDES` | `app/(site)/page.tsx` server | Per ISR cycle (30s) | `next: { revalidate: 30 }` |
| `GET_PRODUCT_CATEGORY` | `category/[slug]/page.tsx` server | Per ISR cycle (3600s) | `next: { revalidate: 3600 }` |
| `GET_PRODUCTS_BY_CATEGORY` | `category/[slug]/page.tsx` server | Per ISR cycle (300s) | `next: { revalidate: 300 }` |
| `GET_POSTS_QUERY` | Blog pages server | Per ISR cycle | varies |
| `PRODUCT_QUERY` | `ProductDetailPageClient` useEffect | **Every page visit, per client** | ❌ None (`cache` not set — browser default) |
| `PRODUCTS_QUERY` | `ProductSlider` useEffect | **Every component mount** | ❌ None |
| `CONSUMER_SEARCH_QUERY` | `LiveSearch` useEffect (debounced 300ms) | Per keystroke pause | ❌ None |
| `WHOLESALE_SEARCH_QUERY` | `LiveSearch` useEffect (debounced 300ms) | Per keystroke pause | ❌ None |
| `registerCustomer` mutation | `/api/auth/signup` on signup | Per registration | `cache: 'no-store'` |
| `login` mutation | `/api/auth/login` on login | Per login | `cache: 'no-store'` |
| `CheckUser` query | `/api/auth/signup` email check | Per signup | `cache: 'no-store'` |

### WooCommerce REST API Calls

| Endpoint | Trigger | Cache |
|---|---|---|
| `GET /wc/v3/customers?email=` | Login, signup | `cache: 'no-store'` |
| `PUT /wc/v3/customers/{id}` | Signup (meta), document upload, approval | `cache: 'no-store'` |
| `POST /wc/v3/orders` | Payment complete | `cache: 'no-store'` |
| `GET /wc/v3/shipping/zones` | Checkout (shipping) | `cache: 'no-store'` |
| `GET /wc/v3/shipping/zones/{id}/methods` | Checkout (per zone) | `cache: 'no-store'` |

### WordPress REST API Calls

| Endpoint | Trigger | Cache |
|---|---|---|
| `PUT /wp/v2/users/{id}` | Signup (wholesale role), plugin webhook | `cache: 'no-store'` |
| `POST /wp/v2/media` | Document upload (per file, up to 3) | No-cache (binary) |

### Next.js API Routes (Client → Server)

| Route | Method | Trigger | Notes |
|---|---|---|---|
| `/api/auth/me` | GET | AuthProvider on mount | Once per session (singleton) |
| `/api/auth/login` | POST | Login form submit | — |
| `/api/auth/signup` | POST | Register form submit | — |
| `/api/auth/logout` | POST | Logout button | — |
| `/api/auth/verify-email` | GET | Email link click | — |
| `/api/auth/forgot-password` | POST | Form submit | — |
| `/api/auth/reset-password` | POST | Form submit | — |
| `/api/auth/check-email` | POST | Registration flow | — |
| `/api/payment/create-order` | POST | Checkout: Pay Now click | — |
| `/api/payment/complete-order` | POST | Razorpay success callback | — |
| `/api/shipping/methods` | POST | Cart/checkout page load | — |
| `/api/wholesale/upload-documents` | POST | Document upload step | Multipart |
| `/api/wholesale/approved` | POST | WordPress plugin webhook | Bearer auth |
| `/api/wholesale/rejected` | POST | WordPress plugin webhook | Bearer auth |

### Duplicate / Redundant Calls

1. **`PRODUCTS_QUERY` defined twice** — in `lib/graphql/index.ts` (as `GET_PRODUCTS_BY_TAG`) and inside `ProductSlider.tsx`. The `ProductSlider` version isn't using the library function.

2. **`CONSUMER_SEARCH_QUERY` / `WHOLESALE_SEARCH_QUERY` defined twice** — in `lib/graphql/index.ts` AND in `LiveSearch.tsx`. Two sources of truth for these query shapes.

3. **Homepage fires 5 independent GraphQL fetches for product sliders** — one per brand section (Al Fakher, Afzal, Royal Smoking, Oduman, Mya), all going directly to `cms.thehookahstore.in/graphql` from the browser with no caching.

---

## 5. Performance Analysis

### Critical Performance Risks

**1. Product Detail Page is Fully CSR**
Every product page visit causes: render empty shell → client `useEffect` → fetch GraphQL → re-render. The user sees a 3-dot loading skeleton instead of content during the fetch. No data is in the initial HTML, so SEO crawler may not see product content.

**2. Homepage Fires 5 Uncached Client-Side GraphQL Fetches**
The `ProductSlider` used on the homepage fetches directly from the GraphQL endpoint from the browser, with no `next: { revalidate }` option (browser fetch ignores this). Each of the 5 brand sections (Al Fakher, Afzal, Royal Smoking, Oduman, Mya) fires its own independent fetch. On a slow connection, this is 5 waterfall/parallel requests after the initial page paint.

**3. Images Not Optimised (`unoptimized: true` in next.config.mjs)**
All `<Image>` components serve full-resolution images directly from `cms.thehookahstore.in`. No WebP conversion, no responsive resizing, no CDN-optimized formats. The hero slider images alone can be several MB on desktop.

**4. HeroSlider Autoplay Timer Re-subscribes on Every Transition**
The `useEffect` for autoplay depends on `[isPaused, isTransitioning]`. Since `isTransitioning` changes twice per slide (set true → set false after 500ms), the `setInterval` is cleared and re-created on every slide transition. This means the timing is inconsistent — the interval resets after each slide rather than counting from the start.

**5. `CategoryPageClient` Receives Up to 60 Products as Props**
The category page server component fetches up to 60 products and passes them all as props to the client component. This means the full product JSON array travels in the initial HTML payload. For text-heavy product descriptions, this can be a very large initial payload.

**6. CartProvider Writes to localStorage on Every State Change**
```js
useEffect(() => {
  localStorage.setItem(storageKey, JSON.stringify(cart));
}, [cart, storageKey]);
```
Every cart operation (add, remove, update quantity) triggers a full JSON serialization of the cart and a localStorage write. For large carts this is a synchronous operation on the main thread.

**7. Footer is 630 Lines of Hardcoded HTML**
The footer component is 630 lines. It contains no dynamic data but is rendered on every page. It's not a server-only component in the strict sense — it's rendered by the server layout but has no explicit `'use client'` directive.

**8. Shipping Fetch: Multiple WC API Calls per Zone**
`/api/shipping/methods` fetches all zones then for each zone fires another fetch for zone methods. If there are N zones, this is N+1 WooCommerce REST calls in serial/parallel. These are not cached (`cache: 'no-store'`).

**9. `ProductCard` Reads 4 Hooks Each**
60 product cards on a category page × 4 hooks each = 240 hook reads per render cycle. Any context update to `cart`, `theme`, or `auth` causes all 60 cards to re-render simultaneously.

---

## 6. Rendering Model

### How the Project Uses Each Mode

| Mode | Where Used | Notes |
|---|---|---|
| **ISR (Incremental Static Regeneration)** | Homepage (300s), Category pages (300s/3600s), Blog pages | Correct usage via `export const revalidate` |
| **SSR (on-demand server render)** | Not explicitly used — all server components use ISR or edge |
| **Edge Runtime** | `/product/[slug]` page, most API routes | `export const runtime = 'edge'` |
| **CSR (Client-Side Rendering)** | Product detail, product sliders, search, cart | Full client fetch with loading states |
| **Static** | Policy pages, static info pages | Likely no export const → Next.js default |

### Identified Hydration Mismatch Risks

**ThemeProvider initialises `dark` as `false`:**
```js
const [dark, setDark] = useState(false);
// After hydration: sync with data-dark attr
useEffect(() => {
  const isDark = document.documentElement.getAttribute('data-dark') === 'true';
  setDark(isDark);
}, []);
```
On a dark-mode page, the server renders with `dark=false`, the browser presents the dark HTML (via the inline script), then React hydrates with `dark=false`, then the `useEffect` runs and sets `dark=true`. Any component that conditionally renders different content based on `dark` will show a brief flash from the `false` state before the effect fires. The inline CSS custom properties prevent visual flash, but React-computed inline styles (like in `ProductCard`) may flicker on the initial render.

**`HeroSlider` initialises with fixed desktop dimensions:**
```js
const [dims, setDims] = useState(() => computeHeroDims(1440));
```
On mobile, the component initially renders as desktop dimensions until the `useEffect` resize handler fires. This causes a brief layout shift on mobile.

### Components That Should Be Server-Rendered

- `ProductDetailPageClient` — The entire product data fetch could be server-side with ISR
- `HomePageContent` — If CSS variables replace JS-computed colours, this could be a Server Component
- Blog page components — Already fetching on server but rendered in client components

---

## 7. Caching Strategy

### What Is Currently Cached

| Data | Cache Type | TTL | Location |
|---|---|---|---|
| Homepage hero slides | Next.js ISR fetch | 30s (per call) / 300s (page) | Next.js data cache |
| Category products | Next.js ISR fetch | 300s | Next.js data cache |
| Category meta (name, description) | Next.js ISR fetch | 3600s | Next.js data cache |
| Blog posts | Next.js ISR fetch | Varies | Next.js data cache |
| Auth state (logged-in users only) | sessionStorage | 300s (5 min) | Browser sessionStorage |
| Cart contents | localStorage | Persistent | Browser localStorage |
| Theme preference | localStorage | Persistent | Browser localStorage |
| Age verification | localStorage | Persistent | Browser localStorage |

### What Is NOT Cached (But Should Be)

| Data | Current | Should Be |
|---|---|---|
| Product detail page data | CSR, no cache | ISR 300s |
| `ProductSlider` GraphQL results | Browser fetch, no cache | Next.js API route with ISR, or move to server |
| Live search results | Browser fetch, no cache | Short in-memory cache (30–60s per query) |
| Shipping methods | `cache: 'no-store'` per checkout | 30-min cache (shipping zones rarely change) |
| WooCommerce product images | Served from WP origin, no CDN | Should go through a CDN or image proxy |

### Conflicting Cache Settings

The homepage has a **page-level revalidate of 300s** but the actual hero slides are fetched with **`revalidate: 30`**:

```js
// page.tsx — these conflict:
export const revalidate = 300;                          // page-level
const data = await fetchGraphQLSafe(GET_HOME_HERO_SLIDES, {}, 30); // fetch-level
```

Next.js uses the fetch-level value when the two differ. The page will attempt to rebuild the hero data every 30 seconds even though the page-level ISR says 300.

---

## 8. Authentication Flow Analysis

### Complete JWT Session Lifecycle

```
Registration (Retail):
  graphqlRegisterCustomer → WP creates user
  createSessionToken({ sub, email, firstName, accountType: 'retail', emailVerified: false })
  → jose SignJWT HS256 7d
  → Set-Cookie: hookah_session=<JWT> httpOnly Secure SameSite=Lax maxAge=604800

Login:
  graphqlLogin(email, password) → WPGraphQL auth token (used for auth only, not stored)
  wcGetCustomerRoleByEmail(email) → WC REST API role check
  createSessionToken({ ..., role: wcRole })
  → Same cookie set/replaced

Session Reading (Server):
  getServerSession() → cookies().get('hookah_session') → verifySessionToken(token)
  → jose jwtVerify HS256
  → Returns SessionPayload or null

Client Auth Check:
  AuthProvider mounts →
    1. readSessionCache() from sessionStorage (synchronous)
       If hit (authenticated user, <5min old): set state immediately, no network call
    2. fetchAuthOnce() — module-level singleton promise
       If cachedAuthPromise exists: reuse it (no new fetch)
       Else: GET /api/auth/me → verify cookie → return { role, sub, email }
       → 401 if no valid session (guest) → sets role='not_approved', no error logged
       → 200 → sets role='wholesale_customer' | 'customer' | 'administrator'
       → Writes to sessionStorage if authenticated
```

### Why 401s Still Appear in Terminal

Even with the singleton fix, the following causes `/api/auth/me` to be called once per page load by guests:
1. Guest loads page → `cachedAuthPromise` is null (new JS session) → `GET /api/auth/me` → 401
2. Next.js server logs **every** API route call regardless of status code
3. For guests browsing multiple pages with full page refreshes (hard navigation), each refresh creates a new JS runtime → new singleton → new `GET /api/auth/me` → new 401 log

The fix eliminates duplicates within a single page session but not across refreshes. This is correct and expected behaviour.

### Session Security Observations

- The `emailVerified: false` field is set in the JWT but **never checked** — users with unverified emails have identical access to verified users
- JWT payload is not encrypted (only signed) — the `firstName`, `email`, `role` fields are readable by anyone who decodes the cookie (though not forgeable without `JWT_SECRET`)
- `SESSION_MAX_AGE = 7 days` with no sliding window — tokens expire exactly 7 days after issue regardless of activity
- No token revocation mechanism — a stolen token cannot be invalidated before expiry


---

## 9. Cart System Analysis

### Retail Cart

- **Storage key:** `'cart'` in `localStorage`
- **Managed by:** `CartProvider` inside `app/(site)/layout.tsx`
- **Persistence:** Survives browser refresh, tab close, device sleep.
- **Data shape per item:** `{ productId, variationId, name, price, image, size, quantity }`
- **Price is stored as a string** (e.g. `"₹970.00"`) — parsed with regex at sum time. Brittle if WC price format changes.
- **Variation tracking:** Items matched by `(productId, variationId)` pair.

### Wholesale Cart

- **Storage key:** `'wholesale_cart'`
- **Separate instance** in `app/wholesale/layout.tsx` — completely isolated from retail cart.

### Cart Issues

1. **No stock validation** — out-of-stock products can be added. WC throws on order creation.
2. **Price snapshot** — price captured at add-to-cart. WC price changes not reflected.
3. **No cart size limit** — unlimited items, large carts slow localStorage serialisation.
4. **`productId: 0` risk** — `productId ?? 0` fallback; id-0 items will fail at WC order creation.

### WholesaleCartGuard

On every render, if the resolved role is not `wholesale_customer`, the wholesale cart is silently cleared. This is the correct guard but means a `wholesale_pending` user will always have their cart reset mid-session.

---

## 10. Image Loading

### Hero Slider

- ACF images come from WordPress media library at full resolution — no CDN, no resizing.
- `isMobile` flag starts as `false` on all renders; `useEffect` updates it — causes brief CLS on mobile.
- `priority` is not explicitly set on hero images — they are not hinted as LCP candidates.

### Product Images

- `loading="lazy"` is correct for below-fold product images.
- `unoptimized: true` in `next.config.mjs` globally disables WebP conversion, srcset, and CDN resizing.
- `sizes` prop is set correctly per card width but has no effect when optimisation is disabled.

### Decorative Background Images

- Homepage section backgrounds (e.g. `alfakher_bg_left.png` at 912×510px, `afzal_bg_right.png` at 1154×779px) are large images rendered at 20% opacity as pure decoration. They add significant byte weight with no information value.

---

## 11. WordPress Integration

### Communication Channels

| Channel | Endpoint | Auth | Used For |
|---|---|---|---|
| WPGraphQL | `POST cms.thehookahstore.in/graphql` | None (public) | Products, categories, ACF, blog, search |
| WC REST v3 | `cms.thehookahstore.in/wp-json/wc/v3/` | Consumer key/secret | Orders, customers, shipping |
| WP REST v2 | `cms.thehookahstore.in/wp-json/wp/v2/` | Application Password | Role updates, media uploads |
| WPGraphQL mutations | Same GraphQL endpoint | None (handled internally) | Register, login |

### Inefficiencies

- **No GraphQL request batching** — 5 independent brand queries on homepage; a single query could return all 5 in one round trip.
- **WC REST customer lookup on every login** — necessary to get the WooCommerce role, but the result is not cached between login attempts.
- **Browser makes direct GraphQL POST requests** — ProductSlider, ProductDetailPageClient, LiveSearch all call `cms.thehookahstore.in/graphql` from the browser, putting GraphQL load on every visitor's session.

---

## 12. Code Quality

### Duplicate Code

| Code | Appears In |
|---|---|
| `CONSUMER_SEARCH_QUERY` | `lib/graphql/index.ts` AND `LiveSearch.tsx` |
| `WHOLESALE_SEARCH_QUERY` | `lib/graphql/index.ts` AND `LiveSearch.tsx` |
| `PRODUCTS_QUERY` | `lib/graphql/index.ts` (as `GET_PRODUCTS_BY_TAG`) AND `ProductSlider.tsx` |
| `parsePrice()` | `CategoryPageClient.tsx` AND `CartProvider.tsx` |
| JS inline color tokens | `ProductCard`, `HomePageContent`, `ProductDetailPageClient`, etc. |

### Large Files

| File | Lines | Issue |
|---|---|---|
| `Footer.tsx` | 630 | All static HTML |
| `CategoryPageClient.tsx` | 612 | Filter + layout + sort + grid in one file |
| `ProductSlider.tsx` | 482 | Dimensions + fetch + touch + rendering |
| `HeaderNav.tsx` | 456 | Desktop nav + mega menus + mobile toggle |
| `HeroSlider.tsx` | 455 | Dimensions + autoplay + transition + touch |
| `CartSidebar.tsx` | 404 | Full slide-over with quantity controls |

### Dangerous Patterns

- **`product: any` in `CartProvider.addToCart`** — no TypeScript safety on cart item shape
- **`btoa()` for WC credentials** — does not handle non-Latin1 characters (low risk, but `Buffer.from()` is more robust)
- **`window.location.href` in search form** — triggers full page reload instead of client-side `router.push()`
- **Category filters are hardcoded** — `BRAND_OPTIONS`, `MATERIAL_OPTIONS` etc. in `CategoryPageClient` are static arrays with no real filtering logic behind them

---

## 13. Security Review

### Positive Security Controls

- Session cookie: `httpOnly`, `Secure` (prod), `SameSite: Lax` ✅
- Razorpay payment signature verified server-side with HMAC-SHA256 ✅
- WC consumer key/secret never exposed to browser ✅
- Application Password never exposed to browser ✅
- Password reset tokens have nonce for single-use enforcement ✅

### Security Gaps

| Gap | Severity | Notes |
|---|---|---|
| `WHOLESALE_WEBHOOK_SECRET` not required | HIGH | Missing env var = open webhook endpoint |
| No rate limiting on auth routes | HIGH | Login, signup, password-reset exposed to brute force |
| Email verification not enforced | MEDIUM | `emailVerified: false` users have full account access |
| JWT payload not encrypted | LOW | email, firstName, role readable via base64 decode |
| No token revocation | LOW | Stolen session token valid for 7 days |
| Public GraphQL endpoint | INFO | WPGraphQL accepts arbitrary queries from any origin |

---

## 14. Bundle Analysis

### Always-in-Client-Bundle

- `AuthProvider`, `ThemeProvider` — root layout, always loaded
- `CartProvider` — retail + wholesale layouts
- `HeaderNav` (456 lines with mega menu data)
- `Footer` (630 lines static HTML)
- `AgeGate` + `AgeVerification` — retail pages

### Code Splitting (Working Correctly)

- Below-fold `ProductSlider` instances are deferred via `dynamic(() => import('../ProductSlider'), { ssr: false })`
- Route-level splitting: wholesale pages, blog, account pages all split automatically by Next.js

### External / CDN Assets

- **Razorpay JS** (`rzp1.js`) loaded from Razorpay CDN at checkout — not in bundle
- **Montserrat font** self-hosted via `next/font/google` — no external request

### Library Weight (Server-Only, Not in Client Bundle)

- `jose` — ~45KB, server + edge only
- `resend` — server only
- `next/server`, `next/headers` — server only

---

## 15. Final Observations

### Top 20 Architecture Insights

1. **Hybrid ISR/CSR** — category pages use ISR correctly; product detail pages are fully CSR. Users get fast category pages but spinners on product pages.

2. **5 uncached client-side GraphQL calls per homepage visit** — all brand product sliders fetch directly from browser with no caching mechanism.

3. **Public GraphQL endpoint exposed** — any visitor can run arbitrary WPGraphQL queries. No auth, no depth limiting visible from the frontend.

4. **Product detail pages have near-zero SEO value from server rendering** — Edge shell is empty HTML. Google must JS-render the page to index product content.

5. **Image optimisation is globally disabled** — `unoptimized: true` eliminates all WebP conversion, resizing, and CDN delivery benefits of Next.js Image.

6. **Cart price stored as display string** — `"₹970.00"` parsed with regex. Locale changes or WC format changes would silently break cart totals.

7. **Category page filters are hardcoded and non-functional** — The filter panel UI is decorative. Filter options are static arrays not connected to product attributes.

8. **Hero slider always shows 3 placeholder slides** — Hardcoded slides appear before ACF content. All 3 use the same `/hero-vanilla.webp` image.

9. **Homepage blog section is hardcoded** — 3 identical placeholder cards with no connection to WordPress blog data.

10. **Missing `WHOLESALE_WEBHOOK_SECRET` = security hole** — Both webhook endpoints process requests without authentication if the env var is absent.

11. **No rate limiting on any authentication endpoint** — Login enumeration and brute-force are possible.

12. **Email verification never enforced** — `emailVerified: false` users have identical access to `emailVerified: true` users.

13. **ThemeProvider hydration flash risk** — React starts with `dark=false`; inline blocking script sets `data-dark=true`. Inline style computed colours may flicker on mounted components.

14. **HeroSlider autoplay interval re-creates on every slide** — `[isPaused, isTransitioning]` dependency causes `setInterval` to restart after each transition.

15. **Wholesale registration gives no session on success** — The 202 response is correct but the user must be clearly told they cannot log in until approved.

16. **Single WC API key pair for all operations** — The same key is used for read (customers), write (orders), and update (customer meta). Least-privilege is not applied.

17. **60 ProductCards re-render simultaneously on cart/theme change** — No `React.memo` or context selectors. Any global state update causes all category page cards to re-render.

18. **Shipping zones re-fetched on every checkout** — `cache: 'no-store'` for data that changes at most weekly. N+1 WC REST calls per checkout.

19. **`lib/graphql/index.ts` is underutilised** — Six typed GraphQL query strings exist here but are bypassed by component-local duplicates in ProductSlider, ProductDetailPageClient, and LiveSearch.

20. **WordPress plugin webhook may not complete post-redirect** — `wp_safe_redirect()` may terminate PHP before the `wp_remote_post()` to Next.js finishes. Should use `blocking: false` in `wp_remote_post`.

---

*End of PROJECT_DEEP_ANALYSIS.md — March 2026 | Analysis only | No code was modified*
