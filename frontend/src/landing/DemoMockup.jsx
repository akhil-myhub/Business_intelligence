import React from 'react';
import { Bell, Box, ChartColumn, FileText, Home, MapPin, MessageSquare, Search, Settings, TrendingUp, Truck, Zap } from 'lucide-react';

/*
 * The "FMCG Intelligence" laptop + phone shown beside the demo form. Built from markup, SVG and CSS (mockup.css) rather
 * than a screenshot, so it stays sharp at any size or pixel density. Everything is sized in em from the container width.
 */

const NAV = [[Home, 'Home'], [MessageSquare, 'Ask AI'], [ChartColumn, 'Sales'], [Truck, 'Traceability'], [TrendingUp, 'Insights'], [FileText, 'Reports'], [Settings, 'Settings']];
const KPIS = [
  ['Total Sales', '₹892 Cr', '12.4%', ChartColumn, 'blue'],
  ['Active SKUs', '1,248', '8.1%', Box, 'green'],
  ['Market Coverage', '28 States', '3 new', MapPin, 'purple'],
  ['Fill Rate', '96%', '4.2%', Zap, 'green']
];
const SKUS = [['Cream Biscuits', '₹248 Cr', '28%'], ['Chocolate Cookies', '₹186 Cr', '24%'], ['Marie Gold', '₹142 Cr', '20%'], ['Fruit Drink', '₹98 Cr', '16%'], ['Instant Noodles', '₹86 Cr', '14%']];
const REGIONS = [['Maharashtra', 248, 100], ['Karnataka', 186, 75], ['Tamil Nadu', 142, 57], ['Gujarat', 96, 39]];
const CHANNELS = [['General Trade', 46, '#2F6BFF'], ['Modern Trade', 28, '#8B5CF6'], ['E-commerce', 16, '#14B8A6'], ['Wholesale', 10, '#F59E0B']];
const LINE = '0,38 14,34 28,27 42,29 56,19 70,14 84,6';
const BARS = [30, 34, 40, 38, 47, 55, 61, 72, 80, 90];

function Donut({ parts }) {
  const C = 81.68; // circumference of r=13
  return (
    <svg viewBox="0 0 36 36" className="dm-donut" aria-hidden>
      {parts.map(([name, v, c], i) => {
        const before = parts.slice(0, i).reduce((sum, p) => sum + p[1], 0);
        return <circle key={name} cx="18" cy="18" r="13" fill="none" stroke={c} strokeWidth="7" strokeDasharray={`${(v / 100) * C - 0.6} ${C}`} strokeDashoffset={-(before / 100) * C} transform="rotate(-90 18 18)" />;
      })}
    </svg>
  );
}

function Brand() {
  return <span className="dm-brand"><i /><b>FMCG Intelligence</b></span>;
}

