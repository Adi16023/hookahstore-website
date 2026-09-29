# WordPress/WooCommerce → Medusa.js Migration Plan

**Project:** The Hookah Store
**Scope:** Migrate the commerce/content backend from WordPress + WooCommerce (exposed via WPGraphQL/WooGraphQL) to Medusa.js, keeping the Next.js frontend.
**Type:** Read-only audit + plan. No code was changed to produce this document.
**Date:** 2026-07-20

---

## 0. Executive Summary

This store is a **headless Next.js app** talking to WordPress through three separate channels:

1. **WPGraphQL/WooGraphQL** (`frontend/lib/graphql/index.ts`, `frontend/lib/auth/auth-graphql.ts`) — content, product catalog, search, blog, ACF hero slider, customer registration/login.
2. **WooCommerce REST API v3** (`frontend/lib/woocommerce/*`) — orders, customer meta, shipping zones, coupons.
3. **WordPress REST API v2** — role assignment, media uploads (wholesale documents).

Two things make this migration **easier than a typical WooCommerce migration**:

- **Cart, checkout math, and coupon validation are already reimplemented in Next.js**, not delegated to WooCommerce's cart/checkout engine. WooCommerce is used as a system of record (products, orders, customer roles) rather than as a checkout runtime.
- **Payments (Razorpay) and shipping (Shiprocket, in-progress per current git diff) are already called directly from Next.js API routes**, independent of WooCommerce plugins. Only the finished order gets written back to WooCommerce via REST.

The genuinely hard parts are:
- The **wholesale B2B system** (custom roles, pending/approved states, admin-approval webhook, gated pricing/catalog) has no out-of-the-box Medusa equivalent and needs a custom module or adaptation of Medusa's B2B feature set.
- **CMS content** (blog, ACF hero slider, legal pages) has **no Medusa equivalent at all** — Medusa is commerce-only. This content either stays in WordPress (content-only), or moves to a dedicated headless CMS.
- **Razorpay and Shiprocket are not official first-party Medusa provider modules** — both need custom provider modules built against Medusa's Payment Module and Fulfillment Module interfaces.

---

## 1. Frontend GraphQL/REST Inventory (Step 1)

All GraphQL query/mutation strings live in exactly two files — there are no scattered inline `gql` calls and no Apollo/urql client (just `fetch` against a single endpoint via `fetchGraphQL`/`fetchGraphQLSafe` in [frontend/lib/graphql/index.ts](frontend/lib/graphql/index.ts)).

### 1.1 GraphQL operations

