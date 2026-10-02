'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGeo } from '@/hooks/useGeo';

// Slides/fades children in the first time they scroll into view (`variant`: up | left | right | zoom).
export function Reveal({ children, className = '', delay = 0, variant = 'up' }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className={`sx-reveal v-${variant} ${seen ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

// Counts up to `to` when scrolled into view. `render(value)` formats the number.
export function Counter({ to, decimals = 0, render, ms = 1100 }) {
  const ref = useRef(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let raf = 0;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = t => { const k = Math.min(1, (t - t0) / ms); setV(to * (1 - (1 - k) ** 3)); if (k < 1) raf = requestAnimationFrame(tick); };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, ms]);
  return <span ref={ref}>{render ? render(v) : v.toFixed(decimals)}</span>;
}

export const SectionHead = ({ eyebrow, children, sub, align = 'center' }) => (
  <div className={`sx-head ${align}`}>
    {eyebrow && <p className="sx-eyebrow">{eyebrow}</p>}
    <h2>{children}</h2>
    {sub && <p className="sx-sub">{sub}</p>}
  </div>
);

export const Tone = ({ tone = 'blue', children, className = '' }) => <span className={`sx-ico tone-${tone} ${className}`}>{children}</span>;

export const Up = ({ children }) => <span className="sx-up">▲ {children}</span>;

/* ── India map (real boundaries from /geo/india.json) ───────────────────── */
const S = 13.6, X0 = 68, Y0 = 37.6;
const px = (lon, lat) => [(lon - X0) * S, (Y0 - lat) * S];
const ring = r => 'M' + r.map(([x, y]) => px(x, y).map(n => n.toFixed(1)).join(' ')).join('L') + 'Z';
const slug = n => n.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/**
 * fill(slug) → colour; onSelect(slug); selected = slug|null; markers = [{ lon, lat, color, r, pulse }].
 * Pure SVG, so it scales to any container and every state is a real, focusable, clickable element.
 */
export function IndiaSvg({ fill = () => '#BFD6FF', onSelect, selected, markers = [], className = '', label = 'Map of India' }) {
  const geo = useGeo('india');
  const [hover, setHover] = useState(null);
  const paths = useMemo(() => (geo.data?.states ?? []).map(s => ({ n: s.n, id: slug(s.n), d: s.p.map(poly => poly.map(ring).join('')).join('') })), [geo.data]);
  return (
    <svg viewBox="0 0 420 450" className={`sx-map ${className}`} role="img" aria-label={label}>
      <g>
        {paths.map(p => (
          <path key={p.id} d={p.d} fillRule="evenodd" fill={fill(p.id)} stroke="#fff" strokeWidth={selected === p.id ? 2 : 0.8}
            className={'sx-state' + (onSelect ? ' clickable' : '') + (selected === p.id ? ' on' : '') + (hover === p.id ? ' hot' : '')}
            tabIndex={onSelect ? 0 : undefined} role={onSelect ? 'button' : undefined} aria-label={p.n}
            onClick={onSelect ? () => onSelect(p.id) : undefined}
            onKeyDown={onSelect ? e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(p.id); } } : undefined}
            onMouseEnter={() => setHover(p.id)} onMouseLeave={() => setHover(null)}><title>{p.n}</title></path>
        ))}
      </g>
      {markers.map(m => {
        const [x, y] = px(m.lon, m.lat);
        return (
          <g key={`${m.lon}${m.lat}`} transform={`translate(${x} ${y})`} pointerEvents="none">
            {m.pulse && <circle r={m.r * 2.4} fill={m.color} opacity=".25" className="sx-pulse" />}
            <circle r={m.r} fill={m.color} stroke="#fff" strokeWidth="1.5" />
          </g>
        );
      })}
    </svg>
  );
}

/* ── tiny charts ─────────────────────────────────────────────────────────── */
export function Donut({ items, size = 150, hole = 0.62, active, onActive, center }) {
  const total = items.reduce((a, i) => a + i.v, 0) || 1, R = 50, C = 2 * Math.PI * R;
  const arcs = items.map((it, i) => { const before = items.slice(0, i).reduce((a, x) => a + x.v, 0); return { it, i, len: (it.v / total) * C, off: -(before / total) * C }; });
  return (
    <div className="sx-donut" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120">
        <g transform="rotate(-90 60 60)">
          {arcs.map(({ it, i, len, off }) => (
            <circle key={it.name} cx="60" cy="60" r={R} fill="none" stroke={it.c} strokeWidth={active === i ? 22 * (1 - hole + 0.5) : 20 * (1 - hole + 0.45)}
              strokeDasharray={`${Math.max(len - 1.4, 0)} ${C}`} strokeDashoffset={off} style={{ transition: 'stroke-width .15s' }}
              onMouseEnter={() => onActive?.(i)} onMouseLeave={() => onActive?.(null)} />
          ))}
        </g>
      </svg>
      <div className="sx-donut-c">{center}</div>
    </div>
  );
}

// Stable deterministic pseudo-random from a string (for generated demo figures).
export function seedNum(str, min, max) {
  let h = 2166136261;
  for (const ch of str) { h ^= ch.codePointAt(0); h = Math.imul(h, 16777619); }
  return min + ((h >>> 0) % 10000) / 10000 * (max - min);
}

export const Pack = ({ name, c = ['#0962FF', '#5B9BFF'] }) => (
  <span className="sx-pack" style={{ background: `linear-gradient(135deg,${c[0]},${c[1]})` }} aria-hidden>{name.slice(0, 1)}</span>
);
