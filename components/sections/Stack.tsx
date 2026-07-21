'use client';

import { motion } from 'motion/react';
import type { SkillCategory } from '@/lib/types';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { GlassCard } from '@/components/ui/GlassCard';
import { fadeUp, staggerContainer } from '@/lib/motion/variants';

export function Stack({ categories }: { categories: SkillCategory[] }) {
  return (
    <section id="skills" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
      <SectionTitle number="03.">Stack</SectionTitle>
      <motion.div
        className="grid gap-5 md:grid-cols-2"
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
      >
        {categories.map((category) => (
          <motion.div key={category.id} variants={fadeUp}>
            <GlassCard>
              <h3 className="mb-4 font-display text-lg font-semibold">
                <span className="mr-2">{category.icon}</span>
                {category.title}
              </h3>
              <ul className="space-y-3">
                {category.skills.slice(0, 8).map((skill) => (
                  <li key={skill.name} className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-ink">{skill.name}</p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-axion/70">
                        {skill.auto ? 'Online' : 'Ready'}
                      </p>
                    </div>
                    <div className="w-24">
                      <div className="mb-1 h-1 overflow-hidden rounded-full bg-white/5">
                        <div
                          className="h-full bg-axion/80"
                          style={{ width: `${skill.percentage}%` }}
                        />
                      </div>
                      <p className="text-right font-mono text-[10px] text-muted">
                        {skill.percentage}%
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