| Operation | File | Data | Consumed by |
|---|---|---|---|
| `CONSUMER_SEARCH_QUERY` | `lib/graphql/index.ts` | Product live search, with price, first 10 | `app/api/search/route.ts` |
| `WHOLESALE_SEARCH_QUERY` | `lib/graphql/index.ts` | Product live search, **no price**, filtered by ACF `showInWholesale` meta | `app/api/search/route.ts` |
| `GET_POSTS_QUERY` | `lib/graphql/index.ts` | Blog posts (title, excerpt, featured image, tags, categories, author) | `app/blog/page.tsx`, `app/blog/[slug]/page.tsx` |
| `GET_CATEGORIES_QUERY` | `lib/graphql/index.ts` | Blog categories (non-empty) | `app/blog/page.tsx` |
| `GET_POST_QUERY` | `lib/graphql/index.ts` | Single blog post by slug, full content | `app/blog/[slug]/page.tsx` |
| `GET_ALL_SLUGS_QUERY` | `lib/graphql/index.ts` | All post slugs | defined but **no consumer found** (dead code / reserved for `generateStaticParams`) |
| `GET_CATEGORY_POSTS_QUERY` | `lib/graphql/index.ts` | Category info + its posts | `app/blog/category/[slug]/page.tsx` |
| `GET_HOME_HERO_SLIDES` | `lib/graphql/index.ts` | ACF repeater `heroSlider.slides` on the "home" page | `app/(site)/page.tsx`, `components/HeroSliderWrapper.tsx` |
| `GET_WHOLESALE_HERO_SLIDES` | `lib/graphql/index.ts` | ACF `heroSlider.slides` on the "wholesale-home" page | `app/wholesale/page.tsx` |
| `GET_PRODUCTS_BY_CATEGORY` | `lib/graphql/index.ts` | Products in a WC category, incl. Simple/Variable pricing, attributes, variations | `category/[slug]`, `brand/[slug]`, `hookahs/page.tsx`, `hookahs/shop-by-price/page.tsx` |
| `GET_PRODUCT_CATEGORY` | `lib/graphql/index.ts` | Category name/description/image | `category/[slug]`, `brand/[slug]` |
| `GET_PRODUCTS_BY_TAG` | `lib/graphql/index.ts` | Products filtered by WC tag (brand pages) | defined but **no consumer found** (dead code — brand pages currently use `GET_PRODUCTS_BY_CATEGORY`) |
| `GET_PRODUCT_DETAIL` | `lib/graphql/index.ts` | Single product by slug | `app/(site)/product/[slug]/page.tsx` — **note:** per `PROJECT_DEEP_ANALYSIS.md`, this page is edge-runtime + client-fetched, not SSR/ISR, despite the query existing for server use |
| `GET_HOMEPAGE_BRANDS` | `lib/graphql/index.ts` | 5 batched brand product lists (Al Fakher, Afzal, Royal, Oduman, Mya), incl. custom `productRibbon` field and `productTags` | `app/(site)/page.tsx`, `app/wholesale/page.tsx`, `components/pages/HomePageContent.tsx`, `components/ProductSlider.tsx` (client-side fetch) |
| `registerCustomer` (mutation) | `lib/auth/auth-graphql.ts` | WooCommerce customer registration (WooGraphQL) | `app/api/auth/signup/route.ts` |
| `login` (mutation) | `lib/auth/auth-graphql.ts` | JWT auth via WPGraphQL JWT Authentication plugin | `app/api/auth/login/route.ts` |
| `CheckUser` (query) | `lib/auth/auth-graphql.ts` | Best-effort email-exists check (`users(where: search)`) | `app/api/auth/check-email/route.ts` |

**Custom/plugin-dependent GraphQL fields worth flagging:** `productRibbon` (custom badge field — "New"/"Sale" style, not stock WooGraphQL) and `showInWholesale` (ACF meta used as a `metaQuery` filter). Neither has a first-party Medusa equivalent; both map to Medusa `product.metadata` + storefront-side filtering.

### 1.2 REST (non-GraphQL) WordPress/WooCommerce operations

| Operation | File | Purpose |
|---|---|---|
| `wcGet/wcPost/wcPut` client | `lib/woocommerce/index.ts` | Generic WC REST v3 wrapper (Basic Auth via consumer key/secret) |
| Customer lookup/meta | `lib/woocommerce/wholesale.ts` | Role checks, business meta (GST, address, `approval_status`), document URLs |
| Media upload | `lib/woocommerce/media.ts` | `POST /wp/v2/media` for wholesale documents |
| Order creation | `app/api/payment/complete-order/route.ts` | `POST /wc/v3/orders` after Razorpay signature verification |
| Shipping zones (legacy) | `app/api/shipping/methods/route.ts` | `GET /wc/v3/shipping/zones` + `/methods` |
| Shipping rates (new, uncommitted) | `app/api/shipping/rates/route.ts`, `lib/shiprocket/index.ts` | Live courier rates from **Shiprocket API** by pickup/delivery postcode + weight — bypasses WooCommerce shipping entirely |
| Shipment creation (new, uncommitted) | `app/api/shiprocket/create-shipment/route.ts` | Fire-and-forget Shiprocket order creation after WC order is placed |
| Order tracking (new, uncommitted) | `app/api/shiprocket/track/route.ts`, `app/(site)/track/` | Looks up Shiprocket order by `WC-{orderNumber}` and returns live tracking activity |
| Coupon validation | `app/api/coupons/validate/route.ts` | Reads raw `GET /wc/v3/coupons?code=...`, then **reimplements** expiry/usage-limit/min-amount/percent-vs-fixed logic in Next.js — WooCommerce's own coupon engine is not used |
| Role assignment | (used by signup/webhook flows) | `PUT /wp/v2/users/{id} { roles }` — WP REST v2, not WC REST (WC silently ignores custom roles) |

