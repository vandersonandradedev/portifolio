'use client';

import { Canvas } from '@react-three/fiber';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
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
    if (reduced) return 1200;
    return mobile ? 7000 : 30000;
  }, []);

  return (
    <>
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.35} />
      <Particles count={count} mouse={mouse} ambient={ambient} />
      <NeuralCore ambient={ambient} mouse={mouse} scrollPulse={scrollPulse} />
      <EffectComposer>
        <Bloom
          intensity={ambient ? 0.35 : 0.55}
          luminanceThreshold={0.35}
          luminanceSmoothing={0.7}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

export default function SceneCanvas({ ambient = true }: Props) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 opacity-[0.42]">
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 6.2], fov: 48 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <SceneContent ambient={ambient} />
        </Suspense>
      </Canvas>
    </div>
  );
}
