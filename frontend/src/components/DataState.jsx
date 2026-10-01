'use client';

import React from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';

export const Skeleton = ({ h = 120, className = '' }) => <div className={'skeleton ' + className} style={{ height: h }} aria-hidden />;

function PageSkeleton({ rows = 2 }) {
  return (
    <div className="page" role="status" aria-label="Loading">
      <div className="kpi-row">{[0, 1, 2, 3].map(i => <Skeleton key={i} h={118} />)}</div>
      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} h={260} />)}
    </div>
  );
}

function ErrorPanel({ error, onRetry }) {
  return (
    <div className="boundary panel" role="alert">
      <TriangleAlert size={34} color="#e8a317" />
      <h2>We couldn&apos;t load this data</h2>
      <p>{error?.status === 429 ? 'You are sending requests too quickly. Wait a moment and try again.' : 'The analytics service did not respond. Your other screens are unaffected.'}</p>
      <button className="btn primary" onClick={onRetry}><RefreshCw size={16} /> Try again</button>
    </div>
  );
}

// Render-prop wrapper: skeleton while loading, error panel on failure, dimmed content while refreshing.
export function Data({ api, skeleton, children }) {
  if (api.status === 'loading') return skeleton ?? <PageSkeleton />;
  if (api.status === 'error' && !api.data) return <ErrorPanel error={api.error} onRetry={api.retry} />;
  return (
    <div className={'page' + (api.stale ? ' is-stale' : '')} aria-busy={api.stale}>
      {api.status === 'error' && <div className="inline-error" role="alert">Couldn&apos;t refresh — showing the last loaded data. <button onClick={api.retry}>Retry</button></div>}
      {children(api.data)}
    </div>
  );
}
