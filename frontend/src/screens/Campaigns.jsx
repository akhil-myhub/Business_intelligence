'use client';

import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';
import { useApi } from '@/hooks/useApi';
import { useFilters } from '@/hooks/useFilters';
import { Data } from '@/components/DataState';
import { FilterSelects } from '@/components/Filters';
import { DataTable } from '@/components/Table';
import { Growth, Panel } from '@/components/ui';

export default function CampaignsScreen() {
  const { filters, set, qs } = useFilters();
  const api = useApi(`/api/data/campaigns?${qs}`, { live: true });

  return (
    <div className="page">
      <div className="row-end"><FilterSelects filters={filters} set={set} only={['region', 'period', 'product']} /></div>
      <Data api={api}>
        {d => (
          <>
            <div className="kpi-row two">
              <Panel className="kpi-big g"><span className="big-ico"><TrendingUp size={46} strokeWidth={3} /></span><div><strong>{d.incrementalSales} M</strong><small>Incremental Sales</small><Growth value={d.incrementalSalesGrowth} /></div></Panel>
              <Panel className="kpi-big r"><span className="big-ico"><Flame size={46} fill="currentColor" /></span><div><strong>{d.incrementalReach}%</strong><small>Incremental Reach</small><Growth value={d.incrementalReachGrowth} /></div></Panel>
            </div>
            <Panel title="Campaign Performance" action={<span className="range-note">{d.range}</span>}>
              <DataTable rowKey={r => r.name} initialSort={{ key: 'revenue', dir: 'desc' }} columns={[
                { key: 'name', label: 'Campaign Name' }, { key: 'channel', label: 'Channel' },
                { key: 'revenue', label: 'Revenue', render: r => `₹ ${r.revenue} Cr` },
                { key: 'uplift', label: 'Uplift', render: r => `${r.uplift}%`, tone: () => 'up' },
                { key: 'reach', label: 'Reach', render: r => `${r.reach} M` },
                { key: 'roi', label: 'ROI', render: r => `${r.roi}x`, tone: () => 'up' }
              ]} rows={d.rows} />
            </Panel>
          </>
        )}
      </Data>
    </div>
  );
}
