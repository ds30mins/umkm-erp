import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Plus, ShoppingBag, Package, X, CheckCircle2, Loader2, ChefHat,
  Trash2, Utensils, ShoppingCart, MapPin, Calendar, Truck, Send,
  Clock, ChevronDown, Minus, Settings, BarChart2,
  Wallet, Edit2, AlertCircle, LogOut, Eye, EyeOff, Store,
  ArrowRight, Layers, Box, Wheat, Users, Search,
  FileText, Receipt, BookOpen, ChevronRight
} from 'lucide-react';

// ─── SUPABASE ──────────────────────────────────────────────
const SUPABASE_URL = 'https://fyvhopsnfzbhmfdrmtbt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5dmhvcHNuZnpiaG1mZHJtdGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4ODE4NjgsImV4cCI6MjA5MTQ1Nzg2OH0.mt4do01YLwWhSW_b8E1PqrdtwY_7m0tRbBagoJmWs8k';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── HELPERS ───────────────────────────────────────────────
const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);
const todayStr = () => new Date().toISOString().split('T')[0];
const friendlyDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return '-'; } };
const slugify = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');

const INVENTORY_TYPES = {
  raw:      { label: 'Bahan Baku',   short: 'Baku',   color: '#2563eb', bg: '#e8f4ff', icon: Wheat  },
  semi:     { label: 'Bahan Matang', short: 'Matang', color: '#0d9488', bg: '#f0fdfa', icon: Layers },
  finished: { label: 'Produk',       short: 'Produk', color: '#16a34a', bg: '#edf9f0', icon: Box    },
};

const CUSTOMER_TYPES = ['Konsumen', 'Reseller', 'Toko'];
const SATUAN_OPTIONS  = ['pcs','kg','gr','liter','ml','pak','lusin','karton','loyang','porsi'];
const BAYAR_OPTIONS   = ['Cash','Transfer','QRIS'];

