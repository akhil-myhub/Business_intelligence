'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle, ArrowRight, BarChart3, Bell, Box, CircleCheck, Factory, Lightbulb, Megaphone, MapPin, Package, PieChart, ShoppingCart, Sparkles, Store, Target, TrendingUp, Truck, UsersRound, Warehouse, Percent, Layers, ChevronRight, Repeat, CircleAlert
} from 'lucide-react';
import { Donut, IndiaSvg, Pack, Reveal, Tone, Up } from '../kit';

/* ─────────────────────────── Batch traceability ─────────────────────────── */
const BATCHES = {
  'B-2291': { product: 'Biscuits', size: '125,000 Units', mfd: '12 Jan 2026', exp: '12 Jan 2027', line: 'Plant – Line 3', flow: [1, 2, 4, 38], depots: 'North, West', cities: [['Pune', 12, 73.86, 18.52], ['Nagpur', 8, 79.09, 21.15], ['Indore', 6, 75.86, 22.72], ['Bhopal', 5, 77.41, 23.26], ['Nashik', 4, 73.79, 20.0], ['Aurangabad', 3, 75.34, 19.88]] },
  'B-2307': { product: 'Noodles', size: '84,000 Units', mfd: '03 Feb 2026', exp: '03 Feb 2027', line: 'Plant – Line 1', flow: [1, 3, 5, 41], depots: 'South, East', cities: [['Chennai', 11, 80.27, 13.08], ['Coimbatore', 9, 76.96, 11.0], ['Madurai', 7, 78.12, 9.92], ['Salem', 6, 78.15, 11.65], ['Tiruchirappalli', 5, 78.7, 10.8], ['Vellore', 3, 79.13, 12.92]] },
  'B-2315': { product: 'Beverages', size: '210,000 Units', mfd: '21 Feb 2026', exp: '21 Aug 2026', line: 'Plant – Line 2', flow: [1, 2, 3, 29], depots: 'North, Central', cities: [['Delhi', 10, 77.2, 28.6], ['Jaipur', 7, 75.79, 26.9], ['Lucknow', 6, 80.95, 26.85], ['Chandigarh', 4, 76.78, 30.73], ['Kanpur', 3, 80.33, 26.45], ['Agra', 2, 78.0, 27.17]] }
};
const TSTEPS = [
  ['Detect', 'Complaint spike or QC deviation identified from quality, consumer or field data.', CircleAlert],
  ['Trace', 'Batch genealogy maps plant, line, shift and dispatches.', Box],
  ['Isolate', 'Affected depots, distributors and outlets identified.', MapPin],
  ['Notify', 'Stop-sale alerts sent only to affected outlets.', Bell],
  ['Confirm', 'Pickup and closure tracked with a complete audit trail.', CircleCheck]
];

