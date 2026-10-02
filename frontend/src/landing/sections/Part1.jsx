'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, BarChart3, Box, Boxes, CircleCheck, Database, Lightbulb, MessageSquareText, PieChart, Send, Sparkles, Store, Target, TrendingUp, Truck, UsersRound
} from 'lucide-react';
import { IndiaSvg, Pack, Reveal, SectionHead, Tone, Up, seedNum } from '../kit';

const go = id => e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

/* ─────────────────────────── 1 · Platform ─────────────────────────── */
const CAPS = [
  { n: '01', t: 'Business Visibility', tone: 'blue', d: 'See performance across your organisation from one connected view.', cta: 'Explore Business Visibility', to: 'visibility', Icon: BarChart3 },
  { n: '02', t: 'AI Business Intelligence', tone: 'green', d: 'Ask questions in natural language and turn business data into understandable answers.', cta: 'Explore AI Intelligence', to: 'ask', Icon: Box },
  { n: '03', t: 'Operational Intelligence', tone: 'purple', d: 'Monitor performance, identify gaps and understand where action is needed.', cta: 'Explore Operational Intelligence', to: 'traceability', Icon: PieChart },
  { n: '04', t: 'Forecasting & Planning', tone: 'orange', d: 'Use historical and current data to anticipate demand, trends and future requirements.', cta: 'Explore Forecasting & Planning', to: 'forecast', Icon: TrendingUp }
];

function CapPreview({ i }) {
  if (i === 0) return (
    <div className="pv"><b>Business Overview</b>
      <div className="pv-kpis">{[['Total Revenue', '$12.8M', '12%'], ['Active Customers', '2,541', '8%'], ['Total Orders', '18,320', '15%']].map(([l, v, g]) => <div key={l}><small>{l}</small><strong>{v}</strong><Up>{g}</Up></div>)}</div>
      <div className="pv-map"><IndiaSvg className="mini" fill={() => '#B9D0FF'} label="Regions" /><ul>{[['North America', '$4.2M'], ['Europe', '$3.1M'], ['Asia Pacific', '$2.8M'], ['Latin America', '$1.6M']].map(([n, v], k) => <li key={n}><i style={{ background: ['#2563EB', '#5B9BFF', '#93B8FF', '#F5B73B'][k] }} />{n}<b>{v}</b></li>)}</ul></div>
    </div>
  );
  if (i === 1) return (
    <div className="pv"><div className="pv-q"><span>What were our top performing regions last quarter?</span><i><Send size={12} /></i></div>
      <div className="pv-ans"><small>Here are your top performing regions in Q2 2024:</small>{[['North America', '$4.2M', 18, 100], ['Europe', '$3.1M', 14, 74], ['Asia Pacific', '$2.8M', 11, 66]].map(([n, v, g, w], k) => <div key={n} className="pv-row"><em>{k + 1}</em><span>{n}<u style={{ width: `${w}%` }} /></span><b>{v}</b><Up>{g}%</Up></div>)}</div>
      <div className="pv-chips"><span>What&apos;s driving the growth?</span><span>Compare to last year</span><span>Show by product</span></div>
    </div>
  );
  if (i === 2) return (
    <div className="pv"><b>Operations Overview</b>
      <div className="pv-kpis">{[['Order Fulfillment', '96%', '2%'], ['Inventory Health', '92%', '5%'], ['On-Time Delivery', '89%', '3%']].map(([l, v, g]) => <div key={l}><small>{l}</small><strong>{v}</strong><Up>{g}</Up></div>)}</div>
      <small className="pv-sub">Key Areas</small>
      {[['Production', 70, '#10B981', 'On Track'], ['Inventory', 45, '#F5B73B', 'Needs Attention'], ['Supply Chain', 30, '#EF4444', 'At Risk'], ['Service Levels', 70, '#10B981', 'On Track']].map(([n, w, c, s]) => <div key={n} className="pv-bar"><span>{n}</span><u><i style={{ width: `${w}%`, background: c }} /></u><em style={{ color: c }}>● {s}</em></div>)}
    </div>
  );
  return (
    <div className="pv"><b>Demand Forecast</b>
      <svg viewBox="0 0 220 90" className="pv-line"><path d="M5 78 L38 72 L70 60 L102 56 L134 42 L166 30 L215 14" fill="none" stroke="#0962FF" strokeWidth="2.2" /><path d="M134 42 L166 28 L215 8 L215 40 L134 42Z" fill="#0962FF" opacity=".12" /></svg>
      <div className="pv-reco"><Lightbulb size={16} /><span><b>AI Recommendation</b>Increase inventory by 20% in key regions to meet projected demand.</span></div>
      <span className="pv-badge"><TrendingUp size={13} /> 24% Forecasted Growth</span>
    </div>
  );
}

