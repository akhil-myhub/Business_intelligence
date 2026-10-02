'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Bell, BookOpenCheck, ChartColumn, ChevronRight, CloudCheck, Cog, Database, FileSpreadsheet, FlaskConical, KeyRound, Link2, Lock, MapPin, Network,
  ShieldCheck, Smartphone, Sparkles, Store, TrendingUp, Truck, UsersRound, Workflow, Factory, MessageSquare, CircleAlert, Lightbulb, LayoutDashboard, ScrollText, UploadCloud, Users, Settings2, Boxes, Layers, BarChart3
} from 'lucide-react';
import { IndiaSvg, Counter, Reveal, SectionHead, Tone } from '../kit';

const go = id => e => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

/* ─────────────────────────── One connected data foundation ─────────────────────────── */
const COLS = [
  { n: 1, t: 'Enterprise Data', d: 'Bring together data from across your FMCG operations.', items: [['ERP & Plant MES', 'Production, inventory, production plans', Factory, 'blue', 'Connects SAP, Oracle, Dynamics and plant MES to read orders, stock and production plans.'], ['QC & Batch Records', 'Quality tests, batch data, compliance records', FlaskConical, 'purple', 'Reads lab results and batch genealogy to power traceability and quality alerts.'], ['Distributor DMS', 'Secondary sales, distributor inventory', Truck, 'blue', 'Pulls secondary sales and stock from distributor management systems.'], ['Retail POS & Orders', 'Sales, orders, market-level demand', Store, 'blue', 'Brings point-of-sale and order data to the outlet level.']] },
  { n: 2, t: 'Unified Data Layer', d: 'Securely connect, standardize and unify your data.', items: [['Secure Connectors', 'Pre-built and custom connectors with enterprise grade security', Link2, 'blue', 'Encrypted, least-privilege connectors with audit logging for every source.'], ['Governed Data Model', 'Standardized, compliant FMCG data model', Database, 'blue', 'One shared definition of SKU, outlet, batch and territory across systems.'], ['Batch Genealogy Graph', 'End-to-end traceability across raw materials, production and distribution', Network, 'blue', 'Graph of every material, batch and dispatch for precise recalls.'], ['Clean, Normalized Data', 'Deduped, enriched and analysis-ready data', ScrollText, 'blue', 'Duplicates removed and gaps enriched so analysis starts from trusted data.']] },
  { n: 3, t: 'AI / ML Engine', d: 'Turn unified data into intelligence using advanced AI and ML.', items: [] },
  { n: 4, t: 'Experience Layer', d: 'Actionable insights for every team, anytime, anywhere.', items: [['Web dashboards', 'Role-based views for sales, supply chain, quality and leadership', LayoutDashboard, 'blue', 'Role-based dashboards for every team, with drill-down to the outlet.'], ['Mobile view', 'Key insights on the go for field and leadership teams', Smartphone, 'blue', 'Field and leadership views that work on any phone.'], ['Alerts & stop-sale notifications', 'Proactive alerts for quality, compliance and demand risks', Bell, 'red', 'Real-time alerts routed to the right people and outlets.'], ['Reports & exports', 'Share insights with custom reports and scheduled exports', FileSpreadsheet, 'green', 'PDF, Excel and PowerPoint reports, on demand or on a schedule.']] }
];
const ENGINE = [['Natural-language queries', 'Ask questions and get instant insights', MessageSquare], ['Demand forecasting', 'Predict demand across SKUs, channels and regions', ChartColumn], ['Anomaly detection', 'Detect risks, quality issues and unusual patterns', CircleAlert], ['Business intelligence generation', 'Turn data into explainable, actionable insights', Lightbulb]];

export function Foundation() {
  const [on, setOn] = useState('0-0');
  return (
    <section id="foundation" className="sx sx-fd">
      <Reveal><SectionHead eyebrow="HOW THE PLATFORM WORKS" sub="Connect the systems you already use — then turn operational data into intelligence your teams can act on.">One connected <span>data foundation.</span></SectionHead></Reveal>
      <div className="fd-cols">
        {COLS.map((c, ci) => (
          <Reveal key={c.t} delay={ci * 80} className={`fd-col${ci === 2 ? ' core' : ''}`}>
            <article>
              <header><i>{c.n}</i><span><b>{c.t}</b><small>{c.d}</small></span></header>
              {ci === 2 ? (
                <div className="fd-engine">
                  {ENGINE.map(([t, d, Icon], k) => <div key={t} className={`eng e${k}`}><Tone tone="blue"><Icon size={20} /></Tone><span><b>{t}</b><small>{d}</small></span></div>)}
                  <div className="fd-orb" aria-hidden><span><Sparkles size={26} /></span><b>AI &amp; ML</b><small>CORE</small></div>
                </div>
              ) : (
                <ul>{c.items.map(([t, d, Icon, tone, more], k) => {
                  const key = `${ci}-${k}`;
                  return <li key={t}><button type="button" className={on === key ? 'on' : ''} onClick={() => setOn(key)} aria-pressed={on === key}><Tone tone={tone}><Icon size={26} /></Tone><span><b>{t}</b><small>{d}</small>{on === key && <u>{more}</u>}</span><ChevronRight size={16} /></button></li>;
                })}</ul>
              )}
            </article>
          </Reveal>
        ))}
      </div>
      <div className="fd-foot">{[['Cloud-native and modular', CloudCheck], ['Connect source by source', Boxes], ['Built for enterprise scale', ShieldCheck]].map(([t, Icon]) => <span key={t}><Icon size={22} />{t}</span>)}</div>
    </section>
  );
}

