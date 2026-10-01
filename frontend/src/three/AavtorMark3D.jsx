import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HUB, MARK, NODES, NODE_R, PETAL_OUTLINES, SPOKE } from '@/lib/aavtorMark';
import { glowTexture } from './geo';

// Drawn after the orb's glass and lattice (which are transparent), so they never wash the mark out.
const ON_TOP = 10;

// The Aavtor mark as a 3D object, built from the same geometry as the 2D logo: extruded navy petals with
// a raised, glowing white network (hub, spokes, nodes). `height` is in world units; `active` brightens the
// network and quickens the pulse (used while the AI is processing).
const CX = MARK.w / 2, CY = HUB.y;
const DEPTH = 70; // artwork units

const toV = (x, y) => new THREE.Vector2(x - CX, -(y - CY)); // artwork (y down) → world (y up), centred

export default function AavtorMark3D({ height = 1.6, active = false, sway = true, ...props }) {
  const root = useRef();
  const k = height / MARK.h;

  const { petals, spokes, nodes } = useMemo(() => {
    const petals = new THREE.ExtrudeGeometry(PETAL_OUTLINES.map(pts => new THREE.Shape(pts.map(([x, y]) => toV(x, y)))), {
      depth: DEPTH, bevelEnabled: true, bevelThickness: 10, bevelSize: 8, bevelSegments: 4, curveSegments: 6
    });
    petals.translate(0, 0, -DEPTH / 2);
    const spokes = NODES.map(n => {
      const a = toV(HUB.x, HUB.y), b = toV(n.x, n.y);
      return { mid: [(a.x + b.x) / 2, (a.y + b.y) / 2], len: a.distanceTo(b), angle: Math.atan2(b.y - a.y, b.x - a.x) };
    });
    return { petals, spokes, nodes: NODES.map(n => toV(n.x, n.y)) };
  }, []);
  const net = useRef();
  useEffect(() => () => petals.dispose(), [petals]);
  // transparent materials are sorted by renderOrder, which puts the mark in front of the glass shell
  useEffect(() => {
    root.current?.traverse(o => { if (o.isMesh) { o.renderOrder = ON_TOP; o.material.transparent = true; } });
  }, []);

  // the whole network pulses together (brighter and faster while active)
  useFrame(st => {
    const t = st.clock.elapsedTime, v = (active ? 2.2 : 1.2) + Math.sin(t * (active ? 6 : 2)) * (active ? 0.6 : 0.25);
    net.current?.traverse(o => { if (o.isMesh) o.material.emissiveIntensity = v; });
    // faces the viewer, turning gently so the depth reads
    if (sway && root.current) root.current.rotation.y = Math.sin(t * (active ? 1.4 : 0.7)) * 0.55;
  });
  const white = <meshStandardMaterial color="#ffffff" emissive="#9fd4ff" emissiveIntensity={1.2} roughness={0.25} toneMapped={false} />;

  const front = DEPTH / 2 + 14; // network sits proud of the petal faces
  return (
    <group {...props}>
      {/* soft white backdrop so the navy mark reads like the logo on paper, whatever is behind it */}
      <sprite scale={height * 1.55} renderOrder={ON_TOP - 1}><spriteMaterial map={glowTexture()} color="#ffffff" transparent opacity={0.85} depthWrite={false} /></sprite>
    <group ref={root} scale={k}>
      <mesh geometry={petals}>
        <meshPhysicalMaterial color={MARK.navy} metalness={0.35} roughness={0.32} clearcoat={1} clearcoatRoughness={0.12} emissive="#132a63" emissiveIntensity={0.25} />
      </mesh>
      {/* the network on both faces, so the mark reads correctly as it turns */}
      <group ref={net}>
      {[front, -front].map(z => (
        <group key={z} position={[0, 0, z]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[HUB.r, HUB.r, 16, 48]} />{white}</mesh>
          {nodes.map(v => <mesh key={`${v.x}:${v.y}`} position={[v.x, v.y, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[NODE_R, NODE_R, 16, 36]} />{white}</mesh>)}
          {spokes.map(sp => <mesh key={sp.angle} position={[sp.mid[0], sp.mid[1], 0]} rotation={[0, 0, sp.angle]}><boxGeometry args={[sp.len, SPOKE, 12]} />{white}</mesh>)}
        </group>
      ))}
      </group>
    </group>
    </group>
  );
}
