import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Plus, ShoppingBag, Package, X, CheckCircle2, Loader2, ChefHat,
  Trash2, Utensils, ShoppingCart, MapPin, Calendar, Truck, Send,
  Clock, ChevronDown, Minus, Coffee, Settings, BarChart2,
  Wallet, Edit2, AlertCircle, LogOut, Eye, EyeOff, Store,
  CheckCircle, ArrowRight, Layers, Box, Wheat, Users, Search,
  Phone, FileText, Tag, Receipt, RotateCcw, BookOpen, Star
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
  raw:      { label: 'Bahan Baku',   short: 'Baku',    color: '#2563eb', bg: '#eff6ff',  icon: Wheat  },
  semi:     { label: 'Bahan Matang', short: 'Matang',  color: '#0d9488', bg: '#f0fdfa',  icon: Layers },
  finished: { label: 'Produk',       short: 'Produk',  color: '#16a34a', bg: '#f0fdf4',  icon: Box    },
};

const CUSTOMER_TYPES = ['Konsumen', 'Reseller', 'Toko'];
const SATUAN_OPTIONS  = ['pcs','kg','gr','liter','ml','pak','lusin','karton','loyang','porsi'];
const BAYAR_OPTIONS   = ['Cash','Transfer','QRIS'];

// ─── THEME ─────────────────────────────────────────────────
const THEME = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400&display=swap');
  :root {
    --navy:#0f1130; --navy-mid:#1e2247; --navy-light:#2d3561;
    --blue:#2563eb; --blue-soft:#eff6ff; --blue-mid:#3b82f6;
    --teal:#0d9488; --teal-soft:#f0fdfa;
    --yellow:#fbbf24; --yellow-bg:#fffbeb; --yellow-dark:#d97706;
    --green:#16a34a; --green-soft:#f0fdf4;
    --red:#ef4444; --red-soft:#fef2f2;
    --purple:#7c3aed; --purple-soft:#f5f3ff;
    --bg:#f4f5f9; --card:#ffffff; --text:#0f1130;
    --muted:#6b7280; --border:#e5e7eb; --border-strong:#d1d5db;
    --radius:16px; --radius-sm:10px; --radius-xs:8px;
    --shadow:0 1px 3px rgba(15,17,48,0.06),0 1px 2px rgba(15,17,48,0.04);
    --shadow-md:0 4px 16px rgba(15,17,48,0.08);
    --shadow-lg:0 12px 40px rgba(15,17,48,0.14);
  }
  *{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
  html{overflow-y:scroll;}
  body{background:var(--bg);font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);font-size:14px;-webkit-font-smoothing:antialiased;max-width:640px;margin:0 auto;}
  ::-webkit-scrollbar{width:4px;}
  ::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:var(--border-strong);border-radius:4px;}

  /* Modal */
  .modal-overlay{position:fixed;inset:0;z-index:150;background:rgba(15,17,48,0.55);backdrop-filter:blur(8px);display:flex;align-items:flex-end;}
  @media(min-width:640px){.modal-overlay{align-items:center;justify-content:center;}.modal-sheet{max-width:500px!important;border-radius:var(--radius)!important;margin:0 auto;}}
  .modal-sheet{background:white;width:100%;border-radius:24px 24px 0 0;padding:24px 20px 36px;max-height:92vh;overflow-y:auto;animation:slideUp .26s cubic-bezier(.32,.72,0,1);}
  .modal-handle{width:36px;height:4px;background:var(--border-strong);border-radius:99px;margin:0 auto 18px;}
  .modal-title{font-size:17px;font-weight:800;color:var(--navy);margin-bottom:16px;}

  @keyframes slideUp{from{transform:translateY(48px);opacity:0;}to{transform:translateY(0);opacity:1;}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(8px);}to{opacity:1;transform:translateY(0);}}
  @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}
  .animate-spin{animation:spin 1s linear infinite;}
  .animate-fade{animation:fadeUp .3s ease forwards;}

  /* Cards */
  .card{background:white;border-radius:var(--radius);border:1px solid var(--border);box-shadow:var(--shadow);}

  /* Buttons */
  .btn{border:none;border-radius:var(--radius-sm);padding:13px 20px;font-weight:700;font-size:14px;cursor:pointer;width:100%;font-family:'Plus Jakarta Sans',sans-serif;transition:opacity .15s,transform .1s;display:flex;align-items:center;justify-content:center;gap:8px;}
  .btn:active{transform:scale(0.98);}
  .btn:disabled{opacity:.45;cursor:not-allowed;}
  .btn-dark{background:var(--navy);color:white;}
  .btn-yellow{background:var(--yellow);color:var(--navy);}
  .btn-red{background:var(--red);color:white;}
  .btn-green{background:var(--green);color:white;}
  .btn-ghost{background:var(--bg);color:var(--text);border:1.5px solid var(--border);}
  .btn-blue{background:var(--blue);color:white;}

  /* Inputs */
  .input{width:100%;background:var(--bg);border:1.5px solid var(--border);border-radius:var(--radius-xs);padding:11px 13px;font-size:13px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);outline:none;transition:border-color .15s,background .15s;appearance:none;-webkit-appearance:none;}
  .input:focus{border-color:var(--navy);background:white;box-shadow:0 0 0 3px rgba(15,17,48,.06);}
  select.input{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 11px center;padding-right:32px;cursor:pointer;}
  .label{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px;display:block;}
  .input-row{display:grid;gap:10px;}
  .input-row-2{grid-template-columns:1fr 1fr;}
  .input-row-3{grid-template-columns:1fr 1fr 1fr;}

  /* Badges */
  .badge{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:99px;font-size:10px;font-weight:700;letter-spacing:.03em;}
  .badge-green{background:var(--green-soft);color:var(--green);}
  .badge-red{background:var(--red-soft);color:var(--red);}
  .badge-yellow{background:var(--yellow-bg);color:var(--yellow-dark);}
  .badge-blue{background:var(--blue-soft);color:var(--blue);}
  .badge-teal{background:var(--teal-soft);color:var(--teal);}
  .badge-purple{background:var(--purple-soft);color:var(--purple);}
  .badge-gray{background:#f3f4f6;color:var(--muted);}
  .badge-dark{background:var(--navy);color:white;}

  /* Nav */
  .nav-item{display:flex;flex-direction:column;align-items:center;gap:3px;background:none;border:none;cursor:pointer;padding:7px 10px;border-radius:12px;transition:all .15s;color:#9ca3af;font-family:'Plus Jakarta Sans',sans-serif;min-width:50px;}
  .nav-item.active{color:var(--navy);background:var(--yellow);}
  .nav-item span{font-size:9px;font-weight:800;text-transform:uppercase;letter-spacing:.05em;}

  /* Auth */
  .auth-bg{min-height:100vh;background:var(--navy);display:flex;align-items:center;justify-content:center;padding:24px;}
  .auth-card{background:white;border-radius:24px;padding:32px 24px;width:100%;max-width:400px;box-shadow:0 24px 80px rgba(0,0,0,.4);animation:fadeUp .4s ease;}

  /* Period select */
  .period-select{background:rgba(255,255,255,.08);border:1.5px solid rgba(255,255,255,.12);border-radius:9px;color:white;padding:6px 28px 6px 11px;font-size:11px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;outline:none;appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 9px center;}

  /* Misc */
  .divider{height:1px;background:var(--border);margin:12px 0;}
  .empty-state{text-align:center;padding:40px 0;color:var(--muted);}
  .empty-state svg{opacity:.2;margin:0 auto 8px;display:block;}
  .empty-state p{font-size:12px;font-weight:600;}
  .section-title{font-size:10px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.09em;margin-bottom:8px;}

  /* Search bar */
  .search-bar{background:white;border-radius:var(--radius-sm);padding:10px 13px;display:flex;align-items:center;gap:9px;border:1.5px solid var(--border);box-shadow:var(--shadow);}
  .search-bar input{border:none;background:none;font-size:13px;font-weight:500;font-family:'Plus Jakarta Sans',sans-serif;color:var(--text);outline:none;flex:1;width:100%;}
  .search-bar input::placeholder{color:var(--muted);}

  /* Customer card */
  .customer-card{background:white;border-radius:var(--radius);padding:13px 15px;display:flex;align-items:center;gap:12px;box-shadow:var(--shadow);border:1px solid var(--border);}
  .customer-avatar{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;flex-shrink:0;}

  /* Inline tabs */
  .inline-tabs{display:flex;gap:3px;background:white;border-radius:12px;padding:3px;box-shadow:var(--shadow);border:1px solid var(--border);}
  .inline-tab{flex:1;padding:7px 4px;border-radius:9px;border:none;font-size:10px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;text-align:center;transition:all .15s;}
  .inline-tab.active{background:var(--navy);color:white;}
  .inline-tab:not(.active){background:transparent;color:var(--muted);}

  /* Step indicator */
  .step-dot{width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;transition:all .2s;}
  .step-line{flex:1;height:2px;border-radius:1px;transition:background .2s;}

  /* PO tag */
  .po-tag{display:inline-flex;align-items:center;gap:3px;background:#fef3c7;color:#d97706;padding:2px 7px;border-radius:99px;font-size:9px;font-weight:800;border:1px solid #fde68a;}

  /* Summary bar */
  .summary-dark{background:var(--navy);border-radius:var(--radius);padding:16px 18px;color:white;}

  /* Quick action btn */
  .quick-btn{border:none;border-radius:var(--radius-sm);padding:8px 14px;font-size:11px;font-weight:800;cursor:pointer;display:flex;align-items:center;gap:5px;font-family:'Plus Jakarta Sans',sans-serif;transition:opacity .15s;}
  .quick-btn-yellow{background:var(--yellow);color:var(--navy);}
  .quick-btn-ghost{background:rgba(255,255,255,.1);color:rgba(255,255,255,.8);border:1px solid rgba(255,255,255,.12);}

  /* Add CTA dashed */
  .add-cta{background:white;border:1.5px dashed #c7d2fe;border-radius:var(--radius);padding:11px 0;width:100%;display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;font-weight:700;color:var(--blue);cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:background .15s;}
  .add-cta:hover{background:var(--blue-soft);}

  /* Delivery status chips */
  .status-chips{display:flex;gap:4px;}
  .status-chip{flex:1;border:none;border-radius:8px;padding:7px 0;font-size:9px;font-weight:700;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;text-align:center;transition:all .15s;}

  /* Calendar */
  .cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:2px;}
  .cal-day{aspect-ratio:1;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;position:relative;transition:all .1s;}
  .cal-day:hover{background:var(--yellow-bg);}
  .cal-day.today{background:var(--navy);color:white;font-weight:800;}
  .cal-day.has-order::after{content:'';position:absolute;bottom:2px;width:3px;height:3px;border-radius:50%;background:var(--blue);}
  .cal-day.selected{background:var(--yellow)!important;color:var(--navy)!important;font-weight:900;}

  /* Module grid */
  .module-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
  .module-btn{background:white;border:1.5px solid var(--border);border-radius:var(--radius);padding:16px 14px;cursor:pointer;display:flex;flex-direction:column;align-items:flex-start;gap:10px;transition:all .15s;box-shadow:var(--shadow);}
  .module-btn:active{transform:scale(0.97);}

  input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(.4);cursor:pointer;}
  .input-wrap{position:relative;}
  .input-wrap .input{padding-right:42px;}
  .input-icon-right{position:absolute;right:11px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);padding:4px;display:flex;}
`;

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

// ─── CUSTOMER TYPE COLORS ──────────────────────────────────
const custTypeStyle = (type) => {
  if (type === 'Reseller') return { bg: '#ede9fe', color: '#7c3aed', avatar: '#ddd6fe' };
  if (type === 'Toko')     return { bg: '#fef3c7', color: '#d97706', avatar: '#fde68a' };
  return { bg: '#eff6ff', color: '#2563eb', avatar: '#dbeafe' };
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

  // Data
  const [purchases,  setPurchases]  = useState([]);
  const [inventory,  setInventory]  = useState([]);
  const [recipes,    setRecipes]    = useState([]);
  const [logs,       setLogs]       = useState([]);
  const [orders,         setOrders]         = useState([]);
  const [orderPayments,  setOrderPayments]  = useState([]);
  const [customers,      setCustomers]      = useState([]);
  const [profile,    setProfile]    = useState(initialProfile);

  // Modal & UI state
  const [activeModal,        setActiveModal]        = useState(null);
  const [toast,              setToast]              = useState(null);
  const [isSaving,           setIsSaving]           = useState(false);
  const [selectedItem,       setSelectedItem]        = useState(null);
  const [editingTransaction, setEditingTransaction]  = useState(null);
  const [searchCustomer,     setSearchCustomer]      = useState('');
  const [custTypeFilter,     setCustTypeFilter]      = useState('Semua');

  // Period filters
  const [pembelianPeriod, setPembelianPeriod] = useState('bulan_ini');
  const [pembelianFrom,   setPembelianFrom]   = useState('');
  const [pembelianTo,     setPembelianTo]     = useState('');
  const [penjualanPeriod, setPenjualanPeriod] = useState('bulan_ini');
  const [penjualanFrom,   setPenjualanFrom]   = useState('');
  const [penjualanTo,     setPenjualanTo]     = useState('');
  const [ringkasanPeriod, setRingkasanPeriod] = useState('bulan_ini');
  const [ringkasanFrom,   setRingkasanFrom]   = useState('');
  const [ringkasanTo,     setRingkasanTo]     = useState('');

  // Forms
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
  const [selectedCust,  setSelectedCust]  = useState(null); // full customer object when picked from directory
  const [payingOrder,   setPayingOrder]   = useState(null); // order being paid
  const emptyPaymentForm = { amount: '', metode: 'Cash', tanggal: todayStr(), note: '' };
  const [paymentForm,   setPaymentForm]   = useState(emptyPaymentForm);
  // Invoice state
  const [invoiceOrder,  setInvoiceOrder]  = useState(null);
  // Edit order state
  const [editOrderStep, setEditOrderStep] = useState(1); // 1=details, 2=items
  const [editCart,      setEditCart]      = useState([]);
  const [editOrderForm, setEditOrderForm] = useState(null); // mirrors emptyOrderStep1 shape

  const uid = user.id;
  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3200); };
  const closeModal = () => { setActiveModal(null); setSelectedItem(null); setEditingTransaction(null); setOrderStep(1); setCart([]); setSelectedCust(null); setPayingOrder(null); setEditOrderStep(1); setEditCart([]); setEditOrderForm(null); setInvoiceOrder(null); };

  // ── Fetch all data
  // ── Payment status helper
  const computePayStatus = (orderId, orderTotal) => {
    const payments = orderPayments.filter(p => p.order_id === orderId && p.type !== 'refund');
    const refunds  = orderPayments.filter(p => p.order_id === orderId && p.type === 'refund');
    const totalPaid = payments.reduce((a, p) => a + (p.amount || 0), 0)
                    - refunds.reduce((a, p) => a + (p.amount || 0), 0);
    if (totalPaid <= 0)               return { status: 'Belum Bayar', paid: 0, remaining: orderTotal };
    if (totalPaid >= orderTotal)      return { status: 'Lunas',       paid: totalPaid, remaining: 0 };
    return { status: 'DP', paid: totalPaid, remaining: orderTotal - totalPaid };
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
      supabase.channel('purch3').on('postgres_changes', { event: '*', schema: 'public', table: 'purchases', filter: `user_id=eq.${uid}` }, fetchAll).subscribe(),
      supabase.channel('inv3').on('postgres_changes',   { event: '*', schema: 'public', table: 'inventory',  filter: `user_id=eq.${uid}` }, fetchAll).subscribe(),
      supabase.channel('ord3').on('postgres_changes',   { event: '*', schema: 'public', table: 'orders',     filter: `user_id=eq.${uid}` }, fetchAll).subscribe(),
      supabase.channel('cust3').on('postgres_changes',  { event: '*', schema: 'public', table: 'customers',    filter: `user_id=eq.${uid}` }, fetchAll).subscribe(),
      supabase.channel('pay3').on('postgres_changes',   { event: '*', schema: 'public', table: 'order_payments', filter: `user_id=eq.${uid}` }, fetchAll).subscribe(),
    ];
    return () => subs.forEach(s => supabase.removeChannel(s));
  }, [uid, fetchAll]);

  // ── Date range helper
  const getDateRange = (period, from, to) => {
    const now = new Date();
    if (period === 'hari_ini')  return { from: todayStr(), to: todayStr() };
    if (period === 'minggu_ini') { const d = new Date(now); d.setDate(now.getDate() - now.getDay()); return { from: d.toISOString().split('T')[0], to: todayStr() }; }
    if (period === 'bulan_ini') return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0], to: todayStr() };
    return { from, to };
  };

  // ── Filtered data
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
    // pemasukan = actual cash received (sum of payments in range)
    const pemasukan   = orderPayments
      .filter(p => inRange(p.tanggal) && p.type !== 'refund')
      .reduce((a, p) => a + (p.amount || 0), 0)
      - orderPayments
      .filter(p => inRange(p.tanggal) && p.type === 'refund')
      .reduce((a, p) => a + (p.amount || 0), 0);
    const pengeluaran = rangePurch.reduce((a, p) => a + (p.total_harga || 0), 0);
    const produkMap   = {};
    paidOrders.forEach(o => (o.order_items || []).forEach(it => { produkMap[it.nama] = (produkMap[it.nama] || 0) + it.qty; }));
    const topProduk   = Object.entries(produkMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { pemasukan, pengeluaran, laba: pemasukan - pengeluaran, topProduk, totalOrders: orders.filter(o => inRange(o.tgl_order)).length };
  }, [orders, purchases, ringkasanPeriod, ringkasanFrom, ringkasanTo]);

  const filteredCustomers = useMemo(() => {
    let list = customers;
    if (custTypeFilter !== 'Semua') list = list.filter(c => c.customer_type === custTypeFilter);
    if (searchCustomer) list = list.filter(c => c.nama.toLowerCase().includes(searchCustomer.toLowerCase()) || c.wa?.includes(searchCustomer));
    return list;
  }, [customers, custTypeFilter, searchCustomer]);

  // ── HPP computation
  // Returns { hpp, margin, marginPct, incomplete } per finished inventory item id
  const hppMap = useMemo(() => {
    const result = {};

    // Weighted average price per ingredient slug
    const avgPrice = {};
    const totals = {}; // { slug: { totalCost, totalQty } }
    for (const p of purchases) {
      if (p.is_expense_only) continue;
      const slug = slugify(p.nama_barang);
      if (!totals[slug]) totals[slug] = { totalCost: 0, totalQty: 0 };
      totals[slug].totalCost += (p.total_harga || 0);
      totals[slug].totalQty  += (p.jumlah     || 0);
    }
    for (const [slug, t] of Object.entries(totals)) {
      avgPrice[slug] = t.totalQty > 0 ? t.totalCost / t.totalQty : 0;
    }

    // For each recipe, compute HPP per output unit
    for (const recipe of recipes) {
      const outputs     = recipe.recipe_outputs     || [];
      const ingredients = recipe.recipe_ingredients || [];
      if (outputs.length === 0) continue;

      // Total ingredient cost per batch
      let batchCost  = 0;
      let incomplete = false;
      for (const ing of ingredients) {
        const slug  = slugify(ing.nama_bahan);
        const price = avgPrice[slug];
        if (!price) { incomplete = true; continue; }
        batchCost += Number(ing.qty) * price;
      }

      // Distribute cost across outputs proportionally (equal split if multiple)
      const totalOutputQty = outputs.reduce((a, o) => a + Number(o.qty), 0);
      for (const out of outputs) {
        const outSlug    = slugify(out.inventory_item_name);
        const outQty     = Number(out.qty);
        const shareRatio = totalOutputQty > 0 ? outQty / totalOutputQty : 1;
        const hpp        = outQty > 0 ? (batchCost * shareRatio) / outQty : 0;

        // Find the inventory item that matches this output
        const invItem = inventory.find(i => slugify(i.nama) === outSlug);
        if (!invItem) continue;

        const harga      = invItem.harga || 0;
        const margin     = harga - hpp;
        const marginPct  = harga > 0 ? (margin / harga) * 100 : null;

        result[invItem.id] = { hpp, margin, marginPct, incomplete };
      }
    }
    return result;
  }, [purchases, recipes, inventory]);

  // ── Calendar
  const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const DAYS_ID   = ['M','S','S','R','K','J','S'];
  const calDays = useMemo(() => {
    const y = calendarDate.getFullYear(), m = calendarDate.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days  = Array(first).fill(null);
    for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) days.push(new Date(y, m, d));
    const orderDates = new Set(orders.map(o => o.tgl_kirim).filter(Boolean));
    return { days, orderDates };
  }, [calendarDate, orders]);

  // ─── ACTION HANDLERS ────────────────────────────────────

  // PEMBELIAN
  const handleAddPurchase = async (e) => {
    e.preventDefault(); if (isSaving) return; setIsSaving(true);
    const qty   = Number(purchaseForm.jumlah);
    const price = Number(purchaseForm.harga_satuan);
    const total = qty * price;
    try {
      await supabase.from('purchases').insert({ user_id: uid, nama_barang: purchaseForm.nama_barang, supplier: purchaseForm.supplier, jumlah: qty, satuan: purchaseForm.satuan, harga_satuan: price, total_harga: total, tanggal: purchaseForm.tanggal, is_expense_only: purchaseForm.is_expense_only });
      if (!purchaseForm.is_expense_only) {
        const slug = slugify(purchaseForm.nama_barang);
        const { data: existing } = await supabase.from('inventory').select('*').eq('user_id', uid).eq('id', slug).single();
        if (existing) { await supabase.from('inventory').update({ stok: existing.stok + qty }).eq('user_id', uid).eq('id', slug); }
        else { await supabase.from('inventory').insert({ id: slug, user_id: uid, nama: purchaseForm.nama_barang, stok: qty, satuan: purchaseForm.satuan, type: 'raw', harga: 0 }); }
      }
      showToast('Pembelian disimpan ✓');
      setPurchaseForm(emptyPurchaseForm); closeModal(); fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  // CUSTOMER CRUD
  const handleSaveCustomer = async (e) => {
    e.preventDefault(); if (isSaving) return; setIsSaving(true);
    try {
      if (selectedItem) { // edit
        await supabase.from('customers').update({ nama: customerForm.nama, wa: customerForm.wa, alamat: customerForm.alamat, customer_type: customerForm.customer_type, notes: customerForm.notes }).eq('id', selectedItem.id).eq('user_id', uid);
        showToast('Pelanggan diperbarui ✓');
      } else { // new
        await supabase.from('customers').insert({ user_id: uid, nama: customerForm.nama, wa: customerForm.wa, alamat: customerForm.alamat, customer_type: customerForm.customer_type, notes: customerForm.notes });
        showToast('Pelanggan disimpan ✓');
      }
      setCustomerForm(emptyCustomerForm); closeModal(); fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  const handleDeleteCustomer = async (cust) => {
    await supabase.from('customers').update({ is_active: false }).eq('id', cust.id).eq('user_id', uid);
    showToast('Pelanggan dihapus ✓'); fetchAll();
  };

  // MANUAL INVENTORY ITEM
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

  // RECIPE — multi-output
  const handleAddRecipe = async (e) => {
    e.preventDefault(); if (isSaving) return; setIsSaving(true);
    try {
      const { data: recipe } = await supabase.from('recipes').insert({ user_id: uid, nama: recipeForm.nama, is_archived: false }).select().single();
      if (recipe) {
        // Insert ingredients
        await supabase.from('recipe_ingredients').insert(recipeForm.ingredients.map(ing => ({ recipe_id: recipe.id, user_id: uid, nama_bahan: ing.nama_bahan, qty: Number(ing.qty), satuan: ing.satuan })));
        // Insert outputs (v3 multi-output)
        await supabase.from('recipe_outputs').insert(recipeForm.outputs.map(out => ({ recipe_id: recipe.id, user_id: uid, inventory_item_name: out.nama, qty: Number(out.jumlah_output), satuan: out.satuan_output, type: out.type })));
      }
      showToast('Resep disimpan ✓'); setRecipeForm(emptyRecipeForm); closeModal(); fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  // PRODUKSI — multi-output
  const handleProduction = async (e) => {
    e.preventDefault(); if (isSaving || !prodForm.recipe_id) return; setIsSaving(true);
    const recipe     = recipes.find(r => r.id === Number(prodForm.recipe_id));
    const multiplier = Number(prodForm.qty) || 1;
    const ingredients = recipe.recipe_ingredients || [];
    const outputs     = recipe.recipe_outputs || [];
    try {
      // Deduct inputs
      for (const ing of ingredients) {
        const slug = slugify(ing.nama_bahan);
        const { data: inv } = await supabase.from('inventory').select('*').eq('user_id', uid).eq('id', slug).single();
        if (!inv) throw new Error(`Bahan ${ing.nama_bahan} tidak ada di stok`);
        const needed = Number(ing.qty) * multiplier;
        if (inv.stok < needed) throw new Error(`Stok ${ing.nama_bahan} kurang (butuh ${needed}, ada ${inv.stok})`);
        await supabase.from('inventory').update({ stok: inv.stok - needed }).eq('user_id', uid).eq('id', slug);
      }
      // Add all outputs
      const outputSummary = [];
      for (const out of outputs) {
        const outSlug  = slugify(out.inventory_item_name);
        const outQty   = Number(out.qty) * multiplier;
        const { data: existing } = await supabase.from('inventory').select('*').eq('user_id', uid).eq('id', outSlug).single();
        if (existing) { await supabase.from('inventory').update({ stok: existing.stok + outQty }).eq('user_id', uid).eq('id', outSlug); }
        else { await supabase.from('inventory').insert({ id: outSlug, user_id: uid, nama: out.inventory_item_name, stok: outQty, satuan: out.satuan, type: out.type || 'finished', harga: 0 }); }
        outputSummary.push(`${outQty} ${out.satuan} ${out.inventory_item_name}`);
      }
      const detail = `${multiplier}x batch → ${outputSummary.join(', ')}`;
      await supabase.from('warehouse_logs').insert({ user_id: uid, type: 'PRODUKSI', detail, tanggal: prodForm.tanggal });
      showToast('Produksi berhasil ✓'); closeModal(); fetchAll();
    } catch (err) { showToast(err.message, 'error'); } finally { setIsSaving(false); }
  };

  // SET HARGA
  const handleSetPrice = async (e) => {
    e.preventDefault(); if (!selectedItem) return; setIsSaving(true);
    await supabase.from('inventory').update({ harga: Number(priceForm.harga) }).eq('user_id', uid).eq('id', selectedItem.id);
    showToast('Harga disimpan ✓'); closeModal(); fetchAll(); setIsSaving(false);
  };

  // REMOVE STOCK
  const handleRemoveItem = async (e) => {
    e.preventDefault(); if (!selectedItem) return; setIsSaving(true);
    const qty = Number(removalForm.qty);
    if (qty > selectedItem.stok) { showToast('Jumlah melebihi stok', 'error'); setIsSaving(false); return; }
    await supabase.from('inventory').update({ stok: selectedItem.stok - qty }).eq('user_id', uid).eq('id', selectedItem.id);
    await supabase.from('warehouse_logs').insert({ user_id: uid, type: 'REMOVAL', detail: `${qty} ${selectedItem.nama} (${removalForm.alasan})`, tanggal: todayStr() });
    showToast('Stok dihapus ✓'); closeModal(); fetchAll(); setIsSaving(false);
  };

  // CART
  const addToCart = (item) => {
    if (!item.harga || item.harga === 0) { showToast('Set harga produk dulu!', 'error'); return; }
    setCart(prev => { const ex = prev.find(c => c.id === item.id); return ex ? prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c) : [...prev, { ...item, qty: 1 }]; });
  };
  const removeFromCart = (id) => setCart(prev => { const ex = prev.find(c => c.id === id); return ex?.qty > 1 ? prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c) : prev.filter(c => c.id !== id); });

  // CHECKOUT
  const handleCheckout = async (e) => {
    e.preventDefault(); if (isSaving || cart.length === 0) return; setIsSaving(true);
    const ongkir = Number(orderStep1.ongkir) || 0;
    const total  = cart.reduce((a, b) => a + b.qty * (b.harga || 0), 0) + ongkir;
    try {
      const { data: order } = await supabase.from('orders').insert({
        user_id: uid,
        customer_id: orderStep1.customer_id || null,
        nama: orderStep1.nama, wa: orderStep1.wa, alamat: orderStep1.alamat,
        customer_type: orderStep1.customer_type,
        tgl_order: orderStep1.tgl_order, tgl_kirim: orderStep1.tgl_kirim,
        metode_bayar: orderStep1.metode_bayar, status_bayar: orderStep1.status_bayar,
        delivery_status: 'Menunggu', total, ongkir,
        status: 'Pesanan Baru',
        is_po: orderStep1.tgl_kirim > todayStr()
      }).select().single();
      if (order) {
        await supabase.from('order_items').insert(cart.map(item => ({ order_id: order.id, user_id: uid, nama: item.nama, qty: item.qty, harga: item.harga, inventory_id: item.id })));
        if (orderStep1.tgl_kirim <= todayStr()) {
          for (const item of cart) {
            const { data: inv } = await supabase.from('inventory').select('stok').eq('user_id', uid).eq('id', item.id).single();
            if (inv) await supabase.from('inventory').update({ stok: Math.max(0, inv.stok - item.qty) }).eq('user_id', uid).eq('id', item.id);
          }
        }
      }
      showToast('Pesanan dicatat ✓');
      setCart([]); setOrderStep1(emptyOrderStep1); setOrderStep(1); setSelectedCust(null);
      closeModal(); fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  // PAYMENT LEDGER
  const openPayModal = (order) => {
    setPayingOrder(order);
    setPaymentForm({ amount: '', metode: 'Cash', tanggal: todayStr(), note: '' });
    setActiveModal('payment');
  };

  const handleAddPayment = async (e) => {
    e.preventDefault(); if (isSaving || !payingOrder) return; setIsSaving(true);
    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) { showToast('Masukkan jumlah bayar', 'error'); setIsSaving(false); return; }
    try {
      await supabase.from('order_payments').insert({
        order_id: payingOrder.id, user_id: uid,
        amount, tanggal: paymentForm.tanggal,
        metode: paymentForm.metode, note: paymentForm.note,
        type: 'payment',
      });
      // Recompute status from all payments for this order
      const { data: allPay } = await supabase.from('order_payments')
        .select('*').eq('order_id', payingOrder.id);
      const totalPaid = (allPay || [])
        .reduce((a, p) => p.type === 'refund' ? a - p.amount : a + p.amount, 0);
      const newStatus = totalPaid <= 0 ? 'Belum Bayar'
        : totalPaid >= payingOrder.total ? 'Lunas' : 'DP';
      await supabase.from('orders').update({ status_bayar: newStatus })
        .eq('user_id', uid).eq('id', payingOrder.id);
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

  const handleEditOrderDates = async (e) => {
    e.preventDefault(); setIsSaving(true);
    await supabase.from('orders').update({ tgl_order: editingTransaction._newTglOrder, tgl_kirim: editingTransaction._newTglKirim }).eq('user_id', uid).eq('id', editingTransaction.id);
    showToast('Tanggal diperbarui ✓'); closeModal(); fetchAll(); setIsSaving(false);
  };

  // ── OPEN FULL EDIT MODAL
  const openEditOrder = (order) => {
    setEditOrderForm({
      customer_id:  order.customer_id  || '',
      nama:         order.nama         || '',
      wa:           order.wa           || '',
      alamat:       order.alamat       || '',
      customer_type: order.customer_type || 'Konsumen',
      tgl_order:    order.tgl_order    || todayStr(),
      tgl_kirim:    order.tgl_kirim    || todayStr(),
      metode_bayar: order.metode_bayar || 'Cash',
      status_bayar: order.status_bayar || 'Belum Bayar',
      ongkir:       order.ongkir       || '',
    });
    // Pre-fill cart from existing order items
    const existingCart = (order.order_items || []).map(it => ({
      id:    it.inventory_id || slugify(it.nama),
      nama:  it.nama,
      harga: it.harga,
      qty:   it.qty,
      satuan: '',
      stok:  999, // we don't block edits on stok for existing items
    }));
    setEditCart(existingCart);
    setEditingTransaction(order);
    setEditOrderStep(1);
    setActiveModal('editOrder');
  };

  // ── SAVE FULL EDIT
  const handleSaveEditOrder = async (e) => {
    e.preventDefault();
    if (isSaving || !editingTransaction || editCart.length === 0) return;
    setIsSaving(true);
    try {
      const ongkir = Number(editOrderForm.ongkir) || 0;
      const newTotal = editCart.reduce((a, b) => a + b.qty * (b.harga || 0), 0) + ongkir;
      const newIsPo  = editOrderForm.tgl_kirim > todayStr();

      // 1. Restore stock from old items (if not PO — stock was deducted at checkout)
      if (!editingTransaction.is_po) {
        for (const it of editingTransaction.order_items || []) {
          const invId = it.inventory_id || slugify(it.nama);
          const { data: inv } = await supabase.from('inventory').select('stok').eq('user_id', uid).eq('id', invId).single();
          if (inv) await supabase.from('inventory').update({ stok: inv.stok + it.qty }).eq('user_id', uid).eq('id', invId);
        }
      }

      // 2. Delete old order_items
      await supabase.from('order_items').delete().eq('order_id', editingTransaction.id);

      // 3. Insert new order_items
      await supabase.from('order_items').insert(
        editCart.map(item => ({
          order_id: editingTransaction.id, user_id: uid,
          nama: item.nama, qty: item.qty, harga: item.harga,
          inventory_id: item.id,
        }))
      );

      // 4. Deduct stock for new items (if not PO)
      if (!newIsPo) {
        for (const item of editCart) {
          const { data: inv } = await supabase.from('inventory').select('stok').eq('user_id', uid).eq('id', item.id).single();
          if (inv) await supabase.from('inventory').update({ stok: Math.max(0, inv.stok - item.qty) }).eq('user_id', uid).eq('id', item.id);
        }
      }

      // 5. Update order header
      await supabase.from('orders').update({
        customer_id:   editOrderForm.customer_id   || null,
        nama:          editOrderForm.nama,
        wa:            editOrderForm.wa,
        alamat:        editOrderForm.alamat,
        customer_type: editOrderForm.customer_type,
        tgl_order:     editOrderForm.tgl_order,
        tgl_kirim:     editOrderForm.tgl_kirim,
        metode_bayar:  editOrderForm.metode_bayar,
        status_bayar:  editOrderForm.status_bayar,
        ongkir,
        total:         newTotal,
        is_po:         newIsPo,
      }).eq('user_id', uid).eq('id', editingTransaction.id);

      showToast('Pesanan diperbarui ✓'); closeModal(); fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  // Edit cart helpers
  const addToEditCart = (item) => {
    if (!item.harga || item.harga === 0) { showToast('Set harga produk dulu!', 'error'); return; }
    setEditCart(prev => { const ex = prev.find(c => c.id === item.id); return ex ? prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c) : [...prev, { ...item, qty: 1 }]; });
  };
  const removeFromEditCart = (id) => setEditCart(prev => { const ex = prev.find(c => c.id === id); return ex?.qty > 1 ? prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c) : prev.filter(c => c.id !== id); });

  const updateDeliveryStatus = async (orderId, status) => {
    await supabase.from('orders').update({ delivery_status: status }).eq('user_id', uid).eq('id', orderId);
    if (status === 'Dikirim') {
      const order = orders.find(o => o.id === orderId);
      if (order && order.is_po) {
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
    const ongkirText = order.ongkir > 0 ? `\nOngkir: ${formatRupiah(order.ongkir)}` : '';
    const text = `Halo ${order.nama}! 👋\n\nPesanan kamu: ${items}\nTotal: ${formatRupiah(order.total)}${ongkirText}\nJadwal kirim: ${order.tgl_kirim}\nAlamat: ${order.alamat}\n\nMohon ditunggu ya! 🙏`;
    window.open(`https://wa.me/${order.wa?.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const openInvoice = (order) => {
    setInvoiceOrder(order);
    setActiveModal('invoice');
  };

  const sendInvoiceWA = (order, payments = []) => {
    const totalPaid = payments
      .reduce((a, p) => p.type === 'refund' ? a - p.amount : a + p.amount, 0);
    const remaining = Math.max(0, (order.total || 0) - totalPaid);
    const lines = (order.order_items || [])
      .map(it => `  ${it.qty}x ${it.nama} = ${formatRupiah(it.qty * (it.harga || 0))}`)
      .join('\n');
    const ongkirLine  = order.ongkir > 0 ? `\nOngkir: ${formatRupiah(order.ongkir)}` : '';
    const payLine     = totalPaid > 0 && remaining > 0
      ? `\nSudah dibayar: ${formatRupiah(totalPaid)}\nSisa: ${formatRupiah(remaining)}`
      : totalPaid >= (order.total || 0) && totalPaid > 0
      ? `\nStatus: ✅ LUNAS`
      : `\nStatus: Belum dibayar`;
    const text =
`🧾 *NOTA PESANAN*
${profile?.nama_umkm || ''}${profile?.domisili ? ' · ' + profile.domisili : ''}

Kepada: ${order.nama}
Tgl Order: ${order.tgl_order}
Tgl Kirim: ${order.tgl_kirim}${order.alamat ? '\nAlamat: ' + order.alamat : ''}

*Rincian:*
${lines}${ongkirLine}
──────────────
*Total: ${formatRupiah(order.total)}*${payLine}

Terima kasih! 🙏`;
    window.open(`https://wa.me/${order.wa?.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setIsSaving(true);
    await supabase.from('profiles').upsert({ user_id: uid, ...profileForm });
    setProfile(profileForm); onProfileUpdate(profileForm);
    showToast('Profil disimpan ✓'); setShowSettings(false); setIsSaving(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  // ── Period UI helpers
  const PERIOD_OPTIONS = [
    { value: 'hari_ini', label: 'Hari Ini' },
    { value: 'minggu_ini', label: 'Minggu Ini' },
    { value: 'bulan_ini', label: 'Bulan Ini' },
    { value: 'custom', label: 'Custom' },
  ];
  const PeriodDark = ({ value, onChange }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className="period-select">
      {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
  const CustomRange = ({ from, setFrom, to, setTo }) => (
    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
      <div style={{ flex: 1 }}><label className="label">Dari</label><input type="date" className="input" value={from} onChange={e => setFrom(e.target.value)} /></div>
      <div style={{ flex: 1 }}><label className="label">Sampai</label><input type="date" className="input" value={to} onChange={e => setTo(e.target.value)} /></div>
    </div>
  );

  // ── Customer picker helper (for order flow)
  const pickCustomer = (cust) => {
    setSelectedCust(cust);
    setOrderStep1(prev => ({ ...prev, customer_id: cust.id, nama: cust.nama, wa: cust.wa || '', alamat: cust.alamat || '', customer_type: cust.customer_type }));
    setActiveModal('newOrder');
    setOrderStep(1);
  };

  const MODULES = [
    { key: 'pembelian',  icon: ShoppingBag, label: 'Pembelian',    color: '#2563eb', bg: '#eff6ff', desc: 'Catat bahan masuk' },
    { key: 'gudang',     icon: Package,     label: 'Gudang',       color: '#0d9488', bg: '#f0fdfa', desc: 'Stok & resep' },
    { key: 'penjualan',  icon: ShoppingCart,label: 'Penjualan',    color: '#16a34a', bg: '#f0fdf4', desc: 'Buat pesanan' },
    { key: 'pelanggan',  icon: Users,       label: 'Pelanggan',    color: '#7c3aed', bg: '#f5f3ff', desc: 'Direktori pelanggan' },
    { key: 'jadwal',     icon: Truck,       label: 'Jadwal Kirim', color: '#d97706', bg: '#fffbeb', desc: 'Pantau pengiriman' },
  ];

  // ─── RENDER ──────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100, background: '#f4f5f9', maxWidth: 640, margin: '0 auto' }}>
      <style>{THEME}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 300, pointerEvents: 'none', whiteSpace: 'nowrap', animation: 'fadeUp .22s ease' }}>
          <div style={{ background: toast.type === 'error' ? '#ef4444' : '#0f1130', color: 'white', padding: '10px 20px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 8px 32px rgba(0,0,0,.18)' }}>
            {toast.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} color="#86efac" />}
            <span style={{ fontWeight: 700, fontSize: 12 }}>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: '#0f1130', padding: '50px 18px 16px', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 2px 20px rgba(0,0,0,.18)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            {activeTab === 'ringkasan' && profile?.nama_user && (
              <p style={{ color: '#6b7280', fontSize: 11, fontWeight: 500, marginBottom: 2 }}>Halo, {profile.nama_user} 👋</p>
            )}
            <h1 style={{ color: 'white', fontSize: activeTab === 'ringkasan' ? 21 : 18, fontWeight: 900, letterSpacing: '-0.02em' }}>
              {{ ringkasan: profile?.nama_umkm || 'Dashboard', pembelian: 'Pembelian', gudang: 'Gudang', penjualan: 'Penjualan', pelanggan: 'Pelanggan', jadwal: 'Jadwal Kirim' }[activeTab]}
            </h1>
            {activeTab === 'ringkasan' && profile?.domisili && (
              <p style={{ color: '#6b7280', fontSize: 10, marginTop: 2 }}>📍 {profile.domisili}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
            {activeTab === 'ringkasan'  && <PeriodDark value={ringkasanPeriod}  onChange={setRingkasanPeriod} />}
            {activeTab === 'pembelian'  && <PeriodDark value={pembelianPeriod}  onChange={setPembelianPeriod} />}
            {activeTab === 'penjualan'  && <PeriodDark value={penjualanPeriod}  onChange={setPenjualanPeriod} />}
            {activeTab === 'pembelian'  && <button onClick={() => setActiveModal('beli')}    className="quick-btn quick-btn-yellow"><Plus size={13} /> Tambah</button>}
            {activeTab === 'penjualan'  && <button onClick={() => { setOrderStep(1); setActiveModal('newOrder'); }} className="quick-btn quick-btn-yellow"><Plus size={13} /> Order</button>}
            {activeTab === 'pelanggan'  && <button onClick={() => { setCustomerForm(emptyCustomerForm); setSelectedItem(null); setActiveModal('customer'); }} className="quick-btn quick-btn-yellow"><Plus size={13} /> Tambah</button>}
            {activeTab === 'gudang' && subTabGudang === 'stok'   && <button onClick={() => setActiveModal('produksi')} className="quick-btn quick-btn-yellow"><ChefHat size={13} /> Produksi</button>}
            {activeTab === 'gudang' && subTabGudang === 'resep'  && <button onClick={() => setActiveModal('resep')}    className="quick-btn quick-btn-yellow"><Plus size={13} /> Resep</button>}
            {activeTab === 'gudang' && subTabGudang === 'stok'   && <button onClick={() => { setNewItemForm(emptyNewItemForm); setActiveModal('newItem'); }} className="quick-btn quick-btn-ghost"><Plus size={13} /> Item</button>}
            <button onClick={() => { setProfileForm({ nama_umkm: profile?.nama_umkm || '', nama_user: profile?.nama_user || '', tentang: profile?.tentang || '', domisili: profile?.domisili || '' }); setShowSettings(true); }} style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 9, padding: 7, cursor: 'pointer', color: '#9ca3af', display: 'flex' }}><Settings size={16} /></button>
          </div>
        </div>

        {/* Sub-tabs gudang */}
        {activeTab === 'gudang' && (
          <div style={{ display: 'flex', gap: 3, marginTop: 13, background: 'rgba(255,255,255,.06)', padding: 3, borderRadius: 11 }}>
            {[['stok','Stok'],['resep','Resep'],['riwayat','Riwayat']].map(([k,l]) => (
              <button key={k} onClick={() => setSubTabGudang(k)} style={{ flex: 1, padding: '6px 4px', borderRadius: 9, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: subTabGudang === k ? 'white' : 'transparent', color: subTabGudang === k ? '#0f1130' : 'rgba(255,255,255,.4)', transition: 'all .15s' }}>{l}</button>
            ))}
          </div>
        )}

        {/* Sub-tabs penjualan */}
        {activeTab === 'penjualan' && (
          <div style={{ display: 'flex', gap: 3, marginTop: 13, background: 'rgba(255,255,255,.06)', padding: 3, borderRadius: 11 }}>
            {[['hari_ini','Hari Ini'],['pre_order','Pre-Order'],['semua','Semua']].map(([k,l]) => (
              <button key={k} onClick={() => setSubTabJual(k)} style={{ flex: 1, padding: '6px 4px', borderRadius: 9, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: subTabJual === k ? 'white' : 'transparent', color: subTabJual === k ? '#0f1130' : 'rgba(255,255,255,.4)', transition: 'all .15s' }}>{l}</button>
            ))}
          </div>
        )}

        {/* Sub-tabs jadwal */}
        {activeTab === 'jadwal' && !selectedCalDay && (
          <div style={{ display: 'flex', gap: 3, marginTop: 13, background: 'rgba(255,255,255,.06)', padding: 3, borderRadius: 11 }}>
            {[['hari_ini','Hari Ini'],['besok','Besok'],['mendatang','Mendatang']].map(([k,l]) => (
              <button key={k} onClick={() => setJadwalFilter(k)} style={{ flex: 1, padding: '6px 4px', borderRadius: 9, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: jadwalFilter === k ? 'white' : 'transparent', color: jadwalFilter === k ? '#0f1130' : 'rgba(255,255,255,.4)', transition: 'all .15s' }}>{l}</button>
            ))}
          </div>
        )}
        {activeTab === 'jadwal' && selectedCalDay && (
          <div style={{ marginTop: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600 }}>📅 {selectedCalDay}</span>
            <button onClick={() => setSelectedCalDay(null)} style={{ background: 'rgba(239,68,68,.15)', color: '#ef4444', border: 'none', borderRadius: 7, padding: '3px 10px', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}>Reset</button>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main style={{ padding: '14px 14px 0' }}>

        {/* Custom range banners */}
        {activeTab === 'pembelian' && pembelianPeriod === 'custom' && <CustomRange from={pembelianFrom} setFrom={setPembelianFrom} to={pembelianTo} setTo={setPembelianTo} />}
        {activeTab === 'penjualan' && penjualanPeriod === 'custom' && <CustomRange from={penjualanFrom} setFrom={setPenjualanFrom} to={penjualanTo} setTo={setPenjualanTo} />}
        {activeTab === 'ringkasan' && ringkasanPeriod === 'custom' && <CustomRange from={ringkasanFrom} setFrom={setRingkasanFrom} to={ringkasanTo} setTo={setRingkasanTo} />}

        {/* ══════════ RINGKASAN ══════════ */}
        {activeTab === 'ringkasan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Laba card */}
            <div className="summary-dark" style={{ borderRadius: 18 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 5 }}>Laba Kotor</p>
              <p style={{ fontSize: 30, fontWeight: 900, letterSpacing: '-0.02em', color: ringkasanData.laba >= 0 ? '#fbbf24' : '#f87171' }}>{formatRupiah(ringkasanData.laba)}</p>
              <div style={{ display: 'flex', gap: 14, marginTop: 13, paddingTop: 13, borderTop: '1px solid rgba(255,255,255,.07)' }}>
                {[['↑ Masuk', formatRupiah(ringkasanData.pemasukan), '#86efac'],['↓ Keluar', formatRupiah(ringkasanData.pengeluaran), '#fca5a5'],['Pesanan', ringkasanData.totalOrders, 'white']].map(([label, val, color]) => (
                  <div key={label}>
                    <p style={{ fontSize: 9, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>{label}</p>
                    <p style={{ fontWeight: 800, fontSize: 13, color }}>{val}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Module grid — 5 modules in 2+3 layout */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9 }}>
              {MODULES.map(({ key, icon: Icon, label, color, bg, desc }) => (
                <button key={key} className="module-btn" onClick={() => setActiveTab(key)} style={{ gridColumn: key === 'jadwal' ? '1 / -1' : 'auto' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={19} color={color} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 1 }}>{label}</p>
                    <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Top products */}
            {ringkasanData.topProduk.length > 0 && (
              <div className="card" style={{ padding: 16 }}>
                <p style={{ fontWeight: 800, fontSize: 12, marginBottom: 10, color: '#374151' }}>Top Produk Terjual</p>
                {ringkasanData.topProduk.map(([nama, qty], i) => (
                  <div key={nama} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: i < ringkasanData.topProduk.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: i === 0 ? '#fbbf24' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: i === 0 ? '#92400e' : '#6b7280', flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ flex: 1, fontWeight: 600, fontSize: 12 }}>{nama}</p>
                    <span className="badge badge-dark">{qty} terjual</span>
                  </div>
                ))}
              </div>
            )}

            {/* Per-product profitability */}
            {inventory.filter(i => i.type === 'finished' && hppMap[i.id]).length > 0 && (
              <div className="card" style={{ padding: 16 }}>
                <p style={{ fontWeight: 800, fontSize: 12, marginBottom: 10, color: '#374151' }}>Estimasi Margin per Produk</p>
                {inventory.filter(i => i.type === 'finished').map(item => {
                  const hpp = hppMap[item.id];
                  if (!hpp) return null;
                  const hasPrice = item.harga > 0;
                  return (
                    <div key={item.id} style={{ padding: '8px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 12, marginBottom: 2 }}>{item.nama}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 10, color: '#9ca3af' }}>HPP ~{formatRupiah(Math.round(hpp.hpp))}</span>
                          {hasPrice && <span style={{ fontSize: 10, color: '#6b7280' }}>Harga {formatRupiah(item.harga)}</span>}
                          {hpp.incomplete && <span style={{ fontSize: 9, color: '#f59e0b', fontWeight: 600 }}>⚠ estimasi</span>}
                        </div>
                      </div>
                      {hasPrice && hpp.marginPct !== null ? (
                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 10 }}>
                          <p style={{ fontWeight: 900, fontSize: 14, color: hpp.margin >= 0 ? '#16a34a' : '#ef4444' }}>
                            {hpp.margin >= 0 ? '+' : ''}{Math.round(hpp.marginPct)}%
                          </p>
                          <p style={{ fontSize: 10, color: '#9ca3af' }}>{formatRupiah(Math.round(hpp.margin))} / unit</p>
                        </div>
                      ) : (
                        <span style={{ fontSize: 10, color: '#d1d5db' }}>Belum ada harga</span>
                      )}
                    </div>
                  );
                })}
                <p style={{ fontSize: 9, color: '#d1d5db', marginTop: 8, fontStyle: 'italic' }}>
                  Berdasarkan rata-rata harga beli bahan. Bukan untuk laporan keuangan formal.
                </p>
              </div>
            )}

            {/* Upcoming POs */}
            {upcomingPOs.length > 0 && (
              <div style={{ background: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: 14, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                  <Clock size={14} color="#d97706" /><p style={{ fontWeight: 800, fontSize: 12, color: '#92400e' }}>Pre-Order Mendatang</p>
                </div>
                {upcomingPOs.slice(0, 3).map(o => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, padding: '3px 0', color: '#78350f' }}>
                    <span>{o.nama}</span><span>Kirim: {o.tgl_kirim}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════ PEMBELIAN ══════════ */}
        {activeTab === 'pembelian' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <div className="summary-dark" style={{ borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginBottom: 3 }}>Total Pengeluaran</p>
              <p style={{ fontSize: 24, fontWeight: 900, color: '#fbbf24' }}>{formatRupiah(filteredPurchases.reduce((a, p) => a + (p.total_harga || 0), 0))}</p>
              <p style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>{filteredPurchases.length} transaksi</p>
            </div>
            <button className="add-cta" onClick={() => setActiveModal('beli')}><Plus size={14} /> Tambah Pembelian</button>
            {filteredPurchases.length === 0 ? (
              <div className="empty-state"><ShoppingBag size={30} /><p>Belum ada pembelian</p></div>
            ) : filteredPurchases.map(p => (
              <div key={p.id} className="card" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 36, height: 36, background: p.is_expense_only ? '#fef3c7' : '#eff6ff', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {p.is_expense_only ? <Receipt size={15} color="#d97706" /> : <ShoppingBag size={15} color="#2563eb" />}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{p.nama_barang}</p>
                    {p.supplier && <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>dari {p.supplier}</p>}
                    <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{p.is_expense_only ? 'Pengeluaran' : `${p.jumlah} ${p.satuan}`} · {friendlyDate(p.tanggal)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <p style={{ fontWeight: 800, fontSize: 12 }}>{formatRupiah(p.total_harga)}</p>
                  <button onClick={() => { setEditingTransaction({ ...p, _newDate: p.tanggal }); setActiveModal('editTanggalBeli'); }} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, padding: 5, cursor: 'pointer', color: '#9ca3af', display: 'flex' }}><Edit2 size={12} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══════════ GUDANG ══════════ */}
        {activeTab === 'gudang' && (
          <div>
            {subTabGudang === 'stok' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {/* Type chips */}
                <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2 }}>
                  {Object.entries(INVENTORY_TYPES).map(([type, cfg]) => (
                    <div key={type} style={{ background: cfg.bg, borderRadius: 11, padding: '8px 13px', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <cfg.icon size={13} color={cfg.color} />
                      <span style={{ fontWeight: 700, fontSize: 11, color: cfg.color }}>{cfg.label}</span>
                      <span style={{ fontWeight: 900, fontSize: 15, color: '#111' }}>{inventory.filter(i => i.type === type).length}</span>
                    </div>
                  ))}
                </div>
                <button className="add-cta" onClick={() => setActiveModal('produksi')}><ChefHat size={14} /> Mulai Produksi</button>
                {inventory.map(item => {
                  const cfg = INVENTORY_TYPES[item.type] || INVENTORY_TYPES.raw;
                  return (
                    <div key={item.id} className="card" style={{ padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, background: cfg.bg, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <cfg.icon size={15} color={cfg.color} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                            <p style={{ fontWeight: 700, fontSize: 13 }}>{item.nama}</p>
                            <span className={`badge ${item.type === 'finished' ? 'badge-green' : item.type === 'semi' ? 'badge-teal' : 'badge-blue'}`}>{cfg.short}</span>
                          </div>
                          {item.type === 'finished' && (() => {
                            const hpp = hppMap[item.id];
                            return (
                              <div>
                                {item.harga > 0
                                  ? <p style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>{formatRupiah(item.harga)}</p>
                                  : <p style={{ fontSize: 10, color: '#ef4444', fontWeight: 600 }}>⚠ Belum ada harga</p>
                                }
                                {hpp ? (
                                  <div style={{ display: 'flex', gap: 5, marginTop: 2, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 9, fontWeight: 600, color: '#9ca3af' }}>
                                      HPP ~{formatRupiah(Math.round(hpp.hpp))}
                                    </span>
                                    {item.harga > 0 && hpp.marginPct !== null && (
                                      <span style={{
                                        fontSize: 9, fontWeight: 800, padding: '1px 5px', borderRadius: 99,
                                        background: hpp.margin >= 0 ? '#f0fdf4' : '#fef2f2',
                                        color:      hpp.margin >= 0 ? '#16a34a' : '#ef4444',
                                      }}>
                                        {hpp.margin >= 0 ? '+' : ''}{Math.round(hpp.marginPct)}%
                                      </span>
                                    )}
                                    {hpp.incomplete && (
                                      <span style={{ fontSize: 9, color: '#f59e0b', fontWeight: 600 }}>⚠ estimasi</span>
                                    )}
                                  </div>
                                ) : (
                                  item.harga > 0 && <p style={{ fontSize: 9, color: '#d1d5db', fontWeight: 500, marginTop: 2 }}>Belum ada resep</p>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 19, fontWeight: 900, color: item.stok <= 0 ? '#ef4444' : '#0f1130' }}>{item.stok}</p>
                          <p style={{ fontSize: 9, fontWeight: 600, color: '#9ca3af' }}>{item.satuan}</p>
                        </div>
                        {item.type === 'finished' && (
                          <button onClick={() => { setSelectedItem(item); setPriceForm({ harga: item.harga || '' }); setActiveModal('setHarga'); }} style={{ background: '#fffbeb', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#d97706', display: 'flex' }}><Wallet size={13} /></button>
                        )}
                        <button onClick={() => { setSelectedItem(item); setRemovalForm({ alasan: 'Rusak', qty: 1 }); setActiveModal('remove'); }} style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {subTabGudang === 'resep' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <button className="add-cta" onClick={() => setActiveModal('resep')}><Plus size={14} /> Tambah Resep</button>
                {recipes.map(r => {
                  const outputs = r.recipe_outputs || [];
                  return (
                    <div key={r.id} className="card" style={{ padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                        <Utensils size={14} color="#d97706" />
                        <p style={{ fontWeight: 800, fontSize: 13, flex: 1 }}>{r.nama}</p>
                      </div>
                      {/* Outputs */}
                      {outputs.length > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <p style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>Output</p>
                          {outputs.map((out, i) => (
                            <span key={i} className="badge badge-green" style={{ marginRight: 4, marginBottom: 3, fontSize: 10 }}>{out.qty} {out.satuan} {out.inventory_item_name}</span>
                          ))}
                        </div>
                      )}
                      {/* Ingredients */}
                      <div style={{ background: '#f9fafb', borderRadius: 9, padding: 9 }}>
                        {(r.recipe_ingredients || []).map((ing, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, padding: '3px 0', borderBottom: i < (r.recipe_ingredients?.length || 0) - 1 ? '1px solid #f3f4f6' : 'none', color: '#374151' }}>
                            <span>{ing.nama_bahan}</span><span style={{ fontWeight: 800 }}>{ing.qty} {ing.satuan}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {recipes.length === 0 && <div className="empty-state"><Utensils size={26} /><p>Belum ada resep</p></div>}
              </div>
            )}

            {subTabGudang === 'riwayat' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {logs.map(log => (
                  <div key={log.id} className="card" style={{ padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 9, background: log.type === 'PRODUKSI' ? '#fffbeb' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {log.type === 'PRODUKSI' ? <ChefHat size={14} color="#d97706" /> : <Trash2 size={14} color="#ef4444" />}
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 600 }}>{log.detail}</p>
                      <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>{log.type} · {friendlyDate(log.tanggal)}</p>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && <div className="empty-state"><BookOpen size={26} /><p>Belum ada riwayat</p></div>}
              </div>
            )}
          </div>
        )}

        {/* ══════════ PENJUALAN ══════════ */}
        {activeTab === 'penjualan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="summary-dark" style={{ borderRadius: 14, padding: '14px 16px' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginBottom: 3 }}>Penjualan Lunas</p>
              <p style={{ fontSize: 24, fontWeight: 900, color: '#86efac' }}>
                {formatRupiah(filteredOrders.filter(o => o.status_bayar === 'Lunas').reduce((a, o) => a + (o.total || 0), 0))}
              </p>
            </div>
            <button className="add-cta" onClick={() => { setOrderStep(1); setActiveModal('newOrder'); }}><Plus size={14} /> Buat Pesanan Baru</button>

            {/* Hari Ini */}
            {subTabJual === 'hari_ini' && (() => {
              const list = filteredOrders.filter(o => !o.is_po && o.tgl_kirim <= todayStr());
              return list.length === 0 ? <div className="empty-state"><ShoppingCart size={26} /><p>Belum ada pesanan hari ini</p></div>
                : list.map(order => <OrderCard key={order.id} order={order} payments={orderPayments.filter(p => p.order_id === order.id)} onPayment={openPayModal} onInvoice={openInvoice} onWA={sendWhatsApp} onCancel={cancelOrder} onEdit={openEditOrder} />);
            })()}

            {/* Pre-Order */}
            {subTabJual === 'pre_order' && (
              upcomingPOs.length === 0 ? <div className="empty-state"><Clock size={26} /><p>Tidak ada pre-order</p></div>
                : upcomingPOs.map(order => <OrderCard key={order.id} order={order} payments={orderPayments.filter(p => p.order_id === order.id)} onPayment={openPayModal} onInvoice={openInvoice} onWA={sendWhatsApp} onCancel={cancelOrder} onEdit={openEditOrder} />)
            )}

            {/* Semua */}
            {subTabJual === 'semua' && (
              filteredOrders.length === 0 ? <div className="empty-state"><ShoppingCart size={26} /><p>Belum ada pesanan</p></div>
                : filteredOrders.map(order => <OrderCard key={order.id} order={order} payments={orderPayments.filter(p => p.order_id === order.id)} onPayment={openPayModal} onInvoice={openInvoice} onWA={sendWhatsApp} onCancel={cancelOrder} onEdit={openEditOrder} />)
            )}
          </div>
        )}

        {/* ══════════ PELANGGAN ══════════ */}
        {activeTab === 'pelanggan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Search */}
            <div className="search-bar"><Search size={14} color="#9ca3af" /><input placeholder="Cari nama atau WA..." value={searchCustomer} onChange={e => setSearchCustomer(e.target.value)} /></div>
            {/* Type filter */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
              {['Semua', ...CUSTOMER_TYPES].map(t => (
                <button key={t} onClick={() => setCustTypeFilter(t)} style={{ flexShrink: 0, border: 'none', borderRadius: 99, padding: '5px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer', background: custTypeFilter === t ? '#0f1130' : 'white', color: custTypeFilter === t ? 'white' : '#6b7280', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>{t}</button>
              ))}
            </div>
            <button className="add-cta" onClick={() => { setCustomerForm(emptyCustomerForm); setSelectedItem(null); setActiveModal('customer'); }}><Plus size={14} /> Tambah Pelanggan</button>
            {filteredCustomers.length === 0 ? <div className="empty-state"><Users size={26} /><p>Belum ada pelanggan</p></div>
              : filteredCustomers.map(cust => {
                const style = custTypeStyle(cust.customer_type);
                const initials = cust.nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
                return (
                  <div key={cust.id} className="customer-card">
                    <div className="customer-avatar" style={{ background: style.avatar, color: style.color }}>{initials}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                        <p style={{ fontWeight: 700, fontSize: 13 }}>{cust.nama}</p>
                        <span className="badge" style={{ background: style.bg, color: style.color }}>{cust.customer_type}</span>
                      </div>
                      {cust.wa && <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500 }}>📞 {cust.wa}</p>}
                      {cust.alamat && <p style={{ fontSize: 10, color: '#9ca3af', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {cust.alamat}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                      <button onClick={() => { setOrderStep1({ ...emptyOrderStep1, customer_id: cust.id, nama: cust.nama, wa: cust.wa || '', alamat: cust.alamat || '', customer_type: cust.customer_type }); setSelectedCust(cust); setOrderStep(1); setActiveModal('newOrder'); }} style={{ background: '#f0fdf4', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#16a34a', display: 'flex' }}><ShoppingCart size={13} /></button>
                      <button onClick={() => { setSelectedItem(cust); setCustomerForm({ nama: cust.nama, wa: cust.wa || '', alamat: cust.alamat || '', customer_type: cust.customer_type, notes: cust.notes || '' }); setActiveModal('customer'); }} style={{ background: '#eff6ff', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#2563eb', display: 'flex' }}><Edit2 size={13} /></button>
                      <button onClick={() => handleDeleteCustomer(cust)} style={{ background: '#fef2f2', border: 'none', borderRadius: 8, padding: 7, cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* ══════════ JADWAL KIRIM ══════════ */}
        {activeTab === 'jadwal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {/* Calendar toggle */}
            <button onClick={() => setCalendarOpen(p => !p)} style={{ width: '100%', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 13, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 700, fontSize: 12, color: '#0f1130', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}><Calendar size={14} color="#2563eb" /> {selectedCalDay ? `📅 ${selectedCalDay}` : 'Lihat Kalender'}</div>
              <ChevronDown size={13} style={{ transform: calendarOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s', color: '#9ca3af' }} />
            </button>

            {calendarOpen && (
              <div className="card" style={{ padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 11 }}>
                  <button onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, padding: '4px 11px', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#374151' }}>‹</button>
                  <p style={{ fontWeight: 800, fontSize: 12 }}>{MONTHS_ID[calendarDate.getMonth()]} {calendarDate.getFullYear()}</p>
                  <button onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, padding: '4px 11px', cursor: 'pointer', fontWeight: 700, fontSize: 14, color: '#374151' }}>›</button>
                </div>
                <div className="cal-grid" style={{ marginBottom: 5 }}>
                  {DAYS_ID.map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 9, fontWeight: 800, color: '#9ca3af', padding: '2px 0' }}>{d}</div>)}
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
              <div className="empty-state"><Coffee size={28} /><p>Tidak ada jadwal kirim</p></div>
            ) : deliveryList.map(order => (
              <div key={order.id} className="card" style={{ padding: 14, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: order.delivery_status === 'Selesai' ? '#16a34a' : order.delivery_status === 'Dikirim' ? '#f59e0b' : '#e5e7eb', borderRadius: '2px 0 0 2px' }} />
                <div style={{ paddingLeft: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
                        <p style={{ fontWeight: 800, fontSize: 13 }}>{order.nama}</p>
                        {order.is_po && <span className="po-tag"><Clock size={9} /> PO</span>}
                      </div>
                      {order.alamat && <p style={{ fontSize: 10, color: '#9ca3af' }}><MapPin size={9} style={{ display: 'inline' }} /> {order.alamat}</p>}
                      <p style={{ fontSize: 10, color: '#9ca3af', marginTop: 1 }}>Kirim: {order.tgl_kirim}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
                      <span className={`badge ${order.status_bayar === 'Lunas' ? 'badge-green' : 'badge-red'}`}>{order.status_bayar}</span>
                      <button onClick={() => sendWhatsApp(order)} style={{ background: '#f0fdf4', border: 'none', borderRadius: 7, padding: '4px 9px', cursor: 'pointer', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700 }}><Send size={11} /> WA</button>
                    </div>
                  </div>
                  <div className="status-chips">
                    {['Menunggu','Dikirim','Selesai'].map(s => (
                      <button key={s} onClick={() => updateDeliveryStatus(order.id, s)} className="status-chip" style={{ background: order.delivery_status === s ? (s === 'Selesai' ? '#16a34a' : s === 'Dikirim' ? '#f59e0b' : '#0f1130') : '#f3f4f6', color: order.delivery_status === s ? 'white' : '#9ca3af' }}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* BOTTOM NAV */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 640, margin: '0 auto', background: 'white', borderTop: '1px solid #e5e7eb', padding: '7px 6px 18px', display: 'flex', justifyContent: 'space-around', zIndex: 50 }}>
        {[
          { key: 'ringkasan', icon: <BarChart2 size={20} />, label: 'Ringkasan' },
          { key: 'pembelian', icon: <ShoppingBag size={20} />, label: 'Beli' },
          { key: 'gudang',    icon: <Package size={20} />,    label: 'Gudang' },
          { key: 'penjualan', icon: <ShoppingCart size={20} />,label: 'Jual' },
          { key: 'pelanggan', icon: <Users size={20} />,      label: 'Pelanggan' },
          { key: 'jadwal',    icon: <Truck size={20} />,      label: 'Jadwal' },
        ].map(({ key, icon, label }) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`nav-item ${activeTab === key ? 'active' : ''}`}>
            {icon}<span>{label}</span>
          </button>
        ))}
      </nav>

      {/* ═══════════════ MODALS ═══════════════ */}

      {/* SETTINGS */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="modal-title" style={{ marginBottom: 0 }}>Profil UMKM</h3>
              <button onClick={() => setShowSettings(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, marginBottom: 16 }}>{user.email}</p>
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

      {/* NEW ORDER — 2-step */}
      {activeModal === 'newOrder' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 className="modal-title" style={{ marginBottom: 0 }}>Order Baru</h3>
              <button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, marginTop: 10 }}>
              {[1, 2].map(step => (
                <React.Fragment key={step}>
                  <div className="step-dot" style={{ background: orderStep >= step ? '#0f1130' : '#f3f4f6', color: orderStep >= step ? 'white' : '#9ca3af' }}>{step}</div>
                  {step < 2 && <div className="step-line" style={{ background: orderStep > step ? '#0f1130' : '#e5e7eb' }} />}
                </React.Fragment>
              ))}
              <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginLeft: 4 }}>{orderStep === 1 ? 'Detail Pelanggan' : 'Pilih Produk'}</span>
            </div>

            {orderStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {/* Customer directory shortcut */}
                {customers.length > 0 && (
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: 10 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Dari Direktori</p>
                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                      {customers.slice(0, 8).map(c => {
                        const sty = custTypeStyle(c.customer_type);
                        const isSelected = orderStep1.customer_id === c.id;
                        return (
                          <button key={c.id} onClick={() => { setOrderStep1(prev => ({ ...prev, customer_id: c.id, nama: c.nama, wa: c.wa || '', alamat: c.alamat || '', customer_type: c.customer_type })); setSelectedCust(c); }} style={{ flexShrink: 0, border: `1.5px solid ${isSelected ? sty.color : '#e5e7eb'}`, borderRadius: 9, padding: '6px 10px', background: isSelected ? sty.bg : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: isSelected ? sty.color : '#0f1130' }}>{c.nama.split(' ')[0]}</span>
                            <span style={{ fontSize: 9, color: isSelected ? sty.color : '#9ca3af', fontWeight: 600 }}>{c.customer_type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div><label className="label">Nama Pelanggan *</label><input required className="input" placeholder="Nama pembeli" value={orderStep1.nama} onChange={e => setOrderStep1({ ...orderStep1, nama: e.target.value })} /></div>
                <div><label className="label">No. WhatsApp</label><input className="input" placeholder="628xxxxxxxxx" value={orderStep1.wa} onChange={e => setOrderStep1({ ...orderStep1, wa: e.target.value })} /></div>
                <div><label className="label">Alamat Pengiriman</label><textarea className="input" rows={2} style={{ resize: 'none' }} value={orderStep1.alamat} onChange={e => setOrderStep1({ ...orderStep1, alamat: e.target.value })} /></div>
                <div className="input-row input-row-2">
                  <div><label className="label">Tipe Pelanggan</label><select className="input" value={orderStep1.customer_type} onChange={e => setOrderStep1({ ...orderStep1, customer_type: e.target.value })}>{CUSTOMER_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                  <div><label className="label">Ongkir (Rp)</label><input type="number" className="input" placeholder="0" value={orderStep1.ongkir} onChange={e => setOrderStep1({ ...orderStep1, ongkir: e.target.value })} /></div>
                </div>
                <div className="input-row input-row-2">
                  <div><label className="label">Tgl Order</label><input type="date" className="input" value={orderStep1.tgl_order} onChange={e => setOrderStep1({ ...orderStep1, tgl_order: e.target.value })} /></div>
                  <div><label className="label">Tgl Kirim</label><input type="date" className="input" value={orderStep1.tgl_kirim} onChange={e => setOrderStep1({ ...orderStep1, tgl_kirim: e.target.value })} /></div>
                </div>
                {orderStep1.tgl_kirim > todayStr() && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9, padding: 9, fontSize: 11, fontWeight: 600, color: '#92400e', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={12} /> Tanggal kirim di masa depan — dicatat sebagai Pre-Order
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
                      <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: inCart ? '#f0fdf4' : '#f9fafb', borderRadius: 11, padding: '9px 12px', border: `1.5px solid ${inCart ? '#bbf7d0' : 'transparent'}` }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 12 }}>{prod.nama}</p>
                          <p style={{ fontSize: 10, color: prod.harga ? '#16a34a' : '#ef4444', fontWeight: 600 }}>{prod.harga ? formatRupiah(prod.harga) : '⚠ Set harga dulu'}</p>
                          <p style={{ fontSize: 9, color: '#9ca3af' }}>Stok: {prod.stok} {prod.satuan}</p>
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
                  {inventory.filter(i => i.type === 'finished').length === 0 && <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '18px 0' }}>Belum ada produk siap jual</p>}
                </div>
                {cart.length > 0 && (
                  <div style={{ background: '#0f1130', borderRadius: 13, padding: '13px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>Total{Number(orderStep1.ongkir) > 0 ? ` + ongkir ${formatRupiah(Number(orderStep1.ongkir))}` : ''}</p>
                      <p style={{ fontSize: 17, fontWeight: 900, color: '#fbbf24' }}>{formatRupiah(cart.reduce((a, b) => a + b.qty * (b.harga || 0), 0) + (Number(orderStep1.ongkir) || 0))}</p>
                    </div>
                    <button type="submit" disabled={isSaving || cart.length === 0} style={{ background: '#fbbf24', color: '#0f1130', border: 'none', borderRadius: 11, padding: '11px 18px', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
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
              <h3 className="modal-title" style={{ marginBottom: 0 }}>{selectedItem ? 'Edit Pelanggan' : 'Tambah Pelanggan'}</h3>
              <button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            <form onSubmit={handleSaveCustomer} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div><label className="label">Nama *</label><input required className="input" placeholder="Nama pelanggan" value={customerForm.nama} onChange={e => setCustomerForm({ ...customerForm, nama: e.target.value })} /></div>
              <div className="input-row input-row-2">
                <div><label className="label">Tipe</label><select className="input" value={customerForm.customer_type} onChange={e => setCustomerForm({ ...customerForm, customer_type: e.target.value })}>{CUSTOMER_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label className="label">No. WhatsApp</label><input className="input" placeholder="628xxx" value={customerForm.wa} onChange={e => setCustomerForm({ ...customerForm, wa: e.target.value })} /></div>
              </div>
              <div><label className="label">Alamat</label><textarea className="input" rows={2} style={{ resize: 'none' }} placeholder="Alamat pengiriman" value={customerForm.alamat} onChange={e => setCustomerForm({ ...customerForm, alamat: e.target.value })} /></div>
              <div><label className="label">Catatan</label><input className="input" placeholder="Catatan tambahan" value={customerForm.notes} onChange={e => setCustomerForm({ ...customerForm, notes: e.target.value })} /></div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="modal-title" style={{ marginBottom: 0 }}>Tambah Pembelian</h3>
              <button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            {/* Toggle expense only */}
            <div style={{ display: 'flex', gap: 7, marginBottom: 14 }}>
              {[{ label: '📦 Beli Bahan', val: false }, { label: '💸 Pengeluaran', val: true }].map(opt => (
                <button key={String(opt.val)} type="button" onClick={() => setPurchaseForm({ ...purchaseForm, is_expense_only: opt.val })} style={{ flex: 1, border: `1.5px solid ${purchaseForm.is_expense_only === opt.val ? '#0f1130' : '#e5e7eb'}`, borderRadius: 9, padding: '8px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: purchaseForm.is_expense_only === opt.val ? '#0f1130' : 'white', color: purchaseForm.is_expense_only === opt.val ? 'white' : '#6b7280' }}>{opt.label}</button>
              ))}
            </div>
            <form onSubmit={handleAddPurchase} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div><label className="label">{purchaseForm.is_expense_only ? 'Nama Pengeluaran' : 'Nama Barang'}</label>
                {!purchaseForm.is_expense_only && inventory.filter(i => i.type === 'raw').length > 0 ? (
                  <select className="input" value={purchaseForm.nama_barang} onChange={e => { const val = e.target.value; const existing = inventory.find(i => i.nama === val); setPurchaseForm(prev => ({ ...prev, nama_barang: val, satuan: existing ? existing.satuan : prev.satuan })); }}>
                    <option value="">-- Pilih atau ketik baru --</option>
                    {[...new Set(inventory.filter(i => i.type === 'raw').map(i => i.nama))].map(n => <option key={n} value={n}>{n}</option>)}
                    <option value="__new__">+ Tambah bahan baru...</option>
                  </select>
                ) : null}
                {(purchaseForm.nama_barang === '__new__' || purchaseForm.is_expense_only || inventory.filter(i => i.type === 'raw').length === 0) && (
                  <input required className="input" style={{ marginTop: purchaseForm.nama_barang === '__new__' ? 7 : 0 }} placeholder={purchaseForm.is_expense_only ? 'Gas, packaging, dll' : 'Tepung Terigu'} value={purchaseForm.nama_barang === '__new__' ? '' : purchaseForm.nama_barang} onChange={e => setPurchaseForm({ ...purchaseForm, nama_barang: e.target.value })} />
                )}
              </div>
              <div><label className="label">Supplier / Toko</label><input className="input" placeholder="Dari mana belinya?" value={purchaseForm.supplier} onChange={e => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })} /></div>
              <div className="input-row input-row-2">
                <div><label className="label">Jumlah</label><input required type="number" className="input" placeholder="0" value={purchaseForm.jumlah} onChange={e => setPurchaseForm({ ...purchaseForm, jumlah: e.target.value })} /></div>
                <div><label className="label">Satuan</label><select className="input" value={purchaseForm.satuan} onChange={e => setPurchaseForm({ ...purchaseForm, satuan: e.target.value })}>{SATUAN_OPTIONS.map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div><label className="label">Harga Satuan (Rp)</label><input required type="number" className="input" placeholder="0" value={purchaseForm.harga_satuan} onChange={e => setPurchaseForm({ ...purchaseForm, harga_satuan: e.target.value })} /></div>
              {purchaseForm.jumlah && purchaseForm.harga_satuan && (
                <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 700, color: '#16a34a' }}>
                  Total: {formatRupiah(Number(purchaseForm.jumlah) * Number(purchaseForm.harga_satuan))}
                </div>
              )}
              <div><label className="label">Tanggal</label><input type="date" className="input" value={purchaseForm.tanggal} onChange={e => setPurchaseForm({ ...purchaseForm, tanggal: e.target.value })} /></div>
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Simpan'}</button>
            </form>
          </div>
        </div>
      )}

      {/* NEW INVENTORY ITEM MODAL */}
      {activeModal === 'newItem' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="modal-title" style={{ marginBottom: 0 }}>Tambah Item Inventori</h3>
              <button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            <form onSubmit={handleAddManualItem} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div><label className="label">Nama Item *</label><input required className="input" placeholder="Nama item" value={newItemForm.nama} onChange={e => setNewItemForm({ ...newItemForm, nama: e.target.value })} /></div>
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

      {/* RESEP MODAL — multi-output */}
      {activeModal === 'resep' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 className="modal-title" style={{ marginBottom: 0 }}>Tambah Resep</h3>
              <button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            <form onSubmit={handleAddRecipe} style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
              <div><label className="label">Nama Resep *</label><input required className="input" placeholder="Nama resep / proses produksi" value={recipeForm.nama} onChange={e => setRecipeForm({ ...recipeForm, nama: e.target.value })} /></div>

              {/* Outputs (multi) */}
              <div>
                <label className="label">Output yang Dihasilkan</label>
                {recipeForm.outputs.map((out, i) => (
                  <div key={i} style={{ background: '#f9fafb', borderRadius: 9, padding: 10, marginBottom: 7 }}>
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
                <button type="button" onClick={() => setRecipeForm({ ...recipeForm, outputs: [...recipeForm.outputs, { nama: '', jumlah_output: 1, satuan_output: 'pcs', type: 'finished' }] })} style={{ background: '#f0fdf4', color: '#16a34a', border: 'none', borderRadius: 8, padding: '6px 13px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Tambah Output</button>
              </div>

              {/* Ingredients */}
              <div>
                <label className="label">Bahan-bahan yang Digunakan</label>
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
                <button type="button" onClick={() => setRecipeForm({ ...recipeForm, ingredients: [...recipeForm.ingredients, { nama_bahan: '', qty: '', satuan: 'pcs' }] })} style={{ background: '#eff6ff', color: '#2563eb', border: 'none', borderRadius: 8, padding: '6px 13px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Tambah Bahan</button>
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
              <h3 className="modal-title" style={{ marginBottom: 0 }}>Mulai Produksi</h3>
              <button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>
            <form onSubmit={handleProduction} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div><label className="label">Resep / Produk</label>
                <select required className="input" value={prodForm.recipe_id} onChange={e => setProdForm({ ...prodForm, recipe_id: e.target.value })}>
                  <option value="">Pilih resep</option>
                  {recipes.map(r => <option key={r.id} value={r.id}>{r.nama}</option>)}
                </select>
              </div>
              <div><label className="label">Jumlah Batch</label><input required type="number" min={1} className="input" value={prodForm.qty} onChange={e => setProdForm({ ...prodForm, qty: e.target.value })} /></div>
              {prodForm.recipe_id && (() => {
                const r = recipes.find(x => x.id === Number(prodForm.recipe_id));
                if (!r) return null;
                const outs = r.recipe_outputs || [];
                return (
                  <div style={{ background: '#f0fdf4', borderRadius: 9, padding: '9px 12px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#16a34a', marginBottom: 4 }}>Output yang akan dihasilkan:</p>
                    {outs.map((out, i) => <p key={i} style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>→ {Number(prodForm.qty) * Number(out.qty)} {out.satuan} {out.inventory_item_name}</p>)}
                    {outs.length === 0 && <p style={{ fontSize: 11, color: '#9ca3af' }}>Tidak ada output terdefinisi</p>}
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
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 4 }}>Set Harga Jual</h3>
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
            <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14 }}>Edit Tanggal Pembelian</h3>
            <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 13 }}>{editingTransaction.nama_barang}</p>
            <form onSubmit={handleEditPurchaseDate} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div><label className="label">Tanggal</label><input type="date" className="input" value={editingTransaction._newDate} onChange={e => setEditingTransaction({ ...editingTransaction, _newDate: e.target.value })} /></div>
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? '...' : 'Simpan'}</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT ORDER — FULL (replaces date-only modal) */}
      {activeModal === 'editOrder' && editingTransaction && editOrderForm && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <h3 className="modal-title" style={{ marginBottom: 0 }}>Edit Pesanan</h3>
              <button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
            </div>

            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18, marginTop: 10 }}>
              {[1, 2].map(step => (
                <React.Fragment key={step}>
                  <div className="step-dot" style={{ background: editOrderStep >= step ? '#0f1130' : '#f3f4f6', color: editOrderStep >= step ? 'white' : '#9ca3af' }}>{step}</div>
                  {step < 2 && <div className="step-line" style={{ background: editOrderStep > step ? '#0f1130' : '#e5e7eb' }} />}
                </React.Fragment>
              ))}
              <span style={{ fontSize: 11, fontWeight: 600, color: '#9ca3af', marginLeft: 4 }}>{editOrderStep === 1 ? 'Detail Pesanan' : 'Edit Produk'}</span>
            </div>

            {/* STEP 1 — Order details */}
            {editOrderStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                {/* Customer shortcut */}
                {customers.length > 0 && (
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: 10 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '.06em' }}>Dari Direktori</p>
                    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
                      {customers.slice(0, 8).map(c => {
                        const sty = custTypeStyle(c.customer_type);
                        const isSelected = editOrderForm.customer_id === c.id;
                        return (
                          <button key={c.id} type="button" onClick={() => setEditOrderForm(prev => ({ ...prev, customer_id: c.id, nama: c.nama, wa: c.wa || '', alamat: c.alamat || '', customer_type: c.customer_type }))}
                            style={{ flexShrink: 0, border: `1.5px solid ${isSelected ? sty.color : '#e5e7eb'}`, borderRadius: 9, padding: '6px 10px', background: isSelected ? sty.bg : 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <span style={{ fontSize: 10, fontWeight: 800, color: isSelected ? sty.color : '#0f1130' }}>{c.nama.split(' ')[0]}</span>
                            <span style={{ fontSize: 9, color: isSelected ? sty.color : '#9ca3af', fontWeight: 600 }}>{c.customer_type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div><label className="label">Nama Pelanggan *</label><input required className="input" value={editOrderForm.nama} onChange={e => setEditOrderForm({ ...editOrderForm, nama: e.target.value })} /></div>
                <div><label className="label">No. WhatsApp</label><input className="input" value={editOrderForm.wa} onChange={e => setEditOrderForm({ ...editOrderForm, wa: e.target.value })} /></div>
                <div><label className="label">Alamat Pengiriman</label><textarea className="input" rows={2} style={{ resize: 'none' }} value={editOrderForm.alamat} onChange={e => setEditOrderForm({ ...editOrderForm, alamat: e.target.value })} /></div>
                <div className="input-row input-row-2">
                  <div><label className="label">Tipe Pelanggan</label>
                    <select className="input" value={editOrderForm.customer_type} onChange={e => setEditOrderForm({ ...editOrderForm, customer_type: e.target.value })}>
                      {CUSTOMER_TYPES.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Ongkir (Rp)</label><input type="number" className="input" placeholder="0" value={editOrderForm.ongkir} onChange={e => setEditOrderForm({ ...editOrderForm, ongkir: e.target.value })} /></div>
                </div>
                <div className="input-row input-row-2">
                  <div><label className="label">Tgl Order</label><input type="date" className="input" value={editOrderForm.tgl_order} onChange={e => setEditOrderForm({ ...editOrderForm, tgl_order: e.target.value })} /></div>
                  <div><label className="label">Tgl Kirim</label><input type="date" className="input" value={editOrderForm.tgl_kirim} onChange={e => setEditOrderForm({ ...editOrderForm, tgl_kirim: e.target.value })} /></div>
                </div>
                {editOrderForm.tgl_kirim > todayStr() && (
                  <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 9, padding: 9, fontSize: 11, fontWeight: 600, color: '#92400e', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <Clock size={12} /> Tanggal kirim di masa depan — akan disimpan sebagai Pre-Order
                  </div>
                )}
                <div className="input-row input-row-2">
                  <div><label className="label">Metode Bayar</label>
                    <select className="input" value={editOrderForm.metode_bayar} onChange={e => setEditOrderForm({ ...editOrderForm, metode_bayar: e.target.value })}>
                      {BAYAR_OPTIONS.map(b => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Status Bayar</label>
                    <select className="input" value={editOrderForm.status_bayar} onChange={e => setEditOrderForm({ ...editOrderForm, status_bayar: e.target.value })}>
                      <option>Belum Bayar</option><option>DP</option><option>Lunas</option>
                    </select>
                  </div>
                </div>
                <button className="btn btn-dark" onClick={() => { if (!editOrderForm.nama.trim()) { showToast('Isi nama pelanggan dulu', 'error'); return; } setEditOrderStep(2); }}>
                  Edit Produk <ArrowRight size={15} />
                </button>
              </div>
            )}

            {/* STEP 2 — Edit items */}
            {editOrderStep === 2 && (
              <form onSubmit={handleSaveEditOrder} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280' }}>Untuk: <strong style={{ color: '#0f1130' }}>{editOrderForm.nama}</strong> · Kirim: {editOrderForm.tgl_kirim}</p>

                {/* Currently in cart */}
                {editCart.length > 0 && (
                  <div style={{ background: '#f9fafb', borderRadius: 11, padding: '9px 12px' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 7 }}>Item di pesanan</p>
                    {editCart.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f3f4f6' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 12 }}>{item.nama}</p>
                          <p style={{ fontSize: 10, color: '#16a34a', fontWeight: 600 }}>{formatRupiah(item.harga)} / pcs</p>
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

                {/* Add from inventory */}
                <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em' }}>Tambah produk</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {inventory.filter(i => i.type === 'finished' && !editCart.find(c => c.id === i.id)).map(prod => (
                    <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb', borderRadius: 11, padding: '9px 12px' }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 12 }}>{prod.nama}</p>
                        <p style={{ fontSize: 10, color: prod.harga ? '#16a34a' : '#ef4444', fontWeight: 600 }}>{prod.harga ? formatRupiah(prod.harga) : '⚠ Set harga dulu'}</p>
                      </div>
                      <button type="button" onClick={() => addToEditCart(prod)} style={{ background: '#0f1130', color: 'white', border: 'none', borderRadius: 8, padding: '6px 12px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>+ Tambah</button>
                    </div>
                  ))}
                  {inventory.filter(i => i.type === 'finished').length === 0 && (
                    <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '12px 0' }}>Belum ada produk siap jual</p>
                  )}
                </div>

                {/* Total bar */}
                {editCart.length > 0 && (
                  <div style={{ background: '#0f1130', borderRadius: 13, padding: '13px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <div>
                      <p style={{ fontSize: 9, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>Total baru{Number(editOrderForm.ongkir) > 0 ? ` + ongkir ${formatRupiah(Number(editOrderForm.ongkir))}` : ''}</p>
                      <p style={{ fontSize: 17, fontWeight: 900, color: '#fbbf24' }}>{formatRupiah(editCart.reduce((a, b) => a + b.qty * (b.harga || 0), 0) + (Number(editOrderForm.ongkir) || 0))}</p>
                    </div>
                    <button type="submit" disabled={isSaving || editCart.length === 0} style={{ background: '#fbbf24', color: '#0f1130', border: 'none', borderRadius: 11, padding: '11px 18px', fontWeight: 800, fontSize: 12, cursor: 'pointer' }}>
                      {isSaving ? <Loader2 size={15} className="animate-spin" /> : 'Simpan Perubahan'}
                    </button>
                  </div>
                )}
                <button type="button" className="btn btn-ghost" onClick={() => setEditOrderStep(1)}>← Kembali</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PAYMENT LEDGER MODAL */}
      {activeModal === 'payment' && payingOrder && (() => {
        const payInfo = (() => {
          const payments = orderPayments.filter(p => p.order_id === payingOrder.id && p.type !== 'refund');
          const refunds  = orderPayments.filter(p => p.order_id === payingOrder.id && p.type === 'refund');
          const totalPaid = payments.reduce((a, p) => a + (p.amount || 0), 0)
                          - refunds.reduce((a, p) => a + (p.amount || 0), 0);
          return { totalPaid, remaining: Math.max(0, payingOrder.total - totalPaid) };
        })();
        const history = orderPayments
          .filter(p => p.order_id === payingOrder.id)
          .sort((a, b) => a.created_at?.localeCompare(b.created_at));
        return (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h3 className="modal-title" style={{ marginBottom: 0 }}>Catat Pembayaran</h3>
                <button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', display: 'flex' }}><X size={15} /></button>
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 14 }}>{payingOrder.nama}</p>

              {/* Payment summary bar */}
              <div style={{ background: '#f9fafb', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Total Pesanan</p>
                    <p style={{ fontSize: 15, fontWeight: 900, color: '#0f1130' }}>{formatRupiah(payingOrder.total)}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 2 }}>Sudah Dibayar</p>
                    <p style={{ fontSize: 15, fontWeight: 900, color: '#16a34a' }}>{formatRupiah(payInfo.totalPaid)}</p>
                  </div>
                </div>
                {payInfo.remaining > 0 && (
                  <div style={{ background: '#fef3c7', borderRadius: 8, padding: '7px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#92400e' }}>Sisa yang harus dibayar</span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: '#d97706' }}>{formatRupiah(payInfo.remaining)}</span>
                  </div>
                )}
                {payInfo.remaining <= 0 && payInfo.totalPaid > 0 && (
                  <div style={{ background: '#f0fdf4', borderRadius: 8, padding: '7px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle2 size={14} color="#16a34a" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>Lunas</span>
                  </div>
                )}
              </div>

              {/* Payment history */}
              {history.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Riwayat Pembayaran</p>
                  {history.map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: i < history.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: p.type === 'refund' ? '#ef4444' : '#0f1130' }}>
                          {p.type === 'refund' ? '− ' : '+ '}{formatRupiah(p.amount)}
                        </span>
                        <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 6 }}>{p.metode}</span>
                        {p.note && <span style={{ fontSize: 10, color: '#9ca3af', marginLeft: 6 }}>· {p.note}</span>}
                      </div>
                      <span style={{ fontSize: 10, color: '#9ca3af' }}>{friendlyDate(p.tanggal)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* New payment form — only show if not fully paid */}
              {payInfo.remaining > 0 && (
                <form onSubmit={handleAddPayment} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  <div style={{ height: 1, background: '#e5e7eb', marginBottom: 2 }} />
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em' }}>Catat Pembayaran Baru</p>
                  <div>
                    <label className="label">Jumlah Bayar (Rp)</label>
                    <input required type="number" className="input" placeholder={`Maks. ${formatRupiah(payInfo.remaining)}`}
                      value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
                    {paymentForm.amount && Number(paymentForm.amount) > 0 && (
                      <button type="button" onClick={() => setPaymentForm({ ...paymentForm, amount: String(payInfo.remaining) })}
                        style={{ marginTop: 5, background: 'none', border: 'none', color: '#2563eb', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                        Bayar semua sisa ({formatRupiah(payInfo.remaining)})
                      </button>
                    )}
                    {!paymentForm.amount && (
                      <button type="button" onClick={() => setPaymentForm({ ...paymentForm, amount: String(payInfo.remaining) })}
                        style={{ marginTop: 5, background: 'none', border: 'none', color: '#2563eb', fontSize: 11, fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                        Isi otomatis sisa ({formatRupiah(payInfo.remaining)})
                      </button>
                    )}
                  </div>
                  <div className="input-row input-row-2">
                    <div><label className="label">Metode</label>
                      <select className="input" value={paymentForm.metode} onChange={e => setPaymentForm({ ...paymentForm, metode: e.target.value })}>
                        {BAYAR_OPTIONS.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div><label className="label">Tanggal</label>
                      <input type="date" className="input" value={paymentForm.tanggal} onChange={e => setPaymentForm({ ...paymentForm, tanggal: e.target.value })} />
                    </div>
                  </div>
                  <div><label className="label">Catatan (opsional)</label>
                    <input className="input" placeholder="Misal: DP pertama, pelunasan, dll" value={paymentForm.note} onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })} />
                  </div>
                  <button type="submit" disabled={isSaving} className="btn btn-dark">
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Simpan Pembayaran'}
                  </button>
                </form>
              )}
              {payInfo.remaining <= 0 && payInfo.totalPaid > 0 && (
                <button onClick={closeModal} className="btn btn-ghost">Tutup</button>
              )}
            </div>
          </div>
        );
      })()}

      {/* INVOICE MODAL */}
      {activeModal === 'invoice' && invoiceOrder && (() => {
        const invPayments = orderPayments.filter(p => p.order_id === invoiceOrder.id);
        const totalPaid   = invPayments.reduce((a, p) => p.type === 'refund' ? a - p.amount : a + p.amount, 0);
        const remaining   = Math.max(0, (invoiceOrder.total || 0) - totalPaid);
        const displayStatus = totalPaid <= 0 ? 'Belum Bayar'
          : totalPaid >= (invoiceOrder.total || 0) ? 'Lunas' : 'DP';
        return (
          <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()} style={{ padding: '24px 20px 36px' }}>
              <div className="modal-handle" />

              {/* Invoice header */}
              <div style={{ textAlign: 'center', marginBottom: 18 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 3 }}>Nota Pesanan</p>
                <p style={{ fontSize: 18, fontWeight: 900, color: '#0f1130' }}>{profile?.nama_umkm || 'UMKM ERP'}</p>
                {profile?.domisili && <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>📍 {profile.domisili}</p>}
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1.5px dashed #e5e7eb', margin: '0 0 14px' }} />

              {/* Customer + order meta */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px', marginBottom: 14, fontSize: 12 }}>
                {[
                  ['Kepada',      invoiceOrder.nama],
                  ['Tgl Order',   invoiceOrder.tgl_order],
                  invoiceOrder.wa     ? ['WhatsApp', invoiceOrder.wa] : null,
                  ['Tgl Kirim',   invoiceOrder.tgl_kirim],
                  invoiceOrder.alamat ? ['Alamat', invoiceOrder.alamat] : null,
                  ['Metode Bayar', invoiceOrder.metode_bayar],
                ].filter(Boolean).map(([label, val]) => (
                  <div key={label}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 1 }}>{label}</p>
                    <p style={{ fontWeight: 600, color: '#0f1130', wordBreak: 'break-word' }}>{val}</p>
                  </div>
                ))}
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1.5px dashed #e5e7eb', margin: '0 0 12px' }} />

              {/* Line items */}
              <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 8 }}>Rincian Pesanan</p>
              <div style={{ marginBottom: 12 }}>
                {(invoiceOrder.order_items || []).map((it, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 600, fontSize: 13 }}>{it.nama}</p>
                      <p style={{ fontSize: 10, color: '#9ca3af' }}>{it.qty} × {formatRupiah(it.harga)}</p>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: 13 }}>{formatRupiah(it.qty * (it.harga || 0))}</p>
                  </div>
                ))}
                {invoiceOrder.ongkir > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', borderBottom: '1px solid #f3f4f6' }}>
                    <p style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>Ongkos kirim</p>
                    <p style={{ fontWeight: 600, fontSize: 12 }}>{formatRupiah(invoiceOrder.ongkir)}</p>
                  </div>
                )}
              </div>

              {/* Total */}
              <div style={{ background: '#0f1130', borderRadius: 12, padding: '12px 16px', marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: 'rgba(255,255,255,.7)' }}>Total</p>
                  <p style={{ fontWeight: 900, fontSize: 18, color: '#fbbf24' }}>{formatRupiah(invoiceOrder.total)}</p>
                </div>
                {/* Payment summary */}
                {totalPaid > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: 'rgba(255,255,255,.5)' }}>Sudah dibayar</span>
                      <span style={{ color: '#86efac', fontWeight: 700 }}>{formatRupiah(totalPaid)}</span>
                    </div>
                    {remaining > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 3 }}>
                        <span style={{ color: 'rgba(255,255,255,.5)' }}>Sisa</span>
                        <span style={{ color: '#fca5a5', fontWeight: 700 }}>{formatRupiah(remaining)}</span>
                      </div>
                    )}
                  </div>
                )}
                {/* Status badge */}
                <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 99, fontSize: 10, fontWeight: 800,
                    background: displayStatus === 'Lunas' ? '#f0fdf4' : displayStatus === 'DP' ? '#fffbeb' : '#fef2f2',
                    color:      displayStatus === 'Lunas' ? '#16a34a' : displayStatus === 'DP' ? '#d97706' : '#ef4444',
                  }}>{displayStatus === 'DP' ? `DP · Sisa ${formatRupiah(remaining)}` : displayStatus}</span>
                </div>
              </div>

              {/* Payment history if any */}
              {invPayments.length > 0 && (
                <div style={{ marginBottom: 14 }}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 6 }}>Riwayat Bayar</p>
                  {invPayments.map((p, i) => (
                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, padding: '4px 0', borderBottom: i < invPayments.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <span style={{ color: p.type === 'refund' ? '#ef4444' : '#374151', fontWeight: 600 }}>
                        {p.type === 'refund' ? '− ' : '+ '}{formatRupiah(p.amount)} · {p.metode}
                        {p.note ? ` · ${p.note}` : ''}
                      </span>
                      <span style={{ color: '#9ca3af' }}>{friendlyDate(p.tanggal)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  onClick={() => sendInvoiceWA(invoiceOrder, invPayments)}
                  className="btn btn-dark"
                  style={{ gap: 8 }}
                >
                  <Send size={15} /> Kirim via WhatsApp
                </button>
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
            <p style={{ fontWeight: 600, marginBottom: 14, fontSize: 13 }}>{selectedItem.nama} (stok: {selectedItem.stok} {selectedItem.satuan})</p>
            <form onSubmit={handleRemoveItem} style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
              <div><label className="label">Jumlah Dihapus</label><input required type="number" min={1} max={selectedItem.stok} className="input" value={removalForm.qty} onChange={e => setRemovalForm({ ...removalForm, qty: e.target.value })} /></div>
              <div><label className="label">Alasan</label><select className="input" value={removalForm.alasan} onChange={e => setRemovalForm({ ...removalForm, alasan: e.target.value })}><option>Rusak</option><option>Hilang</option><option>Expired</option><option>Terpakai Internal</option></select></div>
              <button type="submit" disabled={isSaving} className="btn btn-red">{isSaving ? '...' : 'Konfirmasi Hapus'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── ORDER CARD COMPONENT ──────────────────────────────────
const OrderCard = ({ order, payments = [], onPayment, onInvoice, onWA, onCancel, onEdit }) => {
  const totalPaid = payments
    .reduce((a, p) => p.type === 'refund' ? a - p.amount : a + p.amount, 0);
  const remaining = Math.max(0, (order.total || 0) - totalPaid);

  // Derive display status from payments (overrides order.status_bayar for display)
  const displayStatus = totalPaid <= 0 ? 'Belum Bayar'
    : totalPaid >= (order.total || 0) ? 'Lunas' : 'DP';

  const statusBadge = () => {
    if (displayStatus === 'Lunas')
      return <span className="badge badge-green">Lunas</span>;
    if (displayStatus === 'DP')
      return (
        <span style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'2px 8px', borderRadius:99, fontSize:10, fontWeight:700, background:'#fffbeb', color:'#d97706', border:'1px solid #fde68a' }}>
          {formatRupiah(totalPaid)} / {formatRupiah(order.total)}
        </span>
      );
    return <span className="badge badge-red">Belum Bayar</span>;
  };

  const accentColor = displayStatus === 'Lunas' ? '#16a34a'
    : displayStatus === 'DP' ? '#f59e0b' : '#e5e7eb';

  return (
    <div style={{ background: 'white', borderRadius: 14, padding: 14, marginBottom: 9, boxShadow: '0 1px 3px rgba(15,17,48,.06)', border: '1px solid #e5e7eb', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: accentColor, borderRadius: '2px 0 0 2px' }} />
      <div style={{ paddingLeft: 9 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
              <p style={{ fontWeight: 800, fontSize: 13 }}>{order.nama}</p>
              {order.is_po && <span className="po-tag"><Clock size={9} /> PO</span>}
              {order.customer_type && order.customer_type !== 'Konsumen' && <span className="badge badge-purple" style={{ fontSize: 9 }}>{order.customer_type}</span>}
            </div>
            <p style={{ fontSize: 10, color: '#9ca3af' }}>Order: {friendlyDate(order.tgl_order)} · Kirim: {order.tgl_kirim}</p>
          </div>
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {statusBadge()}
            <button onClick={() => onEdit(order)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 6, padding: 4, cursor: 'pointer', color: '#9ca3af', display: 'flex' }}><Edit2 size={11} /></button>
          </div>
        </div>
        <div style={{ background: '#f9fafb', borderRadius: 9, padding: '8px 11px', marginBottom: 8 }}>
          {(order.order_items || []).map((it, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600, padding: '2px 0', color: '#374151' }}>
              <span>{it.qty}x {it.nama}</span><span>{formatRupiah(it.qty * (it.harga || 0))}</span>
            </div>
          ))}
          {order.ongkir > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 600, padding: '2px 0', color: '#9ca3af', borderTop: '1px solid #f3f4f6', marginTop: 3 }}><span>Ongkir</span><span>{formatRupiah(order.ongkir)}</span></div>}
          <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 5, paddingTop: 5, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 12 }}>
            <span>Total</span><span>{formatRupiah(order.total)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {displayStatus !== 'Lunas' && (
            <button onClick={() => onPayment(order)} style={{ flex: 1, background: displayStatus === 'DP' ? '#fffbeb' : '#f0fdf4', border: 'none', borderRadius: 9, padding: '7px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: displayStatus === 'DP' ? '#d97706' : '#16a34a' }}>
              💳 {displayStatus === 'DP' ? `Sisa ${formatRupiah(remaining)}` : 'Catat Bayar'}
            </button>
          )}
          <button onClick={() => onWA(order)} style={{ background: '#f0fdf4', border: 'none', borderRadius: 9, padding: '7px 11px', cursor: 'pointer', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 3 }}><Send size={13} /></button>
          <button onClick={() => onInvoice(order)} style={{ background: '#eff6ff', border: 'none', borderRadius: 9, padding: '7px 11px', cursor: 'pointer', color: '#2563eb', display: 'flex', alignItems: 'center', gap: 3 }} title="Lihat nota"><FileText size={13} /></button>
          <button onClick={() => onCancel(order)} style={{ background: '#fef2f2', border: 'none', borderRadius: 9, padding: '7px 11px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Trash2 size={13} /></button>
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
