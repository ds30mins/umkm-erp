import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Plus, ShoppingBag, Package, X, CheckCircle2, Loader2, ChefHat,
  FlaskConical, Trash2, Utensils, ShoppingCart,
  MapPin, Calendar, Truck, Send, Clock, ChevronDown,
  Minus, Coffee, Settings, BarChart2, TrendingUp, TrendingDown,
  Wallet, Edit2, AlertCircle, LogOut, Eye, EyeOff,
  Store, CheckCircle, ArrowRight, Layers, Box, Wheat
} from 'lucide-react';

// ─── SUPABASE CLIENT ───────────────────────────────────────────────────────────
const SUPABASE_URL = 'https://fyvhopsnfzbhmfdrmtbt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5dmhvcHNuZnpiaG1mZHJtdGJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4ODE4NjgsImV4cCI6MjA5MTQ1Nzg2OH0.mt4do01YLwWhSW_b8E1PqrdtwY_7m0tRbBagoJmWs8k';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);
const todayStr = () => new Date().toISOString().split('T')[0];
const friendlyDate = (d) => { try { return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return '-'; } };
const slugify = (s) => s.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');

const INVENTORY_TYPES = {
  raw: { label: 'Baku', short: 'Baku', color: '#3b82f6', bg: '#eff6ff', icon: Wheat },
  semi: { label: '½ Jadi', short: '½ Jadi', color: '#8b5cf6', bg: '#f5f3ff', icon: Layers },
  finished: { label: 'Produk', short: 'Produk', color: '#16a34a', bg: '#f0fdf4', icon: Box },
};

