'use client';

import React, { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const STOPS = [
  ['top', 'Home'], ['why', 'Why Aavtor'], ['gap', 'The gap'], ['platform', 'Platform'], ['ask', 'Ask AI'],
  ['visibility', 'Sales visibility'], ['traceability', 'Traceability'], ['insights', 'Insights'], ['forecast', 'Forecast'],
  ['foundation', 'Foundation'], ['overview', 'Overview'], ['implementation', 'Implementation'], ['demo', 'Book a demo']
];
const pad = n => String(n).padStart(2, '0');
const stateOf = (i, active) => {
  if (i === active) return 'on';
  return i < active ? 'past' : '';
};

/**
 * Fixed section navigator on the right edge: current index, a tick track (visited / current / upcoming) with named
 * tooltips, and previous/next controls. Desktop only (CSS hides it below 1100px).
 */
export default function ScrollRail() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const ratios = new Map();
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => ratios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0));
      let best = -1; let bestRatio = 0;
      STOPS.forEach(([id], i) => { const r = ratios.get(id) ?? 0; if (r > bestRatio) { best = i; bestRatio = r; } });
      if (best >= 0) setActive(best);
    }, { threshold: [0.2, 0.4, 0.6, 0.8] });
    STOPS.forEach(([id]) => { const el = document.getElementById(id); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);

  const go = i => document.getElementById(STOPS[i]?.[0])?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <nav className="lp-rail" aria-label="Page sections">
      <button type="button" className="lp-rail-step" onClick={() => go(active - 1)} disabled={active === 0} aria-label="Previous section"><ChevronUp size={16} /></button>
      <div className="lp-rail-count" aria-live="polite"><b>{pad(active + 1)}</b><span>/{STOPS.length}</span></div>
      <ol>
        {STOPS.map(([id, label], i) => (
          <li key={id}>
            <button type="button" className={stateOf(i, active)} onClick={() => go(i)} aria-label={label} aria-current={i === active ? 'true' : undefined}>
              <em><b>{pad(i + 1)}</b>{label}</em><i />
            </button>
          </li>
        ))}
      </ol>
      <button type="button" className="lp-rail-step" onClick={() => go(active + 1)} disabled={active === STOPS.length - 1} aria-label="Next section"><ChevronDown size={16} /></button>
    </nav>
  );
}
