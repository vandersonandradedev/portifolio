'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type Props = {
  count?: number;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  ambient?: boolean;
};

export function Particles({ count = 30000, mouse, ambient = true }: Props) {
  const points = useRef<THREE.Points>(null);
  const { positions, base, phase } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    const phase = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      const radius = 2.6 + Math.random() * 5.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      base[i * 3] = x;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = z;
      phase[i] = Math.random() * Math.PI * 2;
    }

    return { positions, base, phase };
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    const t = state.clock.elapsedTime;
    points.current.rotation.y += ambient ? 0.0005 : 0.0009;
    points.current.rotation.x = Math.sin(t * 0.12) * 0.06;

    const attr = points.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const mx = mouse.current.x * 0.9;
    const my = mouse.current.y * 0.9;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const bx = base[ix];
      const by = base[ix + 1];
      const bz = base[ix + 2];
      const dx = bx - mx * 2;
      const dy = by - my * 2;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
      const push = Math.min(0.4, 0.32 / dist);
      const orbit = Math.sin(t * 0.55 + phase[i]) * 0.07;
      arr[ix] = bx + dx * push * 0.14 + orbit;
      arr[ix + 1] = by + dy * push * 0.14;
      arr[ix + 2] = bz + Math.cos(t * 0.35 + phase[i]) * 0.04;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
        />
      </bufferGeometry>
      <pointsMaterial
        size={ambient ? 0.022 : 0.032}
        color="#5eead4"
        transparent
        opacity={ambient ? 0.45 : 0.8}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
