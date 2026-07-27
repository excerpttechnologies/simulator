'use client';

import { Marquee } from './ui/marquee';
import { CountUp } from './ui/count-up';
import { GlassCard } from './ui/glass-card';
import { RevealOnScroll } from './ui/reveal-on-scroll';

const INSTITUTIONS = [
  'Delhi Commerce Academy',
  'Mumbai Tax Institute',
  'Bangalore CA Coaching',
  'Chennai Skill Hub',
  'Pune University Extension',
  'Hyderabad FinEd Center',
  'Kolkata Training Academy',
  'Ahmedabad GST Academy',
];

const STATS = [
  { value: 10000, suffix: '+', label: 'Students Trained' },
  { value: 500, suffix: '+', label: 'Active Institutions' },
  { value: 1200, suffix: '+', label: 'Courses Delivered' },
  { value: 800, suffix: '+', label: 'Trainers Empowered' },
];

export function TrustedBy() {
  return (
    <section id="institutions" className="py-20 landing-section border-y border-[var(--glass-border)]">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <RevealOnScroll className="text-center mb-12">
          <p className="text-sm font-semibold text-[var(--accent-cyan)] uppercase tracking-wider mb-2">
            Trusted Across India
          </p>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-white leading-tight">
            Partnered with Leading Training Institutes &amp; Universities
          </h2>
        </RevealOnScroll>

        <RevealOnScroll delay={0.1}>
          <div className="border-y border-[var(--glass-border)] py-6 mb-16">
            <Marquee speed={35}>
              {INSTITUTIONS.map((name, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-6 py-3 rounded-xl border border-[var(--glass-border)] bg-[var(--bg-glass)] shrink-0"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--accent-gradient)] flex items-center justify-center">
                    <span className="text-sm font-bold text-[#05060B]">{name[0]}</span>
                  </div>
                  <span className="text-sm font-medium text-[var(--text-muted)] whitespace-nowrap">{name}</span>
                </div>
              ))}
            </Marquee>
          </div>
        </RevealOnScroll>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {STATS.map((stat, i) => (
            <RevealOnScroll key={stat.label} delay={i * 0.08}>
              <GlassCard hover className="text-center p-6">
                <p className="text-3xl md:text-4xl font-bold bg-[var(--accent-gradient)] bg-clip-text text-transparent">
                  <CountUp value={stat.value} suffix={stat.suffix} duration={1200} />
                </p>
                <p className="mt-2 text-sm text-[var(--text-muted)] font-medium">{stat.label}</p>
              </GlassCard>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