**Observation:** Shipping is mid-migration already — the repo has uncommitted changes replacing native WooCommerce shipping zones with direct Shiprocket calls (`git status` shows `frontend/app/api/shipping/rates/`, `frontend/app/api/shiprocket/`, `frontend/lib/shiprocket/`, and modified `CartPageClient.tsx` / `complete-order/route.ts` wiring them in). This actually **reduces Medusa migration risk for shipping**, since the coupling to WooCommerce there is already minimal (only the `WC-{orderNumber}` ID format ties Shiprocket to WooCommerce).

---

## 2. WordPress Backend Audit (Step 2)

### 2.1 Custom plugin: `wholesale-admin-manager` (v4.1)

The **only** custom plugin in this repo (`wordpress-plugin/wholesale-admin-manager/`). Contents:

| File | Purpose |
|---|---|
| `wholesale-admin-manager.php` | Bootstrap, hook registration |
| `includes/admin-menu.php` | Registers "Wholesale Applications" + "Customers" admin menu pages |
| `includes/applications-page.php` | Lists pending wholesale applications |
| `includes/approved-customers-page.php` | Lists approved wholesale customers |
| `includes/actions.php` | `admin_post_approve_wholesale_user` / `admin_post_reject_wholesale_user` handlers — sets WP user role, then POSTs to Next.js webhooks (`/api/wholesale/approved`, `/api/wholesale/rejected`) with a bearer secret |
| `assets/admin.css` | Admin UI styling |

It also registers two **custom WordPress roles** on every `init` (idempotent): `wholesale_pending`, `wholesale_customer`. There are **no custom post types, no custom REST endpoints, and no custom GraphQL resolvers** — all custom logic is admin-UI + role-registration + an outbound webhook call.

### 2.2 Plugins relied on but not in this repo (live on the WP install)

Per `PROJECT_ARCHITECTURE.md` §2 and the deployment checklist — these must exist on `cms.thehookahstore.in` for the current site to function:
- **WooCommerce** — product/order/customer data store
- **WPGraphQL** — GraphQL layer
- **WooGraphQL** — WooCommerce extension for WPGraphQL
- **WPGraphQL JWT Authentication** — powers the `login` mutation
- **ACF (Advanced Custom Fields)** + WPGraphQL-for-ACF — hero slider repeater, `showInWholesale` meta, `productRibbon`

### 2.3 WordPress-specific things with no obvious Medusa equivalent

