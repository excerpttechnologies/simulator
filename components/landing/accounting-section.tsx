'use client';

import { motion } from 'framer-motion';
import {
  BookOpen, Layers, Scale, TrendingUp, FileBarChart,
  ArrowLeftRight, Receipt, Wallet,
} from 'lucide-react';
import { GlassCard } from './ui/glass-card';
import { RevealOnScroll } from './ui/reveal-on-scroll';

const MODULES = [
  { icon: BookOpen, title: 'Journal Entries', step: 1 },
  { icon: Layers, title: 'Ledger Posting', step: 2 },
  { icon: Scale, title: 'Trial Balance', step: 3 },
  { icon: TrendingUp, title: 'Profit & Loss', step: 4 },
  { icon: FileBarChart, title: 'Balance Sheet', step: 5 },
  { icon: ArrowLeftRight, title: 'Bank Reconciliation', step: 6 },
  { icon: Receipt, title: 'GST Accounting', step: 7 },
  { icon: Wallet, title: 'Payroll Accounting', step: 8 },
];

export function AccountingSection() {
  return (
    <section className="py-24 landing-section overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <RevealOnScroll className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full bg-[var(--bg-glass)] border border-[var(--glass-border)] text-[var(--accent-cyan)]">
            Accounting Simulation
          </span>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-white">
            Practice Real Business Accounting
          </h2>
          <p className="mt-4 text-[var(--text-muted)]">
            From first journal entry to final balance sheet — students master the complete accounting cycle.
          </p>
        </RevealOnScroll>

        <div className="relative mb-12">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-blue)]/40 to-transparent" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {MODULES.map((mod, i) => {
              const Icon = mod.icon;
              return (
                <motion.div
                  key={mod.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ delay: i * 0.08, duration: 0.6 }}
                  className="relative flex flex-col items-center text-center group"
                >
                  <div className="relative z-10 w-14 h-14 rounded-2xl bg-[var(--bg-glass)] backdrop-blur-sm border border-[var(--glass-border)] flex items-center justify-center mb-3 group-hover:border-[var(--accent-cyan)]/50 transition-all">
                    <Icon size={22} className="text-[var(--accent-cyan)]" />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--accent-cyan)] mb-1">Step {mod.step}</span>
                  <p className="text-xs font-medium text-[var(--text-muted)] leading-tight">{mod.title}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        <RevealOnScroll>
          <GlassCard className="overflow-hidden">
            <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--glass-border)]">
              <div className="p-6">
                <p className="text-xs font-semibold text-[var(--accent-cyan)] uppercase tracking-wider mb-3">Journal Entry</p>
                <div className="space-y-2">
                  {[
                    { dr: 'Purchase A/c', amt: '₹1,18,000' },
                    { cr: 'Creditors A/c', amt: '₹1,18,000' },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between text-sm p-2 rounded-lg bg-white/5">
                      <span className="text-[var(--text-muted)]">{'dr' in row ? row.dr : row.cr}</span>
                      <span className="font-mono text-white">{row.amt}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold text-[var(--accent-cyan)] uppercase tracking-wider mb-3">Trial Balance</p>
                <div className="space-y-2">
                  {['Debit Total: ₹24,50,000', 'Credit Total: ₹24,50,000', 'Status: Balanced ✓'].map((line) => (
                    <p key={line} className="text-sm text-[var(--text-muted)] p-2 rounded-lg bg-white/5">{line}</p>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold text-[var(--accent-cyan)] uppercase tracking-wider mb-3">P&amp;L Summary</p>
                <div className="space-y-2">
                  {[
                    { label: 'Revenue', val: '₹45,00,000', color: '#10B981' },
                    { label: 'Expenses', val: '₹32,50,000', color: '#F59E0B' },
                    { label: 'Net Profit', val: '₹12,50,000', color: '#5B8DEF' },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-sm p-2 rounded-lg bg-white/5">
                      <span className="text-[var(--text-muted)]">{row.label}</span>
                      <span style={{ color: row.color }} className="font-semibold">{row.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </RevealOnScroll>
      </div>
    </section>
  );
}
