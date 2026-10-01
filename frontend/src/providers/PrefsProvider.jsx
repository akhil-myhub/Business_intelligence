'use client';

import React, { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore } from 'react';
import { DEFAULT_FILTERS } from '@/lib/filters';

const KEY = 'businessai.prefs.v1';
const DEFAULT_PREFS = { effects3d: true, liveFeed: true, defaultRegion: DEFAULT_FILTERS.region, defaultPeriod: DEFAULT_FILTERS.period };

const PrefsContext = createContext(null);
export const usePrefs = () => useContext(PrefsContext);

// localStorage as an external store: identical markup on server and first client render, then the
// saved preferences apply without a hydration mismatch.
const listeners = new Set();
const subscribe = cb => {
  listeners.add(cb);
  window.addEventListener('storage', cb);
  return () => { listeners.delete(cb); window.removeEventListener('storage', cb); };
};
const readRaw = () => { try { return localStorage.getItem(KEY) ?? ''; } catch { return ''; } };
const serverRaw = () => '';

function parse(raw) {
  try { return { ...DEFAULT_PREFS, ...(raw ? JSON.parse(raw) : {}) }; } catch { return DEFAULT_PREFS; }
}

// User preferences (persisted in this browser) + the filters the user last chose this session,
// so moving between screens keeps the region/period/product they are working with.
export function PrefsProvider({ children }) {
  const raw = useSyncExternalStore(subscribe, readRaw, serverRaw);
  const prefs = useMemo(() => parse(raw), [raw]);
  const [session, setSession] = useState({ filters: {}, touched: {} });

  const update = useCallback(patch => {
    try { localStorage.setItem(KEY, JSON.stringify({ ...parse(readRaw()), ...patch })); } catch { /* storage unavailable */ }
    listeners.forEach(cb => cb());
  }, []);

  const remember = useCallback(patch => setSession(s => ({
    filters: { ...s.filters, ...patch },
    touched: { ...s.touched, ...Object.fromEntries(Object.keys(patch).map(k => [k, true])) }
  })), []);

  const value = useMemo(() => ({
    prefs, update, remember,
    sessionFilters: session.filters, touched: session.touched,
    baseFilters: { region: prefs.defaultRegion, period: prefs.defaultPeriod, product: 'All Products' }
  }), [prefs, update, remember, session]);

  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}
