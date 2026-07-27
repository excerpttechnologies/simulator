'use client';

import { motion } from 'framer-motion';
import { Check, ArrowRight, Play } from 'lucide-react';
import { GradientHighlight } from './ui/gradient-highlight';
import { GlassCard } from './ui/glass-card';
import { AnimatedLineChart } from './ui/animated-line-chart';
import { CountUp } from './ui/count-up';
import { CircularGauge } from './ui/circular-gauge';
import { PrimaryButton, SecondaryButton } from './ui/buttons';
import { SquigglyArrow } from './ui/squiggly-arrow';
import { useReducedMotion } from './ui/use-reduced-motion';

const FEATURES = [
  'Real-Time Simulations',
  'Government Portal Experience',
  'Industry-Oriented Learning',
  'Trainer Friendly Environment',
  'Institution Focused Solution',
];

const DASHBOARD_TABS = ['GST', 'TDS', 'Income Tax', 'Payroll', 'UAE VAT', 'Analytics'];

function FloatCard({
  children,
  className,
  delay,
  index,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
  index: number;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, type: 'spring', stiffness: 120, damping: 18 }}
      className={className}
    >
      <motion.div
        animate={reduced ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 4 + index * 0.5, repeat: Infinity, ease: 'easeInOut', delay: index * 0.3 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function HeroFeatureCards() {
  return (
    <div className="relative z-20 -mt-8 lg:-mt-16 grid md:grid-cols-3 gap-4 lg:gap-6 max-w-6xl mx-auto px-2">
      <FloatCard delay={0.9} index={0} className="md:mt-8">
        <GlassCard hover className="p-5 h-full">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--accent-gradient)] flex items-center justify-center text-xs font-bold text-[#05060B] shrink-0">
              A
            </div>
            <div className="space-y-2">
              <div className="rounded-2xl rounded-tl-sm bg-[var(--bg-elevated)] border border-[var(--glass-border)] px-3 py-2 text-xs text-[var(--text-muted)]">
                {FEATURES[2]}
              </div>
              <div className="rounded-2xl rounded-tr-sm bg-[var(--accent-gradient)] px-3 py-2 text-xs font-medium text-[#05060B] ml-4">
                {FEATURES[0]}
              </div>
              <p className="text-[10px] text-[var(--text-faint)] pt-1">{FEATURES[1]}</p>
            </div>
          </div>
        </GlassCard>
      </FloatCard>

      <FloatCard delay={1.0} index={1} className="md:-mt-4">
        <GlassCard hover className="p-6 h-full scale-[1.02] lg:scale-105 shadow-[0_28px_80px_rgba(0,0,0,0.55)]">
          <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-4">Platform Overview</p>
          <div className="flex items-center justify-center mb-5">
            {['RK', 'PS', 'AM', 'SR'].map((initial, i) => (
              <div
                key={initial}
                className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)] ${
                  i === 1
                    ? 'bg-[var(--accent-gradient)] text-[#05060B] border-white z-10 scale-110'
                    : 'bg-[var(--bg-elevated)] border-[var(--glass-border)]'
                } ${i > 0 ? '-ml-3' : ''}`}
              >
                {initial}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-pink-500/10 border border-pink-400/20 p-3 text-center">
              <p className="text-lg font-bold text-[var(--text-primary)]">
                <CountUp value={10000} suffix="+" duration={1200} />
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">Students Trained</p>
            </div>
            <div className="rounded-xl bg-emerald-500/10 border border-emerald-400/20 p-3 text-center">
              <p className="text-lg font-bold text-[var(--text-primary)]">
                <CountUp value={500} suffix="+" duration={1200} />
              </p>
              <p className="text-[10px] text-[var(--text-muted)]">Partner Institutions</p>
            </div>
          </div>
        </GlassCard>
      </FloatCard>

      <FloatCard delay={1.1} index={2} className="md:mt-8">
        <GlassCard hover className="p-5 h-full flex items-center justify-center">
          <CircularGauge value={99} label="Client Satisfaction" size={130} />
        </GlassCard>
      </FloatCard>
    </div>
  );
}

function DashboardComposition() {
  return (
    <div className="relative w-full max-w-4xl mx-auto mt-12 min-h-[340px]">
      <FloatCard delay={0.5} index={0} className="relative z-10 mx-auto max-w-lg">
        <GlassCard widget className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] text-[var(--widget-text)]/60">GST Simulation Dashboard</p>
              <p className="text-sm font-bold">GSTR-3B Filing</p>
            </div>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700">
              Live Simulation
            </span>
          </div>
          <div className="flex gap-1 mb-3 overflow-x-auto">
            {DASHBOARD_TABS.map((tab, i) => (
              <span
                key={tab}
                className={`text-[9px] font-medium px-2 py-0.5 rounded-md whitespace-nowrap ${
                  i === 0 ? 'bg-[var(--accent-blue)] text-white' : 'text-[var(--widget-text)]/50'
                }`}
              >
                {tab}
              </span>
            ))}
          </div>
          <AnimatedLineChart label="Monthly Compliance Score" />
        </GlassCard>
      </FloatCard>

      <FloatCard delay={0.58} index={1} className="absolute top-0 left-0 w-[160px] hidden sm:block">
        <GlassCard widget className="p-3">
          <p className="text-2xl font-bold">
            <CountUp value={99} suffix="%" duration={1200} />
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-black/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-[var(--accent-gradient)]"
              initial={{ width: 0 }}
              whileInView={{ width: '99%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[9px] text-[var(--widget-text)]/60 mt-1.5">Client Satisfaction</p>
        </GlassCard>
      </FloatCard>

      <FloatCard delay={0.66} index={2} className="absolute top-[38%] left-0 w-[150px] hidden md:block">
        <GlassCard widget className="p-3">
          <p className="text-[9px] text-[var(--widget-text)]/60 mb-2">Monthly Compliance Score</p>
          <div className="flex items-end gap-1 h-10">
            {[40, 65, 55, 80, 70].map((h, i) => (
              <motion.div
                key={i}
                className="flex-1 rounded-sm bg-[var(--accent-blue)]"
                initial={{ height: 0 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + i * 0.06, duration: 0.4 }}
              />
            ))}
          </div>
        </GlassCard>
      </FloatCard>

      <FloatCard delay={0.62} index={3} className="absolute top-0 right-0 w-[155px] hidden sm:block">
        <GlassCard widget className="p-3">
          <p className="text-[9px] text-[var(--widget-text)]/60">Partner Institutions</p>
          <p className="text-xl font-bold mt-1">
            <CountUp value={500} suffix="+" duration={1200} />
          </p>
          <svg viewBox="0 0 80 24" className="w-full h-6 mt-1" aria-hidden>
            <motion.polyline
              points="0,20 15,16 30,18 45,10 60,12 80,4"
              fill="none"
              stroke="var(--accent-violet)"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2 }}
            />
          </svg>
        </GlassCard>
      </FloatCard>

      <FloatCard delay={0.7} index={4} className="absolute top-[40%] right-0 w-[165px] hidden md:block">
        <GlassCard widget className="p-3">
          <p className="text-[9px] text-[var(--widget-text)]/60">Students Trained</p>
          <p className="text-xl font-bold mt-1">
            <CountUp value={10000} suffix="+" duration={1200} />
          </p>
          <p className="text-[9px] text-emerald-600 mt-1 font-medium">Total students</p>
        </GlassCard>
      </FloatCard>
    </div>
  );
}

export function Hero() {
  const reduced = useReducedMotion();

  return (
    <section id="hero" className="relative min-h-screen pt-[72px] overflow-hidden landing-section">
      <motion.div
        className="relative max-w-7xl mx-auto px-5 lg:px-8 pt-0 pb-16 lg:pt-1 lg:pb-20 -mt-8 lg:-mt-10"
        initial={reduced ? false : { scale: 1.06, opacity: 0.9 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        <div className="text-center max-w-4xl mx-auto rounded-3xl px-4 py-2 sm:px-6 sm:py-4 bg-white/25 backdrop-blur-[2px]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--glass-border)] bg-[var(--bg-glass)] backdrop-blur-sm px-4 py-1.5 mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse" />
            <span className="text-xs font-semibold text-[var(--accent-cyan)]">
              India&apos;s Most Advanced Tax Simulation Platform
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="font-heading text-[clamp(2.5rem,6vw,5rem)] font-extrabold leading-[1.05] tracking-tight text-[var(--text-primary)] drop-shadow-[0_2px_12px_rgba(255,255,255,0.85)]"
          >
            Learn Taxation by <GradientHighlight>Doing</GradientHighlight>, Not Just Reading
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-5 text-lg text-[var(--text-muted)] leading-relaxed max-w-[640px] mx-auto"
          >
            Provide your students with practical GST, TDS, Income Tax, EPFO, UAE VAT and
            Accounting training using realistic simulations that mirror actual government
            portals and business workflows.
          </motion.p>

          <motion.ul
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2"
          >
            {FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/15">
                  <Check size={12} className="text-emerald-400" strokeWidth={3} />
                </span>
                {f}
              </li>
            ))}
          </motion.ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.38 }}
            className="mt-8 flex flex-wrap justify-center items-center gap-3"
          >
            <PrimaryButton href="#contact">
              Request Live Demo
              <ArrowRight size={16} />
            </PrimaryButton>
            <SecondaryButton href="#demo">
              <Play size={16} />
              Explore Platform
            </SecondaryButton>
            <SquigglyArrow className="hidden lg:block ml-2" />
          </motion.div>
        </div>

        <DashboardComposition />
        <HeroFeatureCards />
      </motion.div>
    </section>
  );
}
