'use client';

import React from 'react';
import { BarChart3, Box, Check, ChartColumn, Cog, Database, Factory, Link2, Send, ShieldCheck, Sparkles, Store, Truck, UsersRound, Warehouse } from 'lucide-react';
import { IndiaSvg } from './kit';
import { MARK, HUB, NODES, NODE_R, PETAL_OUTLINES, SPOKE, petalPath } from '@/lib/aavtorMark';

/* Vector illustrations for the landing cards. They replace 1× raster crops, so they stay sharp at any
   screen density or zoom. Sizes match the Figma frames (benefit art 265×199, gap art 290×166). */

const SHADES = ['#1E40AF', '#2F6BFF', '#6C9BFF', '#A9C6FF', '#D5E3FF'];
const mapFill = id => ({ maharashtra: SHADES[0], karnataka: SHADES[1], gujarat: SHADES[1], 'madhya-pradesh': SHADES[2], rajasthan: SHADES[3], telangana: SHADES[2], 'andhra-pradesh': SHADES[3], 'tamil-nadu': SHADES[2], 'uttar-pradesh': SHADES[3] }[id] ?? SHADES[4]);

/* ── benefit cards ─────────────────────────────────────────────────── */
function Market() {
  return (
    <div className="art art-market">
      <IndiaSvg className="am-map" fill={mapFill} markers={[{ lon: 77.6, lat: 12.9, r: 4, color: '#0962FF', pulse: true }]} label="Markets" />
      <ul className="am-card">{[['All India', '₹ 248.6 Cr', '#9DB8FF'], ['Maharashtra', '₹ 42.8 Cr', '#0962FF'], ['Mumbai', '₹ 12.4 Cr', '#6C9BFF']].map(([n, v, c]) => <li key={n}><i style={{ background: c }} />{n}<b>{v}</b></li>)}</ul>
    </div>
  );
}
function Batch() {
  return (
    <div className="art art-batch">
      <span className="ab-chip"><Box size={13} color="#0962FF" /> Batch B-2291 <i><Check size={11} strokeWidth={3} /></i></span>
      <svg className="ab-lines" viewBox="0 0 265 40" aria-hidden><path d="M44 36 V16 H132 V0 M132 16 H220 V36" fill="none" stroke="#C9D8F5" strokeWidth="1.4" /></svg>
      <div className="ab-flow">{[Factory, Truck, Store].map((I, k) => <React.Fragment key={k}><span><I size={26} color="#0962FF" /></span>{k < 2 && <em />}</React.Fragment>)}</div>
    </div>
  );
}
function Growth() {
  return (
    <div className="art art-growth">
      <span className="ag-tag"><b>+24%</b><small>Revenue growth</small></span>
      <svg viewBox="0 0 265 150" aria-hidden>
        <defs><linearGradient id="agb" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#2F7BFF" /><stop offset="1" stopColor="#0B58E8" /></linearGradient></defs>
        {[28, 46, 68, 94, 122].map((h, k) => <rect key={k} x={50 + k * 38} y={148 - h} width="22" height={h} rx="3" fill="url(#agb)" opacity={0.55 + k * 0.11} />)}
        <polyline points="60,92 98,80 136,64 174,50 212,28" fill="none" stroke="#0962FF" strokeWidth="1.6" />
        {[[60, 92], [98, 80], [136, 64], [174, 50], [212, 28]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="3" fill="#fff" stroke="#0962FF" strokeWidth="1.6" />)}
      </svg>
    </div>
  );
}
function Chat() {
  return (
    <div className="art art-chat">
      <span className="ac-input"><Sparkles size={15} color="#0962FF" /> Ask NexaBI…</span>
      <span className="ac-q">What were my top 10 SKUs<br />by revenue this month?</span>
      <i className="ac-send"><Send size={14} /></i>
    </div>
  );
}
export const BenefitArt = ({ i }) => [<Market key="m" />, <Batch key="b" />, <Growth key="g" />, <Chat key="c" />][i];