export function Platform() {
  const [hot, setHot] = useState(null);
  return (
    <section className="sx sx-platform">
      <Reveal><SectionHead eyebrow="ONE PLATFORM. FOUR BUSINESS CAPABILITIES" sub="Connect your sales, operations, products, customers, supply and business data on one AI-powered platform. Get a connected view of your organisation and act with confidence.">Turn fragmented business data<br />into <span>decisions that drive growth.</span></SectionHead></Reveal>
      <div className={'sx-caps' + (hot != null ? ' has-hot' : '')}>
        {CAPS.map(({ n, t, tone, d, cta, to, Icon }, i) => (
          <Reveal key={t} delay={i * 80} className={`cap tone-${tone}${hot === i ? ' hot' : ''}`}>
            <article onMouseEnter={() => setHot(i)} onMouseLeave={() => setHot(null)} onFocus={() => setHot(i)} onBlur={() => setHot(null)}>
              <div className="cap-copy">
                <Tone tone={tone}><Icon size={26} /></Tone>
                <em>{n}</em><h3>{t}</h3><p>{d}</p>
                <a href={`#${to}`} onClick={go(to)} className="cap-link">{cta} <ArrowRight size={16} /></a>
              </div>
              <CapPreview i={i} />
            </article>
          </Reveal>
        ))}
        <div className="cap-core" aria-hidden><span><Sparkles size={22} /></span><b>AI &amp; ML Core</b><small>Connects your data.<br />Finds the insights.<br />Powers every decision.</small></div>
      </div>
    </section>
  );
}

/* ─────────────────────────── 2 · Ask ─────────────────────────── */
const QA = [
  { q: 'Which cities had the strongest sales growth last quarter?', tab: 'Sales', a: <>Sales growth was strongest in <b>Chennai, Pune</b> and <b>Bengaluru</b>, driven by premium biscuit SKUs and modern trade growth.</> },
  { q: 'Where has Batch B-2291 been dispatched?', tab: 'Batch', a: <>Batch <b>B-2291</b> shipped from <b>Plant A – Line 3</b> to <b>2 depots</b>, <b>4 distributors</b> and <b>38 outlets</b> across 6 cities.</> },
  { q: 'What are my top 10 SKUs this month?', tab: 'Insights', a: <>Your top SKU is <b>Good Day Butter Cookies</b> at ₹682 Cr, followed by <b>Marie Gold</b> and <b>Tigress</b>; premium SKUs are gaining share.</> },
  { q: 'Do we have enough capacity for Q3 demand?', tab: 'Capacity', a: <>Demand is expected to grow <b>14%</b>. <b>West</b> and <b>South</b> show capacity gaps; North has 7% surplus to reallocate.</> }
];
const STEPS = [['Understand', 'Recognises intent, region, SKU and time period', MessageSquareText, 'blue'], ['Connect', 'Pulls plant, distributor, retail and batch data', Database, 'green'], ['Analyse', 'Applies AI and ML for trends, patterns and anomalies', BarChart3, 'purple'], ['Explain', 'Returns the answer with visuals and a written insight', Lightbulb, 'orange']];
const TABS = ['Sales', 'Batch', 'Insights', 'Capacity'];
const NAVS = [['Ask AI', MessageSquareText], ['Sales', BarChart3], ['Batches', Box], ['Demand', TrendingUp], ['Distribution', Truck], ['Insights', PieChart]];

