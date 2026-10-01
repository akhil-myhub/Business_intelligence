import React, { useId, useState } from 'react';
import {
  ArrowRight, ArrowUp, BarChart3, Bell, Bot, BrainCircuit, ChevronDown, Globe2, Home, LayoutGrid, Megaphone,
  MapPin, Package, Search, Settings, Store, Users
} from 'lucide-react';

export const fmt = (n, d = 0) => Number(n).toLocaleString('en-IN', { minimumFractionDigits: d, maximumFractionDigits: d });

// legend order: Retail, Wholesale, Modern Trade, E-commerce, Others
export const DONUT = ['#5b6cff', '#ffb53d', '#27d2f0', '#ff5fc8', '#ff8a1f'];
export const LINES = ['#27c4f4', '#8a5cff', '#ffae35', '#ff5c6c', '#ff4fb0'];

export const NAV = [
  { id: 'ask', label: 'Ask', Icon: Bot },
  { id: 'product', label: 'Products', Icon: LayoutGrid },
  { id: 'market', label: 'Market', Icon: Globe2 },
  { id: 'stores', label: 'Stores', Icon: Store },
  { id: 'campaign', label: 'Campaigns', Icon: Megaphone },
  { id: 'reports', label: 'Reports', Icon: BarChart3 }
];
const RAIL = [['ask', Home], ['product', Package], ['market', BarChart3], ['stores', MapPin], ['campaign', Users], ['reports', Store]];

export function Logo({ big }) { return <span className={'logo-ring ' + (big ? 'big' : '')} />; }

export function Rail({ active, onNav }) {
  return (
    <aside className="rail">
      {RAIL.map(([id, Icon]) => {
        const I = id === 'ask' && active === 'ask' ? Home : id === 'ask' ? BrainCircuit : Icon;
        return <button key={id} className={active === id ? 'on' : ''} onClick={() => onNav(id)} title={id} aria-label={id}><I size={22} strokeWidth={1.8} /></button>;
      })}
      <span className="grow" />
      <button aria-label="settings"><Settings size={22} strokeWidth={1.8} /></button>
    </aside>
  );
}

export function TopNav({ active, onNav, crumb, right, compact, live }) {
  return (
    <header className="topnav">
      <div className="tn-left">
        <ArrowRight size={16} className="tn-arrow" /><Logo />
        <nav>
          {NAV.filter(n => !compact || n.id === 'ask').map(({ id, label, Icon }) => (
            <button key={id} className={active === id || (compact && id === 'ask') ? 'on' : ''} onClick={() => onNav(id)}><Icon size={16} />{label}</button>
          ))}
        </nav>
        {crumb}
      </div>
      <div className="tn-right">
        {live && <span className={'live-pill' + (live.paused ? ' paused' : '')} role="status"><i />{live.paused ? 'Paused' : 'Live'}</span>}
        {right ?? <><Search size={20} /><Bell size={20} /><span className="avatar">U</span></>}
      </div>
    </header>
  );
}

export function Panel({ title, action, children, className = '' }) {
  return (
    <section className={'panel ' + className}>
      {(title || action) && <div className="panel-head"><h3>{title}</h3>{action}</div>}
      {children}
    </section>
  );
}

export function Select({ value, options, onChange }) {
  return (
    <label className="select">
      <select value={value} onChange={e => onChange?.(e.target.value)}>{options.map(o => <option key={o}>{o}</option>)}</select>
      <ChevronDown size={15} strokeWidth={2.6} />
    </label>
  );
}

export function Kpi({ icon, tint, label, value, unit, growth, cr }) {
  return (
    <div className="kpi">
      <span className="kpi-ico" style={{ '--tint': tint }}>{icon}</span>
      <div>
        <strong>{unit === '₹' ? '₹ ' : ''}{value}{cr ? ' Cr' : ''}{unit && unit !== '₹' ? unit : ''}</strong>
        <small>{label}</small>
      </div>
      <em><ArrowUp size={16} strokeWidth={2.6} />{growth}%</em>
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return <div className="tabs">{tabs.map(t => <button key={t} className={value === t ? 'on' : ''} onClick={() => onChange(t)}>{t}</button>)}</div>;
}

/* ---------- charts (pure SVG) ---------- */

export function AreaChart({ data, labels, ticks, at, height = 170, fmtTick = v => `₹ ${v} Cr` }) {
  const W = 440, H = height, L = 58, B = 24, T = 14, R = 10, max = ticks[ticks.length - 1];
  const [hover, setHover] = useState(null);
  const hi = hover ?? at ?? data.length - 1;
  const x = i => L + (i / (data.length - 1)) * (W - L - R);
  const y = v => T + (1 - v / max) * (H - T - B);
  const pts = data.map((v, i) => [x(i), y(v)]);
  const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px},${py}`).join(' ');
  const id = useId();
  const mi = Math.round((hi * (labels.length - 1)) / (data.length - 1));
  const tx = Math.max(L, Math.min(x(hi) - 36, W - 84));
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} onMouseLeave={() => setHover(null)}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect(), px = ((e.clientX - r.left) / r.width) * W;
        setHover(Math.max(0, Math.min(data.length - 1, Math.round(((px - L) / (W - L - R)) * (data.length - 1)))));
      }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b6bff" stopOpacity=".55" /><stop offset="1" stopColor="#3b6bff" stopOpacity="0.02" /></linearGradient></defs>
      {ticks.map(t => <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid" /><text x={L - 8} y={y(t) + 3.5} textAnchor="end">{t === 0 ? '0' : fmtTick(t)}</text></g>)}
      {labels.map((m, i) => <text key={m} x={L + (i / (labels.length - 1)) * (W - L - R)} y={H - 6} textAnchor="middle">{m}</text>)}
      <path d={`${d} L${x(data.length - 1)},${y(0)} L${x(0)},${y(0)}Z`} fill={`url(#${id})`} />
      <path d={d} className="stroke-line" />
      <circle cx={x(hi)} cy={y(data[hi])} r="4.5" className="dot" />
      <g transform={`translate(${tx},${Math.max(y(data[hi]) - 54, 0)})`}>
        <rect width="72" height="40" rx="9" className="tip" />
        <path d={`M${x(hi) - tx - 6},39 l6,8 l6,-8z`} className="tip" />
        <text x="36" y="17" textAnchor="middle" className="tip-t">₹ {Math.round(data[hi])} Cr</text>
        <text x="36" y="32" textAnchor="middle" className="tip-s">{labels[mi]} 2024</text>
      </g>
    </svg>
  );
}

