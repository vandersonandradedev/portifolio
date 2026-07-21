'use client';

import { motion } from 'motion/react';
import type { Profile } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { fadeUp, staggerContainer } from '@/lib/motion/variants';

export function Hero({ profile }: { profile: Profile }) {
  return (
    <section id="home" className="relative flex min-h-screen items-center justify-center px-6 py-28">
      <motion.div
        className="relative z-10 mx-auto max-w-2xl text-center"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.p variants={fadeUp} className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-axion">
          // {profile.location}
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="text-gradient mb-4 font-display text-4xl font-bold leading-tight tracking-tight md:text-6xl"
        >
          {profile.name}
        </motion.h1>
        <motion.h2 variants={fadeUp} className="mb-5 text-xl text-muted md:text-2xl">
          {profile.title}
        </motion.h2>
        <motion.p variants={fadeUp} className="mx-auto mb-8 max-w-xl text-base leading-relaxed text-muted md:text-lg">
          {profile.tagline}
        </motion.p>
        <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-3">
          <Button href="#projects">Ver Projetos</Button>
          <Button href="#contact" variant="ghost">
            Entrar em Contato
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