function AnswerBody({ tab }) {
  if (tab === 'Sales') return (
    <div className="aa-grid">
      <div className="aa-card"><h5>Sales Growth by Top Cities</h5><div className="aa-bars">{[['Chennai', 42, 100], ['Pune', 34, 80], ['Bengaluru', 28, 66], ['Hyderabad', 18, 42], ['Mumbai', 12, 28]].map(([n, v, h], i) => <div key={n}><b>+{v}%</b><i style={{ height: `${h}%`, opacity: 1 - i * 0.14 }} /><small>{n}</small></div>)}</div></div>
      <div className="aa-card"><h5>Sales Trend</h5><svg viewBox="0 0 220 110" className="aa-line">{[['#0962FF', '10 85 48 70 88 58 128 44 168 30 210 14'], ['#8B5CF6', '10 92 48 80 88 68 128 60 168 46 210 34'], ['#7DB5FF', '10 100 48 94 88 88 128 82 168 74 210 64']].map(([c, p]) => <polyline key={c} points={p} fill="none" stroke={c} strokeWidth="2" />)}</svg></div>
      <div className="aa-card"><h5>Top Performing Cities</h5><ol className="aa-list">{[['Chennai', 42], ['Pune', 34], ['Bengaluru', 28], ['Hyderabad', 18], ['Mumbai', 12]].map(([n, v], i) => <li key={n}><em>{i + 1}</em>{n}<b>+{v}%</b></li>)}</ol></div>
    </div>
  );
  if (tab === 'Batch') return (
    <div className="aa-grid two"><div className="aa-card"><h5>Dispatch trail · Batch B-2291</h5><ol className="aa-trail">{[['Plant A – Line 3', '1 location', Boxes], ['Depots', 'North, West', Store], ['Distributors', '4 primary', Truck], ['Outlets', '38 across 6 cities', Store]].map(([n, s, I]) => <li key={n}><I size={16} /><b>{n}</b><small>{s}</small></li>)}</ol></div>
      <div className="aa-card"><h5>Status</h5><p className="aa-big">Traced <CircleCheck size={22} color="#10B981" /></p><small>MFD 12 Jan 2026 · EXP 12 Jan 2027</small></div></div>
  );
  if (tab === 'Insights') return (
    <div className="aa-grid two"><div className="aa-card"><h5>Top SKUs this month</h5><ol className="aa-list">{[['Good Day', '₹682 Cr', 28], ['Marie Gold', '₹438 Cr', 24], ['Tigress', '₹312 Cr', 18], ['NutriChoice', '₹286 Cr', 16], ['Treat', '₹212 Cr', 14]].map(([n, v, g], i) => <li key={n}><em>{i + 1}</em><Pack name={n} c={['#EA580C', '#FBBF24']} />{n}<b>{v}</b><Up>{g}%</Up></li>)}</ol></div>
      <div className="aa-card"><h5>Drivers</h5><ul className="aa-bul"><li>Premium SKUs grew 2.3× faster than the category.</li><li>Modern trade contributed 68% of growth.</li><li>Tier 2 &amp; 3 cities show rising demand.</li></ul></div></div>
  );
  return (
    <div className="aa-grid two"><div className="aa-card"><h5>Demand vs capacity</h5>{[['North', 120, 130], ['South', 180, 155], ['West', 160, 135], ['East', 95, 110]].map(([r, d, c]) => <div key={r} className="aa-cap"><span>{r}</span><u><i style={{ width: `${(d / 200) * 100}%` }} /><s style={{ width: `${(c / 200) * 100}%` }} /></u><b className={d > c ? 'bad' : 'ok'}>{d > c ? 'Gap' : 'OK'}</b></div>)}</div>
      <div className="aa-card"><h5>Recommendation</h5><p className="aa-note">Add a shift at the West plant and fast-track the new line in South to meet projected demand.</p></div></div>
  );
}

