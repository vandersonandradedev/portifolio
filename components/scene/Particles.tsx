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
  const { positions, colors, base, phase, band } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const base = new Float32Array(count * 3);
    const phase = new Float32Array(count);
    const band = new Float32Array(count);

    const cCyan = new THREE.Color('#67e8f9');
    const cBlue = new THREE.Color('#38bdf8');
    const cIce = new THREE.Color('#e0f2fe');
    const cDeep = new THREE.Color('#0ea5e9');
    const tmp = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const useDisk = Math.random() > 0.35;
      band[i] = useDisk ? 1 : 0;

      let x: number;
      let y: number;
      let z: number;

      if (useDisk) {
        const radius = 2.2 + Math.random() * 3.8;
        const theta = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 0.55;
        x = Math.cos(theta) * radius;
        y = height;
        z = Math.sin(theta) * radius;
      } else {
        const radius = 2.4 + Math.random() * 5.5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        x = radius * Math.sin(phi) * Math.cos(theta);
        y = radius * Math.sin(phi) * Math.sin(theta) * 0.7;
        z = radius * Math.cos(phi);
      }

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      base[i * 3] = x;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = z;
      phase[i] = Math.random() * Math.PI * 2;

      const pick = Math.random();
      if (pick > 0.85) tmp.copy(cIce);
      else if (pick > 0.55) tmp.copy(cBlue);
      else if (pick > 0.25) tmp.copy(cCyan);
      else tmp.copy(cDeep);

      const brightness = 0.55 + Math.random() * 0.45;
      colors[i * 3] = tmp.r * brightness;
      colors[i * 3 + 1] = tmp.g * brightness;
      colors[i * 3 + 2] = tmp.b * brightness;
    }

    return { positions, colors, base, phase, band };
  }, [count]);

  useFrame((state) => {
    if (!points.current) return;
    const t = state.clock.elapsedTime;
    points.current.rotation.y += ambient ? 0.00045 : 0.00085;
    points.current.rotation.x = Math.sin(t * 0.1) * 0.05;

    const attr = points.current.geometry.attributes.position as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const mx = mouse.current.x * 1.1;
    const my = mouse.current.y * 1.1;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      const bx = base[ix];
      const by = base[ix + 1];
      const bz = base[ix + 2];

      const dx = bx - mx * 2.2;
      const dy = by - my * 2.2;
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.01;
      const push = Math.min(0.55, 0.4 / dist);

      const spin = band[i] === 1 ? t * 0.08 : 0;
      const cos = Math.cos(spin + phase[i] * 0.01);
      const sin = Math.sin(spin + phase[i] * 0.01);
      const rx = bx * cos - bz * sin;
      const rz = bx * sin + bz * cos;

      const orbit = Math.sin(t * 0.6 + phase[i]) * (band[i] === 1 ? 0.05 : 0.09);

      arr[ix] = rx + dx * push * 0.16 + orbit;
      arr[ix + 1] = by + dy * push * 0.14 + Math.sin(t * 0.4 + phase[i]) * 0.03;
      arr[ix + 2] = rz + Math.cos(t * 0.35 + phase[i]) * 0.04;
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={count} />
      </bufferGeometry>
      <pointsMaterial
        size={ambient ? 0.028 : 0.038}
        vertexColors
        transparent
        opacity={ambient ? 0.7 : 0.9}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        sizeAttenuation
        toneMapped={false}
      />
    </points>
  );
}
