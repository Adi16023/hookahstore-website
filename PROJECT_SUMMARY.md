# The Hookah Store: Project Audit Summary

- **Audited:** 2026-09-26. Read-only; no project files were changed apart from creating this report.
- **Repo:** `/Users/kabilan/Desktop/Projects/hookahstore-website`, branch `main`, HEAD `fd93f84`.
- **Paths:** relative to the repo root unless noted. Line numbers are as of this audit.
- **Secrets:** redacted. The report says where they are, never what they are.

---

## 0. Read this first: this is not a WordPress theme repo

The brief assumed a WordPress + WooCommerce site. **That is only half true.**

| Layer | What it is | Where it lives |
|---|---|---|
| Storefront (retail + wholesale) | **Headless Next.js 15.5.2 / React 19 app** (TypeScript, Tailwind v4), deployed to **Cloudflare Pages** with `@cloudflare/next-on-pages`. Every page and route sets `export const runtime = 'edge'`. | `frontend/` (this repo) |
| Back end / CMS | **WordPress + WooCommerce**, used only as a data API: WPGraphQL at `https://cms.thehookahstore.in/graphql`, WC REST at `/wp-json/wc/v3/*`, WP REST at `/wp-json/wp/v2/*`. | **Not in this repo.** It runs on `cms.thehookahstore.in` (host unknown). |
| One custom WP plugin | "Wholesale Admin Manager" v4.1: approves or rejects wholesale applicants. | `wordpress-plugin/wholesale-admin-manager/` (plus older zips) |

**What this means for the brief:**
- There is no WP theme, child theme, page builder, `functions.php`, mu-plugin, `wp-config.php`, `.htaccess` or SQL dump in the repo.
- Every visible part of the site is React code in `frontend/`: header, footer, warning banner, menus, homepage, category pages, checkout, My Account, age gate and About page.
- WordPress only supplies products, categories, customers, orders, the ACF hero-slider content and blog posts.
- Anything answered as "in WP admin / DB" below cannot be checked from this repo, and is marked **Unverified**.

---

## 1. Tech stack and environment

### 1.1 Platform and versions

| Item | Value | Source |
|---|---|---|
| Next.js | 15.5.2 (App Router) | `frontend/package.json` |
| React / React-DOM | 19.2.3 | `frontend/package.json` |
| Styling | Tailwind CSS 4.1 (`@tailwindcss/postcss`), a global stylesheet, and lots of inline `style={{}}` | `frontend/styles/globals.css`, `frontend/postcss.config.js`, `frontend/tailwind.config.js` |
| Other libraries | framer-motion, swiper, lucide-react, jose (JWT), bcryptjs, resend (the SDK is installed but a `fetch()` wrapper is used instead) | `frontend/package.json` |
| Node (local machine) | v22.23.1, npm 10.9.8. No `.nvmrc` and no `engines` field, so the Node version is not pinned. | `node -v` |
| Hosting | Cloudflare Pages. `frontend/wrangler.toml` names the project `hookahstore-website`, sets `compatibility_flags = ["nodejs_compat"]` and outputs to `.vercel/output/static`. | `frontend/wrangler.toml` |
| WordPress / WooCommerce / PHP versions | **Unknown and not in the repo.** The plugin header only states minimums: WP 6.0 and PHP 8.0 (`wholesale-admin-manager.php` L3-13). | Check WP Admin → Dashboard → Updates / Tools → Site Health on `cms.thehookahstore.in` |
| WP plugins the frontend depends on (from the code and `PROJECT_ARCHITECTURE.md` L82-96, L925-931) | WooCommerce, WPGraphQL, WooGraphQL (WPGraphQL for WooCommerce), WPGraphQL JWT Authentication (login fails with a 503 without it, see `app/api/auth/login/route.ts` ~L55), ACF with WPGraphQL for ACF (hero slider, `productRibbon`, `showInWholesale`), Application Passwords (core), and Wholesale Admin Manager. The wholesale search also uses a `metaQuery` argument, which needs a meta-query extension such as "WPGraphQL Meta Query". | **Unverified.** Confirm in WP Admin → Plugins. |

### 1.2 Running locally and building

```bash
cd frontend
npm install
npm run dev          # next dev → http://localhost:3000
npm run build        # next build
npm run pages:build  # npx @cloudflare/next-on-pages → .vercel/output/static (what Cloudflare deploys)
npm run lint
```

- **Wholesale locally:** browse `http://localhost:3000/wholesale/...`, or serve on port 3001. `middleware.ts` L68-70 treats the host `localhost:3001` as the wholesale subdomain.
- **Env vars:** a local run needs the variables in `frontend/.env.local` (section 1.6).
- **ESLint** is ignored during builds (`next.config.mjs`, `eslint.ignoreDuringBuilds: true`).
- **Images:** `next.config.mjs` only allows remote images from `cms.thehookahstore.in/wp-content/uploads/**`.

### 1.3 Folder structure

```
/                               repo root
├── frontend/                   ← the whole website (Next.js)
│   ├── app/
│   │   ├── layout.tsx          root <html>: theme bootstrap script, fonts, ThemeProvider, AuthProvider
│   │   ├── (site)/             RETAIL pages (route group, not in the URL)
│   │   │   ├── layout.tsx      TopWarningBar + Header + AgeGate(main + Footer) + CartProvider
│   │   │   ├── page.tsx        homepage
│   │   │   ├── category/[slug] brand/[slug] product/[slug] hookahs/** shisha-tobacco/**
│   │   │   ├── cart/ (entire checkout)  order-received/  track/ (uncommitted)
│   │   │   ├── account/** login register forgot-password reset-password verify-email
│   │   │   ├── about contact faqs privacy-policy terms-and-conditions cookies-policy shipping-and-returns accessibility-statement
│   │   │   └── offers coupons rewards business-opportunities outlet snoop-dogg cookies search age-verification
│   │   ├── wholesale/          WHOLESALE pages (served at wholesale.thehookahstore.in/* by rewrite)
│   │   │   ├── layout.tsx      TopWarningBar + WholesaleHeader + Footer + WholesaleCartGuard (NO AgeGate)
│   │   │   ├── page.tsx  login/  register/  auth/  reset-password/  product/[slug]/  account/{,orders,saved,business}
│   │   ├── admin/              NEW, UNTRACKED internal admin dashboard (orders/products/categories/tags/wholesale)
│   │   ├── blog/               blog (own BlogHeader/BlogFooter)
│   │   └── api/                server routes (edge): auth/*, payment/*, shipping/*, shiprocket/*, coupons/*,
│   │                           wholesale/*, newsletter/*, search, account/addresses, admin/*
│   ├── components/
│   │   ├── layout/             Header, HeaderNav, TopWarningBar, MarqueeBar, Footer, MobileMenu, Wholesale* headers, header/*
│   │   ├── pages/HomePageContent.tsx, HeroSlider.tsx, ProductSlider.tsx, ProductCard.tsx, AgeGate.tsx
│   │   ├── providers/          ThemeProvider, AuthProvider, CartProvider
│   │   ├── wholesale/          ShopWholesaleButton, ShopConsumerButton, ThemeToggle, WholesaleCartGuard
│   │   └── cart/ search/ blog/ account/ rewards/
│   ├── lib/
│   │   ├── graphql/index.ts    ALL GraphQL queries + fetchGraphQL / fetchGraphQLSafe
│   │   ├── woocommerce/        WC REST client (index.ts), wholesale role/meta (wholesale.ts), media uploads (media.ts)
│   │   ├── auth/               JWT session/reset/verify tokens (jose), GraphQL login/register
│   │   ├── email/              Resend fetch client + HTML email renderers
│   │   ├── shiprocket/         (uncommitted) Shiprocket API client
│   │   ├── admin/              (untracked) admin session auth
│   │   └── config/index.ts     retail/wholesale host detection + URL helpers
│   ├── middleware.ts           subdomain rewrite + wholesale/admin route guards
│   ├── styles/globals.css      tokens, marquee keyframes, theme flash-prevention
│   ├── public/                 all static images (footer-assets, homepage, about, shop-by-brand…), _redirects
│   ├── wrangler.toml           Cloudflare Pages config (+ committed secrets, see §6)
│   ├── out/                    STALE static export from 2026-02-23. Git-ignored, not deployed.
│   └── emails/                 empty folders (auth/, base/)
├── wordpress-plugin/
│   ├── wholesale-admin-manager/   plugin source (= v4.1)
│   └── wholesale-admin-manager{,-v2,-v3,-v4,-v4.1}.zip
└── *.md                        planning/analysis docs (several untracked). They are useful context but partly aspirational.
```

### 1.4 Single install vs multisite; how the wholesale subdomain works