// ─── THEME ─────────────────────────────────────────────────────────────────────
const THEME = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
  :root {
    --navy: #111827; --navy-mid: #1f2937; --navy-light: #374151;
    --blue: #3b82f6; --blue-soft: #dbeafe;
    --yellow: #fde047; --yellow-bg: #fefce8; --yellow-dark: #ca8a04;
    --purple: #8b5cf6; --purple-bg: #f5f3ff;
    --red: #ef4444; --red-light: #fef2f2;
    --green: #16a34a; --green-light: #f0fdf4;
    --bg: #f9fafb; --card: #ffffff; --text: #111827;
    --muted: #6b7280; --border: #e5e7eb; --border-strong: #d1d5db;
    --radius: 18px; --radius-sm: 12px;
    --shadow: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04);
    --shadow-lg: 0 12px 40px rgba(0,0,0,0.12);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
  html { overflow-y: scroll; }, body { background: var(--bg); font-family: 'DM Sans', sans-serif; color: var(--text); font-size: 15px; -webkit-font-smoothing: antialiased; max-width: 640px; margin: 0 auto; }
  .font-display { font-family: 'DM Sans', sans-serif; }

  /* Scrollbars */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 4px; }

  /* Modal */
  .modal-overlay { position: fixed; inset: 0; z-index: 150; background: rgba(17,24,39,0.55); backdrop-filter: blur(8px); display: flex; align-items: flex-end; padding: 0; }
  @media (min-width: 640px) { .modal-overlay { align-items: center; justify-content: center; } .modal-sheet { max-width: 500px !important; border-radius: var(--radius) !important; margin: 0 auto; } }
  .modal-sheet { background: white; width: 100%; border-radius: 28px 28px 0 0; padding: 28px 24px 40px; max-height: 92vh; overflow-y: auto; animation: slideUp 0.28s cubic-bezier(0.32, 0.72, 0, 1); }
  .modal-handle { width: 36px; height: 4px; background: var(--border-strong); border-radius: 99px; margin: 0 auto 20px; }
  
  @keyframes slideUp { from { transform: translateY(48px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
  .animate-spin { animation: spin 1s linear infinite; }
  .animate-fade { animation: fadeUp 0.35s ease forwards; }

  /* Cards */
  .card { background: white; border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow); }
  .card-hover { transition: box-shadow 0.15s, transform 0.1s; cursor: pointer; }
  .card-hover:active { transform: scale(0.99); box-shadow: var(--shadow); }

  /* Buttons */
  .btn { border: none; border-radius: var(--radius-sm); padding: 14px 22px; font-weight: 700; font-size: 14px; cursor: pointer; width: 100%; letter-spacing: 0.01em; font-family: 'DM Sans', sans-serif; transition: opacity 0.15s, transform 0.1s, box-shadow 0.15s; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .btn:active { transform: scale(0.98); }
  .btn:disabled { opacity: 0.45; cursor: not-allowed; }
  .btn-dark { background: var(--navy); color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .btn-dark:hover { background: var(--navy-mid); }
  .btn-yellow { background: var(--yellow); color: var(--navy); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .btn-yellow:hover { background: #fcd34d; }
  .btn-red { background: var(--red); color: white; }
  .btn-green { background: var(--green); color: white; }
  .btn-ghost { background: var(--bg); color: var(--text); border: 1.5px solid var(--border); }
  .btn-google { background: white; color: #374151; border: 1.5px solid var(--border); box-shadow: var(--shadow); }

  /* Inputs */
  .input { width: 100%; background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--radius-sm); padding: 12px 14px; font-size: 14px; font-weight: 500; font-family: 'DM Sans', sans-serif; color: var(--text); outline: none; transition: border-color 0.15s, background 0.15s; appearance: none; -webkit-appearance: none; }
  .input:focus { border-color: var(--navy); background: white; box-shadow: 0 0 0 3px rgba(17,24,39,0.06); }
  select.input { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 34px; cursor: pointer; }
  .label { font-size: 11px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; display: block; }

  /* Badges */
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 99px; font-size: 10px; font-weight: 700; letter-spacing: 0.04em; }
  .badge-green { background: var(--green-light); color: var(--green); }
  .badge-red { background: var(--red-light); color: var(--red); }
  .badge-yellow { background: var(--yellow-bg); color: var(--yellow-dark); }
  .badge-blue { background: var(--blue-soft); color: var(--blue); }
  .badge-purple { background: var(--purple-bg); color: var(--purple); }
  .badge-gray { background: #f3f4f6; color: var(--muted); }
  .badge-dark { background: var(--navy); color: white; }

  /* Nav */
  .nav-item { display: flex; flex-direction: column; align-items: center; gap: 3px; background: none; border: none; cursor: pointer; padding: 8px 12px; border-radius: 14px; transition: all 0.15s; color: #9ca3af; font-family: 'DM Sans', sans-serif; min-width: 52px; }
  .nav-item.active { color: var(--navy); background: var(--yellow); }
  .nav-item span { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; }

  /* Auth */
  .auth-bg { min-height: 100vh; background: var(--navy); display: flex; align-items: center; justify-content: center; padding: 24px; }
  .auth-card { background: white; border-radius: 28px; padding: 36px 28px; width: 100%; max-width: 400px; box-shadow: 0 24px 80px rgba(0,0,0,0.4); animation: fadeUp 0.4s ease; }

  /* Period dropdown */
  .period-select { background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.12); border-radius: 10px; color: white; padding: 7px 30px 7px 12px; font-size: 12px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; outline: none; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; }
  .period-select-light { background: white; border: 1.5px solid var(--border); border-radius: 10px; color: var(--text); padding: 8px 30px 8px 12px; font-size: 12px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; outline: none; appearance: none; -webkit-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 10px center; box-shadow: var(--shadow); }

  /* Misc */
  .divider { height: 1px; background: var(--border); margin: 14px 0; }
  .input-wrap { position: relative; }
  .input-wrap .input { padding-right: 44px; }
  .input-icon-right { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--muted); padding: 4px; }
  .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
  .cal-day { aspect-ratio: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer; position: relative; transition: all 0.1s; }
  .cal-day:hover { background: var(--yellow-bg); }
  .cal-day.today { background: var(--navy); color: white; font-weight: 800; }
  .cal-day.has-order::after { content: ''; position: absolute; bottom: 3px; width: 4px; height: 4px; border-radius: 50%; background: var(--yellow-dark); }
  .cal-day.selected { background: var(--yellow) !important; color: var(--navy) !important; font-weight: 900; }
  input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.4); cursor: pointer; }

  /* Module grid */
  .module-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .module-btn { background: white; border: 1.5px solid var(--border); border-radius: var(--radius); padding: 20px 16px; cursor: pointer; display: flex; flex-direction: column; align-items: flex-start; gap: 12px; transition: all 0.15s; box-shadow: var(--shadow); }
  .module-btn:active { transform: scale(0.97); }
  .module-btn:hover { border-color: var(--navy); box-shadow: var(--shadow-md); }

  /* PO badge */
  .po-tag { display: inline-flex; align-items: center; gap: 4px; background: #fef3c7; color: #d97706; padding: 2px 8px; border-radius: 99px; font-size: 10px; font-weight: 800; border: 1px solid #fde68a; }
`;

// ─── AUTH SCREENS ──────────────────────────────────────────────────────────────
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
    if (error) { showMsg(error.message); }
    else if (data.user) {
      await supabase.from('profiles').upsert({ user_id: data.user.id, nama_umkm: namaUMKM.trim(), nama_user: '', tentang: '', domisili: '' });
      showMsg('Akun berhasil dibuat! Silakan login.', 'success');
      setMode('login');
    }
    setLoading(false);
  };

  const handleForgot = async (e) => {
    e.preventDefault(); setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
    if (error) showMsg(error.message);
    else showMsg('Link reset password sudah dikirim.', 'success');
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      <style>{THEME}</style>
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 50, height: 50, background: '#111827', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', background: '#111827' }}>
            <Store size={24} color="white" />
          </div>
          <h1 className="font-display" style={{ fontSize: 22, fontWeight: 900, color: '#111827' }}>UMKM ERP</h1>
          <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 4 }}>
            {mode === 'login' ? 'Selamat datang kembali 👋' : mode === 'register' ? 'Buat akun baru' : 'Reset password'}
          </p>
        </div>

        {msg && (
          <div style={{ background: msg.type === 'success' ? '#f0fdf4' : '#fef2f2', color: msg.type === 'success' ? '#16a34a' : '#ef4444', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            {msg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {msg.text}
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label className="label">Email</label><input required type="email" className="input" placeholder="email@kamu.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><label className="label">Password</label>
              <div className="input-wrap">
                <input required type={showPass ? 'text' : 'password'} className="input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(p => !p)}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <button type="button" onClick={() => setMode('forgot')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'right', padding: 0 }}>Lupa password?</button>
            <button type="submit" disabled={loading} className="btn btn-dark">{loading ? <Loader2 size={17} className="animate-spin" /> : 'Masuk'}</button>
            {/* Temporarily disabled
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600 }}>atau</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            </div>
            //Google
            <button type="button" onClick={handleGoogle} disabled={loading} className="btn btn-google">
              <svg width="17" height="17" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Masuk dengan Google
            </button>//
            */}
            <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', fontWeight: 500, marginTop: 6 }}>
              Belum punya akun?{' '}
              <button type="button" onClick={() => setMode('register')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Daftar</button>
            </p>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label className="label">Nama UMKM</label><input required className="input" placeholder="Bakeri Bu Sari" value={namaUMKM} onChange={e => setNamaUMKM(e.target.value)} /></div>
            <div><label className="label">Email</label><input required type="email" className="input" placeholder="email@kamu.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <div><label className="label">Password</label>
              <div className="input-wrap">
                <input required type={showPass ? 'text' : 'password'} className="input" placeholder="Minimal 6 karakter" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(p => !p)}>{showPass ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn btn-dark">{loading ? <Loader2 size={17} className="animate-spin" /> : 'Buat Akun'}</button>
            <p style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
              Sudah punya akun?{' '}
              <button type="button" onClick={() => setMode('login')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Masuk</button>
            </p>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Masukkan email kamu, kami kirim link reset password.</p>
            <div><label className="label">Email</label><input required type="email" className="input" placeholder="email@kamu.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
            <button type="submit" disabled={loading} className="btn btn-dark">{loading ? <Loader2 size={17} className="animate-spin" /> : 'Kirim Link Reset'}</button>
            <button type="button" onClick={() => setMode('login')} className="btn btn-ghost">← Kembali</button>
          </form>
        )}
      </div>
    </div>
  );
};

// ─── FIRST TIME SETUP ──────────────────────────────────────────────────────────
const FirstTimeSetup = ({ user, onDone }) => {
  const [namaUMKM, setNamaUMKM] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!namaUMKM.trim()) return;
    setLoading(true);
    await supabase.from('profiles').upsert({ user_id: user.id, nama_umkm: namaUMKM.trim(), nama_user: user.user_metadata?.full_name || '', tentang: '', domisili: '' });
    onDone();
    setLoading(false);
  };

  return (
    <div className="auth-bg">
      <style>{THEME}</style>
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>👋</div>
        <h2 className="font-display" style={{ fontSize: 22, fontWeight: 900, color: '#111827', marginBottom: 8 }}>Selamat datang!</h2>
        <p style={{ fontSize: 13, color: '#6b7280', fontWeight: 500, marginBottom: 24 }}>Satu langkah lagi — apa nama usaha kamu?</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, textAlign: 'left' }}>
          <div><label className="label">Nama UMKM</label><input required className="input" placeholder="Warung Makan Pak Budi" value={namaUMKM} onChange={e => setNamaUMKM(e.target.value)} autoFocus /></div>
          <button type="submit" disabled={loading} className="btn btn-dark">{loading ? <Loader2 size={17} className="animate-spin" /> : 'Mulai Sekarang →'}</button>
        </form>
      </div>
    </div>
  );
};

// ─── MAIN ERP APP ──────────────────────────────────────────────────────────────
const ERPApp = ({ user, profile: initialProfile, onProfileUpdate }) => {
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [subTabGudang, setSubTabGudang] = useState('stok');
  const [showSettings, setShowSettings] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalDay, setSelectedCalDay] = useState(null);

  const [purchases, setPurchases] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [profile, setProfile] = useState(initialProfile);

  const [activeModal, setActiveModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // Period filters — per tab
  const [pembelianPeriod, setPembelianPeriod] = useState('bulan_ini');
  const [pembelianFrom, setPembelianFrom] = useState('');
  const [pembelianTo, setPembelianTo] = useState('');
  const [penjualanPeriod, setPenjualanPeriod] = useState('bulan_ini');
  const [penjualanFrom, setPenjualanFrom] = useState('');
  const [penjualanTo, setPenjualanTo] = useState('');
  const [ringkasanPeriod, setRingkasanPeriod] = useState('bulan_ini');
  const [ringkasanFrom, setRingkasanFrom] = useState('');
  const [ringkasanTo, setRingkasanTo] = useState('');
  const [jadwalFilter, setJadwalFilter] = useState('hari_ini');

  // Forms
  const [purchaseForm, setPurchaseForm] = useState({ nama_barang: '', supplier: '', jumlah: '', satuan: 'pcs', harga_satuan: '', tanggal: todayStr() });
  const [recipeForm, setRecipeForm] = useState({ nama: '', jumlah_output: 1, satuan_output: 'pcs', ingredients: [{ nama_bahan: '', qty: '', satuan: 'pcs', type: 'raw' }] });
  const [prodForm, setProdForm] = useState({ recipe_id: '', qty: 1, tanggal: todayStr() });
  
  // NEW penjualan flow: step 1 = customer details, step 2 = item selection
  const [orderStep, setOrderStep] = useState(1);
  const [cart, setCart] = useState([]);
  const [customerForm, setCustomerForm] = useState({ nama: '', wa: '', alamat: '', tgl_order: todayStr(), tgl_kirim: todayStr(), metode_bayar: 'Cash', status_bayar: 'Belum Bayar' });
  
  const [removalForm, setRemovalForm] = useState({ alasan: 'Rusak', qty: 1 });
  const [priceForm, setPriceForm] = useState({ harga: '' });
  const [profileForm, setProfileForm] = useState({ nama_umkm: '', nama_user: '', tentang: '', domisili: '' });
  const [newItemForm, setNewItemForm] = useState({ nama: '', satuan: 'pcs', type: 'raw', stok: 0, harga: 0 });

  const uid = user.id;

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };
  const closeModal = () => { setActiveModal(null); setSelectedItem(null); setEditingTransaction(null); setOrderStep(1); };

  // ── Data fetching
  const fetchAll = useCallback(async () => {
    const [p, inv, rec, lg, ord, prof] = await Promise.all([
      supabase.from('purchases').select('*').eq('user_id', uid).order('tanggal', { ascending: false }),
      supabase.from('inventory').select('*').eq('user_id', uid),
      supabase.from('recipes').select('*, recipe_ingredients(*)').eq('user_id', uid),
      supabase.from('warehouse_logs').select('*').eq('user_id', uid).order('tanggal', { ascending: false }),
      supabase.from('orders').select('*, order_items(*)').eq('user_id', uid).order('tgl_order', { ascending: false }),
      supabase.from('profiles').select('*').eq('user_id', uid).single(),
    ]);
    if (p.data) setPurchases(p.data);
    if (inv.data) setInventory(inv.data);
    if (rec.data) setRecipes(rec.data);
    if (lg.data) setLogs(lg.data);
    if (ord.data) setOrders(ord.data);
    if (prof.data) { setProfile(prof.data); onProfileUpdate(prof.data); }
  }, [uid]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    const subs = [
      supabase.channel('purchases2').on('postgres_changes', { event: '*', schema: 'public', table: 'purchases', filter: `user_id=eq.${uid}` }, fetchAll).subscribe(),
      supabase.channel('inventory2').on('postgres_changes', { event: '*', schema: 'public', table: 'inventory', filter: `user_id=eq.${uid}` }, fetchAll).subscribe(),
      supabase.channel('orders2').on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `user_id=eq.${uid}` }, fetchAll).subscribe(),
    ];
    return () => subs.forEach(s => supabase.removeChannel(s));
  }, [uid, fetchAll]);

  // ── Period filter helper
  const getDateRange = (period, from, to) => {
    const now = new Date();
    if (period === 'hari_ini') return { from: todayStr(), to: todayStr() };
    if (period === 'minggu_ini') {
      const d = new Date(now); d.setDate(now.getDate() - now.getDay());
      return { from: d.toISOString().split('T')[0], to: todayStr() };
    }
    if (period === 'bulan_ini') return { from: new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0], to: todayStr() };
    return { from, to };
  };

  // ── PEMBELIAN
  const handleAddPurchase = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    const qty = Number(purchaseForm.jumlah);
    const price = Number(purchaseForm.harga_satuan);
    const total = qty * price;
    const slug = slugify(purchaseForm.nama_barang);
    try {
      await supabase.from('purchases').insert({ user_id: uid, nama_barang: purchaseForm.nama_barang, supplier: purchaseForm.supplier, jumlah: qty, satuan: purchaseForm.satuan, harga_satuan: price, total_harga: total, tanggal: purchaseForm.tanggal });
      const { data: existing } = await supabase.from('inventory').select('*').eq('user_id', uid).eq('id', slug).single();
      if (existing) {
        await supabase.from('inventory').update({ stok: existing.stok + qty }).eq('user_id', uid).eq('id', slug);
      } else {
        await supabase.from('inventory').insert({ id: slug, user_id: uid, nama: purchaseForm.nama_barang, stok: qty, satuan: purchaseForm.satuan, type: 'raw', harga: 0 });
      }
      showToast('Pembelian disimpan ✓');
      closeModal();
      setPurchaseForm({ nama_barang: '', supplier: '', jumlah: '', satuan: 'pcs', harga_satuan: '', tanggal: todayStr() });
      fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  // ── RESEP (now supports raw, semi, finished as ingredients/output)
  const handleAddRecipe = async (e) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    try {
      const { data: recipe } = await supabase.from('recipes').insert({ user_id: uid, nama: recipeForm.nama, jumlah_output: Number(recipeForm.jumlah_output), satuan_output: recipeForm.satuan_output, output_type: recipeForm.output_type || 'finished' }).select().single();
      if (recipe) {
        await supabase.from('recipe_ingredients').insert(recipeForm.ingredients.map(ing => ({ recipe_id: recipe.id, user_id: uid, nama_bahan: ing.nama_bahan, qty: Number(ing.qty), satuan: ing.satuan })));
      }
      showToast('Resep disimpan ✓');
      closeModal();
      setRecipeForm({ nama: '', jumlah_output: 1, satuan_output: 'pcs', output_type: 'finished', ingredients: [{ nama_bahan: '', qty: '', satuan: 'pcs' }] });
      fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  // ── PRODUKSI
  const handleProduction = async (e) => {
    e.preventDefault();
    if (isSaving || !prodForm.recipe_id) return;
    setIsSaving(true);
    const recipe = recipes.find(r => r.id === Number(prodForm.recipe_id));
    const multiplier = Number(prodForm.qty) || 1;
    const outputQty = multiplier * Number(recipe.jumlah_output || 1);
    const ingredients = recipe.recipe_ingredients || [];
    try {
      for (const ing of ingredients) {
        const slug = slugify(ing.nama_bahan);
        const { data: inv } = await supabase.from('inventory').select('*').eq('user_id', uid).eq('id', slug).single();
        if (!inv) throw new Error(`Bahan ${ing.nama_bahan} tidak ada di stok`);
        const needed = Number(ing.qty) * multiplier;
        if (inv.stok < needed) throw new Error(`Stok ${ing.nama_bahan} kurang (butuh ${needed}, ada ${inv.stok})`);
        await supabase.from('inventory').update({ stok: inv.stok - needed }).eq('user_id', uid).eq('id', slug);
      }
      const prodSlug = slugify(recipe.nama);
      const outType = recipe.output_type || 'finished';
      const { data: existing } = await supabase.from('inventory').select('*').eq('user_id', uid).eq('id', prodSlug).single();
      if (existing) {
        await supabase.from('inventory').update({ stok: existing.stok + outputQty }).eq('user_id', uid).eq('id', prodSlug);
      } else {
        await supabase.from('inventory').insert({ id: prodSlug, user_id: uid, nama: recipe.nama, stok: outputQty, satuan: recipe.satuan_output, type: outType, harga: 0 });
      }
      await supabase.from('warehouse_logs').insert({ user_id: uid, type: 'PRODUKSI', detail: `${multiplier}x batch → ${outputQty} ${recipe.satuan_output} ${recipe.nama}`, tanggal: prodForm.tanggal });
      showToast('Produksi berhasil ✓');
      closeModal();
      fetchAll();
    } catch (err) { showToast(err.message, 'error'); } finally { setIsSaving(false); }
  };

  // ── SET HARGA
  const handleSetPrice = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSaving(true);
    await supabase.from('inventory').update({ harga: Number(priceForm.harga) }).eq('user_id', uid).eq('id', selectedItem.id);
    showToast('Harga disimpan ✓');
    closeModal(); fetchAll();
    setIsSaving(false);
  };

  // ── REMOVE ITEM
  const handleRemoveItem = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    setIsSaving(true);
    const qty = Number(removalForm.qty);
    if (qty > selectedItem.stok) { showToast('Jumlah melebihi stok', 'error'); setIsSaving(false); return; }
    await supabase.from('inventory').update({ stok: selectedItem.stok - qty }).eq('user_id', uid).eq('id', selectedItem.id);
    await supabase.from('warehouse_logs').insert({ user_id: uid, type: 'REMOVAL', detail: `${qty} ${selectedItem.nama} (${removalForm.alasan})`, tanggal: todayStr() });
    showToast('Stok dihapus ✓');
    closeModal(); fetchAll();
    setIsSaving(false);
  };

  // ── CART
  const addToCart = (item) => {
    if (!item.harga || item.harga === 0) { showToast('Set harga produk dulu!', 'error'); return; }
    setCart(prev => { const ex = prev.find(c => c.id === item.id); return ex ? prev.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c) : [...prev, { ...item, qty: 1 }]; });
  };
  const removeFromCart = (id) => setCart(prev => { const ex = prev.find(c => c.id === id); return ex?.qty > 1 ? prev.map(c => c.id === id ? { ...c, qty: c.qty - 1 } : c) : prev.filter(c => c.id !== id); });

  // ── CHECKOUT
  const handleCheckout = async (e) => {
    e.preventDefault();
    if (isSaving || cart.length === 0) return;
    setIsSaving(true);
    const total = cart.reduce((a, b) => a + b.qty * (b.harga || 0), 0);
    try {
      const { data: order } = await supabase.from('orders').insert({ user_id: uid, nama: customerForm.nama, wa: customerForm.wa, alamat: customerForm.alamat, tgl_order: customerForm.tgl_order, tgl_kirim: customerForm.tgl_kirim, metode_bayar: customerForm.metode_bayar, status_bayar: customerForm.status_bayar, delivery_status: 'Menunggu', total, status: 'Pesanan Baru', is_po: customerForm.tgl_kirim > todayStr() }).select().single();
      if (order) {
        await supabase.from('order_items').insert(cart.map(item => ({ order_id: order.id, user_id: uid, nama: item.nama, qty: item.qty, harga: item.harga })));
        // Only deduct stock if NOT a pre-order (tgl_kirim is today or past)
        if (customerForm.tgl_kirim <= todayStr()) {
          for (const item of cart) {
            const { data: inv } = await supabase.from('inventory').select('stok').eq('user_id', uid).eq('id', item.id).single();
            if (inv) await supabase.from('inventory').update({ stok: Math.max(0, inv.stok - item.qty) }).eq('user_id', uid).eq('id', item.id);
          }
        }
      }
      showToast('Pesanan dicatat ✓');
      setCart([]);
      setCustomerForm({ nama: '', wa: '', alamat: '', tgl_order: todayStr(), tgl_kirim: todayStr(), metode_bayar: 'Cash', status_bayar: 'Belum Bayar' });
      setOrderStep(1);
      closeModal(); fetchAll();
    } catch (err) { showToast('Gagal: ' + err.message, 'error'); } finally { setIsSaving(false); }
  };

  const confirmPayment = async (orderId) => {
    await supabase.from('orders').update({ status_bayar: 'Lunas' }).eq('user_id', uid).eq('id', orderId);
    showToast('Pembayaran dikonfirmasi ✓');
    fetchAll();
  };

  const cancelOrder = async (order) => {
    // Restore stock only if it was already deducted (non-PO orders)
    if (!order.is_po) {
      for (const item of order.order_items || []) {
        const { data: inv } = await supabase.from('inventory').select('stok').eq('user_id', uid).eq('id', slugify(item.nama)).single();
        if (inv) await supabase.from('inventory').update({ stok: inv.stok + item.qty }).eq('user_id', uid).eq('id', slugify(item.nama));
      }
    }
    await supabase.from('order_items').delete().eq('order_id', order.id);
    await supabase.from('orders').delete().eq('user_id', uid).eq('id', order.id);
    showToast('Pesanan dibatalkan ✓');
    fetchAll();
  };

  const handleEditPurchaseDate = async (e) => {
    e.preventDefault(); setIsSaving(true);
    await supabase.from('purchases').update({ tanggal: editingTransaction._newDate }).eq('user_id', uid).eq('id', editingTransaction.id);
    showToast('Tanggal diperbarui ✓');
    closeModal(); fetchAll(); setIsSaving(false);
  };

  const handleEditOrderDates = async (e) => {
    e.preventDefault(); setIsSaving(true);
    await supabase.from('orders').update({ tgl_order: editingTransaction._newTglOrder, tgl_kirim: editingTransaction._newTglKirim }).eq('user_id', uid).eq('id', editingTransaction.id);
    showToast('Tanggal diperbarui ✓');
    closeModal(); fetchAll(); setIsSaving(false);
  };

  const updateDeliveryStatus = async (orderId, status) => {
    await supabase.from('orders').update({ delivery_status: status }).eq('user_id', uid).eq('id', orderId);
    // If marking as "Dikirim" for a PO, deduct stock now
    if (status === 'Dikirim') {
      const order = orders.find(o => o.id === orderId);
      if (order && order.is_po) {
        for (const item of order.order_items || []) {
          const { data: inv } = await supabase.from('inventory').select('stok').eq('user_id', uid).eq('id', slugify(item.nama)).single();
          if (inv) await supabase.from('inventory').update({ stok: Math.max(0, inv.stok - item.qty) }).eq('user_id', uid).eq('id', slugify(item.nama));
        }
        await supabase.from('orders').update({ is_po: false }).eq('user_id', uid).eq('id', orderId);
      }
    }
    showToast(`Status: ${status} ✓`);
    fetchAll();
  };

  const sendWhatsApp = (order) => {
    const items = (order.order_items || []).map(it => `${it.qty}x ${it.nama}`).join(', ');
    const text = `Halo ${order.nama}! 👋\n\nPesanan kamu: ${items}\nTotal: ${formatRupiah(order.total)}\nJadwal kirim: ${order.tgl_kirim}\nAlamat: ${order.alamat}\n\nMohon ditunggu ya! 🙏`;
    window.open(`https://wa.me/${order.wa?.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault(); setIsSaving(true);
    await supabase.from('profiles').upsert({ user_id: uid, ...profileForm });
    setProfile(profileForm); onProfileUpdate(profileForm);
    showToast('Profil disimpan ✓');
    setShowSettings(false); setIsSaving(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };

  // ── Filtered purchases
  const filteredPurchases = useMemo(() => {
    const { from, to } = getDateRange(pembelianPeriod, pembelianFrom, pembelianTo);
    if (!from || !to) return purchases;
    return purchases.filter(p => p.tanggal >= from && p.tanggal <= to);
  }, [purchases, pembelianPeriod, pembelianFrom, pembelianTo]);

  // ── Filtered orders for penjualan
  const filteredOrders = useMemo(() => {
    const { from, to } = getDateRange(penjualanPeriod, penjualanFrom, penjualanTo);
    if (!from || !to) return orders;
    return orders.filter(o => o.tgl_order >= from && o.tgl_order <= to);
  }, [orders, penjualanPeriod, penjualanFrom, penjualanTo]);

  // ── Upcoming POs — orders with tgl_kirim in the future
  const upcomingPOs = useMemo(() => orders.filter(o => o.is_po || o.tgl_kirim > todayStr()), [orders]);

  // ── Delivery list
  const deliveryList = useMemo(() => {
    const tod = todayStr();
    const tom = new Date(); tom.setDate(tom.getDate() + 1);
    const tomStr = tom.toISOString().split('T')[0];
    if (selectedCalDay) return orders.filter(o => o.tgl_kirim === selectedCalDay);
    return orders.filter(o => {
      if (!o.tgl_kirim) return false;
      if (jadwalFilter === 'hari_ini') return o.tgl_kirim === tod;
      if (jadwalFilter === 'besok') return o.tgl_kirim === tomStr;
      if (jadwalFilter === 'mendatang') return o.tgl_kirim > tomStr;
      return true;
    }).sort((a, b) => a.tgl_kirim?.localeCompare(b.tgl_kirim));
  }, [orders, jadwalFilter, selectedCalDay]);

  // ── Ringkasan data
  const ringkasanData = useMemo(() => {
    const { from, to } = getDateRange(ringkasanPeriod, ringkasanFrom, ringkasanTo);
    const inRange = (d) => (!from || !to) ? true : d >= from && d <= to;
    const paidOrders = orders.filter(o => inRange(o.tgl_order) && o.status_bayar === 'Lunas');
    const rangePurchases = purchases.filter(p => inRange(p.tanggal));
    const pemasukan = paidOrders.reduce((a, o) => a + (o.total || 0), 0);
    const pengeluaran = rangePurchases.reduce((a, p) => a + (p.total_harga || 0), 0);
    const produkMap = {};
    paidOrders.forEach(o => (o.order_items || []).forEach(it => { produkMap[it.nama] = (produkMap[it.nama] || 0) + it.qty; }));
    const topProduk = Object.entries(produkMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const totalOrders = orders.filter(o => inRange(o.tgl_order)).length;
    const selesai = orders.filter(o => inRange(o.tgl_order) && o.delivery_status === 'Selesai').length;
    return { pemasukan, pengeluaran, laba: pemasukan - pengeluaran, topProduk, totalOrders, selesai };
  }, [orders, purchases, ringkasanPeriod, ringkasanFrom, ringkasanTo]);

  // ── Calendar
  const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
  const DAYS_ID = ['M','S','S','R','K','J','S'];
  const calDays = useMemo(() => {
    const y = calendarDate.getFullYear(), m = calendarDate.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days = Array(first).fill(null);
    for (let d = 1; d <= new Date(y, m + 1, 0).getDate(); d++) days.push(new Date(y, m, d));
    const orderDates = new Set(orders.map(o => o.tgl_kirim).filter(Boolean));
    return { days, orderDates };
  }, [calendarDate, orders]);

  // ── Period options
  const PERIOD_OPTIONS = [
    { value: 'hari_ini', label: 'Hari Ini' },
    { value: 'minggu_ini', label: 'Minggu Ini' },
    { value: 'bulan_ini', label: 'Bulan Ini' },
    { value: 'custom', label: 'Custom' },
  ];

  const PeriodDropdown = ({ value, onChange, dark }) => (
    <select value={value} onChange={e => onChange(e.target.value)} className={dark ? 'period-select' : 'period-select-light'}>
      {PERIOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );

  const CustomDateRange = ({ from, setFrom, to, setTo }) => (
    <div style={{ display: 'flex', gap: 10, padding: '12px 16px', background: '#f9fafb', borderBottom: '1px solid var(--border)' }}>
      <div style={{ flex: 1 }}><label className="label">Dari</label><input type="date" className="input" value={from} onChange={e => setFrom(e.target.value)} /></div>
      <div style={{ flex: 1 }}><label className="label">Sampai</label><input type="date" className="input" value={to} onChange={e => setTo(e.target.value)} /></div>
    </div>
  );

  // ── MODULES for dashboard
  const MODULES = [
    { key: 'pembelian', icon: ShoppingBag, label: 'Pembelian', color: '#3b82f6', bg: '#eff6ff', desc: 'Catat bahan masuk' },
    { key: 'gudang', icon: Package, label: 'Gudang', color: '#8b5cf6', bg: '#f5f3ff', desc: 'Kelola stok & resep' },
    { key: 'penjualan', icon: ShoppingCart, label: 'Penjualan', color: '#16a34a', bg: '#f0fdf4', desc: 'Buat pesanan baru' },
    { key: 'jadwal', icon: Truck, label: 'Jadwal Kirim', color: '#f59e0b', bg: '#fefce8', desc: 'Pantau pengiriman' },
  ];

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100, background: '#f9fafb', maxWidth: 640, margin: '0 auto', width: '100%' }}>
      <style>{THEME}</style>

      {/* TOAST */}
      {toast && (
        <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 300, pointerEvents: 'none', whiteSpace: 'nowrap', animation: 'fadeUp 0.25s ease' }}>
          <div style={{ background: toast.type === 'error' ? '#ef4444' : '#111827', color: 'white', padding: '11px 22px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 9, boxShadow: '0 8px 32px rgba(0,0,0,0.18)' }}>
            {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} color="#86efac" />}
            <span style={{ fontWeight: 700, fontSize: 13 }}>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header style={{ background: '#111827', padding: '52px 20px 18px', position: 'sticky', top: 0, zIndex: 40, boxShadow: '0 2px 20px rgba(0,0,0,0.15)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            {/* Only show greeting in ringkasan */}
            {activeTab === 'ringkasan' && profile?.nama_user && (
              <p style={{ color: '#9ca3af', fontSize: 12, fontWeight: 500, marginBottom: 2 }}>Halo, {profile.nama_user} 👋</p>
            )}
            <h1 className="font-display" style={{ color: 'white', fontSize: activeTab === 'ringkasan' ? 22 : 19, fontWeight: 900, letterSpacing: '-0.02em' }}>
              {activeTab === 'ringkasan' ? (profile?.nama_umkm || 'Dashboard') : { pembelian: 'Pembelian', gudang: 'Gudang', penjualan: 'Penjualan', jadwal: 'Jadwal Kirim' }[activeTab]}
            </h1>
            {activeTab === 'ringkasan' && profile?.domisili && (
              <p style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>📍 {profile.domisili}</p>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {/* Period dropdowns in header for relevant tabs */}
            {activeTab === 'ringkasan' && <PeriodDropdown value={ringkasanPeriod} onChange={setRingkasanPeriod} dark />}
            {activeTab === 'pembelian' && <PeriodDropdown value={pembelianPeriod} onChange={setPembelianPeriod} dark />}
            {activeTab === 'penjualan' && <PeriodDropdown value={penjualanPeriod} onChange={setPenjualanPeriod} dark />}
            {/* Action buttons */}
            {activeTab === 'pembelian' && (
              <button onClick={() => setActiveModal('beli')} style={{ background: '#fde047', color: '#111827', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Plus size={14} /> Tambah</button>
            )}
            {activeTab === 'penjualan' && (
              <button onClick={() => { setOrderStep(1); setActiveModal('newOrder'); }} style={{ background: '#fde047', color: '#111827', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Plus size={14} /> Order</button>
            )}
            {activeTab === 'gudang' && subTabGudang === 'stok' && (
              <button onClick={() => setActiveModal('produksi')} style={{ background: '#fde047', color: '#111827', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><ChefHat size={14} /> Produksi</button>
            )}
            {activeTab === 'gudang' && subTabGudang === 'resep' && (
              <button onClick={() => setActiveModal('resep')} style={{ background: '#fde047', color: '#111827', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Plus size={14} /> Resep</button>
            )}
            {activeTab === 'jadwal' && selectedCalDay && (
              <button onClick={() => { setCustomerForm(f => ({ ...f, tgl_kirim: selectedCalDay })); setOrderStep(1); setActiveModal('newOrder'); }} style={{ background: '#fde047', color: '#111827', border: 'none', borderRadius: 10, padding: '8px 14px', fontSize: 11, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}><Plus size={14} /> Order</button>
            )}
            <button onClick={() => { setProfileForm({ nama_umkm: profile?.nama_umkm || '', nama_user: profile?.nama_user || '', tentang: profile?.tentang || '', domisili: profile?.domisili || '' }); setShowSettings(true); }} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#9ca3af', display: 'flex', alignItems: 'center' }}><Settings size={17} /></button>
          </div>
        </div>

        {/* Sub-tabs for gudang */}
        {activeTab === 'gudang' && (
          <div style={{ display: 'flex', gap: 4, marginTop: 14, background: 'rgba(255,255,255,0.06)', padding: 4, borderRadius: 12 }}>
            {[['stok', 'Stok'], ['resep', 'Resep'], ['riwayat', 'Riwayat']].map(([key, label]) => (
              <button key={key} onClick={() => setSubTabGudang(key)} style={{ flex: 1, padding: '7px 4px', borderRadius: 9, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: subTabGudang === key ? 'white' : 'transparent', color: subTabGudang === key ? '#111827' : 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}>{label}</button>
            ))}
          </div>
        )}

        {/* Sub-tabs for jadwal */}
        {activeTab === 'jadwal' && !selectedCalDay && (
          <div style={{ display: 'flex', gap: 4, marginTop: 14, background: 'rgba(255,255,255,0.06)', padding: 4, borderRadius: 12 }}>
            {[['hari_ini', 'Hari Ini'], ['besok', 'Besok'], ['mendatang', 'Mendatang']].map(([key, label]) => (
              <button key={key} onClick={() => setJadwalFilter(key)} style={{ flex: 1, padding: '7px 4px', borderRadius: 9, border: 'none', fontSize: 11, fontWeight: 700, cursor: 'pointer', background: jadwalFilter === key ? 'white' : 'transparent', color: jadwalFilter === key ? '#111827' : 'rgba(255,255,255,0.4)', transition: 'all 0.15s' }}>{label}</button>
            ))}
          </div>
        )}
        {activeTab === 'jadwal' && selectedCalDay && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 600 }}>Tanggal: {selectedCalDay}</span>
            <button onClick={() => setSelectedCalDay(null)} style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none', borderRadius: 7, padding: '3px 10px', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>Reset</button>
          </div>
        )}
      </header>

      <main style={{ padding: '16px 16px 0', width: '100%', boxSizing: 'border-box' }}>

        {/* Custom date range bars */}
        {activeTab === 'pembelian' && pembelianPeriod === 'custom' && <div style={{ marginBottom: 12 }}><CustomDateRange from={pembelianFrom} setFrom={setPembelianFrom} to={pembelianTo} setTo={setPembelianTo} /></div>}
        {activeTab === 'penjualan' && penjualanPeriod === 'custom' && <div style={{ marginBottom: 12 }}><CustomDateRange from={penjualanFrom} setFrom={setPenjualanFrom} to={penjualanTo} setTo={setPenjualanTo} /></div>}
        {activeTab === 'ringkasan' && ringkasanPeriod === 'custom' && <div style={{ marginBottom: 12 }}><CustomDateRange from={ringkasanFrom} setFrom={setRingkasanFrom} to={ringkasanTo} setTo={setRingkasanTo} /></div>}

        {/* ── RINGKASAN (Dashboard) ── */}
        {activeTab === 'ringkasan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
            {/* Big 3 numbers */}
            <div style={{ background: '#111827', borderRadius: 20, padding: '20px 20px 22px', color: 'white' }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Laba Kotor</p>
              <p className="font-display" style={{ fontSize: 32, fontWeight: 900, letterSpacing: '-0.02em', color: ringkasanData.laba >= 0 ? '#fde047' : '#f87171' }}>{formatRupiah(ringkasanData.laba)}</p>
              <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                <div>
                  <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>↑ Masuk</p>
                  <p style={{ fontWeight: 800, fontSize: 14, color: '#86efac' }}>{formatRupiah(ringkasanData.pemasukan)}</p>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.07)' }} />
                <div>
                  <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>↓ Keluar</p>
                  <p style={{ fontWeight: 800, fontSize: 14, color: '#fca5a5' }}>{formatRupiah(ringkasanData.pengeluaran)}</p>
                </div>
                <div style={{ width: 1, background: 'rgba(255,255,255,0.07)' }} />
                <div>
                  <p style={{ fontSize: 10, color: '#6b7280', fontWeight: 600, marginBottom: 2 }}>Pesanan</p>
                  <p style={{ fontWeight: 800, fontSize: 14, color: 'white' }}>{ringkasanData.totalOrders}</p>
                </div>
              </div>
            </div>

            {/* Module quick-access grid */}
            <div className="module-grid">
              {MODULES.map(({ key, icon: Icon, label, color, bg, desc }) => (
                <button key={key} className="module-btn" onClick={() => setActiveTab(key)}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <p style={{ fontWeight: 800, fontSize: 14, marginBottom: 1 }}>{label}</p>
                    <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Top products */}
            {ringkasanData.topProduk.length > 0 && (
              <div className="card" style={{ padding: 18 }}>
                <p style={{ fontWeight: 800, fontSize: 13, marginBottom: 12, color: '#374151' }}>Top Produk Terjual</p>
                {ringkasanData.topProduk.map(([nama, qty], i) => (
                  <div key={nama} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < ringkasanData.topProduk.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? '#fde047' : '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, color: i === 0 ? '#92400e' : '#6b7280', flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{nama}</p>
                    <span className="badge badge-dark">{qty} terjual</span>
                  </div>
                ))}
              </div>
            )}

            {/* Upcoming POs alert */}
            {upcomingPOs.length > 0 && (
              <div style={{ background: '#fefce8', border: '1.5px solid #fde68a', borderRadius: 16, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <Clock size={16} color="#d97706" />
                  <p style={{ fontWeight: 800, fontSize: 13, color: '#92400e' }}>Pre-Order Mendatang</p>
                </div>
                {upcomingPOs.slice(0, 3).map(o => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, padding: '4px 0', color: '#78350f' }}>
                    <span>{o.nama}</span><span>Kirim: {o.tgl_kirim}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PEMBELIAN ── */}
        {activeTab === 'pembelian' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
            <div style={{ background: '#111827', borderRadius: 16, padding: '16px 20px', color: 'white', marginBottom: 4 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Total Pengeluaran</p>
              <p className="font-display" style={{ fontSize: 26, fontWeight: 900, color: '#fde047' }}>{formatRupiah(filteredPurchases.reduce((a, p) => a + (p.total_harga || 0), 0))}</p>
            </div>
            {filteredPurchases.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>
                <ShoppingBag size={32} style={{ opacity: 0.2, margin: '0 auto 8px' }} />
                <p style={{ fontSize: 12, fontWeight: 600 }}>Belum ada pembelian</p>
              </div>
            )}
            {filteredPurchases.map(p => (
              <div key={p.id} className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 38, height: 38, background: '#eff6ff', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ShoppingBag size={16} color="#3b82f6" /></div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14 }}>{p.nama_barang}</p>
                    {p.supplier && <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>dari {p.supplier}</p>}
                    <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{p.jumlah} {p.satuan} · {friendlyDate(p.tanggal)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <p style={{ fontWeight: 800, fontSize: 13 }}>{formatRupiah(p.total_harga)}</p>
                  <button onClick={() => { setEditingTransaction({ ...p, _newDate: p.tanggal }); setActiveModal('editTanggalBeli'); }} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: '#9ca3af', display: 'flex' }}><Edit2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── GUDANG ── */}
        {activeTab === 'gudang' && (
          <div>
            {subTabGudang === 'stok' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Summary chips */}
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
                  {Object.entries(INVENTORY_TYPES).map(([type, cfg]) => {
                    const count = inventory.filter(i => i.type === type).length;
                    return (
                      <div key={type} style={{ background: cfg.bg, borderRadius: 12, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <cfg.icon size={14} color={cfg.color} />
                        <span style={{ fontWeight: 700, fontSize: 12, color: cfg.color }}>{cfg.label}</span>
                        <span style={{ fontWeight: 900, fontSize: 16, color: '#111827' }}>{count}</span>
                      </div>
                    );
                  })}
                </div>
                {inventory.map(item => {
                  const cfg = INVENTORY_TYPES[item.type] || INVENTORY_TYPES.raw;
                  return (
                    <div key={item.id} className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 38, height: 38, background: cfg.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <cfg.icon size={16} color={cfg.color} />
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <p style={{ fontWeight: 700, fontSize: 14 }}>{item.nama}</p>
                            <span className={`badge ${item.type === 'finished' ? 'badge-green' : item.type === 'semi' ? 'badge-purple' : 'badge-blue'}`}>{cfg.label}</span>
                          </div>
                          {item.type === 'finished' && (item.harga > 0
                            ? <p style={{ fontSize: 12, color: '#16a34a', fontWeight: 700 }}>{formatRupiah(item.harga)}</p>
                            : <p style={{ fontSize: 11, color: '#ef4444', fontWeight: 600 }}>⚠ Belum ada harga</p>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontSize: 20, fontWeight: 900, color: item.stok <= 0 ? '#ef4444' : '#111827' }}>{item.stok}</p>
                          <p style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af' }}>{item.satuan}</p>
                        </div>
                        {item.type === 'finished' && (
                          <button onClick={() => { setSelectedItem(item); setPriceForm({ harga: item.harga || '' }); setActiveModal('setHarga'); }} style={{ background: '#fefce8', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', color: '#d97706', display: 'flex' }}><Wallet size={14} /></button>
                        )}
                        <button onClick={() => { setSelectedItem(item); setRemovalForm({ alasan: 'Rusak', qty: 1 }); setActiveModal('remove'); }} style={{ background: '#fef2f2', border: 'none', borderRadius: 9, padding: 7, cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {subTabGudang === 'resep' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recipes.map(r => (
                  <div key={r.id} className="card" style={{ padding: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <Utensils size={15} color="#d97706" />
                      <p style={{ fontWeight: 800, fontSize: 14, flex: 1 }}>{r.nama}</p>
                      <span className="badge badge-yellow">{r.jumlah_output} {r.satuan_output}/batch</span>
                    </div>
                    <div style={{ background: '#f9fafb', borderRadius: 10, padding: 10 }}>
                      {(r.recipe_ingredients || []).map((ing, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, padding: '4px 0', borderBottom: i < (r.recipe_ingredients?.length || 0) - 1 ? '1px solid #f3f4f6' : 'none', color: '#374151' }}>
                          <span>{ing.nama_bahan}</span><span style={{ fontWeight: 800 }}>{ing.qty} {ing.satuan}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {recipes.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}><Utensils size={28} style={{ opacity: 0.2, margin: '0 auto 8px' }} /><p style={{ fontSize: 12, fontWeight: 600 }}>Belum ada resep</p></div>}
              </div>
            )}

            {subTabGudang === 'riwayat' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {logs.map(log => (
                  <div key={log.id} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: log.type === 'PRODUKSI' ? '#fefce8' : '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {log.type === 'PRODUKSI' ? <ChefHat size={16} color="#d97706" /> : <Trash2 size={16} color="#ef4444" />}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{log.detail}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>{log.type} · {friendlyDate(log.tanggal)}</p>
                    </div>
                  </div>
                ))}
                {logs.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af' }}><p style={{ fontSize: 12, fontWeight: 600 }}>Belum ada riwayat</p></div>}
              </div>
            )}
          </div>
        )}

        {/* ── PENJUALAN ── */}
        {activeTab === 'penjualan' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Revenue summary */}
            <div style={{ background: '#111827', borderRadius: 16, padding: '16px 20px', color: 'white' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Total Penjualan (Lunas)</p>
              <p className="font-display" style={{ fontSize: 26, fontWeight: 900, color: '#86efac' }}>
                {formatRupiah(filteredOrders.filter(o => o.status_bayar === 'Lunas').reduce((a, o) => a + (o.total || 0), 0))}
              </p>
            </div>

            {/* PO section */}
            {upcomingPOs.length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Pre-Order Mendatang</p>
                {upcomingPOs.map(order => (
                  <div key={order.id} className="card" style={{ padding: 14, marginBottom: 8, borderLeft: '3px solid #fde047' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <p style={{ fontWeight: 800, fontSize: 14 }}>{order.nama}</p>
                          <span className="po-tag"><Clock size={9} /> PO</span>
                        </div>
                        <p style={{ fontSize: 11, color: '#9ca3af' }}>Kirim: {order.tgl_kirim}</p>
                      </div>
                      <p style={{ fontWeight: 800, fontSize: 13 }}>{formatRupiah(order.total)}</p>
                    </div>
                    <div style={{ background: '#fefce8', borderRadius: 8, padding: '8px 10px', fontSize: 12, fontWeight: 600, color: '#78350f' }}>
                      {(order.order_items || []).map((it, i) => <span key={i}>{it.qty}x {it.nama}{i < order.order_items.length - 1 ? ', ' : ''}</span>)}
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                      <button onClick={() => sendWhatsApp(order)} style={{ flex: 1, background: '#f0fdf4', border: 'none', borderRadius: 9, padding: '8px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><Send size={12} /> WA</button>
                      {order.status_bayar !== 'Lunas' && <button onClick={() => confirmPayment(order.id)} style={{ flex: 1, background: '#f0fdf4', border: 'none', borderRadius: 9, padding: '8px 0', fontSize: 11, fontWeight: 700, cursor: 'pointer', color: '#16a34a' }}>Konfirmasi Bayar</button>}
                      <button onClick={() => cancelOrder(order)} style={{ background: '#fef2f2', border: 'none', borderRadius: 9, padding: '8px 10px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Regular orders */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Daftar Pesanan</p>
              {filteredOrders.filter(o => !o.is_po && o.tgl_kirim <= todayStr()).length === 0 && (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#9ca3af' }}>
                  <ShoppingCart size={28} style={{ opacity: 0.2, margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 12, fontWeight: 600 }}>Belum ada pesanan</p>
                </div>
              )}
              {filteredOrders.filter(o => !o.is_po && o.tgl_kirim <= todayStr()).map(order => (
                <div key={order.id} className="card" style={{ padding: 16, marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <p style={{ fontWeight: 800, fontSize: 14 }}>{order.nama}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af' }}>Order: {friendlyDate(order.tgl_order)} · Kirim: {order.tgl_kirim}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span className={`badge ${order.status_bayar === 'Lunas' ? 'badge-green' : 'badge-red'}`}>{order.status_bayar}</span>
                      <button onClick={() => { setEditingTransaction({ ...order, _newTglOrder: order.tgl_order, _newTglKirim: order.tgl_kirim }); setActiveModal('editTanggalOrder'); }} style={{ background: '#f3f4f6', border: 'none', borderRadius: 7, padding: 5, cursor: 'pointer', color: '#9ca3af', display: 'flex' }}><Edit2 size={12} /></button>
                    </div>
                  </div>
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
                    {(order.order_items || []).map((it, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, padding: '3px 0', color: '#374151' }}>
                        <span>{it.qty}x {it.nama}</span><span style={{ fontWeight: 700 }}>{formatRupiah(it.qty * (it.harga || 0))}</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 13 }}>
                      <span>Total</span><span>{formatRupiah(order.total)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {order.status_bayar !== 'Lunas' && <button onClick={() => confirmPayment(order.id)} style={{ flex: 1, background: '#f0fdf4', border: 'none', borderRadius: 10, padding: '9px 0', fontSize: 12, fontWeight: 700, cursor: 'pointer', color: '#16a34a' }}>✓ Konfirmasi Bayar</button>}
                    <button onClick={() => sendWhatsApp(order)} style={{ background: '#f0fdf4', border: 'none', borderRadius: 10, padding: '9px 12px', cursor: 'pointer', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}><Send size={14} /></button>
                    <button onClick={() => cancelOrder(order)} style={{ background: '#fef2f2', border: 'none', borderRadius: 10, padding: '9px 12px', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── JADWAL KIRIM ── */}
        {activeTab === 'jadwal' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
            {/* Calendar toggle */}
            <button onClick={() => setCalendarOpen(p => !p)} style={{ width: '100%', background: 'white', border: '1.5px solid #e5e7eb', borderRadius: 14, padding: '11px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: '#111827', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Calendar size={15} color="#3b82f6" /> {selectedCalDay ? `Tanggal: ${selectedCalDay}` : 'Lihat Kalender'}</div>
              <ChevronDown size={15} style={{ transform: calendarOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#9ca3af' }} />
            </button>

            {calendarOpen && (
              <div className="card" style={{ padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <button onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 16, color: '#374151' }}>‹</button>
                  <p style={{ fontWeight: 800, fontSize: 13 }}>{MONTHS_ID[calendarDate.getMonth()]} {calendarDate.getFullYear()}</p>
                  <button onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '5px 12px', cursor: 'pointer', fontWeight: 700, fontSize: 16, color: '#374151' }}>›</button>
                </div>
                <div className="calendar-grid" style={{ marginBottom: 6 }}>
                  {DAYS_ID.map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 10, fontWeight: 800, color: '#9ca3af', padding: '3px 0' }}>{d}</div>)}
                </div>
                <div className="calendar-grid">
                  {calDays.days.map((d, i) => {
                    if (!d) return <div key={i} />;
                    const ds = d.toISOString().split('T')[0];
                    return (
                      <div key={i} className={`cal-day ${ds === todayStr() && ds !== selectedCalDay ? 'today' : ''} ${ds === selectedCalDay ? 'selected' : ''} ${calDays.orderDates.has(ds) ? 'has-order' : ''}`} onClick={() => setSelectedCalDay(ds === selectedCalDay ? null : ds)}>
                        {d.getDate()}
                      </div>
                    );
                  })}
                </div>
                {selectedCalDay && (
                  <button onClick={() => { setCustomerForm(f => ({ ...f, tgl_kirim: selectedCalDay })); setOrderStep(1); setActiveModal('newOrder'); }} style={{ marginTop: 12, width: '100%', background: '#fde047', color: '#111827', border: 'none', borderRadius: 10, padding: '10px 0', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <Plus size={14} /> Tambah Order untuk {selectedCalDay}
                  </button>
                )}
              </div>
            )}

            {deliveryList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px 0', color: '#9ca3af' }}>
                <Coffee size={32} style={{ opacity: 0.2, margin: '0 auto 10px' }} />
                <p style={{ fontWeight: 700, fontSize: 12 }}>Tidak ada jadwal kirim</p>
              </div>
            ) : deliveryList.map(order => (
              <div key={order.id} className="card" style={{ padding: 16, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: order.delivery_status === 'Selesai' ? '#16a34a' : order.delivery_status === 'Dikirim' ? '#f59e0b' : '#e5e7eb', borderRadius: '2px 0 0 2px' }} />
                <div style={{ paddingLeft: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <p style={{ fontWeight: 800, fontSize: 14 }}>{order.nama}</p>
                        {order.is_po && <span className="po-tag"><Clock size={9} /> PO</span>}
                      </div>
                      <p style={{ fontSize: 11, color: '#9ca3af' }}><MapPin size={10} style={{ display: 'inline' }} /> {order.alamat}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>Kirim: {order.tgl_kirim}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                      <span className={`badge ${order.status_bayar === 'Lunas' ? 'badge-green' : 'badge-red'}`}>{order.status_bayar}</span>
                      <button onClick={() => sendWhatsApp(order)} style={{ background: '#f0fdf4', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}><Send size={12} /> WA</button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {['Menunggu','Dikirim','Selesai'].map(s => (
                      <button key={s} onClick={() => updateDeliveryStatus(order.id, s)} style={{ flex: 1, border: 'none', borderRadius: 9, padding: '8px 4px', fontSize: 10, fontWeight: 700, cursor: 'pointer', background: order.delivery_status === s ? (s === 'Selesai' ? '#16a34a' : s === 'Dikirim' ? '#f59e0b' : '#111827') : '#f3f4f6', color: order.delivery_status === s ? 'white' : '#9ca3af', transition: 'all 0.15s' }}>{s}</button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* BOTTOM NAV */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, maxWidth: 640, margin: '0 auto', background: 'white', borderTop: '1px solid #e5e7eb', padding: '8px 8px 20px', display: 'flex', justifyContent: 'space-around', zIndex: 50 }}>
        {[
          { key: 'ringkasan', icon: <BarChart2 size={21} />, label: 'Ringkasan' },
          { key: 'pembelian', icon: <ShoppingBag size={21} />, label: 'Beli' },
          { key: 'gudang', icon: <Package size={21} />, label: 'Gudang' },
          { key: 'penjualan', icon: <ShoppingCart size={21} />, label: 'Jual' },
          { key: 'jadwal', icon: <Truck size={21} />, label: 'Jadwal' },
        ].map(({ key, icon, label }) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`nav-item ${activeTab === key ? 'active' : ''}`}>
            {icon}<span>{label}</span>
          </button>
        ))}
      </nav>

      {/* ── MODALS ── */}

      {/* SETTINGS */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900 }}>Profil UMKM</h3>
              <button onClick={() => setShowSettings(false)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500, marginBottom: 18 }}>{user.email}</p>
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="label">Nama UMKM</label><input className="input" placeholder="Nama usaha" value={profileForm.nama_umkm} onChange={e => setProfileForm({ ...profileForm, nama_umkm: e.target.value })} /></div>
              <div><label className="label">Nama Pengguna</label><input className="input" placeholder="Nama kamu" value={profileForm.nama_user} onChange={e => setProfileForm({ ...profileForm, nama_user: e.target.value })} /></div>
              <div><label className="label">Tentang Usaha</label><textarea className="input" rows={2} style={{ resize: 'none' }} placeholder="Deskripsi singkat" value={profileForm.tentang} onChange={e => setProfileForm({ ...profileForm, tentang: e.target.value })} /></div>
              <div><label className="label">Domisili</label><input className="input" placeholder="Kota, Provinsi" value={profileForm.domisili} onChange={e => setProfileForm({ ...profileForm, domisili: e.target.value })} /></div>
              <button type="submit" disabled={isSaving} className="btn btn-dark" style={{ marginTop: 4 }}>{isSaving ? <Loader2 size={17} className="animate-spin" /> : 'Simpan Profil'}</button>
            </form>
            <button onClick={handleLogout} className="btn btn-ghost" style={{ marginTop: 10, color: '#ef4444', borderColor: '#fecaca' }}><LogOut size={15} /> Keluar</button>
          </div>
        </div>
      )}

      {/* NEW ORDER — 2-step flow */}
      {activeModal === 'newOrder' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <h3 style={{ fontSize: 18, fontWeight: 900 }}>Order Baru</h3>
              <button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}><X size={16} /></button>
            </div>
            {/* Step indicator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, marginTop: 12 }}>
              {[1, 2].map(step => (
                <React.Fragment key={step}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: orderStep >= step ? '#111827' : '#f3f4f6', color: orderStep >= step ? 'white' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>{step}</div>
                  {step < 2 && <div style={{ flex: 1, height: 2, background: orderStep > step ? '#111827' : '#e5e7eb', borderRadius: 1 }} />}
                </React.Fragment>
              ))}
              <span style={{ fontSize: 12, fontWeight: 600, color: '#9ca3af', marginLeft: 6 }}>
                {orderStep === 1 ? 'Detail Pelanggan' : 'Pilih Produk'}
              </span>
            </div>

            {/* Step 1: Customer details */}
            {orderStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div><label className="label">Nama Pelanggan</label><input required className="input" placeholder="Nama pembeli" value={customerForm.nama} onChange={e => setCustomerForm({ ...customerForm, nama: e.target.value })} /></div>
                <div><label className="label">No. WhatsApp</label><input className="input" placeholder="628xxxxxxxxx" value={customerForm.wa} onChange={e => setCustomerForm({ ...customerForm, wa: e.target.value })} /></div>
                <div><label className="label">Alamat Pengiriman</label><textarea className="input" rows={2} style={{ resize: 'none' }} value={customerForm.alamat} onChange={e => setCustomerForm({ ...customerForm, alamat: e.target.value })} /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div><label className="label">Tgl Order</label><input type="date" className="input" value={customerForm.tgl_order} onChange={e => setCustomerForm({ ...customerForm, tgl_order: e.target.value })} /></div>
                  <div><label className="label">Tgl Kirim</label><input type="date" className="input" value={customerForm.tgl_kirim} onChange={e => setCustomerForm({ ...customerForm, tgl_kirim: e.target.value })} /></div>
                </div>
                {customerForm.tgl_kirim > todayStr() && (
                  <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 10, padding: 10, fontSize: 12, fontWeight: 600, color: '#92400e', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Clock size={13} /> Tanggal kirim di masa depan — akan dicatat sebagai Pre-Order
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div><label className="label">Metode Bayar</label><select className="input" value={customerForm.metode_bayar} onChange={e => setCustomerForm({ ...customerForm, metode_bayar: e.target.value })}><option>Cash</option><option>Transfer</option><option>QRIS</option></select></div>
                  <div><label className="label">Status Bayar</label><select className="input" value={customerForm.status_bayar} onChange={e => setCustomerForm({ ...customerForm, status_bayar: e.target.value })}><option>Belum Bayar</option><option>Lunas</option></select></div>
                </div>
                <button className="btn btn-dark" onClick={() => { if (!customerForm.nama.trim()) { showToast('Isi nama pelanggan dulu', 'error'); return; } setOrderStep(2); }} style={{ marginTop: 4 }}>
                  Pilih Produk <ArrowRight size={16} />
                </button>
              </div>
            )}

            {/* Step 2: Item selection */}
            {orderStep === 2 && (
              <form onSubmit={handleCheckout} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', marginBottom: 4 }}>Untuk: <strong style={{ color: '#111827' }}>{customerForm.nama}</strong> · Kirim: {customerForm.tgl_kirim}</p>
                
                {/* Products to pick */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {inventory.filter(i => i.type === 'finished').map(prod => {
                    const inCart = cart.find(c => c.id === prod.id);
                    return (
                      <div key={prod.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: inCart ? '#f0fdf4' : '#f9fafb', borderRadius: 12, padding: '10px 14px', border: inCart ? '1.5px solid #bbf7d0' : '1.5px solid transparent' }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 13 }}>{prod.nama}</p>
                          <p style={{ fontSize: 11, color: prod.harga ? '#16a34a' : '#ef4444', fontWeight: 600 }}>{prod.harga ? formatRupiah(prod.harga) : '⚠ Set harga dulu'}</p>
                          <p style={{ fontSize: 10, color: '#9ca3af' }}>Stok: {prod.stok} {prod.satuan}</p>
                        </div>
                        {inCart ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'white', borderRadius: 10, padding: '5px 12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                            <button type="button" onClick={() => removeFromCart(prod.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', display: 'flex' }}><Minus size={14} /></button>
                            <span style={{ fontWeight: 900, fontSize: 14, minWidth: 16, textAlign: 'center' }}>{inCart.qty}</span>
                            <button type="button" onClick={() => addToCart(prod)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', display: 'flex' }}><Plus size={14} /></button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => addToCart(prod)} style={{ background: '#111827', color: 'white', border: 'none', borderRadius: 9, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Tambah</button>
                        )}
                      </div>
                    );
                  })}
                  {inventory.filter(i => i.type === 'finished').length === 0 && (
                    <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', padding: '20px 0' }}>Belum ada produk siap jual</p>
                  )}
                </div>

                {/* Total bar */}
                {cart.length > 0 && (
                  <div style={{ background: '#111827', borderRadius: 14, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 600, color: '#6b7280', marginBottom: 2 }}>Total</p>
                      <p style={{ fontSize: 18, fontWeight: 900, color: '#fde047' }}>{formatRupiah(cart.reduce((a, b) => a + b.qty * (b.harga || 0), 0))}</p>
                    </div>
                    <button type="submit" disabled={isSaving || cart.length === 0} style={{ background: '#fde047', color: '#111827', border: 'none', borderRadius: 12, padding: '12px 20px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>
                      {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Proses Order'}
                    </button>
                  </div>
                )}
                <button type="button" className="btn btn-ghost" onClick={() => setOrderStep(1)}>← Kembali</button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* PEMBELIAN */}
      {activeModal === 'beli' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><h3 style={{ fontSize: 18, fontWeight: 900 }}>Tambah Pembelian</h3><button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}><X size={16} /></button></div>
            <form onSubmit={handleAddPurchase} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="label">Nama Barang</label><input required className="input" placeholder="Tepung Terigu" value={purchaseForm.nama_barang} onChange={e => setPurchaseForm({ ...purchaseForm, nama_barang: e.target.value })} /></div>
              <div><label className="label">Supplier / Toko</label><input className="input" placeholder="Dari mana belinya?" value={purchaseForm.supplier} onChange={e => setPurchaseForm({ ...purchaseForm, supplier: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div><label className="label">Jumlah</label><input required type="number" className="input" placeholder="0" value={purchaseForm.jumlah} onChange={e => setPurchaseForm({ ...purchaseForm, jumlah: e.target.value })} /></div>
                <div><label className="label">Satuan</label><select className="input" value={purchaseForm.satuan} onChange={e => setPurchaseForm({ ...purchaseForm, satuan: e.target.value })}>{['pcs','kg','gr','liter','ml','pak','lusin','karton'].map(s => <option key={s}>{s}</option>)}</select></div>
              </div>
              <div><label className="label">Harga Satuan (Rp)</label><input required type="number" className="input" placeholder="0" value={purchaseForm.harga_satuan} onChange={e => setPurchaseForm({ ...purchaseForm, harga_satuan: e.target.value })} /></div>
              <div><label className="label">Tanggal</label><input type="date" className="input" value={purchaseForm.tanggal} onChange={e => setPurchaseForm({ ...purchaseForm, tanggal: e.target.value })} /></div>
              <button type="submit" disabled={isSaving} className="btn btn-dark" style={{ marginTop: 4 }}>{isSaving ? <Loader2 size={17} className="animate-spin" /> : 'Simpan Pembelian'}</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TANGGAL PEMBELIAN */}
      {activeModal === 'editTanggalBeli' && editingTransaction && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: 17, fontWeight: 900, marginBottom: 16 }}>Edit Tanggal Pembelian</h3>
            <p style={{ fontWeight: 600, marginBottom: 14, fontSize: 14 }}>{editingTransaction.nama_barang}</p>
            <form onSubmit={handleEditPurchaseDate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="label">Tanggal</label><input type="date" className="input" value={editingTransaction._newDate} onChange={e => setEditingTransaction({ ...editingTransaction, _newDate: e.target.value })} /></div>
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? '...' : 'Simpan'}</button>
            </form>
          </div>
        </div>
      )}

      {/* RESEP */}
      {activeModal === 'resep' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><h3 style={{ fontSize: 18, fontWeight: 900 }}>Tambah Resep</h3><button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}><X size={16} /></button></div>
            <form onSubmit={handleAddRecipe} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="label">Nama Produk Output</label><input required className="input" placeholder="Roti Tawar" value={recipeForm.nama} onChange={e => setRecipeForm({ ...recipeForm, nama: e.target.value })} /></div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div><label className="label">Output/Batch</label><input required type="number" className="input" value={recipeForm.jumlah_output} onChange={e => setRecipeForm({ ...recipeForm, jumlah_output: e.target.value })} /></div>
                <div><label className="label">Satuan</label><select className="input" value={recipeForm.satuan_output} onChange={e => setRecipeForm({ ...recipeForm, satuan_output: e.target.value })}>{['pcs','loyang','lusin','pak','kg','gr'].map(s => <option key={s}>{s}</option>)}</select></div>
                <div><label className="label">Jenis Output</label>
                  <select className="input" value={recipeForm.output_type || 'finished'} onChange={e => setRecipeForm({ ...recipeForm, output_type: e.target.value })}>
                    <option value="semi">½ Jadi</option>
                    <option value="finished">Produk</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Bahan-bahan</label>
                {recipeForm.ingredients.map((ing, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                    <select required className="input" style={{ flex: 2 }} value={ing.nama_bahan} onChange={e => { const n = [...recipeForm.ingredients]; n[i].nama_bahan = e.target.value; setRecipeForm({ ...recipeForm, ingredients: n }); }}>
                      <option value="">Pilih Bahan</option>
                      {inventory.filter(it => it.type === 'raw' || it.type === 'semi').map(it => <option key={it.id} value={it.nama}>{it.nama} ({INVENTORY_TYPES[it.type]?.label})</option>)}
                    </select>
                    <input required type="number" placeholder="Qty" className="input" style={{ width: 64 }} value={ing.qty} onChange={e => { const n = [...recipeForm.ingredients]; n[i].qty = e.target.value; setRecipeForm({ ...recipeForm, ingredients: n }); }} />
                    <select className="input" style={{ width: 72 }} value={ing.satuan} onChange={e => { const n = [...recipeForm.ingredients]; n[i].satuan = e.target.value; setRecipeForm({ ...recipeForm, ingredients: n }); }}>{['pcs','kg','gr','liter','ml'].map(s => <option key={s}>{s}</option>)}</select>
                    {recipeForm.ingredients.length > 1 && <button type="button" onClick={() => setRecipeForm({ ...recipeForm, ingredients: recipeForm.ingredients.filter((_, idx) => idx !== i) })} style={{ background: '#fef2f2', border: 'none', borderRadius: 9, padding: '0 8px', cursor: 'pointer', color: '#ef4444' }}><X size={13} /></button>}
                  </div>
                ))}
                <button type="button" onClick={() => setRecipeForm({ ...recipeForm, ingredients: [...recipeForm.ingredients, { nama_bahan: '', qty: '', satuan: 'pcs' }] })} style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', borderRadius: 9, padding: '7px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Tambah Bahan</button>
              </div>
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? <Loader2 size={17} className="animate-spin" /> : 'Simpan Resep'}</button>
            </form>
          </div>
        </div>
      )}

      {/* PRODUKSI */}
      {activeModal === 'produksi' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}><h3 style={{ fontSize: 18, fontWeight: 900 }}>Mulai Produksi</h3><button onClick={closeModal} style={{ background: '#f3f4f6', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', display: 'flex' }}><X size={16} /></button></div>
            <form onSubmit={handleProduction} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="label">Produk / Resep</label>
                <select required className="input" value={prodForm.recipe_id} onChange={e => setProdForm({ ...prodForm, recipe_id: e.target.value })}>
                  <option value="">Pilih resep</option>
                  {recipes.map(r => <option key={r.id} value={r.id}>{r.nama} ({r.jumlah_output} {r.satuan_output}/batch)</option>)}
                </select>
              </div>
              <div><label className="label">Jumlah Batch</label><input required type="number" min={1} className="input" value={prodForm.qty} onChange={e => setProdForm({ ...prodForm, qty: e.target.value })} /></div>
              {prodForm.recipe_id && (() => {
                const r = recipes.find(x => x.id === Number(prodForm.recipe_id));
                return r ? (
                  <div style={{ background: '#f0fdf4', borderRadius: 10, padding: '10px 14px', fontSize: 13, fontWeight: 700, color: '#16a34a' }}>
                    Output: {Number(prodForm.qty) * Number(r.jumlah_output)} {r.satuan_output} {r.nama}
                  </div>
                ) : null;
              })()}
              <div><label className="label">Tanggal Produksi</label><input type="date" className="input" value={prodForm.tanggal} onChange={e => setProdForm({ ...prodForm, tanggal: e.target.value })} /></div>
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? <Loader2 size={17} className="animate-spin" /> : 'Jalankan Produksi'}</button>
            </form>
          </div>
        </div>
      )}

      {/* SET HARGA */}
      {activeModal === 'setHarga' && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: 17, fontWeight: 900, marginBottom: 4 }}>Set Harga Jual</h3>
            <p style={{ fontWeight: 600, marginBottom: 16, color: '#374151', fontSize: 14 }}>{selectedItem.nama}</p>
            <form onSubmit={handleSetPrice} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="label">Harga Jual (Rp)</label><input required type="number" className="input" placeholder="0" value={priceForm.harga} onChange={e => setPriceForm({ harga: e.target.value })} /></div>
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? '...' : 'Simpan Harga'}</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TANGGAL ORDER */}
      {activeModal === 'editTanggalOrder' && editingTransaction && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: 17, fontWeight: 900, marginBottom: 16 }}>Edit Tanggal Pesanan</h3>
            <p style={{ fontWeight: 600, marginBottom: 14, fontSize: 14 }}>{editingTransaction.nama}</p>
            <form onSubmit={handleEditOrderDates} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div><label className="label">Tanggal Order</label><input type="date" className="input" value={editingTransaction._newTglOrder} onChange={e => setEditingTransaction({ ...editingTransaction, _newTglOrder: e.target.value })} /></div>
              <div><label className="label">Tanggal Kirim</label><input type="date" className="input" value={editingTransaction._newTglKirim} onChange={e => setEditingTransaction({ ...editingTransaction, _newTglKirim: e.target.value })} /></div>
              <button type="submit" disabled={isSaving} className="btn btn-dark">{isSaving ? '...' : 'Simpan'}</button>
            </form>
          </div>
        </div>
      )}

      {/* REMOVE ITEM */}
      {activeModal === 'remove' && selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <h3 style={{ fontSize: 17, fontWeight: 900, color: '#ef4444', marginBottom: 4 }}>Hapus Stok</h3>
            <p style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>{selectedItem.nama} (stok: {selectedItem.stok} {selectedItem.satuan})</p>
            <form onSubmit={handleRemoveItem} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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

// ─── ROOT APP ──────────────────────────────────────────────────────────────────
const App = () => {
  const [session, setSession] = useState(undefined);
  const [profile, setProfile] = useState(null);
  const [checkingProfile, setCheckingProfile] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
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
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#111827' }}>
        <style>{THEME}</style>
        <Loader2 size={28} color="#fde047" className="animate-spin" />
        <p style={{ color: '#6b7280', fontSize: 11, fontWeight: 700, marginTop: 14, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Memuat...</p>
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
