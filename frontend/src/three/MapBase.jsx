import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { glowTexture } from './geo';

// A holographic base for map scenes (the map lies in the XY plane, z up): a soft glow pool,
// a faint polar grid, and a scan ring that sweeps outward every few seconds.
export default function MapBase({ radius = 3.4, z = -0.06, color = '#3b6bff', grid = true }) {
  const scan = useRef();
  useFrame(st => {
    const t = (st.clock.elapsedTime % 4) / 4; // 0 → 1 every 4s
    scan.current.scale.setScalar(0.15 + t * radius);
    scan.current.material.opacity = 0.55 * (1 - t);
  });
  return (
    <group position={[0, 0, z]}>
      <mesh renderOrder={-2}>
        <circleGeometry args={[radius, 64]} />
        <meshBasicMaterial map={glowTexture()} color={color} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {grid && (
        <polarGridHelper args={[radius, 12, 5, 96, '#5d86ff', '#3654c4']} rotation={[Math.PI / 2, 0, 0]} renderOrder={-1}
          material-transparent material-opacity={0.22} material-depthWrite={false} />
      )}
      <mesh ref={scan} renderOrder={-1}>
        <ringGeometry args={[0.96, 1, 96]} />
        <meshBasicMaterial color="#8fd0ff" transparent opacity={0.5} depthWrite={false} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}
