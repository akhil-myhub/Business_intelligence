import React, { useId } from 'react';
import { ArrowDown, ArrowUp, ChevronDown } from 'lucide-react';

export function Panel({ title, action, children, className = '' }) {
  return (
    <section className={'panel ' + className}>
      {(title || action) && <div className="panel-head"><h3>{title}</h3>{action}</div>}
      {children}
    </section>
  );
}

export function Select({ value, options, onChange, label }) {
  return (
    <label className="select">
      <select value={value} onChange={e => onChange?.(e.target.value)} aria-label={label ?? value}>{options.map(o => <option key={o}>{o}</option>)}</select>
      <ChevronDown size={15} strokeWidth={2.6} aria-hidden />
    </label>
  );
}

export function Growth({ value, className = '' }) {
  const down = value < 0;
  return <em className={`growth ${down ? 'down' : 'up'} ${className}`}>{down ? <ArrowDown size={16} strokeWidth={2.6} /> : <ArrowUp size={16} strokeWidth={2.6} />}{Math.abs(value)}%</em>;
}

export function Kpi({ icon, tint, label, value, growth }) {
  return (
    <div className="kpi">
      <span className="kpi-ico" style={{ '--tint': tint }}>{icon}</span>
      <div><strong>{value}</strong><small>{label}</small></div>
      <Growth value={growth} />
    </div>
  );
}

export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map(t => <button key={t} role="tab" aria-selected={value === t} className={value === t ? 'on' : ''} onClick={() => onChange(t)}>{t}</button>)}
    </div>
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
