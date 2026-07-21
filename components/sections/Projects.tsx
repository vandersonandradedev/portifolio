'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import type { Project } from '@/lib/types';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import {
  applyStatsToProjects,
  fetchAllStats,
  hasLikedLocally,
  recordLike,
  recordView
} from '@/lib/sync/stats';

type Props = {
  initialProjects: Project[];
};

export function Projects({ initialProjects }: Props) {
  const [projects, setProjects] = useState(initialProjects);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState<Project | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanLabel, setScanLabel] = useState('Scanning...');
  const [scanProgress, setScanProgress] = useState(0);

  useEffect(() => {
    fetchAllStats().then((remote) => {
      setProjects((prev) => applyStatsToProjects(prev, remote));
    });
  }, []);

  const filtered =
    filter === 'all'
      ? projects
      : projects.filter((p) => p.category === filter);

  const openProject = useCallback(async (project: Project) => {
    setScanning(true);
    setScanLabel('Scanning...');
    setScanProgress(12);
    const steps = [
      { text: 'Scanning...', width: 22 },
      { text: 'Loading...', width: 48 },
      { text: 'Analyzing...', width: 72 },
      { text: 'Rendering...', width: 90 },
      { text: 'ACCESS GRANTED', width: 100 }
    ];
    for (const step of steps) {
      setScanLabel(step.text);
      setScanProgress(step.width);
      await new Promise((r) => setTimeout(r, 150));
    }
    await new Promise((r) => setTimeout(r, 180));
    setScanning(false);
    setScanProgress(0);

    const result = await recordView(project.slug);
    if (result) {
      setProjects((prev) =>
        prev.map((p) =>
          p.slug === project.slug
            ? { ...p, views: result.views, likes: result.likes ?? p.likes }
            : p
        )
      );
    }
    setSelected({ ...project, views: result?.views ?? project.views });
  }, []);

  const onLike = async (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasLikedLocally(slug)) return;
    const result = await recordLike(slug);
    if (!result) return;
    setProjects((prev) =>
      prev.map((p) =>
        p.slug === slug ? { ...p, likes: result.likes, views: result.views ?? p.views } : p
      )
    );
  };

  return (
    <section id="projects" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
      <SectionTitle number="02.">Projetos</SectionTitle>

      <div className="mb-8 flex flex-wrap gap-2">
        {['all', 'web', 'dashboard', 'landing'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-sm border px-3 py-1.5 font-mono text-xs uppercase tracking-wider transition ${
              filter === f
                ? 'border-axion text-axion'
                : 'border-white/10 text-muted hover:border-axion/40'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project) => (
          <GlassCard
            key={project.slug}
            className="cursor-pointer overflow-hidden p-0"
            onClick={() => openProject(project)}
          >
            <div
              className="relative h-40 w-full"
              style={{
                background:
                  project.imageSource === 'vercel' && project.image
                    ? `center/cover url(${project.image})`
                    : project.imageGradient || undefined
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#03070a] via-transparent to-transparent" />
            </div>
            <div className="p-4">
              <h3 className="mb-2 font-display text-lg font-semibold">{project.title}</h3>
              <p className="mb-3 line-clamp-2 text-sm text-muted">{project.description}</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {project.technologies.slice(0, 4).map((tech) => (
                  <span
                    key={tech}
                    className="rounded-sm border border-axion/20 px-2 py-0.5 font-mono text-[10px] text-axion/80"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted">
                <span>
                  ♥ {project.likes} · 👁 {project.views}
                </span>
                <button
                  type="button"
                  className="border border-axion/30 px-2 py-1 text-axion hover:bg-axion/10"
                  onClick={(e) => onLike(project.slug, e)}
                  disabled={hasLikedLocally(project.slug)}
                >
                  {hasLikedLocally(project.slug) ? 'Curtido' : 'Curtir'}
                </button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <AnimatePresence>
        {scanning ? (
          <motion.div
            className="fixed inset-0 z-[90] flex items-center justify-center bg-[#03070a]/70 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="glass w-[min(360px,88vw)] p-6 font-mono text-axion">
              <p className="mb-3 text-[11px] tracking-[0.3em] text-axion/55">AXION</p>
              <p className="mb-2 text-sm text-ink">Project access</p>
              <p className="mb-3 text-xs tracking-wider">{scanLabel}</p>
              <div className="h-1 overflow-hidden bg-axion/10">
                <div
                  className="h-full bg-axion transition-[width] duration-150"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {selected ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              className="glass max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-md p-6"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 160, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="project-modal-title"
            >
              <button
                type="button"
                className="mb-4 ml-auto block text-muted hover:text-axion"
                onClick={() => setSelected(null)}
                aria-label="Fechar"
              >
                ×
              </button>
              <h3 id="project-modal-title" className="mb-3 font-display text-2xl font-semibold">
                {selected.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted">
                {selected.longDescription}
              </p>
              <div className="mb-5 flex flex-wrap gap-2">
                {selected.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="rounded-sm border border-axion/20 px-2 py-1 font-mono text-[11px] text-axion"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {selected.liveUrl ? (
                  <Button href={selected.liveUrl}>Ver Projeto</Button>
                ) : null}
                <Button href={selected.githubUrl} variant="ghost">
                  Ver Código
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
