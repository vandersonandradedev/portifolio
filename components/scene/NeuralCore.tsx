'use client';

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

type Props = {
  ambient?: boolean;
  mouse: React.MutableRefObject<{ x: number; y: number }>;
  scrollPulse: React.MutableRefObject<number>;
};

export function NeuralCore({ ambient = true, mouse, scrollPulse }: Props) {
  const core = useRef<THREE.Mesh>(null);
  const wire = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!core.current || !wire.current || !rings.current) return;

    const breath = 1 + Math.sin(t * 2.4) * 0.05 + scrollPulse.current * 0.04;
    core.current.scale.setScalar(breath);
    wire.current.scale.setScalar(breath * 1.02);
    core.current.rotation.y += 0.0035;
    core.current.rotation.x += 0.0012;
    wire.current.rotation.y -= 0.0025;

    core.current.rotation.y += mouse.current.x * 0.002;
    core.current.rotation.x += mouse.current.y * 0.0015;

    rings.current.children.forEach((child, i) => {
      child.rotation.z += (i % 2 === 0 ? 1 : -1) * 0.0025;
    });

    const mat = core.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = ambient ? 0.85 + Math.sin(t * 3) * 0.1 : 1.6;
  });

  return (
    <group>
      <mesh ref={core}>
        <icosahedronGeometry args={[1, 3]} />
        <meshStandardMaterial
          color="#5eead4"
          emissive="#2dd4bf"
          emissiveIntensity={ambient ? 0.9 : 1.7}
          metalness={0.85}
          roughness={0.22}
        />
      </mesh>
      <mesh ref={wire}>
        <icosahedronGeometry args={[1.08, 1]} />
        <meshBasicMaterial color="#5eead4" wireframe transparent opacity={ambient ? 0.18 : 0.35} />
      </mesh>
      <group ref={rings}>
        {[1.55, 2.0, 2.45].map((r, i) => (
          <mesh key={r} rotation={[Math.PI / 2 + (i - 1) * 0.45, 0, 0]}>
            <torusGeometry args={[r, 0.012, 8, 128]} />
            <meshBasicMaterial color="#5eead4" transparent opacity={ambient ? 0.2 : 0.4} />
          </mesh>
        ))}
      </group>
      <pointLight color="#5eead4" intensity={ambient ? 1.4 : 2.4} distance={18} position={[0, 0, 2]} />
    </group>
  );
}
