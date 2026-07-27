'use client';

import { motion } from 'framer-motion';
import {
  Target, Monitor, Building, Shield, RefreshCw, Headphones,
} from 'lucide-react';
import { GlassCard } from './ui/glass-card';
import { RevealOnScroll } from './ui/reveal-on-scroll';

const REASONS = [
  {
    icon: Target,
    title: '100% Practical Learning',
    description: 'Students gain hands-on experience with real-world tax and accounting scenarios.',
  },
  {
    icon: Monitor,
    title: 'Real Portal Experience',
    description: 'Simulations mirror actual government systems — GSTN, Income Tax, EPFO, and more.',
  },
  {
    icon: Building,
    title: 'Institution-Only Model',
    description: 'Strictly B2B approach designed exclusively for training institutes and colleges.',
  },
  {
    icon: Shield,
    title: 'Data Security',
    description: 'Enterprise-grade privacy standards with role-based access and encrypted data.',
  },
  {
    icon: RefreshCw,
    title: 'Always Updated',
    description: 'Regulation and compliance updates applied automatically across all simulations.',
  },
  {
    icon: Headphones,
    title: 'Dedicated Support',
    description: 'WhatsApp, email, and call assistance for trainers and institution administrators.',
  },
];

export function WhyAccountIn() {
  return (
    <section className="py-24 landing-section">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <RevealOnScroll className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full bg-[var(--bg-glass)] border border-[var(--glass-border)] text-[var(--accent-cyan)]">
            Why AccountIn
          </span>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-white">
            Why Institutions Choose AccountIn
          </h2>
        </RevealOnScroll>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {REASONS.map((reason, i) => {
            const Icon = reason.icon;
            const elevated = i === 1;
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                className={elevated ? 'lg:-mt-4 lg:mb-4' : ''}
              >
                <GlassCard
                  hover
                  className={`p-7 h-full ${elevated ? 'lg:scale-105 lg:shadow-[0_28px_80px_rgba(0,0,0,0.55)]' : ''}`}
                >
                  <div className="w-12 h-12 rounded-full bg-[var(--accent-gradient)] flex items-center justify-center mb-5">
                    <Icon size={22} className="text-[#05060B]" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{reason.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{reason.description}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
