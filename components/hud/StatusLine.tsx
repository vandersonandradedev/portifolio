'use client';

import { useEffect, useState } from 'react';

const THOUGHTS: Record<string, string[]> = {
  home: ['Core idle', 'Systems nominal', 'Awaiting input'],
  about: ['Reading profile...', 'Mapping experience...', 'Profile loaded'],
  projects: ['Scanning projects...', 'Analyzing stack...', 'Rendering grid...'],
  skills: ['Indexing skills...', 'Correlating languages...', 'Skills synced'],
  experience: ['Loading timeline...', 'Parsing history...', 'Timeline ready'],
  contact: ['Opening channel...', 'Ready to connect', 'Contact online']
};

export function StatusLine() {
  const [text, setText] = useState('Status · ONLINE');

  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    if (!sections.length) return;

    let timer: ReturnType<typeof setTimeout>;

    const think = (sequence: string[]) => {
      clearTimeout(timer);
      let i = 0;
      const tick = () => {
        setText(sequence[i]);
        i += 1;
        if (i < sequence.length) {
          timer = setTimeout(tick, 420);
        } else {
          timer = setTimeout(() => setText('Status · ONLINE'), 1600);
        }
      };
      tick();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          const thoughts = THOUGHTS[id];
          if (thoughts) think(thoughts);
        });
      },
      { threshold: 0.35 }
    );

    sections.forEach((s) => observer.observe(s));
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed bottom-3 left-1/2 z-30 max-w-[90vw] -translate-x-1/2 truncate font-mono text-[10px] uppercase tracking-[0.18em] text-axion/40 md:bottom-4 md:text-[11px]"
      aria-live="polite"
    >
      {text}
    </div>
  );
}
