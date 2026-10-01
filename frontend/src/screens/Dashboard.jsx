'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { BrandLoader } from '@/components/BrandLoader';
import { useRouter } from 'next/navigation';
import { useApi } from '@/hooks/useApi';
import { useFilters } from '@/hooks/useFilters';
import { useLive } from '@/providers/LiveProvider';
import { Data, Skeleton } from '@/components/DataState';
import { FilterSelects } from '@/components/Filters';
import { HeaderPortal } from '@/components/HeaderPortal';
import { LiveFeed } from '@/components/LiveFeed';
import { AreaChart, BAR_COLORS, BarChart } from '@/components/charts';
import { Panel, Select } from '@/components/ui';
import { PRODUCTS } from '@/lib/filters';

const IndiaMap = dynamic(() => import('@/three/IndiaMap'), { ssr: false, loading: () => <BrandLoader overlay label="Loading map" tone="light" /> });
const PAGE_DEFAULTS = { period: 'Last 6 Months' };

// 2D alternative to the 3D map (used when 3D effects are off or WebGL is unavailable): still clickable.
function StateList({ states, onSelect }) {
  const rows = states.filter(s => s.inRegion).sort((a, b) => b.revenue - a.revenue).slice(0, 12);
  const max = rows[0]?.revenue || 1;
  return (
    <ol className="state-list">
      {rows.map(s => (
        <li key={s.slug}><button onClick={() => onSelect(s.slug)}><b>{s.name}</b><span className="bar"><i style={{ width: `${(s.revenue / max) * 100}%` }} /></span><em>₹ {Math.round(s.revenue)} Cr</em></button></li>
      ))}
    </ol>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const { filters, set, qs } = useFilters(PAGE_DEFAULTS);
  const { pulses } = useLive();
  const api = useApi(`/api/data/dashboard?${qs}`, { live: true });
  const [hover, setHover] = useState(null);
  const go = slug => router.push(`/stores/${slug}?${qs}`);

  return (
    <>
      <HeaderPortal><FilterSelects filters={filters} set={set} /></HeaderPortal>
      <Data api={api} skeleton={<div className="grid-dash"><Skeleton h={640} /><div className="col"><Skeleton h={300} /><Skeleton h={300} /></div></div>}>
        {d => {
          const hovered = hover && d.states.find(s => s.slug === hover);
          return (
            <div className="page">
              <div className="grid-dash">
                <Panel title="Sales by State" className="map-panel dark">
                  <IndiaMap states={d.states} top={d.top} pulses={pulses} hover={hover} onSelect={go} onHover={setHover} className="map-canvas"
                    fallback={<StateList states={d.states} onSelect={go} />} />
                  {hovered && (
                    <div className="map-hover" role="status">
                      <b>{hovered.name}</b><span>₹ {Math.round(hovered.revenue)} Cr</span>
                      <em className={hovered.growth >= 0 ? 'up' : 'down'}>{hovered.growth >= 0 ? '↑' : '↓'} {Math.abs(hovered.growth)}%</em>
                    </div>
                  )}
                  <div className="heat"><small>High</small><i /><small>Low</small></div>
                  <p className="hint">Click a state to drill down · drag to rotate · glows pulse as live orders land</p>
                </Panel>
                <div className="col">
                  <Panel title="Sales Trend" action={<div className="filters"><Select label="Metric" value="Revenue" options={['Revenue']} /><Select label="Product" value={filters.product} options={PRODUCTS} onChange={v => set({ product: v })} /></div>}>
                    <AreaChart points={d.trend.points} months={d.trend.months} />
                  </Panel>
                  <Panel title="State-wise Performance" action={<span className="range-note">{d.range}</span>}>
                    <BarChart items={d.top.map((s, i) => ({ name: s.name, value: s.revenue, c: BAR_COLORS[i] }))} onSelect={it => go(d.top.find(s => s.name === it.name).slug)} />
                  </Panel>
                </div>
              </div>
              <LiveFeed />
            </div>
          );
        }}
      </Data>
    </>
  );
}