export default function DemoMockup() {
  return (
    <div className="dm-wrap">
      <div className="dm" role="img" aria-label="The FMCG Intelligence dashboard on a laptop and a phone">
        <div className="dm-laptop">
          <div className="dm-lid">
            <div className="dm-cam" />
            <div className="dm-screen">
              <aside className="dm-side">
                <Brand />
                <ul>
                  {NAV.map(([Icon, label], i) => <li key={label} className={i === 0 ? 'on' : ''}><Icon size="1.25em" strokeWidth={1.8} />{label}</li>)}
                </ul>
              </aside>
              <div className="dm-main">
                <div className="dm-top">
                  <span className="dm-search"><Search size="1.1em" />Ask your business anything…</span>
                  <span className="dm-pill">Last 6 Months</span>
                  <Bell size="1.3em" /><span className="dm-avatar">AS</span>
                </div>
                <div className="dm-kpis">
                  {KPIS.map(([label, value, delta, Icon, tone]) => (
                    <div key={label}>
                      <span><small>{label}</small><b>{value}</b><em>↑ {delta}</em></span>
                      <i className={'dm-ic ' + tone}><Icon size="1.5em" strokeWidth={2} /></i>
                    </div>
                  ))}
                </div>
                <div className="dm-row a">
                  <section>
                    <h6>Sales Performance <small>Total Sales ⌄</small></h6>
                    <svg viewBox="0 0 84 44" preserveAspectRatio="none" className="dm-line" aria-hidden>
                      <defs><linearGradient id="dmfill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2F6BFF" stopOpacity=".28" /><stop offset="1" stopColor="#2F6BFF" stopOpacity="0" /></linearGradient></defs>
                      {[10, 20, 30].map(y => <line key={y} x1="0" x2="84" y1={y} y2={y} stroke="#E8EEF9" strokeWidth=".4" />)}
                      <polygon points={`0,44 ${LINE} 84,44`} fill="url(#dmfill)" />
                      <polyline points={LINE} fill="none" stroke="#2F6BFF" strokeWidth="1.1" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                      <circle cx="56" cy="19" r="1.5" fill="#fff" stroke="#2F6BFF" strokeWidth=".8" />
                    </svg>
                    <div className="dm-tip">₹248 Cr<small>↑ 14.2%</small></div>
                    <p className="dm-axis"><span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span></p>
                  </section>
                  <section>
                    <h6>Top Performing SKUs <small>View All →</small></h6>
                    <ol className="dm-skus">
                      {SKUS.map(([n, v, d], i) => <li key={n}><u>{i + 1}</u><s /><span>{n}</span><b>{v}</b><em>↑ {d}</em></li>)}
                    </ol>
                  </section>
                </div>
                <div className="dm-row b">
                  <section>
                    <h6>Sales by Region</h6>
                    <ul className="dm-reg">
                      {REGIONS.map(([n, v, w]) => <li key={n}><span>{n}</span><i><u style={{ width: w + '%' }} /></i><b>₹{v} Cr</b></li>)}
                    </ul>
                  </section>
                  <section>
                    <h6>Channel Mix</h6>
                    <div className="dm-mix">
                      <Donut parts={CHANNELS} />
                      <ul>{CHANNELS.map(([n, v, c]) => <li key={n}><u style={{ background: c }} />{n}<b>{v}%</b></li>)}</ul>
                    </div>
                  </section>
                  <section>
                    <h6>Demand Forecast</h6>
                    <div className="dm-bars">{BARS.map((h, i) => <i key={i} style={{ height: h + '%' }} className={i < 5 ? '' : 'f'} />)}</div>
                    <p className="dm-axis"><span>Jan</span><span>Mar</span><span>May</span><span>Jun</span></p>
                  </section>
                </div>
              </div>
            </div>
          </div>
          <div className="dm-base"><i /></div>
        </div>

        <div className="dm-phone">
          <div className="dm-pscreen">
            <p className="dm-status"><span>9:41</span><i /></p>
            <Brand />
            <span className="dm-search"><Search size="1.1em" />Ask your business anything…</span>
            <div className="dm-pk">
              {KPIS.slice(0, 2).map(([label, value, , Icon, tone]) => <div key={label}><small>{label}</small><b>{value}</b><i className={'dm-ic ' + tone}><Icon size="1em" /></i></div>)}
            </div>
            <h6>Sales Performance</h6>
            <svg viewBox="0 0 84 44" preserveAspectRatio="none" className="dm-line" aria-hidden>
              <polygon points={`0,44 ${LINE} 84,44`} fill="url(#dmfill)" />
              <polyline points={LINE} fill="none" stroke="#2F6BFF" strokeWidth="1.1" vectorEffect="non-scaling-stroke" />
            </svg>
            <nav className="dm-tabs">{[Home, MessageSquare, ChartColumn, Settings].map((Icon, i) => <Icon key={i} size="1.5em" className={i === 0 ? 'on' : ''} />)}</nav>
          </div>
        </div>
      </div>
    </div>
  );
}
