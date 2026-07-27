'use client';

import { motion } from 'framer-motion';
import { useReducedMotion } from './use-reduced-motion';

export function BackgroundGlow() {
  const reduced = useReducedMotion();

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      <motion.div
        className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-60"
        style={{
          background: 'radial-gradient(circle, var(--glow-teal) 0%, transparent 70%)',
        }}
        animate={reduced ? undefined : { x: ['-2%', '2%', '-2%'], y: ['-1%', '1%', '-1%'] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -right-[10%] bottom-[5%] w-[600px] h-[600px] rounded-full opacity-50"
        style={{
          background: 'radial-gradient(circle, var(--glow-violet) 0%, transparent 70%)',
        }}
        animate={reduced ? undefined : { x: ['0%', '-3%', '0%'], y: ['0%', '2%', '0%'] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
      <motion.div
        className="absolute right-[20%] top-[40%] w-[400px] h-[400px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, var(--glow-violet) 0%, transparent 70%)',
        }}
        animate={reduced ? undefined : { x: ['0%', '2%', '0%'] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
      />
      <div className="absolute inset-0 noise-overlay opacity-[0.04]" />
    </div>
  );
}
