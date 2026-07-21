'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

type Props = {
  ambient?: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  scrollPulse: React.MutableRefObject<number>;
};

const CORE = '#7ef9ff';
const CORE_EMISSIVE = '#22d3ee';
const RING = '#38bdf8';
const ACCENT = '#e0f2fe';

export function NeuralCore({ ambient = true, mouse, scrollPulse }: Props) {
  const group = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);
  const orbiters = useRef<THREE.Group>(null);

  const orbiterData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        radius: 1.85 + (i % 3) * 0.35,
        speed: 0.35 + (i % 5) * 0.08,
        phase: (i / 12) * Math.PI * 2,
        tilt: (i % 4) * 0.4 - 0.6,
        size: 0.035 + (i % 3) * 0.012
      })),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!core.current || !wire.current || !rings.current || !inner.current) return;

    const breath =
      1 + Math.sin(t * 2.2) * 0.055 + Math.sin(t * 0.7) * 0.02 + scrollPulse.current * 0.05;

    core.current.scale.setScalar(breath);
    inner.current.scale.setScalar(breath * 0.55 + Math.sin(t * 4) * 0.03);
    wire.current.scale.setScalar(breath * 1.04);

    core.current.rotation.y += 0.004 + mouse.current.x * 0.003;
    core.current.rotation.x += 0.0014 + mouse.current.y * 0.002;
    wire.current.rotation.y -= 0.003;
    wire.current.rotation.z += 0.001;
    inner.current.rotation.y -= 0.01;

    if (group.current) {
      group.current.rotation.y = THREE.MathUtils.lerp(
        group.current.rotation.y,
        mouse.current.x * 0.15,
        0.04
      );
      group.current.rotation.x = THREE.MathUtils.lerp(
        group.current.rotation.x,
        mouse.current.y * 0.08,
        0.04
      );
    }

    rings.current.children.forEach((child, i) => {
      child.rotation.z += (i % 2 === 0 ? 1 : -1) * (0.003 + i * 0.0006);
      child.rotation.x += Math.sin(t * 0.2 + i) * 0.0003;
    });

    orbiters.current?.children.forEach((child, i) => {
      const d = orbiterData[i];
      const angle = t * d.speed + d.phase;
      child.position.set(
        Math.cos(angle) * d.radius,
        Math.sin(angle * 0.65) * 0.35 * d.tilt,
        Math.sin(angle) * d.radius * 0.85
      );
      const s = d.size * (1.2 + Math.sin(t * 3 + d.phase) * 0.35);
      child.scale.setScalar(s / 0.04);
    });

    const mat = core.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = (ambient ? 1.15 : 2.1) + Math.sin(t * 2.8) * 0.25;

    const innerMat = inner.current.material as THREE.MeshBasicMaterial;
    innerMat.opacity = (ambient ? 0.55 : 0.85) + Math.sin(t * 3.5) * 0.15;
  });

  return (
    <group ref={group}>
      <mesh ref={inner}>
        <sphereGeometry args={[0.42, 32, 32]} />
        <meshBasicMaterial color={ACCENT} transparent opacity={0.7} toneMapped={false} />
      </mesh>

      <mesh ref={core}>
        <icosahedronGeometry args={[1, 4]} />
        <meshStandardMaterial
          color={CORE}
          emissive={CORE_EMISSIVE}
          emissiveIntensity={ambient ? 1.2 : 2.0}
          metalness={0.7}
          roughness={0.15}
          envMapIntensity={1.2}
        />
      </mesh>

      <mesh ref={wire}>
        <icosahedronGeometry args={[1.12, 1]} />
        <meshBasicMaterial
          color={RING}
          wireframe
          transparent
          opacity={ambient ? 0.28 : 0.45}
          toneMapped={false}
        />
      </mesh>

      <mesh>
        <sphereGeometry args={[1.35, 32, 32]} />
        <meshBasicMaterial
          color={CORE_EMISSIVE}
          transparent
          opacity={ambient ? 0.06 : 0.1}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <group ref={rings}>
        {[
          { r: 1.55, tube: 0.01, tilt: 0.35, opacity: 0.55, color: CORE },
          { r: 1.95, tube: 0.008, tilt: -0.55, opacity: 0.4, color: RING },
          { r: 2.4, tube: 0.006, tilt: 0.85, opacity: 0.28, color: ACCENT },
          { r: 2.85, tube: 0.004, tilt: -1.1, opacity: 0.18, color: RING }
        ].map((cfg) => (
          <mesh key={cfg.r} rotation={[Math.PI / 2 + cfg.tilt, cfg.tilt * 0.3, 0]}>
            <torusGeometry args={[cfg.r, cfg.tube, 12, 180]} />
            <meshBasicMaterial
              color={cfg.color}
              transparent
              opacity={ambient ? cfg.opacity * 0.85 : cfg.opacity}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      <group ref={orbiters}>
        {orbiterData.map((d, i) => (
          <mesh key={i}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshBasicMaterial
              color={i % 3 === 0 ? ACCENT : CORE}
              transparent
              opacity={0.9}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      <pointLight
        color={CORE}
        intensity={ambient ? 2.2 : 3.4}
        distance={22}
        position={[0, 0, 1.5]}
      />
      <pointLight color={RING} intensity={0.8} distance={14} position={[2, 1, -1]} />
      <pointLight color="#0369a1" intensity={0.5} distance={16} position={[-2, -1, 0]} />
    </group>
  );
}