| Item | Why it's WordPress-specific |
|---|---|
| Blog + legal/content pages (About, Privacy, Cookies, T&C, Shipping & Returns — see recent commit `fd93f84`) | Rendered from WP posts/pages via WPGraphQL. Medusa has no CMS/content module at all. |
| ACF hero slider (repeater field on Home/Wholesale-Home pages) | ACF is a WordPress-only structured-content system. |
| `wholesale_pending`/`wholesale_customer` WP roles + approval webhook | WordPress user-role system + custom admin UI. Medusa's closest primitive is **Customer Groups** (and the official B2B starter's company/approval concepts), but the pending→admin-approves→webhook-email flow is bespoke and must be rebuilt. |
| `productRibbon` custom field, `showInWholesale` ACF meta | ACF/custom-meta on WC products — maps to Medusa `product.metadata`, but the querying/filtering logic (GraphQL `metaQuery`) has no direct equivalent and must be reimplemented against Medusa's Product Module / a search index. |
| Coupon business rules already reimplemented in Next.js against raw WC REST data | Not really WordPress-specific — good news, this logic ports almost as-is to Medusa's Promotion Module (which natively supports these same rule types). |
| Razorpay integration | Called directly via Razorpay's own API from Next.js, not a WooCommerce payment gateway plugin — no WordPress dependency to remove, but **no official Medusa Razorpay provider exists either** (Stripe is the first-party one). |
| Shiprocket integration (in progress) | Called directly via Shiprocket's own API, not a WooCommerce shipping plugin. Same story — needs a custom Medusa Fulfillment provider. |
| Rewards/loyalty page (`components/rewards/RewardsPageClient.tsx`) | Confirmed by reading the component: this is **static marketing copy** ("Sign up, get 25 points") — not wired to any backend ledger, WooCommerce or otherwise. No migration needed unless a real loyalty engine is later scoped. |
| `/account/orders` page | Confirmed by reading `OrdersPageClient.tsx`: currently renders a static "no orders yet" shell with **no live WooCommerce order fetch wired in**. This is a pre-existing gap, not something to migrate — but it should be built properly (against Medusa's Order Module) while frontend order-related code is being touched anyway. |
| Product reviews | No WooCommerce review query, mutation, or UI exists anywhere in the frontend. Not a current feature — no migration burden, but also no Medusa-native equivalent if it's added later (would need a third-party module either way). |

---

## 3. Feature → Medusa Mapping Table (Step 3)

| Feature | Currently powered by | Medusa equivalent | Gap / custom work needed | Complexity |
|---|---|---|---|---|
| Products & variants | WooCommerce Simple/Variable products via WooGraphQL | Product Module (variants, options) | Attribute model differs (WC attributes+variations vs. Medusa options+variants) — needs a mapping/import script | Medium |
| Collections/categories | WC product categories, WC tags (brands) | Product Category Module + Product Tags | Category tree structure differs slightly; brand-as-tag pattern ports cleanly | Low |
| Pricing & currencies | WC `price`/`regularPrice`/`salePrice` fields, INR only | Pricing Module (price lists, currencies, customer-group pricing) | Wholesale pricing (currently ad hoc per docs) becomes a first-class Price List scoped to a Customer Group — actually an upgrade | Medium |
| Inventory | Implicit in WC stock status (`stockStatus` field only, no quantity tracking visible in queries) | Inventory Module (stock locations, reserved qty) | If WC never tracked real quantities, this is greenfield inventory setup, not a migration | Medium |
| Cart | 100% client-side `localStorage`, two keys (`cart`, `wholesale_cart`), zero WooCommerce cart session | Cart Module (server-side, region/customer aware) | Full rebuild — but this is a **net improvement** (server cart survives device switches, fixes documented limitation #2 in `PROJECT_ARCHITECTURE.md`) | Medium |
| Checkout | Custom Next.js multi-step UI (`CartPageClient.tsx`) calling Razorpay + WC REST directly | Cart Module + Payment Module + Order Module workflows | Business logic (steps, shipping selection, discount application) is already bespoke in React — mostly a rewire of data calls, UI stays | Medium |
| Orders | `POST /wc/v3/orders` after Razorpay verification | Order Module | Needs order-creation workflow using Medusa's cart-completion flow instead of raw REST insert | Medium |
| Customers / auth | WooGraphQL `registerCustomer`, WPGraphQL JWT `login`, custom `jose` session cookie | Customer Module (native auth) | Custom JWT session system can either wrap Medusa's built-in customer auth or be kept as-is calling Medusa's auth endpoints instead of WPGraphQL — either way, all 3 GraphQL auth ops get replaced | Medium |
| Wholesale B2B (roles, pending/approval, gated pricing/catalog) | Custom WP roles + custom plugin admin UI + webhook to Next.js | Customer Groups + (optionally) Medusa's official B2B feature set (companies/employees/quotes) | **Highest-effort item.** No direct 1:1 equivalent for the pending→admin-approves→email flow; requires a custom admin workflow/module or adapting the B2B starter | High |
| Payments (Razorpay) | Direct Razorpay API calls from Next.js, HMAC verification, order write-back | Payment Module | No official Razorpay provider — build a custom Payment Provider module implementing Medusa's provider interface (session, capture, refund) | High |
| Shipping/fulfillment (Shiprocket, mid-migration) | Direct Shiprocket API calls from Next.js (rates, shipment creation, tracking) | Fulfillment Module | No official Shiprocket provider — build a custom Fulfillment Provider; logic already isolated in `lib/shiprocket/index.ts`, so mostly a port, not a redesign | Medium-High |
| Discounts/coupons | WC coupon records read via REST, rules **already reimplemented in Next.js** | Promotion Module | Best-case item — Medusa's Promotion Module natively supports percent/fixed, min-amount, usage-limit rules; largely a straight port | Low |
| Tax | Not visible in any query/route (no tax fields queried or calculated) | Tax Module | If tax isn't currently calculated at all, this is new scope, not migration | Low (if out of scope) / Medium (if adding real tax calc) |
| Search | Two WPGraphQL live-search queries (`CONSUMER_SEARCH_QUERY`/`WHOLESALE_SEARCH_QUERY`), first-10 substring search | No native full-text search in Medusa | Needs a search plugin/index (e.g. MeiliSearch, Algolia) wired to Product Module data | Medium |
| Media/CMS content (blog, legal pages) | WordPress posts/pages via WPGraphQL, ACF hero slider | **None** — Medusa is commerce-only | Keep a slimmed-down "content-only" WordPress (WPGraphQL, no WooCommerce), or migrate to a dedicated headless CMS (Sanity/Payload/Strapi); blog is actively used and recently expanded (see recent commits) so this can't be dropped | Medium-High |
| Reviews | Not implemented anywhere in the current frontend | No native Medusa module | No migration burden (nothing to migrate); flag as future scope only | N/A |
| Admin/back-office | WordPress wp-admin (WooCommerce order/product screens + custom wholesale-admin-manager plugin) | Medusa Admin dashboard (bundled React app) | Product/order/customer admin ports natively; the wholesale-approval admin UI needs a custom Medusa Admin extension (widget/route) | Medium |

---

## 4. Phased Migration Plan (Step 4)

Estimates assume **one full-time developer** fluent in both Next.js/WordPress and Node.js/Medusa.

### Phase 0 — Medusa Setup & Environment
**Builds:** Medusa v2 server (Node.js), Postgres database, Redis, local admin dashboard running, base Region/Currency (INR) configured, empty Product/Customer/Order modules verified via Admin API.
**Frontend changes:** None yet — this phase is backend-only, frontend keeps talking to WordPress.
**Estimate:** 3–5 days
**Blockers:** None — can start immediately, in parallel with everything else.

### Phase 1 — Product Data Model & Catalog
**Builds:** Product Module schema decisions (options/variants mapping from WC attributes/variations), category tree, brand-as-tag structure, image/media import, `productRibbon` → `metadata.ribbon`, `showInWholesale` → Customer Group visibility or `metadata` flag, price setup (retail + wholesale price lists).
**Frontend changes:** None yet (still additive) — but this is where the query-replacement plan for `GET_PRODUCTS_BY_CATEGORY`, `GET_PRODUCT_CATEGORY`, `GET_PRODUCT_DETAIL`, `GET_HOMEPAGE_BRANDS`, `CONSUMER_SEARCH_QUERY`, `WHOLESALE_SEARCH_QUERY` gets designed (each becomes a Medusa Store API / JS SDK call).
**Estimate:** 2–3 weeks
**Dependencies:** Phase 0 complete.

### Phase 2 — Cart & Checkout Rebuild
**Builds:** Server-side Cart Module wiring (region, line items, shipping option association), port of the coupon-rule logic into Medusa Promotions, tax setup (if in scope).
**Frontend changes:** Replace `localStorage`-only `CartProvider` logic with Medusa Cart API calls (create/update cart server-side, still may keep a local cache for optimistic UI); rewrite `app/api/coupons/validate/route.ts` to call Medusa Promotions instead of raw WC coupon REST + custom math.
**Estimate:** 1.5–2 weeks
**Dependencies:** Phase 1 (needs real products/prices in Medusa to build a cart against).

### Phase 3 — Orders, Customers & Auth
**Builds:** Order Module workflows (cart → order completion), Customer Module auth, Customer Groups for `wholesale_pending`/`wholesale_customer` equivalents, a custom admin extension or lightweight internal tool replacing `wholesale-admin-manager`'s approve/reject UI (calling Medusa Admin API to move a customer between groups + trigger the existing Resend approval/rejection emails).
**Frontend changes:** Replace `registerCustomer`/`login`/`CheckUser` GraphQL calls in `lib/auth/auth-graphql.ts` with Medusa auth endpoints; decide whether to keep the existing `jose`/httpOnly-cookie session layer as a thin wrapper (recommended — minimal churn) or move fully to Medusa's session model; rewire `/api/wholesale/upload-documents` to store files against Medusa customer metadata (needs the file/S3 module from Phase 0 wired up) instead of WP media; finally build the previously-nonfunctional `/account/orders` page against the real Order Module (closes a pre-existing gap, not just a migration).
**Estimate:** 2–3 weeks
**Dependencies:** Phase 1 and 2. This phase carries the **highest product-scope risk** because the wholesale approval flow has no drop-in equivalent.

### Phase 4 — Payments & Shipping
**Builds:** Custom Medusa **Payment Provider** module for Razorpay (implementing `initiatePayment`/`authorizePayment`/`capturePayment`, porting the existing HMAC-SHA256 verification logic); custom Medusa **Fulfillment Provider** module for Shiprocket (porting `lib/shiprocket/index.ts` rate/create-shipment/tracking logic to the Fulfillment Provider interface); order-tracking page (`app/(site)/track/`) rewired to Medusa's fulfillment/tracking data instead of a direct Shiprocket lookup keyed on `WC-{orderNumber}`.
**Frontend changes:** `app/api/payment/create-order`, `app/api/payment/complete-order`, `app/api/shiprocket/*`, `app/api/shipping/rates` all get replaced by calls into Medusa's cart-completion and fulfillment workflows.
**Estimate:** 2–3 weeks (Razorpay provider is the single riskiest item in the whole plan — no first-party reference implementation to start from)
**Dependencies:** Phase 2 (cart) and Phase 3 (order creation) must be working first.

### Phase 5 — Frontend Full Rewire
**Builds:** Nothing new on the backend — this phase is about finishing the frontend cutover: replace every remaining GraphQL call site (blog/content queries stay pointed at WordPress per the CMS decision below; all commerce queries point at Medusa's Store API via `@medusajs/js-sdk`), delete `lib/graphql/index.ts` commerce queries (keep only content ones, if WP-as-CMS is retained), delete `lib/woocommerce/*`, delete `lib/auth/auth-graphql.ts`.
**Frontend changes:** This is the big mechanical pass — every page/route listed in the Step 1 table that isn't blog/content gets its data-fetching swapped from `fetchGraphQL`/`wcGet` to the Medusa JS SDK.
**Estimate:** 2–3 weeks
**Dependencies:** Phases 1–4 all functionally complete in a staging Medusa instance.

### Phase 6 — Content/CMS Decision, Data Migration & Cutover
**Builds:** A decision + implementation on where blog/legal-page/hero-slider content lives going forward (keep WordPress as content-only headless CMS — least churn given recent content investment in commit `fd93f84` — or migrate to a dedicated CMS); data migration scripts for products, customers, and historical orders (WooCommerce REST export → Medusa Admin API import); DNS/hosting cutover plan; parallel-run/verification window before decommissioning WooCommerce.
**Frontend changes:** None beyond what Phase 5 already did, unless the CMS choice changes the content queries too.
**Estimate:** 2–3 weeks (excludes actual historical-order-volume-dependent migration runtime, which scales with catalog/order count)
**Dependencies:** All prior phases. This is the go-live phase.

---

## 5. Integration Checklist (Step 5)

- [ ] **Medusa server hosting** — a Node.js host for the Medusa backend (Railway/Render/Fly/VM/Docker container; Medusa is not a serverless-first framework the way the current Vercel-hosted Next.js frontend is)
- [ ] **Postgres database** — required, provisioned and reachable from the Medusa server
- [ ] **Redis** — required for Medusa's event bus / workflow engine in any non-trivial deployment
- [ ] **Medusa Admin dashboard** — bundled with the Medusa server; needs its own auth users created for whoever currently manages WooCommerce/wp-admin
- [ ] **File storage (S3 or compatible)** — for product images and wholesale document uploads (GST certs, business licenses) that currently go to the WP Media Library
- [ ] **Payment provider module** — custom Razorpay provider (no official one); Razorpay API keys migrate as-is
- [ ] **Fulfillment provider module** — custom Shiprocket provider (no official one); Shiprocket credentials migrate as-is
- [ ] **Search service** (if replacing the current WPGraphQL live-search) — MeiliSearch (self-hosted, cheapest) or Algolia (managed), indexed from Medusa Product Module data
- [ ] **Content/CMS decision** — either keep a stripped-down WordPress (WPGraphQL only, WooCommerce removed) purely for blog/legal pages/hero slider, or stand up a dedicated headless CMS
- [ ] **Email** — no change needed; Resend integration is entirely within Next.js and doesn't depend on WordPress or WooCommerce
- [ ] **Data export from WordPress:**
  - Products: WooCommerce REST API (`/wc/v3/products`, `/wc/v3/products/{id}/variations`) → transform → Medusa Admin API product import
  - Customers: `/wc/v3/customers` (incl. custom meta: `approval_status`, GST/license URLs) → Medusa Customer Module + Customer Groups
  - Orders: `/wc/v3/orders` → Medusa Order Module (for historical record-keeping; typically imported as read-only/archived rather than "live" orders)
  - Media: existing WP Media Library URLs → re-hosted in the new S3/file storage, with URL remapping across imported product/customer records
- [ ] **Env var migration** — `NEXT_PUBLIC_GRAPHQL_URL`, `WOOCOMMERCE_*`, `WP_ADMIN_*` retired; new `MEDUSA_BACKEND_URL`, Medusa publishable API key, S3 credentials, search service credentials added

---

## 6. Total Time Estimate

| Scenario | Estimate |
|---|---|
| **Optimistic** (no surprises in Razorpay/Shiprocket custom providers, wholesale B2B logic maps cleanly onto Customer Groups, WordPress kept as content-only CMS with zero rework) | **~11 weeks** |
| **Realistic** | **~14–17 weeks** (3.5–4 months) |
| **Pessimistic** (Razorpay/Shiprocket provider development stalls on Medusa workflow internals, wholesale approval flow needs a fully custom admin module, historical order volume makes data migration slow, CMS migration is added to scope instead of "keep WordPress for content") | **~22–26 weeks** (5–6.5 months) |

The single biggest source of estimate variance is **Phase 4 (Payments & Shipping)** — building correct, production-safe custom Medusa provider modules for Razorpay and Shiprocket with no first-party reference implementation. The second biggest is the **wholesale B2B approval workflow**, which is genuinely bespoke on both the WordPress and Medusa sides.
