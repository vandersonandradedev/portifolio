'use client';

import { motion } from 'motion/react';
import type { CSSProperties, ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  style?: CSSProperties;
};

export function GlassCard({ children, className = '', onClick, style }: Props) {
  return (
    <motion.div
      className={`glass rounded-md p-5 transition-shadow ${className}`}
      style={style}
      onClick={onClick}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      onMouseMove={(e) => {
        const el = e.currentTarget;
        const rect = el.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(900px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-3px)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
      }}
    >
      {children}
    </motion.div>
  );
}
