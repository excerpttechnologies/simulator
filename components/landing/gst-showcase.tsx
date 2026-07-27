'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { GlassCard } from './ui/glass-card';
import { RevealOnScroll } from './ui/reveal-on-scroll';
import { PrimaryButton } from './ui/buttons';

const GST_STEPS = [
  { title: 'GST Registration', desc: 'Apply for GSTIN with document upload and ARN tracking.' },
  { title: 'GST Invoicing', desc: 'Create tax invoices with HSN/SAC codes and place of supply.' },
  { title: 'GSTR-1 Filing', desc: 'File outward supply returns with B2B, B2C, and export details.' },
  { title: 'GSTR-2A / 2B Reconciliation', desc: 'Match purchase data with supplier filings automatically.' },
  { title: 'GSTR-3B Filing', desc: 'Compute tax liability and file monthly summary returns.' },
  { title: 'E-Way Bill Generation', desc: 'Generate e-way bills for goods movement compliance.' },
  { title: 'PMT-06 Challan', desc: 'Create and pay GST challans through the payment portal.' },
  { title: 'Amendments', desc: 'Correct invoices and returns with proper amendment workflows.' },
  { title: 'IMS Management', desc: 'Manage Invoice Management System for ITC decisions.' },
  { title: 'Compliance Reporting', desc: 'Generate compliance dashboards and audit-ready reports.' },
];

export function GstShowcase() {
  const [active, setActive] = useState(0);

  return (
    <section className="py-24 landing-section">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <RevealOnScroll className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full bg-[var(--bg-glass)] border border-[var(--glass-border)] text-[var(--accent-violet)]">
            GST Simulation
          </span>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-white">
            Complete GST Workflow — From Registration to Compliance
          </h2>
          <p className="mt-4 text-[var(--text-muted)]">
            Students practice every step of the GST lifecycle in a realistic portal environment.
          </p>
        </RevealOnScroll>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <RevealOnScroll className="relative">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-[var(--accent-gradient)] flex items-center justify-center text-2xl font-bold text-[#05060B] mb-4">
                GST
              </div>
              <GlassCard className="p-4 w-full max-w-xs -mt-2">
                <p className="text-sm font-semibold text-white">GST Portal Simulation</p>
                <p className="text-xs text-[var(--text-muted)] mt-1">Step {active + 1} of {GST_STEPS.length}</p>
              </GlassCard>
            </div>

            <GlassCard className="p-5 max-w-sm mx-auto">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Request a Demo</p>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Your full name"
                  readOnly
                  className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-[var(--glass-border)] text-white placeholder:text-[var(--text-faint)]"
                  aria-label="Name"
                />
                <input
                  type="email"
                  placeholder="you@institution.com"
                  readOnly
                  className="w-full rounded-xl px-3 py-2 text-sm bg-white/5 border border-[var(--glass-border)] text-white placeholder:text-[var(--text-faint)]"
                  aria-label="Email"
                />
                <PrimaryButton href="#contact" className="w-full text-xs py-2.5">
                  Request Live Demo
                </PrimaryButton>
              </div>
            </GlassCard>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <div className="space-y-2">
              {GST_STEPS.map((step, i) => {
                const isOpen = active === i;
                return (
                  <GlassCard key={step.title} className="overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-5 py-4 text-left"
                      onClick={() => setActive(i)}
                      aria-expanded={isOpen}
                    >
                      <span className={`text-sm font-semibold pr-4 ${isOpen ? 'text-white' : 'text-[var(--text-muted)]'}`}>
                        {step.title}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="shrink-0 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center"
                      >
                        <ChevronDown size={14} className="text-[var(--accent-cyan)]" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <p className="px-5 pb-4 text-sm text-[var(--text-muted)] leading-relaxed">{step.desc}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                );
              })}
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