- **It is not WordPress Multisite, and there are not two installs.** There is **one Next.js deployment** serving both hostnames and **one WordPress/WooCommerce back end** at `cms.thehookahstore.in`.
- **The wholesale subdomain is wired entirely in Next.js:**
  - `frontend/middleware.ts` L67-75: if the host starts with `wholesale.` (or is `localhost:3001`), and the path does not start with `/wholesale` or `/api/`, the request is rewritten to `/wholesale${path}`. So `wholesale.thehookahstore.in/account` serves `app/wholesale/account`.
  - `frontend/public/_redirects` has one rule: `https://wholesale.thehookahstore.in/*  /wholesale/:splat  200`. **Unverified whether Cloudflare Pages applies it.** Pages `_redirects` is not documented to support domain-level sources or requests handled by Functions, so it is probably inert. If it is ever applied, a link such as `/wholesale/account` on the subdomain could become `/wholesale/wholesale/account` and 404. The middleware already does this job, so this file is at best redundant.
  - Retail/wholesale "mode" helpers are in `frontend/lib/config/index.ts`: `getAppModeFromHost`, `getWholesaleUrl`, `getRetailUrl`, `wholesalePath`. Production hosts are hardcoded at L66-69.
- **The same wholesale pages are also reachable on the retail domain** at `https://thehookahstore.in/wholesale/...`. Nothing redirects retail `/wholesale*` to the subdomain.
- **Cookies are host-only.** The session cookie `hookah_session` is set without a `domain` (`app/api/auth/login/route.ts` L115-121; `signup/route.ts` has the same). A login on `thehookahstore.in` is not visible on `wholesale.thehookahstore.in`, and the reverse is also true.

### 1.5 Database dump, WP-CLI, git

- **Database dump:** none. There are no `.sql`, `.csv`, `.xml` or WXR files anywhere in the repo.
- **WP-CLI:** not installed locally (`which wp` finds nothing). Nothing to run it against either, since WordPress is remote.
- **Git history:** 63 commits on branch `main`.
- **Remotes:** three remotes (`origin`, `backup`, `cloudflare`), all pointing at the same GitHub repo, `windq7PcB/kiwisopranocym`. **Every remote URL embeds a GitHub personal access token** (in `.git/config`, values redacted). See §6.
- **Uncommitted work at audit time:**
  - Modified: `app/(site)/cart/CartPageClient.tsx` (shipping rates now from Shiprocket), `app/api/payment/complete-order/route.ts` (fire-and-forget Shiprocket shipment), `lib/woocommerce/index.ts` (adds `wcDelete`), `middleware.ts` (adds the `/admin` guard).
  - Deleted: `app/api/admin/test-wp-auth/route.ts`.
  - Untracked: `app/admin/**`, `app/api/admin/*` (categories, login, logout, orders, products, tags, wholesale), `app/api/shipping/rates`, `app/api/shiprocket/*`, `lib/admin/`, `lib/shiprocket/`, `app/(site)/track/`, plus three `.md` plans.

### 1.6 Deployment

- **Method:** Cloudflare Pages building from GitHub.
  - Several commits say "trigger redeploy", which points to the Cloudflare Git integration auto-deploying `main`. **Unverified:** there is no CI config (`.github/workflows`, Dockerfile, vercel.json or netlify.toml) in the repo.
  - Build command (probably set in the Cloudflare dashboard): `npm run pages:build`. Output: `.vercel/output/static`.