/* ─────────────────────────── Platform overview grid ─────────────────────────── */
const TILES = [
  { id: 'ask', t: 'Ask Your Business', s: 'AI Intelligence', d: 'Turn everyday questions into instant, accurate answers from your FMCG data.', to: 'ask', Icon: Sparkles, tone: 'blue', bullets: ['Which SKUs are growing fastest in Maharashtra?', 'Top 5 growing SKUs in the last 3 months'] },
  { id: 'vis', t: 'Sales Visibility', d: 'Drill down from India to state, city, distributor and store with a complete view of sales performance.', to: 'visibility', Icon: BarChart3, tone: 'blue', bullets: ['India › State › City › Distributor › Store', 'Maharashtra ₹ 248 Cr ▲ 14.2%'] },
  { id: 'bt', t: 'Batch Traceability', s: 'Recall the batch. Not the brand.', d: 'Trace any batch across the entire supply chain in seconds and take targeted action.', to: 'traceability', Icon: Boxes, tone: 'green', bullets: ['Detect → Trace → Isolate → Notify → Confirm', 'Batch B-2291 · MFG 12 Jan 2026'] },
  { id: 'bi', t: 'Business Insights', d: 'Get a complete view of performance — SKUs, channels, markets and campaigns — in one place.', to: 'insights', Icon: Layers, tone: 'purple', bullets: ['Total Sales ₹ 892 Cr ▲ 12%', 'Campaign ROI 3.6x ▲ 22%'] },
  { id: 'dc', t: 'Demand & Capacity Planning', d: 'Use AI/ML forecasting to predict demand by region and align production and capacity with confidence.', to: 'forecast', Icon: TrendingUp, tone: 'orange', bullets: ['Aug 2026 · 142K units ▲ 24%', 'Capacity utilisation 68% → 85% recommended'] },
  { id: 'hp', t: 'How the Platform Works', d: 'From enterprise data to actionable insights in a unified, AI-powered platform.', to: 'foundation', Icon: Settings2, tone: 'blue', bullets: ['Enterprise Data › Unified Data Layer', 'AI/ML Engine › Experience Layer'] }
];
const ENT = [['Role-based Experience', UsersRound], ['SSO Integration', KeyRound], ['Enterprise Security', ShieldCheck], ['Audit Logs', BookOpenCheck], ['Data Encryption', Lock], ['Scalability & Reliability', UploadCloud]];

export function Overview() {
  return (
    <section id="overview" className="sx sx-ov">
      <Reveal><SectionHead eyebrow="THE PLATFORM AT A GLANCE" sub="Six connected capabilities, one enterprise-ready foundation. Select any card to jump to the details.">Everything your business needs, <span>in one place.</span></SectionHead></Reveal>
      <div className="ov-grid">
        {TILES.map(({ id, t, s, d, to, Icon, tone, bullets }, i) => (
          <Reveal key={id} delay={i * 60}>
            <a href={`#${to}`} onClick={go(to)} className={`ov-tile tone-${tone}`}>
              <Tone tone={tone}><Icon size={28} /></Tone>
              <b>{t}</b>{s && <em>{s}</em>}<p>{d}</p>
              <ul>{bullets.map(x => <li key={x}>{x}</li>)}</ul>
              <span className="go">Explore <ArrowRight size={15} /></span>
            </a>
          </Reveal>
        ))}
      </div>
      <Reveal className="ov-ent">
        <div className="ent-head"><Tone tone="purple"><ShieldCheck size={26} /></Tone><span><b>Enterprise Ready</b><small>Built for large FMCG businesses with security, scalability and governance.</small></span></div>
        <ul>{ENT.map(([t, Icon]) => <li key={t}><Icon size={22} />{t}</li>)}</ul>
      </Reveal>
    </section>
  );
}

/* ─────────────────────────── Implementation + impact ─────────────────────────── */
const PHASES = [
  { n: 1, t: 'Connect', d: 'Bring your enterprise data into the platform.', tone: 'blue' },
  { n: 2, t: 'Configure', d: 'Set up business rules, hierarchies, KPIs and access for your teams.', tone: 'green' },
  { n: 3, t: 'Pilot', d: 'Start with a focused region or business unit, validate and refine.', tone: 'purple' },
  { n: 4, t: 'Scale', d: 'Roll out across geographies, products and channels.', tone: 'orange' }
];
const OUT = [
  { t: 'Higher Sales Growth', d: 'Better visibility and data-driven actions drive stronger sales across markets and channels.', to: 30, from: 15, pre: '', suf: '%', lead: '15–', note: 'Typical improvement', tone: 'blue', Icon: BarChart3 },
  { t: 'Lower Risk & Faster Response', d: 'Detect and trace issues quickly to reduce disruption and protect your brand.', to: 50, suf: '%', note: 'Faster issue resolution', tone: 'green', Icon: Boxes },
  { t: 'Smarter Decision Making', d: 'Unified insights help you allocate resources, optimize campaigns and grow profitably.', to: 20, suf: '%', note: 'Improvement in ROI', tone: 'purple', Icon: Lightbulb },
  { t: 'Optimized Operations', d: 'Align demand with production and capacity to reduce stockouts and improve efficiency.', to: 25, suf: '%', note: 'Better capacity utilization', tone: 'orange', Icon: Cog }
];

