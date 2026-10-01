// Aavtor mark geometry (artwork space 607 × 708, y down). Single source of truth for the 2D logo (SVG),
// the favicon and the extruded 3D logo, so every rendering is the same shape.
//
// Each petal is the convex hull of a few circles: a large round tip around its node, smaller rounded
// corners where it meets its neighbours. The white network (hub, spokes, nodes) is drawn over the petals.

export const MARK = { w: 607, h: 708, navy: '#0B1530' };
export const HUB = { x: 237, y: 354, r: 92 };
export const NODES = [{ x: 88, y: 95 }, { x: 517, y: 354 }, { x: 88, y: 613 }];
export const NODE_R = 44;
export const SPOKE = 15;

const PETALS = [
  [[88, 95, 88], [286, 222, 30], [34, 302, 34], [150, 318, 20]],                       // top
  [[517, 354, 88], [352, 228, 30], [352, 480, 30], [300, 302, 18], [300, 406, 18]],    // right
  [[88, 613, 88], [286, 486, 30], [34, 406, 34], [150, 390, 20]]                       // bottom (mirror of top)
];

function hull(points) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [], upper = [];
  for (const q of p) { while (lower.length >= 2 && cross(lower.at(-2), lower.at(-1), q) <= 0) lower.pop(); lower.push(q); }
  for (const q of p.reverse()) { while (upper.length >= 2 && cross(upper.at(-2), upper.at(-1), q) <= 0) upper.pop(); upper.push(q); }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// Outline of each petal as a closed polygon (smooth: circles sampled every 3°).
export const PETAL_OUTLINES = PETALS.map(circles => hull(circles.flatMap(([cx, cy, r]) =>
  Array.from({ length: 120 }, (_, i) => { const a = (i / 120) * Math.PI * 2; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; }))));

export const petalPath = pts => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z';

// Standalone SVG markup (for exports and image generation, where React isn't available).
export function aavtorSvg({ ink = MARK.navy, paper = '#ffffff', height = 64 } = {}) {
  const w = Math.round((height * (MARK.w + 12)) / (MARK.h + 12));
  const petals = PETAL_OUTLINES.map(p => `<path d="${petalPath(p)}" fill="${ink}"/>`).join('');
  const net = NODES.map(n => `<line x1="${HUB.x}" y1="${HUB.y}" x2="${n.x}" y2="${n.y}"/>`).join('')
    + `<circle cx="${HUB.x}" cy="${HUB.y}" r="${HUB.r}" stroke="none"/>`
    + NODES.map(n => `<circle cx="${n.x}" cy="${n.y}" r="${NODE_R}" stroke="none"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${height}" viewBox="-6 -6 ${MARK.w + 12} ${MARK.h + 12}">${petals}<g fill="${paper}" stroke="${paper}" stroke-width="${SPOKE}" stroke-linecap="round">${net}</g></svg>`;
}
