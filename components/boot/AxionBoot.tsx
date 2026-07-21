'use client';

import { useEffect, useRef, useState } from 'react';

const BOOT_KEY = 'axion_boot_seen';

type Props = {
  onComplete: () => void;
};

export function AxionBoot({ onComplete }: Props) {
  const [stage, setStage] = useState('INITIALIZING...');
  const [progress, setProgress] = useState(0);
  const [showModules, setShowModules] = useState(false);
  const [welcome, setWelcome] = useState(false);
  const [hidden, setHidden] = useState(false);
  const closed = useRef(false);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      finish();
      return;
    }

    const seen = sessionStorage.getItem(BOOT_KEY) === '1';
    let cancelled = false;

    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const run = async () => {
      const stages = seen
        ? [{ text: 'Restoring session...', progress: 100, wait: 400 }]
        : [
            { text: 'Loading AI Core...', progress: 18, wait: 450 },
            { text: 'Neural Engine...', progress: 45, wait: 500 },
            { text: 'Scanning modules...', progress: 72, wait: 450 },
            { text: 'AI Modules Loaded', progress: 100, wait: 350 }
          ];

      for (const s of stages) {
        if (cancelled || closed.current) return;
        setStage(s.text);
        setProgress(s.progress);
        await wait(s.wait);
      }

      if (cancelled || closed.current) return;

      if (!seen) {
        setShowModules(true);
        await wait(650);
      }

      if (cancelled || closed.current) return;
      setWelcome(true);
      setStage('Welcome, Visitor.');
      await wait(seen ? 350 : 800);
      if (!cancelled && !closed.current) finish();
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = () => {
    if (closed.current) return;
    closed.current = true;
    try {
      sessionStorage.setItem(BOOT_KEY, '1');
    } catch {
      // ignore
    }
    setHidden(true);
    setTimeout(onComplete, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center transition-all duration-700 ${
        hidden ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      aria-live="polite"
    >
      <div className="absolute inset-0 bg-[#03070a]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_45%,rgba(20,70,80,0.4),transparent_70%)]" />
      </div>

      <button
        type="button"
        onClick={finish}
        className="absolute right-6 top-6 z-10 border border-axion/30 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-axion/70 hover:border-axion hover:text-axion"
      >
        Skip
      </button>

      <div className="relative z-10 w-[min(420px,90vw)] px-2 font-mono text-axion">
        <p className="mb-6 text-[11px] tracking-[0.35em] text-axion/60">AXION SYSTEMS</p>
        <p className="mb-4 min-h-[1.4em] text-sm tracking-wide">{stage}</p>
        <div className="mb-2 h-[3px] overflow-hidden rounded-sm bg-axion/10">
          <div
            className="h-full bg-gradient-to-r from-axion-bright to-axion shadow-[0_0_12px_rgba(94,234,212,0.35)] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mb-5 text-[11px] text-axion/50">{progress}%</p>

        <ul
          className={`mb-5 grid gap-1.5 text-xs transition-all duration-400 ${
            showModules ? 'translate-y-0 opacity-80' : 'translate-y-2 opacity-0'
          }`}
        >
          <li>✓ Front-end</li>
          <li>✓ Back-end</li>
          <li>✓ DevOps</li>
          <li>✓ Cloud</li>
          <li>✓ AI Integration</li>
        </ul>

        <p
          className={`text-base tracking-wider transition-all duration-500 ${
            welcome ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
          }`}
        >
          Welcome, Visitor.
        </p>
      </div>
    </div>
  );
}
