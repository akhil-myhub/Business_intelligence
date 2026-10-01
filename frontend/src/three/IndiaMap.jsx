import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGeo } from '@/hooks/useGeo';
import SceneShell from './SceneShell';
import MapBase from './MapBase';
import { polyToShape, lonLat, glowTexture, makeCard } from './geo';

const CX = 82.5, CY = 22.5, K = 0.2;
const DIM = new THREE.Color('#2c3f94');
const STOPS = ['#2b6cff', '#22c9ff', '#ffe066', '#ff9a3c', '#ff4d4d'].map(c => new THREE.Color(c));

// 0..1 → blue → cyan → yellow → orange → red (matches the High/Low legend)
function heat(t) {
  const x = Math.min(0.9999, Math.max(0, t)) * (STOPS.length - 1), i = Math.floor(x);
  return new THREE.Color().copy(STOPS[i]).lerp(STOPS[i + 1], x - i);
}

const flash = (pulses, slug) => Math.max(0, 1 - (Date.now() - (pulses.current[slug] ?? 0)) / 1400); // 1 right after a sale → 0

function State({ shape, info, color, hovered, pulses, onSelect, onHover }) {
  const mat = useRef();
  const [geoms, edges] = useMemo(() => {
    const gs = shape.p.map(poly => new THREE.ExtrudeGeometry(polyToShape(poly, CX, CY, K), { depth: 0.16, bevelEnabled: false }));
    return [gs, gs.map(g => new THREE.EdgesGeometry(g, 30))];
  }, [shape]);
  useEffect(() => () => { geoms.forEach(g => g.dispose()); edges.forEach(g => g.dispose()); }, [geoms, edges]);

  useFrame(() => {
    if (!mat.current) return;
    mat.current.emissiveIntensity = 0.55 + (hovered ? 0.5 : 0) + flash(pulses, shape.slug) * 1.1;
  });

  const interactive = Boolean(info);
  return (
    <group>
      {geoms.map((g, i) => (
        <group key={g.uuid}>
          <mesh geometry={g}
            onClick={interactive ? e => { e.stopPropagation(); onSelect?.(shape.slug); } : undefined}
            onPointerOver={interactive ? e => { e.stopPropagation(); onHover?.(shape.slug); document.body.style.cursor = 'pointer'; } : undefined}
            onPointerOut={interactive ? () => { onHover?.(null); document.body.style.cursor = ''; } : undefined}>
            <meshStandardMaterial ref={i === 0 ? mat : undefined} color={color} emissive={color} emissiveIntensity={0.55} roughness={0.45} metalness={0.05} />
          </mesh>
          <lineSegments geometry={edges[i]}><lineBasicMaterial color={hovered ? '#ffffff' : '#9fd0ff'} transparent opacity={hovered ? 1 : 0.8} /></lineSegments>
        </group>
      ))}
    </group>
  );
}

// Glowing double-headed arrow: height follows revenue, glow bursts when a live sale lands in the state.
function Arrow({ s, max, color, pulses, onSelect }) {
  const root = useRef(), glow = useRef(), shaft = useRef(), tip = useRef(), tail = useRef();
  const [x, y] = lonLat(s.lon, s.lat, CX, CY, K);
  const target = 0.45 + (s.revenue / max) * 1.1;
  const h = useRef(0.1);
  useFrame((st, dt) => {
    h.current += (target - h.current) * Math.min(1, dt * 4);
    root.current.scale.set(1, h.current, 1);
    const f = flash(pulses, s.slug);
    glow.current.scale.setScalar(0.95 * (1 + Math.sin(st.clock.elapsedTime * 3 + x * 4) * 0.12) + f * 1.4);
    for (const m of [shaft, tip, tail]) if (m.current) m.current.material.emissiveIntensity = 1.6 + f * 2.5;
  });
  const mat = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} toneMapped={false} />;
  return (
    <group position={[x, y, 0.16]} onClick={e => { e.stopPropagation(); onSelect?.(s.slug); }}>
      <group ref={root} rotation={[Math.PI / 2, 0, 0]}>
        <mesh ref={shaft} position={[0, 0.5, 0]}><cylinderGeometry args={[0.035, 0.035, 1, 12]} />{mat}</mesh>
        <mesh ref={tip} position={[0, 1.06, 0]}><coneGeometry args={[0.11, 0.2, 16]} />{mat}</mesh>
        <mesh ref={tail} position={[0, -0.06, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.11, 0.2, 16]} />{mat}</mesh>
      </group>
      <sprite ref={glow} position={[0, 0, 0.5]}><spriteMaterial map={glowTexture()} color={color} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
    </group>
  );
}

