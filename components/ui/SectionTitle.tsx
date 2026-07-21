'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { fadeUp } from '@/lib/motion/variants';

type Props = {
  number?: string;
  children: ReactNode;
  id?: string;
};

export function SectionTitle({ number, children, id }: Props) {
  return (
    <motion.h2
      id={id}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.4 }}
      className="mb-10 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl"
    >
      {number ? (
        <span className="mr-3 font-mono text-sm text-axion/70">{number}</span>
      ) : null}
      {children}
    </motion.h2>
  );
}
