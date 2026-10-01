import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGeo } from '@/hooks/useGeo';
import SceneShell from './SceneShell';
import { polyToShape, lonLat, hash, glowTexture } from './geo';

const CX = 78.3, CY = 10.8, K = 0.55;
const CELL = ['#1f7dff', '#2a8cff', '#37a0ff', '#1769f0', '#2f95ff', '#47b3ff', '#2373ff'];
const CITIES = [['Chennai', 80.27, 13.08, 1], ['Coimbatore', 76.96, 11.0, 0.8]];

function District({ d }) {
  const [geoms, edges] = useMemo(() => {
    const h = 0.12 + (hash(d.n) % 5) * 0.035; // uneven heights give the cracked-tile relief
    const gs = d.p.map(poly => new THREE.ExtrudeGeometry(polyToShape(poly, CX, CY, K), { depth: h, bevelEnabled: false }));
    return [gs, gs.map(g => new THREE.EdgesGeometry(g, 30))];
  }, [d]);
  const color = CELL[hash(d.n) % CELL.length];
  return (
    <group>
      {geoms.map((g, i) => (
        <group key={g.uuid}>
          <mesh geometry={g}><meshStandardMaterial color={color} emissive="#0a45d8" emissiveIntensity={0.8} roughness={0.4} metalness={0.05} /></mesh>
          <lineSegments geometry={edges[i]}><lineBasicMaterial color="#b6e0ff" transparent opacity={0.9} /></lineSegments>
        </group>
      ))}
    </group>
  );
}

function Arrow({ lon, lat, v }) {
  const glow = useRef();
  const [x, y] = lonLat(lon, lat, CX, CY, K);
  const mat = <meshStandardMaterial color="#e24fff" emissive="#e24fff" emissiveIntensity={1.8} toneMapped={false} />;
  const H = 0.3 + v * 0.3;
  useFrame(st => glow.current.scale.setScalar(0.8 + Math.sin(st.clock.elapsedTime * 3 + x) * 0.1));
  return (
    <group position={[x, y, 0.3]}>
      <group rotation={[Math.PI / 2, 0, 0]} scale={[1, H, 1]}>
        <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.025, 0.025, 1, 12]} />{mat}</mesh>
        <mesh position={[0, 1.05, 0]}><coneGeometry args={[0.08, 0.16, 16]} />{mat}</mesh>
        <mesh position={[0, -0.05, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.08, 0.16, 16]} />{mat}</mesh>
      </group>
      <sprite ref={glow} position={[0, 0, 0.3]} scale={0.7}><spriteMaterial map={glowTexture()} color="#e24fff" transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
    </group>
  );
}

function Block({ geo }) {
  const g = useRef();
  useFrame(st => { g.current.rotation.z = Math.sin(st.clock.elapsedTime * 0.4) * 0.12; });
  return (
    <group ref={g}>
      {geo.districts.map(d => <District key={d.n} d={d} />)}
      {CITIES.map(([n, lon, lat, v]) => <Arrow key={n} lon={lon} lat={lat} v={v} />)}
    </group>
  );
}

export default function TamilNadu({ className = '' }) {
  const geo = useGeo('tamilnadu');
  return (
    <SceneShell name="tamil-nadu" label="3D block map of Tamil Nadu districts" className={className} status={geo}
      camera={{ position: [0, -3.5, 3.4], fov: 34, up: [0, 0, 1] }}>
      <ambientLight intensity={1.1} />
      <directionalLight position={[3, -4, 7]} intensity={2.4} />
      <pointLight position={[-4, 1, 4]} intensity={40} color="#a86bff" />
      {geo.data && <Block geo={geo.data} />}
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={0.4} maxPolarAngle={1.2} />
    </SceneShell>
  );
}
