'use client';

import { motion } from 'motion/react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'ghost';
};

export function Button({
  children,
  className = '',
  href,
  onClick,
  type = 'button',
  variant = 'primary'
}: Props) {
  const base =
    'inline-flex items-center justify-center rounded-sm px-5 py-2.5 text-sm font-medium tracking-wide transition-colors';
  const styles =
    variant === 'primary'
      ? 'border border-axion text-axion hover:bg-axion/10 shadow-[0_0_24px_rgba(94,234,212,0.12)]'
      : 'border border-white/10 text-ink/80 hover:border-axion/40 hover:text-axion';

  const content = (
    <motion.span whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} className="inline-flex">
      {children}
    </motion.span>
  );

  if (href) {
    return (
      <a href={href} className={`${base} ${styles} ${className}`}>
        {content}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={`${base} ${styles} ${className}`}>
      {content}
    </button>
  );
}
