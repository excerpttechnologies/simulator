'use client';

import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { GlassCard } from './ui/glass-card';
import { RevealOnScroll } from './ui/reveal-on-scroll';

const TESTIMONIALS = [
  {
    name: 'Dr. Rajesh Kumar',
    role: 'Director',
    institution: 'Delhi Commerce Academy',
    quote: 'AccountIn transformed how we teach GST and TDS. Our students now enter interviews with real portal experience — something no textbook can provide.',
    rating: 5,
    initial: 'RK',
  },
  {
    name: 'Priya Sharma',
    role: 'Institution Owner',
    institution: 'Mumbai Tax Institute',
    quote: 'The white-label option let us brand the platform as our own. Student engagement increased by 60% and placement rates have never been higher.',
    rating: 5,
    initial: 'PS',
  },
  {
    name: 'Prof. Anand Mehta',
    role: 'Faculty Head',
    institution: 'Bangalore CA Coaching',
    quote: 'Trainer resources and dedicated support make AccountIn incredibly easy to adopt. We onboarded 300 students in the first month alone.',
    rating: 5,
    initial: 'AM',
  },
  {
    name: 'Sneha Reddy',
    role: 'Senior Trainer',
    institution: 'Hyderabad FinEd Center',
    quote: 'The simulation quality is unmatched. Students practice GSTR filing, TDS returns, and payroll — all in one integrated platform.',
    rating: 5,
    initial: 'SR',
  },
];

export function Testimonials() {
  return (
    <section className="py-24 landing-section">
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <RevealOnScroll className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full bg-[var(--bg-glass)] border border-[var(--glass-border)] text-[var(--accent-cyan)]">
            Testimonials
          </span>
          <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-white">
            Trusted by Education Leaders
          </h2>
        </RevealOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
            >
              <GlassCard hover className="p-7 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-[var(--accent-gradient)] flex items-center justify-center text-sm font-bold text-[#05060B]">
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{t.role} · {t.institution}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed flex-1">&ldquo;{t.quote}&rdquo;</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
