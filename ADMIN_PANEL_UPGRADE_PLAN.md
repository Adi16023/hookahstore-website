# Admin Panel Upgrade Plan — Professional Redesign & Feature Audit

**Scope:** The custom admin panel at `/admin` (Next.js, reading/writing WooCommerce REST data directly — no separate database).
**Type:** Audit + plan only. No code was changed to produce this document.
**Date:** 2026-07-20

---

## 0. Executive Summary

The panel currently covers the right **entities** (Products, Orders, Wholesale, Customers) and the right **data source** (WooCommerce REST API), but it's a first pass: flat tables, `Previous`/`Next`-only pagination, inline text messages instead of toasts, no detail view for customers, no bulk actions anywhere, and no sortable columns. Products and Orders have real edit/detail pages already (a good foundation); Customers is the thinnest — a read-only list and nothing else.

The gap to "Medusa-admin polish + WooCommerce functionality" is mostly **breadth of interaction patterns** (sorting, bulk actions, detail drawers, notes) rather than a fundamentally wrong architecture. This is a rebuild-on-top job, not a rewrite.

---

## 1. Inventory — What Exists Today (Step 1)

### Products
| | |
|---|---|
| **Data shown (list)** | Thumbnail, name, SKU, category names, price, stock badge, status badge |
| **Data shown (edit page)** | Name, description, SKU, status, regular/sale price, stock status + quantity, categories (checkbox multi-select), images (add/remove by URL), custom **Wholesale Price** field, custom **Show in Wholesale** toggle |
| **Actions available** | Search by name, click row → edit page, save, add/remove category, add/remove image, manage Categories & Tags (separate CRUD sub-pages: create/rename/delete) |
| **Missing vs. WooCommerce admin** | Sortable columns, filter by category/stock/status, bulk edit (price, category, publish/draft), **Add New Product**, variation editing for variable products, quick-edit inline row, low-stock threshold indicator, product duplication, tax class/shipping class/weight/dimensions, SEO fields, image upload (currently URL-paste only, no file picker) |