export function Traceability() {
  const [id, setId] = useState('B-2291');
  const [step, setStep] = useState(5);
  const b = BATCHES[id];
  const outlets = b.cities.reduce((a, c) => a + c[1], 0);
  const markers = step >= 3 ? b.cities.map(c => ({ lon: c[2], lat: c[3], r: 3 + c[1] / 3, color: '#EF4444', pulse: true })) : [{ lon: b.cities[0][2], lat: b.cities[0][3], r: 5, color: '#2563EB', pulse: false }];
  const prog = [['Notification Sent', `${outlets} outlets notified`, '12 Jan 2026 10:24 AM', 4], ['Pickup In Progress', `${Math.round(outlets * 0.7)} outlets completed`, '13 Jan 2026 04:12 PM', 5], ['Closure Confirmed', `All ${outlets} outlets`, '15 Jan 2026 11:18 AM', 5]];
  const lit = k => (k === 2 ? step >= 5 : step >= prog[k][3]);
  return (
    <section className="sx sx-trace">
      <div className="tr-left">
        <Reveal>
          <p className="sx-eyebrow wide">BATCH TRACEABILITY</p>
          <h2>Recall the batch.<br /><span>Not the brand.</span></h2>
          <p className="sx-sub left">When a quality issue appears, our platform helps teams trace the affected batch from plant to depot to distributor to outlet, so you can act precisely instead of stopping sales everywhere.</p>
        </Reveal>
        <ol className="tr-steps">
          {TSTEPS.map(([t, d, Icon], k) => (
            <li key={t} className={step === k + 1 ? 'now' : step > k + 1 ? 'done' : ''}>
              <button type="button" onClick={() => setStep(k + 1)} aria-pressed={step === k + 1}>
                <i>{`0${k + 1}`}</i><Tone tone="blue"><Icon size={22} /></Tone><span><b>{t}</b><small>{d}</small></span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <Reveal className="tr-board" delay={100}>
        <div className="tr-head">
          <Tone tone="blue"><Box size={24} /></Tone>
          <div><b>Batch {id}</b> <span className="tag ok">● Traced</span><small>Product • {b.line} • {b.mfd}</small></div>
          <dl><div><dt>Product Category</dt><dd>{b.product}</dd></div><div><dt>Batch Size</dt><dd>{b.size}</dd></div><div><dt>MFD</dt><dd>{b.mfd}</dd></div><div><dt>Expiry</dt><dd>{b.exp}</dd></div></dl>
          <div className="tr-pick" role="tablist" aria-label="Choose a batch">{Object.keys(BATCHES).map(k => <button key={k} role="tab" aria-selected={k === id} className={k === id ? 'on' : ''} onClick={() => setId(k)}>{k}</button>)}</div>
        </div>
        <div className="tr-flow">
          {[['Plant Line', b.flow[0], 'Plant A – Line 3', Factory], ['Depots', b.flow[1], b.depots, Warehouse], ['Distributors', b.flow[2], 'Primary Distributors', Truck], ['Outlets', step >= 3 ? outlets : b.flow[3], `Across ${b.cities.length} cities`, Store]].map(([l, n, s, Icon], k) => (
            <React.Fragment key={l}><div className="fl"><span><Icon size={30} /></span><b>{n}</b><em>{l}</em><small>{s}</small></div>{k < 3 && <i className="arrow" />}</React.Fragment>
          ))}
        </div>
        <div className="tr-mid">
          <div className="tr-aff">
            <header><b>Affected Locations ({b.cities.length} cities)</b>{step >= 3 ? <span className="tag bad"><CircleAlert size={13} /> {outlets} outlets affected</span> : <span className="tag">Not isolated yet</span>}</header>
            <div className="aff-body">
              <IndiaSvg className="aff-map" fill={() => '#CFE0FF'} markers={markers} label="Affected locations" />
              <table><thead><tr><th>City</th><th>Affected Outlets</th><th>Status</th></tr></thead><tbody>{b.cities.map(c => <tr key={c[0]}><td><i />{c[0]}</td><td>{step >= 3 ? c[1] : '—'}</td><td>{step >= 3 ? <span className="tag bad sm">Affected</span> : <span className="tag sm">Pending</span>}</td></tr>)}</tbody></table>
            </div>
          </div>
          <div className="tr-prog">
            <header><b>Recall Progress</b><Link href="/login">View Audit Trail <ArrowRight size={14} /></Link></header>
            <ol>{prog.map(([t, s, w], k) => <li key={t} className={lit(k) ? 'done' : ''}><CircleCheck size={20} /><span><b>{t}</b><small>{s}</small></span><time>{lit(k) ? w : 'Pending'}</time></li>)}</ol>
            <p className="tr-note"><CircleCheck size={22} /><span><b>Only affected outlets act.</b>Other stores continue selling.</span></p>
          </div>
        </div>
        <div className="tr-cmp">
          <div className="bad"><Tone tone="red"><AlertTriangle size={24} /></Tone><span><small>Without traceability:</small><b>Wide stop-sale risk</b><em>Potentially stopping sales across all cities, stores and channels.</em></span></div>
          <div className="good"><Tone tone="green"><Target size={24} /></Tone><span><small>With the platform:</small><b>Surgical recall</b><em>Act only on affected batches and outlets, minimising disruption and protecting revenue.</em></span></div>
        </div>
      </Reveal>
    </section>
  );
}

/* ─────────────────────────── Business insights ─────────────────────────── */
const SKU = [['Good Day', 'Butter Cookies', 682, 28, ['#1D4ED8', '#60A5FA']], ['Marie Gold', 'Marie Biscuits', 438, 24, ['#DC2626', '#F87171']], ['Tigress', 'Choco Biscuits', 312, 18, ['#7C3AED', '#C4B5FD']], ['NutriChoice', 'Health Biscuits', 286, 16, ['#EA580C', '#FDBA74']], ['Treat', 'Creme Biscuits', 212, 14, ['#CA8A04', '#FDE047']]];
const CHANNELS = [['General Trade', 58, 1096, 18, '#0962FF'], ['Modern Trade', 24, 454, 24, '#5B9BFF'], ['E-commerce', 12, 227, 32, '#8B5CF6'], ['Wholesale', 6, 115, 12, '#C4B5FD']];
const MARKETS = [['Karnataka', 312, 32], ['Maharashtra', 286, 26], ['Tamil Nadu', 248, 24], ['Gujarat', 198, 20], ['Uttar Pradesh', 176, 18]];
const MFILL = { karnataka: '#1E40AF', maharashtra: '#2F6BFF', 'tamil-nadu': '#5B9BFF', gujarat: '#8DB3FF', 'uttar-pradesh': '#BCD3FF' };
const PERIODS = { 'Last Quarter': [1, 0], 'Last 6 Months': [1.9, 2], 'Last Year': [3.7, 5] };
const CAMP = [48, 72, 96, 118, 132, 142];

export function Insights() {
  const [period, setPeriod] = useState('Last Quarter');
  const [sort, setSort] = useState('rev');
  const [ch, setCh] = useState(null);
  const [show, setShow] = useState({ base: true, incr: true });
  const [mk, setMk] = useState(null);
  const [m, add] = PERIODS[period];
  const skus = useMemo(() => [...SKU].sort((a, b) => (sort === 'rev' ? b[2] - a[2] : b[3] - a[3])), [sort]);
  const total = Math.round(1892 * m);
  return (
    <section className="sx sx-ins">
      <div className="in-left">
        <Reveal>
          <p className="sx-eyebrow wide">BUSINESS INSIGHTS</p>
          <h2>Turn data into <span>sharper growth decisions.</span></h2>
          <p className="sx-sub left">See what is driving performance across products, channels, markets and campaigns — all in one connected view.</p>
        </Reveal>
        <div className="in-ai">
          <p className="tagline"><Sparkles size={16} /> AI INSIGHT</p>
          <p className="in-ai-text">Premium biscuit SKUs are gaining share in <b>South and West markets</b>, led by <b>modern trade</b> and <b>campaign-driven uplift</b>.</p>
          <h6>Key drivers</h6>
          {[['+28%', 'Higher adoption in Modern Trade', ShoppingCart], ['+22%', 'Strong performance from new campaign', BarChart3], ['+18%', 'Growing demand in Tier 2 & 3 cities', UsersRound]].map(([v, t, Icon]) => <div key={v} className="drv"><Tone tone="blue"><Icon size={20} /></Tone><span><b>{v}</b><small>{t}</small></span></div>)}
        </div>
      </div>
      <div className="in-right">
        <div className="in-kpis">
          {[['Top SKU Growth', '+28%', 'vs last quarter', BarChart3, 'blue', null], ['Best Performing Channel', 'Modern Trade', 'sales growth', Store, 'blue', '+24%'], ['Fastest Growing Market', 'South India', 'vs LY', MapPin, 'purple', '+26%'], ['Campaign ROI', '3.4x', 'vs last quarter', Megaphone, 'blue', '+42%']].map(([l, v, s, Icon, tone, g]) => (
            <div key={l}><Tone tone={tone}><Icon size={24} /></Tone><span><small>{l}</small><strong>{v}</strong><em>{g && <Up>{g}</Up>} {s}</em></span></div>
          ))}
        </div>
        <div className="in-grid">
          <article className="card">
            <header><span><Tone tone="blue"><Package size={18} /></Tone><b>SKU Performance</b></span>
              <select value={period} onChange={e => setPeriod(e.target.value)} aria-label="Period">{Object.keys(PERIODS).map(p => <option key={p}>{p}</option>)}</select></header>
            <table className="in-table"><thead><tr><th>#</th><th>SKU</th>
              <th><button type="button" className={sort === 'rev' ? 'on' : ''} onClick={() => setSort('rev')}>Revenue</button></th>
              <th><button type="button" className={sort === 'g' ? 'on' : ''} onClick={() => setSort('g')}>Growth vs LY</button></th></tr></thead>
              <tbody>{skus.map(([n, d, r, g, c], k) => <tr key={n}><td><i>{k + 1}</i></td><td><Pack name={n} c={c} /><span><b>{n}</b><small>{d}</small></span></td><td>₹ {Math.round(r * m)} Cr</td><td><Up>+{g + add}%</Up></td></tr>)}</tbody></table>
          </article>
          <article className="card">
            <header><span><Tone tone="blue"><PieChart size={18} /></Tone><b>Channel Mix</b></span><span className="chip">{period}</span></header>
            <div className="cm">
              <Donut size={150} items={CHANNELS.map(c => ({ name: c[0], v: c[1], c: c[4] }))} active={ch} onActive={setCh}
                center={<><b>₹ {total.toLocaleString('en-IN')} Cr</b><small>{ch != null ? `${CHANNELS[ch][0]} ${CHANNELS[ch][1]}%` : 'Total Sales'}</small></>} />
              <ul>{CHANNELS.map(([n, p, v, g, c], k) => <li key={n} className={ch === k ? 'on' : ''} onMouseEnter={() => setCh(k)} onMouseLeave={() => setCh(null)}><i style={{ background: c }} /><span>{n}<small>₹ {Math.round(v * m).toLocaleString('en-IN')} Cr</small></span><b>{p}%</b><Up>+{g + add}%</Up></li>)}</ul>
            </div>
          </article>
          <article className="card">
            <header><span><Tone tone="blue"><MapPin size={18} /></Tone><b>Market Trends</b></span><span className="chip">{period}</span></header>
            <div className="mt">
              <IndiaSvg className="mt-map" selected={mk} onSelect={id => setMk(id === mk ? null : id)} fill={id => MFILL[id] ?? '#DCE8FF'} label="Market trends" />
              <div><h6>Top Performing Markets</h6><ol>{MARKETS.map(([n, v, g], k) => { const id = n.toLowerCase().replace(/\s/g, '-'); return <li key={n}><button type="button" className={mk === id ? 'on' : ''} onClick={() => setMk(mk === id ? null : id)}><em>{k + 1}</em>{n}<b>₹ {Math.round(v * m)} Cr</b><Up>+{g + add}%</Up></button></li>; })}</ol></div>
            </div>
          </article>
          <article className="card">
            <header><span><Tone tone="blue"><Megaphone size={18} /></Tone><b>Campaign Effectiveness</b></span><span className="chip">{period}</span></header>
            <div className="ce-kpis">{[['₹ 142 Cr', 'Incremental Sales', '+26%', BarChart3], ['3.4x', 'Campaign ROI', '+42%', Percent], ['₹ 18 Cr', 'Total Spend', '-12%', Layers]].map(([v, l, g, Icon]) => <div key={l}><Tone tone="blue"><Icon size={18} /></Tone><span><b>{v}</b><small>{l}</small><em className={g.startsWith('-') ? 'dn' : ''}>{g}</em></span></div>)}</div>
            <div className="ce-legend"><b>Campaign Sales Uplift (₹ Cr)</b>
              <label><input type="checkbox" checked={show.base} onChange={e => setShow(s => ({ ...s, base: e.target.checked }))} /><i className="b" />Baseline Sales</label>
              <label><input type="checkbox" checked={show.incr} onChange={e => setShow(s => ({ ...s, incr: e.target.checked }))} /><i className="i" />Incremental Sales</label></div>
            <div className="ce-bars">{CAMP.map((v, k) => <div key={k} title={`${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][k]}: ₹ ${v} Cr`}><b>{v}</b><span style={{ height: `${(v / 150) * 100}%` }}>{show.incr && <i className="i" style={{ height: `${10 + k * 2}px` }} />}{show.base && <i className="b" />}</span><small>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][k]}</small></div>)}</div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Forecast ─────────────────────────── */
const REGIONS = { 'Q2 2024': [['North', 120, 130], ['South', 180, 155], ['East', 95, 110], ['West', 160, 135], ['Central', 100, 105]], 'Q3 2024': [['North', 128, 130], ['South', 196, 160], ['East', 101, 110], ['West', 176, 138], ['Central', 106, 105]] };
const RECOS = [
  { r: 'West', tag: 'High Priority', tone: 'bad', t: '+18% demand-capacity gap.', s: 'Add a shift at the nearest plant.', more: 'Adding a second shift at the Pune plant closes the gap by ~16 pts at 11% extra cost.' },
  { r: 'South', tag: 'Growth Opportunity', tone: 'good', t: '+16% growth expected.', s: 'Prioritise the new line here.', more: 'Fast-tracking Line 4 in Hosur unlocks ~18 Cr units of capacity before the festive peak.' },
  { r: 'North', tag: 'Optimise', tone: 'info', t: '7% surplus capacity.', s: 'Reallocate stock short-term.', more: 'Move 6 Cr units to Central distributors to offset the shortfall without new production.' }
];
const TOP = [['Packed Milk', 28, '#3B82F6'], ['Biscuits', 24, '#DC2626'], ['Instant Noodles', 20, '#F97316'], ['Edible Oil', 18, '#EAB308'], ['Beverages', 16, '#2563EB']];

export function Forecast() {
  const [q, setQ] = useState('Q2 2024');
  const [open, setOpen] = useState(0);
  const [hov, setHov] = useState(null);
  const data = REGIONS[q];
  const [tip, setTip] = useState(null);
  const trend = q === 'Q2 2024' ? [105, 122, 138, 155, 170, 186] : [112, 131, 147, 165, 182, 200];
  const cap = [80, 92, 104, 116, 128, 140];
  const W = 380, H = 150, px = i => 36 + i * ((W - 50) / 5), py = v => 12 + (1 - v / 220) * (H - 36);
  return (
    <section className="sx sx-fc">
      <div className="fc-left">
        <Reveal>
          <p className="sx-eyebrow wide">DEMAND &amp; CAPACITY PLANNING</p>
          <h2>Forecast demand.<br />Align capacity<br /><span>with confidence.</span></h2>
          <p className="sx-sub left">See where demand is growing, compare it with current capacity, and act early with region-wise recommendations.</p>
        </Reveal>
        {[['Accurate Forecasts', 'AI-powered demand forecasting across products and regions.', BarChart3], ['Optimised Capacity', 'Identify gaps early and plan capacity with confidence.', Factory], ['Actionable Recommendations', 'Get region-wise, actionable suggestions to stay ahead.', Repeat]].map(([t, d, Icon]) => <div key={t} className="fc-feat"><Tone tone="blue"><Icon size={24} /></Tone><span><b>{t}</b><small>{d}</small></span></div>)}
      </div>
      <div className="fc-board">
        <div className="fc-kpis">{[['Forecast Accuracy', '94%', '+6%', 'vs last quarter', Target, 'blue'], ['Regions Monitored', '5', null, '100% coverage', MapPin, 'blue'], ['Capacity Risk', '2 Regions', null, 'Require attention', AlertTriangle, 'red'], ['Next Quarter Demand', '+14%', '+14%', 'vs this quarter', BarChart3, 'blue']].map(([l, v, g, s, Icon, tone]) => <div key={l}><Tone tone={tone}><Icon size={24} /></Tone><span><small>{l}</small><strong>{v}</strong><em>{g && <Up>{g}</Up>} {s}</em></span></div>)}</div>
        <div className="fc-row">
          <article className="card fc-reg">
            <header><span><Tone tone="blue"><BarChart3 size={18} /></Tone><b>Forecast vs. Capacity by Region</b></span>
              <select value={q} onChange={e => setQ(e.target.value)} aria-label="Quarter">{Object.keys(REGIONS).map(k => <option key={k}>{k}</option>)}</select></header>
            <p className="legend"><i className="f" />Forecast Demand <i className="c" />Current Capacity</p>
            <div className="fc-bars">{[0, 50, 100, 150, 200].map(t => <u key={t} style={{ bottom: `${(t / 200) * 100}%` }}><small>{t}</small></u>)}
              {data.map(([r, f, c]) => (
                <div key={r} className={hov === r ? 'on' : ''} onMouseEnter={() => setHov(r)} onMouseLeave={() => setHov(null)} tabIndex={0} onFocus={() => setHov(r)} onBlur={() => setHov(null)}>
                  <span><i className="f" style={{ height: `${(f / 200) * 100}%` }}><b>{f}</b></i><i className="c" style={{ height: `${(c / 200) * 100}%` }}><b>{c}</b></i></span><small>{r}</small>
                  {hov === r && <em className="tipbox">{r}: demand {f} vs capacity {c} Cr units · <strong className={f > c ? 'bad' : 'ok'}>{f > c ? `gap ${f - c}` : `surplus ${c - f}`}</strong></em>}
                </div>
              ))}</div>
          </article>
          <article className="card fc-rec">
            <header><span><Tone tone="orange"><Lightbulb size={18} /></Tone><b>Region Recommendations</b></span></header>
            {RECOS.map((x, k) => (
              <button key={x.r} type="button" className={`reco ${x.tone}${open === k ? ' open' : ''}`} onClick={() => setOpen(open === k ? -1 : k)} aria-expanded={open === k}>
                <MapPin size={20} /><span><b>{x.r}<i>{x.tag}</i></b><em>{x.t}</em><small>{x.s}</small>{open === k && <u>{x.more}</u>}</span><ChevronRight size={16} />
              </button>
            ))}
          </article>
        </div>
        <div className="fc-row b">
          <article className="card">
            <header><span><Tone tone="blue"><TrendingUp size={18} /></Tone><b>Demand Forecast Trend (All Regions)</b></span></header>
            <p className="legend"><i className="f" />Forecast Demand <i className="c" />Current Capacity</p>
            <svg viewBox={`0 0 ${W} ${H}`} className="sx-chart" onMouseLeave={() => setTip(null)} onMouseMove={e => { const r = e.currentTarget.getBoundingClientRect(); setTip(Math.max(0, Math.min(5, Math.round((((e.clientX - r.left) / r.width) * W - 36) / ((W - 50) / 5))))); }}>
              {[0, 100, 200].map(t => <g key={t}><line x1="34" x2={W - 10} y1={py(t)} y2={py(t)} className="g" /><text x="28" y={py(t) + 3} textAnchor="end">{t}</text></g>)}
              {['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((l, i) => <text key={l} x={px(i)} y={H - 6} textAnchor="middle">{l}</text>)}
              <polyline points={cap.map((v, i) => `${px(i)},${py(v)}`).join(' ')} fill="none" stroke="#8FB8FF" strokeWidth="2" strokeDasharray="5 4" />
              <polyline points={trend.map((v, i) => `${px(i)},${py(v)}`).join(' ')} fill="none" stroke="#0962FF" strokeWidth="2.4" />
              {trend.map((v, i) => <circle key={i} cx={px(i)} cy={py(v)} r={tip === i ? 5 : 3} fill="#fff" stroke="#0962FF" strokeWidth="2" />)}
              {tip != null && <g transform={`translate(${Math.min(px(tip) - 40, W - 100)} ${py(trend[tip]) - 38})`}><rect width="90" height="30" rx="7" fill="#0B1A4A" /><text x="45" y="13" textAnchor="middle" fill="#fff" fontWeight="700">Demand {trend[tip]}</text><text x="45" y="25" textAnchor="middle" fill="#B8C7F0" fontSize="9">Capacity {cap[tip]}</text></g>}
            </svg>
          </article>
          <article className="card">
            <header><span><Tone tone="blue"><Package size={18} /></Tone><b>Top Demand Growth Products</b></span><span className="chip">{q}</span></header>
            <ol className="top-list">{TOP.map(([n, g, c], k) => <li key={n}><em>{k + 1}</em><Pack name={n} c={[c, c]} />{n}<Up>+{g + (q === 'Q3 2024' ? 2 : 0)}%</Up></li>)}</ol>
          </article>
        </div>
        <div className="fc-ai"><Tone tone="blue"><Sparkles size={26} /></Tone><span><small>AI INSIGHT</small><b>Overall demand is expected to grow by 14% next quarter, with capacity gaps in West and South.</b><em>Recommend adding a shift at the West plant and fast-tracking the new line in South to meet projected demand.</em></span><Link href="/login" className="btn-out">View Detailed Plan <ArrowRight size={14} /></Link></div>
      </div>
    </section>
  );
}
