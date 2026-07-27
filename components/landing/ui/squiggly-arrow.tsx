'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from './use-reduced-motion';

export function SquigglyArrow({ className }: { className?: string }) {
  const reduced = useReducedMotion();

  return (
    <svg
      width="48"
      height="64"
      viewBox="0 0 48 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <motion.path
        d="M24 4 C28 16, 16 24, 24 36 C32 48, 20 52, 24 60"
        stroke="var(--accent-cyan)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        initial={{ pathLength: reduced ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: reduced ? 0 : 1, delay: 0.6, ease: 'easeOut' }}
      />
      <motion.path
        d="M18 54 L24 60 L30 54"
        stroke="var(--accent-cyan)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ opacity: reduced ? 1 : 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: reduced ? 0 : 1.2 }}
      />
    </svg>
  );
}
