'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell, BarChart3, Bot, BrainCircuit, CornerDownLeft, Globe2, Home, LayoutGrid, LogOut, MapPin, Megaphone, Package,
  Search, Settings, Sparkles, Store, TrendingDown, TrendingUp, Users, Info
} from 'lucide-react';
import { NAV, PAGES, PRODUCT_OPTIONS, STATE_OPTIONS } from '@/lib/catalog';
import { logger } from '@/lib/logger';
import { hardNavigate } from '@/lib/navigation';
import { ToastProvider, useToast } from '@/providers/ToastProvider';
import { PrefsProvider } from '@/providers/PrefsProvider';
import { LiveProvider, useLive } from '@/providers/LiveProvider';
import { AavtorLogo } from './AavtorLogo';
import { ErrorBoundary } from './ErrorBoundary';

const NAV_ICONS = { ask: Bot, products: LayoutGrid, market: Globe2, stores: Store, campaigns: Megaphone, reports: BarChart3 };
const RAIL = [['ask', Home], ['products', Package], ['market', BarChart3], ['stores', MapPin], ['campaigns', Users], ['reports', Store]];

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = e => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  return { open, setOpen, ref };
}

const timeAgo = ts => {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  return s < 60 ? `${s}s ago` : s < 3600 ? `${Math.round(s / 60)}m ago` : `${Math.round(s / 3600)}h ago`;
};

/* ── rail + top nav ─────────────────────────────────────────────── */
function Rail({ activeId }) {
  const pathname = usePathname();
  return (
    <aside className="rail" aria-label="Primary">
      {RAIL.map(([id, Icon]) => {
        const item = NAV.find(n => n.id === id);
        const I = id === 'ask' && activeId === 'ask' && pathname !== '/' ? BrainCircuit : Icon;
        return <Link key={id} href={item.href} className={activeId === id ? 'on' : ''} title={item.label} aria-label={item.label} aria-current={activeId === id ? 'page' : undefined}><I size={22} strokeWidth={1.8} /></Link>;
      })}
      <span className="grow" />
      <Link href="/settings" className={pathname.startsWith('/settings') ? 'on' : ''} title="Settings" aria-label="Settings"><Settings size={22} strokeWidth={1.8} /></Link>
    </aside>
  );
}

// Brand: Aavtor mark + product wordmark, links home.
function Brand() {
  return (
    <Link href="/" className="brand-link" aria-label="BusinessAI by Aavtor — home">
      <AavtorLogo tile size={36} />
      <span className="brand-word"><b>BusinessAI</b><small>by Aavtor</small></span>
    </Link>
  );
}

function LiveBadge() {
  const { status } = useLive();
  const map = { live: ['Live', ''], connecting: ['Connecting', 'paused'], offline: ['Reconnecting', 'paused'], paused: ['Paused', 'paused'], off: ['Live off', 'paused'] };
  const [label, cls] = map[status] ?? map.connecting;
  return <span className={'live-pill ' + cls} role="status" title="Real-time data feed"><i />{label}</span>;
}

