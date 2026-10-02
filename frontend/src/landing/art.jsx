'use client';

import React from 'react';
import { MARK, HUB, NODES, NODE_R, PETAL_OUTLINES, SPOKE, petalPath } from '@/lib/aavtorMark';

/* ── trust icons + brand ───────────────────────────────────────────── */
export const TrustIcon = ({ i }) => (
  <svg viewBox="0 0 24 24" width="40" height="40" fill="#0965FF" aria-hidden>
    {[
      <g key={0}><circle cx="12" cy="7" r="3.3" /><circle cx="5.2" cy="9" r="2.5" /><circle cx="18.8" cy="9" r="2.5" /><path d="M12 12c-3.4 0-6 1.8-6 4.2V19h12v-2.8c0-2.4-2.6-4.2-6-4.2z" /><path d="M5.2 12.4C3.2 12.4 1.6 13.6 1.6 15.2V17.6H5v-1.4c0-1.3.5-2.5 1.5-3.4-.4-.3-.9-.4-1.3-.4zM18.8 12.4c2 0 3.6 1.2 3.6 2.8v2.4H19v-1.4c0-1.3-.5-2.5-1.5-3.4.4-.3.9-.4 1.3-.4z" /></g>,
      <g key={1}><path d="M12 2 4 5.2v5.6c0 4.7 3.2 8.9 8 10.2 4.8-1.3 8-5.5 8-10.2V5.2L12 2z" /><path d="m8.3 11.8 2.5 2.6 4.9-5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></g>,
      <path key={2} d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />,
      <g key={3}><rect x="2.5" y="13.5" width="5" height="8" rx="1.2" /><rect x="9.5" y="8.5" width="5" height="13" rx="1.2" /><rect x="16.5" y="2.5" width="5" height="19" rx="1.2" /></g>
    ][i]}
  </svg>
);

// Aavtor mark (vector) for the nav wordmark.
export function BrandMark({ height = 26 }) {
  const w = Math.round((height * (MARK.w + 12)) / (MARK.h + 12));
  return (
    <svg viewBox={`-6 -6 ${MARK.w + 12} ${MARK.h + 12}`} width={w} height={height} aria-hidden>
      {PETAL_OUTLINES.map(p => <path key={p[0][0] + '' + p[0][1]} d={petalPath(p)} fill="#0B1530" />)}
      <g fill="#E9F0FE" stroke="#E9F0FE" strokeWidth={SPOKE} strokeLinecap="round">
        {NODES.map(n => <line key={`l${n.x}${n.y}`} x1={HUB.x} y1={HUB.y} x2={n.x} y2={n.y} />)}
        <circle cx={HUB.x} cy={HUB.y} r={HUB.r} stroke="none" />{NODES.map(n => <circle key={`n${n.x}${n.y}`} cx={n.x} cy={n.y} r={NODE_R} stroke="none" />)}
      </g>
    </svg>
  );
}