// Place up to three cards beside their states, split left/right of the cluster and pushed apart vertically
// so they never overlap, and kept inside the visible frame.
function layoutCards(top) {
  const pts = top.slice(0, 3).map(s => { const [x, y] = lonLat(s.lon, s.lat, CX, CY, K); return { s, x, y }; });
  const mean = pts.reduce((a, p) => a + p.x, 0) / (pts.length || 1);
  let side = pts.map(p => (p.x < mean ? 'L' : 'R'));
  if (new Set(side).size === 1) side = pts.map((_, i) => (i % 2 ? 'L' : 'R'));
  const out = [];
  for (const dir of ['L', 'R']) {
    const group = pts.filter((_, i) => side[i] === dir).sort((a, b) => b.y - a.y);
    let last = Infinity;
    for (const p of group) {
      const cy = Math.min(p.y + 0.3, last - 0.85);
      last = cy;
      out.push({ s: p.s, x: Math.max(-1.85, Math.min(1.95, p.x + (dir === 'L' ? -1.5 : 1.5))), y: cy });
    }
  }
  return out;
}

function Card({ s, x, y }) {
  const rev = Math.round(s.revenue);
  const tex = useMemo(() => makeCard(s.name, rev, s.growth, true), [s.name, rev, s.growth]);
  useEffect(() => () => tex.dispose(), [tex]);
  return <sprite position={[x, y, 1.3]} scale={[1.2, 0.64, 1]}><spriteMaterial map={tex} depthTest={false} transparent /></sprite>;
}

/**
 * states: [{ name, slug, lon, lat, revenue, growth, inRegion }]   top: the ranked in-region states
 * pulses: ref of slug → last live-sale timestamp.  onSelect(slug) navigates; onHover(slug|null) feeds the tooltip.
 */
export default function IndiaMap({ states, top, pulses, hover, onSelect, onHover, className = '', fallback }) {
  const geo = useGeo('india');
  const bySlug = useMemo(() => Object.fromEntries(states.map(s => [s.slug, s])), [states]);
  // Stable shape objects: State rebuilds its (expensive) geometry only when these change, not on every hover.
  const shapes = useMemo(() => (geo.data?.states ?? []).map(sh => ({ ...sh, slug: sh.n.toLowerCase().replace(/[^a-z0-9]+/g, '-') })), [geo.data]);
  const { lo, hi } = useMemo(() => {
    const v = states.filter(s => s.inRegion).map(s => s.revenue);
    return { lo: Math.min(...v), hi: Math.max(...v) };
  }, [states]);
  const max = top[0]?.revenue || 1;
  const cards = useMemo(() => layoutCards(top), [top]);
  const color = info => (info?.inRegion ? heat(hi === lo ? 0.5 : (info.revenue - lo) / (hi - lo)) : DIM);

  return (
    <SceneShell name="india-map" label="3D map of India coloured by revenue" className={className} status={geo} fallback={fallback}
      camera={{ position: [0, -7.3, 9.1], fov: 32, up: [0, 0, 1] }}>
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, -4, 8]} intensity={1.9} />
      <pointLight position={[-6, 2, 4]} intensity={40} color="#9a6bff" />
      <MapBase radius={3.6} />
      <group position={[0.1, 0.1, 0]}>
        {shapes.map(sh => {
          const info = bySlug[sh.slug];
          return <State key={sh.n} shape={sh} info={info} color={color(info)} hovered={hover === sh.slug} pulses={pulses} onSelect={onSelect} onHover={onHover} />;
        })}
        {top.map((s, i) => <Arrow key={s.slug} s={s} max={max} color={i === 0 ? '#ff7a45' : i < 3 ? '#ff4fa8' : '#d84fff'} pulses={pulses} onSelect={onSelect} />)}
        {cards.map(c => <Card key={c.s.slug} {...c} />)}
      </group>
      <OrbitControls target={[0, 0, 0]} enablePan={false} enableZoom={false} minPolarAngle={0.35} maxPolarAngle={1.0} />
    </SceneShell>
  );
}
