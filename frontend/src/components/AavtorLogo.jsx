import React from 'react';
import { HUB, MARK, NODES, NODE_R, PETAL_OUTLINES, SPOKE, petalPath } from '@/lib/aavtorMark';

const PATHS = PETAL_OUTLINES.map(petalPath);

// The Aavtor brand mark as a crisp vector. `size` = rendered height. `tile` puts it on a white badge
// (for dark surfaces). `tone="light"` draws it white-on-transparent for use directly on dark glass.
export function AavtorLogo({ size = 40, tile = false, tone = 'dark', className = '' }) {
  const h = tile ? Math.round(size * 0.66) : size;
  const ink = tone === 'light' ? '#ffffff' : MARK.navy;
  const paper = tone === 'light' ? 'transparent' : '#ffffff';
  const svg = (
    <svg viewBox={`-6 -6 ${MARK.w + 12} ${MARK.h + 12}`} height={h} width={Math.round((h * (MARK.w + 12)) / (MARK.h + 12))} role="img" aria-label="Aavtor" className="aavtor-svg">
      <title>Aavtor</title>
      {PATHS.map(d => <path key={d.slice(0, 24)} d={d} fill={ink} />)}
      <g fill={paper} stroke={paper} strokeWidth={SPOKE} strokeLinecap="round">
        {NODES.map(n => <line key={`l${n.x}${n.y}`} x1={HUB.x} y1={HUB.y} x2={n.x} y2={n.y} />)}
        <circle cx={HUB.x} cy={HUB.y} r={HUB.r} stroke="none" />
        {NODES.map(n => <circle key={`n${n.x}${n.y}`} cx={n.x} cy={n.y} r={NODE_R} stroke="none" />)}
      </g>
    </svg>
  );
  if (!tile) return <span className={'aavtor ' + className}>{svg}</span>;
  return <span className={'aavtor-tile ' + className} style={{ width: size, height: size }}>{svg}</span>;
}
