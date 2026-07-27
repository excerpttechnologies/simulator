'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GlassCard } from './ui/glass-card';
import { RevealOnScroll } from './ui/reveal-on-scroll';
import { PrimaryButton } from './ui/buttons';

const FEATURES = [
  {
    id: 'gst',
    label: 'GST',
    title: 'GST Return Filing Dashboard',
    description: 'Explore realistic dashboards across every simulation module.',
    metrics: [
      { label: 'Outward Supplies', value: '₹28,45,000' },
      { label: 'Input Tax Credit', value: '₹12,30,000' },
      { label: 'Net Tax Payable', value: '₹16,15,000' },
    ],
    chart: [45, 62, 58, 75, 68, 82, 90, 88],
  },
  {
    id: 'tds',
    label: 'TDS',
    title: 'TDS Return Management',
    description: 'Explore realistic dashboards across every simulation module.',
    metrics: [
      { label: 'TDS Deducted', value: '₹4,85,000' },
      { label: 'Challans Paid', value: '₹4,20,000' },
      { label: 'Pending', value: '₹65,000' },
    ],
    chart: [30, 45, 55, 50, 70, 65, 80, 75],
  },
  {
    id: 'income-tax',
    label: 'Income Tax',
    title: 'Income Tax Filing Portal',
    description: 'Explore realistic dashboards across every simulation module.',
    metrics: [
      { label: 'Gross Income', value: '₹18,50,000' },
      { label: 'Deductions', value: '₹2,40,000' },
      { label: 'Tax Payable', value: '₹3,12,000' },
    ],
    chart: [50, 55, 60, 58, 72, 78, 85, 92],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    title: 'Accounting Workbench',
    description: 'Explore realistic dashboards across every simulation module.',
    metrics: [
      { label: 'Total Debits', value: '₹45,00,000' },
      { label: 'Total Credits', value: '₹45,00,000' },
      { label: 'Net Profit', value: '₹8,50,000' },
    ],
    chart: [40, 50, 48, 65, 60, 75, 70, 88],
  },
  {
    id: 'payroll',
    label: 'Payroll',
    title: 'Payroll Processing Center',
    description: 'Explore realistic dashboards across every simulation module.',
    metrics: [
      { label: 'Employees', value: '156' },
      { label: 'Gross Salary', value: '₹42,50,000' },
      { label: 'Net Payout', value: '₹38,20,000' },
    ],
    chart: [55, 60, 58, 70, 72, 80, 85, 90],
  },
  {
    id: 'epfo',
    label: 'EPFO',
    title: 'EPFO Compliance Dashboard',
    description: 'Explore realistic dashboards across every simulation module.',
    metrics: [
      { label: 'Active Members', value: '142' },
      { label: 'ECR Filed', value: '11/12' },
      { label: 'PF Contribution', value: '₹8,45,000' },
    ],
    chart: [35, 42, 50, 55, 60, 68, 75, 82],
  },
  {
    id: 'uae-vat',
    label: 'UAE VAT',
    title: 'UAE VAT Return Portal',
    description: 'Explore realistic dashboards across every simulation module.',
    metrics: [
      { label: 'Taxable Supplies', value: 'AED 2,45,000' },
      { label: 'Input VAT', value: 'AED 32,000' },
      { label: 'Net VAT Due', value: 'AED 18,500' },
    ],
    chart: [42, 48, 55, 52, 65, 70, 78, 85],
  },
];

export function PlatformDemo() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'center', loop: true, containScroll: 'trimSnaps' });
  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    onSelect();
    return () => { emblaApi.off('select', onSelect); };
  }, [emblaApi]);

  return (
    <section id="demo" className="py-24 landing-section overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <RevealOnScroll className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full bg-[var(--bg-glass)] border border-[var(--glass-border)] text-[var(--accent-cyan)]">
              Platform Demo
            </span>
            <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-white">
              Interactive Product Demo
            </h2>
            <p className="mt-4 text-[var(--text-muted)]">
              Explore realistic dashboards across every simulation module.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={scrollPrev}
              className="w-11 h-11 rounded-full border border-[var(--glass-border)] bg-[var(--bg-glass)] flex items-center justify-center text-white hover:bg-white hover:text-[#05060B] transition-colors"
              aria-label="Previous feature"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={scrollNext}
              className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[#05060B] hover:scale-105 transition-transform"
              aria-label="Next feature"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </RevealOnScroll>

        <div ref={emblaRef} className="overflow-hidden -mx-2">
          <div className="flex gap-4 px-2">
            {FEATURES.map((feature, i) => {
              const isActive = selected === i;
              return (
                <div
                  key={feature.id}
                  className="flex-[0_0_85%] sm:flex-[0_0_55%] lg:flex-[0_0_42%] min-w-0"
                >
                  <motion.div
                    animate={{ scale: isActive ? 1 : 0.95, opacity: isActive ? 1 : 0.55 }}
                    transition={{ duration: 0.35 }}
                    className="h-full"
                  >
                    <GlassCard
                      className={`p-6 md:p-8 h-full transition-colors ${
                        isActive
                          ? 'bg-gradient-to-br from-[rgba(70,200,232,0.12)] via-[rgba(91,141,239,0.12)] to-[rgba(166,107,255,0.12)] border-[var(--accent-blue)]/30'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-5">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
                            isActive
                              ? 'bg-[var(--accent-gradient)] text-[#05060B]'
                              : 'bg-white/10 text-[var(--text-muted)]'
                          }`}
                        >
                          {feature.label.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-xs text-[var(--text-muted)]">{feature.label}</p>
                          <h3 className="text-base font-bold text-white">{feature.title}</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-5">
                        {feature.metrics.map((m) => (
                          <div key={m.label} className="rounded-xl bg-white/5 border border-[var(--glass-border)] p-3">
                            <p className="text-[9px] text-[var(--text-faint)]">{m.label}</p>
                            <p className="text-xs font-bold text-white mt-1">{m.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-xl bg-white/5 border border-[var(--glass-border)] p-3">
                        <p className="text-[10px] font-medium text-[var(--text-muted)] mb-2">Performance Trend</p>
                        <div className="flex items-end gap-1.5 h-16">
                          {feature.chart.map((h, ci) => (
                            <motion.div
                              key={ci}
                              className="flex-1 rounded-sm bg-[var(--accent-gradient)]"
                              initial={{ height: 0 }}
                              whileInView={{ height: `${h}%` }}
                              viewport={{ once: true }}
                              transition={{ delay: ci * 0.05, duration: 0.4 }}
                            />
                          ))}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        <RevealOnScroll className="text-center mt-10">
          <PrimaryButton href="#contact">Schedule Live Product Demo</PrimaryButton>
        </RevealOnScroll>
      </div>
    </section>
  );
}
