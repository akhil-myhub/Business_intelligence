import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGeo } from '@/hooks/useGeo';
import SceneShell from './SceneShell';
import { polyToShape, lonLat, hash, glowTexture, makeCard } from './geo';

const CX = 82.5, CY = 22.5, K = 0.2;
const BLUES = ['#1458ff', '#1a66ff', '#2272ff', '#0f4de0', '#1c6bff', '#1860f0'];

function State({ s }) {
  const [geoms, edges] = useMemo(() => {
    const opts = { depth: 0.16, bevelEnabled: false };
    const gs = s.p.map(poly => new THREE.ExtrudeGeometry(polyToShape(poly, CX, CY, K), opts));
    return [gs, gs.map(g => new THREE.EdgesGeometry(g, 30))];
  }, [s]);
  const color = BLUES[hash(s.n) % BLUES.length];
  return (
    <group>
      {geoms.map((g, i) => (
        <group key={g.uuid}>
          <mesh geometry={g}><meshStandardMaterial color={color} emissive="#0a3cff" emissiveIntensity={0.75} roughness={0.45} metalness={0.05} /></mesh>
          <lineSegments geometry={edges[i]}><lineBasicMaterial color="#9fd0ff" transparent opacity={0.85} /></lineSegments>
        </group>
      ))}
    </group>
  );
}

// Glowing double-headed arrow marker, height tracks live revenue.
function Arrow({ s, max, onSelect, hovered, setHovered }) {
  const root = useRef(), glow = useRef();
  const [x, y] = lonLat(s.lon, s.lat, CX, CY, K);
  const hot = s.revenue / max;
  const color = hot > 0.8 ? '#ff7a45' : hot > 0.55 ? '#ff4fa8' : '#d84fff';
  const target = 0.55 + hot * 1.1;
  const h = useRef(0.1);
  useFrame((st, dt) => {
    h.current += (target - h.current) * Math.min(1, dt * 4);
    root.current.scale.set(1, h.current, 1);
    const p = 1 + Math.sin(st.clock.elapsedTime * 3 + x * 4) * 0.12;
    glow.current.scale.set(0.95 * p, 0.95 * p, 1);
  });
  const on = hovered === s.name;
  const mat = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={on ? 2.4 : 1.6} toneMapped={false} />;
  return (
    <group position={[x, y, 0.16]}
      onClick={e => { e.stopPropagation(); onSelect?.(s.name); }}
      onPointerOver={e => { e.stopPropagation(); setHovered(s.name); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHovered(null); document.body.style.cursor = ''; }}>
      {/* arrow is built along local Y, rotated so Y points up (world Z) */}
      <group ref={root} rotation={[Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.035, 0.035, 1, 12]} />{mat}</mesh>
        <mesh position={[0, 1.06, 0]}><coneGeometry args={[0.11, 0.2, 16]} />{mat}</mesh>
        <mesh position={[0, -0.06, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.11, 0.2, 16]} />{mat}</mesh>
      </group>
      <sprite ref={glow} position={[0, 0, 0.5]}><spriteMaterial map={glowTexture()} color={color} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
    </group>
  );
}

// absolute world positions so the three cards never collide
const CARD = { 'Tamil Nadu': [1.25, -0.5], Karnataka: [-1.55, -1.0], 'Andhra Pradesh': [1.3, -1.8] };

function Card({ s }) {
  const rev = Math.round(s.revenue);
  const tex = useMemo(() => makeCard(s.name, rev, s.growth, true), [s.name, rev, s.growth]);
  useEffect(() => () => tex.dispose(), [tex]);
  const [x, y] = CARD[s.name] || [0, 0];
  return <sprite position={[x, y, 1.3]} scale={[1.2, 0.64, 1]}><spriteMaterial map={tex} depthTest={false} transparent /></sprite>;
}

export default function IndiaMap({ states, onSelect, className = '' }) {
  const geo = useGeo('india');
  const [hovered, setHovered] = useState(null);
  const max = Math.max(...states.map(s => s.revenue));
  return (
    <SceneShell name="india-map" label="3D map of India with state revenue markers" className={className} status={geo}
      camera={{ position: [0, -7.3, 9.1], fov: 32, up: [0, 0, 1] }}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, -4, 8]} intensity={2.4} />
      <pointLight position={[-6, 2, 4]} intensity={40} color="#9a6bff" />
      <group position={[0.1, 0.1, 0]}>
        {geo.data?.states.map(s => <State key={s.n} s={s} />)}
        {states.map(s => <Arrow key={s.name} s={s} max={max} onSelect={onSelect} hovered={hovered} setHovered={setHovered} />)}
        {states.slice(0, 3).map(s => <Card key={s.name} s={s} />)}
      </group>
      <OrbitControls target={[0, 0, 0]} enablePan={false} enableZoom={false} minPolarAngle={0.35} maxPolarAngle={1.0} />
    </SceneShell>
  );
}
