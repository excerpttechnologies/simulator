'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Users, Sparkles, LayoutTemplate, ImageIcon,
  FileText, ShieldCheck, BarChart3, Zap,
  Clock, Globe, Lock, Workflow,
} from 'lucide-react';

/* ── Service cards data ─────────────────────────────────────────────── */
const SERVICES = [
  {
    icon: Users,
    title: 'Realtime Collaboration',
    description: 'Work with your entire team simultaneously. See cursors, edits, and comments live — no refresh needed.',
    tag: 'Team',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Tools',
    description: 'Let AI auto-categorise transactions, generate reports, and surface anomalies before they become problems.',
    tag: 'AI',
  },
  {
    icon: LayoutTemplate,
    title: 'Templates Library',
    description: 'Hundreds of ready-to-use invoice, balance sheet, and P&L templates. Customise in seconds.',
    tag: 'Design',
  },
  {
    icon: FileText,
    title: 'GST & TDS Filing',
    description: 'Auto-compute GST and TDS liabilities, generate returns, and file directly from the platform.',
    tag: 'Compliance',
  },
  {
    icon: BarChart3,
    title: 'Smart Analytics',
    description: 'Interactive dashboards with cash-flow forecasting, expense breakdowns, and trend analysis.',
    tag: 'Insights',
  },
  {
    icon: ShieldCheck,
    title: 'Bank-Grade Security',
    description: 'AES-256 encryption, SOC 2 Type II compliance, and role-based access controls keep your data safe.',
    tag: 'Security',
  },
  {
    icon: Workflow,
    title: 'Workflow Automation',
    description: 'Set rules to auto-approve invoices, send payment reminders, and reconcile accounts on schedule.',
    tag: 'Automation',
  },
  {
    icon: Globe,
    title: 'Multi-Currency Support',
    description: 'Handle transactions in 150+ currencies with live exchange rates and automatic conversion.',
    tag: 'Global',
  },
];

/* ── Process steps ──────────────────────────────────────────────────── */
const STEPS = [
  { num: '01', title: 'Connect your accounts', desc: 'Link your bank, GST portal, and payment gateways in under 2 minutes.' },
  { num: '02', title: 'Auto-import transactions', desc: 'Accountin pulls and categorises every transaction automatically.' },
  { num: '03', title: 'Review & approve', desc: 'AI flags anomalies. You review, approve, and move on.' },
  { num: '04', title: 'File & report', desc: 'Generate compliant reports and file returns with one click.' },
];

/* ── Stats ──────────────────────────────────────────────────────────── */
const STATS = [
  { value: '2M+',  label: 'Active users'       },
  { value: '98%',  label: 'Uptime SLA'          },
  { value: '40hrs', label: 'Saved per month'    },
  { value: '150+', label: 'Currencies supported' },
];

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

export function Features() {
  const heading = useInView(0.3);
  const steps   = useInView(0.1);
  const stats   = useInView(0.2);

  return (
    <section id="services" className="scroll-mt-20" style={{ background: '#141414' }}>

      {/* ── Section 1: Service cards ─────────────────────────────── */}
      <div style={{ padding: '96px 40px 80px', maxWidth: '1280px', margin: '0 auto' }}>

        {/* Heading */}
        <div ref={heading.ref} className="text-center mb-16">
          <span
            className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full"
            style={{ background: '#222', color: '#CCFF00', border: '1px solid #333' }}
          >
            Our Services
          </span>
          <h2
            className="text-4xl md:text-5xl font-bold text-white leading-tight"
            style={{
              opacity: heading.visible ? 1 : 0,
              transform: heading.visible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}
          >
            Everything your business needs{' '}
            <span
              className="inline-flex items-center rounded-full px-4 py-1 align-middle"
              style={{ background: '#CCFF00', color: '#000' }}
            >
              in one place.
            </span>
          </h2>
          <p
            className="mt-5 text-base max-w-2xl mx-auto leading-relaxed"
            style={{
              color: '#888',
              opacity: heading.visible ? 1 : 0,
              transition: 'opacity 0.6s ease 0.15s',
            }}
          >
            From GST filing to AI-powered forecasting — Accountin covers every corner
            of your financial workflow so you can focus on growing your business.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SERVICES.map((svc, i) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.title}
                className="group flex flex-col gap-4 cursor-default"
                style={{
                  background: '#1E1E1E',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid #2A2A2A',
                  transition: 'border-color 0.2s, transform 0.2s',
                  opacity: heading.visible ? 1 : 0,
                  transform: heading.visible ? 'translateY(0)' : 'translateY(20px)',
                  transitionDelay: `${0.05 * i}s`,
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#CCFF00'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#2A2A2A'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'; }}
              >
                {/* Icon + tag row */}
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center justify-center"
                    style={{ width: 40, height: 40, background: '#2A2A2A', borderRadius: '10px' }}
                  >
                    <Icon size={18} color="#CCFF00" strokeWidth={1.8} />
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#555' }}>
                    {svc.tag}
                  </span>
                </div>

                {/* Text */}
                <div>
                  <h3 className="text-base font-bold text-white mb-1.5">{svc.title}</h3>
                  <p className="text-sm leading-relaxed" style={{ color: '#777' }}>{svc.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Section 2: How it works ──────────────────────────────── */}
      <div
        style={{
          borderTop: '1px solid #222',
          borderBottom: '1px solid #222',
          padding: '80px 40px',
          background: '#111',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-white">How it works</h2>
            <p className="mt-3 text-sm" style={{ color: '#666' }}>Four steps from sign-up to fully automated accounting.</p>
          </div>

          <div ref={steps.ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="flex flex-col gap-4"
                style={{
                  opacity: steps.visible ? 1 : 0,
                  transform: steps.visible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
                }}
              >
                {/* Step number + connector line */}
                <div className="flex items-center gap-3">
                  <span
                    className="text-2xl font-black"
                    style={{ color: '#CCFF00', fontVariantNumeric: 'tabular-nums' }}
                  >
                    {step.num}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-px hidden lg:block" style={{ background: '#2A2A2A' }} />
                  )}
                </div>
                <h3 className="text-base font-bold text-white">{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Section 3: Stats bar ─────────────────────────────────── */}
      <div ref={stats.ref} style={{ padding: '60px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map((s, i) => (
            <div
              key={s.label}
              className="text-center"
              style={{
                opacity: stats.visible ? 1 : 0,
                transform: stats.visible ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
              }}
            >
              <p className="text-4xl font-black" style={{ color: '#CCFF00' }}>{s.value}</p>
              <p className="text-sm mt-1" style={{ color: '#666' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
