'use client';

import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { GlassCard } from './ui/glass-card';
import { CountUp } from './ui/count-up';
import { RevealOnScroll } from './ui/reveal-on-scroll';

const TRADITIONAL = [
  'Theory-heavy classroom lectures',
  'Outdated study materials',
  'No portal practice experience',
  'Limited job placement support',
  'Passive learning approach',
];

const ACCOUNTIN = [
  'Hands-on simulation-based learning',
  'Real-time compliance updates',
  'Government portal replicas',
  'Industry-ready skill development',
  'Active practical engagement',
];

const ADVANTAGES = [
  { label: 'Better Retention', value: 3.2, suffix: 'x', decimals: 1 },
  { label: 'Practical Exposure', value: 100, suffix: '%', decimals: 0 },
  { label: 'Job Readiness', value: 94, suffix: '%', decimals: 0 },
  { label: 'Faster Placement', value: 2, suffix: 'x', decimals: 0 },
];

export function IndustryReadiness() {
  return (
    <section className="py-24 landing-section">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <RevealOnScroll className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-white">
            Transform Students Into Industry-Ready Professionals
          </h2>
          <p className="mt-4 text-[var(--text-muted)]">
            See how simulation-based learning outperforms traditional training methods.
          </p>
        </RevealOnScroll>

        <div className="grid lg:grid-cols-2 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-8 h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <X size={20} className="text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-muted)]">Traditional Training</h3>
              </div>
              <ul className="space-y-3">
                {TRADITIONAL.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[var(--text-faint)]">
                    <X size={16} className="text-red-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-8 h-full border-[var(--accent-blue)]/30 bg-gradient-to-br from-[rgba(70,200,232,0.08)] to-[rgba(166,107,255,0.08)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--accent-gradient)] flex items-center justify-center">
                  <Check size={20} className="text-[#05060B]" />
                </div>
                <h3 className="text-xl font-bold text-white">AccountIn Simulation Learning</h3>
              </div>
              <ul className="space-y-3">
                {ACCOUNTIN.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-[var(--text-muted)]">
                    <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassCard>
          </motion.div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {ADVANTAGES.map((adv, i) => (
            <RevealOnScroll key={adv.label} delay={i * 0.08}>
              <GlassCard hover className="text-center p-6">
                <p className="text-3xl font-bold bg-[var(--accent-gradient)] bg-clip-text text-transparent">
                  <CountUp value={adv.value} suffix={adv.suffix} decimals={adv.decimals} duration={1200} />
                </p>
                <p className="mt-1 text-sm text-[var(--text-muted)] font-medium">{adv.label}</p>
              </GlassCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
