import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGeo } from '@/hooks/useGeo';
import SceneShell from './SceneShell';
import MapBase from './MapBase';
import { polyToShape, lonLat, hash, glowTexture } from './geo';

const CELL = ['#1f7dff', '#2a8cff', '#37a0ff', '#1769f0', '#2f95ff', '#47b3ff', '#2373ff'];
const TN_CITIES = [['Chennai', 80.27, 13.08, 1], ['Coimbatore', 76.96, 11.0, 0.8]];

// Centre + scale that fit any state's polygons into the same ~2.6 unit frame.
function fit(polys) {
  let a = Infinity, b = -Infinity, c = Infinity, d = -Infinity;
  for (const poly of polys) for (const [lon, lat] of poly[0]) { a = Math.min(a, lon); b = Math.max(b, lon); c = Math.min(c, lat); d = Math.max(d, lat); }
  return { cx: (a + b) / 2, cy: (c + d) / 2, k: 2.6 / Math.max(b - a, d - c, 0.5) };
}

function Cell({ item, view, pulses, slug }) {
  const mat = useRef();
  const [geoms, edges] = useMemo(() => {
    const h = 0.12 + (hash(item.n) % 5) * 0.035; // uneven heights give the cracked-tile relief
    const gs = item.p.map(poly => new THREE.ExtrudeGeometry(polyToShape(poly, view.cx, view.cy, view.k), { depth: h, bevelEnabled: false }));
    return [gs, gs.map(g => new THREE.EdgesGeometry(g, 30))];
  }, [item, view]);
  useEffect(() => () => { geoms.forEach(g => g.dispose()); edges.forEach(g => g.dispose()); }, [geoms, edges]);
  useFrame(() => { if (mat.current) mat.current.emissiveIntensity = 0.8 + Math.max(0, 1 - (Date.now() - (pulses.current[slug] ?? 0)) / 1400) * 0.8; });
  const color = CELL[hash(item.n) % CELL.length];
  return (
    <group>
      {geoms.map((g, i) => (
        <group key={g.uuid}>
          <mesh geometry={g}><meshStandardMaterial ref={i === 0 ? mat : undefined} color={color} emissive="#0a45d8" emissiveIntensity={0.8} roughness={0.4} metalness={0.05} /></mesh>
          <lineSegments geometry={edges[i]}><lineBasicMaterial color="#b6e0ff" transparent opacity={0.9} /></lineSegments>
        </group>
      ))}
    </group>
  );
}

function Arrow({ x, y, v }) {
  const glow = useRef();
  const mat = <meshStandardMaterial color="#e24fff" emissive="#e24fff" emissiveIntensity={1.8} toneMapped={false} />;
  useFrame(st => glow.current.scale.setScalar(0.8 + Math.sin(st.clock.elapsedTime * 3 + x) * 0.1));
  return (
    <group position={[x, y, 0.3]}>
      <group rotation={[Math.PI / 2, 0, 0]} scale={[1, 0.3 + v * 0.3, 1]}>
        <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.025, 0.025, 1, 12]} />{mat}</mesh>
        <mesh position={[0, 1.05, 0]}><coneGeometry args={[0.08, 0.16, 16]} />{mat}</mesh>
        <mesh position={[0, -0.05, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.08, 0.16, 16]} />{mat}</mesh>
      </group>
      <sprite ref={glow} position={[0, 0, 0.3]} scale={0.7}><spriteMaterial map={glowTexture()} color="#e24fff" transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
    </group>
  );
}

function Block({ items, view, slug, marker, pulses }) {
  const g = useRef();
  useFrame(st => { g.current.rotation.z = Math.sin(st.clock.elapsedTime * 0.4) * 0.12; });
  return (
    <group ref={g}>
      {items.map(item => <Cell key={item.n} item={item} view={view} pulses={pulses} slug={slug} />)}
      {marker.map(([n, lon, lat, v]) => { const [x, y] = lonLat(lon, lat, view.cx, view.cy, view.k); return <Arrow key={n} x={x} y={y} v={v} />; })}
    </group>
  );
}

/** Any state as an extruded 3D block: Tamil Nadu from real districts, other states from their outline. */
export default function StateBlock({ slug, name, lon, lat, pulses, className = '' }) {
  const isTN = slug === 'tamil-nadu';
  const geo = useGeo(isTN ? 'tamilnadu' : 'india');
  const model = useMemo(() => {
    if (!geo.data) return null;
    if (isTN) {
      const items = geo.data.districts;
      return { items, view: fit(items.flatMap(d => d.p)), marker: TN_CITIES };
    }
    const st = geo.data.states.find(s => s.n === name);
    if (!st) return null;
    const view = fit(st.p);
    return { items: [{ n: st.n, p: st.p }], view, marker: [[st.n, lon ?? st.c[0], lat ?? st.c[1], 1]] };
  }, [geo.data, isTN, name, lon, lat]);

  return (
    <SceneShell name="state-block" label={`3D block map of ${name}`} className={className} status={geo} tone="dark" camera={{ position: [0, -3.5, 3.4], fov: 34, up: [0, 0, 1] }}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, -4, 7]} intensity={2.4} />
      <pointLight position={[-4, 1, 4]} intensity={40} color="#a86bff" />
      <MapBase radius={1.45} color="#4f7dff" grid={false} />
      {model && <Block key={slug} {...model} slug={slug} pulses={pulses} />}
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.4} maxPolarAngle={1.2} />
    </SceneShell>
  );
}
