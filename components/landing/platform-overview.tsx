'use client';

import { motion } from 'framer-motion';
import {
  Receipt, FileSpreadsheet, Landmark, Users, Building2,
  Calculator, Globe, Briefcase, ArrowRight,
} from 'lucide-react';
import { GlassCard } from './ui/glass-card';
import { RevealOnScroll } from './ui/reveal-on-scroll';

const MODULES = [
  {
    icon: Receipt,
    title: 'GST Simulation',
    description: 'Complete GST lifecycle from registration to return filing with portal-like experience.',
    benefits: ['GSTR-1/3B Filing', 'E-Way Bills', 'Reconciliation'],
    color: '#46C8E8',
  },
  {
    icon: FileSpreadsheet,
    title: 'TDS Simulation',
    description: 'Practice TDS deduction, challan payment, and quarterly return filing workflows.',
    benefits: ['Form 24Q/26Q', 'Challan Payment', 'TDS Certificates'],
    color: '#5B8DEF',
  },
  {
    icon: Landmark,
    title: 'Income Tax Simulation',
    description: 'File ITR, compute tax liability, and understand deductions through guided practice.',
    benefits: ['ITR Filing', 'Tax Computation', 'Form 16'],
    color: '#A66BFF',
  },
  {
    icon: Users,
    title: 'Payroll Simulation',
    description: 'End-to-end payroll processing with salary structures, deductions, and payslips.',
    benefits: ['Salary Processing', 'PF/ESI', 'Payslip Generation'],
    color: '#46C8E8',
  },
  {
    icon: Building2,
    title: 'EPFO Simulation',
    description: 'Practice EPFO registration, ECR filing, and compliance management.',
    benefits: ['ECR Filing', 'UAN Management', 'Compliance'],
    color: '#5B8DEF',
  },
  {
    icon: Calculator,
    title: 'Accounting Simulation',
    description: 'Full accounting cycle from journal entries to financial statement preparation.',
    benefits: ['Journal to BS', 'Bank Recon', 'GST Accounting'],
    color: '#A66BFF',
  },
  {
    icon: Briefcase,
    title: 'Corporate Tax Simulation',
    description: 'Understand corporate tax computation, advance tax, and compliance requirements.',
    benefits: ['Tax Computation', 'MAT', 'Advance Tax'],
    color: '#46C8E8',
  },
  {
    icon: Globe,
    title: 'UAE VAT Simulation',
    description: 'Practice UAE VAT registration, invoicing, and return filing for Gulf market readiness.',
    benefits: ['VAT Returns', 'FTA Portal', 'GCC Compliance'],
    color: '#5B8DEF',
  },
];

export function PlatformOverview() {
  return (
    <section id="solutions" className="py-24 landing-section">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <RevealOnScroll className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full bg-[var(--bg-glass)] border border-[var(--glass-border)] text-[var(--accent-cyan)]">
            Platform Overview
          </span>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-white leading-tight">
            One Platform. Complete Tax Learning Ecosystem.
          </h2>
          <p className="mt-4 text-lg text-[var(--text-muted)]">
            Everything required to create industry-ready taxation professionals.
          </p>
        </RevealOnScroll>

        <div id="simulations" className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {MODULES.map((mod, i) => {
            const Icon = mod.icon;
            return (
              <motion.div
                key={mod.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: i * 0.06, duration: 0.6 }}
              >
                <GlassCard hover className="group p-6 h-full cursor-default overflow-hidden">
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center mb-4 border border-[var(--glass-border)] bg-white/5 group-hover:bg-[var(--accent-gradient)] transition-colors"
                  >
                    <Icon size={20} className="text-[var(--text-muted)] group-hover:text-[#05060B] transition-colors" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{mod.title}</h3>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-4">{mod.description}</p>
                  <ul className="space-y-1 mb-5">
                    {mod.benefits.map((b) => (
                      <li key={b} className="text-xs text-[var(--text-faint)] flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-[var(--accent-cyan)]" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <button className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--accent-cyan)] group-hover:gap-2 transition-all">
                    Learn More <ArrowRight size={14} />
                  </button>
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
