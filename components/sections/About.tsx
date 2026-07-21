'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import type { Profile } from '@/lib/types';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { GlassCard } from '@/components/ui/GlassCard';
import { fadeUp, staggerContainer } from '@/lib/motion/variants';

type Props = {
  profile: Profile;
  projectCount: number;
  repoCount: number;
};

export function About({ profile, projectCount, repoCount }: Props) {
  const paragraphs = profile.bio.split('\n\n');

  return (
    <section id="about" className="relative z-10 mx-auto max-w-6xl px-6 py-24">
      <SectionTitle number="01.">Sobre Mim</SectionTitle>
      <div className="grid items-start gap-10 md:grid-cols-[240px_1fr]">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative mx-auto aspect-square w-48 overflow-hidden rounded-md border border-axion/20 md:w-full"
        >
          <Image
            src="/assets/images/profile.png"
            alt={profile.name}
            fill
            className="object-cover"
            sizes="240px"
            priority={false}
          />
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {paragraphs.map((p) => (
            <motion.p key={p.slice(0, 24)} variants={fadeUp} className="mb-4 leading-relaxed text-muted">
              {p}
            </motion.p>
          ))}

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { label: 'Projetos', value: String(projectCount) },
              { label: 'Repositórios', value: String(repoCount) },
              { label: 'Anos', value: `${profile.stats.experience}+` }
            ].map((stat) => (
              <GlassCard key={stat.label} className="text-center">
                <p className="font-display text-2xl font-semibold text-axion">{stat.value}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted">
                  {stat.label}
                </p>
              </GlassCard>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
