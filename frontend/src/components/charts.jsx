import React, { useId, useState } from 'react';

// legend order: Retail, Wholesale, Modern Trade, E-commerce, Others
const DONUT = ['#5b6cff', '#ffb53d', '#27d2f0', '#ff5fc8', '#ff8a1f'];
const LINES = ['#27c4f4', '#8a5cff', '#ffae35', '#ff5c6c', '#ff4fb0'];
export const BAR_COLORS = [['#29c0ff', '#3b6bff'], ['#b07bff', '#6a4bff'], ['#ff6c86', '#ff3b5c'], ['#ffc16a', '#ff8a3c'], ['#8a93ff', '#5560f0']];

// Round the axis up to a "nice" ceiling so labels read cleanly whatever the data range is.
function niceTicks(max, count = 4) {
  if (!(max > 0)) return [0, 1];
  const raw = max / count, mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) ?? raw;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, i) => +(i * step).toFixed(4));
}

const compact = v => (Math.abs(v) >= 1000 ? `${+(v / 1000).toFixed(1)}K` : `${+v.toFixed(v < 10 ? 1 : 0)}`);

export function AreaChart({ points, months, height = 170, unit = '₹', suffix = ' Cr', at }) {
  const W = 440, H = height, L = 56, B = 24, T = 14, R = 10;
  const [hover, setHover] = useState(null);
  const id = useId();
  const values = points.map(p => p.value);
  const ticks = niceTicks(Math.max(...values) * 1.05);
  const max = ticks[ticks.length - 1];
  const hi = Math.min(hover ?? at ?? points.length - 1, points.length - 1);
  const x = i => L + (points.length > 1 ? (i / (points.length - 1)) * (W - L - R) : 0);
  const y = v => T + (1 - v / max) * (H - T - B);
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.value)}`).join(' ');
  const perMonth = months?.length ? points.length / months.length : 0;
  const tx = Math.max(L, Math.min(x(hi) - 56, W - 124));
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} onMouseLeave={() => setHover(null)}
      onMouseMove={e => {
        const r = e.currentTarget.getBoundingClientRect(), px = ((e.clientX - r.left) / r.width) * W;
        setHover(Math.max(0, Math.min(points.length - 1, Math.round(((px - L) / (W - L - R)) * (points.length - 1)))));
      }}>
      <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b6bff" stopOpacity=".55" /><stop offset="1" stopColor="#3b6bff" stopOpacity="0.02" /></linearGradient></defs>
      {ticks.map(t => <g key={t}><line x1={L} x2={W - R} y1={y(t)} y2={y(t)} className="grid" /><text x={L - 8} y={y(t) + 3.5} textAnchor="end">{t === 0 ? '0' : `${unit} ${compact(t)}${suffix}`}</text></g>)}
      {months?.map((m, i) => <text key={`${m}${i}`} x={x(Math.min(points.length - 1, Math.round(i * perMonth)))} y={H - 6} textAnchor="middle">{m}</text>)}
      <path d={`${d} L${x(points.length - 1)},${y(0)} L${x(0)},${y(0)}Z`} fill={`url(#${id})`} />
      <path d={d} className="stroke-line" />
      <circle cx={x(hi)} cy={y(values[hi])} r="4.5" className="dot" />
      <g transform={`translate(${tx},${Math.max(y(values[hi]) - 54, 0)})`}>
        <rect width="112" height="40" rx="9" className="tip" />
        <path d={`M${x(hi) - tx - 6},39 l6,8 l6,-8z`} className="tip" />
        <text x="56" y="17" textAnchor="middle" className="tip-t">{unit} {+values[hi].toFixed(1)}{suffix}</text>
        <text x="56" y="32" textAnchor="middle" className="tip-s">{points[hi].label}</text>
      </g>
    </svg>
  );
}

