import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';
import SceneShell from './SceneShell';
import StudioEnv from './StudioEnv';
import { glowTexture } from './geo';

// lucide "brain" paths, drawn into a texture so the brain glows inside the orb while processing
const BRAIN = ['M12 18V5', 'M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4', 'M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5',
  'M17.997 5.125a4 4 0 0 1 2.526 5.77', 'M18 18a4 4 0 0 0 2-7.464', 'M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517',
  'M6 18a4 4 0 0 1-2-7.464', 'M6.003 5.125a4 4 0 0 0-2.526 5.77'];

function brainTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d');
  g.scale(512 / 24, 512 / 24); g.translate(0, 0.4);
  g.lineCap = g.lineJoin = 'round';
  for (const [w, a, blur] of [[1.5, 0.35, 1.2], [0.55, 1, 0]]) {
    g.lineWidth = w; g.strokeStyle = `rgba(90,225,255,${a})`; g.shadowColor = '#4ad8ff'; g.shadowBlur = blur * 21;
    BRAIN.forEach(d => g.stroke(new Path2D(d)));
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// mulberry32 PRNG
const seeded = seed => () => {
  seed = Math.trunc(seed + 0x6d2b79f5);
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const RINGS = [[1.9, [1.2, 0.2, 0], '#8f6bff'], [2.1, [0.3, 0.9, 0.4], '#5ad1ff'], [2.35, [1.45, -0.5, 0.2], '#b07bff'], [1.7, [0.2, -0.3, 1.1], '#7fb2ff']];

function Pedestal() {
  const glow = useRef();
  useFrame(st => { glow.current.material.opacity = 0.5 + Math.sin(st.clock.elapsedTime * 1.6) * 0.1; });
  const glass = <meshPhysicalMaterial color="#7d93e8" roughness={0.05} clearcoat={1} transparent opacity={0.45} envMapIntensity={1.6} depthWrite={false} />;
  return (
    <group position={[0, -2.75, 0]} rotation={[0.3, 0, 0]} scale={0.66}>
      <mesh><cylinderGeometry args={[3.1, 3.2, 0.2, 96]} /><meshPhysicalMaterial color="#8d98c9" metalness={0.9} roughness={0.22} clearcoat={1} envMapIntensity={1.4} /></mesh>
      <mesh position={[0, 0.11, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[3.1, 0.035, 12, 160]} /><meshBasicMaterial color="#fff0cf" /></mesh>
      <mesh position={[0, 0.24, 0]}><cylinderGeometry args={[2.6, 2.6, 0.12, 96]} />{glass}</mesh>
      <mesh position={[0, 0.38, 0]}><cylinderGeometry args={[2.15, 2.15, 0.1, 96]} />{glass}</mesh>
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[2.62, 0.02, 12, 160]} /><meshBasicMaterial color="#9fe3ff" /></mesh>
      <mesh position={[0, 0.44, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[2.17, 0.02, 12, 160]} /><meshBasicMaterial color="#c9b3ff" /></mesh>
      <mesh ref={glow} position={[0, 0.45, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[2.1, 64]} /><meshBasicMaterial map={glowTexture()} color="#4a63ff" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      <mesh position={[0, 0.46, 0]} rotation={[-Math.PI / 2, 0, 0]}><circleGeometry args={[1.1, 64]} /><meshBasicMaterial map={glowTexture()} color="#a050ff" transparent opacity={0.6} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
    </group>
  );
}

function Orb({ active, variant }) {
  const stage = variant === 'stage', light = variant === 'login';
  const appear = useRef(0), root = useRef();
  const group = useRef(), lat = useRef(), rings = useRef([]), pts = useRef(), halo = useRef(), brain = useRef(), core = useRef();
  const speed = useRef(1);
  const ico = useMemo(() => new THREE.IcosahedronGeometry(1, 2), []);
  const wire = useMemo(() => new THREE.WireframeGeometry(ico), [ico]);
  const brainTex = useMemo(() => brainTexture(), []);
  const dust = useMemo(() => {
    const rand = seeded(7); // deterministic: render stays pure and the particle cloud is stable across re-renders
    const n = 320, a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const r = 1.2 + rand() * 1.6, t = rand() * Math.PI * 2, p = Math.acos(2 * rand() - 1);
      a.set([r * Math.sin(p) * Math.cos(t), r * Math.cos(p) * 0.9, r * Math.sin(p) * Math.sin(t)], i * 3);
    }
    return a;
  }, []);

  useFrame((s, dt) => {
    speed.current += ((active ? 3 : 1) - speed.current) * Math.min(1, dt * 3);
    appear.current += (((stage && !active) ? 0 : 1) - appear.current) * Math.min(1, dt * 3);
    root.current.scale.setScalar(Math.max(0.001, appear.current) * (stage ? 1.4 : 1));
    const k = speed.current, t = s.clock.elapsedTime, ease = Math.min(1, dt * 3);
    group.current.rotation.y += dt * 0.22 * k;
    lat.current.rotation.x += dt * 0.08 * k;
    rings.current.forEach((r, i) => { if (r) r.rotation.z += dt * (0.25 + i * 0.12) * k * (i % 2 ? -1 : 1); });
    pts.current.rotation.y -= dt * 0.06 * k;
    const pulse = 1 + Math.sin(t * (active ? 5 : 1.4)) * (active ? 0.08 : 0.03);
    halo.current.scale.setScalar((active ? 5.6 : 4.2) * pulse);
    halo.current.material.opacity += ((light ? 0 : active ? 0.8 : 0.4) - halo.current.material.opacity) * ease;
    brain.current.material.opacity += ((active ? 1 : 0) - brain.current.material.opacity) * Math.min(1, dt * 4);
    brain.current.scale.setScalar(1.05 * (1 + Math.sin(t * 5) * (active ? 0.05 : 0)));
    core.current.material.opacity += ((active ? 0.55 : 0.25) - core.current.material.opacity) * ease;
  });

  const line = light ? '#2f5bff' : active ? '#79e6ff' : '#4aa3ff', node = light ? '#ffb020' : active ? '#ffffff' : '#ffd27a';
  const blend = light ? THREE.NormalBlending : THREE.AdditiveBlending;
  return (
    <group>
      {stage && <Pedestal />}
      <group ref={root} position={[0, stage ? -0.55 : 0, 0]}>
      <Float speed={1.6} floatIntensity={0.45} rotationIntensity={0.08}>
        <sprite ref={halo}><spriteMaterial map={glowTexture()} color={active ? '#6d7bff' : '#7a6bff'} transparent opacity={0.4} depthWrite={false} blending={THREE.AdditiveBlending} /></sprite>
        <group ref={group}>
          <mesh scale={1.4} renderOrder={1}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshPhysicalMaterial color={light ? "#3a5ccf" : "#7a9bff"} roughness={0.05} metalness={0.1} iridescence={1}
              clearcoat={1} envMapIntensity={2.2} transparent opacity={light ? 0.5 : 0.22} depthWrite={false} />
          </mesh>
          <mesh ref={core} scale={1.05}><sphereGeometry args={[1, 32, 32]} /><meshBasicMaterial color="#2a3fd0" transparent opacity={0.25} depthWrite={false} /></mesh>
          <group ref={lat} scale={1.18}>
            <lineSegments geometry={wire} renderOrder={3}><lineBasicMaterial color={line} transparent opacity={1} depthWrite={false} /></lineSegments>
            <points geometry={ico} renderOrder={4}><pointsMaterial color={node} size={light ? 0.1 : active ? 0.085 : 0.07} sizeAttenuation transparent opacity={1} depthWrite={false} blending={blend} /></points>
          </group>
          <sprite ref={brain}><spriteMaterial map={brainTex} transparent opacity={0} depthTest={false} /></sprite>
          {RINGS.map(([r, rot, c], i) => (
            <mesh key={c} ref={el => { rings.current[i] = el; }} rotation={rot} scale={[1, 0.62, 1]}>
              <torusGeometry args={[r, 0.008, 12, 200]} /><meshBasicMaterial color={c} transparent opacity={active ? 0.95 : 0.7} />
            </mesh>
          ))}
          <points ref={pts}>
            <bufferGeometry><bufferAttribute attach="attributes-position" args={[dust, 3]} /></bufferGeometry>
            <pointsMaterial color="#9ad8ff" size={0.04} sizeAttenuation transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
          </points>
        </group>
      </Float>
      </group>
    </group>
  );
}

export default function OrbScene({ active = false, className = '', variant = 'login' }) {
  return (
    <SceneShell name={'orb-' + variant} label="Animated AI orb" className={className} camera={{ position: [0, 0.6, 8.2], fov: 38 }}>
      <ambientLight intensity={0.7} />
      <pointLight position={[4, 5, 5]} intensity={40} color="#ffffff" />
      <pointLight position={[-5, 1, 3]} intensity={30} color="#9a6bff" />
      <pointLight position={[0, -1, 4]} intensity={active ? 60 : 25} color="#5ad1ff" />
      <StudioEnv />
      <Orb active={active} variant={variant} />
    </SceneShell>
  );
}