- **WordPress plugin:** deployed by uploading `wholesale-admin-manager-v4.1.zip` in WP Admin (`PROJECT_ARCHITECTURE.md` L937-941).
- **Docs disagree on the host.** Some say Vercel (`PROJECT_ARCHITECTURE.md` L934-949, `MEDUSA_MIGRATION_PLAN.md` L194). The code is clearly set up for Cloudflare Pages.
- **Environment variables** are set in Cloudflare → Pages → Settings → Variables and Secrets, and locally in `frontend/.env.local` (git-ignored).
  - Names only: `NEXT_PUBLIC_GRAPHQL_URL`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`\*, `WOOCOMMERCE_URL`, `WOOCOMMERCE_CONSUMER_KEY`\*, `WOOCOMMERCE_CONSUMER_SECRET`\*, `JWT_SECRET`\*, `RESEND_API_KEY`\*, `WP_ADMIN_USERNAME`, `WP_ADMIN_APP_PASSWORD`\*, `WP_ADMIN_PASSWORD`\* (unused by code), `WHOLESALE_WEBHOOK_SECRET`\*, `SHIPROCKET_EMAIL`, `SHIPROCKET_PASSWORD`\*, `SHIPROCKET_PICKUP_LOCATION`, `SHIPROCKET_PICKUP_POSTCODE`, `ADMIN_PASSWORD`\*, `BREVO_API_KEY`\*, `BREVO_LIST_ID`. (\* = secret)
  - `frontend/lib/env-check.ts` defines `validateEnv()`, but **nothing calls it**. It was removed from `app/layout.tsx` in commit `6f14440`, so missing env vars fail silently at runtime.

---

## 2. "Theme"

### 2.1 Active theme / page builder

- **No WordPress theme drives the storefront.** The WP site at `cms.thehookahstore.in` presumably has some theme active, but it is irrelevant to what shoppers see. **Unverified which theme.**
- **No page builder** (Elementor, WPBakery or Gutenberg) is used for storefront pages. Every page is a hand-written React component, most with inline styles taken from a Figma design (the image files in `public/` are named by Figma hashes).

### 2.2 Key "template" files (React equivalents)

| WP concept | File(s) |
|---|---|
| Root / `<head>` | `frontend/app/layout.tsx` |
| Retail wrapper (header + footer) | `frontend/app/(site)/layout.tsx` |
| Wholesale wrapper | `frontend/app/wholesale/layout.tsx` |
| Header | `components/layout/Header.tsx` → `HeaderTopBar.tsx` (switches between `header/HeaderDesktop.tsx`, `HeaderTablet.tsx` and `HeaderMobile.tsx`) + `HeaderNav.tsx` (desktop mega menu) + `MobileMenu.tsx` |
| Wholesale header | `components/layout/WholesaleHeader.tsx` → `WholesaleHeaderTopBar.tsx` (switches between `header/WholesaleHeaderDesktop.tsx`, `WholesaleHeaderTablet.tsx` and `WholesaleHeaderMobile.tsx`) + `WholesaleHeaderNav.tsx` |
| Footer | `components/layout/Footer.tsx`, shared by retail and wholesale. The blog uses `components/blog/BlogFooter.tsx`. |
| Homepage | `app/(site)/page.tsx` and `app/wholesale/page.tsx`, both rendering `components/pages/HomePageContent.tsx` |
| Shop / archive | `app/(site)/category/[slug]/{page,CategoryPageClient,CategoryGrid,CategoryFilters,CategoryHero}.tsx`, `app/(site)/brand/[slug]/page.tsx`, `app/(site)/hookahs/**` |
| Single product | `app/(site)/product/[slug]/{page,ProductDetailPageClient}.tsx`; wholesale: `app/wholesale/product/[slug]/WholesaleProductClient.tsx`; hardcoded Al Fakher: `app/(site)/shisha-tobacco/al-fakher/**` |
| Cart + checkout | `app/(site)/cart/CartPageClient.tsx` (1,192 lines; a multi-step checkout in one file), `components/cart/CartSidebar.tsx`, `components/providers/CartProvider.tsx` |
| Thank-you page | `app/(site)/order-received/page.tsx` |
| My Account (retail) | `app/(site)/account/**`, `components/account/AccountSidebar.tsx` |
| My Account (wholesale) | `app/wholesale/account/**` |
| WooCommerce template overrides | None (not applicable) |

### 2.3 Global styles, scripts and the dark/light toggle

- **Global CSS:** `frontend/styles/globals.css` (376 lines), imported in `app/layout.tsx` L4.
  - It loads the Montserrat Google Font (L1) and Tailwind (L2).
  - It defines colour tokens `--clr-*` (L9-37), the marquee keyframes (L85-101) and theme flash-prevention rules.
- **Fonts:** Montserrat is also loaded with `next/font/google` (`app/layout.tsx` L13-17), so it is loaded twice.
- **Dark/light theme:**
  1. `app/layout.tsx` L46-58 has a blocking inline script. It reads `localStorage['hookah-theme']` and sets `<html data-dark="true">` unless the value is `'light'`. **Dark is the default.**
  2. `app/layout.tsx` L60-108 has inline critical CSS keyed on `html[data-dark="true"]`, plus classes `.hookah-header-bg`, `.logo-light`/`.logo-dark`, `.brand-logo-white`/`.brand-logo-black`, etc. `globals.css` L103+ repeats these rules.
  3. `components/providers/ThemeProvider.tsx` handles the context: `toggleDark()` writes `localStorage['hookah-theme']` and toggles the `data-dark` attribute.
  4. The toggle buttons: `components/layout/header/HeaderDesktop.tsx` L12-30 (local `ThemeToggle`, retail) and `components/wholesale/ThemeToggle.tsx` (wholesale). Tablet and mobile headers have their own.
  5. Many components also branch on `useTheme().dark` in inline styles. Colours are therefore scattered through the code rather than centralised.

---

## 3. Plugins and custom code

### 3.1 WordPress plugins

| Plugin | Folder | Purpose | Custom? |
|---|---|---|---|
| **Wholesale Admin Manager** v4.1 | `wordpress-plugin/wholesale-admin-manager/` | Registers the roles `wholesale_pending` and `wholesale_customer`. Adds WP Admin → "Wholesale" (Applications / Approved Customers). Approve/Reject handlers change the role and POST a webhook to Next.js, which sends the email. | **Custom** |
| WooCommerce, WPGraphQL, WooGraphQL, WPGraphQL JWT Auth, ACF + WPGraphQL for ACF, possibly a meta-query extension | Not in repo | Data API for the headless frontend | Third-party. **Unverified**; installed on the CMS. |
| Brand plugin / SMTP plugin / security plugin / cache plugin | Not in repo | **Unknown.** Nothing in the code depends on them. | **Unverified** |

**Wholesale Admin Manager in detail:**

- **Main file `wholesale-admin-manager.php`:**
  - Constants `WAM_VERSION`, `WAM_PLUGIN_FILE`, `WAM_PLUGIN_DIR`, `WAM_PLUGIN_URL` (L24-27); `wam_load_includes()` (L36-51).
  - Hooks:
    - `admin_menu` → `wam_register_admin_menu` (L57)
    - `admin_enqueue_scripts` → closure loading `assets/admin.css` (L66)
    - `admin_post_approve_wholesale_user` → `wam_handle_approve_user` (L86)
    - `admin_post_reject_wholesale_user` → `wam_handle_reject_user` (L87)
    - `init` → `wam_register_roles` (L106-127; both roles get only the `read` capability)
    - Activation and deactivation hooks (L133, L144)
- **`includes/admin-menu.php`:** top-level menu slug `wholesale-applications` (capability `manage_woocommerce`, position 56, pending-count badge from `count_users()`), plus submenu `wholesale-customers`.
- **`includes/applications-page.php`:** a table of `wholesale_pending` users with a detail modal. Reads user meta `business_name`, `business_address`, `business_phone`, `gst_number`, `business_website`, `gst_certificate_url`, `business_license_url`, `identity_document_url` (L177-184).
- **`includes/actions.php`:**
  - **Approve:** `set_role('wholesale_customer')` (L142), writes `wholesale_approved_date`/`_by` (L148-149), then `do_action('wam_after_approve_user')` (L152). It POSTs `{userId,email,name}` to the hardcoded URL `https://thehookahstore.in/api/wholesale/approved` (L56-63) with `Authorization: Bearer <secret>`.
  - **Reject:** `set_role('customer')` (L199), then POSTs to `/api/wholesale/rejected` (L209).
  - **Secret:** taken from the wp-config constant `WAM_WEBHOOK_SECRET` if defined. **Otherwise it falls back to a hardcoded 64-hex secret at L61 and L206** (redacted; see §6).
- **No REST routes, no GraphQL fields, no options, and no `wp_mail`.**
  - The plugin does **not** register `showInWholesale`, `productRibbon` or any wholesale price field. Those must come from ACF or other plugins on the CMS (**Unverified**).
- **Zips:** `-v4.1.zip` is identical to the folder. v4 differs only in version strings, v3 has no reject webhook, v2 has only the approve webhook, and v1 is basic.

### 3.2 Custom code in the frontend

All of `frontend/` is custom. The feature-specific parts are listed below.

| Need from the brief | Where it is implemented | Notes |
|---|---|---|
| **Wholesale login / roles** | `app/api/auth/login/route.ts`, `app/api/auth/signup/route.ts`, `lib/woocommerce/wholesale.ts` (`wcSetCustomerRole` via WP REST `/wp/v2/users/{id}`, `wcSetWholesaleMeta` via WC REST), `middleware.ts`, `components/providers/AuthProvider.tsx`, `lib/auth/use-wholesale-session.ts` | See §4f |
| **Wholesale pricing** | **None exists.** The wholesale pages show the normal WooCommerce `price`. | See §4f |
| **Age verification popup** | `components/AgeGate.tsx` (modal) + `app/(site)/age-verification/page.tsx` (DOB form). `components/AgeVerification.tsx` is **dead code**. | See §4g |
| **Product badges** | `components/ProductCard.tsx` L18, L141-148 (rendering); `components/ProductSlider.tsx` L87-101 (ACF `productRibbon.ribbonType` → tag fallback); `app/(site)/category/[slug]/CategoryGrid.tsx` L50-55 (**guesses from the product name**) | "Exclusive" and "Top rated" badges do not exist. See §5 / §6. |
| **Homepage banner / slider** | `components/HeroSlider.tsx`, data from ACF: `GET_HOME_HERO_SLIDES` / `GET_WHOLESALE_HERO_SLIDES` in `lib/graphql/index.ts` L365/L383 | Managed in **WP Admin → Pages → "home" / "wholesale-home" → ACF "heroSlider" repeater** (fields `slide_image`, `mobile_image`, `badge_text`, `title`, `description`, `button_text`, `button_link`; `PROJECT_ARCHITECTURE.md` L698-712). Fallback slide: `/hero-vanilla.webp` (HeroSlider.tsx L99-109). `components/HeroSliderWrapper.tsx` is dead code. |
| **Email** | **Resend** over `fetch` (`lib/email/resend-client.ts`); templates in `lib/email/render-email.tsx`; senders in `lib/email/send-emails.tsx`. From: `The Hookah Store <no-reply@thehookahstore.in>`. | No SMTP. WP-side mail is unknown. See §4f. |
| **Newsletter** | `app/api/newsletter/subscribe/route.ts` → Brevo (`BREVO_API_KEY`, `BREVO_LIST_ID`) | The Brevo keys are commented out in `.env.local`, so this probably does nothing locally. |
| **WhatsApp / email enquiry for wholesale** | **Does not exist.** | See §4f |
| **Brand / category filters** | `app/(site)/category/[slug]/CategoryFilters.tsx`, `CategoryPageClient.tsx` | The brand filter is **display-only**. See §4e. |
| **Search** | `app/api/search/route.ts`, `components/search/LiveSearch.tsx`, `SearchDropdown.tsx` | The `/search` results page is a placeholder. |
| **Payments** | Razorpay: `app/api/payment/create-order`, `app/api/payment/complete-order` | See §4i |
| **Shipping** | `app/api/shipping/methods` (WC zones), `app/api/shipping/rates` + `lib/shiprocket/` (uncommitted), `app/api/shiprocket/{create-shipment,track}` | |
| **Internal admin panel** | `app/admin/**`, `app/api/admin/**`, `lib/admin/auth.ts` (untracked) | Single shared `ADMIN_PASSWORD`, compared with `!==` (`app/api/admin/login/route.ts` L15); cookie `hookah_admin_session` |
| **Security / Cloudflare** | No WAF or Turnstile code. `middleware.ts` guards routes. `lib/rate-limit.ts` exists, but its in-memory state does not persist across edge isolates. | Cloudflare dashboard settings are **Unverified** |

---

## 4. Detailed investigation

### a) Top warning banner (tobacco warning + Quitline)

- **One component serves both sites:** `frontend/components/layout/TopWarningBar.tsx`.
  - Rendered in the retail layout (`app/(site)/layout.tsx` L21) and the wholesale layout (`app/wholesale/layout.tsx` L26).
  - Hardcoded JSX: three red sections, "WARNING: TOBACCO CAUSES PAINFUL DEATH" (`bg-[#FF0000]`, 505px wide), and three black sections, "QUIT TODAY CALL 1800-11-2356".
  - The link `<a href="https://ntcp.mohfw.gov.in/" target="_blank">National Tobacco Quitline: 1800-11-2356</a>` appears at L35-43, L58-66 and L81-89. The whole block is rendered twice (`[...Array(2)]`, L21) for a seamless loop.
- **Animation:**
  - The class `animate-marquee-infinite` (L17) is defined in `frontend/styles/globals.css` L99-101 as `animation: marquee 60s linear infinite`.
  - The keyframes `@keyframes marquee` (L85-93) run `translateX(0)` → `translateX(-50%)`.
- **Hover pause (JS, not CSS `:hover`):**
  - `onMouseEnter={() => setPaused(true)}` / `onMouseLeave={() => setPaused(false)}` on the `<aside>` (L13-14).
  - They drive the inline `style={{ animationPlayState: paused ? 'paused' : 'running' }}` (L18).
  - Commit `dc1c515` (2026-07-01) removed the `animation-play-state: running !important;` rule from `.animate-marquee-infinite`, which had been overriding the pause.
  - **Current code should pause on hover.** If production still does not pause, the deployed build predates `dc1c515` or is cached.
  - **Hover only:** there is no pause on touch or keyboard focus, and no `prefers-reduced-motion` handling.
- **Second marquee (gold text, homepage only):** `components/layout/MarqueeBar.tsx`.
  - Keyframes are generated inline per `animationId` (`consumer-marquee` or `ws-marquee`), 28s.
  - Hover pause works the same way (L31-32, L47).
  - The text is hardcoded in `components/pages/HomePageContent.tsx` L34-41.
- **Hiding on scroll:** there is no JS hide. `TopWarningBar` sits *outside* the sticky `<header>`, so it simply scrolls away with the page.

### b) Header / navigation

- **Sticky behaviour:** `components/layout/Header.tsx` L10-13 renders `<header className="w-full sticky top-0 z-40 hookah-header-bg">`. The wholesale version is identical (`WholesaleHeader.tsx` L6-9).
  - The *whole* header sticks: logo/search bar (~80-110px) plus nav row.
  - `useScrolledPast(143)` (`lib/useScrolledPast.ts`) is called as `isStuck` in `HeaderNav.tsx` L154 and `WholesaleHeaderNav.tsx` L41, but **the value is never used**. It is leftover code.
- **Retail main menu is hardcoded:** `components/layout/HeaderNav.tsx`. There is no WP menu and no walker.
  - `NAV_ITEMS` (L129-136): Hookahs, Hookah Flavours, Hookah Charcoal, Hookah Accessories, Resources, Offers.
  - `NAV_HREFS` (L138-145): `/hookahs`, `/category/hookah-flavours`, `/category/hookah-charcoal`, `/category/hookah-accessories`, `/blog`, `/offers`.
  - `NAV_MEGA` (L25-127) holds the dropdown columns. Each column has a `heading`, a `shopAll` URL and `items`.
  - The mega panel is rendered in a React portal to `document.body` (L333-372). It opens on hover (80ms delay), closes on a 220ms timer, and a chevron button toggles it.
- **Can top-level titles link to their "Shop All" pages? Yes, they already do.** Each item is split into a `<Link href={NAV_HREFS[label]}>` for the title plus a chevron `<button>` for the dropdown (L394-430). To change a destination, edit `NAV_HREFS`.
  - Column headings (e.g. "Shop By Brand") are plain `<p>`. Each column's "Shop All" link sits under it (L274-277).
  - Many items are placeholders:
    - Every "Shop By Price" item links to the same unfiltered page.
    - "Shop By Type" (Fruity/Minty/Sweet/Floral) all link to `/category/hookah-flavours`.
    - Hookah "Shop By Brand" and "Shop Bundles" columns have empty `items`.
- **Mobile menu:** `components/layout/MobileMenu.tsx` L28-35 is a flat top-level list with no sub-categories, plus About/Support/Account lists and a "SHOP WHOLESALE" button → `/wholesale` (L182). That relative link means `thehookahstore.in/wholesale`, not the subdomain.
- **Wholesale menu:** `components/layout/WholesaleHeaderNav.tsx`, also hardcoded.
  - Arrays `HOOKAHS_ITEMS`, `SHISHA_ITEMS`, `CHARCOAL_ITEMS`, `ACCESSORIES_ITEMS`, `NICOTINE_ITEMS` (L10-37).
  - `navItems` (L91-99): Hookahs, Shisha Tobacco, Hookah Charcoal, Hookah Accessories, **Snoop Dogg, Cookies, Nicotine Pouches**.
  - **Every href points to `/wholesale/catalog/...`, and no `app/wholesale/catalog` route exists, so every wholesale menu link 404s.** See §4f.
  - The wholesale sub-brands (Fumari, Starbuzz, Coconut, Quick Light, ZYN, VELO) do not match the retail category slugs.
- **"Shop Wholesale" button in the retail header:** `components/wholesale/ShopWholesaleButton.tsx` L64.
  - Approved `wholesale_customer` → `/wholesale/account`, which is relative, so it lands on the retail domain.
  - Everyone else → `https://wholesale.thehookahstore.in/` in a new tab.

### c) Footer

- **Source:** hardcoded React in `frontend/components/layout/Footer.tsx` (703 lines), shared by the retail and wholesale layouts. There are no widgets, no Customizer and no WP menus.
  - `/blog` uses a separate `components/blog/BlogFooter.tsx`.
- **Link base:** `const R = process.env.NEXT_PUBLIC_APP_URL ?? ''` (L9). Menu links are absolute retail URLs, so they work from the wholesale subdomain.
- **Footer menus (L195-254):**
  - `shopLinks`: Hookahs → `${R}/hookahs`, Hookah Flavours → `/category/hookah-flavours`, Charcoal → `/category/hookah-charcoal`, Hookah Accessories → `/category/hookah-accessories`.
  - `aboutLinks`: About Us, Blog (opens in a new tab), FAQs, Rewards Program, "Refer a Friend, Get $10" (US-dollar copy; → `/rewards`), Business Opportunities, Coupon Codes.
  - `supportLinks`: Contact Us, My Orders, Shipping & Returns, Accessibility, Terms and Conditions, Privacy Policy, Cookies Policy.
  - Hrefs are in `navHrefs` (L215-240). Labels without an href render as a greyed-out `<span>`.
- **Feature strip (L144-182):** US-market template copy that needs review: "orders $95 or more", "carrier pigeon", "since 2000".
- **Brand block `FooterBrand()` (L284-331):**
  - Phone `+91 98410 00493`, email `thehookahstoreindia@gmail.com`.
  - **Instagram `<a href="#">` (L310) and YouTube `<a href="#">` (L313) are placeholders with no real URL.**
  - **"Shop Wholesale" `<Link href="/wholesale">` (L318-325) is relative**, so on the retail site it goes to `thehookahstore.in/wholesale` rather than `https://wholesale.thehookahstore.in`. That matches the bug in the brief. The fix is to use `getWholesaleUrl()` from `lib/config` or the absolute URL.
- **Copyright `FooterLegal()` (L418-480):** "Ⓒ Al Dhuvor LLP, 2026" (L456), "No. 9/5, Thiruvallur Street, MGR Nagar, Chennai, Tamil Nadu – 600078", "Tel. +91 98410 00493". Payment icons show Visa, Mastercard, **Amex and Discover** (a US template; Razorpay is the actual gateway).
- **Search results for the strings in the brief (excluding `node_modules`, `.git`, `out`):**

| String | Matches in live source |
|---|---|
| "Hookah Digital Services INC" | **None in source.** Only in the stale `frontend/out/` export (~20 HTML files, e.g. `out/index.html`, `out/404.html`, `out/wholesale/index.html`) |
| "Charlotte" | `frontend/app/(site)/contact/page.tsx:118` ("Charlotte, NC 28273"); `MASTER_PROJECT_SUMMARY.md:224` |
| "1-866" / "HOOKAHS" | `frontend/app/(site)/contact/page.tsx:105` ("1-866-HOOKAHS (866)466-5247") |
| "support@hookah.com" | `frontend/app/(site)/contact/page.tsx:85` |
| "hookah.com" (brand text) | `contact/page.tsx:85`, `app/(site)/accessibility-statement/page.tsx:218`, `app/(site)/faqs/page.tsx:156` |
| "Shop Wholesale" | `Footer.tsx:318,324`; `header/HeaderDesktop.tsx:66`; `header/HeaderTablet.tsx:68,85`; `MobileMenu.tsx:180,188`; `wholesale/ShopWholesaleButton.tsx:75` |
| "thehookahstore.in/wholesale" (literal) | None. The footer builds it from the relative `/wholesale`. |
| Instagram | `Footer.tsx:14,310-311` (`href="#"`); `blog/BlogFooter.tsx:8,165-169` (`href="#"`) |
| Al Dhuvor | `Footer.tsx:456`, `blog/BlogFooter.tsx:212`, and the legal pages (about, privacy, terms, cookies, shipping) |

- **If production still shows "Hookah Digital Services INC / Charlotte NC / 1-866-HOOKAHS" in the footer,** the live deployment predates commit `fd93f84` / the footer rework, or a cache is serving old HTML. Current source does not contain that footer.
- **The Contact page still carries the US template details** (Charlotte address, 1-866 number, support@hookah.com) and needs updating: `app/(site)/contact/page.tsx` L85, L105, L118.

### d) Product categories

- **The category tree lives in WooCommerce** (`product_cat`). No dump exists, so the real tree is **Unverified**.
- **The slugs the code expects are hardcoded:**
  - **Hookahs** → `hookahs` (`app/(site)/hookahs/page.tsx` L16). Sub-pages shop-by-brand, shop-by-bundle and shop-by-price are hardcoded or unfiltered.
  - **Hookah Flavours** → `hookah-flavours`. Brands *are categories*: `al-fakher`, `afzal`, `mya`, `oduman-blend`, `royal-smokin` (`HeaderNav.tsx` L59-63; `lib/graphql/index.ts` `GET_HOMEPAGE_BRANDS` L582-709). Whether they are children of `hookah-flavours` in WC is **Unverified**.
  - **Charcoal** → `hookah-charcoal`, children `coco-nara` and `cocous` (`HeaderNav.tsx` L88-102; `CategoryPageClient.tsx` breadcrumb map `CHARCOAL_SUBS`).
  - **Hookah Accessories** → `hookah-accessories`, children `hookah-bowls`, `hookah-hoses`, `other-hookah-accessories` (`HeaderNav.tsx` L104-123; `ACCESSORIES_SUBS`).
- **Rendering:** `app/(site)/category/[slug]/page.tsx` L33-36 runs `GET_PRODUCT_CATEGORY` (cache 1h) and `GET_PRODUCTS_BY_CATEGORY {slug, first:60}` (cache 5 min).
  - There is no pagination.
  - Unknown slugs render an empty page, not a 404.
  - Hero copy and FAQs per slug are hardcoded in `CategoryHero.tsx` L6-59 and `CategoryPageClient.tsx` L37-68. `CategoryHero` uses the key `alfakher`, while the real slug is `al-fakher`.
- **Homepage:** there is no category grid. It shows five hardcoded brand sections (Al Fakher, Afzal, Royal Smokin, Oduman, Mya), each a `ProductSlider` fed by `GET_HOMEPAGE_BRANDS` (first 5 products per brand category) (`components/pages/HomePageContent.tsx` L45-214).
- **Footer:** hardcoded category links (see §4c).

### e) Brand filter

- **Model:** brands are **WooCommerce product categories**, not a `product_brand` taxonomy, a `pa_brand` attribute or ACF. See `app/(site)/brand/[slug]/page.tsx` L30-35 (the comment says so explicitly) and commit `9c7e62b` ("brand pages now query by category slug instead of tags"). `GET_PRODUCTS_BY_TAG` (`lib/graphql/index.ts` L496) is dead code.
- **Brand page:** `/brand/[slug]` → `GET_PRODUCTS_BY_CATEGORY` with `where: { category: $slug }`, `first: 60`.
  - The breadcrumb parent is always "Hookah Flavours" (L51-52).
  - A missing category is faked, so the page shows 0 products instead of a 404 (L41-48).
- **Brand filter on category pages** (`CategoryFilters.tsx` L279-281): the "BRAND" control is **display-only** (no handler). `brandOptions` is built only from attributes whose name contains "brand" (`CategoryPageClient.tsx` L131-138) and is never rendered.
- **Hookah "Shop by Brand" page** (`app/(site)/hookahs/shop-by-brand/ShopByBrandClient.tsx`):
  - A hardcoded list of 9 brands with local images (L10-20).
  - The "SHOP NOW" buttons have no link (L136-154).
  - The FAQs are lorem ipsum.
- **Why brand products may not appear:**
  1. A product is not assigned to the brand's **category**. A tag, attribute or `product_brand` taxonomy (e.g. from WooCommerce's built-in Brands feature) would not be read.
  2. The category slug in WP differs from the hardcoded slug (`al-fakher`, `afzal`, `royal-smokin`, `oduman-blend`, `mya`).
  3. **Homepage sliders:** `GET_HOMEPAGE_BRANDS` also requests `productRibbon { ribbonType }` (L595, L602, L620…). If that ACF field is not exposed to GraphQL, **the whole query errors**. `fetchGraphQLSafe` (L54-90) then silently returns `null` (no log in production), and all five sliders show "No products found".
  4. Only Simple and Variable product fragments are queried, so grouped or external products lose price and attributes.
  5. Caps of `first:60` / `first:5` with no pagination.
  6. Caching: product lists 5 min, category meta 1h (`next.revalidate`). Whether ISR behaves as intended on Cloudflare/next-on-pages is **Unverified**.
- **Al Fakher trap:** the Al Fakher logo link and `/shisha-tobacco` go to `/shisha-tobacco/al-fakher`. That page shows **12 hardcoded fake products** from `app/(site)/shisha-tobacco/al-fakher/al-fakher-products.ts`, with fake `databaseId` 1001-1012 and one placeholder image. Real Al Fakher stock only appears on `/brand/al-fakher`. Adding a fake item to the cart would break checkout, because WooCommerce has no product 1001.

### f) Wholesale subdomain

**Login and registration flow and roles**

- **Registration:** `/wholesale/register` (`app/wholesale/register/WholesaleRegisterClient.tsx`). A second, older UI at `/wholesale/auth` (`app/wholesale/auth/page.tsx`) does the same thing.
  - Both POST `/api/auth/signup` with `registrationSource: 'wholesale'`, then upload documents to `/api/wholesale/upload-documents` (WP media via Application Password, `lib/woocommerce/media.ts`).
- **`app/api/auth/signup/route.ts`:**
  1. Creates the customer with **WooGraphQL `registerCustomer`** (`lib/auth/auth-graphql.ts`).
  2. For wholesale, `wcSetCustomerRole(id,'wholesale_pending')` via WP REST `/wp/v2/users/{id}`, using `WP_ADMIN_USERNAME`/`WP_ADMIN_APP_PASSWORD`. The WP user (`nextjs_api`) needs `edit_users`. This call is **non-fatal on failure** (L124-128).
  3. `wcSetWholesaleMeta` writes WC customer meta `account_type=wholesale`, `approval_status=pending` and the business fields (L131-144).
  4. Fire-and-forget `sendWholesaleApplicationEmail` (L147-151).
  5. Returns HTTP 202. No session is created.
- **Approval** happens in WP Admin → Wholesale → Applications (plugin): the role becomes `wholesale_customer` and a webhook fires → `/api/wholesale/approved` → Resend email. Alternatively, the new untracked Next admin uses `/api/admin/wholesale/approve`.
- **Login:** `/wholesale/login` → `/api/auth/login` with `loginSource:'wholesale'` (`app/api/auth/login/route.ts`).
  - GraphQL JWT login, then WC customer lookup by email.
  - Approved if the role is `wholesale_customer` **or** the meta says `account_type=wholesale` + `approval_status=approved` (L69-80).
  - Pending accounts are **blocked from logging in anywhere** (L83-88).
  - A non-approved user on the wholesale portal gets a 403 (L91-96).
  - The session JWT (`hookah_session`, host-only cookie) carries `role` as `wholesale_customer` or `customer` (L100-121). It is never `wholesale_pending`, so the middleware's pending branch (`middleware.ts` L108-116) is unreachable.
- **Roles:** `customer` (WooCommerce), `wholesale_pending`, `wholesale_customer` (plugin).

**Why logged-in wholesalers get 404s (most likely first)**

1. **Every wholesale menu link targets a route that does not exist.** `WholesaleHeaderNav.tsx` L10-99 points to `/wholesale/catalog/hookahs`, `/wholesale/catalog/shisha/...`, `/wholesale/catalog/snoop-dogg`, `/wholesale/catalog/nicotine-pouches/zyn`, etc. There is no `app/wholesale/catalog/`. `app/wholesale/` only contains `account`, `auth`, `login`, `product/[slug]`, `register`, `reset-password` and `page.tsx`.
   - **Logged-out users** are redirected to login by `middleware.ts` L83-91 before they reach the 404.
   - **Approved users** pass the guard and hit Next's 404 (`app/not-found.tsx`). This is the reported behaviour.
2. The `_redirects` domain rule could double-prefix paths (`/wholesale/wholesale/...`) if Cloudflare applies it (**Unverified**, §1.4).
3. The session is host-only. Logging in at `thehookahstore.in/wholesale/login` does not log the user in on `wholesale.thehookahstore.in`, which shows up as redirects to login rather than 404s.
4. This is not a WordPress rewrite, permalink or `template_redirect` problem. WordPress does not route any storefront URL.

**Pricing, visibility, and "Base Grommet"**

- **Hiding prices before login is client-side UI only:**
  - `components/ProductCard.tsx` L65, L212-265: `useWholesaleSession().isApproved`, otherwise "Log in to view price".
  - `WholesaleProductClient.tsx`: `PurchaseSection` renders by role.
  - The prices are still public. The wholesale product page fetches the product **directly from the public GraphQL endpoint in the browser** (`WholesaleProductClient.tsx` L13-35, ~L173-180), and anyone can query `/graphql` for prices.
  - `middleware.ts` L33-35 explicitly makes `/wholesale/product/*` public.
- **How wholesale prices are set:** **they are not.** Wholesale pages show the ordinary WooCommerce `price` (retail price), labelled "wholesale price" (`WholesaleProductClient.tsx` L114-120). No wholesale price field, per-role or tier price, or per-customer price is queried anywhere.
  - `ADMIN_PANEL_UPGRADE_PLAN.md` L23 mentions a planned "Wholesale Price" field. It is not implemented.
  - A WP-side wholesale-pricing plugin could exist (**Unverified**), but the frontend would ignore it.
- **"Shown in wholesale" flag:** the only reference is ACF/meta `showInWholesale`, used **only by the wholesale search** (`WHOLESALE_SEARCH_QUERY`, `lib/graphql/index.ts` L137: `metaQuery:{key:"showInWholesale", value:"1", compare:EQUAL}`). That argument requires a meta-query GraphQL extension. Without it, wholesale search errors, and `/api/search` has no try/catch, so it returns a 500.
  - The wholesale homepage uses the same `GET_HOMEPAGE_BRANDS` as retail, with no wholesale filter.
- **Why "Base Grommet" would not appear on wholesale:**
  - There is no wholesale catalog or category page at all.
  - The wholesale homepage only shows five shisha brands.
  - So an accessory like Base Grommet can only be found through wholesale search, which requires its `showInWholesale` meta to be exactly `"1"` and the meta-query extension to be installed. Direct `/wholesale/product/<slug>` URLs still work.

**Wholesale "My Account" (`app/wholesale/account/**`)**

- Nav `WHOLESALE_NAV` (`WholesaleAccountClient.tsx` L47-53): `/wholesale/account` (overview), `/wholesale/account/orders`, `/wholesale/account/saved`, `/wholesale/account/business`. All four routes exist.
- **Orders** (`orders/WholesaleOrdersClient.tsx`) and **Saved** (`saved/WholesaleSavedClient.tsx`) are **static placeholders** ("No wholesale orders yet"). They fetch nothing.
- **Business** shows profile info and a `mailto:wholesale@thehookahstore.in`.
- **"Change Password"** (L169) → `/wholesale/reset-password`, which is a **disabled stub**: "🚧 Password reset coming soon — UI foundation only" (`app/wholesale/reset-password/page.tsx`).
- The wholesale header cart icon is a non-clickable `<div>` (`header/WholesaleHeaderDesktop.tsx` L61-73). There is no wholesale cart page or checkout.
- Retail pages also have dead business links: "Log in Business Account" `href="#"` (`app/(site)/account/login/LoginClient.tsx` L88) and "Create Business Account" `href="#"` (`account/register/CreateAccountClient.tsx` L190).

**Account-creation and password-reset emails**

- **Provider:** **Resend** HTTP API (`lib/email/resend-client.ts`), from `no-reply@thehookahstore.in`. No SMTP plugin is involved on the Next.js side.
- **Emails the frontend sends:**
  - welcome and verification (retail signup)
  - password reset and reset success
  - wholesale application received
  - wholesale approved / rejected (via the plugin webhook)
- **Not sent by the frontend:** order confirmation emails. These come from WooCommerce's own mailer when the order is created via REST, if those WC emails are enabled. **Unverified:** WP Admin → WooCommerce → Settings → Emails, and whatever SMTP plugin is on the CMS.
- **Why wholesalers may not get emails:**
  1. **There is no working wholesale password reset.** `/wholesale/reset-password` is a stub. The retail `/forgot-password` → `/api/auth/forgot-password` does work for any email, but its link goes to the retail `${NEXT_PUBLIC_APP_URL}/reset-password`.
  2. **Fire-and-forget on Cloudflare Workers.** The wholesale application email (`signup/route.ts` L147-151), the retail verification email (L200-210) and the Brevo call are `void promise` with no `waitUntil`. On Workers, pending work can be cancelled once the response is returned, so these emails are likely to be dropped intermittently. The retail welcome email is `await`ed (L192) and therefore more reliable.
  3. `RESEND_API_KEY` missing → `sendEmail` logs and returns silently (`resend-client.ts` L20-24).
  4. The Resend sending domain `thehookahstore.in` must be verified in Resend (SPF/DKIM); commit `ea14d19` hints this was an issue. **Unverified.**
  5. **The approval email depends on the plugin webhook:**
     - the URL is hardcoded to `https://thehookahstore.in` (actions.php L56, L209)
     - the secret must match `WHOLESALE_WEBHOOK_SECRET` in Cloudflare
     - failures are only written to PHP `error_log`, with no retry
  6. `forgot-password` always returns 200 and swallows errors (L50-53), so failures are invisible to the user.
  7. WooCommerce's own "new account" email may or may not fire for `registerCustomer`. **Unverified;** it depends on WC email settings and CMS mail/SMTP configuration.

**Orders / enquiries via WhatsApp or email instead of payment**

- **Not implemented.** There is no `wa.me`, WhatsApp, enquiry or quote code anywhere.
- Wholesale "Add to cart" (`WholesaleProductClient.tsx` L209-215) writes to a `localStorage` cart keyed `wholesale_cart` (`CartProvider storageKey`, `app/wholesale/layout.tsx` L22). There is **no page or button to submit that cart.** `WholesaleCartGuard` clears it for non-approved users.
- The only contact route is `mailto:wholesale@thehookahstore.in` on the account pages.

**Snoop Dogg, Cookies, nicotine pouches**

- **Wholesale menu:** "Snoop Dogg" → `/wholesale/catalog/snoop-dogg`, "Cookies" → `/wholesale/catalog/cookies`, "Nicotine Pouches" → `/wholesale/catalog/nicotine-pouches` with ZYN and VELO (`WholesaleHeaderNav.tsx` L33-37, L96-98). All of these 404.
- **Retail:** placeholder pages `/snoop-dogg` (`app/(site)/snoop-dogg/page.tsx`, "Coming soon.") and `/cookies` (`app/(site)/cookies/page.tsx`, "Cookies Collection – Coming soon."). They are not linked from the retail nav.
  - Do not confuse `/cookies` with `/cookies-policy`.
- **Nothing else:** no product data, category query, banner or image for these brands exists in the repo. A nicotine warning line appears in the checkout (`CartPageClient.tsx` ~L845).
- The stale `frontend/out/snoop-dogg/` folder is an old export.

### g) Age verification popup

- **Flow:**
  1. `components/AgeGate.tsx` wraps `<main>` and the footer in the **retail** layout only (`app/(site)/layout.tsx` L23-26). The header and warning bar stay visible. **The wholesale layout has no age gate.**
  2. On mount, if `localStorage['ageVerified'] !== 'true'`, the modal "Are you 21 or older?" is shown (L28-38). `DEV_TEST_MODE = false` (L10) forces it on every load when set to true.
  3. **Yes** → `router.push('/age-verification')`. **No** → redirect to google.com after 3s.
  4. `app/(site)/age-verification/page.tsx` is a DOB form (Month/Day/Year). If age ≥ 21 it sets `localStorage['ageVerified']='true'` (L62-64); otherwise it redirects to Google.
- **Data passed into signup / guest checkout:**
  - The checkout step "Age Verification" (`AgeVerificationCard` in `CartPageClient.tsx` ~L732-770) pre-fills the DOB from `localStorage['ageDOB']` and re-validates age ≥ 21 on the client.
  - **Bug: nothing in the active flow writes `ageDOB`.** Only the unused `components/AgeVerification.tsx` (L70-71, L103-104) sets it, and that component is imported nowhere. The auto-fill therefore never works.
  - The DOB is **never sent to the server**: not to `/api/auth/signup` and not to `/api/payment/complete-order`. It is not stored on the WC customer or order.
  - Age is checked purely on the client and can be bypassed trivially.
- **Inconsistent age thresholds:** everything uses 21. Indian COTPA uses 18. The legal pages should be checked for consistency (business decision).

### h) About page

- `frontend/app/(site)/about/page.tsx` (281 lines) is a **client component with hardcoded JSX text**.
- Images are in `frontend/public/about/` (three Figma-hash PNGs).
- The content includes Al Dhuvor LLP, LLPIN and GSTIN (L79-87, L262).
- No WordPress content is used. Edits are code changes plus a redeploy.

### i) Checkout (tax and customisations)

- **Checkout:** entirely custom in `app/(site)/cart/CartPageClient.tsx`. It is not WooCommerce checkout.
  - **Steps:** email/login/guest (`GuestCard`, `NewUserCard`) → shipping address → shipping method → age verification → payment (`MakePaymentCard` ~L875).
  - **Guest checkout** is supported. An invalid email falls back to `guest.<paymentId>@thehookahstore.in` (`complete-order/route.ts` L138-141).
- **Payment:**
  1. The client computes `total = subtotal − discount + shipping` (`CartPageClient.tsx` ~L884-885) and POSTs the amount in paise to `/api/payment/create-order`, which creates a Razorpay order for **whatever amount the client sends** (`create-order/route.ts` L9-28).
  2. The Razorpay checkout runs.
  3. `/api/payment/complete-order` verifies the HMAC signature (L101-114), re-validates the coupon via WC REST (L21-73), then creates the WC order via REST `POST /wc/v3/orders` with `set_paid:true, status:'processing', payment_method:'razorpay'`, line items, shipping line, coupon lines and Razorpay IDs in meta (L169-191).
  4. It then fires a Shiprocket shipment (uncommitted, L193-235).
- **Tax — "how was sales tax removed?":**
  - **The frontend never computes or displays tax.** The totals are Subtotal, coupon, shipping and Total (`CartPageClient.tsx` L183, L237-322). "incl. taxes" is printed on product pages (`ProductDetailPageClient.tsx` L202). `order-received/page.tsx` L179 shows "Tax: To be calculated".
  - No `tax_lines` or tax-exempt flags are sent to WooCommerce.
  - Whether WooCommerce itself adds tax to the REST-created order depends on **WP Admin → WooCommerce → Settings → General → "Enable tax rates and calculations"** and the tax rates/classes (**Unverified**). If taxes are enabled there, the WC order total will differ from what Razorpay charged.
- **Other checkout customisations and issues:**
  - **Orders are not linked to the logged-in customer.** No `customer_id` is sent (L169-191), so orders will not appear in the customer's WC account ("My Orders").
  - **No variation IDs.** Every `addToCart` call passes `variationId = null` (`ProductCard.tsx` L111, `ProductDetailPageClient.tsx` L67, `WholesaleProductClient.tsx` L212, Al Fakher pages), so variable products (50g/250g/1kg) are ordered as the parent product. WC line-item price and stock will be wrong, or the order can fail.
  - **The server never checks the amount.** The Razorpay amount is not compared with the WC order total. A tampered client can pay less and still get a "paid" order.
  - **Signature verification can be skipped.** If `RAZORPAY_KEY_SECRET` is missing, verification is skipped and the order is still created and marked paid (L102-103).
  - **Test-mode Razorpay:** the committed `wrangler.toml` sets the public Razorpay key ID to a **test-mode key** (`rzp_test_…`). Check that production uses live keys.
  - **Shipping:** WC shipping zones (`/api/shipping/methods`) are being replaced by Shiprocket rates (`/api/shipping/rates`, uncommitted). Weight is assumed to be 0.5 kg per item.
  - **Checkout links:** Terms/Privacy links in the checkout are `href="#"` (`CartPageClient.tsx` L537-539).

---

## 5. Products and data

- **How products are added:** only in **WP Admin → Products (WooCommerce)**, plus the new untracked Next admin (`app/admin/products/**`, `app/api/admin/products/[id]`), which edits via WC REST.
  - There are no CSV, JSON or XML import files and no scripts in the repo.
  - The only product "data" in code is the hardcoded `app/(site)/shisha-tobacco/al-fakher/al-fakher-products.ts` (12 fake products).
- **Attributes and variations:**
  - Size or weight attributes are detected by name containing `size`/`weight` (`ProductDetailPageClient.tsx` L28-57; `CategoryPageClient.tsx` L123-129 also accepts `pack`).
  - The homepage slider falls back to the pills `['1Kg','250g','50g']` (`ProductSlider.tsx` L112-125). The Al Fakher data uses `['50G','250G','1KG']`.
  - Real attribute names and terms are in WooCommerce → Products → Attributes (**Unverified**).
- **Known data-matching bugs:**
  - Variation price is matched by **substring** (`v.name.includes(size)`), so "250g" also matches "50g", and the wrong price can be shown or charged (`ProductSlider.tsx` L119-124, `ProductDetailPageClient.tsx` L39-54, `WholesaleProductClient.tsx` L185-205).
  - `CategoryGrid.tsx` L41 keys variation prices by `attributes.nodes[0].value`. That may be a term slug rather than a label.
  - `stockStatus` is fetched on product detail but ignored, so out-of-stock items can be added.
  - `GET_PRODUCT_DETAIL` has no `first:` on `variations`, so it gets the default page size (10).
- **Badges:**
  - Homepage: ACF `productRibbon.ribbonType` (`back_in_stock`/`new`/`limited`), falling back to tags "BACK IN STOCK"/"NEW". "Limited" has no tag fallback.
  - **Category, brand and hookah pages guess the badge from the product name** (`CategoryGrid.tsx` L52-55: `includes('new')` → NEW, `includes('limited')`, `includes('back')` → BACK IN STOCK). "**Black** Grape" therefore shows "BACK IN STOCK".
  - "Exclusive" and "Top rated" badges do not exist.

---

## 6. Risks and notes (read before editing)

**Security (act on these first)**

1. **Committed WooCommerce REST credentials.** `WOOCOMMERCE_CONSUMER_KEY` and `WOOCOMMERCE_CONSUMER_SECRET` are in plaintext in the tracked file `frontend/wrangler.toml` `[vars]`, despite its comment saying there are no secrets. **Revoke and rotate** in WooCommerce → Settings → Advanced → REST API, and move them to Cloudflare secrets.
2. **GitHub personal access tokens in the git remote URLs** (`.git/config`: `origin`, `backup`, `cloudflare`). Revoke them and switch to a credential helper or SSH.
3. **Hardcoded webhook secret** in `wordpress-plugin/wholesale-admin-manager/includes/actions.php` L61 and L206, also in the v2-v4.1 zips and the git history. Rotate it, define `WAM_WEBHOOK_SECRET` in `wp-config.php` and update `WHOLESALE_WEBHOOK_SECRET` in Cloudflare.
4. **JWT fallback secret.** `middleware.ts` L37-39 (and `lib/auth/index.ts`, `lib/admin/auth.ts`) fall back to the literal `'hookah-dev-secret-change-in-production'` if `JWT_SECRET` is unset. Anyone could then forge sessions, including `wholesale_customer` and admin sessions.
5. **Payments:** the client controls the payment amount, signature checks are skipped when the secret is missing, orders have no variation IDs and no customer link (§4i).
6. **Plugin admin XSS:** applicant-supplied URLs are put into `href` without a scheme check (`applications-page.php` ~L495, L518), so a `javascript:` URL is possible. Nonces are not tied to the user ID.
7. **Admin panel:** single shared `ADMIN_PASSWORD` with a plain `!==` comparison. `lib/rate-limit.ts` keeps state in memory, which does not persist on edge isolates.
8. **`.env.local`** contains a raw `WP_ADMIN_PASSWORD` that the code never uses. Remove it.

**Fragile, hardcoded or duplicated**

- **Hardcoded navigation:** all menus (header, mega menu, mobile, wholesale, footer) are hardcoded. There is no WP menu integration, so category changes in WooCommerce do **not** update the menus.
- **Hardcoded content:** homepage brand sections, the marquee text, the hero fallback, the blog teaser cards (three identical dummies), About/legal/Contact pages, FAQs and the Al Fakher catalogue.
- **Silent failures:** `fetchGraphQLSafe` returns null silently in production, so broken queries look like "no products". `validateEnv()` is never called.
- **Duplicates:**
  - Two wholesale registration UIs (`/wholesale/register`, `/wholesale/auth`).
  - Two age-verification components (`AgeVerification.tsx` is unused).
  - `HeroSliderWrapper.tsx` is unused.
  - Hero dimensions are duplicated in `HeroSlider.tsx` and `lib/utils/slider-dims.ts`.
  - Theme CSS is duplicated in `app/layout.tsx` and `globals.css`.
  - Montserrat is loaded twice.
- **US template leftovers:**
  - The Contact page (Charlotte, 1-866, support@hookah.com).
  - FAQs and Accessibility pages mention "Hookah.com".
  - Footer: "$95", "Refer a Friend, Get $10", Amex/Discover icons.
  - Metadata says `thehookahstore.com` (`app/layout.tsx` L20-30), while the live domain is `.in`.
- **Relative `/wholesale` links** (footer L321, mobile menu L183, `ShopWholesaleButton` for approved users) land on `thehookahstore.in/wholesale` instead of the subdomain. They also expose a duplicate copy of the wholesale site on the retail domain.
- **Plugin webhook URLs** are hardcoded to production (`actions.php` L56, L209), so staging would email real customers.
- **Stale export:** `frontend/out/` (Feb 2026) contains the old "Hookah Digital Services INC" footer. It is git-ignored and not deployed, but it will confuse any grep. Deleting it is safe.
- **Placeholder pages:** `/outlet`, `/snoop-dogg`, `/cookies`, `/search`, `/wholesale/reset-password`, and wholesale Orders/Saved. `/offers` is static copy.

**Caching layers that can hide changes**

- **Next.js data cache / ISR:**
  - Homepage and wholesale homepage: `revalidate = 300` (5 min).
  - Product and category lists: 300 s. Category meta: 3600 s (1 h). Brand pages: 3600/300.
  - Whether next-on-pages honours these on Cloudflare is **Unverified**.
- **Cloudflare CDN / cache rules** for `thehookahstore.in` and `cms.thehookahstore.in`: **Unverified** (check the Cloudflare dashboard → Caching / Rules).
- **WordPress page or object cache plugins on the CMS:** **Unverified.** They could delay GraphQL changes.
- **Browser `localStorage`:** `ageVerified`, `hookah-theme`, the cart keys (retail default key and `wholesale_cart`). Clear these when testing.

**Before editing**

- Uncommitted changes are in progress (Shiprocket, `/admin`, `/track`). Coordinate with whoever is working on them, and do not overwrite `CartPageClient.tsx`, `complete-order/route.ts` or `middleware.ts` blindly.
- **Cloudflare build requirements:**
  - Every page and route must keep `export const runtime = 'edge'`.
  - For client pages, `'use client'` must stay the first line.
  - `generateStaticParams` was removed for edge compatibility; do not re-add it.
  - Node-only APIs (`node:crypto`, the Resend SDK) break the build.
- There are no automated tests, and ESLint is disabled during builds.

---

## 7. Quick reference

| Feature | File path(s) / setting location | Controlled by | Notes |
|---|---|---|---|
| Hosting / build | `frontend/wrangler.toml`, `frontend/package.json` (`pages:build`), Cloudflare Pages dashboard | code + Cloudflare | Edge runtime everywhere |
| Wholesale subdomain routing | `frontend/middleware.ts` L67-75; `frontend/public/_redirects`; `frontend/lib/config/index.ts` | code | One app, two hosts; `_redirects` rule probably inert |
| Wholesale route guard | `frontend/middleware.ts` L23-127 | code | Public: `/wholesale`, `/login`, `/register`, `/reset-password`, `/auth`, `/product/*` |
| Top warning banner | `components/layout/TopWarningBar.tsx`; `styles/globals.css` L85-101 | code | Hover pause through React state → `animationPlayState` |
| Homepage gold marquee | `components/layout/MarqueeBar.tsx`; text in `components/pages/HomePageContent.tsx` L34-41 | code | Hover pause, desktop only |
| Sticky header | `components/layout/Header.tsx` L10-13, `WholesaleHeader.tsx` | code | `sticky top-0 z-40`; the banner scrolls away naturally |
| Retail mega menu | `components/layout/HeaderNav.tsx` (`NAV_MEGA` L25, `NAV_ITEMS` L129, `NAV_HREFS` L138) | code (hardcoded) | Top-level titles already link |
| Mobile menu | `components/layout/MobileMenu.tsx` | code | No sub-categories |
| Wholesale menu | `components/layout/WholesaleHeaderNav.tsx` L10-99 | code | **All links → nonexistent `/wholesale/catalog/*` (404)** |
| Footer | `components/layout/Footer.tsx` (menus L195-254, brand L284-331, copyright L418-480) | code | Instagram/YouTube `href="#"`; "Shop Wholesale" is the relative `/wholesale` |
| Blog footer | `components/blog/BlogFooter.tsx` | code | Social `href="#"` |
| Contact details (legacy US) | `app/(site)/contact/page.tsx` L85, L105, L118 | code | Charlotte / 1-866 / support@hookah.com |
| Dark/light theme | `app/layout.tsx` L46-108; `components/providers/ThemeProvider.tsx`; `styles/globals.css` | code + localStorage `hookah-theme` | Dark by default |
| Hero slider | `components/HeroSlider.tsx`; `lib/graphql/index.ts` L365, L383 | **WP admin (ACF "heroSlider" on pages `home` / `wholesale-home`)** | Fallback `/hero-vanilla.webp` |
| Homepage brand sliders | `components/pages/HomePageContent.tsx`; `GET_HOMEPAGE_BRANDS` L582-709 | code + WC categories | One failed field (`productRibbon`) blanks all five |
| Categories | WooCommerce `product_cat`; `app/(site)/category/[slug]/*` | **WP admin** + hardcoded slugs | `first:60`, no pagination |
| Brands | WooCommerce categories; `app/(site)/brand/[slug]/page.tsx` | **WP admin** | Not a taxonomy or attribute; the brand filter does nothing |
| Product badges | `ProductSlider.tsx` L87-101 (ACF `productRibbon` / tags); `CategoryGrid.tsx` L52-55 (name guess) | ACF (WP) + code | Name-guess bug |
| Wholesale visibility | ACF/meta `showInWholesale` = "1"; `WHOLESALE_SEARCH_QUERY` L137 | **WP admin (product meta)** | Used by search only |
| Wholesale pricing | none | — | Retail `price` is shown as "wholesale price" |
| Price hiding | `components/ProductCard.tsx` L212-265; `WholesaleProductClient.tsx` | code (client-side) | Prices are public through GraphQL |
| Wholesale roles and approval | `wordpress-plugin/wholesale-admin-manager/**`; `lib/woocommerce/wholesale.ts`; `app/api/auth/{signup,login}` | plugin + code | Roles `wholesale_pending` / `wholesale_customer`; meta `account_type`, `approval_status` |
| Approval / rejection emails | `includes/actions.php` L56-63, L206-209 → `app/api/wholesale/{approved,rejected}/route.ts` | plugin + code + Cloudflare secret | Hardcoded URL and fallback secret |
| Transactional email | `lib/email/*` (Resend) | code + `RESEND_API_KEY` + Resend domain | Fire-and-forget sends can be dropped on Workers |
| Wholesale password reset | `app/wholesale/reset-password/page.tsx` | code | **Stub, not functional** |
| Retail password reset | `app/(site)/forgot-password`, `app/api/auth/{forgot,reset}-password` | code | Custom JWT + WC REST password update |
| Wholesale account dashboard | `app/wholesale/account/**` | code | Orders/Saved are placeholders |
| Wholesale cart / enquiry | `CartProvider` key `wholesale_cart` | code | **No checkout, WhatsApp or email submission** |
| Snoop Dogg / Cookies / Nicotine | `WholesaleHeaderNav.tsx` L33-37, L96-98; `app/(site)/snoop-dogg`, `app/(site)/cookies` | code | Menu stubs and "coming soon" pages only |
| Age gate | `components/AgeGate.tsx`; `app/(site)/age-verification/page.tsx`; checkout `AgeVerificationCard` in `CartPageClient.tsx` ~L732 | code + localStorage `ageVerified` | Retail only; `ageDOB` never written; DOB never saved server-side |
| About page | `app/(site)/about/page.tsx`; `public/about/*` | code | Hardcoded |
| Checkout | `app/(site)/cart/CartPageClient.tsx`; `app/api/payment/{create-order,complete-order}` | code + Razorpay | No tax, no variation IDs, no customer link, client-set amount |
| Tax settings | WP Admin → WooCommerce → Settings → General / Tax | **WP admin** | Unverified whether enabled |
| Shipping | `app/api/shipping/{methods,rates}`; `lib/shiprocket/*` (uncommitted); WC shipping zones | code + WP admin + Shiprocket | Moving to Shiprocket |
| Coupons | `app/api/coupons/validate`; re-checked in `complete-order` L21-73 | WP admin (WC coupons) + code | |
| Search | `app/api/search/route.ts`; `components/search/*` | code | Wholesale mode needs a meta-query extension; `/search` page is a placeholder |
| Internal admin | `app/admin/**`, `app/api/admin/**`, `lib/admin/auth.ts` | code + `ADMIN_PASSWORD` | Untracked, in progress |
| Env vars / secrets | `frontend/.env.local` (ignored), `frontend/wrangler.toml` (tracked, **contains WC keys**), Cloudflare dashboard | Cloudflare | `validateEnv()` is never called |
| Caching | `export const revalidate` per page; `fetchGraphQL(…, revalidate)`; Cloudflare; CMS cache (unknown) | code + infrastructure | 5 min to 1 h staleness |