function PhasePanel({ p }) {
  if (p === 1) return <div className="ph ph1">{[['ERP', Database], ['Plant Systems', Factory], ['Distributors', Truck], ['Retail & Market Data', Store]].map(([n, Icon]) => <span key={n}><Icon size={18} />{n}</span>)}<i className="hub"><Network size={30} /></i></div>;
  if (p === 2) return (
    <div className="ph ph2"><ul>{[['Hierarchy Setup', Workflow], ['KPIs & Metrics', ChartColumn], ['User Access', Users], ['Alerts & Workflows', Bell], ['Integrations', Link2]].map(([n, Icon], k) => <li key={n} className={k === 0 ? 'on' : ''}><Icon size={16} />{n}</li>)}</ul>
      <div className="tree"><b>Territory Hierarchy</b>{['India', 'Maharashtra', 'Mumbai', 'Distributor', 'Store'].map((n, k) => <span key={n} style={{ paddingLeft: k * 14 }}><i style={{ background: ['#1D4ED8', '#3B82F6', '#2563EB', '#60A5FA', '#34D399'][k] }} />{n}</span>)}</div></div>
  );
  if (p === 3) return (
    <div className="ph ph3"><IndiaSvg className="ph-map" fill={id => (id === 'maharashtra' ? '#1D4ED8' : '#CFE0FF')} markers={[{ lon: 75.3, lat: 19.4, r: 4, color: '#EF4444', pulse: true }]} label="Pilot region" />
      <div className="pilot"><MapPin size={18} /><b>Pilot Region</b><small>Maharashtra</small><span className="tag ok">In Progress</span><ul>{['Data connected', 'Users onboarded', 'Insights validated', 'Ready to scale'].map(x => <li key={x}><ShieldCheck size={14} />{x}</li>)}</ul></div></div>
  );
  return (
    <div className="ph ph4"><IndiaSvg className="ph-map" fill={() => '#8DB3FF'} markers={[[77.2, 28.6], [72.8, 19.0], [88.3, 22.5], [80.3, 13.0], [77.6, 12.9], [78.5, 17.4], [73.8, 18.5], [75.8, 26.9], [80.9, 26.8], [72.5, 23.0]].map(([lon, lat]) => ({ lon, lat, r: 3.4, color: '#1D4ED8', pulse: true }))} label="Nationwide rollout" />
      <ul className="scale">{[['28', 'States', MapPin], ['400+', 'Distributors', Network], ['50,000+', 'Retailers', Store], ['Full', 'Nationwide Rollout', Layers]].map(([v, l, Icon]) => <li key={l}><Icon size={18} /><b>{v}</b><small>{l}</small></li>)}</ul></div>
  );
}

export function Implementation() {
  const [p, setP] = useState(1);
  return (
    <section id="implementation" className="sx sx-im">
      <Reveal><SectionHead eyebrow="FROM SETUP TO REAL RESULTS" sub="A structured rollout to get you from data to measurable business outcomes.">Implementation + <span>Business Impact</span></SectionHead></Reveal>
      <ol className="im-steps">
        {PHASES.map(x => (
          <li key={x.t} className={p === x.n ? 'on' : p > x.n ? 'done' : ''}>
            <button type="button" onClick={() => setP(x.n)} aria-pressed={p === x.n}><i className={`tone-${x.tone}`}>{x.n}</i><span><b>{x.t}</b><small>{x.d}</small></span></button>
          </li>
        ))}
      </ol>
      <div className="im-panel"><PhasePanel p={p} /></div>
      <div className="im-out">
        <div className="out-intro"><p className="sx-eyebrow wide left">MEASURABLE OUTCOMES</p><h3>Real impact<br />across <span>your business.</span></h3><p>Turn connected data into stronger operations, smarter decisions and sustainable growth.</p></div>
        {OUT.map(({ t, d, to, lead, suf, note, tone, Icon }, i) => (
          <Reveal key={t} delay={i * 70} className={`out tone-${tone}`}>
            <article><Tone tone={tone}><Icon size={24} /></Tone><b>{t}</b><p>{d}</p>
              <strong><i><TrendingUp size={16} /></i>{lead}<Counter to={to} render={v => Math.round(v)} />{suf}</strong><small>{note}</small></article>
          </Reveal>
        ))}
      </div>
      <div className="im-cta"><Link href="/login" className="lp-btn lp-btn-hero">Explore the platform <ArrowRight size={18} /></Link></div>
    </section>
  );
}

