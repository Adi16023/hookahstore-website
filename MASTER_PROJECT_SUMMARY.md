# MASTER_PROJECT_SUMMARY.md — The Hookah Store

> **Purpose:** Single source of truth on the current, as-built state of the codebase, reconciled against `PROJECT_ARCHITECTURE.md`, `PROJECT_DEEP_ANALYSIS.md`, `PROJECT_OPTIMIZATION_PLAN.md`, and `IMPLEMENTATION_TASK_LIST.md`. Written for an AI assistant with no repo access — every claim below was verified against the actual source at the time of writing.
> **Verification date:** 2026-07-01. **No code was modified in producing this document.**

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Tech Stack](#2-tech-stack)
3. [Repository Map](#3-repository-map)
4. [Every Route / Page — Full Inventory](#4-every-route--page--full-inventory)
5. [Every API Route — Full Inventory](#5-every-api-route--full-inventory)
6. [Core Feature Inventory](#6-core-feature-inventory--done--partial--missing)
7. [WordPress / WooCommerce Integration Detail](#7-wordpress--woocommerce-integration-detail)
8. [Auth & Session Model](#8-auth--session-model)
9. [Known Issues, Bugs, and Risks](#9-known-issues-bugs-and-risks--consolidated--re-verified)
10. [Environment Variables](#10-environment-variables)
11. [Open Questions / Decisions Needed](#11-open-questions--decisions-needed)
12. [Suggested Next Priorities](#12-suggested-next-featurespriorities)

---

## 1. Executive Summary

The Hookah Store is a headless e-commerce site selling shisha tobacco, hookahs, charcoal, and accessories, serving two distinct customer types: **retail** (B2C, direct checkout) and **wholesale** (B2B, application-gated, requires admin approval before login works). The stack is a Next.js 15 frontend (deployed to Cloudflare Pages, mostly Edge runtime) talking to a WordPress + WooCommerce backend headlessly via WPGraphQL (catalog, blog, ACF content) and the WooCommerce REST API (orders, customers, shipping). Payments run through Razorpay; transactional email through Resend; a newer Shiprocket integration handles live shipping rates, shipment creation, and order tracking.

**Overall health.** The core commerce loop — browse → add to cart → checkout → pay → WooCommerce order created — is genuinely solid: server-verified Razorpay signatures, real WooCommerce order creation, real ISR-backed product/category/product-detail pages (this was CSR as recently as the last deep-analysis pass and has since been fixed), and a functioning multi-step checkout with coupon re-validation server-side. Retail and wholesale auth are both fully wired to real WordPress/WooCommerce identities via session JWTs in httpOnly cookies. Roughly **75–80% of the core commerce flow is production-solid**.

Pulling the average down: two **live secrets are committed in git history** (WooCommerce API keys in `frontend/wrangler.toml`, and a webhook secret fallback hardcoded in the WordPress plugin's PHP — both need rotation, see §9). The newer Shiprocket shipping integration has real gaps (unauthenticated shipment-creation endpoint, client-supplied shipping cost never re-validated server-side). A large fraction of legal/marketing content (Terms, Privacy, FAQs, Accessibility, Shipping & Returns, Cookies Policy) is still literal Lorem Ipsum. Several nav-adjacent features are non-functional stubs (contact form doesn't submit, rewards/coupons/offers pages are static marketing pages with no backend, wholesale "Saved Products" is an empty-state-only placeholder, the new `/track` order-tracking page is fully built but has zero navigation links pointing to it). Rough estimate: **~50% of supporting/content pages are placeholder-grade**, against the ~75–80% solid core commerce flow.

---

## 2. Tech Stack

| Layer | Detail |
|---|---|
| Framework | Next.js **15.5.2** (App Router), React **19.2.3** / react-dom 19.2.3 |
| Language | TypeScript — `strict: false`, but `strictNullChecks: true` (`frontend/tsconfig.json`); target ES2017 |
| Styling | Tailwind CSS **v4.1.18** via `@tailwindcss/postcss`; `tailwind.config.js` only extends `fontFamily.montserrat` |
| Auth/JWT | `jose` **6.1.3** — used for session JWTs (sign/verify) in `lib/auth/`, `middleware.ts` |
| Email | `resend` **6.9.3** SDK is a declared dependency, but production email sending in `lib/email/resend-client.ts` was **switched to raw `fetch()`** (commit `26555aa "fix: replace Resend SDK with fetch() for edge runtime compatibility"`) for Edge-runtime compatibility — the SDK import itself is not used at runtime |
| Payments | Razorpay — client-loaded checkout.js + server-side order creation/signature verification (no Razorpay SDK dependency; plain `fetch`/Web Crypto HMAC) |
| Shipping | Shiprocket — custom REST client in `lib/shiprocket/index.ts`, no SDK dependency |
| Newsletter | Brevo (Sendinblue) REST API — `/api/newsletter/subscribe`, no SDK dependency |
| Declared but **unused** deps | `framer-motion`, `lucide-react`, `swiper`, `bcryptjs` — zero import sites found anywhere in `app/`, `components/`, `lib/`, `hooks/` (confirmed via repo-wide grep). Dead weight in `package.json`; password hashing is delegated entirely to WordPress/WooCommerce, so `bcryptjs` was never needed client/server-side here. |
| Build tooling | `@cloudflare/next-on-pages` **1.13.16** (`npm run pages:build`), ESLint 9 (build-time linting disabled: `next.config.mjs` sets `eslint.ignoreDuringBuilds: true`) |
| Hosting | **Cloudflare Pages** — confirmed via `frontend/wrangler.toml` (`pages_build_output_dir = ".vercel/output/static"`, `compatibility_flags = ["nodejs_compat"]`). Nearly every page and API route declares `export const runtime = 'edge'`. |
| Backend CMS | WordPress + WooCommerce at `cms.thehookahstore.in`, consumed headlessly. Inferred required WP plugins (see §7 Part B for the exact query/field evidence): **WPGraphQL** (core), **WPGraphQL for ACF** (the `heroSlider` repeater field group on the Home/Wholesale-Home pages), **WPGraphQL JWT Authentication** (`login` mutation used in `lib/auth/auth-graphql.ts`), **WooCommerce**, **WooGraphQL / WPGraphQL for WooCommerce** (`registerCustomer` mutation, `Product`/`SimpleProduct`/`VariableProduct` GraphQL types), **Advanced Custom Fields (ACF)** itself, and the custom **Wholesale Admin Manager** plugin (`wordpress-plugin/wholesale-admin-manager/`, v4.1) for roles/admin UI/webhooks. |
| Third-party services | Razorpay (India payments), Resend (transactional email), Brevo (newsletter list), Shiprocket (live shipping rates / shipment creation / tracking) |

---

## 3. Repository Map

```
frontend/
├── app/
│   ├── (site)/            # Retail storefront route group — ~39 routes (home, category,
│   │                       # product, cart, account, blog-adjacent legal pages, /track, etc.)
│   ├── wholesale/          # B2B storefront — subdomain-routed via middleware.ts,
│   │                       # separate CartProvider instance (storageKey="wholesale_cart")
│   ├── blog/               # WPGraphQL-backed blog (list, category, single post) — real data
│   └── api/                # All backend routes: auth/, payment/, shipping/, shiprocket/,
│                            # wholesale/, coupons/, search/, newsletter/, account/, admin/
├── components/
│   ├── providers/          # AuthProvider, CartProvider (reused for retail+wholesale), ThemeProvider
│   ├── layout/              # Header, HeaderNav, Footer (703 lines), header/{Desktop,Tablet,Mobile}
│   ├── pages/               # HomePageContent (homepage assembly)
│   ├── account/, blog/, search/, wholesale/, rewards/   # feature-scoped components
│   └── AgeGate.tsx, AgeVerification.tsx (orphaned dup), HeroSlider.tsx, ProductCard.tsx,
│       ProductSlider.tsx, SiteLoader.tsx   # standalone shared components
├── lib/
│   ├── auth/                # session-server.ts, auth-graphql.ts, use-wholesale-session.ts
│   ├── graphql/index.ts     # SINGLE source of truth for all WPGraphQL query strings
│   ├── woocommerce/         # index.ts (REST client + wcGetCached), media.ts, wholesale.ts
│   ├── shiprocket/index.ts  # New: Shiprocket auth/rates/order-create/tracking client
│   ├── email/                # resend-client.ts (fetch-based), render-email.tsx, send-emails.tsx
│   ├── rate-limit.ts         # Built, but dead code — never imported by any route
│   ├── env-check.ts          # Built, but dead code — never imported by app/layout.tsx
│   └── config/, utils/, useScrolledPast.ts
├── hooks/useDebounce.ts     # only custom hook in the repo
├── styles/globals.css
├── public/                  # about/, homepage/, footer-assets/, shop-by-brand/, shop-by-price/,
│                             # rewards/, blog/, "black logos"/
├── middleware.ts             # (1) wholesale.* subdomain → /wholesale rewrite,
│                             # (2) wholesale route guard (JWT role check, redirects non-approved)
└── wrangler.toml              # Cloudflare Pages config — ⚠️ CONTAINS COMMITTED LIVE SECRETS (§9)

wordpress-plugin/
└── wholesale-admin-manager/   # Custom PHP plugin: roles, admin UI, approve/reject webhooks
    ├── wholesale-admin-manager.php   # role registration (wholesale_pending, wholesale_customer)
    └── includes/
        ├── actions.php               # approve/reject handlers + webhook senders —
        │                             # ⚠️ CONTAINS A HARDCODED SECRET FALLBACK (§9)
        ├── admin-menu.php            # "Wholesale" admin menu + pending-count badge
        ├── applications-page.php     # Applications list + detail modal (approve/reject UI)
        └── approved-customers-page.php  # Read-only approved-customers list + WC order count
```

Repo root also holds the four prior analysis docs (`PROJECT_ARCHITECTURE.md`, `PROJECT_DEEP_ANALYSIS.md`, `PROJECT_OPTIMIZATION_PLAN.md`, `IMPLEMENTATION_TASK_LIST.md`) — see §9 and §6 for how their claims and tracked tasks compare to the current code.

---

## 4. Every Route / Page — Full Inventory

**Retail site (`app/(site)/**`)**

| Route | Purpose | Rendering | Data Source | Notes |
|---|---|---|---|---|
| `/` | Homepage: hero slider + 5 brand product sliders + blog teaser | Server Component, `runtime='edge'`, `revalidate=300` | WPGraphQL: `GET_HOME_HERO_SLIDES` + single combined `GET_HOMEPAGE_BRANDS` query (both `revalidate:300`, matching page-level value — the previously-documented 30-vs-300 conflict is fixed) | Blog teaser is 3 hardcoded identical cards (`[1,2,3].map`), same image/text, dead "LEARN MORE" button — not real data |
| `/about` | Static brand story | Client Component (`runtime='edge'`) | None — hardcoded copy | Static by design |
| `/accessibility-statement` | Accessibility policy | Client Component | None | **All 6 sections are literal Lorem Ipsum placeholder text** |
| `/account` | Logged-in dashboard | Server shell + CSR | `useAuth`/`/api/auth/me`; calls a **non-existent** `/api/auth/resend-verification` | Addresses and "Recent Orders" are hardcoded placeholders (`"No address saved."`, `"No Orders found"`) regardless of real data; several dead `href="#"` links |
| `/account/addresses` | Edit billing/shipping address | Server shell + CSR | `GET/PUT /api/account/addresses` | Real loading/error states; country hardcoded to `'IN'` |
| `/account/login` | Login (duplicate of `/login`) | Server shell + CSR | `POST /api/auth/login` | Shares `LoginClient.tsx` with `/login` — literal duplicate route |
| `/account/orders` | Order history | Client Component, **no fetch at all** | None | Fully unimplemented — "No Orders found" is static text regardless of actual orders |
| `/account/register` | Registration (duplicate of `/register`) | Server shell + CSR | `POST /api/auth/signup` | Shares `CreateAccountClient.tsx` with `/register` |
| `/age-verification` | DOB entry, 21+ check | Client Component | `localStorage` only | Under-21 redirects to `https://www.google.com`; has a `DEV_TEST_MODE` flag duplicated (must stay manually in sync) with the one in `AgeGate.tsx` |
| `/brand/[slug]` | Brand landing page (brands = WC categories) | **Server Component**, own async fetch, `runtime='edge'`, no page-level `revalidate` (per-fetch 3600s/300s) | WPGraphQL `GET_PRODUCT_CATEGORY` + `GET_PRODUCTS_BY_CATEGORY` | Reuses `CategoryPageClient` (no dedicated `BrandPageClient`); breadcrumb parent hardcoded to "Hookah Flavours" for every brand; FAQ block falls back to `hookah-bowls` FAQs for any unmatched slug (wrong content for brand pages) |
| `/business-opportunities` | Wholesale marketing landing page | Client Component | None — hardcoded copy + FAQ | CTA → `/wholesale` |
| `/cart` | Multi-step cart/checkout (5 steps) | Server shell + CSR | Multiple internal `/api/*` routes (see §5) | Fully detailed in §6.3–6.4 |
| `/category/[slug]` | Browse/filter/sort a WC category | **Server Component**, own fetch, `runtime='edge'`, `revalidate=300` | WPGraphQL `GET_PRODUCT_CATEGORY` (3600s) + `GET_PRODUCTS_BY_CATEGORY` (300s, `first:60`) | No pagination at all (hard 60-item cap); filtering/sorting client-side in-memory, not URL-reflected |
| `/contact` | Contact page + form | Client Component | **None — form does not submit anywhere** | `onSubmit` only calls `preventDefault()` and shows a fake "Thank You" state; no email/API call |
| `/cookies` | Stub | Server Component | None | "Coming soon" placeholder, distinct purpose from `/cookies-policy` |
| `/cookies-policy` | Cookies legal page | Client Component | None | All body copy is Lorem Ipsum |
| `/coupons` | Marketing coupon list | Client Component | None — 21 hardcoded coupon objects | Copy-to-clipboard only; codes not checked against real WooCommerce coupons |
| `/faqs` | FAQ accordion | Client Component | None | All 5 entries are Lorem Ipsum |
| `/forgot-password` | Password reset request | Server shell + CSR | `POST /api/auth/forgot-password` | Well-built (resend cooldown, real states) |
| `/hookahs` | Full hookahs listing | Server Component, `runtime='edge'`, TTL `0` (always revalidates) | WPGraphQL `GET_PRODUCTS_BY_CATEGORY` (hardcoded `slug:'hookahs'`) | Reuses `CategoryPageClient` but fabricates the category object instead of calling `GET_PRODUCT_CATEGORY`; caching inconsistent with `/category/[slug]` |
| `/hookahs/shop-by-brand` | Brand tiles | Server shell delegating to `ShopByBrandClient.tsx` | None — hardcoded `brands` array + Lorem Ipsum FAQ | "SHOP NOW" buttons have no href/onClick |
| `/hookahs/shop-by-bundle` | Curated bundles | Server shell delegating to `ShopByBundleClient.tsx` | None — hardcoded, reuses shop-by-brand images | Same Lorem Ipsum FAQ pattern; dead CTAs |
| `/hookahs/shop-by-price` | Price-tier browsing | Server Component, fetches, delegates to `CategoryPageClient` | WPGraphQL (hardcoded `slug:'hookahs'`, TTL `0`) | A sibling `ShopByPriceClient.tsx` (hardcoded `$`-price tiles) exists but is **never imported/wired up** — dead file |
| `/login` | Login | Server shell + CSR | `POST /api/auth/login` | Identical to `/account/login` |
| `/offers` | Marketing offers list | Client Component | None — 4 hardcoded offer cards | Static |
| `/order-received` | Order confirmation | Client Component, reads `sessionStorage` | `sessionStorage['hookah_order_receipt']` (written by cart checkout) | No fallback fetch-by-order-id if session storage is lost/cleared; redirects to `/` if missing |
| `/outlet` | Stub | Server Component | None | "Clearance items coming soon" |
| `/privacy-policy` | Privacy policy | Client Component | None | Lorem Ipsum for all 12 sections; contains a literal corrupted-ligature typo (`ﬁrmly`) and an apparent copy-paste domain artifact |
| `/product/[slug]` | Product detail | **Server Component**, own async fetch, `runtime='edge'`, `revalidate=300` | WPGraphQL `GET_PRODUCT_DETAIL` | Real ISR fetch (this replaced a prior fully-CSR implementation — see §9). `generateMetadata` does **not** use fetched product data (slug-to-title-case only); no `regularPrice`/`salePrice` fetched (no sale-price UI possible); variation matching uses fragile substring matching on the variation's auto-generated `name`, not structured attributes; only a single product image is ever fetched (gallery nav arrows are `disabled`, explicitly "cosmetic") |
| `/register` | Registration | Server shell + CSR | `POST /api/auth/signup` | Identical to `/account/register` |
| `/reset-password` | Set new password via emailed token | Server shell + CSR, wrapped in `<Suspense>` | `POST /api/auth/reset-password` | Auto-redirects to `/` 3s after success |
| `/rewards` | Rewards/loyalty marketing page | Server Component sets real `metadata`; Client Component body | None — fully static | "Sign Up"/"Log In"/referral buttons have no handlers at all; account sidebar links to `/account/rewards`, which **does not exist** (404) |
| `/search` | Dedicated search-results page | Server Component | None | "Coming soon" stub — the actual working search UI lives in the header's `LiveSearch` dropdown, not this page |
| `/shipping-and-returns` | Shipping/returns policy | Client Component | None | Lorem Ipsum for all 4 sections |
| `/shisha-tobacco` | Redirect stub | Server Component | None | Immediate `redirect('/shisha-tobacco/al-fakher')`, no fallback for other brands |
| `/shisha-tobacco/al-fakher` + `/al-fakher/[slug]` | Al Fakher–specific listing/detail | Client Component | **Hardcoded mock dataset** (`al-fakher-products.ts`), explicit code comment "Replace with live GraphQL fetch when ready" | Entirely separate from the real `/category`/`/product` GraphQL-backed flow — this sub-tree runs on fake data with its own hardcoded `FLAVOR_OPTIONS/SIZE_OPTIONS/TYPE_OPTIONS/PRICE_OPTIONS` filters |
| `/snoop-dogg` | Stub | Server Component | None | "Coming soon" placeholder |
| `/terms-and-conditions` | T&C legal page | Client Component | None | Lorem Ipsum for all 11 sections — **but** a second, fully-written, non-Lorem T&C block already exists inline inside `CartPageClient.tsx`'s age-verification step, creating two divergent sets of terms content in the codebase |
| `/track` | Order tracking (order-number lookup) | Client Component | Real, live: `POST /api/shiprocket/track` → real Shiprocket API | Fully functional end-to-end (status card + timeline + empty/error states) but **completely orphaned** — no link to it anywhere in header, footer, mobile menu, or account pages |
| `/verify-email` | Email verification result display | **Client Component page.tsx itself** (only one in this set), wrapped in `<Suspense>` | None — reads a `status` query param, renders one of 4 static messages | Correct pattern: actual verification happens server-side in the API route before redirect here |

**Wholesale site (`app/wholesale/**`, subdomain-routed)**

| Route | Purpose | Rendering | Data Source | Notes |
|---|---|---|---|---|
| `/wholesale` | Wholesale homepage | Server Component | WPGraphQL `GET_WHOLESALE_HERO_SLIDES` (own WP page, added recently per commit `be04cdc`) + shared brand products query | Mirrors retail homepage structure |
| `/wholesale/login` | Wholesale login | Server shell + CSR | `POST /api/auth/login` (same endpoint, role-gated) | Blocks `wholesale_pending` (403) |
| `/wholesale/register` | Wholesale application form | Server shell + CSR | `POST /api/auth/signup` (wholesale branch) | 202 response, no session cookie issued — user must wait for admin approval |
| `/wholesale/auth` | Post-registration document upload step | Server shell + CSR | `POST /api/wholesale/upload-documents` | Real multipart upload (GST cert, business license, optional ID) to WP Media Library |
| `/wholesale/reset-password` | Wholesale password reset | Server shell + CSR | `POST /api/auth/reset-password` | Shared logic with retail reset flow |
| `/wholesale/account` | Wholesale dashboard | Server Component (session-gated, `redirect` if unauthenticated) | `getServerSession()` | Shows pending/approved state messaging |
| `/wholesale/account/business` | Business profile (GST, company info) | Server Component (session-gated) + `WholesaleBusinessClient` | Session data | Small (52-line) client component |
| `/wholesale/account/orders` | Wholesale order history | Server Component (session-gated) + `WholesaleOrdersClient` | None — no fetch found | **Static placeholder**, same non-implementation as retail `/account/orders` |
| `/wholesale/account/saved` | "Saved Products" | Server Component (session-gated) + `WholesaleSavedClient` | None | **Static empty-state only** ("No saved products yet") — no save/fetch logic anywhere; effectively a wishlist feature that was never built beyond the empty state |
| `/wholesale/product/[slug]` | Wholesale product detail (gated pricing) | Server/Client (product data + role gating) | WPGraphQL + `useWholesaleSession` role check | Pricing/purchase UI gated on `role === 'wholesale_customer'`, server-verified via JWT, not client-trusted |

**Blog (`app/blog/**`)**

| Route | Purpose | Rendering | Data Source | Notes |
|---|---|---|---|---|
| `/blog` | Post list | Server Component, `revalidate=600` | WPGraphQL `GET_POSTS_QUERY` (`first:50`) + `GET_CATEGORIES_QUERY`, `Promise.allSettled` (graceful partial failure) | Real data, no placeholders |
| `/blog/[slug]` | Single post | Server Component, `revalidate=3600`, uses `React.cache()` to dedupe fetch between `generateMetadata` and body | WPGraphQL `GET_POST_QUERY` + related-posts `GET_POSTS_QUERY` | `notFound()` on missing slug; real data |
| `/blog/category/[slug]` | Category-filtered post list | Server Component, `runtime='edge'`, per-fetch `revalidate=3600` | WPGraphQL `GET_CATEGORY_POSTS_QUERY` | Comment notes `generateStaticParams` intentionally omitted (incompatible with edge runtime) |

**Total: ~39 retail routes + 10 wholesale routes + 3 blog routes ≈ 52 routes**, all confirmed by direct file reads.

---

## 5. Every API Route — Full Inventory

| Endpoint | Method | Purpose | Calls Out To | Auth | Notes |
|---|---|---|---|---|---|
| `/api/account/addresses` | GET, PUT | Fetch/update customer address | WooCommerce REST (`customers/{id}`, raw `fetch`) | Session cookie | Trusts `session.sub` directly as WC customer ID; no input-shape validation on PUT |
| `/api/admin/test-wp-auth` | GET | Debug: test WP Application Password creds | WordPress REST v2 | **None** | Explicitly commented "Temporary debug endpoint... DELETE after confirming wholesale signup works" — still present, leaks env-var presence/length publicly |
| `/api/auth/check-email` | POST | Check if a customer account exists | WooCommerce REST | None | `runtime='edge'`; stale comment claims non-edge; rate-limit profile defined but unused |
| `/api/auth/forgot-password` | POST | Send password-reset email | WC REST, Resend | None | Always 200 (anti-enumeration) |
| `/api/auth/login` | POST | Authenticate, enforce wholesale gating, issue session JWT | WPGraphQL (`graphqlLogin`), WC REST | None (issues cookie) | Blocks `wholesale_pending` (403); solid role-check logic |
| `/api/auth/logout` | POST, GET | Clear session cookie | None | Cookie (to clear) | **GET variant has an open-redirect risk** via unvalidated `?redirect=` param |
| `/api/auth/me` | GET | Return current session claims | None | Session cookie | Clean, minimal |
| `/api/auth/reset-password` | POST | Set new password via reset JWT | WC REST | Reset JWT (body) | Good server-side password-complexity validation |
| `/api/auth/signup` | POST | Register retail or wholesale customer | WPGraphQL, WC REST, WP REST v2, Resend, Brevo | None | Wholesale role/meta writes explicitly non-fatal/best-effort |
| `/api/auth/verify-email` | GET | Verify email, refresh session cookie | WC REST | Verification JWT (query) | Redirect-based |
| ~~`/api/auth/resend-verification`~~ | — | — | — | — | **Referenced by the UI but does not exist** — `AccountPageClient.tsx` calls this and gets a silent 404 |
| `/api/coupons/validate` | POST | Client-facing coupon check for cart display | WooCommerce REST (raw `fetch`, duplicate logic vs. `complete-order`) | None | Logic re-implemented (not shared) in `complete-order/route.ts` — drift risk |
| `/api/newsletter/subscribe` | POST | Subscribe email to Brevo list | Brevo API | None | Basic regex validation only |
| `/api/payment/complete-order` | POST | Verify Razorpay signature, re-validate coupon, create WC order, fire non-blocking Shiprocket shipment | Razorpay (HMAC verify only), WooCommerce REST, Shiprocket (via internal HTTP call, not direct import) | None (guest-checkout compatible) | Signature verification **soft-fails** (console error only) if `RAZORPAY_KEY_SECRET` is unset; shipping cost is **not** re-validated server-side (unlike coupons); package weight/dimensions are hardcoded magic numbers duplicated client- and server-side |
| `/api/payment/create-order` | POST | Create Razorpay order | Razorpay REST API | None | Minimum-amount check present |
| `/api/search` | GET | Server-side proxy to WPGraphQL search | WPGraphQL | None | `mode=wholesale` is a client-supplied query param **not gated by session** — anyone can request wholesale search results |
| `/api/shipping/methods` | POST | WooCommerce shipping-zone based rates | WooCommerce REST (`wcGetCached`, 30-min cache) | None | **Orphaned/dead code** — no frontend caller found; fully superseded by `/api/shipping/rates` |
| `/api/shipping/rates` | POST | Live Shiprocket courier rates for a postcode | Shiprocket API | None | Falls back to a flat ₹40 "Standard Shipping" on any Shiprocket error or zero results — checkout never blocks, but the client can't tell real vs. fallback |
| `/api/shiprocket/create-shipment` | POST | Create a Shiprocket adhoc order/shipment | Shiprocket API | **None at all** | Publicly callable with no auth — could be used to spam the Shiprocket account with fake shipments |
| `/api/shiprocket/track` | POST | Live tracking lookup by order number | Shiprocket API | None (public by design — used by `/track`) | Assumes orders were tagged `WC-<orderNumber>` in Shiprocket; coarse error handling (all failure modes collapse to one generic 500) |
| `/api/wholesale/approved` | POST | Webhook: send wholesale-approved email | Resend | **Bearer `WHOLESALE_WEBHOOK_SECRET`, hard-enforced** | Fails closed (500) if secret unset; 401 on mismatch — confirmed NOT vulnerable (see §9) |
| `/api/wholesale/rejected` | POST | Webhook: send wholesale-rejected email | Resend | Same as above | Same hard-fail-closed pattern |
| `/api/wholesale/upload-documents` | POST | Upload KYC documents | WordPress REST v2 (media), WC REST (meta) | None visible — trusts client-supplied `customerId` | No ownership check tying the caller to `customerId` |

**Shiprocket integration — net assessment:** live and wired into checkout, not a stray addition. `CartPageClient.tsx`'s `ShippingMethodCard` calls `/api/shipping/rates` with a crude flat `0.5kg × quantity` weight estimate; the selected rate flows into `complete-order`, which uses it directly in the WooCommerce order's `shipping_lines` **without re-validation** — a client could tamper with the shipping cost before submission. After the WC order is created, `complete-order` fires an unauthenticated, fire-and-forget POST to `/api/shiprocket/create-shipment` (`.catch()`-only error handling) — a WC order can succeed with silently no Shiprocket shipment created.

---

## 6. Core Feature Inventory — Done / Partial / Missing

| Feature | Status | Detail |
|---|---|---|
| **Product catalog browsing** | Partial | Size/brand filter *options* are genuinely derived from live product attributes (`CategoryPageClient.tsx`); price-bucket ranges are hardcoded labels; the **Brand filter pill is rendered but non-functional** (no `onClick`, not wired into the filter pipeline); Material/Type filters don't exist. Sorting only implements `price-asc/desc/name-asc` — "Popularity" and "Newest" are inert (no matching `case`). No pagination anywhere (`first:60` hard cap). Live search (`LiveSearch.tsx`) is real: debounced, proxied through `/api/search`, uses `router.push` not `window.location.href`. |
| **Product detail page** | Done | `app/(site)/product/[slug]/page.tsx` does a real server-side ISR fetch (`revalidate=300`) and calls `notFound()` before the client component ever mounts — this is a genuine fix versus the previously-documented fully-CSR implementation. Gaps: no sale-price data fetched, no per-variation stock status, fragile substring-based variation matching, single product image only. |
| **Cart (retail + wholesale)** | Partial | One shared `CartProvider` component parameterized by `storageKey` (`'cart'` vs `'wholesale_cart'`) — no separate wholesale cart code. Price stored/parsed as a formatted string via inline regex (`parseFloat(item.price.replace(/[^0-9.-]+/g,''))`), duplicated independently in `CartProvider.tsx`, `CategoryPageClient.tsx`, and `AlFakherClient.tsx`. **No stock validation anywhere** — quantity can be incremented past available stock with no cap. `addToCart` uses a proper named `CartableProduct` interface (not `any`). |
| **Checkout & payment (Razorpay)** | Done, with gaps | Full 5-step flow (`step1`–`step5`: auth → address → shipping method → age verification → payment) implemented as explicit string-literal state transitions, not numeric increments. Razorpay signature verified server-side via Web Crypto HMAC-SHA256; coupon discount re-validated server-side against WooCommerce (ignoring client value); real WC order created via `wcPost`. Gaps: shipping cost is **not** re-validated server-side (see §5); signature verification soft-fails if the secret env var is missing; shipment creation is unauthenticated and fire-and-forget. |
| **Retail account** (register/login/verify/forgot/reset/logout) | Done, one broken link | All six flows are fully implemented against real WPGraphQL/WooCommerce identities, session JWT in httpOnly cookie. The one gap: the account page's "Resend verification email" button calls `/api/auth/resend-verification`, which **does not exist** — silent 404 in production. |
| **Wholesale account** (register, doc upload, approval/rejection webhooks, gated pricing) | Done | Registration → 202 (no session) → document upload (real WP Media upload) → admin approves/rejects in WP admin (custom plugin) → webhook fires to Next.js → email sent. Webhook secret enforcement is **correctly hard-fail-closed** (confirmed by direct code read, not vulnerable despite `IMPLEMENTATION_TASK_LIST.md` TASK-001 still being unchecked — the fix has existed since the file's first commit). Wholesale pricing/purchase UI is gated on a server-verified JWT role, not a client-trusted flag. |
| **Age verification gate** | Partial | `AgeGate.tsx` is a real, effectively-un-dismissible, `localStorage`-persisted blocking modal, correctly wired into `app/(site)/layout.tsx`. Gap: it only wraps the `(site)` route group — **`/wholesale/*` and `/blog/*` are not behind the gate at all** (separate layouts, no `AgeGate` import). A second, unused, 309-line duplicate component (`AgeVerification.tsx`) exists as dead code. |
| **Blog** | Done (list/detail), broken (homepage teaser) | `/blog` and `/blog/[slug]` are real, ISR-cached, WPGraphQL-backed, with `notFound()` handling and request-level dedup via `React.cache()`. The **homepage's blog teaser section is 100% hardcoded** — 3 identical static cards, same image, same "How to Hookah?" text, dead CTA button — completely disconnected from the working blog data layer one click away. |
| **Homepage sections** | Mostly Done | Hero slider is ACF-driven with a sane single-slide fallback (not 3 hardcoded slides as previously documented). All 5 brand product sliders (`Al Fakher`, `Afzal`, `Royal Smoking`, `Oduman`, `Mya`) are now fetched server-side in **one combined `GET_HOMEPAGE_BRANDS` query** (fixing the previously-documented 5-independent-client-fetch problem). Only the blog teaser (above) remains hardcoded. |
| **Header/nav (desktop + mobile), footer** | Partial | Nav/footer link maps resolve to real, existing routes in the vast majority of cases. Confirmed broken (`href="#"`) links: both social icons (Instagram, YouTube) sitewide, blog header/footer social icons, Terms/Privacy links inside the checkout flow, "View All" order-history links, and "Log in/Create Business Account" links in the retail login/register pages (which ignore that `/wholesale/login`/`/wholesale/register` already exist). Footer contact info (US phone number, `support@hookah.com`, a Charlotte, NC address) looks like unedited template boilerplate inconsistent with the actual `.in` domain. `Footer.tsx` is a 703-line monolith mixing icons, nav data, and a newsletter form in one file. Several mega-menu columns are empty placeholders pending real sub-category content. |
| **Theme (dark/light mode)** | Done | Fully implemented: `hookah-theme` localStorage key, `data-dark` attribute on `<html>`, a blocking inline script in the root layout to prevent flash-of-wrong-theme pre-hydration, plus inline critical CSS. Exported function is `toggleDark` (not `toggleTheme` as older docs assumed) — confirmed the real, current name. Used pervasively (50+ files). |
| **Loyalty/rewards** | Placeholder | `/rewards` is a fully static marketing page — no `onClick` handlers on any CTA, all point/tier numbers are hardcoded, no backend points ledger exists. Sidebar links to a non-existent `/account/rewards` route. |
| **Reviews** | Missing | Zero product-review UI/backend anywhere. Only a dead "Reviews" nav label (`href="#"`) in the blog header. |
| **Wishlist** | Missing (retail) / Empty-state stub (wholesale) | No wishlist feature exists on the retail side at all. The wholesale "Saved Products" page renders only a static "No saved products yet" empty state with zero save/fetch logic behind it. |
| **Coupons** | Split | Cart-side coupon application is real (validated against live WooCommerce coupons both client-display-side and, independently, server-side at order completion). The dedicated `/coupons` marketing page is a static list of 21 hardcoded codes with copy-to-clipboard only — not verified against what's actually active in WooCommerce. |
| **Offers** | Placeholder | `/offers` is 4 hardcoded static cards, no data fetching. |
| **Subscriptions** | Missing | No recurring/subscription-product feature anywhere in the codebase. |
| **Order tracking (`/track`)** | Partial | Fully functional, real Shiprocket-backed tracking UI (status card + timeline + empty/error states) — but **zero navigation paths lead to it** (not in header, footer, mobile menu, or account/orders). A customer can only reach it by typing the URL directly. |

**Cross-reference against `IMPLEMENTATION_TASK_LIST.md` (31 tracked tasks, all 31 checkboxes still show `- [ ]`):** the checklist itself is stale and does not reflect actual progress — code-level verification shows most of Phase 1 and several Phase 2/3 items are **already implemented** despite the unchecked boxes:

| Task | Checklist status | Actual code status |
|---|---|---|
| TASK-001 Enforce webhook secret | ☐ Unchecked | **Done** — hard-fail-closed pattern confirmed, present since the file's first commit |
| TASK-002 Product pages CSR→ISR | ☐ Unchecked | **Done** — real server fetch + `revalidate=300` |
| TASK-003 Remove hardcoded hero slides | ☐ Unchecked | **Done** — single ACF-or-fallback slide, not 3 hardcoded slides |
| TASK-004 Enable image optimization | ☐ Unchecked | **Done** — no `unoptimized: true`; scoped `remotePatterns` in place |
| TASK-005 Combined homepage brands query | ☐ Unchecked | **Done** — `GET_HOMEPAGE_BRANDS` |
| TASK-006 Brand fetches server-side | ☐ Unchecked | **Done** |
| TASK-007 Fix hero revalidate conflict | ☐ Unchecked | **Done** — both at 300s |
| TASK-008 `/api/search` proxy route | ☐ Unchecked | **Done** |
| TASK-009 `React.memo` on ProductCard | ☐ Unchecked | **Done** |
| TASK-010 Split CartProvider into actions/state contexts | ☐ Unchecked | **Not verified as done** — still one combined context in the file read |
| TASK-011 Fix HeroSlider autoplay interval reset | ☐ Unchecked | **Still broken** — `[isPaused, isTransitioning]` dependency still re-creates the interval every transition |
| TASK-012/023 Remove `useTheme` from ProductCard | ☐ Unchecked | **Done** — `useTheme` no longer among ProductCard's imports |
| TASK-014 Cache shipping methods | ☐ Unchecked | **Done** (`wcGetCached`, 30 min) — but the endpoint itself is now orphaned/dead code (superseded by Shiprocket) |
| TASK-015 `router.push` in search | ☐ Unchecked | **Done** |
| TASK-017 Centralize GraphQL queries | ☐ Unchecked | **Done** (mostly) — one dead unused query (`GET_PRODUCTS_BY_TAG`) remains |
| TASK-018 Real category filters | ☐ Unchecked | **Partial** — size/brand derived from real attributes, price/FAQ still hardcoded, brand filter UI non-functional |
| TASK-020 `CartableProduct` interface | ☐ Unchecked | **Done** |
| TASK-021 Refactor Footer | ☐ Unchecked | **Not done** — still 703 lines, monolithic |
| TASK-024 Extract slider dimension utils | ☐ Unchecked | **Done** — `lib/utils/slider-dims.ts` exists |
| TASK-025 Rate limiting on auth routes | ☐ Unchecked | **Built but dead code** — `lib/rate-limit.ts` exists with real profiles, never imported by any route; also architecturally incompatible with Edge runtime as currently deployed |
| TASK-026 Env var startup validation | ☐ Unchecked | **Built but dead code** — `lib/env-check.ts` exists with a real `validateEnv()`, but it is never imported/called from `app/layout.tsx` or anywhere else |
| TASK-027 Soft email verification enforcement | ☐ Unchecked | **Not done** — `emailVerified` only drives a cosmetic account-page banner, gates nothing |
| TASK-028 CSP headers for Razorpay | ☐ Unchecked | **Not done** — no CSP headers found anywhere; git history shows a commit literally titled "CSP removed" |
| TASK-029 Remove dev console.log | ☐ Unchecked | **Not done** — console logging remains widespread across API routes |

*(Tasks not listed above — TASK-013, 016, 019, 022, 030, 031 — were not independently re-verified this pass; treat their checklist status as unknown rather than assumed-true or assumed-false.)*

---

## 7. WordPress / WooCommerce Integration Detail

### GraphQL queries and inferred required plugins

All WPGraphQL query strings live in exactly one file, `frontend/lib/graphql/index.ts` (no `gql` tagged-template convention used — plain string literals):

| Query | Purpose | Implies |
|---|---|---|
| `CONSUMER_SEARCH_QUERY` / `WHOLESALE_SEARCH_QUERY` | Live search (retail / wholesale, filtered by a `showInWholesale` custom meta/field) | WPGraphQL, WooGraphQL product schema |
| `GET_POSTS_QUERY`, `GET_CATEGORIES_QUERY`, `GET_POST_QUERY`, `GET_ALL_SLUGS_QUERY`, `GET_CATEGORY_POSTS_QUERY` | Blog | WPGraphQL core `Post`/`Category` types |
| `GET_HOME_HERO_SLIDES`, `GET_WHOLESALE_HERO_SLIDES` | ACF `heroSlider` repeater (fields: `slideImage`, `mobileImage`, `badgeText`, `title`, `description`, `buttonText`, `buttonLink`) on the Home / Wholesale-Home WP pages | **WPGraphQL for ACF** (ACF fields wouldn't otherwise be exposed to GraphQL), **ACF** itself |
| `GET_PRODUCTS_BY_CATEGORY`, `GET_PRODUCT_CATEGORY` | Category/brand product listings | WooGraphQL (`Product`, `SimpleProduct`, `VariableProduct`, `ProductCategory` types) |
| `GET_PRODUCTS_BY_TAG` | Defined "for brand pages" per its own comment — **dead code**, brand pages actually use `GET_PRODUCTS_BY_CATEGORY** | — |
| `GET_PRODUCT_DETAIL` | Product detail page | WooGraphQL; notably omits `regularPrice`/`salePrice` and per-variation `attributes`/stock that the category queries do fetch — an inconsistency, not a missing plugin |
| `GET_HOMEPAGE_BRANDS` | 5 brand-aliased product blocks batched into one query document (no GraphQL fragments used — the same field selection is repeated 5×) | WooGraphQL |

A separate file, `lib/auth/auth-graphql.ts`, defines its own `gql()` helper and the `registerCustomer`/`login`/`CheckUser` operations — implying **WPGraphQL JWT Authentication** (for the `login` mutation) and **WooGraphQL's `registerCustomer` mutation** specifically (not just generic WPGraphQL user creation).

**Inferred required WordPress plugin stack:** WPGraphQL (core), WPGraphQL for ACF, WPGraphQL JWT Authentication, WooCommerce, WooGraphQL (WPGraphQL for WooCommerce), Advanced Custom Fields, plus the custom Wholesale Admin Manager plugin below.

### Custom plugin — Wholesale Admin Manager (`wordpress-plugin/wholesale-admin-manager/`, v4.1)

**Roles registered** (`wholesale-admin-manager.php`, re-registered idempotently on every `init` — comment explains this is a deliberate root-cause fix because WooCommerce's REST API silently drops role updates to roles it doesn't recognize):

| Role | Capabilities | Meaning |
|---|---|---|
| `wholesale_pending` | `read` only | Application submitted, awaiting admin review |
| `wholesale_customer` | `read` (WooCommerce layers on `wc_*` capabilities separately) | Approved wholesale account |

Roles are **never removed on deactivation** — explicit comment notes this would corrupt existing users' role assignments.

**Customer meta fields written/read** (cross-confirmed identical key names on both the PHP admin side and the Next.js `lib/woocommerce/wholesale.ts` writer side):

| Meta key | Written by | Purpose |
|---|---|---|
| `business_name`, `business_address`, `business_phone`, `gst_number`, `business_website` | Next.js signup (`wcSetWholesaleMeta`) | Business profile info from the wholesale application form |
| `gst_certificate_url`, `business_license_url`, `identity_document_url` | Next.js document upload (`/api/wholesale/upload-documents`) | URLs of uploaded KYC documents in WP Media Library |
| `wholesale_approved_date`, `wholesale_approved_by` | WP plugin, on approve | Audit trail |
| `wholesale_rejected_date`, `wholesale_rejected_by` | WP plugin, on reject | Audit trail |

**Admin UI:** a top-level "Wholesale" menu (position 56, just after WooCommerce) with a live pending-count red badge, and two sub-pages:
- **Applications** (`applications-page.php`) — a `WP_User_Query`-backed, paginated (20/page), email-searchable table of `wholesale_pending` users, with a detail modal (vanilla JS, no framework) showing full business info + document links, and inline Approve/Reject forms (each nonce-protected, `manage_woocommerce`-capability-gated).
- **Approved Customers** (`approved-customers-page.php`) — read-only list of `wholesale_customer` users with a per-customer WooCommerce order count (HPOS-compatible via `wc_get_orders()`).

**Webhooks fired to the Next.js frontend:**

| Trigger | Endpoint | Method | Auth | Payload |
|---|---|---|---|---|
| Admin clicks "Approve" (`admin_post_approve_wholesale_user`) | `https://thehookahstore.in/api/wholesale/approved` | POST | `Authorization: Bearer <secret>` | `{ userId, email, name }` |
| Admin clicks "Reject" (`admin_post_reject_wholesale_user`) | `https://thehookahstore.in/api/wholesale/rejected` | POST | Same | Same shape |

`wp_remote_post()` is called **without** `'blocking' => false`, so it defaults to synchronous/blocking with a 10-second timeout — it completes (or times out) before the subsequent `wp_safe_redirect()`/`exit`. The previously-documented risk of the redirect terminating PHP before the webhook POST finishes **does not apply** to the current code.

**⚠️ Critical finding:** both webhook-sending functions (`actions.php` lines 61 and 206) hardcode a **fallback secret literal directly in the PHP source**, used whenever the `WAM_WEBHOOK_SECRET` `wp-config.php` constant isn't defined. This value is committed to git history. See §9 for full detail and required remediation — the value itself is intentionally not reproduced in this document.

---

## 8. Auth & Session Model

**Retail lifecycle:**
1. **Register** (`/api/auth/signup`) → `graphqlCheckEmailExists` + `graphqlRegisterCustomer` (WooGraphQL) creates a real WP/WC user → session JWT issued in an httpOnly cookie → welcome + verification emails sent via Resend.
2. **Login** (`/api/auth/login`) → `graphqlLogin` (WPGraphQL JWT Auth plugin) authenticates → WooCommerce role/meta cross-checked for wholesale gating → session JWT issued.
3. **Session storage:** `hookah_session` httpOnly cookie, `secure` in production, `sameSite: 'lax'`. The JWT itself is **signed but not encrypted** — `email`, `firstName`, `role` are base64-decodable by anyone with the cookie (not forgeable without the signing secret, but readable).
4. **Session verification (server):** `getServerSession()` reads the cookie, `jose.jwtVerify()` with HS256.
5. **Session verification (middleware):** `middleware.ts` independently re-implements JWT verification for the wholesale route guard, with a **hardcoded fallback signing secret** (`'hookah-dev-secret-change-in-production'`) used if `JWT_SECRET` is unset in the environment — a real risk if that env var is ever missing in production (see §9).
6. **Client-side auth state:** `AuthProvider` fetches `/api/auth/me` once (module-level singleton), exposing `role`, `userId`, `emailVerified`, `email`, `firstName`, `lastName`. The JWT itself never touches client JS — only decoded fields returned by `/api/auth/me`.
7. **Email verification:** issued as a field (`emailVerified: false` at signup) and plumbed through the session, but **enforced nowhere** — its only consumer is a dismissible informational banner on the account page (`AccountPageClient.tsx`). No route, page, or checkout step checks it.
8. **Password reset:** separate short-lived JWT (1 hour) emailed via Resend, verified server-side, WC password updated via `wcPut`.
9. **No refresh/sliding-window behavior:** the session JWT has a fixed expiry (7 days per prior documentation, not independently re-timed this pass) and is not renewed on activity.
10. **No token revocation mechanism:** a stolen/leaked session token remains valid until its fixed expiry.
11. **Rate limiting:** a complete `checkRateLimit()` implementation with per-endpoint profiles exists (`lib/rate-limit.ts`) but is **never imported by any route** — every auth route currently runs on `runtime='edge'`, which the rate-limiter's own code comment flags as architecturally incompatible with its in-memory `Map` approach (Edge isolates don't share module state across invocations). **Net effect: no functioning rate limiting exists today on any auth endpoint.**

**Wholesale lifecycle** additionally requires admin approval between registration and first successful login (see §7); the approval decision is made by a human in WP Admin, not by any Next.js code, and the resulting role is baked into the JWT server-side at next login — client code never decides or trusts its own wholesale status.

---

## 9. Known Issues, Bugs, and Risks — Consolidated & Re-Verified

### 🔴 Critical — committed secrets (new findings this pass, not in prior docs)

| # | Finding | File | Status |
|---|---|---|---|
| S1 | `frontend/wrangler.toml` (git-tracked, `[vars]` block) contains a live **WooCommerce Consumer Key and Consumer Secret**, plus a **Razorpay Key ID**, committed in plaintext to git history. | `frontend/wrangler.toml` | **Live in git history — rotate both the WooCommerce API key pair and confirm whether the Razorpay key is test or live, immediately** |
| S2 | `wordpress-plugin/wholesale-admin-manager/includes/actions.php` (lines 61, 206) hardcodes a **fallback webhook secret literal** directly in PHP source, used whenever the `WAM_WEBHOOK_SECRET` wp-config constant is undefined. Confirmed present since the file's first commit (`f0dd6fb`). | `actions.php:61,206` | **Live in git history — rotate `WHOLESALE_WEBHOOK_SECRET` on both the Next.js env and the WP `wp-config.php` constant, then redeploy both sides together** |
| S3 | `middleware.ts` falls back to a **hardcoded dev JWT signing secret** (`'hookah-dev-secret-change-in-production'`) if `JWT_SECRET` is unset. | `middleware.ts:37-39` | Low likelihood in a working deployment (env var is presumably set), but worth an explicit startup check rather than a silent fallback |

*(Neither S1 nor S2's actual secret values are reproduced anywhere in this document, per standard practice — only their existence and location.)*

### Re-verification of `PROJECT_DEEP_ANALYSIS.md` claims (~30 checked)

| # | Claim | Verdict | Detail |
|---|---|---|---|
| 1 | Product detail page fully CSR, no ISR | **FIXED** | Real server-side `fetchGraphQLSafe` + `revalidate=300`; `notFound()` runs server-side |
| 2 | ProductSlider fetches GraphQL client-side | **FIXED** | Now a pure presentational component receiving `products` as a prop |
| 3 | LiveSearch fetches GraphQL client-side, duplicating queries | **FIXED** | Proxies through `/api/search`; queries live only in `lib/graphql/index.ts` |
| 4 | Hero slides `revalidate:30` vs. page `revalidate:300` conflict | **FIXED** | Both now `300`, self-documented in a code comment |
| 5 | Homepage blog section hardcoded | **STILL PRESENT** | 3 identical static cards, dead CTA |
| 6 | `ThemeProvider` exports `toggleDark` not `toggleTheme` | **STILL PRESENT (confirmed, not a bug)** | This is simply the current, correct name |
| 7 | Category filters hardcoded, non-functional | **CHANGED (nuanced)** | Size/brand are now real attribute-derived data; price buckets and FAQ copy remain hardcoded; Brand filter pill is rendered but has no `onClick`/effect. A separate `AlFakherClient.tsx` page still runs entirely on a hardcoded mock dataset. |
| 8 | 3 hardcoded hero slides always show before ACF | **FIXED (changed to a graceful fallback)** | Now exactly one fallback slide, used only when ACF returns zero slides |
| 9 | `WHOLESALE_WEBHOOK_SECRET` not required (fail-open) | **FIXED** | Both webhook routes hard-fail-closed (500 if unset, 401 on mismatch) — see S2 above for the separate, still-live *committed-secret* issue, which is a different problem from the enforcement logic |
| 10 | No rate limiting on auth routes | **STILL TRUE, but for a new reason** | Rate-limit code now exists but is unused dead code, and is Edge-runtime-incompatible as currently deployed |
| 11 | Email verification not enforced | **STILL PRESENT** | Only a cosmetic account-page banner |
| 12 | `unoptimized: true` disables all image optimization | **FIXED** | No such flag; scoped `remotePatterns` enables real optimization |
| 13 | HeroSlider autoplay interval re-subscribes every transition | **STILL PRESENT** | `[isPaused, isTransitioning]` dependency array unchanged |
| 14 | Cart price stored as display string, parsed via regex | **STILL PRESENT** | Now confirmed independently duplicated in 3 places (`CartProvider.tsx`, `CategoryPageClient.tsx`, `AlFakherClient.tsx`), not the 2 originally documented |
| 15 | Public GraphQL endpoint, no auth/depth limiting | **COULD NOT VERIFY** | Server-side WPGraphQL configuration is outside this repo's visibility |
| 16 | ProductCard re-renders on every cart/theme change (no memo) | **FIXED** | `React.memo(ProductCard)` now applied; `useTheme` removed from its imports entirely |
| 17 | Shipping zones re-fetched uncached every checkout | **FIXED (caching) / superseded (shape)** | `wcGetCached` 30-min cache added, but the whole endpoint is now dead code — checkout uses the new Shiprocket-based `/api/shipping/rates` instead |
| 18 | WordPress webhook may not complete before redirect terminates PHP | **FIXED (was never actually broken)** | `wp_remote_post()` defaults to blocking; no `blocking:false` override exists, so it completes before `wp_safe_redirect()` |

### New issues found this pass (not in any prior doc)

- **`/api/shiprocket/create-shipment` has zero authentication** — publicly callable, could be abused to create spurious Shiprocket orders.
- **Shipping cost is never re-validated server-side** at order completion, unlike coupon discounts, which are — a client could tamper with the shipping price before submitting checkout.
- **`/api/auth/resend-verification` is called by the UI but does not exist** — the account page's resend button silently 404s.
- **`/api/search?mode=wholesale` is not session-gated** — any anonymous request can retrieve wholesale-only search results by passing the query param directly.
- **`/api/auth/logout` (GET variant) has an open-redirect risk** via an unvalidated `?redirect=` parameter.
- **`/api/admin/test-wp-auth`** is a leftover debug endpoint with no auth, explicitly commented as temporary, never removed.
- **`lib/env-check.ts`'s `validateEnv()` is never called** — despite a doc comment saying it should run at the top of `app/layout.tsx`, it isn't imported anywhere, so missing required env vars won't fail the build/boot as intended.
- **`/track` order-tracking page has no navigation entry point anywhere in the site.**
- **`/account/rewards` is linked from the account sidebar but does not exist** (404).
- **Two independent sets of Terms & Conditions content exist** — the dedicated `/terms-and-conditions` page (Lorem Ipsum) and a fully-written version embedded inside the cart's age-verification step.
- **Contact form (`/contact`) does not submit anywhere** — `preventDefault()` + fake success state only.
- **`ShopByPriceClient.tsx` is a fully-built but never-imported dead file.**
- **`GET_PRODUCTS_BY_TAG` GraphQL query is defined but unused** (brand pages use `GET_PRODUCTS_BY_CATEGORY` instead), duplicating most of that query's field selection.

---

## 10. Environment Variables

*(Names only — values never inspected or reproduced.)*

| Variable | Purpose | Required? |
|---|---|---|
| `JWT_SECRET` | Signs/verifies session JWTs (`lib/auth`, `middleware.ts`) | **Required** — `middleware.ts` silently falls back to an insecure hardcoded dev value if unset (see S3) |
| `NEXT_PUBLIC_GRAPHQL_URL` | WPGraphQL endpoint | Required (has a hardcoded production fallback in `lib/graphql/index.ts`) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client-side Razorpay checkout key | Required for payment UI |
| `NEXT_PUBLIC_APP_URL` | Used to build absolute URLs (footer links, webhook target, emails) | Required |
| `RAZORPAY_KEY_ID` | Server-side Razorpay order creation | Required |
| `RAZORPAY_KEY_SECRET` | Razorpay signature verification | Required — if unset, signature verification **soft-fails** (console error only, does not block the order) |
| `RESEND_API_KEY` | Transactional email sending | Required |
| `SHIPROCKET_EMAIL` / `SHIPROCKET_PASSWORD` | Shiprocket API auth | Required for shipping rates/shipment/tracking features |
| `SHIPROCKET_PICKUP_LOCATION` / `SHIPROCKET_PICKUP_POSTCODE` | Shiprocket order-creation payload | Required for `create-shipment` |
| `WHOLESALE_WEBHOOK_SECRET` | Authenticates WP→Next.js wholesale approve/reject webhooks | Required — hard-fails closed if unset (good), but see S2 for the separate committed-fallback issue on the WP plugin side |
| `WOOCOMMERCE_CONSUMER_KEY` / `WOOCOMMERCE_CONSUMER_SECRET` | WooCommerce REST API auth | Required — **currently also committed in plaintext in `wrangler.toml`, see S1** |
| `WOOCOMMERCE_URL` | WooCommerce/WordPress base URL | Required |
| `WP_ADMIN_USERNAME` / `WP_ADMIN_APP_PASSWORD` | WordPress Application Password (role updates via `/wp/v2/users`, media uploads) | Required |
| `WP_ADMIN_PASSWORD` | Present in `.env.local` | **Referenced nowhere in code** — appears to be a leftover/unused variable, distinct from `WP_ADMIN_APP_PASSWORD` which is what's actually used |
| `BREVO_API_KEY` / `BREVO_LIST_ID` | Newsletter subscription | Referenced in code but **not present in `.env.local`** — likely unconfigured/inactive in the current environment |
| `NODE_ENV` | Standard Next.js/Node environment flag | Framework-managed |

`lib/env-check.ts` declares a `REQUIRED_ENV_VARS` list (`JWT_SECRET`, `WOOCOMMERCE_CONSUMER_KEY`, `WOOCOMMERCE_CONSUMER_SECRET`, `WP_ADMIN_USERNAME`, `WP_ADMIN_APP_PASSWORD`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RESEND_API_KEY`, `WHOLESALE_WEBHOOK_SECRET`) that would enforce all of these at boot — but as noted in §9, this validator is never actually invoked.

---

## 11. Open Questions / Decisions Needed

1. **Committed secrets (S1, S2):** rotation plan and timeline — who owns rotating the WooCommerce key pair and the wholesale webhook secret, and coordinating the WP-plugin-side + Next.js-side + Cloudflare-dashboard-side updates together so nothing breaks mid-rotation?
2. **Legal/content pages:** `/terms-and-conditions`, `/privacy-policy`, `/faqs`, `/accessibility-statement`, `/shipping-and-returns`, `/cookies-policy` are all still Lorem Ipsum. Who is writing the real copy, and should the already-written T&C text embedded in the cart's age-verification step be treated as the canonical draft to expand from?
3. **`/track` page:** should it be linked from the footer/account area now that it's functionally complete, or is it intentionally being held back pending more testing?
4. **Wholesale "Saved Products":** build out real save/fetch functionality, or remove the nav entry and empty-state page until it's prioritized?
5. **`/rewards` page:** is a real points/loyalty backend planned, or should this be simplified to a "coming soon" the way `/outlet` and `/snoop-dogg` already are?
6. **`/shisha-tobacco/al-fakher` mock-data sub-tree:** replace with the real GraphQL-backed category/product flow (as its own code comment suggests), or retire it in favor of `/brand/al-fakher`, which already covers the same use case with real data?
7. **Contact form:** should `/contact` actually send an email/lead, and if so, via which channel (Resend, a WP form plugin, a CRM)?
8. **Rate limiting (TASK-025) and env validation (TASK-026):** both have real implementations sitting unused. Decide whether to wire them in now (note: rate limiting requires either moving affected auth routes off Edge runtime, or replacing the in-memory store with something Edge-compatible like Cloudflare KV/Durable Objects) or deprioritize them.
9. **Shipping cost integrity:** should `complete-order` re-fetch/re-validate the Shiprocket rate server-side before creating the WooCommerce order, matching the pattern already used for coupons?
10. **`/api/shiprocket/create-shipment` auth:** should this be locked down (e.g., only callable internally from `complete-order`, or require an internal shared secret) given it currently has none?
11. **Duplicate routes:** `/login` vs `/account/login`, `/register` vs `/account/register` — intentional aliases, or should one set redirect to the other for clarity/SEO?
12. **`framer-motion`, `lucide-react`, `swiper`, `bcryptjs`:** confirmed unused — safe to remove from `package.json`, or are they staged for near-term use?

---

## 12. Suggested Next Features/Priorities

Ranked by impact, not a committed roadmap:

1. **Rotate the two committed secrets (S1, S2) and add a pre-commit/CI secret scanner.** This is the only item on this list with actual business risk today (live credentials in git history) rather than product/UX risk.
2. **Re-validate shipping cost server-side in `complete-order`**, mirroring the existing coupon re-validation pattern — closes a real checkout price-integrity gap with a small, contained change.
3. **Lock down `/api/shiprocket/create-shipment`** with at minimum an internal shared-secret check, since it currently accepts unauthenticated requests that create real Shiprocket shipments.
4. **Fix or remove the broken "Resend verification email" button** (`/api/auth/resend-verification` doesn't exist) — small, visible, currently-broken user-facing action.
5. **Link `/track` from the footer and account/orders area** — the feature is already fully built; it's just unreachable.
6. **Replace the homepage blog teaser with real posts** — the blog data layer already works one click away (`/blog`); wiring the homepage section to it removes the most visible piece of hardcoded content on the site's most-trafficked page.
7. **Decide the fate of the Lorem-Ipsum legal pages** — at minimum Terms & Privacy carry real compliance/liability weight; this is a content, not engineering, task, but it's currently blocking on someone writing the copy.
8. **Fix the non-functional Brand filter and "Popularity"/"Newest" sort options on category pages** — they're visibly present in the UI but silently do nothing, which reads as a bug to users even though it's a missing implementation.
9. **Decide whether to wire in the already-built rate-limiting and env-validation utilities**, given both currently sit as complete-but-unused code — this is a quick win once the Edge-runtime constraint for rate limiting is resolved (likely by moving to a Cloudflare KV/Durable Objects-backed limiter, or moving the affected auth routes off Edge).
10. **Clean up dead code** (`GET_PRODUCTS_BY_TAG`, `ShopByPriceClient.tsx`, `/api/shipping/methods`, `AgeVerification.tsx`, unused `framer-motion`/`lucide-react`/`swiper`/`bcryptjs` dependencies) — low risk, reduces the surface area for the next engineer (or AI assistant) to get confused by.

---

*End of MASTER_PROJECT_SUMMARY.md.*
