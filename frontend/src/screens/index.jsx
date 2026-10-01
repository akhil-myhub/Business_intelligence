import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ArrowRight, Asterisk, BarChart3, Briefcase, Cpu, Eye, EyeOff, FileSpreadsheet, FileText, Flame, IndianRupee,
  Lightbulb, LockKeyhole, Mail, Megaphone, Package, PencilRuler, PieChart, Presentation, ShieldCheck, ShoppingBag,
  Store, Sun, TrendingUp, Columns3, Sparkles
} from 'lucide-react';
import {
  Panel, Select, Kpi, Tabs, AreaChart, BarChart, Donut, Legend, MultiLine, Bottle, Logo, fmt
} from '../components/ui';
import {
  months, cities, stores, channels, productChannels, marketChannels, marketBars, channelTrend, campaigns,
  suggestions, reportTypes, pipeline, trend, productTrend
} from '../data/mock';

// 3D scenes are code-split and client-only; the spinner shows while the chunk loads so nothing looks stuck.
const Loading = () => <div className="scene-loading"><i /></div>;
const Orb = dynamic(() => import('../three/Orb'), { ssr: false, loading: Loading });
const IndiaMap = dynamic(() => import('../three/IndiaMap'), { ssr: false, loading: Loading });
const TamilNadu = dynamic(() => import('../three/TamilNadu'), { ssr: false, loading: Loading });

const names = channels.map(c => c.name);
const items = (arr) => arr.map((v, i) => ({ name: names[i], value: v }));

/* 1 ─ Login */
export function Login({ onSignIn }) {
  const [show, setShow] = useState(false);
  return (
    <div className="login">
      <form className="login-card" onSubmit={e => { e.preventDefault(); onSignIn(); }}>
        <Logo big />
        <h1>Welcome Back</h1>
        <p className="sub">Sign in to continue to your workspace</p>
        <label className="field"><Mail size={20} /><span><b>Email address</b><input type="email" placeholder="you@company.com" /></span></label>
        <label className="field"><LockKeyhole size={20} /><span><b>Password</b><input type={show ? 'text' : 'password'} placeholder="Enter your password" /></span>
          <button type="button" onClick={() => setShow(s => !s)} aria-label="toggle password">{show ? <EyeOff size={19} /> : <Eye size={19} />}</button></label>
        <div className="row-between"><label className="check"><input type="checkbox" defaultChecked /> Remember me</label><a href="#">Forgot password?</a></div>
        <button className="btn primary wide lg" type="submit">Sign In</button>
        <div className="or"><span>Or continue with</span></div>
        <div className="providers">
          <button type="button" aria-label="Google"><svg viewBox="0 0 24 24" width="24"><path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.4-.2-2H12v3.9h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-7.9z" /><path fill="#34A853" d="M12 23c3 0 5.4-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.8 0-5.2-1.9-6-4.5H2.4v2.800A11 11 0 0 0 12 23z" /><path fill="#FBBC05" d="M6 14.100a6.600 6.600 0 0 1 0-4.200V7.100H2.400a11 11 0 0 0 0 9.800z" /><path fill="#EA4335" d="M12 5.400c1.600 0 3 .6 4.100 1.600l3.100-3.100A11 11 0 0 0 2.400 7.100L6 9.900c.8-2.600 3.200-4.500 6-4.500z" /></svg></button>
          <button type="button" aria-label="Microsoft" className="ms"><i /><i /><i /><i /></button>
          <button type="button" aria-label="SSO"><span className="sso" /></button>
        </div>
        <p className="small">Don&apos;t have an account? <a href="#">Sign up</a></p>
      </form>
      <div className="login-orb"><Orb /></div>
    </div>
  );
}

/* 2 + 3 ─ Home / chat first, and the AI processing flow */
const STEP_ICONS = [Sun, ShoppingBag, Cpu, Briefcase];

