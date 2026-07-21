'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import type { ExperienceItem, Profile, Project, SkillCategory } from '@/lib/types';
import { AxionBoot } from '@/components/boot/AxionBoot';
import { Header } from '@/components/sections/Header';
import { Hero } from '@/components/sections/Hero';
import { About } from '@/components/sections/About';
import { Projects } from '@/components/sections/Projects';
import { Stack } from '@/components/sections/Stack';
import { Experience } from '@/components/sections/Experience';
import { Contact } from '@/components/sections/Contact';
import { StatusLine } from '@/components/hud/StatusLine';
import { CursorGlow } from '@/components/hud/CursorGlow';
import { LenisProvider } from '@/components/providers/LenisProvider';

const SceneCanvas = dynamic(() => import('@/components/scene/SceneCanvas'), {
  ssr: false,
  loading: () => null
});

type Props = {
  profile: Profile;
  projects: Project[];
  repoCount: number;
  skillCategories: SkillCategory[];
  experience: ExperienceItem[];
};

export function PortfolioApp({
  profile,
  projects,
  repoCount,
  skillCategories,
  experience
}: Props) {
  const [ready, setReady] = useState(false);

  return (
    <LenisProvider>
      <AxionBoot onComplete={() => setReady(true)} />
      <div className={`axion-gradient min-h-screen transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-40'}`}>
        <div className="pointer-events-none fixed inset-0 z-0">
          <SceneCanvas ambient={ready} />
        </div>

        <div className="pointer-events-none fixed inset-0 z-[1]">
          <div className="absolute left-3 top-3 h-7 w-7 border-l border-t border-axion/25" />
          <div className="absolute right-3 top-3 h-7 w-7 border-r border-t border-axion/25" />
          <div className="absolute bottom-3 left-3 h-7 w-7 border-b border-l border-axion/25" />
          <div className="absolute bottom-3 right-3 h-7 w-7 border-b border-r border-axion/25" />
        </div>

        <CursorGlow />
        <Header />
        <main className="relative z-10">
          <Hero profile={profile} />
          <About profile={profile} projectCount={projects.length} repoCount={repoCount} />
          <Projects initialProjects={projects} />
          <Stack categories={skillCategories} />
          <Experience items={experience} />
          <Contact profile={profile} />
        </main>
        <StatusLine />
        <footer className="relative z-10 border-t border-axion/10 py-8 text-center font-mono text-[11px] text-muted">
          AXION SYSTEMS · {profile.name}
        </footer>
      </div>
    </LenisProvider>
  );
}
