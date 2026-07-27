'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { GlassCard } from './ui/glass-card';
import { RevealOnScroll } from './ui/reveal-on-scroll';

const FAQS = [
  {
    q: 'What is AccountIn?',
    a: 'AccountIn is India\'s most advanced tax simulation and accounting practice platform designed for training institutes, colleges, and coaching centers. It provides realistic simulations of GST, TDS, Income Tax, EPFO, Payroll, UAE VAT, and accounting workflows.',
  },
  {
    q: 'Who can use AccountIn?',
    a: 'AccountIn is built exclusively for educational institutions — training institutes, colleges, universities, coaching centers, skill development organizations, and professional training companies. It follows a strict B2B institution-only model.',
  },
  {
    q: 'Do you train students directly?',
    a: 'No. AccountIn empowers institutions to train their own students. We provide the platform, simulations, trainer resources, and support — your faculty delivers the training.',
  },
  {
    q: 'Can institutions white-label the platform?',
    a: 'Yes. Our OEM / White Label Partner program offers custom branding, your own logo, own domain, and a fully personalized platform experience for your institution.',
  },
  {
    q: 'How often is the platform updated?',
    a: 'AccountIn is updated regularly to reflect the latest regulatory changes, compliance requirements, and government portal updates across all simulation modules.',
  },
  {
    q: 'Is trainer support included?',
    a: 'Absolutely. All partnership plans include trainer resources, onboarding assistance, and dedicated support via WhatsApp, email, and phone.',
  },
  {
    q: 'Can multiple branches be managed?',
    a: 'Yes. AccountIn supports multi-branch management with centralized administration, separate trainer accounts, and consolidated reporting across all locations.',
  },
  {
    q: 'Do you provide onboarding assistance?',
    a: 'Every partner receives full onboarding support including platform setup, trainer training, student enrollment guidance, and ongoing technical assistance.',
  },
];

export function Faq() {
  const [open, setOpen] = useState<number>(0);

  return (
    <section id="faq" className="py-24 landing-section">
      <div className="max-w-3xl mx-auto px-5 lg:px-8">
        <RevealOnScroll className="text-center mb-12">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full bg-[var(--bg-glass)] border border-[var(--glass-border)] text-[var(--accent-violet)]">
            FAQ
          </span>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-white">
            Frequently Asked Questions
          </h2>
        </RevealOnScroll>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <RevealOnScroll key={faq.q} delay={i * 0.04}>
                <GlassCard className="overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                    onClick={() => setOpen(isOpen ? -1 : i)}
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm font-semibold text-white pr-4">{faq.q}</span>
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
                        <p className="px-5 pb-4 text-sm text-[var(--text-muted)] leading-relaxed">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </GlassCard>
              </RevealOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
}
