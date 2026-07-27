'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from './use-reduced-motion';
import { CountUp } from './count-up';

export function CircularGauge({
  value,
  label,
  size = 140,
}: {
  value: number;
  label: string;
  size?: number;
}) {
  const reduced = useReducedMotion();
  const ref = useRef<SVGSVGElement>(null);
  const [started, setStarted] = useState(reduced);
  const r = (size - 16) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (value / 100) * circumference;
  const angle = (value / 100) * 2 * Math.PI - Math.PI / 2;
  const knobX = cx + r * Math.cos(angle);
  const knobY = cy + r * Math.sin(angle);

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
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduced]);

  return (
    <div className="flex flex-col items-center">
      <svg ref={ref} width={size} height={size} aria-hidden>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <motion.circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="url(#gaugeGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: started ? offset : circumference }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="var(--accent-cyan)" />
            <stop offset="100%" stopColor="var(--accent-violet)" />
          </linearGradient>
        </defs>
        <motion.circle
          cx={knobX}
          cy={knobY}
          r="7"
          fill="white"
          stroke="var(--accent-blue)"
          strokeWidth="2"
          initial={{ opacity: 0 }}
          animate={{ opacity: started ? 1 : 0 }}
          transition={{ delay: 1, duration: 0.3 }}
        />
      </svg>
      <p className="text-2xl font-bold text-[var(--text-primary)] -mt-[88px] mb-12">
        <CountUp value={value} suffix="%" duration={1200} />
      </p>
      <p className="text-xs text-[var(--text-muted)] text-center">{label}</p>
    </div>
  );
}
