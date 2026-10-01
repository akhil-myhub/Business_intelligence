'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { Rail, TopNav, Select } from './components/ui';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Login, Ask, Overview, Dashboard, Drill, Product, Market, Campaign, Reports } from './screens';
import { useLive } from './hooks/useLive';
import { runQuery } from './services/queryClient';
import { getInsights } from './data/mock';
import { logger } from './lib/logger';

// view ids: login | ask | overview | dashboard | drill | product | market | campaign | reports
const NAV_OF = { overview: 'ask', dashboard: 'ask', drill: 'stores' };

export default function App() {
  const [view, setView] = useState('login');
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(-1);
  const [data, setData] = useState(getInsights);
  const [notice, setNotice] = useState(null);
  const live = useLive();
  const abort = useRef(null);

  // Cancel any in-flight query on unmount so nothing writes to an unmounted tree.
  useEffect(() => () => abort.current?.abort(), []);

  useEffect(() => {
    if (!notice) return undefined;
    const t = setTimeout(() => setNotice(null), 8000);
    return () => clearTimeout(t);
  }, [notice]);

  const cancelQuery = useCallback(() => {
    abort.current?.abort();
    abort.current = null;
    setPhase('idle');
    setProgress(-1);
  }, []);

  const submit = async e => {
    e.preventDefault();
    const q = query.trim();
    if (!q || phase === 'processing') return;

    abort.current?.abort();
    const ctrl = new AbortController();
    abort.current = ctrl;
    setPhase('processing');
    setProgress(0);

    try {
      const { data: result, source, reason } = await runQuery(q, { onStep: setProgress, signal: ctrl.signal });
      if (ctrl.signal.aborted) return;
      setProgress(4);
      await new Promise(r => setTimeout(r, 500));
      if (ctrl.signal.aborted) return;
      setData(result);
      setView('overview');
      if (source === 'fallback') {
        setNotice(reason === 'rate_limited'
          ? 'Too many requests — showing the last available insights. Try again in a minute.'
          : 'Live analytics service is unavailable — showing the last available insights.');
      }
    } catch (err) {
      // runQuery only rejects on cancellation; anything else is unexpected and must not strand the UI.
      if (!ctrl.signal.aborted) {
        logger.error('submit_failed', { err });
        setNotice('Something went wrong running that question. Please try again.');
      }
    } finally {
      // Always leave the "processing" state, whatever happened, but only if we're still the current request.
      if (abort.current === ctrl) { abort.current = null; setPhase('idle'); setProgress(-1); }
    }
  };

  const nav = id => {
    if (id === 'ask') cancelQuery();
    setView(id === 'stores' ? 'drill' : id);
  };

  if (view === 'login') {
    return (
      <div className="app">
        <div className="bg" />
        <ErrorBoundary name="login"><Login onSignIn={() => setView('ask')} /></ErrorBoundary>
      </div>
    );
  }

  const active = NAV_OF[view] || view;
  const crumb = view === 'drill' ? <span className="crumb">✕ South India <ChevronRight size={14} /> Tamil Nadu</span> : null;
  const right = view === 'dashboard'
    ? <><Select value="All Regions" options={['All Regions', 'South India', 'North India']} /><Select value="Last 6 Months" options={['Last 6 Months', 'Last Quarter', 'Last Year']} /></>
    : view === 'drill'
      ? <><Select value="Last Quarter" options={['Last Quarter', 'Last 6 Months']} /><Select value="All Products" options={['All Products', 'Product A']} /></>
      : null;

  return (
    <div className="app inapp">
      <div className="bg" />
      <Rail active={active} onNav={nav} />
      <TopNav active={active} onNav={nav} crumb={crumb} right={right} compact={view === 'drill'} live={live} />
      <main key={view}>
        <ErrorBoundary name={view}>
          {view === 'ask' && <Ask query={query} setQuery={setQuery} onSubmit={submit} phase={phase} progress={progress} />}
          {view === 'overview' && <Overview live={live} data={data} onOpen={() => setView('dashboard')} />}
          {view === 'dashboard' && <Dashboard live={live} onDrill={() => setView('drill')} />}
          {view === 'drill' && <Drill live={live} />}
          {view === 'product' && <Product live={live} />}
          {view === 'market' && <Market />}
          {view === 'campaign' && <Campaign />}
          {view === 'reports' && <Reports live={live} />}
        </ErrorBoundary>
      </main>
      {notice && (
        <div className="notice" role="status" aria-live="polite">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)}>Dismiss</button>
        </div>
      )}
    </div>
  );
}
