import * as THREE from 'three';

// Real boundaries live in /public/geo (built from GADM/Datameet GeoJSON, simplified); loaded via hooks/useGeo.

// poly = [outerRing, ...holes], each ring = [[lon, lat], ...]
export function polyToShape(poly, cx, cy, k) {
  const ring = r => r.map(([lon, lat]) => new THREE.Vector2((lon - cx) * k, (lat - cy) * k));
  const shape = new THREE.Shape(ring(poly[0]));
  poly.slice(1).forEach(h => shape.holes.push(new THREE.Path(ring(h))));
  return shape;
}

export const lonLat = (lon, lat, cx, cy, k) => [(lon - cx) * k, (lat - cy) * k];

export function hash(str) {
  let h = 0; for (let i = 0; i < str.length; i++) h = Math.trunc(h * 31 + str.codePointAt(i)) % 2147483647;
  return Math.abs(h);
}

// Glow sprite texture (radial gradient), shared.
let glowTex;
export function glowTexture() {
  if (glowTex) return glowTex;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c); return glowTex;
}

// next/font gives the family a hashed name, so read the real stack from the page instead of hardcoding 'Inter'.
const FONT = () => getComputedStyle(document.body).fontFamily || 'Arial, sans-serif';

// Dark tooltip card (matches the wireframe's black rounded label with green growth).
export function makeCard(name, revenue, growth, hot) {
  const c = document.createElement('canvas'); c.width = 360; c.height = 190;
  const g = c.getContext('2d');
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 18; g.shadowOffsetY = 6;
  g.fillStyle = hot ? 'rgba(10,14,32,.97)' : 'rgba(14,18,38,.9)';
  g.beginPath(); g.roundRect(16, 12, 328, 150, 24); g.fill();
  g.shadowColor = 'transparent';
  g.fillStyle = '#fff'; g.font = `700 38px ${FONT()}`; g.fillText(name, 40, 62);
  g.font = `800 46px ${FONT()}`; g.fillText('₹ ' + revenue + ' Cr', 40, 114);
  g.fillStyle = '#34e08a'; g.font = `700 34px ${FONT()}`; g.fillText('↑ ' + growth + '%', 40, 150);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
