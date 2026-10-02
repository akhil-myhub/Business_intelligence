'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { BrandLoader } from '@/components/BrandLoader';
import { useRouter, useSearchParams } from 'next/navigation';
import { Activity, ArrowRight, Briefcase, CircleHelp, Cpu, Globe2, History, ShoppingBag, Sparkles, Sun, TrendingUp, Trophy, TriangleAlert } from 'lucide-react';
import { PIPELINE } from '@/lib/pipeline';
import { logger } from '@/lib/logger';
import { runQuery } from '@/services/queryClient';
import { useLive } from '@/providers/LiveProvider';

const Orb = dynamic(() => import('@/three/Orb'), { ssr: false, loading: () => <BrandLoader overlay label="Loading assistant" tone="light" /> });

const SUGGESTIONS = [['Show sales trend', TrendingUp], ['Top performing products', Trophy], ['Why did sales drop?', CircleHelp], ['Market analysis', Globe2]];
const amount = cr => (cr >= 1 ? `₹ ${cr.toFixed(2)} Cr` : `₹ ${(cr * 100).toFixed(1)} L`);
const STEP_ICONS = [Sun, ShoppingBag, Cpu, Briefcase];
const RECENT_KEY = 'businessai.recent.v1';

const readRecent = () => { try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]').slice(0, 4); } catch { return []; } };
const saveRecent = q => { try { localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...readRecent().filter(x => x !== q)].slice(0, 6))); } catch { /* storage unavailable */ } };

export default function AskScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const { todayCr, ordersPerMin, sales, status } = useLive();
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | processing
  const [progress, setProgress] = useState(-1);
  const [error, setError] = useState('');
  const [recent, setRecent] = useState([]);
  const abort = useRef(null);
  const autoRan = useRef(false);

  useEffect(() => () => abort.current?.abort(), []); // leaving the page cancels the request
  useEffect(() => { const t = setTimeout(() => setRecent(readRecent()), 0); return () => clearTimeout(t); }, []);

  const ask = useCallback(async text => {
    const q = text.trim();
    if (!q || abort.current) return;
    const ctrl = new AbortController();
    abort.current = ctrl;
    setError(''); setPhase('processing'); setProgress(0);
    try {
      const result = await runQuery(q, { onStep: setProgress, signal: ctrl.signal });
      if (ctrl.signal.aborted) return;
      setProgress(4);
      saveRecent(q);
      await new Promise(r => setTimeout(r, 350));
      if (!ctrl.signal.aborted) router.push(result.path); // the answer lives at a real, shareable URL
    } catch (err) {
      if (ctrl.signal.aborted) return;
      logger.warn('ask_failed', { err });
      setError(err.status === 429 ? 'You are asking too quickly — wait a moment and try again.' : 'We could not answer that right now. Please try again.');
    } finally {
      if (abort.current === ctrl) { abort.current = null; setPhase('idle'); setProgress(-1); }
    }
  }, [router]);

  // /ask?ask=… (from the command palette) asks immediately, once.
  const preset = params.get('ask');
  useEffect(() => {
    if (preset && !autoRan.current) {
      autoRan.current = true;
      const t = setTimeout(() => { setQuery(preset); ask(preset); }, 0);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [preset, ask]);

  const processing = phase === 'processing';
  const onSubmit = e => { e.preventDefault(); ask(query); };

  return (
    <div className={'ask ' + (processing ? 'processing' : '')}>
      {!processing && (
        <div className="hero-copy">
          <span className="eyebrow"><i className={status === 'live' ? 'on' : ''} />AI business analyst · live across 30 states</span>
          <h1>Turn Your Data Into<br /><span><em>Smarter</em> <em>Decisions</em></span></h1>
          <p>Ask anything about your business. Get real-time insights.</p>
        </div>
      )}
      <form className="chatbar" onSubmit={onSubmit}>
        <span className="ai-ico"><Sparkles size={20} /></span>
        <input value={query} onChange={e => setQuery(e.target.value)} disabled={processing} placeholder="Ask a question about your data..." aria-label="Ask a question" autoFocus maxLength={300} />
        <button type="submit" aria-label="Send" disabled={processing || !query.trim()}><ArrowRight size={22} /></button>
      </form>
      {error && <p className="ask-error" role="alert"><TriangleAlert size={16} /> {error}</p>}
      {!processing && (
        <>
          <div className="chips">{SUGGESTIONS.map(([s, I]) => <button key={s} onClick={() => { setQuery(s); ask(s); }}><I size={15} />{s}</button>)}</div>
          {recent.length > 0 && <div className="chips recent" aria-label="Recent questions"><History size={14} />{recent.map(s => <button key={s} onClick={() => { setQuery(s); ask(s); }}>{s}</button>)}</div>}
          {status === 'live' && (
            <div className="hero-stats" aria-label="Live business pulse">
              <section className="hs-card left">
                <small><Activity size={13} /> Revenue today</small>
                <b className="hs-big">₹ {todayCr.toFixed(2)} <em>Cr</em></b>
                <div className="hs-row"><span>Orders / min</span><b>{ordersPerMin}</b></div>
                <div className="hs-row"><span>Coverage</span><b>30 states</b></div>
              </section>
              <section className="hs-card right">
                <small><span className="hs-dot" /> Latest orders</small>
                <ul>{sales.slice(0, 3).map(s => <li key={s.id}><span><b>{s.state}</b><em>{s.product} · {s.channel}</em></span><strong>{amount(s.amountCr)}</strong></li>)}</ul>
              </section>
            </div>
          )}
        </>
      )}
      {processing && (
        <ol className="flow">
          {PIPELINE.map((p, i) => {
            const Icon = STEP_ICONS[i];
            const state = i < progress ? 'done' : i === progress ? 'now' : '';
            return (
              <li key={p.id} className={`c${i} ${state}`}>
                <span className="node"><Icon size={26} strokeWidth={1.8} /></span>
                <b>{p.title}</b><small>{p.detail}</small>
              </li>
            );
          })}
        </ol>
      )}
      <div className="orb-stage"><Orb active={processing} variant="stage" /></div>
    </div>
  );
}
