# UMKM ERP — Mobile-First Business App

A full-stack mobile web app for home-based food businesses in Indonesia.
Covers the complete operational cycle: procurement, production, sales, delivery scheduling, and financial reporting, in a single tool that requires no accounting knowledge to use.

Documentations and Live Demo links are coming soon.
<!--**[▶ Live Demo](link)** · **[Portfolio Brief](link)** · **[BRD v1.2](link)** · **[FSD v1.1](link)**-->

---

## What Problem This Solves

Indonesia has 65 million+ UMKM (small businesses), with 6.4 million in food & beverage alone. Most still record transactions manually using notebooks, WhatsApp, spreadsheets. Not because they resist technology, but because no existing tool fits:

- **Cash/ledger apps** (BukuWarung) — no inventory, no production, no cost tracking
- **POS apps** (Moka, Kasir Pintar) — designed for retail counters, not recipe-based production
- **Accounting software** (Mekari Jurnal, Accurate) — requires accounting knowledge, expensive setup

UMKM ERP fills the gap: recipe-based multi-output production, automated HPP (harga pokok produksi/cost of goods) estimation, payment ledger with partial payments, customer directory, and financial reporting — all in a mobile-first interface in Bahasa Indonesia.

---

## What's Built

### 6 Modules

| Module | What it does |
|--------|-------------|
| **Pembelian** | Record ingredient purchases (dropdown-first UI, auto-updates inventory) and non-inventory expenses |
| **Gudang** | Manage raw materials, semi-finished goods, and finished products. Define multi-output recipes. Run production batches with automatic stock deduction and audit log. |
| **Penjualan** | Create orders with customer directory integration, ongkir, and pre-order support. Payment ledger tracks partial payments (DP). Full order edit post-creation. |
| **Pelanggan** | Customer directory with type tagging (Konsumen / Reseller / Toko), search, and one-tap order creation from any customer card. |
| **Jadwal Kirim** | Delivery schedule with calendar view, date-based filtering, and delivery status tracking (Menunggu → Dikirim → Selesai). |
| **Laporan** | Financial summary: gross profit, revenue by customer type, top products, top suppliers, HPP/margin table, outstanding receivables. CSV export for Excel/Google Sheets. |

### Key Features

**Recipe engine — multi-output**
> One recipe can produce multiple distinct output items per batch. Handles multi-stage production: a semi-finished item (Bahan Matang) can be an ingredient in another recipe.

**HPP estimation**
> Weighted average purchase price per ingredient → batch cost → distributed across all outputs → HPP per unit. Shown on every finished product card with margin % badge (green/red). Disclaimer shown where ingredient history is incomplete.

**Payment ledger**
> Each order has a running payment log. Status computed from the ledger: Belum Bayar → DP (shows amount paid / total) → Lunas. Order cards show amber "Rp 50.000 / Rp 200.000" when partially paid.

**Invoice modal**
> Opens from any order card. Shows itemized breakdown, ongkir, total, payment history, and status. One-tap "Kirim via WhatsApp" sends a formatted nota to the customer.

**Full order edit**
> 2-step edit flow (same as new order): change customer details, dates, items, quantities, prices. Stock is restored from old items and re-deducted for new items on save.

---

## Technical Stack

| Layer | Choice | Note |
|-------|--------|------|
| Frontend | React (JSX) | Single-file component, no build step needed |
| Styling | Inline styles + CSS-in-JS | No Tailwind dependency |
| Database | Supabase (PostgreSQL) | Real-time subscriptions, Row Level Security |
| Auth | Supabase Auth | Email/password, per-user data isolation |
| Deployment | Any static host | Single JSX file, no backend required |
| AI-assisted dev | Claude (Anthropic) | Used for code generation, iteration, and debugging |

### Schema (11 tables)

`profiles` · `purchases` · `inventory` · `recipes` · `recipe_ingredients` · `recipe_outputs` · `warehouse_logs` · `customers` · `orders` · `order_items` · `order_payments`

<!--Full schema with RLS policies: [`supabase_setup_v3.sql`](link)-->

---

## Product Decisions Worth Noting

**Why no offline mode**
> Full IndexedDB sync adds significant infrastructure for marginal benefit at this scale. Form draft saving (localStorage) covers the most common poor-signal scenario.

**Why inventory IDs are slugified names**
> `slugify(nama_barang)` links purchases, recipes, and stock without a separate lookup. Trade-off: item names are immutable after creation. Documented in FSD as a known limitation with a v2.0 fix path.

**Why ongkir is a pass-through**
> Collected from customer, paid to courier — net laba kotor impact is zero. Added to both pemasukan and pengeluaran to keep the accounting clean without requiring the operator to understand why.

**Why HPP is an estimate**
> Weighted average purchase price is sufficient for pricing decisions at this business scale. Not suitable for formal tax reporting — this disclaimer is shown in the UI.

**Why recipe outputs are a separate table**
> v1.0 had a single output column per recipe. v3 moved to `recipe_outputs` (one row per output) to support multi-output batches — e.g. one dough recipe producing both croissants and danishes. Required a schema migration documented in `supabase_setup_v3.sql`.

---

<!-- 
## Documentation

| Document | What it covers |
|----------|---------------|
| [BRD v1.2](link) | Business objectives, problem statement, competitive landscape, 27 requirements with MoSCoW prioritisation, out-of-scope decisions with rationale |
| [FSD v1.1](link) | Screen-by-screen functional spec: inputs, business logic, error handling, edge cases, schema reference |
| [supabase_setup_v3.sql](link) | Full schema with RLS policies, fresh install + migration sections |

---
-->

## Other Projects

- [Mercantail](link) — Merge-2 mobile game prototype + 5,000+ event playtest data analysis
<!--- [Forex EA](link) — Automated trading strategy on MT5 (XAU/USD, moving average + ATR-based SL/TP)-->

