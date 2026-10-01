import React from 'react';
import { Environment, Lightformer } from '@react-three/drei';

// Procedural reflection environment. drei's `preset="city"` downloads an HDR from a public CDN at
// runtime (an external dependency that fails offline and violates a strict CSP) — this builds the
// equivalent studio lighting locally with no network.
export default function StudioEnv() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={4} position={[0, 5, -6]} scale={[12, 2.5, 1]} color="#ffffff" />
      <Lightformer form="rect" intensity={2.4} position={[-6, 1, -1]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} color="#9a8bff" />
      <Lightformer form="rect" intensity={2.4} position={[6, 1, -1]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} color="#6fd0ff" />
      <Lightformer form="ring" intensity={2} position={[0, 2, 6]} scale={4} color="#ffd9a8" />
    </Environment>
  );
}