### Orders
| | |
|---|---|
| **Data shown (list)** | Order number, customer name + email, date, total, status badge |
| **Data shown (detail)** | Line items + quantities/totals, shipping line, billing address, shipping address, payment method, Razorpay payment/order IDs, Shiprocket tracking lookup (on-demand button) |
| **Actions available** | Search by order #/email, filter by status (dropdown), click row → detail page, update status |
| **Missing vs. WooCommerce admin** | Sortable columns, date-range filter, **order notes** (WC's private/customer note thread per order), refunds, print invoice/packing slip, bulk status change, resend confirmation email, click-through from an order to the customer's profile |

### Wholesale
| | |
|---|---|
| **Data shown** | Pending: name, email, business name, GST number, GST/license doc links, applied date. Approved: name, email, business name, GST number, approved-since date |
| **Actions available** | Approve (role → `wholesale_customer` + email), Reject (meta flag + email) |
| **Missing vs. WooCommerce admin** | Pagination (currently loads up to 100 of each with no paging), search/filter within either table, inline edit of business meta, a **reason field on reject**, an approval audit trail (who approved, when), bulk approve, sortable columns |

### Customers
| | |
|---|---|
| **Data shown** | Name, email, role badge, registration date |
| **Actions available** | Search by name/email, pagination (`Previous`/`Next` only) |
| **Missing vs. WooCommerce admin** | Everything beyond the raw list — see the dedicated table below. This is the thinnest page in the panel. |

---

## 2. Feature-by-Feature Comparison vs. WooCommerce Admin (Step 2)

### Customers (detailed, as requested)

| Feature in WooCommerce admin | Present here? | Priority to add |
|---|---|---|
| Search by name or email | ✅ Yes | — |
| Filter by role/group (retail vs. wholesale vs. pending) | ❌ No — role only shown as a badge, not filterable | **High** |
| Sortable columns (name, email, date, role) | ❌ No | **Medium** |
| Pagination with page numbers | ⚠️ Partial — `Previous`/`Next` only, no page count or jump-to-page | **Medium** |
| Customer detail page | ❌ No — clicking a row does nothing | **High** |
| — Orders placed (list + count) | ❌ No | **High** |
| — Total spent (lifetime value) | ❌ No | **High** |
| — Last order date | ❌ No | **Medium** |
| — Addresses (billing/shipping) | ❌ No | **Medium** |
| — Phone number | ❌ No (not fetched in the list query) | **Medium** |
| — Notes/tags (internal admin notes on a customer) | ❌ No — no such field exists anywhere, including on WooCommerce's own customer object; would need custom meta | **Low** |
| Role/group badge, readable (not truncated) | ⚠️ Partial — badge renders fine at normal widths but has no responsive/truncation handling tested at narrow widths | **Medium** |
| Bulk actions (export, delete, change role) | ❌ No — no row selection exists at all | **High** |
| Add/Edit customer | ❌ No — no create-new flow; edits aren't possible from this panel at all | **Medium** |
| Account status (active/blocked) | ❌ No — WooCommerce doesn't have this natively either; would require a new custom meta flag, same pattern as `approval_status` | **Low** |

### Products (summary table)

| Feature in WooCommerce admin | Present here? | Priority |
|---|---|---|
| Search | ✅ Yes | — |
| Filter by category/stock/status | ❌ No | High |
| Sortable columns | ❌ No | Medium |
| Bulk edit (price, category, status) | ❌ No | High |
| Add New Product | ❌ No | High |
| Quick Edit (inline, no page nav) | ❌ No | Medium |
| Variation management (variable products) | ❌ No — edit page only handles simple-product-style fields | High |
| Product duplication | ❌ No | Low |
| Image upload (file picker, not URL paste) | ❌ No | Medium |
| Stock/price/status columns, badges | ✅ Yes | — |

### Orders (summary table)

| Feature in WooCommerce admin | Present here? | Priority |
|---|---|---|
| Search + status filter | ✅ Yes | — |
| Sortable columns | ❌ No | Medium |
| Date-range filter | ❌ No | Medium |
| Order notes (admin/customer note thread) | ❌ No | High |
| Refunds | ❌ No | High |
| Print invoice/packing slip | ❌ No | Medium |
| Bulk status change | ❌ No | Medium |
| Link from order → customer profile | ❌ No (no customer profile exists yet either) | Medium |
| Payment + shipment info visible on detail | ✅ Yes (Razorpay IDs, Shiprocket tracking lookup) | — |

### Wholesale (summary table)

| Feature (vs. old WP plugin + reasonable admin UX) | Present here? | Priority |
|---|---|---|
| Approve / Reject | ✅ Yes | — |
| Reason field on reject | ❌ No | Medium |
| Pagination | ❌ No (loads first 100 only) | Medium |
| Search/filter | ❌ No | Medium |
| Approval audit trail (who/when) | ❌ No | Low |
| Bulk approve | ❌ No | Low |
| Inline business-meta edit | ❌ No | Low |

---

## 3. Design System Proposal (Step 3)

### Layout
- **Sidebar**: keep the current dark sidebar with active-state highlighting (already implemented) — add **breadcrumbs** in the main content header (`Products / Wireless Mod X1`) so detail pages don't feel like a dead end.
- **Page header pattern**: title + one-line description (already exists) + **primary action button top-right** (`+ Add Product`, `+ Add Customer`) — currently only Products has a top-right button (Categories/Tags), and it's a secondary action, not a primary "create" action, because create flows don't exist yet.

### Tables
- Introduce one shared `<DataTable>` component used by all four sections, with:
  - Sortable column headers (click to toggle asc/desc)
  - Sticky header on scroll
  - Row hover state (subtle background shift — partially present already)
  - A leading checkbox column for row selection → bulk action bar appears above the table when ≥1 row is selected
  - Real pagination control (page numbers + total count, not just Prev/Next)
  - A shared empty-state component (icon + message + optional CTA) — text-only version exists today
  - A shared skeleton-loader state for the moment between navigation and data arriving (currently there's a blank flash, since these are server-rendered fetches with no client loading state)

### Typography, spacing, color
- Adopt a defined type scale (e.g. 20/16/14/12.5/11.5px steps — close to what's already used, just needs to be named/tokenized in the CSS rather than repeated ad hoc)
- Expand the palette beyond neutral gray + single red accent: add a secondary accent (e.g. an indigo/blue for informational states) so badges, links, and primary buttons don't all compete for the same red
- Button variants: primary (solid, brand-accent), secondary (outlined, already exists), destructive (already exists as `.admin-btn-danger`), and a new **ghost/tertiary** variant for low-emphasis inline actions (e.g. "View" links in tables)

### Detail views
- Replace "click a customer row → nothing happens" and "click a product row → full page navigation" with a **consistent pattern**: a right-side drawer/panel for quick views (Customers, Wholesale applicants) and full pages for entities with heavy editing needs (Products, Orders — already full pages, keep as-is).
- Detail views get **tabs**: e.g. Customer detail → `Overview` (contact info, addresses, role) / `Orders` (their order history, pulled via `GET /wc/v3/orders?customer={id}`) / `Activity` (registration date, role changes, if trackable via WC customer meta timestamps).

### Feedback & responsiveness
- Replace inline "Saved" / error text (current pattern in Product/Order edit pages) with a **toast notification system** — consistent success/error/info toasts, auto-dismissing, stacked in a corner.
- Mobile: the existing sidebar-collapses-to-hamburger pattern is a good foundation; extend the same responsive treatment to tables (stack into cards below ~600px, matching the CSS breakpoint already defined for the sidebar) — not yet done for tables.

---

## 4. Phased Implementation Plan (Step 4)

Estimates assume **one full-time developer** already familiar with this codebase (i.e., the person who'd continue from where this panel currently stands).

### Phase 1 — Design System Foundation
**Builds:** Shared `<DataTable>` (sort, pagination, row-select, empty/loading states), `<Badge>` (fixed variants, no truncation), `<Button>` (primary/secondary/destructive/ghost), consistent `<Input>`/`<Select>`/`<Textarea>`, `<Modal>`/`<Drawer>` component, toast notification system + provider, `<Breadcrumbs>`, skeleton loader components. All existing pages get re-pointed at these instead of their current one-off markup.
**Estimate:** 3–4 days

### Phase 2 — Customers Rebuild
**Builds:** Filter by role/group, sortable columns, real pagination, **Customer detail drawer** with Overview/Orders/Activity tabs (orders tab pulls `GET /wc/v3/orders?customer={id}`), bulk actions (export selected to CSV, bulk role change), Add/Edit customer modal.
**Estimate:** 4–5 days
**Dependencies:** Phase 1 components.

### Phase 3 — Products Rebuild
**Builds:** Filter by category/stock/status, bulk actions (price adjust, category assign, publish/draft), **Add New Product** flow, variation editor for variable products (the most complex single item in this whole plan), quick-edit inline row, image file upload (replacing URL-paste).
**Estimate:** 5–6 days — variation editing carries most of the risk here.
**Dependencies:** Phase 1.

### Phase 4 — Orders Rebuild
**Builds:** Order notes thread (`GET/POST /wc/v3/orders/{id}/notes`), refund action, print invoice/packing slip (simple print-friendly view, not a PDF service), date-range filter, sortable columns, bulk status change, link-through to customer detail (depends on Phase 2 existing).
**Estimate:** 3–4 days
**Dependencies:** Phase 1, and Phase 2 for the customer link-through.

### Phase 5 — Wholesale Rebuild
**Builds:** Pagination, search/filter, reject-reason field (stored as new meta key + included in rejection email), approval audit trail (`approved_by`/`approved_at` meta), bulk approve, inline business-meta editing.
**Estimate:** 2–3 days
**Dependencies:** Phase 1.

### Phase 6 — Polish Pass
**Builds:** Responsive table→card behavior across all four sections, loading skeletons wired to real fetch states, consistent error states, toast notifications wired everywhere (replacing all remaining inline "Saved"/error text), accessibility pass (keyboard navigation, focus rings, aria labels on icon-only buttons).
**Estimate:** 3–4 days
**Dependencies:** All prior phases functionally complete.

---

## 5. Total Time Estimate

| Scenario | Estimate |
|---|---|
| **Optimistic** | ~20 days (~4 weeks) |
| **Realistic** | ~26 days (~5 weeks) |
| **Pessimistic** (variation editor scope creep, bulk-action edge cases on WooCommerce's REST batch endpoints, design system rework mid-flight) | ~35–40 days (~7–8 weeks) |

The single biggest source of estimate variance is **Phase 3's variation editor** — editing WooCommerce variable-product variations (per-variation price/stock/attributes) through the REST API is meaningfully more complex than the simple-product fields the current edit page already handles well. The second biggest variable is how much the **Customer detail view** scope grows once "orders placed" and "total spent" are live — those numbers are easy to display but slower to get right (spend calculations, currency handling, pagination of a customer's full order history).
