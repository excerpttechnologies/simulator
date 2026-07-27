'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './use-reduced-motion';

const POINTS = [20, 35, 28, 52, 45, 68, 58, 82, 75, 95];
const W = 320;
const H = 120;
const PAD = 8;

function toPath(values: number[]) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const step = (W - PAD * 2) / (values.length - 1);

  const coords = values.map((v, i) => {
    const x = PAD + i * step;
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return { x, y };
  });

  const line = coords.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${line} L ${coords[coords.length - 1].x} ${H} L ${coords[0].x} ${H} Z`;
  const peak = coords[coords.length - 1];

  return { line, area, peak };
}

export function AnimatedLineChart({ label = 'Monthly Compliance Score' }: { label?: string }) {
  const reduced = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const [started, setStarted] = useState(reduced);
  const { line, area, peak } = toPath(POINTS);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setStarted(true);
          obs.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduced]);

  return (
    <div className="relative">
      <p className="text-[10px] font-medium text-[var(--widget-text)]/60 mb-2">{label}</p>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} className="w-full h-[120px]" aria-hidden>
        <defs>
          <linearGradient id="chartStroke" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-cyan)" />
            <stop offset="45%" stopColor="var(--accent-blue)" />
            <stop offset="100%" stopColor="var(--accent-violet)" />
          </linearGradient>
          <linearGradient id="chartFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--accent-violet)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path
          d={area}
          fill="url(#chartFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: started ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        />
        <motion.path
          d={line}
          fill="none"
          stroke="url(#chartStroke)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: started ? 1 : 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />
        {started && (
          <motion.circle
            cx={peak.x}
            cy={peak.y}
            r="5"
            fill="var(--accent-cyan)"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1], scale: [0.5, 1.2, 1] }}
            transition={{ duration: 0.4, delay: 1.4 }}
            style={{ filter: 'drop-shadow(0 0 6px var(--accent-cyan))' }}
          />
        )}
      </svg>
      {started && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.3 }}
          className="absolute top-6 right-2 rounded-full bg-[var(--widget-text)] text-white text-[9px] font-semibold px-2 py-0.5"
          style={{ left: `${((peak.x / W) * 100) - 8}%` }}
        >
          95%
        </motion.div>
      )}
    </div>
  );
}