// ─── THEME ─────────────────────────────────────────────────
// Light design matching HTML mockups: white header, white cards, blue accents, #f4f5f9 bg
const THEME = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');

  :root {
    --navy:#0f1130; --navy-mid:#1e2247;
    --blue:#2563eb; --blue-soft:#f0f4ff; --blue-mid:#3b82f6;
    --teal:#0d9488; --teal-soft:#f0fdfa;
    --green:#16a34a; --green-soft:#edf9f0;
    --red:#ef4444; --red-soft:#fef2f2;
    --yellow:#f59e0b; --yellow-bg:#fffbeb; --yellow-dark:#d97706;
    --purple:#7c3aed; --purple-soft:#f5f3ff;
    --bg:#f4f5f9; --card:#ffffff; --text:#0f1130;
    --muted:#a0a3b1; --border:#f0f0f4; --border-strong:#e5e7eb;
    --shadow:0 1px 4px rgba(15,17,48,0.06);
    --shadow-md:0 4px 16px rgba(15,17,48,0.08);
    --radius:16px; --radius-sm:12px; --radius-xs:8px;
  }

  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  html{overflow-y:scroll;}
  body{
    background:var(--bg);
    font-family:'Plus Jakarta Sans',sans-serif;
    color:var(--text);
    font-size:14px;
    -webkit-font-smoothing:antialiased;
    width:100%;
    max-width:100vw;
    margin:0;
    overflow-x:hidden;
  }
  ::-webkit-scrollbar{width:3px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:var(--border-strong);border-radius:4px;}

  /* ── APP SHELL ── */
  .app-shell {
    width: 100%;
    max-width: 480px;
    margin: 0 auto;
    min-height: 100vh;
    background: var(--bg);
    position: relative;
  }

  /* ── HEADER (light — matches mockup) ── */
  .header {
    background: white;
    padding: 52px 20px 14px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    z-index: 40;
    box-shadow: 0 1px 8px rgba(15,17,48,0.05);
  }
  .header-greeting {
    font-size: 10px;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.09em;
    margin-bottom: 2px;
  }
  .header-title {
    font-size: 18px;
    font-weight: 800;
    color: var(--navy);
    letter-spacing: -0.02em;
  }
  .header-location {
    font-size: 10px;
    color: var(--muted);
    font-weight: 500;
    margin-top: 2px;
  }
  .header-right {
    display: flex;
    align-items: center;
    gap: 7px;
    flex-shrink: 0;
  }

  /* ── PERIOD BUTTON (light) ── */
  .period-btn {
    background: var(--blue-soft);
    color: var(--blue);
    border: none;
    border-radius: var(--radius-xs);
    padding: 6px 11px;
    font-size: 11px;
    font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }
  .period-select-light {
    background: var(--blue-soft);
    color: var(--blue);
    border: none;
    border-radius: var(--radius-xs);
    padding: 6px 28px 6px 11px;
    font-size: 11px;
    font-weight: 700;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%232563eb' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 9px center;
  }

  /* ── SETTINGS ICON BUTTON ── */
  .icon-btn {
    background: var(--bg);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-xs);
    padding: 7px;
    cursor: pointer;
    color: var(--muted);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background .15s;
  }
  .icon-btn:hover { background: white; }

  /* ── ADD BUTTON (header) ── */
  .add-btn-header {
    background: var(--blue);
    color: white;
    border: none;
    border-radius: var(--radius-xs);
    padding: 6px 12px;
    font-size: 11px;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: 'Plus Jakarta Sans', sans-serif;
  }

  /* ── SUBTABS ── */
  .subtabs {
    background: white;
    padding: 8px 16px;
    display: flex;
    gap: 4px;
    border-bottom: 1px solid var(--border);
  }
  .subtab {
    flex: 1;
    padding: 7px 4px;
    border-radius: 9px;
    border: none;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    text-align: center;
    transition: all .15s;
  }
  .subtab.active { background: var(--navy); color: white; }
  .subtab:not(.active) { background: var(--bg); color: var(--muted); }

  /* ── INLINE TABS (inside body) ── */
  .inline-tabs {
    display: flex;
    gap: 4px;
    background: white;
    border-radius: 12px;
    padding: 4px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border-strong);
  }
  .inline-tab {
    flex: 1;
    padding: 7px 4px;
    border-radius: 9px;
    border: none;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    text-align: center;
    transition: all .15s;
  }
  .inline-tab.active { background: var(--navy); color: white; }
  .inline-tab:not(.active) { background: transparent; color: var(--muted); }

  /* ── BODY WRAPPER ── */
  .body-wrap {
    padding: 14px 16px 100px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  /* ── SECTION TITLE ── */
  .section-title {
    font-size: 9px;
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.09em;
  }

  /* ── LABA CARD (Ringkasan hero) ── */
  .laba-card {
    background: white;
    border-radius: var(--radius);
    padding: 16px 18px;
    border-left: 4px solid var(--blue);
    box-shadow: var(--shadow);
    margin-bottom: 0;
  }
  .laba-label {
    font-size: 10px;
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
  }
  .laba-value {
    font-size: 26px;
    font-weight: 900;
    color: var(--navy);
    letter-spacing: -0.03em;
  }
  .laba-value.negative { color: var(--red); }
  .laba-sub {
    font-size: 10px;
    color: var(--muted);
    font-weight: 500;
    margin-top: 2px;
  }

  /* ── MINI STATS GRID ── */
  .mini-stats {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
  }
  .mini-card {
    background: white;
    border-radius: 14px;
    padding: 12px 10px;
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .mini-icon { font-size: 14px; margin-bottom: 2px; }
  .mini-label {
    font-size: 9px;
    font-weight: 700;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .mini-value { font-size: 13px; font-weight: 800; color: var(--navy); letter-spacing: -0.01em; }
  .mini-value.green { color: var(--green); }
  .mini-value.red   { color: var(--red); }

  /* ── SUMMARY BAR (Pembelian / Penjualan) ── */
  .summary-bar {
    background: white;
    border-radius: var(--radius);
    padding: 14px 16px;
    border-left: 4px solid var(--blue);
    box-shadow: var(--shadow);
  }
  .summary-bar.green-accent { border-left-color: var(--green); }
  .summary-label { font-size: 9px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 3px; }
  .summary-value { font-size: 22px; font-weight: 900; color: var(--navy); letter-spacing: -0.03em; }
  .summary-value.green { color: var(--green); }
  .summary-sub { font-size: 9px; color: var(--muted); font-weight: 500; margin-top: 1px; }

  /* ── MODULE GRID (Ringkasan) ── */
  .modules-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .module-card {
    background: white;
    border-radius: var(--radius);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: var(--shadow);
    cursor: pointer;
    border: 1px solid var(--border);
    transition: box-shadow .15s, transform .1s;
  }
  .module-card:active { transform: scale(0.97); }
  .module-card-full { grid-column: 1 / -1; flex-direction: row; align-items: center; gap: 12px; }
  .module-top { display: flex; justify-content: space-between; align-items: flex-start; }
  .module-icon { width: 36px; height: 36px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .module-arrow { font-size: 14px; color: #d0d3dc; }
  .module-name { font-size: 13px; font-weight: 800; color: var(--navy); margin-bottom: 1px; }
  .module-desc { font-size: 10px; color: var(--muted); font-weight: 500; }

  /* ── ADD CTA (dashed, inside body) ── */
  .add-cta {
    background: white;
    border: 1.5px dashed #c7d2fe;
    border-radius: var(--radius-sm);
    padding: 11px 0;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 700;
    color: var(--blue);
    cursor: pointer;
    font-family: 'Plus Jakarta Sans', sans-serif;
    transition: background .15s;
  }
  .add-cta:hover { background: var(--blue-soft); }

  /* ── WHITE CARD ── */
  .card {
    background: white;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    border: 1px solid var(--border);
  }

  /* ── PURCHASE ITEM ── */
  .beli-item {
    background: white;
    border-radius: var(--radius);
    padding: 11px 14px;
    box-shadow: var(--shadow);
    border: 1px solid var(--border);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }
  .beli-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .beli-name { font-size: 12px; font-weight: 700; color: var(--navy); }
  .beli-meta { font-size: 10px; color: var(--muted); font-weight: 500; margin-top: 1px; }
  .beli-rp { font-size: 13px; font-weight: 800; color: var(--navy); }
  .beli-qty { font-size: 10px; font-weight: 700; color: var(--blue); background: var(--blue-soft); padding: 2px 8px; border-radius: 99px; margin-top: 3px; display: inline-block; }

  /* ── INVENTORY ITEM ── */
  .inv-item {
    background: white;
    border-radius: var(--radius);
    padding: 12px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: var(--shadow);
    border: 1px solid var(--border);
  }
  .inv-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .inv-stock-num { font-size: 19px; font-weight: 900; color: var(--navy); line-height: 1; }
  .inv-stock-unit { font-size: 9px; color: var(--muted); font-weight: 600; text-align: right; }
  .inv-action-btn { width: 28px; height: 28px; border-radius: 8px; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }

  /* ── STOK CHIPS ── */
  .stok-chips { display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px; }
  .stok-chip { flex-shrink: 0; border-radius: 11px; padding: 8px 13px; display: flex; align-items: center; gap: 6px; }
  .stok-chip-label { font-size: 9px; font-weight: 700; }
  .stok-chip-count { font-size: 16px; font-weight: 900; color: var(--navy); }

  /* ── RECIPE CARD ── */
  .recipe-card { background: white; border-radius: var(--radius); padding: 13px 14px; box-shadow: var(--shadow); border: 1px solid var(--border); }
  .recipe-name { font-size: 12px; font-weight: 800; color: var(--navy); }
  .recipe-ingredients { background: var(--bg); border-radius: 9px; padding: 8px 11px; margin-top: 8px; }
  .recipe-ing-row { display: flex; justify-content: space-between; font-size: 10px; font-weight: 600; color: #4b5563; padding: 3px 0; border-bottom: 1px solid var(--border); }
  .recipe-ing-row:last-child { border-bottom: none; }

  /* ── ORDER CARD ── */
  .order-card {
    background: white;
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    border: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }
  .order-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; border-radius: 2px 0 0 2px; }
  .order-body { padding: 12px 14px 12px 20px; }
  .order-name { font-size: 13px; font-weight: 800; color: var(--navy); }
  .order-meta { font-size: 9px; color: var(--muted); font-weight: 500; margin-top: 1px; }
  .order-items-bg { background: var(--bg); border-radius: 8px; padding: 7px 10px; margin: 7px 0; }
  .order-item-row { display: flex; justify-content: space-between; font-size: 10px; font-weight: 600; color: #4b5563; padding: 2px 0; }
  .order-actions { display: flex; gap: 5px; margin-top: 7px; }
  .order-action-btn { border: none; border-radius: 8px; padding: 7px 0; font-size: 10px; font-weight: 700; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; text-align: center; display: flex; align-items: center; justify-content: center; gap: 4px; }

  /* ── CUSTOMER CARD ── */
  .customer-card { background: white; border-radius: var(--radius); padding: 12px 14px; display: flex; align-items: center; gap: 11px; box-shadow: var(--shadow); border: 1px solid var(--border); }
  .customer-avatar { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; flex-shrink: 0; }

  /* ── DELIVERY CARD ── */
  .delivery-card { background: white; border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--border); position: relative; overflow: hidden; }
  .delivery-bar { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; }
  .delivery-body { padding: 12px 14px 12px 20px; }
  .status-chips { display: flex; gap: 4px; margin-top: 8px; }
  .status-chip { flex: 1; border: none; border-radius: 8px; padding: 6px 0; font-size: 9px; font-weight: 700; cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif; text-align: center; }

  /* ── CALENDAR ── */
  .calendar-card { background: white; border-radius: var(--radius); padding: 13px 14px; box-shadow: var(--shadow); border: 1px solid var(--border); }
  .cal-nav { display: flex; justify-content: space-between; align-items: center; margin-bottom: 9px; }
  .cal-nav-btn { background: var(--bg); border: none; border-radius: 7px; width: 26px; height: 26px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; color: var(--muted); font-weight: 700; }
  .cal-title { font-size: 12px; font-weight: 800; color: var(--navy); }
  .cal-grid { display: grid; grid-template-columns: repeat(7,1fr); gap: 2px; }
  .cal-day-header { text-align: center; font-size: 8px; font-weight: 700; color: var(--muted); padding: 2px 0; }
  .cal-day { aspect-ratio:1; display:flex; flex-direction:column; align-items:center; justify-content:center; border-radius:7px; font-size:10px; font-weight:600; cursor:pointer; color:var(--navy); position:relative; transition:all .1s; }
  .cal-day:hover { background: var(--yellow-bg); }
  .cal-day.today { background: var(--navy); color: white; font-weight: 800; }
  .cal-day.selected { background: #fbbf24 !important; color: var(--navy) !important; font-weight: 900; }
  .cal-day.has-order::after { content:''; position:absolute; bottom:2px; width:3px; height:3px; border-radius:50%; background:var(--blue); }

  /* ── SEARCH BAR ── */
  .search-bar { background: white; border-radius: var(--radius-sm); padding: 10px 13px; display: flex; align-items: center; gap: 9px; border: 1px solid var(--border-strong); box-shadow: var(--shadow); }
  .search-bar input { border: none; background: none; font-size: 12px; font-weight: 500; font-family: 'Plus Jakarta Sans', sans-serif; color: var(--text); outline: none; flex: 1; }
  .search-bar input::placeholder { color: var(--muted); }

  /* ── PO TAG ── */
  .po-tag { display:inline-flex; align-items:center; gap:3px; background:#fef3c7; color:#d97706; padding:2px 7px; border-radius:99px; font-size:9px; font-weight:800; border:1px solid #fde68a; }

  /* ── BADGES ── */
  .badge { display:inline-flex; align-items:center; gap:3px; padding:2px 8px; border-radius:99px; font-size:10px; font-weight:700; letter-spacing:.02em; }
  .badge-green { background:var(--green-soft); color:var(--green); }
  .badge-red   { background:var(--red-soft);   color:var(--red);   }
  .badge-yellow{ background:var(--yellow-bg);  color:var(--yellow-dark); }
  .badge-blue  { background:var(--blue-soft);  color:var(--blue);  }
  .badge-teal  { background:var(--teal-soft);  color:var(--teal);  }
  .badge-purple{ background:var(--purple-soft);color:var(--purple);}
  .badge-gray  { background:#f3f4f6; color:var(--muted); }
  .badge-dark  { background:var(--navy); color:white; }

  /* ── FORMS ── */
  .input { width:100%; background:var(--bg); border:1.5px solid var(--border-strong); border-radius:var(--radius-xs); padding:11px 13px; font-size:13px; font-weight:500; font-family:'Plus Jakarta Sans',sans-serif; color:var(--text); outline:none; transition:border-color .15s,background .15s; appearance:none; -webkit-appearance:none; }
  .input:focus { border-color:var(--blue); background:white; box-shadow:0 0 0 3px rgba(37,99,235,.08); }
  select.input { background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 11px center; padding-right:32px; cursor:pointer; }
  .label { font-size:10px; font-weight:700; color:var(--muted); text-transform:uppercase; letter-spacing:.08em; margin-bottom:5px; display:block; }
  .input-row { display:grid; gap:10px; }
  .input-row-2 { grid-template-columns:1fr 1fr; }
  .input-row-3 { grid-template-columns:1fr 1fr 1fr; }
  .input-wrap { position:relative; }
  .input-wrap .input { padding-right:42px; }
  .input-icon-right { position:absolute; right:11px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:var(--muted); padding:4px; display:flex; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter:invert(.4); cursor:pointer; }

  /* ── BUTTONS ── */
  .btn { border:none; border-radius:var(--radius-sm); padding:13px 20px; font-weight:700; font-size:14px; cursor:pointer; width:100%; font-family:'Plus Jakarta Sans',sans-serif; transition:opacity .15s,transform .1s; display:flex; align-items:center; justify-content:center; gap:8px; }
  .btn:active { transform:scale(0.98); }
  .btn:disabled { opacity:.45; cursor:not-allowed; }
  .btn-dark   { background:var(--navy); color:white; }
  .btn-blue   { background:var(--blue); color:white; }
  .btn-ghost  { background:var(--bg); color:var(--text); border:1.5px solid var(--border-strong); }
  .btn-red    { background:var(--red); color:white; }
  .btn-green  { background:var(--green); color:white; }

  /* ── MODAL ── */
  .modal-overlay { position:fixed; inset:0; z-index:150; background:rgba(15,17,48,0.5); backdrop-filter:blur(6px); display:flex; align-items:flex-end; justify-content:center; }
  @media(min-width:480px){ .modal-overlay{ align-items:center; } .modal-sheet{ border-radius:var(--radius)!important; max-width:460px!important; } }
  .modal-sheet { background:white; width:100%; max-width:480px; border-radius:22px 22px 0 0; padding:22px 20px 36px; max-height:92vh; overflow-y:auto; animation:slideUp .24s cubic-bezier(.32,.72,0,1); }
  .modal-handle { width:36px; height:4px; background:var(--border-strong); border-radius:99px; margin:0 auto 18px; }
  .modal-title { font-size:16px; font-weight:800; color:var(--navy); margin-bottom:0; }

  /* ── STEP INDICATOR ── */
  .step-dot { width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:800; transition:all .2s; }
  .step-line { flex:1; height:2px; border-radius:1px; transition:background .2s; }

  /* ── BOTTOM NAV ── */
  .bottom-nav { position:fixed; bottom:0; left:0; right:0; max-width:480px; margin:0 auto; background:white; border-top:1px solid var(--border); padding:7px 4px 18px; display:flex; justify-content:space-around; z-index:50; }
  .nav-item { display:flex; flex-direction:column; align-items:center; gap:3px; background:none; border:none; cursor:pointer; padding:5px 8px; border-radius:10px; transition:all .15s; color:#c8cad8; font-family:'Plus Jakarta Sans',sans-serif; min-width:46px; }
  .nav-item.active { color:var(--navy); }
  .nav-item span { font-size:8px; font-weight:800; text-transform:uppercase; letter-spacing:.05em; }
  .nav-dot { width:4px; height:4px; background:var(--blue); border-radius:50%; margin-top:1px; }

  /* ── AUTH ── */
  .auth-bg { min-height:100vh; background:var(--navy); display:flex; align-items:center; justify-content:center; padding:24px; }
  .auth-card { background:white; border-radius:22px; padding:32px 24px; width:100%; max-width:400px; box-shadow:0 24px 80px rgba(0,0,0,.4); animation:fadeUp .4s ease; }

  /* ── ALERT CARD (PO upcoming) ── */
  .alert-card { background:var(--yellow-bg); border:1px solid #fde68a; border-radius:14px; padding:12px 14px; display:flex; align-items:center; gap:10px; }

  /* ── CUSTOM RANGE ── */
  .custom-range { display:flex; gap:10px; }
  .custom-range > div { flex:1; }

  /* ── TOP PRODUCTS CARD ── */
  .top-products-card { background:white; border-radius:var(--radius); padding:14px; box-shadow:var(--shadow); border:1px solid var(--border); }
  .product-row { display:flex; align-items:center; gap:9px; padding:7px 0; border-bottom:1px solid var(--bg); }
  .product-row:last-child { border-bottom:none; }
  .product-rank { width:22px; height:22px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:900; flex-shrink:0; }

  /* ── ANIMATIONS ── */
  @keyframes slideUp { from{transform:translateY(40px);opacity:0;} to{transform:translateY(0);opacity:1;} }
  @keyframes fadeUp  { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
  @keyframes spin    { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
  .animate-spin { animation:spin 1s linear infinite; }
  .animate-fade { animation:fadeUp .3s ease forwards; }
  .divider { height:1px; background:var(--border); margin:10px 0; }
  .empty-state { text-align:center; padding:36px 0; color:var(--muted); }
  .empty-state svg { opacity:.2; margin:0 auto 8px; display:block; }
  .empty-state p { font-size:12px; font-weight:600; }
`;

// ─── CUSTOMER TYPE COLORS ──────────────────────────────────
const custTypeStyle = (type) => {
  if (type === 'Reseller') return { bg: '#ede9fe', color: '#7c3aed', avatar: '#ddd6fe' };
  if (type === 'Toko')     return { bg: '#fef3c7', color: '#d97706', avatar: '#fde68a' };
  return { bg: '#eff6ff', color: '#2563eb', avatar: '#dbeafe' };
};

// ─── AUTH ──────────────────────────────────────────────────
const AuthScreen = () => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [namaUMKM, setNamaUMKM] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const showMsg = (text, type = 'error') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 5000); };

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) showMsg('Email atau password salah.');
    setLoading(false);
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!namaUMKM.trim()) { showMsg('Nama UMKM wajib diisi.'); return; }
    if (password.length < 6) { showMsg('Password minimal 6 karakter.'); return; }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nama_umkm: namaUMKM.trim() } } });
    if (error) showMsg(error.message);
    else if (data.user) {
      await supabase.from('profiles').upsert({ user_id: data.user.id, nama_umkm: namaUMKM.trim(), nama_user: '', tentang: '', domisili: '' });
      showMsg('Akun berhasil dibuat! Silakan login.', 'success'); setMode('login');
    }
    setLoading(false);
  };
  const handleForgot = async (e) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) showMsg(error.message); else showMsg('Link reset password sudah dikirim.', 'success');
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      <style>{THEME}</style>
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 48, height: 48, background: '#0f1130', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Store size={22} color="white" />
          </div>
          <h1 style={{ fontSize: 21, fontWeight: 900, color: '#0f1130' }}>UMKM ERP</h1>
          <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 3 }}>
            {mode === 'login' ? 'Selamat datang kembali 👋' : mode === 'register' ? 'Buat akun baru' : 'Reset password'}
          </p>
        </div>
        {msg && (
          <div style={{ background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'success' ? '#16a34a' : '#ef4444', padding: '10px 13px', borderRadius: 9, fontSize: 12, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
            {msg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />} {msg.text}
          </div>
        )}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div><label className="label">Email</label><input required type="email" className="input" placeholder="email@kamu.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><label className="label">Password</label>
              <div className="input-wrap">
                <input required type={showPass ? 'text' : 'password'} className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(p => !p)}>{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>
            <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'right', padding: 0 }}>Lupa password?</button>
            <button type="submit" disabled={loading} className="btn btn-dark">{loading ? <Loader2 size={16} className="animate-spin" /> : 'Masuk'}</button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', fontWeight: 500, marginTop: 4 }}>
              Belum punya akun? <button type="button" onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Daftar</button>
            </p>
          </form>
        )}
        {mode === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <div><label className="label">Nama UMKM</label><input required className="input" placeholder="Bakeri Bu Sari" value={namaUMKM} onChange={e => setNamaUMKM(e.target.value)} /></div>
            <div><label className="label">Email</label><input required type="email" className="input" placeholder="email@kamu.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><label className="label">Password</label>
              <div className="input-wrap">
                <input required type={showPass ? 'text' : 'password'} className="input" placeholder="Minimal 6 karakter" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(p => !p)}>{showPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-dark">{loading ? <Loader2 size={16} className="animate-spin" /> : 'Buat Akun'}</button>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
              Sudah punya akun? <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>Masuk</button>
            </p>
          </form>
        )}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Masukkan email kamu, kami kirim link reset password.</p>
            <div><label className="label">Email</label><input required type="email" className="input" placeholder="email@kamu.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <button type="submit" disabled={loading} className="btn btn-dark">{loading ? <Loader2 size={16} className="animate-spin" /> : 'Kirim Link Reset'}</button>
            <button type="button" onClick={() => setMode('login')} className="btn btn-ghost">← Kembali</button>
          </form>
        )}
      </div>
    </div>
  );
};

const FirstTimeSetup = ({ user, onDone }) => {
  const [namaUMKM, setNamaUMKM] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault(); if (!namaUMKM.trim()) return; setLoading(true);
    await supabase.from('profiles').upsert({ user_id: user.id, nama_umkm: namaUMKM.trim(), nama_user: user.user_metadata?.full_name || '', tentang: '', domisili: '' });
    onDone(); setLoading(false);
  };
  return (
    <div className="auth-bg"><style>{THEME}</style>
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>👋</div>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#0f1130', marginBottom: 6 }}>Selamat datang!</h2>
        <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 500, marginBottom: 22 }}>Satu langkah lagi — apa nama usaha kamu?</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 13, textAlign: 'left' }}>
          <div><label className="label">Nama UMKM</label><input required className="input" placeholder="Warung Makan Pak Budi" value={namaUMKM} onChange={e => setNamaUMKM(e.target.value)} autoFocus /></div>
          <button type="submit" disabled={loading} className="btn btn-dark">{loading ? <Loader2 size={16} className="animate-spin" /> : 'Mulai Sekarang →'}</button>
        </form>
      </div>
    </div>
  );
};

// ─── MAIN APP ──────────────────────────────────────────────
const ERPApp = ({ user, profile: initialProfile, onProfileUpdate }) => {
  const [activeTab, setActiveTab]         = useState('ringkasan');
  const [subTabGudang, setSubTabGudang]   = useState('stok');
  const [subTabJual, setSubTabJual]       = useState('hari_ini');
  const [showSettings, setShowSettings]   = useState(false);
  const [calendarOpen, setCalendarOpen]   = useState(false);
  const [calendarDate, setCalendarDate]   = useState(new Date());
  const [selectedCalDay, setSelectedCalDay] = useState(null);
  const [jadwalFilter, setJadwalFilter]   = useState('hari_ini');

  const [purchases,  setPurchases]  = useState([]);
  const [inventory,  setInventory]  = useState([]);
  const [recipes,    setRecipes]    = useState([]);
  const [logs,       setLogs]       = useState([]);
  const [orders,     setOrders]     = useState([]);
  const [orderPayments, setOrderPayments] = useState([]);
  const [customers,  setCustomers]  = useState([]);
  const [profile,    setProfile]    = useState(initialProfile);

  const [activeModal,        setActiveModal]        = useState(null);
  const [toast,              setToast]              = useState(null);
  const [isSaving,           setIsSaving]           = useState(false);
  const [selectedItem,       setSelectedItem]       = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [searchCustomer,     setSearchCustomer]     = useState('');
  const [custTypeFilter,     setCustTypeFilter]     = useState('Semua');

  const [pembelianPeriod, setPembelianPeriod] = useState('bulan_ini');
  const [pembelianFrom,   setPembelianFrom]   = useState('');
  const [pembelianTo,     setPembelianTo]     = useState('');
  const [penjualanPeriod, setPenjualanPeriod] = useState('bulan_ini');
  const [penjualanFrom,   setPenjualanFrom]   = useState('');
  const [penjualanTo,     setPenjualanTo]     = useState('');
  const [ringkasanPeriod, setRingkasanPeriod] = useState('bulan_ini');
  const [ringkasanFrom,   setRingkasanFrom]   = useState('');
  const [ringkasanTo,     setRingkasanTo]     = useState('');

  const emptyPurchaseForm  = { nama_barang: '', supplier: '', jumlah: '', satuan: 'pcs', harga_satuan: '', tanggal: todayStr(), is_expense_only: false };
  const emptyCustomerForm  = { nama: '', wa: '', alamat: '', customer_type: 'Konsumen', notes: '' };
  const emptyRecipeForm    = { nama: '', outputs: [{ nama: '', jumlah_output: 1, satuan_output: 'pcs', type: 'finished' }], ingredients: [{ nama_bahan: '', qty: '', satuan: 'pcs' }] };
  const emptyProdForm      = { recipe_id: '', qty: 1, tanggal: todayStr() };
  const emptyNewItemForm   = { nama: '', satuan: 'pcs', type: 'raw', stok: 0, harga: 0 };
  const emptyOrderStep1    = { customer_id: '', nama: '', wa: '', alamat: '', customer_type: 'Konsumen', tgl_order: todayStr(), tgl_kirim: todayStr(), metode_bayar: 'Cash', status_bayar: 'Belum Bayar', ongkir: '' };

  const [purchaseForm,  setPurchaseForm]  = useState(emptyPurchaseForm);
  const [customerForm,  setCustomerForm]  = useState(emptyCustomerForm);
  const [recipeForm,    setRecipeForm]    = useState(emptyRecipeForm);
  const [prodForm,      setProdForm]      = useState(emptyProdForm);
  const [newItemForm,   setNewItemForm]   = useState(emptyNewItemForm);
  const [orderStep1,    setOrderStep1]    = useState(emptyOrderStep1);
  const [orderStep,     setOrderStep]     = useState(1);
  const [cart,          setCart]          = useState([]);
  const [removalForm,   setRemovalForm]   = useState({ alasan: 'Rusak', qty: 1 });
  const [priceForm,     setPriceForm]     = useState({ harga: '' });
  const [profileForm,   setProfileForm]   = useState({ nama_umkm: '', nama_user: '', tentang: '', domisili: '' });
  const [selectedCust,  setSelectedCust]  = useState(null);
  const [payingOrder,   setPayingOrder]   = useState(null);
  const emptyPaymentForm = { amount: '', metode: 'Cash', tanggal: todayStr(), note: '' };
  const [paymentForm,   setPaymentForm]   = useState(emptyPaymentForm);
  const [invoiceOrder,  setInvoiceOrder]  = useState(null);
  const [editOrderStep, setEditOrderStep] = useState(1);
  const [editCart,      setEditCart]      = useState([]);
  const [editOrderForm, setEditOrderForm] = useState(null);

  const uid = user.id;
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };
  const closeModal = () => {
    setActiveModal(null); setSelectedItem(null); setEditingTransaction(null);
    setOrderStep(1); setCart([]); setSelectedCust(null); setPayingOrder(null);
    setEditOrderStep(1); setEditCart([]); setEditOrderForm(null); setInvoiceOrder(null);
  };

  const fetchAll = useCallback(async () => {
    const [p, inv, rec, lg, ord, pay, cust, prof] = await Promise.all([
      supabase.from('purchases').select('*').eq('user_id', uid).order('tanggal', { ascending: false }),
      supabase.from('inventory').select('*').eq('user_id', uid),
      supabase.from('recipes').select('*, recipe_ingredients(*), recipe_outputs(*)').eq('user_id', uid).eq('is_archived', false),
      supabase.from('warehouse_logs').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('orders').select('*, order_items(*)').eq('user_id', uid).order('tgl_order', { ascending: false }),
      supabase.from('order_payments').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('customers').select('*').eq('user_id', uid).eq('is_active', true).order('nama'),
      supabase.from('profiles').select('*').eq('user_id', uid).single(),
    ]);
    if (p.data)    setPurchases(p.data);
    if (inv.data)  setInventory(inv.data);
    if (rec.data)  setRecipes(rec.data);
    if (lg.data)   setLogs(lg.data);
    if (ord.data)  setOrders(ord.data);
    if (pay.data)  setOrderPayments(pay.data);
    if (cust.data) setCustomers(cust.data);
    if (prof.data) { setProfile(prof.data); onProfileUpdate(prof.data); }
  }, [uid]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const subs = [
      supabase.channel('purch4').on('postgres_changes', { event: '*', schema: 'public', table: 'purchases', filter: `user_id=eq.${uid}` }, fetchAll).subscribe(),
      supabase.channel('inv4').on('postgres_changes',   { event: '*', schema: 'public', table: 'inventory',  filter: `user_id=eq.${uid}` }, fetchAll).subscribe(),
      supabase.channel('ord4').on('postgres_changes',   { event: '*', schema: 'public', table: 'orders',     filter: `user_id=eq.${uid}` }, fetchAll).subscribe(),
      supabase.channel('cust4').on('postgres_changes',  { event: '*', schema: 'public', table: 'customers',  filter: `user_id=eq.${uid}` }, fetchAll).subscribe(),
      supabase.channel('pay4').on('postgres_changes',   { event: '*', schema: 'public', table: 'order_payments', filter: `user_id=eq.${uid}` }, fetchAll).subscribe(),
    ];
    return () => subs.forEach(s => supabase.removeChannel(s));
  }, [uid, fetchAll]);

  const getDateRange = (period, from, to) => {
    const now = new Date();
    if (period === 'hari_ini')   return { from: todayStr(), to: todayStr() };
    if (period === 'minggu_ini') { const d = new Date(now); d.setDate(now.getDate() - now.getDay()); return { from: d.toISOString().split('T')[0], to: todayStr() }; }
    if (period === 'bulan_ini')  return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0], to: todayStr() };
    return { from, to };
  };

  const filteredPurchases = useMemo(() => {
    const { from, to } = getDateRange(pembelianPeriod, pembelianFrom, pembelianTo);
    if (!from || !to) return purchases;
    return purchases.filter(p => p.tanggal >= from && p.tanggal <= to);
  }, [purchases, pembelianPeriod, pembelianFrom, pembelianTo]);

  const filteredOrders = useMemo(() => {
    const { from, to } = getDateRange(penjualanPeriod, penjualanFrom, penjualanTo);
    if (!from || !to) return orders;
    return orders.filter(o => o.tgl_order >= from && o.tgl_order <= to);
  }, [orders, penjualanPeriod, penjualanFrom, penjualanTo]);

  const upcomingPOs = useMemo(() => orders.filter(o => o.is_po || o.tgl_kirim > todayStr()), [orders]);

  const deliveryList = useMemo(() => {
    const tod = todayStr();
    const tom = new Date(); tom.setDate(tom.getDate() + 1);
    const tomStr = tom.toISOString().split('T')[0];
    if (selectedCalDay) return orders.filter(o => o.tgl_kirim === selectedCalDay);
    return orders.filter(o => {
      if (!o.tgl_kirim) return false;
      if (jadwalFilter === 'hari_ini')  return o.tgl_kirim === tod;
      if (jadwalFilter === 'besok')     return o.tgl_kirim === tomStr;
      if (jadwalFilter === 'mendatang') return o.tgl_kirim > tomStr;
      return true;
    }).sort((a, b) => a.tgl_kirim?.localeCompare(b.tgl_kirim));
  }, [orders, jadwalFilter, selectedCalDay]);

  const ringkasanData = useMemo(() => {
    const { from, to } = getDateRange(ringkasanPeriod, ringkasanFrom, ringkasanTo);
    const inRange = (d) => (!from || !to) ? true : d >= from && d <= to;
    const paidOrders = orders.filter(o => inRange(o.tgl_order) && (o.status_bayar === 'Lunas' || o.status_bayar === 'DP'));
    const rangePurch  = purchases.filter(p => inRange(p.tanggal));
    const pemasukan   = orderPayments.filter(p => inRange(p.tanggal) && p.type !== 'refund').reduce((a, p) => a + (p.amount || 0), 0)
                      - orderPayments.filter(p => inRange(p.tanggal) && p.type === 'refund').reduce((a, p) => a + (p.amount || 0), 0);
    const pengeluaran = rangePurch.reduce((a, p) => a + (p.total_harga || 0), 0);
    const produkMap   = {};
    paidOrders.forEach(o => (o.order_items || []).forEach(it => { produkMap[it.nama] = (produkMap[it.nama] || 0) + it.qty; }));
    const topProduk   = Object.entries(produkMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { pemasukan, pengeluaran, laba: pemasukan - pengeluaran, topProduk, totalOrders: orders.filter(o => inRange(o.tgl_order)).length };
  }, [orders, purchases, orderPayments, ringkasanPeriod, ringkasanFrom, ringkasanTo]);

  const hppMap = useMemo(() => {
    const result = {};
    const totals = {};
    for (const p of purchases) {
      if (p.is_expense_only) continue;
      const slug = slugify(p.nama_barang);
      if (!totals[slug]) totals[slug] = { totalCost: 0, totalQty: 0 };
      totals[slug].totalCost += (p.total_harga || 0);
      totals[slug].totalQty  += (p.jumlah     || 0);
    }
    const avgPrice = {};
    for (const [slug, t] of Object.entries(totals)) { avgPrice[slug] = t.totalQty > 0 ? t.totalCost / t.totalQty : 0; }
    for (const recipe of recipes) {
      const outputs = recipe.recipe_outputs || [];
      const ingredients = recipe.recipe_ingredients || [];
      if (outputs.length === 0) continue;
      let batchCost = 0, incomplete = false;
      for (const ing of ingredients) {
        const price = avgPrice[slugify(ing.nama_bahan)];
        if (!price) { incomplete = true; continue; }
        batchCost += Number(ing.qty) * price;
      }
      const totalOutputQty = outputs.reduce((a, o) => a + Number(o.qty), 0);
      for (const out of outputs) {
        const outSlug = slugify(out.inventory_item_name);
        const outQty  = Number(out.qty);
        const hpp     = outQty > 0 ? (batchCost * (totalOutputQty > 0 ? outQty / totalOutputQty : 1)) / outQty : 0;
        const invItem = inventory.find(i => slugify(i.nama) === outSlug);
        if (!invItem) continue;
        const harga = invItem.harga || 0;
        const margin = harga - hpp;
        result[invItem.id] = { hpp, margin, marginPct: harga > 0 ? (margin / harga) * 100 : null, incomplete };
      }
    }
    return result;
  }, [purchases, recipes, inventory]);

  const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const DAYS_ID   = ['M','S','S','R','K','J','S'];
  const calDays = useMemo(() => {
    const y = calendarDate.getFullYear(), m = calendarDate.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days = Array(first).fill(null);
    for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) days.push(new Date(y, m, d));
    const orderDates = new Set(orders.map(o => o.tgl_kirim).filter(Boolean));
    return { days, orderDates };
  }, [calendarDate, orders]);

  const filteredCustomers = useMemo(() => {
    let list = customers;
    if (custTypeFilter !== 'Semua') list = list.filter(c => c.customer_type === custTypeFilter);
    if (searchCustomer) list = list.filter(c => c.nama.toLowerCase().includes(searchCustomer.toLowerCase()) || c.wa?.includes(searchCustomer));
    return list;
  }, [customers, custTypeFilter, searchCustomer]);

  // ── ACTION HANDLERS ──────────────────────────────────────
  const handleAddPurchase = async (e) => {
    e.preventDefault(); if (isSaving) return; setIsSaving(true);
    const qty = Number(purchaseForm.jumlah), price = Number(purchaseForm.harga_satuan), total = qty * price;
    try {
      await supabase.from('purchases').insert({ user_id: uid, nama_barang: purchaseForm.nama_barang, supplier: purchaseForm.supplier, jumlah: qty, satuan: purchaseForm.satuan, harga_satuan: price, total_harga: total, tanggal: purchaseForm.tanggal, is_expense_only: purchaseForm.is_expense_only });
      if (!purchaseForm.is_expense_only) {
        const slug = slugify(purchaseForm.nama_barang);
        const { data: existing } = await supabase.from('inventory').select('*').eq('user_id', uid).eq('id', slug).single();
        if (existing) await supabase.from('inventory').update({ stok: existing.stok + qty }).eq('user_id', uid).eq('id', slug);
        else await supabase.from('inventory').insert({ id: slug, user_id: uid, nama: purchaseForm.nama_barang, stok: qty, satuan: purchaseForm.satuan, type: 'raw', harga: 0 });
      }
      showToast('Pembelian disimpan ✓'); setPurchaseForm(emptyPurchaseForm); closeModal(); fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault(); if (isSaving) return; setIsSaving(true);
    try {
      if (selectedItem) await supabase.from('customers').update({ nama: customerForm.nama, wa: customerForm.wa, alamat: customerForm.alamat, customer_type: customerForm.customer_type, notes: customerForm.notes }).eq('id', selectedItem.id).eq('user_id', uid);
      else await supabase.from('customers').insert({ user_id: uid, ...customerForm });
      showToast(selectedItem ? 'Pelanggan diperbarui ✓' : 'Pelanggan disimpan ✓'); setCustomerForm(emptyCustomerForm); closeModal(); fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  const handleDeleteCustomer = async (cust) => {
    await supabase.from('customers').update({ is_active: false }).eq('id', cust.id).eq('user_id', uid);
    showToast('Pelanggan dihapus ✓'); fetchAll();
  };

  const handleAddManualItem = async (e) => {
    e.preventDefault(); if (isSaving) return; setIsSaving(true);
    const slug = slugify(newItemForm.nama);
    try {
      const { data: existing } = await supabase.from('inventory').select('*').eq('user_id', uid).eq('id', slug).single();
      if (existing) { showToast('Item sudah ada di inventori', 'error'); setIsSaving(false); return; }
      await supabase.from('inventory').insert({ id: slug, user_id: uid, nama: newItemForm.nama, stok: Number(newItemForm.stok) || 0, satuan: newItemForm.satuan, type: newItemForm.type, harga: Number(newItemForm.harga) || 0 });
      showToast('Item ditambahkan ✓'); setNewItemForm(emptyNewItemForm); closeModal(); fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  const handleAddRecipe = async (e) => {
    e.preventDefault(); if (isSaving) return; setIsSaving(true);
    try {
      const { data: recipe } = await supabase.from('recipes').insert({ user_id: uid, nama: recipeForm.nama, is_archived: false }).select().single();
      if (recipe) {
        await supabase.from('recipe_ingredients').insert(recipeForm.ingredients.map(ing => ({ recipe_id: recipe.id, user_id: uid, nama_bahan: ing.nama_bahan, qty: Number(ing.qty), satuan: ing.satuan })));
        await supabase.from('recipe_outputs').insert(recipeForm.outputs.map(out => ({ recipe_id: recipe.id, user_id: uid, inventory_item_name: out.nama, qty: Number(out.jumlah_output), satuan: out.satuan_output, type: out.type })));
      }
      showToast('Resep disimpan ✓'); setRecipeForm(emptyRecipeForm); closeModal(); fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  const handleProduction = async (e) => {
    e.preventDefault(); if (isSaving || !prodForm.recipe_id) return; setIsSaving(true);
    const recipe = recipes.find(r => r.id === Number(prodForm.recipe_id));
    const multiplier = Number(prodForm.qty) || 1;
    try {
      for (const ing of recipe.recipe_ingredients || []) {
        const slug = slugify(ing.nama_bahan);
        const { data: inv } = await supabase.from('inventory').select('*').eq('user_id', uid).eq('id', slug).single();
        if (!inv) throw new Error(`Bahan ${ing.nama_bahan} tidak ada di stok`);
        const needed = Number(ing.qty) * multiplier;
        if (inv.stok < needed) throw new Error(`Stok ${ing.nama_bahan} kurang (butuh ${needed}, ada ${inv.stok})`);
        await supabase.from('inventory').update({ stok: inv.stok - needed }).eq('user_id', uid).eq('id', slug);
      }
      const outputSummary = [];
      for (const out of recipe.recipe_outputs || []) {
        const outSlug = slugify(out.inventory_item_name);
        const outQty  = Number(out.qty) * multiplier;
        const { data: existing } = await supabase.from('inventory').select('*').eq('user_id', uid).eq('id', outSlug).single();
        if (existing) await supabase.from('inventory').update({ stok: existing.stok + outQty }).eq('user_id', uid).eq('id', outSlug);
        else await supabase.from('inventory').insert({ id: outSlug, user_id: uid, nama: out.inventory_item_name, stok: outQty, satuan: out.satuan, type: out.type || 'finished', harga: 0 });
        outputSummary.push(`${outQty} ${out.satuan} ${out.inventory_item_name}`);
      }
      await supabase.from('warehouse_logs').insert({ user_id: uid, type: 'PRODUKSI', detail: `${multiplier}x batch → ${outputSummary.join(', ')}`, tanggal: prodForm.tanggal });
      showToast('Produksi berhasil ✓'); closeModal(); fetchAll();
    } catch (err) { showToast(err.message, 'error'); } finally { setIsSaving(false); }
  };

  const handleSetPrice = async (e) => {
    e.preventDefault(); if (!selectedItem) return; setIsSaving(true);
    await supabase.from('inventory').update({ harga: Number(priceForm.harga) }).eq('user_id', uid).eq('id', selectedItem.id);
    showToast('Harga disimpan ✓'); closeModal(); fetchAll(); setIsSaving(false);
  };

  const handleRemoveItem = async (e) => {
    e.preventDefault(); if (!selectedItem) return; setIsSaving(true);
    const qty = Number(removalForm.qty);
    if (qty > selectedItem.stok) { showToast('Jumlah melebihi stok', 'error'); setIsSaving(false); return; }
    await supabase.from('inventory').update({ stok: selectedItem.stok - qty }).eq('user_id', uid).eq('id', selectedItem.id);
    await supabase.from('warehouse_logs').insert({ user_id: uid, type: 'REMOVAL', detail: `${qty} ${selectedItem.nama} (${removalForm.alasan})`, tanggal: todayStr() });
    showToast('Stok dihapus ✓'); closeModal(); fetchAll(); setIsSaving(false);
  };

  const addToCart = (item) => {
    if (!item.harga || item.harga === 0) { showToast('Set harga produk dulu!', 'error'); return; }
    setCart(prev => { const ex = prev.find(c => c.id === item.id); return ex ? prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c) : [...prev, { ...item, qty: 1 }]; });
  };
  const removeFromCart = (id) => setCart(prev => { const ex = prev.find(c => c.id === id); return ex?.qty > 1 ? prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c) : prev.filter(c => c.id !== id); });

  const handleCheckout = async (e) => {
    e.preventDefault(); if (isSaving || cart.length === 0) return; setIsSaving(true);
    const ongkir = Number(orderStep1.ongkir) || 0;
    const total  = cart.reduce((a, b) => a + b.qty * (b.harga || 0), 0) + ongkir;
    try {
      const { data: order } = await supabase.from('orders').insert({ user_id: uid, customer_id: orderStep1.customer_id || null, nama: orderStep1.nama, wa: orderStep1.wa, alamat: orderStep1.alamat, customer_type: orderStep1.customer_type, tgl_order: orderStep1.tgl_order, tgl_kirim: orderStep1.tgl_kirim, metode_bayar: orderStep1.metode_bayar, status_bayar: orderStep1.status_bayar, delivery_status: 'Menunggu', total, ongkir, status: 'Pesanan Baru', is_po: orderStep1.tgl_kirim > todayStr() }).select().single();
      if (order) {
        await supabase.from('order_items').insert(cart.map(item => ({ order_id: order.id, user_id: uid, nama: item.nama, qty: item.qty, harga: item.harga, inventory_id: item.id })));
        if (orderStep1.tgl_kirim <= todayStr()) {
          for (const item of cart) {
            const { data: inv } = await supabase.from('inventory').select('stok').eq('user_id', uid).eq('id', item.id).single();
            if (inv) await supabase.from('inventory').update({ stok: Math.max(0, inv.stok - item.qty) }).eq('user_id', uid).eq('id', item.id);
          }
        }
      }
      showToast('Pesanan dicatat ✓'); setCart([]); setOrderStep1(emptyOrderStep1); setOrderStep(1); setSelectedCust(null); closeModal(); fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  const openPayModal = (order) => { setPayingOrder(order); setPaymentForm(emptyPaymentForm); setActiveModal('payment'); };

  const handleAddPayment = async (e) => {
    e.preventDefault(); if (isSaving || !payingOrder) return; setIsSaving(true);
    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) { showToast('Masukkan jumlah bayar', 'error'); setIsSaving(false); return; }
    try {
      await supabase.from('order_payments').insert({ order_id: payingOrder.id, user_id: uid, amount, tanggal: paymentForm.tanggal, metode: paymentForm.metode, note: paymentForm.note, type: 'payment' });
      const { data: allPay } = await supabase.from('order_payments').select('*').eq('order_id', payingOrder.id);
      const totalPaid = (allPay || []).reduce((a, p) => p.type === 'refund' ? a - p.amount : a + p.amount, 0);
      const newStatus = totalPaid <= 0 ? 'Belum Bayar' : totalPaid >= payingOrder.total ? 'Lunas' : 'DP';
      await supabase.from('orders').update({ status_bayar: newStatus }).eq('user_id', uid).eq('id', payingOrder.id);
      showToast('Pembayaran dicatat ✓'); closeModal(); fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  const cancelOrder = async (order) => {
    if (!order.is_po) {
      for (const item of order.order_items || []) {
        const invId = item.inventory_id || slugify(item.nama);
        const { data: inv } = await supabase.from('inventory').select('stok').eq('user_id', uid).eq('id', invId).single();
        if (inv) await supabase.from('inventory').update({ stok: inv.stok + item.qty }).eq('user_id', uid).eq('id', invId);
      }
    }
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('user_id', uid).eq('id', order.id);
    showToast('Pesanan dibatalkan ✓'); fetchAll();
  };

  const handleEditPurchaseDate = async (e) => {
    e.preventDefault(); setIsSaving(true);
    await supabase.from('purchases').update({ tanggal: editingTransaction._newDate }).eq('user_id', uid).eq('id', editingTransaction.id);
    showToast('Tanggal diperbarui ✓'); closeModal(); fetchAll(); setIsSaving(false);
  };

  const openEditOrder = (order) => {
    setEditOrderForm({ customer_id: order.customer_id || '', nama: order.nama || '', wa: order.wa || '', alamat: order.alamat || '', customer_type: order.customer_type || 'Konsumen', tgl_order: order.tgl_order || todayStr(), tgl_kirim: order.tgl_kirim || todayStr(), metode_bayar: order.metode_bayar || 'Cash', status_bayar: order.status_bayar || 'Belum Bayar', ongkir: order.ongkir || '' });
    setEditCart((order.order_items || []).map(it => ({ id: it.inventory_id || slugify(it.nama), nama: it.nama, harga: it.harga, qty: it.qty, satuan: '', stok: 999 })));
    setEditingTransaction(order); setEditOrderStep(1); setActiveModal('editOrder');
  };

  const handleSaveEditOrder = async (e) => {
    e.preventDefault(); if (isSaving || !editingTransaction || editCart.length === 0) return; setIsSaving(true);
    try {
      const ongkir = Number(editOrderForm.ongkir) || 0;
      const newTotal = editCart.reduce((a, b) => a + b.qty * (b.harga || 0), 0) + ongkir;
      const newIsPo  = editOrderForm.tgl_kirim > todayStr();
      if (!editingTransaction.is_po) {
        for (const it of editingTransaction.order_items || []) {
          const invId = it.inventory_id || slugify(it.nama);
          const { data: inv } = await supabase.from('inventory').select('stok').eq('user_id', uid).eq('id', invId).single();
          if (inv) await supabase.from('inventory').update({ stok: inv.stok + it.qty }).eq('user_id', uid).eq('id', invId);
        }
      }
      await supabase.from('order_items').delete().eq('order_id', editingTransaction.id);
      await supabase.from('order_items').insert(editCart.map(item => ({ order_id: editingTransaction.id, user_id: uid, nama: item.nama, qty: item.qty, harga: item.harga, inventory_id: item.id })));
      if (!newIsPo) {
        for (const item of editCart) {
          const { data: inv } = await supabase.from('inventory').select('stok').eq('user_id', uid).eq('id', item.id).single();
          if (inv) await supabase.from('inventory').update({ stok: Math.max(0, inv.stok - item.qty) }).eq('user_id', uid).eq('id', item.id);
        }
      }
      await supabase.from('orders').update({ customer_id: editOrderForm.customer_id || null, nama: editOrderForm.nama, wa: editOrderForm.wa, alamat: editOrderForm.alamat, customer_type: editOrderForm.customer_type, tgl_order: editOrderForm.tgl_order, tgl_kirim: editOrderForm.tgl_kirim, metode_bayar: editOrderForm.metode_bayar, status_bayar: editOrderForm.status_bayar, ongkir, total: newTotal, is_po: newIsPo }).eq('user_id', uid).eq('id', editingTransaction.id);
      showToast('Pesanan diperbarui ✓'); closeModal(); fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  const addToEditCart = (item) => {
    if (!item.harga || item.harga === 0) { showToast('Set harga produk dulu!', 'error'); return; }
    setEditCart(prev => { const ex = prev.find(c => c.id === item.id); return ex ? prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c) : [...prev, { ...item, qty: 1 }]; });
  };
  const removeFromEditCart = (id) => setEditCart(prev => { const ex = prev.find(c => c.id === id); return ex?.qty > 1 ? prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c) : prev.filter(c => c.id !== id); });

  const updateDeliveryStatus = async (orderId, status) => {
    await supabase.from('orders').update({ delivery_status: status }).eq('user_id', uid).eq('id', orderId);
    if (status === 'Dikirim') {
      const order = orders.find(o => o.id === orderId);
      if (order?.is_po) {
        for (const item of order.order_items || []) {
          const invId = item.inventory_id || slugify(item.nama);
          const { data: inv } = await supabase.from('inventory').select('stok').eq('user_id', uid).eq('id', invId).single();
          if (inv) await supabase.from('inventory').update({ stok: Math.max(0, inv.stok - item.qty) }).eq('user_id', uid).eq('id', invId);
        }
        await supabase.from('orders').update({ is_po: false }).eq('user_id', uid).eq('id', orderId);
      }
    }
    showToast(`Status: ${status} ✓`); fetchAll();
  };

  const sendWhatsApp = (order) => {
    const items = (order.order_items || []).map(it => `${it.qty}x ${it.nama}`).join(', ');
    const text = `Halo ${order.nama}! 👋\n\nPesanan kamu: ${items}\nTotal: ${formatRupiah(order.total)}${order.ongkir > 0 ? `\nOngkir: ${formatRupiah(order.ongkir)}` : ''}\nJadwal kirim: ${order.tgl_kirim}\nAlamat: ${order.alamat}\n\nMohon ditunggu ya! 🙏`;
    window.open(`https://wa.me/${order.wa?.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const sendInvoiceWA = (order, payments = []) => {
    const totalPaid = payments.reduce((a, p) => p.type === 'refund' ? a - p.amount : a + p.amount, 0);
    const remaining = Math.max(0, (order.total || 0) - totalPaid);
    const lines = (order.order_items || []).map(it => `  ${it.qty}x ${it.nama} = ${formatRupiah(it.qty * (it.harga || 0))}`).join('\n');
    const payLine = totalPaid > 0 && remaining > 0 ? `\nSudah dibayar: ${formatRupiah(totalPaid)}\nSisa: ${formatRupiah(remaining)}` : totalPaid >= (order.total || 0) && totalPaid > 0 ? `\nStatus: ✅ LUNAS` : `\nStatus: Belum dibayar`;
    const text = `🧾 *NOTA PESANAN*\n${profile?.nama_umkm || ''}${profile?.domisili ? ' · ' + profile.domisili : ''}\n\nKepada: ${order.nama}\nTgl Order: ${order.tgl_order}\nTgl Kirim: ${order.tgl_kirim}${order.alamat ? '\nAlamat: ' + order.alamat : ''}\n\n*Rincian:*\n${lines}${order.ongkir > 0 ? `\nOngkir: ${formatRupiah(order.ongkir)}` : ''}\n──────────────\n*Total: ${formatRupiah(order.total)}*${payLine}\n\nTerima kasih! 🙏`;
    window.open(`https://wa.me/${order.wa?.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setIsSaving(true);
    await supabase.from('profiles').upsert({ user_id: uid, ...profileForm });
    setProfile(profileForm); onProfileUpdate(profileForm);
    showToast('Profil disimpan ✓'); setShowSettings(false); setIsSaving(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const PERIOD_OPTIONS = [
    { value: 'hari_ini', label: 'Hari Ini' },
    { value: 'minggu_ini', label: 'Minggu Ini' },
    { value: 'bulan_ini', label: 'Bulan Ini' },
    { value: 'custom', label: 'Custom' },
  ];

  const PeriodSelect = ({ value, onChange }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className="period-select-light">
      {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  const CustomRange = ({ from, setFrom, to, setTo }) => (
    <div className="custom-range">
      <div><label className="label">Dari</label><input type="date" className="input" value={from} onChange={e => setFrom(e.target.value)} /></div>
      <div><label className="label">Sampai</label><input type="date" className="input" value={to} onChange={e => setTo(e.target.value)} /></div>
    </div>
  );

  const MODULES = [
    { key: 'pembelian', icon: ShoppingBag, label: 'Pembelian',    color: '#2563eb', bg: '#e8f4ff', desc: 'Catat bahan masuk' },
    { key: 'gudang',    icon: Package,     label: 'Gudang',       color: '#0d9488', bg: '#f0fdfa', desc: 'Stok & resep' },
    { key: 'penjualan', icon: ShoppingCart,label: 'Penjualan',    color: '#16a34a', bg: '#edf9f0', desc: 'Buat pesanan baru' },
    { key: 'pelanggan', icon: Users,       label: 'Pelanggan',    color: '#7c3aed', bg: '#f5f3ff', desc: 'Direktori pelanggan' },
    { key: 'jadwal',    icon: Truck,       label: 'Jadwal Kirim', color: '#d97706', bg: '#fffbeb', desc: 'Pantau pengiriman' },
  ];

  // ── RENDER ────────────────────────────────────────────────
  return (
    <div className="app-shell">
      <style>{THEME}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 300, pointerEvents: 'none', whiteSpace: 'nowrap', animation: 'fadeUp .22s ease' }}>
          <div style={{ background: toast.type === 'error' ? '#ef4444' : '#0f1130', color: 'white', padding: '10px 20px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,.2)' }}>
            {toast.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} color="#86efac" />}
            <span style={{ fontWeight: 700, fontSize: 12 }}>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="header">
        <div>
          {activeTab === 'ringkasan' && profile?.nama_user && <div className="header-greeting">Halo, {profile.nama_user} 👋</div>}
          {activeTab !== 'ringkasan' && <div className="header-greeting">Modul</div>}
          <div className="header-title">
            {{ ringkasan: profile?.nama_umkm || 'Dashboard', pembelian: 'Pembelian', gudang: 'Gudang', penjualan: 'Penjualan', pelanggan: 'Pelanggan', jadwal: 'Jadwal Kirim' }[activeTab]}
          </div>
          {activeTab === 'ringkasan' && profile?.domisili && <div className="header-location">📍 {profile.domisili}</div>}
        </div>
        <div className="header-right">
          {activeTab === 'ringkasan' && <PeriodSelect value={ringkasanPeriod} onChange={setRingkasanPeriod} />}
          {activeTab === 'pembelian' && <PeriodSelect value={pembelianPeriod} onChange={setPembelianPeriod} />}
          {activeTab === 'penjualan' && <PeriodSelect value={penjualanPeriod} onChange={setPenjualanPeriod} />}
          {activeTab === 'pelanggan' && (
            <button className="add-btn-header" onClick={() => { setCustomerForm(emptyCustomerForm); setSelectedItem(null); setActiveModal('customer'); }}>
              <Plus size={13} /> Tambah
            </button>
          )}
          <button className="icon-btn" onClick={() => { setProfileForm({ nama_umkm: profile?.nama_umkm || '', nama_user: profile?.nama_user || '', tentang: profile?.tentang || '', domisili: profile?.domisili || '' }); setShowSettings(true); }}>
            <Settings size={15} />
          </button>
        </div>
      </div>

      {/* SUBTABS */}
      {activeTab === 'gudang' && (
        <div className="subtabs">
          {[['stok','Stok'],['resep','Resep'],['riwayat','Riwayat']].map(([k,l]) => (
            <button key={k} className={`subtab ${subTabGudang === k ? 'active' : ''}`} onClick={() => setSubTabGudang(k)}>{l}</button>
          ))}
        </div>
      )}
      {activeTab === 'penjualan' && (
        <div className="subtabs">
          {[['hari_ini','Hari Ini'],['pre_order','Pre-Order'],['semua','Semua']].map(([k,l]) => (
            <button key={k} className={`subtab ${subTabJual === k ? 'active' : ''}`} onClick={() => setSubTabJual(k)}>{l}</button>
          ))}
        </div>
      )}
      {activeTab === 'jadwal' && !selectedCalDay && (
        <div className="subtabs">
          {[['hari_ini','Hari Ini'],['besok','Besok'],['mendatang','Mendatang']].map(([k,l]) => (
            <button key={k} className={`subtab ${jadwalFilter === k ? 'active' : ''}`} onClick={() => setJadwalFilter(k)}>{l}</button>
          ))}
        </div>
      )}
      {activeTab === 'jadwal' && selectedCalDay && (
        <div className="subtabs" style={{ gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>📅 {selectedCalDay}</span>
          <button onClick={() => setSelectedCalDay(null)} style={{ background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 7, padding: '4px 11px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Reset</button>
        </div>
      )}

      {/* BODY */}
      <div className="body-wrap">

        {activeTab === 'pembelian' && pembelianPeriod === 'custom' && <CustomRange from={pembelianFrom} setFrom={setPembelianFrom} to={pembelianTo} setTo={setPembelianTo} />}
        {activeTab === 'penjualan' && penjualanPeriod === 'custom' && <CustomRange from={penjualanFrom} setFrom={setPenjualanFrom} to={penjualanTo} setTo={setPenjualanTo} />}
        {activeTab === 'ringkasan' && ringkasanPeriod === 'custom' && <CustomRange from={ringkasanFrom} setFrom={setRingkasanFrom} to={ringkasanTo} setTo={setRingkasanTo} />}

        {/* ══ RINGKASAN ══ */}
        {activeTab === 'ringkasan' && (
          <>
            {/* Laba card */}
            <div className="laba-card">
              <div className="laba-label">Laba Kotor</div>
              <div className={`laba-value ${ringkasanData.laba < 0 ? 'negative' : ''}`}>{formatRupiah(ringkasanData.laba)}</div>
              <div className="laba-sub">Periode terpilih</div>
            </div>
            {/* Mini stats */}
            <div className="mini-stats">
              <div className="mini-card">
                <div className="mini-icon">📈</div>
                <div className="mini-label">Masuk</div>
                <div className="mini-value green">{formatRupiah(ringkasanData.pemasukan)}</div>
              </div>
              <div className="mini-card">
                <div className="mini-icon">📉</div>
                <div className="mini-label">Keluar</div>
                <div className="mini-value red">{formatRupiah(ringkasanData.pengeluaran)}</div>
              </div>
              <div className="mini-card">
                <div className="mini-icon">🧾</div>
                <div className="mini-label">Pesanan</div>
                <div className="mini-value">{ringkasanData.totalOrders}</div>
              </div>
            </div>

            {/* Module grid */}
            <div className="section-title" style={{ marginTop: 4 }}>Menu Utama</div>
            <div className="modules-grid">
              {MODULES.filter(m => m.key !== 'jadwal').map(({ key, icon: Icon, label, color, bg, desc }) => (
                <button key={key} className="module-card" onClick={() => setActiveTab(key)}>
                  <div className="module-top">
                    <div className="module-icon" style={{ background: bg }}><Icon size={18} color={color} /></div>
                    <ChevronRight size={14} color="#d0d3dc" />
                  </div>
                  <div>
                    <div className="module-name">{label}</div>
                    <div className="module-desc">{desc}</div>
                  </div>
                </button>
              ))}
              <button className="module-card module-card-full" onClick={() => setActiveTab('jadwal')}>
                <div className="module-icon" style={{ background: '#fffbeb' }}><Truck size={18} color="#d97706" /></div>
                <div>
                  <div className="module-name">Jadwal Kirim</div>
                  <div className="module-desc">Pantau pengiriman</div>
                </div>
                <ChevronRight size={14} color="#d0d3dc" style={{ marginLeft: 'auto' }} />
              </button>
            </div>

            {/* Pre-order alert */}
            {upcomingPOs.length > 0 && (
              <div className="alert-card">
                <Clock size={18} color="#d97706" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#92400e' }}>{upcomingPOs.length} Pre-Order Mendatang</div>
                  <div style={{ fontSize: 10, fontWeight: 500, color: '#b45309', marginTop: 2 }}>
                    {upcomingPOs.slice(0,2).map(o => o.nama).join(', ')}
                    {upcomingPOs.length > 2 ? ` +${upcomingPOs.length - 2} lainnya` : ''}
                  </div>
                </div>
              </div>
            )}

            {/* Top products */}
            {ringkasanData.topProduk.length > 0 && (
              <>
                <div className="section-title">Top Produk</div>
                <div className="top-products-card">
                  {ringkasanData.topProduk.map(([nama, qty], i) => (
                    <div key={nama} className="product-row">
                      <div className="product-rank" style={{ background: i === 0 ? '#fef9c3' : '#f0f4ff', color: i === 0 ? '#a16207' : '#2563eb' }}>{i + 1}</div>
                      <div style={{ flex: 1, fontSize: 12, fontWeight: 600 }}>{nama}</div>
                      <span className="badge badge-blue">{qty} terjual</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* HPP estimasi */}
            {inventory.filter(i => i.type === 'finished' && hppMap[i.id]).length > 0 && (
              <>
                <div className="section-title">Estimasi Margin</div>
                <div className="card" style={{ padding: 14 }}>
                  {inventory.filter(i => i.type === 'finished').map(item => {
                    const hpp = hppMap[item.id];
                    if (!hpp) return null;
                    return (
                      <div key={item.id} style={{ padding: '8px 0', borderBottom: '1px solid #f4f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 12 }}>{item.nama}</div>
                          <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>HPP ~{formatRupiah(Math.round(hpp.hpp))}{hpp.incomplete && ' ⚠'}</div>
                        </div>
                        {item.harga > 0 && hpp.marginPct !== null ? (
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 900, fontSize: 14, color: hpp.margin >= 0 ? '#16a34a' : '#ef4444' }}>{hpp.margin >= 0 ? '+' : ''}{Math.round(hpp.marginPct)}%</div>
                            <div style={{ fontSize: 10, color: '#9ca3af' }}>{formatRupiah(Math.round(hpp.margin))}/unit</div>
                          </div>
                        ) : <span style={{ fontSize: 10, color: '#d1d5db' }}>Belum ada harga</span>}
                      </div>
                    );
                  })}
                  <div style={{ fontSize: 9, color: '#d1d5db', marginTop: 8, fontStyle: 'italic' }}>Estimasi berdasarkan rata-rata harga beli bahan.</div>
                </div>
              </>
            )}
          </>
        )}

        {/* ══ PEMBELIAN ══ */}
        {activeTab === 'pembelian' && (
          <>
            <div className="summary-bar">
              <div className="summary-label">Total Pengeluaran</div>
              <div className="summary-value">{formatRupiah(filteredPurchases.reduce((a, p) => a + (p.total_harga || 0), 0))}</div>
              <div className="summary-sub">{filteredPurchases.length} transaksi</div>
            </div>
            <button className="add-cta" onClick={() => setActiveModal('beli')}><Plus size={14} /> Tambah Pembelian</button>
            {filteredPurchases.length === 0 ? (
              <div className="empty-state"><ShoppingBag size={28} /><p>Belum ada pembelian</p></div>
            ) : filteredPurchases.map(p => (
              <div key={p.id} className="beli-item">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <div className="beli-icon" style={{ background: p.is_expense_only ? '#fef3c7' : '#e8f4ff' }}>
                    {p.is_expense_only ? <Receipt size={14} color="#d97706" /> : <ShoppingBag size={14} color="#2563eb" />}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="beli-name">{p.nama_barang}</div>
                    {p.supplier && <div className="beli-meta">dari {p.supplier}</div>}
                    <div className="beli-meta">{p.is_expense_only ? 'Pengeluaran' : `${p.jumlah} ${p.satuan}`} · {friendlyDate(p.tanggal)}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="beli-rp">{formatRupiah(p.total_harga)}</div>
                  {!p.is_expense_only && <div className="beli-qty">{p.jumlah} {p.satuan}</div>}
                  <button onClick={() => { setEditingTransaction({ ...p, _newDate: p.tanggal }); setActiveModal('editTanggalBeli'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 600, justifyContent: 'flex-end' }}>
                    <Edit2 size={10} /> Edit
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {/* ══ GUDANG ══ */}
        {activeTab === 'gudang' && (
          <>
            {subTabGudang === 'stok' && (
              <>
                <div className="stok-chips">
                  {Object.entries(INVENTORY_TYPES).map(([type, cfg]) => (
                    <div key={type} className="stok-chip" style={{ background: cfg.bg }}>
                      <cfg.icon size={13} color={cfg.color} />
                      <div>
                        <div className="stok-chip-label" style={{ color: cfg.color }}>{cfg.label}</div>
                        <div className="stok-chip-count">{inventory.filter(i => i.type === type).length}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="add-cta" onClick={() => setActiveModal('produksi')}><ChefHat size={14} /> Mulai Produksi</button>
                <button className="add-cta" style={{ borderColor: '#bbf7d0', color: '#16a34a' }} onClick={() => { setNewItemForm(emptyNewItemForm); setActiveModal('newItem'); }}><Plus size={14} /> Tambah Item Manual</button>
                {inventory.map(item => {
                  const cfg = INVENTORY_TYPES[item.type] || INVENTORY_TYPES.raw;
                  const hpp = hppMap[item.id];
                  return (
                    <div key={item.id} className="inv-item">
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                        <div className="inv-icon" style={{ background: cfg.bg }}><cfg.icon size={15} color={cfg.color} /></div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap', marginBottom: 2 }}>
                            <span style={{ fontWeight: 700, fontSize: 12 }}>{item.nama}</span>
                            <span className={`badge ${item.type === 'finished' ? 'badge-green' : item.type === 'semi' ? 'badge-teal' : 'badge-blue'}`} style={{ fontSize: 9 }}>{cfg.short}</span>
                          </div>
                          {item.type === 'finished' && (
                            item.harga > 0
                              ? <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>{formatRupiah(item.harga)}</div>
                              : <div style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>⚠ Belum ada harga</div>
                          )}
                          {hpp && item.type === 'finished' && item.harga > 0 && hpp.marginPct !== null && (
                            <span style={{ fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 99, background: hpp.margin >= 0 ? '#f0fdf4' : '#fef2f2', color: hpp.margin >= 0 ? '#16a34a' : '#ef4444' }}>
                              {hpp.margin >= 0 ? '+' : ''}{Math.round(hpp.marginPct)}%{hpp.incomplete ? ' ⚠' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ textAlign: 'right' }}>
                          <div className="inv-stock-num" style={{ color: item.stok <= 0 ? '#ef4444' : '#0f1130' }}>{item.stok}</div>
                          <div className="inv-stock-unit">{item.satuan}</div>
                        </div>
                        {item.type === 'finished' && (
                          <button className="inv-action-btn" style={{ background: '#fffbeb', color: '#d97706' }} onClick={() => { setSelectedItem(item); setPriceForm({ harga: item.harga || '' }); setActiveModal('setHarga'); }}><Wallet size={13} /></button>
                        )}
                        <button className="inv-action-btn" style={{ background: '#fef2f2', color: '#ef4444' }} onClick={() => { setSelectedItem(item); setRemovalForm({ alasan: 'Rusak', qty: 1 }); setActiveModal('remove'); }}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  );
                })}
                {inventory.length === 0 && <div className="empty-state"><Package size={28} /><p>Belum ada inventori</p></div>}
              </>
            )}

            {subTabGudang === 'resep' && (
              <>
                <button className="add-cta" onClick={() => setActiveModal('resep')}><Plus size={14} /> Tambah Resep</button>
                {recipes.map(r => (
                  <div key={r.id} className="recipe-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <div className="recipe-name">{r.nama}</div>
                        {(r.recipe_outputs || []).length > 0 && (
                          <div style={{ marginTop: 5, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {(r.recipe_outputs || []).map((out, i) => (
                              <span key={i} className="badge badge-green" style={{ fontSize: 10 }}>{out.qty} {out.satuan} {out.inventory_item_name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Utensils size={14} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
                    </div>
                    <div className="recipe-ingredients">
                      {(r.recipe_ingredients || []).map((ing, i) => (
                        <div key={i} className="recipe-ing-row">
                          <span>{ing.nama_bahan}</span><span style={{ fontWeight: 800 }}>{ing.qty} {ing.satuan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {recipes.length === 0 && <div className="empty-state"><Utensils size={26} /><p>Belum ada resep</p></div>}
              </>
            )}

            {subTabGudang === 'riwayat' && (
              <>
                {logs.map(log => (
                  <div key={log.id} className="beli-item">
                    <div className="beli-icon" style={{ background: log.type === 'PRODUKSI' ? '#fffbeb' : '#fef2f2' }}>
                      {log.type === 'PRODUKSI' ? <ChefHat size={14} color="#d97706" /> : <Trash2 size={14} color="#ef4444" />}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{log.detail}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500, marginTop: 2 }}>{log.type} · {friendlyDate(log.tanggal)}</div>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && <div className="empty-state"><BookOpen size={26} /><p>Belum ada riwayat</p></div>}
              </>
            )}
          </>
        )}

        {/* ══ PENJUALAN ══ */}
        {activeTab === 'penjualan' && (
          <>
            <div className="summary-bar green-accent">
              <div className="summary-label">Penjualan Lunas</div>
              <div className="summary-value green">{formatRupiah(filteredOrders.filter(o => o.status_bayar === 'Lunas').reduce((a, o) => a + (o.total || 0), 0))}</div>
              <div className="summary-sub">{filteredOrders.filter(o => o.status_bayar === 'Lunas').length} lunas · {filteredOrders.filter(o => o.status_bayar !== 'Lunas').length} belum lunas</div>
            </div>
            <button className="add-cta" onClick={() => { setOrderStep(1); setActiveModal('newOrder'); }}><Plus size={14} /> Buat Pesanan Baru</button>

            {subTabJual === 'hari_ini' && (() => {
              const list = filteredOrders.filter(o => !o.is_po && o.tgl_kirim <= todayStr());
              return list.length === 0 ? <div className="empty-state"><ShoppingCart size={26} /><p>Belum ada pesanan hari ini</p></div>
                : list.map(order => <OrderCard key={order.id} order={order} payments={orderPayments.filter(p => p.order_id === order.id)} onPayment={openPayModal} onInvoice={(o) => { setInvoiceOrder(o); setActiveModal('invoice'); }} onWA={sendWhatsApp} onCancel={cancelOrder} onEdit={openEditOrder} />);
            })()}
            {subTabJual === 'pre_order' && (
              upcomingPOs.length === 0 ? <div className="empty-state"><Clock size={26} /><p>Tidak ada pre-order</p></div>
                : upcomingPOs.map(order => <OrderCard key={order.id} order={order} payments={orderPayments.filter(p => p.order_id === order.id)} onPayment={openPayModal} onInvoice={(o) => { setInvoiceOrder(o); setActiveModal('invoice'); }} onWA={sendWhatsApp} onCancel={cancelOrder} onEdit={openEditOrder} />)
            )}
            {subTabJual === 'semua' && (
              filteredOrders.length === 0 ? <div className="empty-state"><ShoppingCart size={26} /><p>Belum ada pesanan</p></div>
                : filteredOrders.map(order => <OrderCard key={order.id} order={order} payments={orderPayments.filter(p => p.order_id === order.id)} onPayment={openPayModal} onInvoice={(o) => { setInvoiceOrder(o); setActiveModal('invoice'); }} onWA={sendWhatsApp} onCancel={cancelOrder} onEdit={openEditOrder} />)
            )}
          </>
        )}

        {/* ══ PELANGGAN ══ */}
        {activeTab === 'pelanggan' && (
          <>
            <div className="search-bar"><Search size={14} color="#a0a3b1" /><input placeholder="Cari nama atau WA..." value={searchCustomer} onChange={e => setSearchCustomer(e.target.value)} /></div>
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {['Semua', ...CUSTOMER_TYPES].map(t => (
                <button key={t} onClick={() => setCustTypeFilter(t)} style={{ flexShrink: 0, border: 'none', borderRadius: 99, padding: '5px 13px', fontSize: 10, fontWeight: 700, cursor: 'pointer', background: custTypeFilter === t ? '#0f1130' : 'white', color: custTypeFilter === t ? 'white' : '#a0a3b1', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>{t}</button>
              ))}
            </div>
            <button className="add-cta" onClick={() => { setCustomerForm(emptyCustomerForm); setSelectedItem(null); setActiveModal('customer'); }}><Plus size={14} /> Tambah Pelanggan</button>
            {filteredCustomers.length === 0 ? <div className="empty-state"><Users size={26} /><p>Belum ada pelanggan</p></div>
              : filteredCustomers.map(cust => {
                const sty = custTypeStyle(cust.customer_type);
                const initials = cust.nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
                return (
                  <div key={cust.id} className="customer-card">
                    <div className="customer-avatar" style={{ background: sty.avatar, color: sty.color }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>{cust.nama}</span>
                        <span className="badge" style={{ background: sty.bg, color: sty.color, fontSize: 9 }}>{cust.customer_type}</span>
                      </div>
                      {cust.wa && <div style={{ fontSize: 10, color: '#a0a3b1', fontWeight: 500 }}>📞 {cust.wa}</div>}
                      {cust.alamat && <div style={{ fontSize: 10, color: '#a0a3b1', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {cust.alamat}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                      <button onClick={() => { setOrderStep1({ ...emptyOrderStep1, customer_id: cust.id, nama: cust.nama, wa: cust.wa || '', alamat: cust.alamat || '', customer_type: cust.customer_type }); setSelectedCust(cust); setOrderStep(1); setActiveModal('newOrder'); }} style={{ background: '#edf9f0', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#16a34a', display: 'flex' }}><ShoppingCart size={13} /></button>
                      <button onClick={() => { setSelectedItem(cust); setCustomerForm({ nama: cust.nama, wa: cust.wa || '', alamat: cust.alamat || '', customer_type: cust.customer_type, notes: cust.notes || '' }); setActiveModal('customer'); }} style={{ background: '#e8f4ff', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#2563eb', display: 'flex' }}><Edit2 size={13} /></button>
                      <button onClick={() => handleDeleteCustomer(cust)} style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
          </>
        )}

        {/* ══ JADWAL KIRIM ══ */}
        {activeTab === 'jadwal' && (
          <>
            <button onClick={() => setCalendarOpen(p => !p)} style={{ width: '100%', background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 700, fontSize: 12, color: '#0f1130', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Calendar size={14} color="#2563eb" /> {selectedCalDay ? `📅 ${selectedCalDay}` : 'Lihat Kalender'}</div>
              <ChevronDown size={13} style={{ transform: calendarOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: '#a0a3b1' }} />
            </button>
            {calendarOpen && (
              <div className="calendar-card">
                <div className="cal-nav">
                  <button className="cal-nav-btn" onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}>‹</button>
                  <div className="cal-title">{MONTHS_ID[calendarDate.getMonth()]} {calendarDate.getFullYear()}</div>
                  <button className="cal-nav-btn" onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}>›</button>
                </div>
                <div className="cal-grid" style={{ marginBottom: 5 }}>
                  {DAYS_ID.map((d, i) => <div key={i} className="cal-day-header">{d}</div>)}
                </div>
                <div className="cal-grid">
                  {calDays.days.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const ds = d.toISOString().split('T')[0];
                    return <div key={i} className={`cal-day ${ds === todayStr() && ds !== selectedCalDay ? 'today' : ''} ${ds === selectedCalDay ? 'selected' : ''} ${calDays.orderDates.has(ds) ? 'has-order' : ''}`} onClick={() => setSelectedCalDay(ds === selectedCalDay ? null : ds)}>{d.getDate()}</div>;
                  })}
                </div>
              </div>
            )}
            {deliveryList.length === 0 ? (
              <div className="empty-state"><Truck size={26} /><p>Tidak ada jadwal kirim</p></div>
            ) : deliveryList.map(order => (
              <div key={order.id} className="delivery-card">
                <div className="delivery-bar" style={{ background: order.delivery_status === 'Selesai' ? '#16a34a' : order.delivery_status === 'Dikirim' ? '#f59e0b' : '#e5e7eb' }} />
                <div className="delivery-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                        <span style={{ fontWeight: 800, fontSize: 13 }}>{order.nama}</span>
                        {order.is_po && <span className="po-tag"><Clock size={9} /> PO</span>}
                      </div>
                      {order.alamat && <div style={{ fontSize: 10, color: '#a0a3b1', fontWeight: 500 }}><MapPin size={9} style={{ display: 'inline' }} /> {order.alamat}</div>}
                      <div style={{ fontSize: 10, color: '#a0a3b1', marginTop: 1 }}>Kirim: {order.tgl_kirim}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                      <span className={`badge ${order.status_bayar === 'Lunas' ? 'badge-green' : 'badge-red'}`}>{order.status_bayar}</span>
                      <button onClick={() => sendWhatsApp(order)} style={{ background: '#edf9f0', border: 'none', borderRadius: 7, padding: '4px 9px', cursor: 'pointer', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700 }}><Send size={11} /> WA</button>
                    </div>
                  </div>
                  <div className="status-chips">
                    {['Menunggu','Dikirim','Selesai'].map(s => (
                      <button key={s} onClick={() => updateDeliveryStatus(order.id, s)} className="status-chip" style={{ background: order.delivery_status === s ? (s === 'Selesai' ? '#16a34a' : s === 'Dikirim' ? '#f59e0b' : '#0f1130') : '#f4f5f9', color: order.delivery_status === s ? 'white' : '#a0a3b1' }}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* BOTTOM NAV */}
      <nav className="bottom-nav">
        {[
          { key: 'ringkasan', icon: <BarChart2 size={19} />, label: 'Ringkasan' },
          { key: 'pembelian', icon: <ShoppingBag size={19} />, label: 'Beli' },
          { key: 'gudang',    icon: <Package size={19} />,    label: 'Gudang' },
          { key: 'penjualan', icon: <ShoppingCart size={19} />,label: 'Jual' },
          { key: 'pelanggan', icon: <Users size={19} />,      label: 'Pelanggan' },
          { key: 'jadwal',    icon: <Truck size={19} />,      label: 'Jadwal' },
        ].map(({ key, icon, label }) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`nav-item ${activeTab === key ? 'active' : ''}`}>
            {icon}
            <span>{label}</span>
            {activeTab === key && <div className="nav-dot" />}
          </button>
        ))}
      </nav>

      {/* ═══════════ MODALS ═══════════ */}

      {/* SETTINGS */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="modal-title">Profil UMKM</h3>
              <button onClick={() => setShowSettings(false)} style={{ background: '#f4f5f9', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            <p style={{ fontSize: 11, color: '#a0a3b1', fontWeight: 500, marginBottom: 16 }}>{user.email}</p>
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div><label className="label">Nama UMKM</label><input className="input" value={profileForm.nama_umkm} onChange={e => setProfileForm({ ...profileForm, nama_umkm: e.target.value })} /></div>
              <div><label className="label">Nama Pengguna</label><input className="input" value={profileForm.nama_user} onChange={e => setProfileForm({ ...profileForm, nama_user: e.target.value })} /></div>
              <div><label className="label">Tentang Usaha</label><textarea className="input" rows={2} style={{ resize: 'none' }} value={profileForm.tentang} onChange={e => setProfileForm({ ...profileForm, tentang: e.target.value })} /></div>
              <div><label className="label">Domisili</label><input className="input" value={profileForm.domisili} onChange={e => setProfileForm({ ...profileForm, domisili: e.target.value })} /></div>
              <button type="submit" disabled={isSaving} className="btn btn-dark" style={{ marginTop: 4 }}>{isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Profil'}</button>
            </form>
            <button onClick={handleLogout} className="btn btn-ghost" style={{ marginTop: 9, color: '#ef4444', borderColor: '#fecaca' }}><LogOut size={14} /> Keluar</button>
          </div>
        </div>
      )}

      {/* NEW ORDER */}
      {activeModal === 'newOrder' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 className="modal-title">Order Baru</h3>
              <button onClick={closeModal} style={{ background: '#f4f5f9', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, marginTop: 10 }}>
              {[1, 2].map(step => (
                <React.Fragment key={step}>
                  <div className="step-dot" style={{ background: orderStep >= step ? '#0f1130' : '#f4f5f9', color: orderStep >= step ? 'white' : '#a0a3b1' }}>{step}</div>
                  {step < 2 && <div className="step-line" style={{ background: orderStep > step ? '#0f1130' : '#e5e7eb' }} />}
                </React.Fragment>
              ))}
              <span style={{ fontSize: 11, fontWeight: 600, color: '#a0a3b1', marginLeft: 4 }}>{orderStep === 1 ? 'Detail Pelanggan' : 'Pilih Produk'}</span>
            </div>
            {orderStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {customers.length > 0 && (
                  <div style={{ background: '#f4f5f9', borderRadius: 10, padding: 10 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#a0a3b1', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Dari Direktori</p>
                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                      {customers.slice(0, 8).map(c => {
                        const sty = custTypeStyle(c.customer_type);
                        const isSelected = orderStep1.customer_id === c.id;
                        return (
                          <button key={c.id} onClick={() => { setOrderStep1(prev => ({ ...prev, customer_id: c.id, nama: c.nama, wa: c.wa || '', alamat: c.alamat || '', customer_type: c.customer_type })); setSelectedCust(c); }} style={{ flexShrink: 0, border: `1.5px solid ${isSelected ? sty.color : '#e5e7eb'}`, borderRadius: 9, padding: '6px 10px', background: isSelected ? sty.bg : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: isSelected ? sty.color : '#0f1130' }}>{c.nama.split(' ')[0]}</span>
                            <span style={{ fontSize: 9, color: isSelected ? sty.color : '#a0a3b1', fontWeight: 600 }}>{c.customer_type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div><label className="label">Nama Pelanggan *</label><input required className="input" placeholder="Nama pembeli" value={orderStep1.nama} onChange={e => setOrderStep1({ ...orderStep1, nama: e.target.value })} /></div>
                <div><label className="label">No. WhatsApp</label><input className="input" placeholder="628xxxxxxxxx" value={orderStep1.wa} onChange={e => setOrderStep1({ ...orderStep1, wa: e.target.value })} /></div>
                <div><label className="label">Alamat</label><textarea className="input" rows={2} style={{ resize: 'none' }} value={orderStep1.alamat} onChange={e => setOrderStep1({ ...orderStep1, alamat: e.target.value })} /></div>
                <div className="input-row input-row-2">
                  <div><label className="label">Tipe</label><select className="input" value={orderStep1.customer_type} onChange={e => setOrderStep1({ ...orderStep1, customer_type: e.target.value })}>{CUSTOMER_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                  <div><label className="label">Ongkir (Rp)</label><input type="number" className="input" placeholder="0" value={orderStep1.ongkir} onChange={e => setOrderStep1({ ...orderStep1, ongkir: e.target.value })} /></div>
                </div>
                <div className="input-row input-row-2">
                  <div><label className="label">Tgl Order</label><input type="date" className="input" value={orderStep1.tgl_order} onChange={e => setOrderStep1({ ...orderStep1, tgl_order: e.target.value })} /></div>
                  <div><label className="label">Tgl Kirim</label><input type="date" className="input" value={orderStep1.tgl_kirim} onChange={e => setOrderStep1({ ...orderStep1, tgl_kirim: e.target.value })} /></div>
                </div>
                {orderStep1.tgl_kirim > todayStr() && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9, padding: 9, fontSize: 11, fontWeight: 600, color: '#92400e', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={12} /> Akan dicatat sebagai Pre-Order
                  </div>
                )}
                <div className="input-row input-row-2">
                  <div><label className="label">Metode Bayar</label><select className="input" value={orderStep1.metode_bayar} onChange={e => setOrderStep1({ ...orderStep1, metode_bayar: e.target.value })}>{BAYAR_OPTIONS.map(b => <option key={b}>{b}</option>)}</select></div>
                  <div><label className="label">Status Bayar</label><select className="input" value={orderStep1.status_bayar} onChange={e => setOrderStep1({ ...orderStep1, status_bayar: e.target.value })}><option>Belum Bayar</option><option>Lunas</option></select></div>
                </div>
                <button className="btn btn-dark" onClick={() => { if (!orderStep1.nama.trim()) { showToast('Isi nama pelanggan dulu', 'error'); return; } setOrderStep(2); }} style={{ marginTop: 4 }}>
                  Pilih Produk <ArrowRight size={15} />
                </button>
              </div>
            )}
            {orderStep === 2 && (
              <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Untuk: <strong style={{ color: '#0f1130' }}>{orderStep1.nama}</strong> · Kirim: {orderStep1.tgl_kirim}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {inventory.filter(i => i.type === 'finished').map(prod => {
                    const inCart = cart.find(c => c.id === prod.id);
                    return (
                      <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: inCart ? '#edf9f0' : '#f4f5f9', borderRadius: 11, padding: '9px 12px', border: `1.5px solid ${inCart ? '#bbf7d0' : 'transparent'}` }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 12 }}>{prod.nama}</p>
                          <p style={{ fontSize: 10, color: prod.harga ? '#16a34a' : '#ef4444', fontWeight: 600 }}>{prod.harga ? formatRupiah(prod.harga) : '⚠ Set harga dulu'}</p>
                          <p style={{ fontSize: 9, color: '#a0a3b1' }}>Stok: {prod.stok} {prod.satuan}</p>
                        </div>
                        {inCart ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: 9, padding: '4px 11px', boxShadow: '0 1px 4px rgba(0,0,0,.08)' }}>
                            <button type="button" onClick={() => removeFromCart(prod.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Minus size={13} /></button>
                            <span style={{ fontWeight: 900, fontSize: 13, minWidth: 14, textAlign: 'center' }}>{inCart.qty}</span>
                            <button type="button" onClick={() => addToCart(prod)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', display: 'flex' }}><Plus size={13} /></button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => addToCart(prod)} style={{ background: '#0f1130', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Tambah</button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {cart.length > 0 && (
                  <div style={{ background: '#0f1130', borderRadius: 13, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>Total{Number(orderStep1.ongkir) > 0 ? ` + ongkir` : ''}</p>
                      <p style={{ fontSize: 17, fontWeight: 900, color: '#fbbf24' }}>{formatRupiah(cart.reduce((a, b) => a + b.qty * (b.harga || 0), 0) + (Number(orderStep1.ongkir) || 0))}</p>
                    </div>
                    <button type="submit" disabled={isSaving || cart.length === 0} style={{ background: '#fbbf24', color: '#0f1130', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
                      {isSaving ? <Loader2 size={15} className="animate-spin" /> : 'Proses Order'}
                    </button>
                  </div>
                )}
                <button type="button" className="btn btn-ghost" onClick={() => setOrderStep(1)}>← Kembali</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* CUSTOMER MODAL */}
      {activeModal === 'customer' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="modal-title">{selectedItem ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h3>
              <button onClick={closeModal} style={{ background: '#f4f5f9', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div><label className="label">Nama *</label><input required className="input" value={customerForm.nama} onChange={e => setCustomerForm({ ...customerForm, nama: e.target.value })} /></div>
              <div className="input-row input-row-2">
                <div><label className="label">Tipe</label><select className="input" value={customerForm.customer_type} onChange={e => setCustomerForm({ ...customerForm, customer_type: e.target.value })}>{CUSTOMER_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label className="label">WhatsApp</label><input className="input" placeholder="628xxx" value={customerForm.wa} onChange={e => setCustomerForm({ ...customerForm, wa: e.target.value })} /></div>
              </div>
              <div><label className="label">Alamat</label><textarea className="input" rows={2} style={{ resize: 'none' }} value={customerForm.alamat} onChange={e => setCustomerForm({ ...customerForm, alamat: e.target.value })} /></div>
              <div><label className="label">Catatan</label><input className="input" value={customerForm.notes} onChange={e => setCustomerForm({ ...customerForm, notes: e.target.value })} /></div>
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? <Loader2 size={16} className="animate-spin" /> : (selectedItem ? 'Simpan Perubahan' : 'Simpan Pelanggan')}</button>
            </form>
          </div>
        </div>
      )}

      {/* PEMBELIAN MODAL */}
      {activeModal === 'beli' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="modal-title">Tambah Pembelian</h3>
              <button onClick={closeModal} style={{ background: '#f4f5f9', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
              {[{ label: '📦 Beli Bahan', val: false }, { label: '💸 Pengeluaran', val: true }].map(opt => (
                <button key={String(opt.val)} type="button" onClick={() => setPurchaseForm({ ...purchaseForm, is_expense_only: opt.val })} style={{ flex: 1, border: `1.5px solid ${purchaseForm.is_expense_only === opt.val ? '#0f1130' : '#e5e7eb'}`, borderRadius: 9, padding: '8px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: purchaseForm.is_expense_only === opt.val ? '#0f1130' : 'white', color: purchaseForm.is_expense_only === opt.val ? 'white' : '#6b7280' }}>{opt.label}</button>
              ))}
            </div>
            <form onSubmit={handleAddPurchase} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div>
                <label className="label">{purchaseForm.is_expense_only ? 'Nama Pengeluaran' : 'Nama Barang'}</label>
                {!purchaseForm.is_expense_only && inventory.filter(i => i.type === 'raw').length > 0 ? (
                  <select className="input" value={purchaseForm.nama_barang} onChange={e => { const val = e.target.value; const ex = inventory.find(i => i.nama === val); setPurchaseForm(prev => ({ ...prev, nama_barang: val, satuan: ex ? ex.satuan : prev.satuan })); }}>
                    <option value="">-- Pilih atau tambah baru --</option>
                    {[...new Set(inventory.filter(i => i.type === 'raw').map(i => i.nama))].map(n => <option key={n} value={n}>{n}</option>)}
                    <option value="__new__">+ Tambah bahan baru...</option>
                  </select>
                ) : null}
                {(purchaseForm.nama_barang === '__new__' || purchaseForm.is_expense_only || inventory.filter(i => i.type === 'raw').length === 0) && (
                  <input required className="input" style={{ marginTop: purchaseForm.nama_barang === '__new__' ? 7 : 0 }} placeholder={purchaseForm.is_expense_only ? 'Gas, packaging, dll' : 'Tepung Terigu'} value={purchaseForm.nama_barang === '__new__' ? '' : purchaseForm.nama_barang} onChange={e => setPurchaseForm({ ...purchaseForm, nama_barang: e.target.value })} />
                )}
              </div>
              <div><label className="label">Supplier</label><input className="input" placeholder="Dari mana belinya?" value={purchaseForm.supplier} onChange={e => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })} /></div>
              <div className="input-row input-row-2">
                <div><label className="label">Jumlah</label><input required type="number" className="input" placeholder="0" value={purchaseForm.jumlah} onChange={e => setPurchaseForm({ ...purchaseForm, jumlah: e.target.value })} /></div>
                <div><label className="label">Satuan</label><select className="input" value={purchaseForm.satuan} onChange={e => setPurchaseForm({ ...purchaseForm, satuan: e.target.value })}>{SATUAN_OPTIONS.map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div><label className="label">Harga Satuan (Rp)</label><input required type="number" className="input" placeholder="0" value={purchaseForm.harga_satuan} onChange={e => setPurchaseForm({ ...purchaseForm, harga_satuan: e.target.value })} /></div>
              {purchaseForm.jumlah && purchaseForm.harga_satuan && (
                <div style={{ background: '#edf9f0', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
                  Total: {formatRupiah(Number(purchaseForm.jumlah) * Number(purchaseForm.harga_satuan))}
                </div>
              )}
              <div><label className="label">Tanggal</label><input type="date" className="input" value={purchaseForm.tanggal} onChange={e => setPurchaseForm({ ...purchaseForm, tanggal: e.target.value })} /></div>
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Simpan'}</button>
            </form>
          </div>
        </div>
      )}

      {/* NEW ITEM MODAL */}
      {activeModal === 'newItem' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="modal-title">Tambah Item Inventori</h3>
              <button onClick={closeModal} style={{ background: '#f4f5f9', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            <form onSubmit={handleAddManualItem} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div><label className="label">Nama *</label><input required className="input" value={newItemForm.nama} onChange={e => setNewItemForm({ ...newItemForm, nama: e.target.value })} /></div>
              <div className="input-row input-row-3">
                <div><label className="label">Tipe</label><select className="input" value={newItemForm.type} onChange={e => setNewItemForm({ ...newItemForm, type: e.target.value })}>{Object.entries(INVENTORY_TYPES).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}</select></div>
                <div><label className="label">Stok Awal</label><input type="number" className="input" value={newItemForm.stok} onChange={e => setNewItemForm({ ...newItemForm, stok: e.target.value })} /></div>
                <div><label className="label">Satuan</label><select className="input" value={newItemForm.satuan} onChange={e => setNewItemForm({ ...newItemForm, satuan: e.target.value })}>{SATUAN_OPTIONS.map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              {newItemForm.type === 'finished' && (
                <div><label className="label">Harga Jual (Rp)</label><input type="number" className="input" placeholder="0" value={newItemForm.harga} onChange={e => setNewItemForm({ ...newItemForm, harga: e.target.value })} /></div>
              )}
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Item'}</button>
            </form>
          </div>
        </div>
      )}

      {/* RESEP MODAL */}
      {activeModal === 'resep' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="modal-title">Tambah Resep</h3>
              <button onClick={closeModal} style={{ background: '#f4f5f9', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            <form onSubmit={handleAddRecipe} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div><label className="label">Nama Resep *</label><input required className="input" value={recipeForm.nama} onChange={e => setRecipeForm({ ...recipeForm, nama: e.target.value })} /></div>
              <div>
                <label className="label">Output</label>
                {recipeForm.outputs.map((out, i) => (
                  <div key={i} style={{ background: '#f4f5f9', borderRadius: 9, padding: 10, marginBottom: 7 }}>
                    <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                      <select className="input" style={{ flex: 2 }} value={out.nama} onChange={e => { const n = [...recipeForm.outputs]; n[i].nama = e.target.value; setRecipeForm({ ...recipeForm, outputs: n }); }}>
                        <option value="">-- Pilih / buat item --</option>
                        {inventory.filter(it => it.type === 'finished' || it.type === 'semi').map(it => <option key={it.id} value={it.nama}>{it.nama}</option>)}
                        <option value="__new__">+ Item baru...</option>
                      </select>
                      {out.nama === '__new__' && <input className="input" placeholder="Nama item baru" onChange={e => { const n = [...recipeForm.outputs]; n[i].nama = e.target.value; setRecipeForm({ ...recipeForm, outputs: n }); }} />}
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input type="number" placeholder="Qty" className="input" style={{ width: 70 }} value={out.jumlah_output} onChange={e => { const n = [...recipeForm.outputs]; n[i].jumlah_output = e.target.value; setRecipeForm({ ...recipeForm, outputs: n }); }} />
                      <select className="input" style={{ flex: 1 }} value={out.satuan_output} onChange={e => { const n = [...recipeForm.outputs]; n[i].satuan_output = e.target.value; setRecipeForm({ ...recipeForm, outputs: n }); }}>{SATUAN_OPTIONS.map(s => <option key={s}>{s}</option>)}</select>
                      <select className="input" style={{ flex: 1 }} value={out.type} onChange={e => { const n = [...recipeForm.outputs]; n[i].type = e.target.value; setRecipeForm({ ...recipeForm, outputs: n }); }}>
                        <option value="semi">Bahan Matang</option><option value="finished">Produk</option>
                      </select>
                      {recipeForm.outputs.length > 1 && <button type="button" onClick={() => setRecipeForm({ ...recipeForm, outputs: recipeForm.outputs.filter((_, idx) => idx !== i) })} style={{ background: '#fef2f2', border: 'none', borderRadius: 7, padding: '0 8px', cursor: 'pointer', color: '#ef4444', height: 36 }}><X size={12} /></button>}
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setRecipeForm({ ...recipeForm, outputs: [...recipeForm.outputs, { nama: '', jumlah_output: 1, satuan_output: 'pcs', type: 'finished' }] })} style={{ background: '#edf9f0', color: '#16a34a', border: 'none', borderRadius: 8, padding: '6px 13px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Tambah Output</button>
              </div>
              <div>
                <label className="label">Bahan-bahan</label>
                {recipeForm.ingredients.map((ing, i) => (
                  <div key={i} style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
                    <select required className="input" style={{ flex: 2 }} value={ing.nama_bahan} onChange={e => { const n = [...recipeForm.ingredients]; n[i].nama_bahan = e.target.value; setRecipeForm({ ...recipeForm, ingredients: n }); }}>
                      <option value="">Pilih Bahan</option>
                      {inventory.filter(it => it.type === 'raw' || it.type === 'semi').map(it => <option key={it.id} value={it.nama}>{it.nama} ({INVENTORY_TYPES[it.type]?.label})</option>)}
                    </select>
                    <input required type="number" placeholder="Qty" className="input" style={{ width: 60 }} value={ing.qty} onChange={e => { const n = [...recipeForm.ingredients]; n[i].qty = e.target.value; setRecipeForm({ ...recipeForm, ingredients: n }); }} />
                    <select className="input" style={{ width: 68 }} value={ing.satuan} onChange={e => { const n = [...recipeForm.ingredients]; n[i].satuan = e.target.value; setRecipeForm({ ...recipeForm, ingredients: n }); }}>{SATUAN_OPTIONS.slice(0, 6).map(s => <option key={s}>{s}</option>)}</select>
                    {recipeForm.ingredients.length > 1 && <button type="button" onClick={() => setRecipeForm({ ...recipeForm, ingredients: recipeForm.ingredients.filter((_, idx) => idx !== i) })} style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: '0 7px', cursor: 'pointer', color: '#ef4444' }}><X size={12} /></button>}
                  </div>
                ))}
                <button type="button" onClick={() => setRecipeForm({ ...recipeForm, ingredients: [...recipeForm.ingredients, { nama_bahan: '', qty: '', satuan: 'pcs' }] })} style={{ background: '#e8f4ff', color: '#2563eb', border: 'none', borderRadius: 8, padding: '6px 13px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Tambah Bahan</button>
              </div>
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Resep'}</button>
            </form>
          </div>
        </div>
      )}

      {/* PRODUKSI MODAL */}
      {activeModal === 'produksi' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="modal-title">Mulai Produksi</h3>
              <button onClick={closeModal} style={{ background: '#f4f5f9', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            <form onSubmit={handleProduction} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div><label className="label">Resep</label>
                <select required className="input" value={prodForm.recipe_id} onChange={e => setProdForm({ ...prodForm, recipe_id: e.target.value })}>
                  <option value="">Pilih resep</option>
                  {recipes.map(r => <option key={r.id} value={r.id}>{r.nama}</option>)}
                </select>
              </div>
              <div><label className="label">Jumlah Batch</label><input required type="number" min={1} className="input" value={prodForm.qty} onChange={e => setProdForm({ ...prodForm, qty: e.target.value })} /></div>
              {prodForm.recipe_id && (() => {
                const r = recipes.find(x => x.id === Number(prodForm.recipe_id));
                if (!r) return null;
                return (
                  <div style={{ background: '#edf9f0', borderRadius: 9, padding: '9px 12px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>Output:</p>
                    {(r.recipe_outputs || []).map((out, i) => <p key={i} style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>→ {Number(prodForm.qty) * Number(out.qty)} {out.satuan} {out.inventory_item_name}</p>)}
                  </div>
                );
              })()}
              <div><label className="label">Tanggal Produksi</label><input type="date" className="input" value={prodForm.tanggal} onChange={e => setProdForm({ ...prodForm, tanggal: e.target.value })} /></div>
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Jalankan Produksi'}</button>
            </form>
          </div>
        </div>
      )}

      {/* SET HARGA */}
      {activeModal === 'setHarga' && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="modal-title" style={{ marginBottom: 4 }}>Set Harga Jual</h3>
            <p style={{ fontWeight: 600, marginBottom: 14, color: '#374151', fontSize: 13 }}>{selectedItem.nama}</p>
            <form onSubmit={handleSetPrice} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div><label className="label">Harga Jual (Rp)</label><input required type="number" className="input" placeholder="0" value={priceForm.harga} onChange={e => setPriceForm({ harga: e.target.value })} /></div>
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? '...' : 'Simpan Harga'}</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT DATE PURCHASE */}
      {activeModal === 'editTanggalBeli' && editingTransaction && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 className="modal-title" style={{ marginBottom: 14 }}>Edit Tanggal Pembelian</h3>
            <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>{editingTransaction.nama_barang}</p>
            <form onSubmit={handleEditPurchaseDate} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div><label className="label">Tanggal</label><input type="date" className="input" value={editingTransaction._newDate} onChange={e => setEditingTransaction({ ...editingTransaction, _newDate: e.target.value })} /></div>
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? '...' : 'Simpan'}</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ORDER */}
      {activeModal === 'editOrder' && editingTransaction && editOrderForm && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 className="modal-title">Edit Pesanan</h3>
              <button onClick={closeModal} style={{ background: '#f4f5f9', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, marginTop: 10 }}>
              {[1, 2].map(step => (
                <React.Fragment key={step}>
                  <div className="step-dot" style={{ background: editOrderStep >= step ? '#0f1130' : '#f4f5f9', color: editOrderStep >= step ? 'white' : '#a0a3b1' }}>{step}</div>
                  {step < 2 && <div className="step-line" style={{ background: editOrderStep > step ? '#0f1130' : '#e5e7eb' }} />}
                </React.Fragment>
              ))}
              <span style={{ fontSize: 11, fontWeight: 600, color: '#a0a3b1', marginLeft: 4 }}>{editOrderStep === 1 ? 'Detail Pesanan' : 'Edit Produk'}</span>
            </div>
            {editOrderStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <div><label className="label">Nama Pelanggan *</label><input required className="input" value={editOrderForm.nama} onChange={e => setEditOrderForm({ ...editOrderForm, nama: e.target.value })} /></div>
                <div><label className="label">WhatsApp</label><input className="input" value={editOrderForm.wa} onChange={e => setEditOrderForm({ ...editOrderForm, wa: e.target.value })} /></div>
                <div><label className="label">Alamat</label><textarea className="input" rows={2} style={{ resize: 'none' }} value={editOrderForm.alamat} onChange={e => setEditOrderForm({ ...editOrderForm, alamat: e.target.value })} /></div>
                <div className="input-row input-row-2">
                  <div><label className="label">Tipe</label><select className="input" value={editOrderForm.customer_type} onChange={e => setEditOrderForm({ ...editOrderForm, customer_type: e.target.value })}>{CUSTOMER_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                  <div><label className="label">Ongkir</label><input type="number" className="input" placeholder="0" value={editOrderForm.ongkir} onChange={e => setEditOrderForm({ ...editOrderForm, ongkir: e.target.value })} /></div>
                </div>
                <div className="input-row input-row-2">
                  <div><label className="label">Tgl Order</label><input type="date" className="input" value={editOrderForm.tgl_order} onChange={e => setEditOrderForm({ ...editOrderForm, tgl_order: e.target.value })} /></div>
                  <div><label className="label">Tgl Kirim</label><input type="date" className="input" value={editOrderForm.tgl_kirim} onChange={e => setEditOrderForm({ ...editOrderForm, tgl_kirim: e.target.value })} /></div>
                </div>
                <div className="input-row input-row-2">
                  <div><label className="label">Metode Bayar</label><select className="input" value={editOrderForm.metode_bayar} onChange={e => setEditOrderForm({ ...editOrderForm, metode_bayar: e.target.value })}>{BAYAR_OPTIONS.map(b => <option key={b}>{b}</option>)}</select></div>
                  <div><label className="label">Status Bayar</label><select className="input" value={editOrderForm.status_bayar} onChange={e => setEditOrderForm({ ...editOrderForm, status_bayar: e.target.value })}><option>Belum Bayar</option><option>DP</option><option>Lunas</option></select></div>
                </div>
                <button className="btn btn-dark" onClick={() => { if (!editOrderForm.nama.trim()) { showToast('Isi nama pelanggan dulu', 'error'); return; } setEditOrderStep(2); }}>Edit Produk <ArrowRight size={15} /></button>
              </div>
            )}
            {editOrderStep === 2 && (
              <form onSubmit={handleSaveEditOrder} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {editCart.length > 0 && (
                  <div style={{ background: '#f4f5f9', borderRadius: 11, padding: '9px 12px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#a0a3b1', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 7 }}>Item di pesanan</p>
                    {editCart.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #e5e7eb' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 12 }}>{item.nama}</p>
                          <p style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>{formatRupiah(item.harga)}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'white', borderRadius: 9, padding: '4px 11px', boxShadow: '0 1px 4px rgba(0,0,0,.07)' }}>
                          <button type="button" onClick={() => removeFromEditCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Minus size={13} /></button>
                          <span style={{ fontWeight: 900, fontSize: 13, minWidth: 14, textAlign: 'center' }}>{item.qty}</span>
                          <button type="button" onClick={() => addToEditCart(item)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', display: 'flex' }}><Plus size={13} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p style={{ fontSize: 10, fontWeight: 700, color: '#a0a3b1', textTransform: 'uppercase', letterSpacing: '.06em' }}>Tambah produk</p>
                {inventory.filter(i => i.type === 'finished' && !editCart.find(c => c.id === i.id)).map(prod => (
                  <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f4f5f9', borderRadius: 11, padding: '9px 12px' }}>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 12 }}>{prod.nama}</p>
                      <p style={{ fontSize: 10, color: prod.harga ? '#16a34a' : '#ef4444', fontWeight: 600 }}>{prod.harga ? formatRupiah(prod.harga) : '⚠ Set harga dulu'}</p>
                    </div>
                    <button type="button" onClick={() => addToEditCart(prod)} style={{ background: '#0f1130', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Tambah</button>
                  </div>
                ))}
                {editCart.length > 0 && (
                  <div style={{ background: '#0f1130', borderRadius: 13, padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>Total baru</p>
                      <p style={{ fontSize: 17, fontWeight: 900, color: '#fbbf24' }}>{formatRupiah(editCart.reduce((a, b) => a + b.qty * (b.harga || 0), 0) + (Number(editOrderForm.ongkir) || 0))}</p>
                    </div>
                    <button type="submit" disabled={isSaving || editCart.length === 0} style={{ background: '#fbbf24', color: '#0f1130', border: 'none', borderRadius: 10, padding: '10px 18px', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
                      {isSaving ? <Loader2 size={15} className="animate-spin" /> : 'Simpan'}
                    </button>
                  </div>
                )}
                <button type="button" className="btn btn-ghost" onClick={() => setEditOrderStep(1)}>← Kembali</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {activeModal === 'payment' && payingOrder && (() => {
        const allPay = orderPayments.filter(p => p.order_id === payingOrder.id);
        const totalPaid = allPay.reduce((a, p) => p.type === 'refund' ? a - p.amount : a + p.amount, 0);
        const remaining = Math.max(0, payingOrder.total - totalPaid);
        return (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h3 className="modal-title">Catat Pembayaran</h3>
                <button onClick={closeModal} style={{ background: '#f4f5f9', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 14 }}>{payingOrder.nama}</p>
              <div style={{ background: '#f4f5f9', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div><p style={{ fontSize: 9, fontWeight: 700, color: '#a0a3b1', textTransform: 'uppercase', marginBottom: 2 }}>Total</p><p style={{ fontSize: 15, fontWeight: 900, color: '#0f1130' }}>{formatRupiah(payingOrder.total)}</p></div>
                  <div style={{ textAlign: 'right' }}><p style={{ fontSize: 9, fontWeight: 700, color: '#a0a3b1', textTransform: 'uppercase', marginBottom: 2 }}>Sudah Dibayar</p><p style={{ fontSize: 15, fontWeight: 900, color: '#16a34a' }}>{formatRupiah(totalPaid)}</p></div>
                </div>
                {remaining > 0 ? (
                  <div style={{ background: '#fffbeb', borderRadius: 8, padding: '7px 10px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e' }}>Sisa</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#d97706' }}>{formatRupiah(remaining)}</span>
                  </div>
                ) : (
                  <div style={{ background: '#edf9f0', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>Lunas</span>
                  </div>
                )}
              </div>
              {allPay.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#a0a3b1', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Riwayat</p>
                  {allPay.sort((a,b) => a.created_at?.localeCompare(b.created_at)).map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < allPay.length - 1 ? '1px solid #f4f5f9' : 'none' }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: p.type === 'refund' ? '#ef4444' : '#0f1130' }}>{p.type === 'refund' ? '− ' : '+ '}{formatRupiah(p.amount)}</span>
                        <span style={{ fontSize: 10, color: '#a0a3b1', marginLeft: 6 }}>{p.metode}{p.note ? ` · ${p.note}` : ''}</span>
                      </div>
                      <span style={{ fontSize: 10, color: '#a0a3b1' }}>{friendlyDate(p.tanggal)}</span>
                    </div>
                  ))}
                </div>
              )}
              {remaining > 0 && (
                <form onSubmit={handleAddPayment} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  <div className="divider" />
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#a0a3b1', textTransform: 'uppercase', letterSpacing: '.06em' }}>Catat Pembayaran Baru</p>
                  <div>
                    <label className="label">Jumlah (Rp)</label>
                    <input required type="number" className="input" placeholder={`Maks. ${formatRupiah(remaining)}`} value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
                    <button type="button" onClick={() => setPaymentForm({ ...paymentForm, amount: String(remaining) })} style={{ marginTop: 5, background: 'none', border: 'none', color: '#2563eb', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0 }}>Isi sisa ({formatRupiah(remaining)})</button>
                  </div>
                  <div className="input-row input-row-2">
                    <div><label className="label">Metode</label><select className="input" value={paymentForm.metode} onChange={e => setPaymentForm({ ...paymentForm, metode: e.target.value })}>{BAYAR_OPTIONS.map(b => <option key={b}>{b}</option>)}</select></div>
                    <div><label className="label">Tanggal</label><input type="date" className="input" value={paymentForm.tanggal} onChange={e => setPaymentForm({ ...paymentForm, tanggal: e.target.value })} /></div>
                  </div>
                  <div><label className="label">Catatan</label><input className="input" placeholder="DP, pelunasan, dll" value={paymentForm.note} onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })} /></div>
                  <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Pembayaran'}</button>
                </form>
              )}
              {remaining <= 0 && totalPaid > 0 && <button onClick={closeModal} className="btn btn-ghost">Tutup</button>}
            </div>
          </div>
        );
      })()}

      {/* INVOICE MODAL */}
      {activeModal === 'invoice' && invoiceOrder && (() => {
        const invPay = orderPayments.filter(p => p.order_id === invoiceOrder.id);
        const totalPaid = invPay.reduce((a, p) => p.type === 'refund' ? a - p.amount : a + p.amount, 0);
        const remaining = Math.max(0, (invoiceOrder.total || 0) - totalPaid);
        const displayStatus = totalPaid <= 0 ? 'Belum Bayar' : totalPaid >= (invoiceOrder.total || 0) ? 'Lunas' : 'DP';
        return (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#a0a3b1', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 3 }}>Nota Pesanan</p>
                <p style={{ fontSize: 18, fontWeight: 900, color: '#0f1130' }}>{profile?.nama_umkm || 'UMKM ERP'}</p>
                {profile?.domisili && <p style={{ fontSize: 11, color: '#a0a3b1', marginTop: 2 }}>📍 {profile.domisili}</p>}
              </div>
              <div style={{ borderTop: '1.5px dashed #e5e7eb', margin: '0 0 14px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px', marginBottom: 14, fontSize: 12 }}>
                {[['Kepada', invoiceOrder.nama],['Tgl Order', invoiceOrder.tgl_order],invoiceOrder.wa ? ['WhatsApp', invoiceOrder.wa] : null,['Tgl Kirim', invoiceOrder.tgl_kirim],invoiceOrder.alamat ? ['Alamat', invoiceOrder.alamat] : null,['Metode', invoiceOrder.metode_bayar]].filter(Boolean).map(([label, val]) => (
                  <div key={label}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#a0a3b1', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 1 }}>{label}</p>
                    <p style={{ fontWeight: 600, color: '#0f1130', wordBreak: 'break-word' }}>{val}</p>
                  </div>
                ))}
              </div>
              <div style={{ borderTop: '1.5px dashed #e5e7eb', margin: '0 0 12px' }} />
              <p style={{ fontSize: 10, fontWeight: 700, color: '#a0a3b1', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Rincian</p>
              {(invoiceOrder.order_items || []).map((it, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f4f5f9' }}>
                  <div><p style={{ fontWeight: 600, fontSize: 13 }}>{it.nama}</p><p style={{ fontSize: 10, color: '#a0a3b1' }}>{it.qty} × {formatRupiah(it.harga)}</p></div>
                  <p style={{ fontWeight: 700, fontSize: 13 }}>{formatRupiah(it.qty * (it.harga || 0))}</p>
                </div>
              ))}
              {invoiceOrder.ongkir > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f4f5f9', fontSize: 12 }}><span style={{ color: '#6b7280' }}>Ongkos kirim</span><span style={{ fontWeight: 600 }}>{formatRupiah(invoiceOrder.ongkir)}</span></div>}
              <div style={{ background: '#0f1130', borderRadius: 12, padding: '12px 16px', margin: '14px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>Total</p>
                  <p style={{ fontWeight: 900, fontSize: 18, color: '#fbbf24' }}>{formatRupiah(invoiceOrder.total)}</p>
                </div>
                {totalPaid > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}><span style={{ color: 'rgba(255,255,255,.5)' }}>Sudah dibayar</span><span style={{ color: '#86efac', fontWeight: 700 }}>{formatRupiah(totalPaid)}</span></div>
                    {remaining > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 3 }}><span style={{ color: 'rgba(255,255,255,.5)' }}>Sisa</span><span style={{ color: '#fca5a5', fontWeight: 700 }}>{formatRupiah(remaining)}</span></div>}
                  </div>
                )}
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 800, background: displayStatus === 'Lunas' ? '#edf9f0' : displayStatus === 'DP' ? '#fffbeb' : '#fef2f2', color: displayStatus === 'Lunas' ? '#16a34a' : displayStatus === 'DP' ? '#d97706' : '#ef4444' }}>{displayStatus === 'DP' ? `DP · Sisa ${formatRupiah(remaining)}` : displayStatus}</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => sendInvoiceWA(invoiceOrder, invPay)} className="btn btn-dark"><Send size={15} /> Kirim via WhatsApp</button>
                <button onClick={closeModal} className="btn btn-ghost">Tutup</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* REMOVE STOCK */}
      {activeModal === 'remove' && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#ef4444', marginBottom: 4 }}>Hapus Stok</h3>
            <p style={{ fontWeight: 600, marginBottom: 14, fontSize: 13 }}>{selectedItem.nama} (stok: {selectedItem.stok})</p>
            <form onSubmit={handleRemoveItem} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div><label className="label">Jumlah</label><input required type="number" min={1} max={selectedItem.stok} className="input" value={removalForm.qty} onChange={e => setRemovalForm({ ...removalForm, qty: e.target.value })} /></div>
              <div><label className="label">Alasan</label><select className="input" value={removalForm.alasan} onChange={e => setRemovalForm({ ...removalForm, alasan: e.target.value })}><option>Rusak</option><option>Hilang</option><option>Expired</option><option>Terpakai Internal</option></select></div>
              <button type="submit" disabled={isSaving} className="btn btn-red">Konfirmasi Hapus</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ORDER CARD COMPONENT ──────────────────────────────────
const OrderCard = ({ order, payments = [], onPayment, onInvoice, onWA, onCancel, onEdit }) => {
  const totalPaid = payments.reduce((a, p) => p.type === 'refund' ? a - p.amount : a + p.amount, 0);
  const remaining = Math.max(0, (order.total || 0) - totalPaid);
  const displayStatus = totalPaid <= 0 ? 'Belum Bayar' : totalPaid >= (order.total || 0) ? 'Lunas' : 'DP';
  const accentColor = displayStatus === 'Lunas' ? '#16a34a' : displayStatus === 'DP' ? '#f59e0b' : '#e5e7eb';

  return (
    <div className="order-card">
      <div className="order-bar" style={{ background: accentColor }} />
      <div className="order-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 1 }}>
              <span className="order-name">{order.nama}</span>
              {order.is_po && <span className="po-tag"><Clock size={9} /> PO</span>}
            </div>
            <span className="order-meta">Order: {friendlyDate(order.tgl_order)} · Kirim: {order.tgl_kirim}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {displayStatus === 'Lunas' && <span className="badge badge-green">Lunas</span>}
            {displayStatus === 'DP' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 99, fontSize: 10, fontWeight: 700, background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a' }}>
                {formatRupiah(totalPaid)} / {formatRupiah(order.total)}
              </span>
            )}
            {displayStatus === 'Belum Bayar' && <span className="badge badge-red">Belum Bayar</span>}
            <button onClick={() => onEdit(order)} style={{ background: '#f4f5f9', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#a0a3b1', display: 'flex' }}><Edit2 size={11} /></button>
          </div>
        </div>
        <div className="order-items-bg">
          {(order.order_items || []).map((it, i) => (
            <div key={i} className="order-item-row"><span>{it.qty}x {it.nama}</span><span>{formatRupiah(it.qty * (it.harga || 0))}</span></div>
          ))}
          {order.ongkir > 0 && <div className="order-item-row" style={{ color: '#a0a3b1' }}><span>Ongkir</span><span>{formatRupiah(order.ongkir)}</span></div>}
          <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 4, paddingTop: 4, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 12 }}>
            <span>Total</span><span>{formatRupiah(order.total)}</span>
          </div>
        </div>
        <div className="order-actions">
          {displayStatus !== 'Lunas' && (
            <button onClick={() => onPayment(order)} className="order-action-btn" style={{ flex: 1, background: displayStatus === 'DP' ? '#fffbeb' : '#edf9f0', color: displayStatus === 'DP' ? '#d97706' : '#16a34a' }}>
              💳 {displayStatus === 'DP' ? `Sisa ${formatRupiah(remaining)}` : 'Catat Bayar'}
            </button>
          )}
          <button onClick={() => onWA(order)} className="order-action-btn" style={{ background: '#edf9f0', color: '#16a34a', padding: '7px 11px' }}><Send size={13} /></button>
          <button onClick={() => onInvoice(order)} className="order-action-btn" style={{ background: '#e8f4ff', color: '#2563eb', padding: '7px 11px' }}><FileText size={13} /></button>
          <button onClick={() => onCancel(order)} className="order-action-btn" style={{ background: '#fef2f2', color: '#ef4444', padding: '7px 11px' }}><Trash2 size={13} /></button>
        </div>
      </div>
    </div>
  );
};

// ─── ROOT ──────────────────────────────────────────────────
const App = () => {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) { setProfile(null); return; }
    setCheckingProfile(true);
    supabase.from('profiles').select('*').eq('user_id', session.user.id).single()
      .then(({ data }) => { setProfile(data); setCheckingProfile(false); });
  }, [session]);

  if (session === undefined || checkingProfile) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f1130' }}>
        <style>{THEME}</style>
        <Loader2 size={26} color="#fbbf24" className="animate-spin" />
        <p style={{ color: '#6b7280', fontSize: 10, fontWeight: 700, marginTop: 13, letterSpacing: '.12em', textTransform: 'uppercase' }}>Memuat...</p>
      </div>
    );
  }

  if (!session) return <AuthScreen />;
  if (!profile || !profile.nama_umkm) {
    return <FirstTimeSetup user={session.user} onDone={() => {
      supabase.from('profiles').select('*').eq('user_id', session.user.id).single().then(({ data }) => setProfile(data));
    }} />;
  }

  return <ERPApp user={session.user} profile={profile} onProfileUpdate={setProfile} />;
};

export default App;
