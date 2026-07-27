'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Palette, Check, ArrowRight } from 'lucide-react';
import { GlassCard } from './ui/glass-card';
import { RevealOnScroll } from './ui/reveal-on-scroll';
import { PrimaryButton } from './ui/buttons';

const PARTNERS = [
  {
    icon: GraduationCap,
    title: 'Training Partner',
    subtitle: 'For institutes & coaching centers',
    features: [
      'Student Access',
      'Trainer Resources',
      'Technical Support',
      'Marketing Support',
      'Study Materials',
    ],
    cta: 'Become a Partner',
    popular: true,
  },
  {
    icon: Palette,
    title: 'OEM / White Label Partner',
    subtitle: 'For enterprise & franchise models',
    features: [
      'Custom Branding',
      'Own Logo',
      'Own Domain',
      'Personalized Platform',
      'White Label Experience',
    ],
    cta: 'Request White Label',
    popular: false,
  },
];

export function PartnerProgram() {
  return (
    <section id="partner" className="py-24 landing-section">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <RevealOnScroll className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full bg-[var(--bg-glass)] border border-[var(--glass-border)] text-[var(--accent-violet)]">
            Partner Program
          </span>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-white">
            Grow Your Institution with AccountIn
          </h2>
          <p className="mt-4 text-[var(--text-muted)]">
            Choose the partnership model that fits your institution&apos;s growth strategy.
          </p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {PARTNERS.map((partner, i) => {
            const Icon = partner.icon;
            return (
              <motion.div
                key={partner.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <GlassCard
                  hover
                  className={`relative p-8 h-full ${partner.popular ? 'border-[var(--accent-blue)]/40' : ''}`}
                >
                  {partner.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--accent-gradient)] text-[#05060B]">
                      Most Popular
                    </span>
                  )}
                  <div className="w-14 h-14 rounded-2xl bg-[var(--accent-gradient)] flex items-center justify-center mb-5">
                    <Icon size={26} className="text-[#05060B]" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{partner.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] mt-1 mb-6">{partner.subtitle}</p>
                  <ul className="space-y-3 mb-8">
                    {partner.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-[var(--text-muted)]">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                          <Check size={12} className="text-emerald-400" strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <PrimaryButton href="#contact" className="w-full">
                    {partner.cta}
                    <ArrowRight size={16} />
                  </PrimaryButton>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
