'use client';

import { motion } from 'framer-motion';
import { Handshake, Settings, GraduationCap, Award } from 'lucide-react';
import { GlassCard } from './ui/glass-card';
import { RevealOnScroll } from './ui/reveal-on-scroll';

const STEPS = [
  {
    icon: Handshake,
    step: '01',
    title: 'Become Partner',
    description: 'Sign up as a training partner or white-label partner and get onboarded by our team.',
  },
  {
    icon: Settings,
    step: '02',
    title: 'Platform Setup',
    description: 'We configure your institution profile, trainer accounts, and student access modules.',
  },
  {
    icon: GraduationCap,
    step: '03',
    title: 'Student Training',
    description: 'Students practice real tax and accounting simulations with trainer guidance.',
  },
  {
    icon: Award,
    step: '04',
    title: 'Certification & Placement Readiness',
    description: 'Students earn certifications and become job-ready for accounting firms and corporates.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 landing-section">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <RevealOnScroll className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full bg-[var(--bg-glass)] border border-[var(--glass-border)] text-[var(--accent-cyan)]">
            How It Works
          </span>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-white">
            From Partnership to Placement in 4 Steps
          </h2>
        </RevealOnScroll>

        <div className="relative">
          <div className="hidden lg:block absolute top-[60px] left-[12%] right-[12%] h-px bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--accent-blue)] to-[var(--accent-violet)]" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: i * 0.12, duration: 0.6 }}
                  className="relative text-center"
                >
                  <GlassCard className="p-6">
                    <div className="relative z-10 mx-auto w-[72px] h-[72px] rounded-2xl flex items-center justify-center mb-5">
                      <div className="w-14 h-14 rounded-xl bg-[var(--accent-gradient)] flex items-center justify-center">
                        <Icon size={26} className="text-[#05060B]" />
                      </div>
                    </div>
                    <span className="text-xs font-bold tracking-widest text-[var(--accent-cyan)]">
                      STEP {step.step}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2 mb-2">{step.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{step.description}</p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
