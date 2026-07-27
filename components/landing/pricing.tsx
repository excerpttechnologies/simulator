'use client';

import { Check, ArrowRight } from 'lucide-react';
import { GlassCard } from './ui/glass-card';
import { RevealOnScroll } from './ui/reveal-on-scroll';
import { PrimaryButton, OutlinedButton } from './ui/buttons';

const PLANS = [
  {
    name: 'Starter',
    description: 'For small coaching centers getting started',
    price: 'Custom',
    features: ['Up to 100 students', 'GST & TDS modules', 'Trainer dashboard', 'Email support'],
    cta: 'Request Quote',
    popular: false,
  },
  {
    name: 'Professional',
    description: 'For growing institutes with multiple batches',
    price: 'Custom',
    features: ['Up to 500 students', 'All simulation modules', 'Multi-trainer access', 'Priority support', 'Marketing kit'],
    cta: 'Request Quote',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For universities & large training networks',
    price: 'Custom',
    features: ['Unlimited students', 'White-label option', 'Multi-branch management', 'Dedicated account manager', '24/7 support'],
    cta: 'Contact Sales',
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 landing-section border-t border-[var(--glass-border)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <RevealOnScroll className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full bg-[var(--bg-glass)] border border-[var(--glass-border)] text-[var(--accent-cyan)]">
            Pricing
          </span>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-white">
            Flexible Plans for Every Institution
          </h2>
          <p className="mt-4 text-[var(--text-muted)]">
            Custom pricing based on student count, modules, and partnership type. No hidden fees.
          </p>
        </RevealOnScroll>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {PLANS.map((plan, i) => (
            <RevealOnScroll key={plan.name} delay={i * 0.08}>
              <GlassCard
                hover
                className={`relative p-7 h-full flex flex-col ${plan.popular ? 'border-[var(--accent-blue)]/40 bg-gradient-to-b from-[rgba(91,141,239,0.1)] to-transparent' : ''}`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[var(--accent-gradient)] text-[#05060B]">
                    Recommended
                  </span>
                )}
                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-[var(--text-muted)] mt-1 mb-4">{plan.description}</p>
                <p className="text-3xl font-bold text-white mb-6">
                  {plan.price}
                  <span className="text-sm font-normal text-[var(--text-faint)] ml-1">/ institution</span>
                </p>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <Check size={16} className="text-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.popular ? (
                  <PrimaryButton href="#contact" className="w-full">
                    {plan.cta}
                    <ArrowRight size={14} />
                  </PrimaryButton>
                ) : (
                  <OutlinedButton href="#contact" className="w-full">
                    {plan.cta}
                    <ArrowRight size={14} />
                  </OutlinedButton>
                )}
              </GlassCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
