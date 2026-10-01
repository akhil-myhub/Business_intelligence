'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, Asterisk, Columns3, Lightbulb, PieChart, ShieldCheck, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useFilters } from '@/hooks/useFilters';
import { Data } from '@/components/DataState';
import { FilterSelects, money, num1 } from '@/components/Filters';
import { Kpi, Panel } from '@/components/ui';

const TONE_ICON = { up: TrendingUp, down: TrendingDown, flat: Minus };

export default function OverviewScreen() {
  const { filters, set, qs } = useFilters();
  const q = useSearchParams().get('q') ?? '';
  const api = useApi(`/api/data/overview?${qs}${q ? `&q=${encodeURIComponent(q)}` : ''}`, { live: true });

  return (
    <div className="page">
      <Data api={api}>
        {d => (
          <>
            <Panel title="Sales Performance Overview" className="pad-lg ov" action={<FilterSelects filters={filters} set={set} only={['region', 'period', 'product']} />}>
              <p className="range-note">{d.range} · data as of {d.asOf}</p>
              <div className="kpi-row">
                <Kpi icon={<Asterisk size={26} />} tint="#2f8bff" label="Total Revenue" value={money(d.kpis.revenue.value)} growth={d.kpis.revenue.growth} />
                <Kpi icon={<Columns3 size={26} />} tint="#a24bff" label="Units Sold" value={`${num1(d.kpis.units.value)} M`} growth={d.kpis.units.growth} />
                <Kpi icon={<PieChart size={26} />} tint="#8a3dff" label="Market Share" value={`${num1(d.kpis.share.value)}%`} growth={d.kpis.share.growth} />
                <Kpi icon={<ShieldCheck size={26} />} tint="#12b886" label="Conversion Rate" value={`${num1(d.kpis.conversion.value)}%`} growth={d.kpis.conversion.growth} />
              </div>
            </Panel>
            <Panel className="insight pad-lg">
              <span className="bulb"><Lightbulb size={34} /></span>
              <div>
                {d.question && <small className="asked">You asked: “{d.question}”</small>}
                <h3>{d.insight.headline}</h3>
                <p>{d.insight.text}</p>
                <ul className="drivers">
                  {d.insight.drivers.map(x => {
                    const I = TONE_ICON[x.tone] ?? Minus;
                    return <li key={x.label} className={x.tone}><I size={14} /><b>{x.label}</b><span>{x.detail}</span></li>;
                  })}
                </ul>
              </div>
            </Panel>
            <div className="row-end actions">
              <Link className="btn ghost" href={`/market?${qs}`}>Market analysis</Link>
              <Link className="btn primary" href={`/dashboard?${qs}`}>Open full dashboard <ArrowRight size={16} /></Link>
            </div>
          </>
        )}
      </Data>
    </div>
  );
}