export function Ask({ query, setQuery, onSubmit, phase, progress }) {
  const processing = phase === 'processing';
  return (
    <div className={'ask ' + (processing ? 'processing' : '')}>
      {!processing && (
        <div className="hero-copy">
          <h1>Turn Your Data Into<br /><span><em>Smarter</em> <em>Decisions</em></span></h1>
          <p>Ask anything about your business. Get real-time insights.</p>
        </div>
      )}
      <form className="chatbar" onSubmit={onSubmit}>
        <span className="ai-ico"><Sparkles size={20} /></span>
        <input value={query} onChange={e => setQuery(e.target.value)} disabled={processing} placeholder="Ask a question about your data..." autoFocus />
        <button type="submit" aria-label="Send" disabled={processing || !query.trim()}><ArrowRight size={22} /></button>
      </form>
      {!processing && <div className="chips">{suggestions.map(s => <button key={s} onClick={() => setQuery(s)}>{s}</button>)}</div>}
      {processing && (
        <ol className="flow">
          {pipeline.map((p, i) => {
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

/* 4 ─ Instant overview */
export function Overview({ live, data, onOpen }) {
  const { kpis, growth } = live;
  return (
    <div className="page">
      <Panel title="Sales Performance Overview" className="pad-lg ov" action={<div className="filters"><Select value={data.region} options={['South India', 'North India', 'West India', 'East India']} /><Select value="Last Quarter" options={['Last Quarter', 'Last 6 Months', 'Last Year']} /></div>}>
        <div className="kpi-row">
          <Kpi icon={<Asterisk size={26} />} tint="#2f8bff" label="Total Revenue" value={fmt(kpis.revenue)} unit="₹" cr growth={growth.revenue} />
          <Kpi icon={<Columns3 size={26} />} tint="#a24bff" label="Units Sold" value={fmt(kpis.units, 1)} unit=" M" growth={growth.units} />
          <Kpi icon={<PieChart size={26} />} tint="#8a3dff" label="Market Share" value={fmt(kpis.share, 1)} unit="%" growth={growth.share} />
          <Kpi icon={<ShieldCheck size={26} />} tint="#12b886" label="Conversion Rate" value={fmt(kpis.conversion, 1)} unit="%" growth={growth.conversion} />
        </div>
      </Panel>
      <Panel className="insight pad-lg">
        <span className="bulb"><Lightbulb size={34} /></span>
        <div><h3>Key Insight</h3><p>{data.insight}</p></div>
      </Panel>
      <div className="row-end"><button className="btn primary" onClick={onOpen}>Open full dashboard <ArrowRight size={16} /></button></div>
    </div>
  );
}

/* 5 ─ Full dashboard */
const BAR_COLORS = [['#29c0ff', '#3b6bff'], ['#b07bff', '#6a4bff'], ['#ff6c86', '#ff3b5c'], ['#ffc16a', '#ff8a3c'], ['#8a93ff', '#5560f0']];

export function Dashboard({ live, onDrill }) {
  const [metric, setMetric] = useState('Revenue');
  return (
    <div className="grid-dash">
      <Panel title="Sales by State" className="map-panel dark">
        <IndiaMap states={live.states} onSelect={onDrill} className="map-canvas" />
        <div className="heat"><small>High</small><i /><small>Low</small></div>
      </Panel>
      <div className="col">
        <Panel title="Sales Trend" action={<div className="filters"><Select value={metric} options={['Revenue', 'Units']} onChange={setMetric} /><Select value="Last 6 Months" options={['Last 6 Months', 'Last Quarter']} /></div>}>
          <AreaChart data={trend} labels={months} ticks={[0, 200, 420, 600]} at={8} />
        </Panel>
        <Panel title="State-wise Performance" action={<Select value="Revenue" options={['Revenue']} />}>
          <BarChart ticks={[0, 210, 420]} items={live.states.map((s, i) => ({ name: s.name, value: s.bar, c: BAR_COLORS[i] }))} />
        </Panel>
      </div>
    </div>
  );
}

/* 6 ─ Drill-down: state */
const CITY_BOTTLES = [['#2f6bff', false], ['#ff8a3c', true], ['#ff7a2f', true], ['#b3122c', false], ['#17a673', false]];

export function Drill({ live }) {
  const tn = live.states[0];
  return (
    <div className="page">
      <div className="grid-2 top">
        <Panel title="Tamil Nadu Overview" className="tn-panel">
          <div className="tn-body">
            <TamilNadu className="tn-canvas" />
            <ul className="tn-stats">
              <li><i style={{ background: '#2f8bff' }} /><b>₹ {fmt(tn.revenue)} Cr</b><small>Revenue</small><em>↑ {tn.growth}%</em></li>
              <li><i style={{ background: '#8a5cff' }} /><b>4.2 M</b><small>Units Sold</small><em>↑ 18.5%</em></li>
              <li><i style={{ background: '#2f8bff' }} /><b>12.8%</b><small>Market Share</small><em>↑ 2.4%</em></li>
            </ul>
          </div>
        </Panel>
        <Panel title="Top Cities by Revenue" action={<Select value="Top 5" options={['Top 5', 'Top 10']} />}>
          <ol className="rank">
            {cities.map(([n, w, g], i) => (
              <li key={n}><em>{i + 1}</em><span className="thumb"><Bottle amber={CITY_BOTTLES[i][1]} color={CITY_BOTTLES[i][0]} h={34} /></span><b>{n}</b>
                <span className="bar"><i style={{ width: w + '%' }} /></span><span className="up">↑ {g}%</span></li>
            ))}
          </ol>
        </Panel>
      </div>
      <div className="grid-2 bottom">
        <Panel title={<>Store Performance <small>(Tamil Nadu)</small></>}>
          <table className="table"><thead><tr><th>#</th><th>Store Type</th><th>Revenue</th><th>Units Sold</th><th>Growth</th></tr></thead>
            <tbody>{stores.map(([n, r, u, g], i) => <tr key={n}><td>{i + 1}</td><td>{n}</td><td>{r}</td><td>{u}</td><td className="up">↑ {g}%</td></tr>)}</tbody></table>
        </Panel>
        <Panel title="Channel Distribution">
          <Donut items={items(channels.map(c => c.share))} total="420 Cr" />
        </Panel>
      </div>
    </div>
  );
}

/* 7 ─ Product detail */
export function Product({ live }) {
  const [tab, setTab] = useState('Overview');
  return (
    <div className="page">
      <div className="row-between crumbs"><span>Products <i>›</i> <b>Product A</b></span><Select value="Last 6 Months" options={['Last 6 Months', 'Last Quarter']} /></div>
      <div className="product-head">
        <Panel className="ph-name"><span className="pimg"><Bottle h={96} /></span><h2>Product A</h2></Panel>
        <Panel className="ph-stat"><b>₹ 420 Cr</b><small>Total Revenue</small><em>↑ 18.2%</em></Panel>
        <Panel className="ph-stat"><b>4.2 M</b><small>Units Sold</small><em>↑ 15.6%</em></Panel>
        <Panel className="ph-stat"><b>{fmt(live.kpis.share, 1)}%</b><small>Market Share</small><em>↑ 2.4%</em></Panel>
      </div>
      <Tabs tabs={['Overview', 'Sales Trend', 'Market Share', 'Store Performance', 'Campaign Impact']} value={tab} onChange={setTab} />
      <div className="grid-2">
        <Panel title="Sales Trend"><AreaChart data={productTrend} labels={months} ticks={[0, 50, 100, 150, 200]} at={10} /></Panel>
        <Panel title="Channel Contribution"><Donut items={items(productChannels)} total="420 Cr" /></Panel>
      </div>
    </div>
  );
}

/* 8 ─ Market analysis */
const MARKET_COLORS = [['#29c0ff', '#3b6bff'], ['#3fe0d0', '#14b8a6'], ['#a98aff', '#7a4dff'], ['#ffb066', '#ff8a3c']];

export function Market() {
  const [tab, setTab] = useState('Market Analysis');
  return (
    <div className="page">
      <div className="filters end"><Select value="All Regions" options={['All Regions', 'South India']} /><Select value="Last Quarter" options={['Last Quarter', 'Last 6 Months']} /></div>
      <Tabs tabs={['Market Analysis', 'Channel Share', 'Regional Trends', 'Product Mix', 'Competitive View']} value={tab} onChange={setTab} />
      <div className="grid-2">
        <Panel title="Channel-wise Revenue"><BarChart ticks={[0, 200, 400]} items={marketBars.map(([name, value], i) => ({ name, value, c: MARKET_COLORS[i] }))} /></Panel>
        <Panel title="Channel Contribution"><Donut items={items(marketChannels)} total="1,260 Cr" /></Panel>
      </div>
      <Panel className="growth">
        <div className="panel-head inline"><h3>Channel Growth Trend</h3><Legend names={names} /></div>
        <MultiLine series={channelTrend} labels={months} />
      </Panel>
    </div>
  );
}

/* 9 ─ Campaign impact */
export function Campaign() {
  return (
    <div className="page">
      <div className="filters end"><Select value="Last 3 Months" options={['Last 3 Months', 'Last 6 Months']} /></div>
      <div className="kpi-row two">
        <Panel className="kpi-big g"><span className="big-ico"><TrendingUp size={46} strokeWidth={3} /></span><div><strong>12.4 M</strong><small>Incremental Sales</small><em>↑ 24%</em></div></Panel>
        <Panel className="kpi-big r"><span className="big-ico"><Flame size={46} fill="currentColor" /></span><div><strong>3.6%</strong><small>Incremental Reach</small><em>↑ 32%</em></div></Panel>
      </div>
      <Panel title="Campaign Performance">
        <table className="table"><thead><tr><th>#</th><th>Campaign Name</th><th>Channel</th><th>Revenue</th><th>Uplift</th><th>Reach</th><th>ROI</th></tr></thead>
          <tbody>{campaigns.map(([n, c, r, u, re, roi], i) => <tr key={n}><td>{i + 1}</td><td>{n}</td><td>{c}</td><td>{r}</td><td className="up">{u}%</td><td>{re}</td><td className="up">{roi}</td></tr>)}</tbody></table>
      </Panel>
    </div>
  );
}

/* 10 ─ Reports & export */
const TYPE_ICONS = [BarChart3, Package, PieChart, Store, Megaphone, PencilRuler];

function download(name, text, mime) {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  Object.assign(document.createElement('a'), { href: url, download: name }).click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

export function Reports({ live }) {
  const [tab, setTab] = useState('Create Report');
  const [type, setType] = useState('Sales Performance');
  const [s, setS] = useState({ region: 'All Regions', period: 'Last Quarter', level: 'State / City', format: 'PDF' });
  const [msg, setMsg] = useState('');
  const set = k => v => setS(p => ({ ...p, [k]: v }));

  const generate = () => {
    if (s.format === 'PDF') { setMsg('Opening print dialog — choose "Save as PDF"'); setTimeout(() => window.print(), 300); return; }
    if (s.format === 'PPT') { setMsg('PowerPoint export needs a server-side generator — not wired yet. Excel and PDF work.'); return; }
    const rows = [['State', 'Revenue (Cr)', 'Growth %'], ...live.states.map(x => [x.name, Math.round(x.revenue), x.growth])];
    download(`${type.replace(/\s+/g, '_')}.csv`, [`# ${type} | ${s.region} | ${s.period} | ${s.level}`, ...rows.map(r => r.join(','))].join('\n'), 'text/csv');
    setMsg(`${type} report downloaded`);
  };

  return (
    <div className="page">
      <Tabs tabs={['Create Report', 'Scheduled Reports', 'Shared Reports']} value={tab} onChange={setTab} />
      {tab === 'Create Report' ? (
        <>
          <div className="grid-2 reports">
            <Panel title="Report Type">
              <ul className="types">{reportTypes.map((t, i) => { const I = TYPE_ICONS[i]; return <li key={t}><button className={type === t ? 'on' : ''} onClick={() => setType(t)}><span className="ti"><I size={18} /></span>{t}</button></li>; })}</ul>
            </Panel>
            <div className="col">
              <Panel title="Report Settings">
                <div className="form">
                  <label><span>Region</span><Select value={s.region} onChange={set('region')} options={['All Regions', 'South India', 'North India']} /></label>
                  <label><span>Time Period</span><Select value={s.period} onChange={set('period')} options={['Last Quarter', 'Last 6 Months', 'Last Year']} /></label>
                  <label><span>Data Level</span><Select value={s.level} onChange={set('level')} options={['State / City', 'Store', 'Product']} /></label>
                  <label><span>Format</span><Select value={s.format} onChange={set('format')} options={['PDF', 'Excel', 'PPT']} /></label>
                  <button className="btn primary wide lg gen" onClick={generate}>Generate Report</button>
                  {msg && <p className="msg">{msg}</p>}
                </div>
              </Panel>
              <div className="exports">
                <button onClick={() => set('format')('PDF')} className={s.format === 'PDF' ? 'on' : ''}><FileText size={22} color="#ff3b4e" />PDF</button>
                <button onClick={() => set('format')('Excel')} className={s.format === 'Excel' ? 'on' : ''}><FileSpreadsheet size={22} color="#1f9d5c" />Excel</button>
                <button onClick={() => set('format')('PPT')} className={s.format === 'PPT' ? 'on' : ''}><Presentation size={22} color="#2f6bff" />PPT</button>
              </div>
            </div>
          </div>
        </>
      ) : <Panel><p className="empty">No {tab.toLowerCase()} yet.</p></Panel>}
    </div>
  );
}