export function BarChart({ items, height = 190, unit = '₹ ', suffix = ' Cr', onSelect }) {
  const W = 440, H = height, L = 40, B = 30, T = 24;
  const ticks = niceTicks(Math.max(...items.map(i => i.value)) * 1.05, 3);
  const max = ticks[ticks.length - 1];
  const gap = (W - L) / items.length, bw = Math.min(54, gap * 0.52);
  const id = useId();
  const yy = v => T + (1 - v / max) * (H - T - B);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`}>
      <defs>{items.map((it, i) => <linearGradient key={it.name} id={id + i} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={it.c[0]} /><stop offset="1" stopColor={it.c[1]} /></linearGradient>)}</defs>
      {ticks.map(t => <g key={t}><line x1={L} x2={W} y1={yy(t)} y2={yy(t)} className="grid" /><text x={L - 6} y={yy(t) + 3} textAnchor="end">{compact(t)}</text></g>)}
      {items.map((it, i) => {
        const h = (it.value / max) * (H - T - B), cx = L + gap * i + gap / 2;
        return (
          <g key={it.name} className={'bar' + (onSelect ? ' clickable' : '')} onClick={() => onSelect?.(it)}>
            <rect x={cx - bw / 2} y={H - B - h} width={bw} height={Math.max(h, 1)} rx="5" fill={`url(#${id}${i})`} />
            <text x={cx} y={H - B - h - 7} textAnchor="middle" className="val">{unit}{Math.round(it.value)}{suffix}</text>
            <text x={cx} y={H - 10} textAnchor="middle">{it.name.length > 15 ? it.name.slice(0, 14) + '…' : it.name}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function Donut({ items, total, size = 190, unit = '₹ ', suffix = ' Cr' }) {
  const R = 46, C = 2 * Math.PI * R, sum = items.reduce((a, i) => a + i.value, 0) || 1, id = useId();
  const arcs = items.map((it, i) => {
    const before = items.slice(0, i).reduce((a, x) => a + x.value, 0);
    return { it, i, len: (it.value / sum) * C, off: -(before / sum) * C };
  });
  return (
    <div className="donut-row">
      <div className="donut" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" role="img" aria-label="Distribution chart">
          <defs>{items.map((it, i) => <linearGradient key={it.name} id={id + i} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={DONUT[i]} /><stop offset="1" stopColor={DONUT[i]} stopOpacity=".55" /></linearGradient>)}</defs>
          {arcs.map(({ it, i, len, off }) => (
            <circle key={it.name} cx="60" cy="60" r={R} fill="none" stroke={`url(#${id}${i})`} strokeWidth="19" strokeDasharray={`${Math.max(len - 1.2, 0)} ${C}`} strokeDashoffset={off} transform="rotate(-90 60 60)" />
          ))}
        </svg>
        <div className="donut-c"><b>{unit}{total}{suffix}</b><small>Total</small></div>
      </div>
      <ul className="legend">{items.map((it, i) => <li key={it.name}><i style={{ background: DONUT[i] }} />{it.name}<b>{Math.round((it.value / sum) * 100)}%</b></li>)}</ul>
    </div>
  );
}

export function Legend({ names, colors = LINES }) {
  return <div className="chips-legend">{names.map((n, i) => <span key={n}><i style={{ background: colors[i % colors.length] }} />{n}</span>)}</div>;
}

// zoom=true fits the axis to the data (for slow-moving series like market share) instead of starting at zero.
export function MultiLine({ series, labels, height = 140, suffix = '%', zoom = false }) {
  const all = series.flat();
  const min = Math.min(...all), max = Math.max(...all);
  const pad = Math.max((max - min) * 0.4, max * 0.02, 0.1);
  const upper = niceTicks(Math.max(...all, 1) * 1.05, 3), step = upper[1] - upper[0];
  // the axis floor is a whole number of steps below zero, so negative growth gets a clean tick (not "-6.7%")
  const lo = zoom ? Math.floor((min - pad) * 10) / 10 : min < 0 ? -Math.ceil(-min / step) * step : 0;
  const ticks = zoom ? [0, 1, 2].map(i => +(lo + ((max + pad - lo) / 2) * i).toFixed(1)) : upper;
  const hi = ticks[ticks.length - 1];
  const W = 880, H = height, L = 46, B = 24, T = 10;
  const x = i => L + (labels.length > 1 ? (i / (labels.length - 1)) * (W - L - 16) : 0);
  const y = v => T + (1 - (v - lo) / (hi - lo || 1)) * (H - T - B);
  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`}>
      {[...new Set(zoom ? ticks : [...(lo < 0 ? Array.from({ length: Math.round(-lo / step) }, (_, i) => -(i + 1) * step) : []), ...ticks])].map(t => <g key={t}><line x1={L} x2={W - 16} y1={y(t)} y2={y(t)} className="grid" /><text x={L - 8} y={y(t) + 3} textAnchor="end">{compact(t)}{suffix}</text></g>)}
      {labels.map((m, i) => <text key={`${m}${i}`} x={x(i)} y={H - 6} textAnchor="middle">{m}</text>)}
      {series.map((s, k) => (
        <g key={k}>
          <polyline fill="none" stroke={LINES[k % LINES.length]} strokeWidth="2.4" strokeLinejoin="round" points={s.map((v, i) => `${x(i)},${y(v)}`).join(' ')} />
          {s.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r="3.4" fill={LINES[k % LINES.length]}><title>{`${labels[i]}: ${v}${suffix}`}</title></circle>)}
        </g>
      ))}
    </svg>
  );
}
