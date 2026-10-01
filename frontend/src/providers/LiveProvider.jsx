'use client';

import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { logger } from '@/lib/logger';
import { hardNavigate, loginUrl } from '@/lib/navigation';
import { usePrefs } from './PrefsProvider';
import { useToast } from './ToastProvider';

const LiveContext = createContext(null);
export const useLive = () => useContext(LiveContext);

const MAX_SALES = 25, MAX_ALERTS = 30;

// One EventSource for the whole app. It feeds: the live sales list, the notification bell, map pulses,
// and `version` — a counter that data hooks watch so on-screen numbers refresh from the server's
// current state. Reconnects automatically; closes while the tab is hidden or the feed is switched off.
export function LiveProvider({ children }) {
  const { prefs } = usePrefs();
  const { toast } = useToast();
  const [status, setStatus] = useState('connecting'); // connecting | live | offline | paused | off
  const [snap, setSnap] = useState({ version: 0, todayCr: 0, ordersPerMin: 0 });
  const [sales, setSales] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const pulses = useRef({}); // slug -> timestamp of the latest sale (read by the 3D map every frame, no re-render)

  useEffect(() => {
    if (!prefs.liveFeed) return undefined;
    let es = null, retryCheck = 0;

    const onSale = e => {
      const s = JSON.parse(e.data);
      pulses.current[s.slug] = Date.now();
      setSales(list => [s, ...list].slice(0, MAX_SALES));
    };
    const onAlert = e => {
      const a = JSON.parse(e.data);
      setAlerts(list => [{ ...a, read: false }, ...list].slice(0, MAX_ALERTS));
      toast(`${a.title} — ${a.message}`, { tone: a.severity === 'warning' ? 'warning' : 'info', ms: 7000 });
    };

    const connect = () => {
      if (es || document.hidden) return;
      setStatus('connecting');
      es = new EventSource('/api/live');
      es.addEventListener('hello', e => { const d = JSON.parse(e.data); setSnap(d); setSales(d.recent ?? []); setStatus('live'); });
      es.addEventListener('tick', e => setSnap(JSON.parse(e.data)));
      es.addEventListener('sale', onSale);
      es.addEventListener('alert', onAlert);
      es.onerror = async () => {
        setStatus('offline'); // the browser retries on its own; check whether the cause is an expired session
        if (Date.now() - retryCheck < 15_000) return;
        retryCheck = Date.now();
        try {
          const r = await fetch('/api/auth/me', { cache: 'no-store' });
          if (r.status === 401) hardNavigate(loginUrl());
        } catch { /* offline — keep retrying */ }
      };
    };
    const disconnect = () => { es?.close(); es = null; };
    const onVisibility = () => {
      if (document.hidden) { disconnect(); setStatus('paused'); } else connect();
    };

    connect();
    document.addEventListener('visibilitychange', onVisibility);
    return () => { document.removeEventListener('visibilitychange', onVisibility); disconnect(); };
  }, [prefs.liveFeed, toast]);

  const value = useMemo(() => ({
    status: prefs.liveFeed ? status : 'off', version: snap.version, todayCr: snap.todayCr, ordersPerMin: snap.ordersPerMin, sales, alerts, pulses,
    unread: alerts.filter(a => !a.read).length,
    markAllRead: () => setAlerts(list => list.map(a => ({ ...a, read: true }))),
    markRead: id => setAlerts(list => list.map(a => (a.id === id ? { ...a, read: true } : a)))
  }), [status, prefs.liveFeed, snap, sales, alerts]);

  useEffect(() => { if (status === 'offline') logger.warn('live_feed_offline'); }, [status]);

  return <LiveContext.Provider value={value}>{children}</LiveContext.Provider>;
}
