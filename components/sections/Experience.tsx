'use client';

import { motion } from 'motion/react';
import type { ExperienceItem } from '@/lib/types';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { fadeUp, staggerContainer } from '@/lib/motion/variants';

export function Experience({ items }: { items: ExperienceItem[] }) {
  return (
    <section id="experience" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
      <SectionTitle number="04.">Experiência</SectionTitle>
      <motion.ol
        className="relative space-y-6 border-l border-axion/20 pl-6"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {items.map((item) => (
          <motion.li key={item.id} variants={fadeUp} className="relative">
            <span className="absolute -left-[1.7rem] top-1.5 h-2.5 w-2.5 rounded-full bg-axion shadow-[0_0_12px_rgba(94,234,212,0.6)]" />
            <p className="font-mono text-[11px] uppercase tracking-wider text-axion/70">
              {item.period} · {item.type}
            </p>
            <h3 className="mt-1 font-display text-xl font-semibold">{item.title}</h3>
            <p className="text-sm text-muted">{item.company}</p>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
              {item.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {item.technologies.map((tech) => (
                <span
                  key={tech}
                  className="rounded-sm border border-white/10 px-2 py-0.5 font-mono text-[10px] text-muted"
                >
                  {tech}
                </span>
              ))}
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </section>
  );
}