/* ── gap cards ─────────────────────────────────────────────────────── */
function Delayed() {
  return (
    <div className="art gap gap-delay">
      <div className="gd-panel"><i /><i /><i /></div>
      <div className="gd-report"><span className="gd-status"><u />Sales Update</span><span className="gd-late">◔ 3 days late</span><hr />
        <div className="gd-bars">{[10, 14, 23, 31, 45, 45, 56].map((h, k) => <i key={k} style={{ height: h }} />)}</div></div>
      <svg className="gd-clock" viewBox="0 0 84 84" aria-hidden><circle cx="42" cy="42" r="38" fill="#FAFDFF" stroke="#3E8BFF" strokeWidth="4" /><path d="M42 18 V42 L56 54" fill="none" stroke="#155CFF" strokeWidth="3" strokeLinecap="round" /><circle cx="42" cy="42" r="3.5" fill="#fff" stroke="#155CFF" strokeWidth="2" />
        {Array.from({ length: 12 }, (_, k) => <circle key={k} cx={42 + 30 * Math.sin((k * Math.PI) / 6)} cy={42 - 30 * Math.cos((k * Math.PI) / 6)} r="1.6" fill="#86BEFF" />)}</svg>
    </div>
  );
}
function Fragmented() {
  const chip = (cls, I, t) => <span className={`gf-chip ${cls}`}><I size={16} color="#0962FF" />{t}</span>;
  return (
    <div className="art gap gap-frag">
      <svg viewBox="0 0 290 166" aria-hidden><rect x="66" y="31" width="139" height="100" rx="6" fill="none" stroke="#54A1FF" strokeWidth="1.2" strokeDasharray="4 4" /></svg>
      {chip('a', Database, 'ERP')}{chip('b', ChartColumn, 'Plant')}{chip('c', Warehouse, 'Distributors')}{chip('d', Store, 'Retail')}
      <span className="gf-hub"><Link2 size={26} color="#0962FF" /></span>
    </div>
  );
}
function Recalls() {
  return (
    <div className="art gap gap-recall">
      <span className="gr-box"><Box size={42} color="#4C8DF5" /><i>!</i></span>
      <span className="gr-card"><b>Batch B-2291</b><em>◉ Possible Issue</em></span>
      <svg viewBox="0 0 290 166" aria-hidden><path d="M60 62 V84 M60 84 H25 V112 M60 84 H98 V112 M100 84 H170 V112 M100 84 H245 V112" fill="none" stroke="#FF5D67" strokeWidth="1.2" strokeDasharray="4 4" /></svg>
      <div className="gr-stores">{[0, 1, 2, 3].map(k => <span key={k}><Store size={20} color="#0962FF" /><i>!</i></span>)}</div>
    </div>
  );
}
function Guess() {
  return (
    <div className="art gap gap-guess">
      <div className="gg-panel">
        <p><s className="d" />Forecast</p><p><s className="s" />Actual</p>
        <svg viewBox="0 0 220 100" aria-hidden><path d="M20 90 L70 80 L110 62 L150 48 L200 30" fill="none" stroke="#6BA8FF" strokeWidth="1.8" strokeDasharray="5 4" /><path d="M85 74 L120 62 L150 54 L200 38" fill="none" stroke="#2680FF" strokeWidth="2.4" /><circle cx="85" cy="74" r="3" fill="#0962FF" /><circle cx="200" cy="38" r="3" fill="#0962FF" /></svg>
      </div>
      <div className="gg-bars">{[22, 35, 46, 56, 51, 43].map((h, k) => <i key={k} style={{ height: h }} />)}</div>
      <span className="gg-fac"><Factory size={44} color="#3B82F6" /></span>
      <b className="gg-q">?</b>
    </div>
  );
}
export const GapArt = ({ i }) => [<Delayed key="d" />, <Fragmented key="f" />, <Recalls key="r" />, <Guess key="g" />][i];

/* ── trust icons + brand ───────────────────────────────────────────── */
export const TrustIcon = ({ i }) => {
  const P = { size: 38, color: '#0965FF', strokeWidth: 2.1 };
  return [<UsersRound key={0} {...P} />, <ShieldCheck key={1} {...P} />, <Cog key={2} {...P} />, <BarChart3 key={3} {...P} />][i];
};

// Aavtor mark (vector) for the nav wordmark.
export function BrandMark({ height = 26 }) {
  const w = Math.round((height * (MARK.w + 12)) / (MARK.h + 12));
  return (
    <svg viewBox={`-6 -6 ${MARK.w + 12} ${MARK.h + 12}`} width={w} height={height} aria-hidden>
      {PETAL_OUTLINES.map(p => <path key={p[0][0] + '' + p[0][1]} d={petalPath(p)} fill="#0B1530" />)}
      <g fill="#E9F0FE" stroke="#E9F0FE" strokeWidth={SPOKE} strokeLinecap="round">
        {NODES.map(n => <line key={`l${n.x}${n.y}`} x1={HUB.x} y1={HUB.y} x2={n.x} y2={n.y} />)}
        <circle cx={HUB.x} cy={HUB.y} r={HUB.r} stroke="none" />{NODES.map(n => <circle key={`n${n.x}${n.y}`} cx={n.x} cy={n.y} r={NODE_R} stroke="none" />)}
      </g>
    </svg>
  );
}
