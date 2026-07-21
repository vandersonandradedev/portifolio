'use client';

import { motion } from 'motion/react';
import type { Profile } from '@/lib/types';
import { SectionTitle } from '@/components/ui/SectionTitle';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { fadeUp, staggerContainer } from '@/lib/motion/variants';

export function Contact({ profile }: { profile: Profile }) {
  return (
    <section id="contact" className="relative z-10 mx-auto max-w-6xl px-6 py-24 pb-32">
      <SectionTitle number="05.">Contato</SectionTitle>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid gap-5 md:grid-cols-2"
      >
        <motion.div variants={fadeUp}>
          <GlassCard>
            <p className="mb-4 text-muted">
              Aberto a oportunidades, colaborações e projetos. Entre no canal.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button href={`mailto:${profile.email}`}>Email</Button>
              <Button href={profile.social.whatsapp} variant="ghost">
                WhatsApp
              </Button>
              <Button href={profile.social.github} variant="ghost">
                GitHub
              </Button>
            </div>
          </GlassCard>
        </motion.div>
        <motion.div variants={fadeUp}>
          <GlassCard className="font-mono text-sm text-muted">
            <p className="mb-2 text-axion/80">channel.open()</p>
            <p>{profile.email}</p>
            <p className="mt-2">{profile.location}</p>
            <p className="mt-4 text-[11px] uppercase tracking-wider text-axion/50">
              Status · ONLINE
            </p>
          </GlassCard>
        </motion.div>
      </motion.div>
    </section>
  );
}
