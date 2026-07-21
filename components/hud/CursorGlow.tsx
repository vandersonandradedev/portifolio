'use client';

import { useEffect, useState } from 'react';

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reduced) return;

    setEnabled(true);
    const onMove = (e: PointerEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        className="pointer-events-none fixed left-0 top-0 z-20 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.08),transparent_68%)]"
        style={{ transform: `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)` }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 z-10"
        style={{
          background: `radial-gradient(420px circle at var(--cursor-x, 50%) var(--cursor-y, 50%), rgba(94,234,212,0.04), transparent 50%)`
        }}
        aria-hidden
      />
    </>
  );
}