export function Ask() {
  const [i, setI] = useState(0);
  const [text, setText] = useState(QA[0].q);
  const [tab, setTab] = useState('Sales');
  const [step, setStep] = useState(4);
  const timers = useRef([]);
  const run = idx => {
    timers.current.forEach(clearTimeout); timers.current = [];
    setI(idx); setText(QA[idx].q); setTab(QA[idx].tab); setStep(0);
    [1, 2, 3, 4].forEach(s => timers.current.push(setTimeout(() => setStep(s), s * 380)));
  };
  const submit = e => {
    e.preventDefault();
    const q = text.toLowerCase();
    run(/batch|dispatch/.test(q) ? 1 : /sku|top 10|product/.test(q) ? 2 : /capacity|demand|forecast/.test(q) ? 3 : 0);
  };
  const chips = QA.map((x, k) => [x, k]).filter(([, k]) => k !== i).slice(0, 3);
  return (
    <section className="sx sx-ask">
      <div className="ask-left">
        <Reveal>
          <p className="sx-eyebrow wide">ASK YOUR BUSINESS — AI INTELLIGENCE</p>
          <h2>Ask the question.<br /><span>Get the answer.</span></h2>
          <p className="sx-sub left">Use natural-language questions to explore sales, batch movement, business performance and demand. The platform understands your context, connects the right data and returns answers with clear insights.</p>
        </Reveal>
        <ol className="ask-steps">
          {STEPS.map(([t, d, Icon, tone], k) => (
            <li key={t} className={step > k ? 'done' : step === k ? 'now' : ''}>
              <button type="button" onClick={() => setStep(k + 1)} aria-label={`${t}: ${d}`}>
                <Tone tone={tone}><Icon size={22} /></Tone>
                <span><em>0{k + 1}</em><b>{t}</b><small>{d}</small></span>
              </button>
            </li>
          ))}
        </ol>
      </div>
      <Reveal className="ask-demo" delay={100}>
        <div className="win">
          <header><i /><i /><i /><span>FMCG AI Platform</span><em>A</em></header>
          <div className="win-body">
            <nav aria-label="Demo navigation">{NAVS.map(([n, Icon]) => <span key={n} className={n === 'Ask AI' ? 'on' : ''}><Icon size={15} />{n}</span>)}</nav>
            <div className="win-main">
              <form className="ask-box" onSubmit={submit}>
                <Sparkles size={18} />
                <input value={text} onChange={e => setText(e.target.value)} aria-label="Ask a question" />
                <button type="submit" aria-label="Ask"><Send size={16} /></button>
              </form>
              <div className="ask-chips">{chips.map(([x, k]) => <button key={x.q} type="button" onClick={() => run(k)}>{x.q}</button>)}</div>
              <div className="ask-answer">
                <div className="ans-head"><b><Sparkles size={14} /> AI Answer</b>
                  <div role="tablist">{TABS.map(t => <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
                </div>
                <p className="ans-sum"><Sparkles size={16} />{step >= 4 ? <span>{QA[i].a}</span> : <span className="thinking">Analysing your data<i>.</i><i>.</i><i>.</i></span>}</p>
                <AnswerBody tab={tab} />
                <div className="ans-insights"><span><b>Key Insights</b>• Chennai, Pune and Bengaluru contributed 52% of total sales growth last quarter.<br />• Premium biscuit SKUs grew 2.3× faster than the category average in these cities.</span><strong>+28%<small>Overall sales growth in top 3 cities</small></strong></div>
              </div>
            </div>
          </div>
          <Link href="/login" className="win-cta"><span><Target size={18} /></span><b>From question to decision — <em>without waiting for reports.</em></b><ArrowRight size={16} /></Link>
        </div>
      </Reveal>
    </section>
  );
}

/* ─────────────────────────── 3 · Sales visibility ─────────────────────────── */
const GEO = {
  maharashtra: { n: 'Maharashtra', sales: 1892, g: 22, cities: [['Mumbai', 682], ['Pune', 438], ['Nagpur', 212], ['Nashik', 176], ['Aurangabad', 110]] },
  karnataka: { n: 'Karnataka', sales: 1420, g: 19, cities: [['Bengaluru', 590], ['Mysuru', 280], ['Hubballi', 190], ['Mangaluru', 160], ['Belagavi', 120]] },
  'tamil-nadu': { n: 'Tamil Nadu', sales: 1310, g: 17, cities: [['Chennai', 520], ['Coimbatore', 300], ['Madurai', 190], ['Tiruchirappalli', 150], ['Salem', 110]] },
  'uttar-pradesh': { n: 'Uttar Pradesh', sales: 1180, g: 15, cities: [['Lucknow', 410], ['Kanpur', 280], ['Varanasi', 200], ['Agra', 160], ['Noida', 130]] },
  gujarat: { n: 'Gujarat', sales: 1040, g: 14, cities: [['Ahmedabad', 400], ['Surat', 280], ['Vadodara', 170], ['Rajkot', 120], ['Bhavnagar', 70]] }
};
const DISTS = ['Shree Balaji Distributors', 'Om Sai Enterprises', 'Metro Supplies', 'Western FMCG Mart', 'Jai Ganesh Distributors'];
const CLUSTERS = ['Kothrud', 'Hinjewadi', 'Baner', 'Wakad', 'Pimpri'];
const SKUS = ['Britannia Good Day', 'Parle-G', 'Coca-Cola', 'Maggi', 'Amul Milk'];
const SHADES = ['#1E40AF', '#2F6BFF', '#6C9BFF', '#A9C6FF', '#D5E3FF'];
const fmt = n => `₹ ${Math.round(n).toLocaleString('en-IN')} Cr`;

export function Visibility() {
  const [sel, setSel] = useState({ state: 'maharashtra', city: 1, dist: 0, store: 0 });
  const st = GEO[sel.state];
  const city = st.cities[sel.city];
  const dists = DISTS.map((n, k) => [n, city[1] * (0.32 - k * 0.055)]);
  const dist = dists[sel.dist];
  const clusters = CLUSTERS.map((n, k) => [n, dist[1] * (0.23 - k * 0.03)]);
  const store = clusters[sel.store];
  const pick = patch => setSel(s => ({ ...s, ...patch }));
  const choose = id => GEO[id] && setSel({ state: id, city: 0, dist: 0, store: 0 });
  const level = k => (k === 0 ? 'India' : k === 1 ? st.n : k === 2 ? city[0] : k === 3 ? dist[0] : clusters[sel.store][0]);
  const spark = Array.from({ length: 6 }, (_, k) => 8 + seedNum(store[0] + k, 0, 6) + k * 2.4);
  return (
    <section className="sx sx-vis">
      <Reveal><SectionHead eyebrow="SALES VISIBILITY" sub="Start from the national view, then drill down from India to state, city, distributor and store performance in seconds.">See the business clearly <span>at every level.</span></SectionHead></Reveal>
      <div className="vis-kpis">
        {[['National Revenue', '₹ 8,426 Cr', '+18%', 'vs LY', BarChart3, 'blue'], ['States Live', '28 / 28', null, '100% coverage', Target, 'blue'], ['Distributors Active', '1,240', '+12%', 'vs LY', UsersRound, 'purple'], ['Stores Tracked', '125,000+', '+28%', 'vs LY', Store, 'green']].map(([l, v, g, s, Icon, tone]) => (
          <div key={l}><Tone tone={tone}><Icon size={24} /></Tone><span><small>{l}</small><strong>{v}</strong><em>{g && <Up>{g}</Up>} {s}</em></span></div>
        ))}
      </div>
      <div className="vis-levels">
        {['India', 'State', 'City', 'Distributor', 'Store'].map((l, k) => <span key={l} className="lv-pill"><i>{k + 1}</i>{l}</span>)}
      </div>
      <div className="vis-cards">
        <article className="vc vc-india">
          <header><b>India Sales Overview</b><span className="chip">Last Quarter</span></header>
          <small>Total Sales</small><strong>₹ 8,426 Cr</strong><Up>+18%</Up> <small>vs last year</small>
          <IndiaSvg className="vc-map" selected={sel.state} onSelect={choose} fill={id => (GEO[id] ? SHADES[Math.min(4, Object.keys(GEO).indexOf(id))] : '#DCE8FF')} label="Select a state" />
          <p className="vc-hint">Click Maharashtra, Karnataka, Tamil Nadu, Uttar Pradesh or Gujarat</p>
        </article>
        <article className="vc">
          <header><b>{st.n}</b><span className="chip">Q2 2024</span></header>
          <small>State Sales</small><strong>{fmt(st.sales)}</strong><Up>+{st.g}%</Up><small> vs LY</small>
          <h6>Top Cities</h6>
          <ol className="vc-list">{st.cities.map(([n, v], k) => (
            <li key={n}><button type="button" className={sel.city === k ? 'on' : ''} onClick={() => pick({ city: k, dist: 0, store: 0 })}><em>{k + 1}</em><span>{n}</span><u><i style={{ width: `${(v / st.cities[0][1]) * 100}%` }} /></u><b>{fmt(v)}</b></button></li>
          ))}</ol>
        </article>
        <article className="vc">
          <header><b>{city[0]}</b><span className="chip">Q2 2024</span></header>
          <small>City Sales</small><strong>{fmt(city[1])}</strong><Up>+{Math.round(seedNum(city[0], 18, 29))}%</Up><small> vs LY</small>
          <h6>Channel Split</h6>
          <div className="vc-split"><i style={{ width: '58%' }} /><i style={{ width: '24%' }} /><i style={{ width: '18%' }} /></div>
          <ul className="vc-legend"><li><i />General Trade<b>58%</b></li><li><i />Modern Trade<b>24%</b></li><li><i />eCommerce<b>18%</b></li></ul>
          <h6>Top Distributors</h6>
          <ol className="vc-list tight">{dists.map(([n, v], k) => <li key={n}><button type="button" className={sel.dist === k ? 'on' : ''} onClick={() => pick({ dist: k, store: 0 })}><em>{k + 1}</em><span>{n}</span><b>{fmt(v)}</b></button></li>)}</ol>
        </article>
        <article className="vc">
          <header><b>{dist[0]}</b><span className="chip">Q2 2024</span></header>
          <small>Distributor Sales</small><strong>{fmt(dist[1])}</strong><Up>+{Math.round(seedNum(dist[0], 16, 26))}%</Up><small> vs LY</small>
          <div className="vc-bars">{[40, 52, 62, 46, 58, 76].map((h, k) => <i key={k} style={{ height: `${h}%` }}><u>{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'][k]}</u></i>)}</div>
          <h6>Top Store Clusters</h6>
          <ol className="vc-list tight">{clusters.map(([n, v], k) => <li key={n}><button type="button" className={sel.store === k ? 'on' : ''} onClick={() => pick({ store: k })}><em>{k + 1}</em><span>{n}</span><b>{fmt(v)}</b></button></li>)}</ol>
        </article>
        <article className="vc">
          <header><b>More Supermarket</b><span className="chip">Q2 2024</span></header>
          <small>Store Sales · {store[0]}</small><strong>₹ {(store[1] / 17).toFixed(1)} Cr</strong><Up>+{Math.round(seedNum(store[0], 14, 24))}%</Up><small> vs LY</small>
          <svg viewBox="0 0 160 70" className="vc-spark"><polyline points={spark.map((v, k) => `${10 + k * 28},${64 - v * 2.4}`).join(' ')} fill="none" stroke="#0962FF" strokeWidth="2" />{spark.map((v, k) => <circle key={k} cx={10 + k * 28} cy={64 - v * 2.4} r="3" fill="#fff" stroke="#0962FF" strokeWidth="1.6" />)}</svg>
          <h6>Top SKUs at this Store</h6>
          <ol className="vc-list tight">{SKUS.map((n, k) => <li key={n}><span className="row"><em>{k + 1}</em><span>{n}</span><b>₹ {Math.round(28 - k * 3.2 + seedNum(store[0] + n, 0, 2))} L</b></span></li>)}</ol>
        </article>
      </div>
      <p className="vis-crumb" aria-live="polite">{[0, 1, 2, 3, 4].map(k => <span key={k}>{level(k)}{k < 4 ? ' › ' : ''}</span>)}</p>
      <Link href="/login" className="sx-banner"><span><Target size={18} /></span><b>From national totals to outlet-level performance — <em>one connected sales view.</em></b><ArrowRight size={16} /></Link>
    </section>
  );
}

