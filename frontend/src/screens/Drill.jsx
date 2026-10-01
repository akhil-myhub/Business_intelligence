'use client';

import React from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { BrandLoader } from '@/components/BrandLoader';
import { useRouter } from 'next/navigation';
import { ChevronRight, X } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useFilters } from '@/hooks/useFilters';
import { useLive } from '@/providers/LiveProvider';
import { Data, Skeleton } from '@/components/DataState';
import { FilterSelects, money, num1 } from '@/components/Filters';
import { HeaderPortal } from '@/components/HeaderPortal';
import { DataTable } from '@/components/Table';
import { Donut } from '@/components/charts';
import { Bottle, Growth, Panel, Select } from '@/components/ui';
import { STATE_OPTIONS } from '@/lib/catalog';

const StateBlock = dynamic(() => import('@/three/StateBlock'), { ssr: false, loading: () => <BrandLoader overlay label="Loading state view" tone="dark" /> });
const BOTTLES = [['#2f6bff', false], ['#ff8a3c', true], ['#ff7a2f', true], ['#b3122c', false], ['#17a673', false]];

export default function DrillScreen({ slug }) {
  const router = useRouter();
  const { filters, set, qs } = useFilters();
  const { pulses } = useLive();
  const api = useApi(`/api/data/drill?state=${slug}&${qs}`, { live: true });
  const current = STATE_OPTIONS.find(s => s.slug === slug);

  return (
    <>
      <HeaderPortal slot="crumb-slot">
        <span className="crumb">
          <Link href={`/dashboard?${qs}`} aria-label="Back to dashboard"><X size={14} /></Link>
          {api.data?.state.region ?? 'India'} <ChevronRight size={14} /> {current.name}
        </span>
      </HeaderPortal>
      <HeaderPortal>
        <Select label="State" value={current.name} options={STATE_OPTIONS.map(s => s.name)} onChange={name => router.push(`/stores/${STATE_OPTIONS.find(s => s.name === name).slug}?${qs}`)} />
        <FilterSelects filters={filters} set={set} only={['period', 'product']} />
      </HeaderPortal>

      <Data api={api} skeleton={<div className="page"><div className="grid-2"><Skeleton h={360} /><Skeleton h={360} /></div><div className="grid-2"><Skeleton h={340} /><Skeleton h={340} /></div></div>}>
        {d => (
          <div className="page">
            <div className="grid-2 top">
              <Panel title={`${d.state.name} Overview`} className="tn-panel" action={<span className="range-note">Rank {d.state.rank} of {d.state.of} · {d.range}</span>}>
                <div className="tn-body">
                  <StateBlock slug={d.state.slug} name={d.state.name} pulses={pulses} className="tn-canvas" />
                  <ul className="tn-stats">
                    <li><i style={{ background: '#2f8bff' }} /><b>{money(d.kpis.revenue.value)}</b><small>Revenue</small><Growth value={d.kpis.revenue.growth} className="sm" /></li>
                    <li><i style={{ background: '#8a5cff' }} /><b>{num1(d.kpis.units.value)} M</b><small>Units Sold</small><Growth value={d.kpis.units.growth} className="sm" /></li>
                    <li><i style={{ background: '#2f8bff' }} /><b>{num1(d.kpis.share.value)}%</b><small>Market Share</small><Growth value={d.kpis.share.growth} className="sm" /></li>
                  </ul>
                </div>
              </Panel>
              <Panel title="Top Cities by Revenue" action={<span className="range-note">{d.cities.length} cities</span>}>
                <ol className="rank">
                  {d.cities.map((c, i) => (
                    <li key={c.name}>
                      <em>{i + 1}</em>
                      <span className="thumb"><Bottle amber={BOTTLES[i % 5][1]} color={BOTTLES[i % 5][0]} h={34} /></span>
                      <b title={c.name}>{c.name}</b>
                      <span className="bar" title={money(c.revenue)}><i style={{ width: `${(c.revenue / d.cities[0].revenue) * 100}%` }} /></span>
                      <span className={c.growth >= 0 ? 'up' : 'down'}>{c.growth >= 0 ? '↑' : '↓'} {Math.abs(c.growth)}%</span>
                    </li>
                  ))}
                </ol>
              </Panel>
            </div>
            <div className="grid-2 bottom">
              <Panel title={<>Store Performance <small>({d.state.name})</small></>}>
                <DataTable rowKey={r => r.type} initialSort={{ key: 'revenue', dir: 'desc' }} columns={[
                  { key: 'type', label: 'Store Type' },
                  { key: 'revenue', label: 'Revenue', render: r => `₹ ${r.revenue.toFixed(1)} Cr` },
                  { key: 'unitsLakh', label: 'Units Sold', render: r => `${r.unitsLakh} L` },
                  { key: 'growth', label: 'Growth', render: r => `${r.growth >= 0 ? '↑' : '↓'} ${Math.abs(r.growth)}%`, tone: r => (r.growth >= 0 ? 'up' : 'down') }
                ]} rows={d.stores} />
              </Panel>
              <Panel title="Channel Distribution"><Donut items={d.channels} total={Math.round(d.total)} /></Panel>
            </div>
          </div>
        )}
      </Data>
    </>
  );
}

