# PROJECT_ARCHITECTURE.md
# The Hookah Store — Full Technical Documentation

> **Target audience:** Developer joining the project  
> **Last updated:** March 2026  
> **Status:** Production-ready codebase

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Repository Structure](#3-repository-structure)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Data Flow Architecture](#5-data-flow-architecture)
6. [WordPress Integration](#6-wordpress-integration)
7. [WooCommerce System](#7-woocommerce-system)
8. [Wholesale System](#8-wholesale-system)
9. [Custom WordPress Plugin](#9-custom-wordpress-plugin)
10. [Authentication System](#10-authentication-system)
11. [API Routes](#11-api-routes)
12. [Email System](#12-email-system)
13. [ACF Content System](#13-acf-content-system)
14. [Environment Variables](#14-environment-variables)
15. [UI Component System](#15-ui-component-system)
16. [Performance Observations](#16-performance-observations)
17. [Security Considerations](#17-security-considerations)
18. [Deployment](#18-deployment)
19. [Known Limitations](#19-known-limitations)

---

## 1. Project Overview

**The Hookah Store** is a headless e-commerce platform built for an Indian hookah and shisha tobacco retailer. The project separates the content management and e-commerce backend (WordPress + WooCommerce) from the customer-facing frontend (Next.js).

### What it is

A full-stack e-commerce web application with two distinct customer segments:

| Segment | URL | Purpose |
|---|---|---|
| **Retail** | `thehookahstore.in` (or `thehookahstore.com`) | Public-facing online store for end customers |
| **Wholesale** | Same domain, `/wholesale/*` routes | B2B portal for approved wholesale buyers |

### Core Features

- **Retail storefront** — product browsing by category, product detail pages, cart, checkout via Razorpay
- **Wholesale portal** — role-gated access for approved business buyers with exclusive product listings and pricing
- **Wholesale application system** — multi-step registration, document upload, admin review/approval workflow
- **Blog** — CMS-driven blog powered by WordPress posts
- **Search** — live product search across retail and wholesale catalogs
- **Age verification gate** — client-side age check before accessing the site
- **Email notifications** — transactional emails via Resend for account events, wholesale approvals/rejections
- **Dark/light theme** — user-selectable theme persisted to `localStorage`

### Headless Architecture

WordPress serves as a **headless CMS and WooCommerce backend only**. It does not render any HTML pages for end users. All UI rendering happens in Next.js. Data flows from WordPress to Next.js via:
- **WPGraphQL** — content, products, hero slider ACF fields
- **WooCommerce REST API v3** — orders, customers, roles, shipping
- **WordPress REST API v2** — user role updates, media uploads

---

## 2. Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 14+ (App Router)** | React meta-framework, routing, SSR/ISR |
| **React 18** | UI rendering |
| **TypeScript** | Type safety throughout |
| **Vanilla CSS + TailwindCSS utilities** | Styling (global CSS + inline Tailwind classes) |
| **Google Fonts (Montserrat)** | Typography |
| **Next.js Image** | Optimised image rendering |

### Backend / CMS
| Technology | Purpose |
|---|---|
| **WordPress** | Headless CMS, WooCommerce host |
| **WooCommerce** | E-commerce backend (products, orders, customers) |
| **WPGraphQL** | GraphQL API layer over WordPress |
| **WooGraphQL** | WooCommerce extension for WPGraphQL |
| **WPGraphQL JWT Authentication** | `login` GraphQL mutation for authenticating WooCommerce customers |
| **ACF (Advanced Custom Fields)** | Custom content fields (hero slider, page content) |
| **WordPress REST API v2** | User role updates, media library uploads |
| **WooCommerce REST API v3** | Order creation, customer management, shipping zones |

### Authentication
| Technology | Purpose |
|---|---|
| **`jose` (JWT library)** | Sign + verify JWT session tokens, email verification tokens, password reset tokens |
| **HTTP-only cookies** | Secure session storage in browser |
| **WordPress Application Passwords** | Server-to-server auth for WP REST API calls |

### Payments
| Technology | Purpose |
|---|---|
| **Razorpay** | Payment gateway (India-focused) |

### Email
| Technology | Purpose |
|---|---|
| **Resend** | Transactional email delivery |
| **Brevo** (optional) | Marketing email list (newsletter opt-in) |

### DevOps / Config
| Technology | Purpose |
|---|---|
| **Node.js** | Runtime for Next.js server |
| **`.env.local`** | Local environment configuration |
| **`next.config.mjs`** | Next.js configuration |

---

## 3. Repository Structure

```
hookahstore-website/
├── frontend/                    # Next.js application
│   ├── app/                     # App Router pages and API routes
│   │   ├── (site)/              # Route group: public retail site
│   │   ├── wholesale/           # Wholesale portal pages
│   │   ├── blog/                # Blog section
│   │   ├── api/                 # Next.js API routes (server functions)
│   │   ├── layout.tsx           # Root layout (ThemeProvider, AuthProvider)
│   │   └── loading.tsx          # Root loading UI
│   ├── components/              # React components
│   │   ├── layout/              # Header, Footer, navigation
│   │   ├── providers/           # React context providers
│   │   ├── pages/               # Full-page content components
│   │   ├── wholesale/           # Wholesale-specific components
│   │   ├── cart/                # Cart UI components
│   │   ├── account/             # Account page components
│   │   ├── blog/                # Blog components
│   │   ├── search/              # Search overlay components
│   │   └── rewards/             # Rewards page components
│   ├── lib/                     # Shared utilities (server-side only)
│   │   ├── auth/                # JWT utilities, GraphQL auth, session helpers
│   │   ├── graphql/             # GraphQL queries + fetchGraphQL utilities
│   │   ├── woocommerce/         # WooCommerce REST API client
│   │   ├── email/               # Email templates + Resend client
│   │   └── utils/               # General utility functions
│   ├── public/                  # Static assets (images, fonts, favicon)
│   ├── styles/                  # Global CSS
│   ├── next.config.mjs          # Next.js config
│   └── tsconfig.json            # TypeScript config
│
└── wordpress-plugin/            # Custom WordPress admin plugin
    └── wholesale-admin-manager/ # PHP plugin: review/approve/reject wholesale apps
        ├── wholesale-admin-manager.php   # Main plugin file
        ├── includes/                     # PHP logic modules
        └── assets/                       # Admin CSS
```

### Key Folder Purposes

| Folder | Contents |
|---|---|
| `app/(site)/` | All retail-facing pages: homepage, categories, product detail, account, cart, checkout, etc. Uses a shared layout with Header + Footer |
| `app/wholesale/` | Wholesale portal: login, register, product catalog, account dashboard |
| `app/api/` | Backend-only Next.js Route Handlers. Handles auth, payments, wholesale webhooks |
| `components/layout/` | `Header`, `Footer`, `MobileMenu`, `TopWarningBar`, warning banners, nav |
| `components/providers/` | `AuthProvider`, `CartProvider`, `ThemeProvider` — global React context |
| `components/pages/` | Large page-level client components (e.g. `HomePageContent`) |
| `lib/auth/` | `index.ts` (JWT sign/verify), `auth-graphql.ts` (WPGraphQL mutations), `session-server.ts`, `use-wholesale-session.ts` |
| `lib/graphql/` | All GraphQL query strings + `fetchGraphQL`/`fetchGraphQLSafe` utilities |
| `lib/woocommerce/` | `index.ts` (REST client), `wholesale.ts` (role + meta helpers), `media.ts` (file upload) |
| `lib/email/` | `resend-client.ts`, `render-email.tsx` (HTML templates), `send-emails.tsx` (send functions) |

---

## 4. Frontend Architecture

### Next.js App Router

The frontend uses the **App Router** (introduced in Next.js 13). All files inside `app/` use the file-system routing convention.

#### Route Groups

| Route Group | Path Prefix | Description |
|---|---|---|
| `(site)` | `/` | Retail storefront — wrapped in `SiteLayout` with Header, Footer, CartProvider, AgeGate |
| `wholesale` | `/wholesale/` | Wholesale portal — wrapped in `WholesaleLayout` |
| `blog` | `/blog/` | Blog — minimal layout, no e-commerce chrome |

#### Layouts

**Root layout** (`app/layout.tsx`):
- Applies globally to all routes
- Wraps `<ThemeProvider>` and `<AuthProvider>` around everything
- Contains the blocking inline script that applies the dark/light theme **before first paint** (prevents flash of wrong theme)
- Contains inline CSS that sets CSS custom properties and direct element styles for instant theme application

**Site layout** (`app/(site)/layout.tsx`):
- Wraps retail pages with: `CartProvider`, `SiteLoader` (route transition bar), `SiteBackground`, `TopWarningBar`, `Header`, `AgeGate`, `Footer`

**Wholesale layout** (`app/wholesale/layout.tsx`):
- Wraps wholesale pages with: `CartProvider` (keyed to `wholesale_cart`), `WholesaleCartGuard`, `SiteBackground`, `TopWarningBar`, `WholesaleHeader`, `Footer`

#### Server vs. Client Components

The project separates concerns clearly:

- **Server components** (default): pages like `app/(site)/category/[slug]/page.tsx` fetch data from WordPress/WooCommerce via GraphQL at request time (ISR), then pass data as props to client components
- **Client components** (`'use client'`): interactive components like `HeroSlider`, `ProductCard`, `CartProvider`, `ProductSlider`, form pages

Key rule: **server-only utilities** in `lib/` (auth, GraphQL, WooCommerce) must never be imported into client components.

#### ISR (Incremental Static Regeneration)

Pages export `export const revalidate = N` (in seconds) to control caching:

| Page | Revalidation |
|---|---|
| Homepage | 300 s (5 min) |
| Category pages | 300 s |
| Product pages | Varies |

#### Routing Overview

| URL Pattern | Page File | Notes |
|---|---|---|
| `/` | `(site)/page.tsx` | Homepage with hero slider |
| `/category/[slug]` | `(site)/category/[slug]/page.tsx` | Product category listing |
| `/product/[slug]` | `(site)/product/[slug]/page.tsx` | Product detail |
| `/hookahs` | `(site)/hookahs/` | Hookahs landing page |
| `/hookahs/shop-by-brand` | `(site)/hookahs/shop-by-brand/` | Brand directory |
| `/brand/[slug]` | `(site)/brand/[slug]/` | Products filtered by brand/tag |
| `/shisha-tobacco/al-fakher/[slug]` | `(site)/shisha-tobacco/al-fakher/[slug]/` | Al Fakher product detail |
| `/blog` | `blog/` | Blog listing |
| `/account` | `(site)/account/` | User account (retail) |
| `/cart` | `(site)/cart/` | Shopping cart |
| `/login` | `(site)/login/` | Retail login |
| `/register` | `(site)/register/` | Retail registration |
| `/wholesale` | `wholesale/page.tsx` | Wholesale landing/redirect |
| `/wholesale/login` | `wholesale/login/` | Wholesale login form |
| `/wholesale/register` | `wholesale/register/` | Wholesale registration (multi-step) |
| `/wholesale/product/[slug]` | `wholesale/product/[slug]/` | Wholesale product detail |
| `/wholesale/account` | `wholesale/account/` | Wholesale account dashboard |

---

## 5. Data Flow Architecture

### Retail Product Fetch (server-side ISR)

```
Browser requests /category/hookah-flavours
  → Next.js Server checks ISR cache (300s TTL)
  → Cache miss: server calls fetchGraphQLSafe(GET_PRODUCTS_BY_CATEGORY, ...)
    → POST https://cms.thehookahstore.in/graphql
    → WPGraphQL resolves query against WooCommerce DB
    → Returns JSON { products: { nodes: [...] } }
  → Server renders HTML with product data as props
  → HTML + JSON props sent to browser
  → React hydrates client-side
  → ProductCard components render interactively
```

### Add to Cart

```
User clicks "Add to Cart" button on ProductCard
  → CartProvider.addToCart() called (client-side only)
  → Cart state updated in React context
  → Cart serialised to localStorage ('cart' or 'wholesale_cart')
  → Toast notification shown
  → Cart count in header updates reactively
```

### Checkout / Payment (Razorpay)

```
User clicks "Checkout"
  → Cart page shows order summary + shipping form
  → POST /api/shipping/methods → WooCommerce REST API → shipping zones/methods
  → User selects shipping + fills address
  → POST /api/payment/create-order { amount } → Razorpay API → returns orderId
  → Razorpay modal opens in browser
  → User completes payment in Razorpay modal
  → Razorpay calls success callback with { payment_id, order_id, signature }
  → POST /api/payment/complete-order { razorpay_*, cart, shippingAddress }
    → Server verifies HMAC-SHA256 signature against Razorpay secret
    → Server POST /wc/v3/orders (WooCommerce REST API) to create order
    → Order created with status "processing", payment_method "razorpay"
    → Returns { orderId, orderNumber }
  → User redirected to /order-received?order=...
```

### Authentication Flow (Retail)

```
User submits login form at /login
  → POST /api/auth/login { email, password }
    → WPGraphQL login mutation → validates credentials → returns authToken + user
    → WooCommerce REST API → GET /wc/v3/customers?email=... → reads user role
    → If wholesale_pending → 403 (blocked)
    → Creates JWT session payload with jose.SignJWT
    → Sets httpOnly cookie 'hookah_session' (7 day expiry)
  → Browser receives 200 + Set-Cookie
  → AuthProvider reads /api/auth/me on next mount → session confirmed
```

### Wholesale Approval Flow

```
Admin logs into WordPress admin panel
  → Opens "Wholesale Applications" (custom plugin menu)
  → Clicks "Approve" on a pending application
    → WordPress admin_post_ handler fires
    → Sets user role to 'wholesale_customer' via WP Users API
    → Sends HTTP POST to Next.js: POST /api/wholesale/approved { email, name }
      → Next.js verifies Bearer token (WHOLESALE_WEBHOOK_SECRET)
      → Sends approval email via Resend
  → User receives email with login link
```

---

## 6. WordPress Integration

**WordPress base URL:** `https://cms.thehookahstore.in`

### How WordPress is Used

WordPress runs as a **headless backend only**. No WordPress themes render HTML for customers. The WordPress admin is used for:
- Content management (pages, posts, ACF fields)
- WooCommerce product/order management
- Wholesale application review (via custom plugin)

### WPGraphQL

All content queries go through a single GraphQL endpoint:

```
POST https://cms.thehookahstore.in/graphql
```

Queries include:
- Hero slider slides (ACF repeater field)
- Blog posts (`GET_POSTS_QUERY`)
- Products by category (`GET_PRODUCTS_BY_CATEGORY`)
- Product categories (`GET_PRODUCT_CATEGORY`)
- Products by tag/brand (`GET_PRODUCTS_BY_TAG`)
- Live search (`CONSUMER_SEARCH_QUERY`, `WHOLESALE_SEARCH_QUERY`)
- Single blog post / product detail

### ACF (Advanced Custom Fields)

ACF is used to add structured content blocks to WordPress pages/posts that would otherwise require custom DB tables or page builders. See [Section 13](#13-acf-content-system) for details.

### WordPress REST API v2

Used **server-side only** (never exposed to browser) for two operations:

1. **Role updates** — `PUT /wp/v2/users/{id} { roles: ['wholesale_customer'] }`  
   *Why not WooCommerce REST API?* The WC REST API (`PUT /wc/v3/customers/{id} { role }`) silently ignores custom roles it doesn't recognise. The WP REST API writes directly to the WordPress user role system.

2. **Media uploads** — `POST /wp/v2/media`  
   Used to store wholesale business documents (GST certificates, business licenses) in the WordPress Media Library, then save the resulting `source_url` to WooCommerce customer meta.

**Authentication for WP REST API:** WordPress Application Password (`WP_ADMIN_USERNAME` + `WP_ADMIN_APP_PASSWORD`). The `nextjs_api` WordPress user must have the `edit_users` capability.

---

## 7. WooCommerce System

### WooCommerce REST API Client

Located at `lib/woocommerce/index.ts`. Exports:

```typescript
wcGet(endpoint)          // GET /wc/v3/{endpoint}
wcPost(endpoint, body)   // POST /wc/v3/{endpoint}
wcPut(endpoint, body)    // PUT /wc/v3/{endpoint}
wcGetCustomerByEmail(email)
wcGetCustomerMeta(customer, key)
```

Authentication uses **WooCommerce consumer key/secret** as Basic Auth (`btoa(key:secret)`).  
All WC API calls use `cache: 'no-store'` — they are always fresh (orders, customer data).

### Products

Products are stored in WooCommerce and exposed via WPGraphQL.  
Two product types are used:
- **SimpleProduct** — single price, no variations
- **VariableProduct** — multiple variations (e.g. flavour sizes: 50g, 250g)

Product fields fetched: `id`, `databaseId`, `name`, `slug`, `image`, `price`, `regularPrice`, `salePrice`, `shortDescription`, `attributes`, `variations`.

### Customer / User System

- Customers register via WooCommerce's GraphQL `registerCustomer` mutation
- Each customer has a WooCommerce role stored in WordPress user meta
- Custom roles (`wholesale_pending`, `wholesale_customer`) registered by the plugin

### Cart

The cart is **entirely client-side** — stored in `localStorage`. No WooCommerce cart sessions are used. The cart is serialised to JSON and managed by `CartProvider`.

Two separate localStorage keys exist:
- `cart` — retail cart
- `wholesale_cart` — wholesale cart (separate instance via `CartProvider storageKey` prop)

### Orders

WooCommerce orders are created server-side via REST API after Razorpay payment verification (`POST /wc/v3/orders`). Order meta stores Razorpay payment and order IDs.

### Shipping

Shipping methods and zones are fetched from WooCommerce REST API at checkout time:
- `GET /wc/v3/shipping/zones` — fetch all zones
- `GET /wc/v3/shipping/zones/{id}/methods` — fetch methods per zone

---

## 8. Wholesale System

### Overview

The wholesale system is a gated B2B purchasing portal. Wholesale buyers must apply, submit documents, and be approved by an admin before gaining access.

### Registration Flow (Multi-Step)

**Step 1 — Business Information** (`/wholesale/register`)
- User submits: first name, last name, email, password, business name, address, phone, GST number, website
- Frontend `POST /api/auth/signup { registrationSource: 'wholesale', ...businessFields }`

**Server-side processing in `/api/auth/signup`:**
1. Validates password strength (min 8 chars, uppercase, lowercase, special char)
2. Checks email not already registered via GraphQL
3. Creates WooCommerce customer via `registerCustomer` GraphQL mutation
4. Assigns `wholesale_pending` role via **WordPress Users REST API** (`PUT /wp/v2/users/{id}`)
5. Stores business meta (name, address, phone, GST, website, `approval_status: 'pending'`) via WooCommerce REST API
6. Sends wholesale application confirmation email to applicant
7. Returns `202 Accepted` — no session cookie issued (user cannot log in yet)

**Step 2 — Document Upload** (`/wholesale/auth/upload-documents` or similar)
- User uploads: GST Certificate (required), Business License (required), Identity Document (optional)
- Frontend `POST /api/wholesale/upload-documents` (multipart/form-data)
- Server uploads each file to WordPress Media Library
- Saves resulting `source_url` values to WooCommerce customer meta: `gst_certificate_url`, `business_license_url`, `identity_document_url`

### Role Transition States

```
[New user registers wholesale]
        ↓
  user role: 'wholesale_pending'
  approval_status meta: 'pending'
        ↓
[Admin reviews in WP Admin → Wholesale Applications]
        ↓
  [APPROVE]                         [REJECT]
    ↓                                  ↓
user role: 'wholesale_customer'    (role unchanged: wholesale_pending)
Admin plugin → POST /api/wholesale/approved   → POST /api/wholesale/rejected
    ↓                                  ↓
Approval email sent                Rejection email sent
User can now log in
```

### Protected Routes

Once logged in, wholesale routes check the session role:
- `WholesaleCartGuard` reads role from `AuthProvider` → clears cart if not `wholesale_customer`
- Product pages and account pages check session server-side

---

## 9. Custom WordPress Plugin

**Plugin:** `Wholesale Admin Manager` (v4.1)  
**Location:** `wordpress-plugin/wholesale-admin-manager/`  
**Installed in:** WordPress admin at `cms.thehookahstore.in`

### Purpose

Provides a WordPress admin UI for reviewing and acting on wholesale applications submitted through the Next.js frontend. Without this plugin, there is no admin interface to approve/reject wholesale buyers.

### File Structure

```
wholesale-admin-manager/
├── wholesale-admin-manager.php     # Main plugin bootstrap
├── includes/
│   ├── admin-menu.php              # Registers WP admin menu pages
│   ├── applications-page.php       # Lists pending wholesale applications
│   ├── approved-customers-page.php # Lists approved wholesale customers
│   └── actions.php                 # approve/reject action handlers
└── assets/
    └── admin.css                   # Plugin admin panel styles
```

### WordPress Hooks Used

| Hook | Purpose |
|---|---|
| `admin_menu` | Registers "Wholesale Applications" top-level menu + "Customers" submenu |
| `admin_enqueue_scripts` | Enqueues `admin.css` only on plugin pages |
| `admin_post_approve_wholesale_user` | Handles the Approve button form submission |
| `admin_post_reject_wholesale_user` | Handles the Reject button form submission |
| `init` | Registers custom WordPress roles (idempotent, runs every page load) |
| `register_activation_hook` | Registers roles on plugin activation, flushes rewrite rules |
| `register_deactivation_hook` | Flushes rewrite rules on deactivation (intentionally does NOT remove roles) |

### Custom Roles Registered

| Role Slug | Display Name | Capabilities |
|---|---|---|
| `wholesale_pending` | Wholesale Pending | `read: true` |
| `wholesale_customer` | Wholesale Customer | `read: true` (WC adds `wc_*` caps separately) |

> **Important:** Roles are registered on every `init` call (idempotent). This ensures they exist even if the plugin was deactivated and re-activated or updated. WooCommerce REST API requires roles to be registered before they can be assigned.

### Approval/Rejection Webhook

When an admin clicks Approve or Reject in the WordPress admin:
1. `actions.php` sets the WordPress user role
2. After role update, it fires a POST request to the Next.js webhook endpoints:
   - `POST https://thehookahstore.in/api/wholesale/approved`
   - `POST https://thehookahstore.in/api/wholesale/rejected`
3. The request includes `Authorization: Bearer {WHOLESALE_WEBHOOK_SECRET}`
4. Next.js validates the token and sends the appropriate email via Resend

---

## 10. Authentication System

### Overview

The project uses a **custom JWT session system** (not NextAuth). All auth utilities are in `lib/auth/`.

### JWT Session Tokens

```typescript
// lib/auth/index.ts
interface SessionPayload {
    sub: string;           // WooCommerce customer ID (stringified)
    email: string;
    firstName: string;
    lastName: string;
    accountType: 'retail' | 'wholesale';
    emailVerified: boolean;
    role?: 'wholesale_pending' | 'wholesale_customer' | 'customer';
}
```

- Algorithm: **HS256**
- Expiry: **7 days**
- Secret: `JWT_SECRET` env var
- Storage: **httpOnly cookie** named `hookah_session`, `Secure` in production, `SameSite: Lax`

### Other Token Types

| Token Type | Purpose | Expiry |
|---|---|---|
| Session JWT | Authenticated session | 7 days |
| Email verification JWT | Verify email address after registration | 24 hours |
| Password reset JWT | Single-use password reset link | 1 hour |

Password reset tokens include a `nonce` field for single-use enforcement.

### Server-Side Session Reading

`lib/auth/session-server.ts` — reads and verifies the `hookah_session` cookie from the incoming request. Used in API route handlers.

```typescript
const session = await getServerSession();
if (!session) return 401;
```

### Client-Side Auth State

`components/providers/AuthProvider.tsx` — a React context provider that:

1. Checks `sessionStorage` for a cached auth result (up to 5 min TTL for authenticated users)
2. If no cache, calls `GET /api/auth/me` (once per JS session via module-level singleton promise)
3. Sets auth state: `{ role: UserRole, userId: number | null }`
4. All child components read from context via `useAuth()` — zero additional network requests

`lib/auth/use-wholesale-session.ts` — thin wrapper over `useAuth()` that exposes `{ loading, role, isApproved, isPending }`.

### Role System

| Role | Who | Access |
|---|---|---|
| `loading` | During initial auth check | — |
| `not_approved` | Unauthenticated or unknown | Public retail pages only |
| `customer` | Registered retail customer | Retail account, cart, checkout |
| `wholesale_pending` | Applied but not yet approved | Blocked from wholesale login |
| `wholesale_customer` | Admin-approved wholesale buyer | Full wholesale portal |
| `administrator` | WordPress admin | All |

### Protected Routes Pattern

Server-side: API routes call `getServerSession()` and return 401 if no valid session.

Client-side: Wholesale pages use `useWholesaleSession()` to check `isApproved` and redirect if not.

---

## 11. API Routes

All routes are in `app/api/`. All use `export const dynamic = 'force-dynamic'` to prevent caching.

### Auth Routes (`/api/auth/`)

| Route | Method | Purpose |
|---|---|---|
| `/api/auth/signup` | POST | Register new user (retail or wholesale). Validates password strength, calls WPGraphQL `registerCustomer`, sets session cookie (retail only), or submits wholesale application (no session) |
| `/api/auth/login` | POST | Authenticate via WPGraphQL `login` mutation. Checks WooCommerce role. Issues JWT session cookie. Blocks `wholesale_pending`. |
| `/api/auth/logout` | POST + GET | Clears `hookah_session` cookie. GET supports `?redirect=` param for direct browser navigation |
| `/api/auth/me` | GET | Returns current session data (`sub`, `email`, `firstName`, `role`, `accountType`). Returns 401 if not authenticated |
| `/api/auth/verify-email` | POST/GET | Verifies email address via JWT token from the email link |
| `/api/auth/forgot-password` | POST | Generates and emails a password reset link |
| `/api/auth/reset-password` | POST | Validates reset token and updates WooCommerce customer password |
| `/api/auth/check-email` | POST | Checks if an email already has an account |

### Wholesale Routes (`/api/wholesale/`)

| Route | Method | Purpose |
|---|---|---|
| `/api/wholesale/upload-documents` | POST | Accepts multipart/form-data. Validates files (PDF/JPG/PNG, max 10MB). Uploads to WordPress Media Library. Saves `source_url` to WooCommerce customer meta |
| `/api/wholesale/approved` | POST | **Webhook** from WordPress plugin. Verifies `WHOLESALE_WEBHOOK_SECRET`. Sends approval email to applicant via Resend |
| `/api/wholesale/rejected` | POST | **Webhook** from WordPress plugin. Same auth. Sends rejection email |

### Payment Routes (`/api/payment/`)

| Route | Method | Purpose |
|---|---|---|
| `/api/payment/create-order` | POST | Creates a Razorpay order for the given amount (in paise). Returns `orderId`. Called before opening the Razorpay modal |
| `/api/payment/complete-order` | POST | Verifies Razorpay HMAC-SHA256 signature to confirm payment authenticity. Creates WooCommerce order via REST API. Returns `orderId`, `orderNumber` |

### Shipping Routes (`/api/shipping/`)

| Route | Method | Purpose |
|---|---|---|
| `/api/shipping/methods` | POST | Fetches active shipping methods from all WooCommerce shipping zones (excluding zone 0 "Rest of World"). Returns sorted array of `{ id, label, description, price, zoneName }` |

---

## 12. Email System

### Resend Integration

The project uses **Resend** (`resend` npm package) for all transactional email delivery.

**From address:** `The Hookah Store <no-reply@thehookahstore.in>`  
**Reply-To:** `no-reply@thehookahstore.in`

The Resend client (`lib/email/resend-client.ts`) is a lazy singleton that only instantiates when first used, preventing build-time crashes when `RESEND_API_KEY` is a runtime variable.

### Email Templates

All templates are in `lib/email/render-email.tsx` as pure HTML string renderers (not React components rendered server-side, to avoid Turbopack compatibility issues with `react-dom/server`).

| Template | Trigger | Recipients |
|---|---|---|
| Welcome Email | Retail user registration success | New customer |
| Email Verification | After retail registration | New customer |
| Password Reset | Forgot password request | Customer |
| Password Reset Success | Password successfully changed | Customer |
| Wholesale Application Received | Wholesale registration submitted | Applicant |
| Wholesale Approved | Admin approves application via WordPress plugin | Applicant |
| Wholesale Rejected | Admin rejects application via WordPress plugin | Applicant |

### Email Sending Functions (`lib/email/send-emails.tsx`)

```typescript
sendWelcomeEmail({ firstName, email, loginUrl })
sendVerificationEmail({ firstName, email, verificationUrl })
sendPasswordResetEmail({ firstName, email, resetUrl })
sendPasswordResetSuccessEmail({ firstName, email })
sendWholesaleApplicationEmail({ name, businessName, email })
sendWholesaleApprovedEmail({ name, email, loginUrl })
sendWholesaleRejectedEmail({ name, email })
```

### Brevo (Optional)

When a retail user opts into marketing (`marketingOptIn: true`) during registration, their email is added to a Brevo contact list. This uses the Brevo REST API directly (not an SDK). Requires `BREVO_API_KEY` and `BREVO_LIST_ID` env vars. Fires as fire-and-forget (failures are logged but don't block the response).

---

## 13. ACF Content System

### How ACF Works in This Project

Advanced Custom Fields (ACF) adds custom structured data to WordPress pages and posts. The data is exposed via WPGraphQL when ACF fields are configured to show in GraphQL.

### Hero Slider

The most significant ACF usage is the **hero slider** on the homepage and wholesale page.

**ACF Field Group:** `heroSlider` on the WordPress Home page  
**Field type:** Repeater (`slides`)

Each slide contains:
| ACF Field | GraphQL Field | Type | Purpose |
|---|---|---|---|
| `slide_image` | `slideImage.node.sourceUrl` | Image | Desktop background image |
| `mobile_image` | `mobileImage.node.sourceUrl` | Image | Mobile-specific background |
| `badge_text` | `badgeText` | Text | Small label above title |
| `title` | `title` | Text | Slide heading |
| `description` | `description` | Textarea | Slide body text |
| `button_text` | `buttonText` | Text | CTA button label |
| `button_link` | `buttonLink` | URL | CTA button destination |

### How ACF Data Flows to the Frontend

```
WordPress Admin: Edit "Home" page → ACF Hero Slider → Add/edit slides
  → Data saved to WordPress DB (custom post meta)
  ↓
Next.js server-side fetch (ISR, 5 min cache):
  fetchGraphQLSafe(GET_HOME_HERO_SLIDES, {}, 300)
  → POST cms.thehookahstore.in/graphql
  → WPGraphQL resolves ACF field group via WPGraphQL for ACF plugin
  → Returns JSON: { page: { heroSlider: { slides: [...] } } }
  ↓
Passed as props to HomePageContent → HeroSlider component
```

### Important GraphQL Notes

ACF Image fields in WPGraphQL return a **media object**, not a plain URL. You must query `{ node { sourceUrl } }` on image fields:

```graphql
slideImage {
    node {
        sourceUrl
    }
}
```

---

## 14. Environment Variables

All variables must be set in `frontend/.env.local` for local development, and as deployment environment variables in production.

### WordPress / WooCommerce

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_GRAPHQL_URL` | ✅ | WPGraphQL endpoint. e.g. `https://cms.thehookahstore.in/graphql` |
| `WOOCOMMERCE_URL` | ✅ | WordPress/WooCommerce base URL. e.g. `https://cms.thehookahstore.in` |
| `WOOCOMMERCE_CONSUMER_KEY` | ✅ | WooCommerce REST API consumer key (generated in WooCommerce → Settings → Advanced → REST API) |
| `WOOCOMMERCE_CONSUMER_SECRET` | ✅ | WooCommerce REST API consumer secret |
| `WP_ADMIN_USERNAME` | ✅ | WordPress username for Application Password auth (used for user role updates + media uploads) |
| `WP_ADMIN_APP_PASSWORD` | ✅ | WordPress Application Password for the above user (format: `xxxx xxxx xxxx xxxx xxxx xxxx`) |

### Authentication

| Variable | Required | Description |
|---|---|---|
| `JWT_SECRET` | ✅ | Secret for signing/verifying JWT session tokens, email verification, and password reset tokens. Use a long random string in production |
| `WHOLESALE_WEBHOOK_SECRET` | ✅ | Shared secret for WordPress→Next.js webhook calls (approve/reject). Must match the value configured in the WordPress plugin |

### App URL

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | ✅ | Public URL of the Next.js app. e.g. `https://thehookahstore.in`. Used in email links |

### Payments

| Variable | Required | Description |
|---|---|---|
| `RAZORPAY_KEY_ID` | ✅ | Razorpay API key ID (public, used server-side for order creation) |
| `RAZORPAY_KEY_SECRET` | ✅ | Razorpay API key secret (used server-side for HMAC verification) |

### Email

| Variable | Required | Description |
|---|---|---|
| `RESEND_API_KEY` | ✅ | Resend API key for sending transactional emails |
| `BREVO_API_KEY` | ❌ | Brevo (Sendinblue) API key for marketing list. Optional — omit to disable |
| `BREVO_LIST_ID` | ❌ | Brevo contact list ID to add marketing subscribers to |

---

## 15. UI Component System

### Design System

- **Font:** Montserrat (Google Fonts, weights 400/500/600/700)
- **Dark mode default** with optional light mode toggle
- **CSS custom properties** for theme colours: `--clr-bg`, `--clr-surface`, `--clr-text`, `--clr-border`, etc.
- **Theme toggle** persisted to `localStorage` (`'hookah-theme'` key: `'dark'` or `'light'`)
- **Brand red accent:** `#CD142C`
- **Teal CTA (wholesale):** `#00EBD8`

### Core Layout Components (`components/layout/`)

| Component | Purpose |
|---|---|
| `Header.tsx` | Thin wrapper that renders `HeaderNav` |
| `HeaderNav.tsx` | Full desktop navigation: logo, nav links with dropdowns, search icon, cart icon, theme toggle, wholesale button |
| `HeaderTopBar.tsx` | Thin utility bar above main nav |
| `MobileMenu.tsx` | Full-screen mobile navigation overlay with primary nav, About section, Support section, account links, Shop Wholesale CTA |
| `MobileSearchOverlay.tsx` | Full-screen search modal for mobile |
| `TopWarningBar.tsx` | Auto-scrolling marquee with tobacco health warning (mandatory for Indian regulations) |
| `MarqueeBar.tsx` | Reusable marquee animation component |
| `Footer.tsx` | Full site footer: logo, nav columns (Shop, About, Support), social links, legal |
| `SiteBackground.tsx` | Fixed radial gradient background layer |
| `WholesaleHeader.tsx` | Wrapper for wholesale header |
| `WholesaleHeaderNav.tsx` | Wholesale-specific navigation |

### Global Components

| Component | Purpose |
|---|---|
| `HeroSlider.tsx` | Full-width hero image carousel with auto-advance, touch/swipe support, peek slides, gradient overlay, text/CTA overlay. Supports separate desktop (`slideImage`) and mobile (`mobileImage`) backgrounds. Mobile-only dot indicators |
| `HeroSliderWrapper.tsx` | Client-side wrapper for `HeroSlider` that handles conditional rendering |
| `ProductCard.tsx` | Product card for grids and scroll carousels. Shows image, title, price, variation pills, Add to Cart button. Supports `href` for navigation. Wholesale-aware pricing |
| `ProductSlider.tsx` | Horizontally scrolling product carousel with prev/next arrow controls |
| `AgeGate.tsx` | Intercepts site access for users who haven't confirmed they are 18+/21+. Uses `localStorage` to persist confirmation |
| `AgeVerification.tsx` | The age gate UI overlay |
| `SiteLoader.tsx` | Slim red progress bar at top of page during client-side route transitions. Listens for `<a>` clicks, shows bar, completes when `usePathname` changes |

### Provider Components (`components/providers/`)

| Component | Purpose |
|---|---|
| `AuthProvider.tsx` | Global auth state. Calls `/api/auth/me` once (module-level singleton + sessionStorage cache). Provides `{ role, userId }` via `useAuth()` |
| `CartProvider.tsx` | Cart state management. Provides `addToCart`, `removeFromCart`, `clearCart`, `cart` array, toast notifications. Persists to localStorage |
| `ThemeProvider.tsx` | Dark/light theme management. Provides `{ dark, toggleTheme }`. Syncs with `data-dark` attribute on `<html>` |

### Search Components (`components/search/`)

- Search overlay with live results
- Separate query logic for retail (with prices) and wholesale (without prices, filtered by ACF `showInWholesale` meta)

### Wholesale Components (`components/wholesale/`)

| Component | Purpose |
|---|---|
| `WholesaleCartGuard.tsx` | Silently clears wholesale cart if the current user is not an approved `wholesale_customer` |

---

## 16. Performance Observations

> These are observations only. Not fixing them.

1. **Hero image ISR cache is short (30s as of last edit):** `app/(site)/page.tsx` fetches hero slides with `revalidate: 30` inside the component call — even though the page-level ISR is 300s. This causes more frequent WPGraphQL fetches than necessary.

2. **No CDN / image optimisation for WordPress uploads:** `next.config.mjs` sets `unoptimized: true` for Next.js Image. This means images from `cms.thehookahstore.in` are served as-is without resizing or format conversion (no WebP conversion, no responsive sizes). Large images are served in full resolution to all devices.

3. **Wholesale product pages not clearly ISR-managed:** Some wholesale product pages may fetch data without explicit `revalidate` constants, defaulting to on-demand fetching.

4. **WooCommerce shipping fetch on every checkout:** `POST /api/shipping/methods` fetches all zones + methods from WooCommerce with `cache: 'no-store'` on every checkout session. Shipping zones rarely change and could be cached for 30–60 minutes.

5. **Module-level auth fetch singleton reset on hard refresh:** `cachedAuthPromise` is a module-level variable that resets on every browser hard refresh (new JS runtime). This is correct behaviour but means one `/api/auth/me` call per page load is still expected.

6. **`console.log` in `wcSetCustomerRole` (dev only):** Development logs for role assignments remain in `wholesale.ts`. They're guarded by `NODE_ENV === 'development'` but should be reviewed before finalising.

7. **No React `Suspense` boundaries around slow fetches within pages:** Client components that fetch data asynchronously don't always show skeleton loaders while loading.

8. **Multiple `<ThemeProvider>` instances:** `blog/layout.tsx` adds a second `ThemeProvider` on top of the root layout's `ThemeProvider`. This creates isolated context and may cause theme state divergence between blog and main site.

---

## 17. Security Considerations

### JWT Sessions

- Session tokens are **httpOnly** cookies — not accessible via JavaScript, protecting against XSS token theft
- `Secure` flag is set in production — cookies only transmitted over HTTPS
- `SameSite: Lax` — protects against most CSRF attacks
- JWT secret is configurable via `JWT_SECRET` env var — **must not use the default `'hookah-dev-secret-change-in-production'` in production**

### Webhook Authentication

The WordPress plugin POSTs to two Next.js webhook endpoints (`/api/wholesale/approved`, `/api/wholesale/rejected`). These are authenticated via a shared `Bearer` token (`WHOLESALE_WEBHOOK_SECRET`).

**Risk:** If `WHOLESALE_WEBHOOK_SECRET` is not set, the endpoints run in **unauthenticated mode** with only a console warning. This means any caller can trigger wholesale approval emails. The env var must be set in production.

### WooCommerce API Credentials

`WOOCOMMERCE_CONSUMER_KEY` and `WOOCOMMERCE_CONSUMER_SECRET` are server-side only. They are never exposed to the browser. All WooCommerce API calls are made in Next.js Route Handlers.

### WordPress Application Password

`WP_ADMIN_APP_PASSWORD` is server-side only. Used for role updates and media uploads. The corresponding WordPress user (`WP_ADMIN_USERNAME`) must have `edit_users` capability. **Do not use a WordPress administrator account** — use a dedicated API user with the Editor role.

### Razorpay Payment Verification

The `complete-order` route uses **HMAC-SHA256 signature verification** on the Razorpay payment data before creating any WooCommerce order. This prevents tampering with payment data (e.g. submitting a fake payment success).

### Age Gate

The age gate (`AgeGate.tsx`) stores the user's confirmation in `localStorage`. This is a UX gate, not a hard security control — it can be bypassed by clearing localStorage or by a determined user.

### Role Validation

Wholesale login blocks users with `wholesale_pending` role (cannot log in until approved). The check is performed by looking up the WooCommerce customer role via the WC REST API at login time — not just trusting the submitted session.

### Nonce in Password Resets

Password reset tokens contain a `nonce` field (`randomHex(32)`). This nonce is stored in WooCommerce customer meta and verified on use, enabling single-use reset links. After use, the nonce in meta is cleared.

---

## 18. Deployment

### Build Process

```bash
cd frontend
npm run build     # Next.js production build
npm run start     # Start production server
```

### Environment Setup

1. Copy `.env.local.example` (if it exists) to `.env.local`
2. Fill in all required environment variables (see [Section 14](#14-environment-variables))
3. Ensure WordPress at `cms.thehookahstore.in` has:
   - WPGraphQL plugin installed and active
   - WooGraphQL plugin installed and active
   - WPGraphQL JWT Authentication plugin installed and active
   - ACF plugin with the `heroSlider` field group
   - WooCommerce REST API credentials generated
   - WordPress Application Password generated for the API user
   - The `Wholesale Admin Manager` plugin (v4.1) installed and active

4. Deploy the Next.js app to your hosting provider (Vercel recommended for App Router)
5. Set all environment variables in the hosting provider's dashboard

### WordPress Plugin Deployment

The plugin can be uploaded directly to WordPress:
1. Use the `.zip` file in `wordpress-plugin/wholesale-admin-manager-v4.1.zip`
2. WordPress Admin → Plugins → Add New → Upload Plugin → choose the zip → Activate

### Recommended: Vercel Deployment

The project is built with Vercel in mind:
- ISR (`revalidate`) works out of the box
- Edge runtime is used on some API routes (`export const runtime = 'edge'`)
- Environment variables are set via Vercel dashboard
- `next.config.mjs` is standard and Vercel-compatible

### Domain Configuration

| Domain | Service |
|---|---|
| `thehookahstore.in` or `thehookahstore.com` | Next.js frontend |
| `cms.thehookahstore.in` | WordPress/WooCommerce backend |

---

## 19. Known Limitations

### Missing / Incomplete Features

1. **Email verification is not enforced:** Email verification tokens are issued and emails are sent, but it appears the site doesn't block login or restrict features for unverified emails (`emailVerified: false` is set in the JWT but not checked on protected routes).

2. **Wholesale cart has no server-side persistence:** The wholesale cart is localStorage-only. If the user clears localStorage, opens incognito, or switches devices, the cart is lost. No persistent server-side cart.

3. **No pagination on product listings:** Category pages fetch up to **60 products** (`first: 60` in the query). If a category has more than 60 products, the rest are not displayed. No "load more" or pagination is implemented.

4. **ISR does not invalidate on WooCommerce webhook:** When a product is updated in WooCommerce, the ISR cached pages are not automatically invalidated. Product changes take up to 5 minutes to appear.

5. **Wholesale product pricing is separate from WooCommerce pricing:** Wholesale product pages appear to use their own pricing logic. The relationship between wholesale pricing and WooCommerce variable pricing should be verified.

6. **No order management in retail account:** The retail `/account` route may not have a functional order history view.

7. **`WHOLESALE_WEBHOOK_SECRET` missing = open webhook endpoint:** If this env var is not set, the approve/reject webhook endpoints will process any incoming request. This must be set in production.

8. **No rate limiting on auth endpoints:** API routes like `/api/auth/login` and `/api/auth/signup` have no rate limiting. A brute-force attack on login is theoretically possible.

9. **Brevo integration is fire-and-forget with silent failures:** If Brevo rejects the contact (e.g. invalid API key), the error is only logged. No feedback to the user or admin.

10. **Double `ThemeProvider` in blog layout:** `blog/layout.tsx` wraps content in a second `ThemeProvider` on top of the root layout's provider, creating a separate provider tree that may not inherit the user's chosen theme preference.

11. **WordPress plugin webhook call timing:** The WordPress plugin's `actions.php` fires the Next.js webhook call after a redirect via `wp_safe_redirect`. Depending on server configuration, this fire-and-forget call may not complete if PHP execution terminates at redirect.

---

*End of PROJECT_ARCHITECTURE.md*
