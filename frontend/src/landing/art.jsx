'use client';

import React from 'react';
import { BarChart3, Cog, ShieldCheck, UsersRound } from 'lucide-react';
import { MARK, HUB, NODES, NODE_R, PETAL_OUTLINES, SPOKE, petalPath } from '@/lib/aavtorMark';

/* ── trust icons + brand ───────────────────────────────────────────── */
export const TrustIcon = ({ i }) => {
  const P = { size: 38, color: '#0965FF', strokeWidth: 2.1 };
  return [<UsersRound key={0} {...P} />, <ShieldCheck key={1} {...P} />, <Cog key={2} {...P} />, <BarChart3 key={3} {...P} />][i];
};

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
