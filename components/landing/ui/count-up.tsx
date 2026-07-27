'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '@/components/landing/ui/use-reduced-motion';
import { AnimatedCounter } from '../motion';

type CountUpProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
};

export function CountUp({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 1200,
  className,
}: CountUpProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <span className={className}>
        {prefix}
        {decimals > 0 ? value.toFixed(decimals) : value.toLocaleString('en-IN')}
        {suffix}
      </span>
    );
  }

  if (decimals > 0) {
    return <DecimalCountUp value={value} suffix={suffix} prefix={prefix} decimals={decimals} duration={duration} className={className} />;
  }

  return (
    <span className={className}>
      <AnimatedCounter value={value} suffix={suffix} prefix={prefix} duration={duration} />
    </span>
  );
}

function DecimalCountUp({
  value,
  suffix,
  prefix,
  decimals,
  duration = 1200,
  className,
}: CountUpProps & { decimals: number }) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(reduced ? value : 0);
  const ref = useRef<HTMLSpanElement>(null);
  const [started, setStarted] = useState(reduced);

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
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [reduced]);

  useEffect(() => {
    if (!started || reduced) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Number((eased * value).toFixed(decimals)));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, value, duration, decimals, reduced]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
}
