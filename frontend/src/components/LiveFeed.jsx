'use client';

import React from 'react';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import { useLive } from '@/providers/LiveProvider';
import { Panel } from './ui';

const amount = cr => (cr >= 1 ? `₹ ${cr.toFixed(2)} Cr` : `₹ ${(cr * 100).toFixed(1)} L`);
const clock = ts => new Date(ts).toLocaleTimeString('en-IN', { hour12: false });

// Real-time sales stream: totals plus the latest orders as they land (pushed by the server).
export function LiveFeed({ limit = 7 }) {
  const { sales, todayCr, ordersPerMin, status } = useLive();
  return (
    <Panel title={<span className="title-ico"><Activity size={18} /> Live Sales</span>} className="live-feed"
      action={<span className={'live-pill ' + (status === 'live' ? '' : 'paused')}><i />{status === 'live' ? 'Streaming' : 'Not connected'}</span>}>
      <div className="live-stats">
        <div><small>Today so far</small><b>₹ {todayCr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Cr</b></div>
        <div><small>Orders / min</small><b>{ordersPerMin}</b></div>
      </div>
      {sales.length === 0
        ? <p className="empty">{status === 'live' ? 'Waiting for the next order…' : 'The live feed is off or reconnecting.'}</p>
        : (
          <ul className="sales-list" aria-live="off">
            {sales.slice(0, limit).map(s => (
              <li key={s.id}>
                <time>{clock(s.ts)}</time>
                <Link href={`/stores/${s.slug}`}>{s.state}</Link>
                <span>{s.product} · {s.channel}</span>
                <b>{amount(s.amountCr)}</b>
              </li>
            ))}
          </ul>
        )}
    </Panel>
  );
}