export function BarChart({ items, ticks, height = 190 }) {
  const W = 440, H = height, L = 36, B = 30, T = 24, max = ticks ? ticks[ticks.length - 1] : Math.max(...items.map(i => i.value)) * 1.1;
  const gap = (W - L) / items.length, bw = Math.min(54, gap * 0.52);
  const id = useId();
  const yy = v => T + (1 - v / max) * (H - T - B);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`}>
      <defs>{items.map((it, i) => <linearGradient key={it.name} id={id + i} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={it.c[0]} /><stop offset="1" stopColor={it.c[1]} /></linearGradient>)}</defs>
      {(ticks || [0, max / 2, max]).map(t => <g key={t}><line x1={L} x2={W} y1={yy(t)} y2={yy(t)} className="grid" /><text x={L - 6} y={yy(t) + 3} textAnchor="end">{Math.round(t)}</text></g>)}
      {items.map((it, i) => {
        const h = (it.value / max) * (H - T - B), cx = L + gap * i + gap / 2;
        return (
          <g key={it.name} className="bar">
            <rect x={cx - bw / 2} y={H - B - h} width={bw} height={h} rx="5" fill={`url(#${id}${i})`} />
            <text x={cx} y={H - B - h - 7} textAnchor="middle" className="val">₹ {Math.round(it.value)} Cr</text>
            <text x={cx} y={H - 10} textAnchor="middle">{it.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ items, total, size = 190 }) {
  const R = 46, C = 2 * Math.PI * R, sum = items.reduce((a, i) => a + i.value, 0), id = useId();
  const arcs = items.map((it, i) => {
    const before = items.slice(0, i).reduce((a, x) => a + x.value, 0);
    return { it, i, len: (it.value / sum) * C, off: -(before / sum) * C };
  });
  return (
    <div className="donut-row">
      <div className="donut" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120">
          <defs>{items.map((it, i) => <linearGradient key={it.name} id={id + i} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={DONUT[i]} /><stop offset="1" stopColor={DONUT[i]} stopOpacity=".55" /></linearGradient>)}</defs>
          {arcs.map(({ it, i, len, off }) => (
            <circle key={it.name} cx="60" cy="60" r={R} fill="none" stroke={`url(#${id}${i})`} strokeWidth="19" strokeDasharray={`${Math.max(len - 1.2, 0)} ${C}`} strokeDashoffset={off} transform="rotate(-90 60 60)" />
          ))}
        </svg>
        <div className="donut-c"><b>₹ {total}</b><small>Total</small></div>
      </div>
      <ul className="legend">{items.map((it, i) => <li key={it.name}><i style={{ background: DONUT[i] }} />{it.name}<b>{Math.round((it.value / sum) * 100)}%</b></li>)}</ul>
    </div>
  );
}

export function Legend({ names }) {
  return <div className="chips-legend">{names.map((n, i) => <span key={n}><i style={{ background: LINES[i] }} />{n}</span>)}</div>;
}

export function MultiLine({ series, labels, height = 130 }) {
  const W = 880, H = height, L = 40, B = 24, T = 10, max = 30;
  const x = i => L + (i / (labels.length - 1)) * (W - L - 16), y = v => T + (1 - v / max) * (H - T - B);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`}>
      {[0, 15, 30].map(t => <g key={t}><line x1={L} x2={W - 16} y1={y(t)} y2={y(t)} className="grid" /><text x={L - 8} y={y(t) + 3} textAnchor="end">{t}%</text></g>)}
      {labels.map((m, i) => <text key={m} x={x(i)} y={H - 6} textAnchor="middle">{m}</text>)}
      {series.map((s, k) => (
        <g key={k}>
          <polyline fill="none" stroke={LINES[k]} strokeWidth="2.4" strokeLinejoin="round" points={s.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
          {s.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.4" fill={LINES[k]} />)}
        </g>
      ))}
    </svg>
  );
}

export function Bottle({ amber = true, color = '#2f6bff', h = 84 }) {
  const id = useId();
  return (
    <svg viewBox="0 0 60 96" height={h} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" x2="1"><stop offset="0" stopColor={amber ? '#8a4b12' : color} /><stop offset=".45" stopColor={amber ? '#e8a14b' : color} stopOpacity=".95" /><stop offset="1" stopColor={amber ? '#7a3f0c' : color} /></linearGradient>
      </defs>
      <rect x="21" y="3" width="18" height="13" rx="3" fill="#1d2a44" />
      <path d="M12 24 Q12 16 22 16 H38 Q48 16 48 24 V82 Q48 92 38 92 H22 Q12 92 12 82Z" fill={`url(#${id})`} />
      <path d="M22 38 Q30 30 38 38 L40 62 Q30 72 20 62Z" fill={amber ? '#2f6bff' : '#fff'} opacity={amber ? 1 : 0.85} />
      <rect x="16" y="22" width="4" height="64" rx="2" fill="#fff" opacity=".25" />
    </svg>
  );
}