function Bell_() {
  const { alerts, unread, markAllRead, markRead } = useLive();
  const { open, setOpen, ref } = usePopover();
  const router = useRouter();
  return (
    <div className="pop" ref={ref}>
      <button className="icon-btn" aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`} aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <Bell size={20} />{unread > 0 && <b className="badge">{unread > 9 ? '9+' : unread}</b>}
      </button>
      {open && (
        <div className="menu notif" role="menu">
          <div className="menu-head"><strong>Notifications</strong><button onClick={markAllRead} disabled={!unread}>Mark all read</button></div>
          {alerts.length === 0 && <p className="menu-empty">No alerts yet. Live demand surges and slowdowns will appear here.</p>}
          {alerts.map(a => (
            <button key={a.id} role="menuitem" className={'notif-item' + (a.read ? '' : ' unread')}
              onClick={() => { markRead(a.id); setOpen(false); if (a.path) router.push(a.path); }}>
              <span className={'notif-ico ' + a.severity}>{a.severity === 'positive' ? <TrendingUp size={16} /> : a.severity === 'warning' ? <TrendingDown size={16} /> : <Info size={16} />}</span>
              <span><b>{a.title}</b><small>{a.message}</small></span>
              <time>{timeAgo(a.ts)}</time>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function UserMenu({ user }) {
  const { open, setOpen, ref } = usePopover();
  const { toast } = useToast();
  const signOut = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch (err) { logger.warn('logout_failed', { err }); toast('Could not reach the server, signing out locally.', { tone: 'warning' }); }
    hardNavigate('/login'); // full reload: drops all client state tied to the session
  };
  return (
    <div className="pop" ref={ref}>
      <button className="avatar" aria-label="Account menu" aria-expanded={open} onClick={() => setOpen(o => !o)}>{user.name[0]}</button>
      {open && (
        <div className="menu user" role="menu">
          <div className="menu-head col"><strong>{user.name}</strong><small>{user.email}</small><small className="role">{user.role}</small></div>
          <Link role="menuitem" href="/settings" onClick={() => setOpen(false)}><Settings size={16} /> Settings</Link>
          <button role="menuitem" onClick={signOut}><LogOut size={16} /> Sign out</button>
        </div>
      )}
    </div>
  );
}

/* ── command palette ────────────────────────────────────────────── */
function CommandPalette({ open, onClose }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);

  const results = useMemo(() => {
    const q = text.trim().toLowerCase();
    const match = s => !q || s.toLowerCase().includes(q);
    const out = [];
    if (q.length >= 3) out.push({ kind: 'Ask AI', label: `Ask: “${text.trim()}”`, hint: 'Answer this question with your data', icon: Sparkles, path: `/?ask=${encodeURIComponent(text.trim())}` });
    PAGES.filter(p => match(p.label) || match(p.hint)).forEach(p => out.push({ kind: 'Pages', label: p.label, hint: p.hint, icon: CornerDownLeft, path: p.path }));
    STATE_OPTIONS.filter(s => match(s.name)).slice(0, 6).forEach(s => out.push({ kind: 'States', label: s.name, hint: 'State drill-down', icon: MapPin, path: `/stores/${s.slug}` }));
    PRODUCT_OPTIONS.filter(p => match(p.name)).forEach(p => out.push({ kind: 'Products', label: p.name, hint: 'Product performance', icon: Package, path: `/products/${p.id}` }));
    return out.slice(0, 12);
  }, [text]);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);

  const go = useCallback(item => { onClose(); setText(''); setCursor(0); router.push(item.path); }, [router, onClose]);
  if (!open) return null;

  const active = Math.min(cursor, results.length - 1);
  const onKey = e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    else if (e.key === 'Enter' && results[active]) go(results[active]);
    else if (e.key === 'Escape') onClose();
  };

  return (
    <div className="palette-wrap" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="palette" role="dialog" aria-modal="true" aria-label="Search">
        <div className="palette-input"><Search size={18} />
          <input ref={inputRef} value={text} onChange={e => { setText(e.target.value); setCursor(0); }} onKeyDown={onKey} placeholder="Search pages, states, products — or ask a question…" aria-label="Search" />
          <kbd>Esc</kbd>
        </div>
        <ul role="listbox">
          {results.length === 0 && <li className="menu-empty">No matches.</li>}
          {results.map((r, i) => {
            const I = r.icon;
            return (
              <li key={`${r.kind}-${r.label}`} role="option" aria-selected={i === active} className={i === active ? 'on' : ''} onMouseEnter={() => setCursor(i)} onMouseDown={e => { e.preventDefault(); go(r); }}>
                <I size={16} /><span><b>{r.label}</b><small>{r.hint}</small></span><em>{r.kind}</em>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ── shell ──────────────────────────────────────────────────────── */
function Frame({ user, children }) {
  const pathname = usePathname();
  const [palette, setPalette] = useState(false);
  const activeId = NAV.find(n => n.match(pathname))?.id ?? (pathname.startsWith('/settings') ? 'settings' : 'ask');
  const drill = pathname.startsWith('/stores/');

  useEffect(() => {
    const onKey = e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(p => !p); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="app inapp">
      <div className="bg" />
      <a className="skip" href="#main">Skip to content</a>
      <Rail activeId={activeId} />
      <header className="topnav">
        <div className="tn-left">
          <Brand />
          <nav aria-label="Main">
            {NAV.filter(n => !drill || n.id === 'ask' || n.id === 'stores').map(n => {
              const Icon = NAV_ICONS[n.id];
              return <Link key={n.id} href={n.href} className={activeId === n.id ? 'on' : ''} aria-current={activeId === n.id ? 'page' : undefined}><Icon size={16} />{n.label}</Link>;
            })}
          </nav>
          <div id="crumb-slot" />
        </div>
        <div className="tn-right">
          <div id="header-slot" className="header-slot" />
          <LiveBadge />
          <button className="icon-btn" aria-label="Search (Ctrl+K)" title="Search (Ctrl+K)" onClick={() => setPalette(true)}><Search size={20} /></button>
          <Bell_ />
          <UserMenu user={user} />
        </div>
      </header>
      <main id="main" key={pathname}>
        <ErrorBoundary name={pathname}>{children}</ErrorBoundary>
      </main>
      <CommandPalette open={palette} onClose={() => setPalette(false)} />
    </div>
  );
}

export function AppShell({ user, children }) {
  return (
    <ToastProvider>
      <PrefsProvider>
        <LiveProvider>
          <Frame user={user}>{children}</Frame>
        </LiveProvider>
      </PrefsProvider>
    </ToastProvider>
  );
}
