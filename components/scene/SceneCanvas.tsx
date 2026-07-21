'use client';

import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { NeuralCore } from './NeuralCore';
import { Particles } from './Particles';

type Props = {
  ambient?: boolean;
};

function SceneContent({ ambient }: { ambient: boolean }) {
  const mouse = useRef({ x: 0, y: 0 });
  const scrollPulse = useRef(0);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollPulse.current = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const count = useMemo(() => {
    if (typeof window === 'undefined') return 8000;
    const mobile = window.innerWidth < 768;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return 1500;
    return mobile ? 8000 : 28000;
  }, []);

  return (
    <>
      <fog attach="fog" args={['#020617', 8, 22]} />
      <ambientLight intensity={0.25} color="#0c4a6e" />
      <directionalLight position={[4, 3, 2]} intensity={0.35} color="#bae6fd" />
      <Particles count={count} mouse={mouse} ambient={ambient} />
      <NeuralCore ambient={ambient} mouse={mouse} scrollPulse={scrollPulse} />
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={ambient ? 0.85 : 1.15}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.55}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.25} darkness={0.65} />
      </EffectComposer>
    </>
  );
}

export default function SceneCanvas({ ambient = true }: Props) {
  return (
    <div
      className={`pointer-events-none absolute inset-0 transition-opacity duration-1000 ${
        ambient ? 'opacity-[0.72]' : 'opacity-[0.9]'
      }`}
    >
      <Canvas
        dpr={[1, 1.85]}
        camera={{ position: [0, 0.15, 5.8], fov: 46 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: 3
        }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <SceneContent ambient={ambient} />
        </Suspense>
      </Canvas>
    </div>
  );
}
