'use client';

import { useEffect, useRef, useState } from 'react';
import { Target, Heart, Lightbulb, Award } from 'lucide-react';

const TEAM = [
  { initials: 'RK', name: 'Rahul Kumar',   role: 'CEO & Co-founder',      bg: '#2A2A2A' },
  { initials: 'PS', name: 'Priya Sharma',  role: 'CTO & Co-founder',      bg: '#2A2A2A' },
  { initials: 'AM', name: 'Arjun Mehta',   role: 'Head of Product',       bg: '#2A2A2A' },
  { initials: 'SN', name: 'Sneha Nair',    role: 'Head of Design',        bg: '#2A2A2A' },
  { initials: 'VT', name: 'Vikram Tiwari', role: 'Lead Engineer',         bg: '#2A2A2A' },
  { initials: 'DG', name: 'Divya Gupta',   role: 'Head of Customer Success', bg: '#2A2A2A' },
];

const VALUES = [
  { icon: Target,    title: 'Precision',    desc: 'Every number matters. We build tools that are accurate to the last paisa.' },
  { icon: Heart,     title: 'Empathy',      desc: 'We design for real people — accountants, founders, and finance teams.' },
  { icon: Lightbulb, title: 'Innovation',   desc: 'We push the boundaries of what accounting software can do with AI.' },
  { icon: Award,     title: 'Trust',        desc: 'Your financial data is sacred. We treat it with the highest standards.' },
];

const MILESTONES = [
  { year: '2020', event: 'Accountin founded in Bengaluru with a mission to simplify Indian accounting.' },
  { year: '2021', event: 'Launched GST auto-filing. Reached 10,000 users in 6 months.' },
  { year: '2022', event: 'Raised Series A. Expanded to TDS, payroll, and multi-currency support.' },
  { year: '2023', event: 'Introduced AI-powered anomaly detection and cash-flow forecasting.' },
  { year: '2024', event: 'Crossed 2 million users. Launched Enterprise tier with SSO & SLA.' },
  { year: '2025', event: 'Real-time collaboration, mobile apps, and 150+ currency support go live.' },
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

export function About() {
  const hero      = useInView(0.2);
  const values    = useInView(0.1);
  const timeline  = useInView(0.1);
  const team      = useInView(0.1);

  return (
    <section id="about" className="scroll-mt-20" style={{ background: '#141414' }}>

      {/* ── Hero block ───────────────────────────────────────────── */}
      <div
        ref={hero.ref}
        style={{ padding: '96px 40px 80px', maxWidth: '1100px', margin: '0 auto' }}
      >
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left copy */}
          <div
            style={{
              opacity: hero.visible ? 1 : 0,
              transform: hero.visible ? 'translateX(0)' : 'translateX(-24px)',
              transition: 'opacity 0.65s ease, transform 0.65s ease',
            }}
          >
            <span
              className="inline-block text-xs font-bold tracking-widest uppercase mb-5 px-3 py-1 rounded-full"
              style={{ background: '#222', color: '#CCFF00', border: '1px solid #333' }}
            >
              About Us
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
              Built for India's<br />
              <span style={{ color: '#CCFF00' }}>financial backbone.</span>
            </h2>
            <p className="text-base leading-relaxed mb-5" style={{ color: '#888' }}>
              Accountin was born out of frustration. Our founders spent years watching
              small businesses drown in spreadsheets, miss GST deadlines, and pay penalties
              for avoidable errors. We decided to fix that.
            </p>
            <p className="text-base leading-relaxed" style={{ color: '#888' }}>
              Today, Accountin is India's fastest-growing accounting platform — trusted
              by freelancers, startups, and enterprises alike. We combine the power of AI
              with deep compliance knowledge to make accounting effortless.
            </p>

            {/* Quick facts */}
            <div className="grid grid-cols-3 gap-4 mt-10">
              {[['2020', 'Founded'], ['2M+', 'Users'], ['₹500Cr+', 'Processed']].map(([val, lbl]) => (
                <div key={lbl}>
                  <p className="text-2xl font-black" style={{ color: '#CCFF00' }}>{val}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#666' }}>{lbl}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — decorative card */}
          <div
            style={{
              opacity: hero.visible ? 1 : 0,
              transform: hero.visible ? 'translateX(0)' : 'translateX(24px)',
              transition: 'opacity 0.65s ease 0.15s, transform 0.65s ease 0.15s',
            }}
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ background: '#1A1A1A', border: '1px solid #2A2A2A', padding: '40px' }}
            >
              {/* Accent blob */}
              <div
                className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'radial-gradient(circle, rgba(204,255,0,0.08) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }}
              />
              <p className="text-lg font-bold text-white mb-3 relative z-10">Our mission</p>
              <p className="text-base leading-relaxed relative z-10" style={{ color: '#888' }}>
                "To make world-class financial management accessible to every Indian business —
                from the corner kirana store to the fastest-growing startup."
              </p>
              <div className="mt-8 flex items-center gap-3 relative z-10">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: '#CCFF00', color: '#000' }}
                >
                  RK
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Rahul Kumar</p>
                  <p className="text-xs" style={{ color: '#666' }}>CEO & Co-founder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Values ──────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #222', padding: '80px 40px', background: '#111' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h3 className="text-2xl font-bold text-white text-center mb-12">What we stand for</h3>
          <div ref={values.ref} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="flex flex-col gap-4"
                  style={{
                    background: '#1A1A1A',
                    borderRadius: '16px',
                    padding: '28px',
                    border: '1px solid #2A2A2A',
                    opacity: values.visible ? 1 : 0,
                    transform: values.visible ? 'translateY(0)' : 'translateY(20px)',
                    transition: `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`,
                  }}
                >
                  <div
                    className="flex items-center justify-center"
                    style={{ width: 44, height: 44, background: '#222', borderRadius: '12px' }}
                  >
                    <Icon size={20} color="#CCFF00" strokeWidth={1.8} />
                  </div>
                  <h4 className="text-base font-bold text-white">{v.title}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: '#666' }}>{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Timeline ────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #222', padding: '80px 40px' }}>
        <div ref={timeline.ref} style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h3 className="text-2xl font-bold text-white text-center mb-14">Our journey</h3>
          <div className="flex flex-col gap-0">
            {MILESTONES.map((m, i) => (
              <div
                key={m.year}
                className="flex gap-6"
                style={{
                  opacity: timeline.visible ? 1 : 0,
                  transform: timeline.visible ? 'translateX(0)' : 'translateX(-16px)',
                  transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
                }}
              >
                {/* Year + line */}
                <div className="flex flex-col items-center">
                  <span className="text-sm font-black shrink-0 w-12 text-right" style={{ color: '#CCFF00' }}>{m.year}</span>
                  <div className="w-px flex-1 mt-2" style={{ background: i < MILESTONES.length - 1 ? '#2A2A2A' : 'transparent', minHeight: '40px' }} />
                </div>
                {/* Dot */}
                <div className="flex flex-col items-center pt-0.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ background: '#CCFF00' }} />
                  <div className="w-px flex-1 mt-2" style={{ background: i < MILESTONES.length - 1 ? '#2A2A2A' : 'transparent' }} />
                </div>
                {/* Event */}
                <p className="text-sm leading-relaxed pb-8" style={{ color: '#888' }}>{m.event}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Team ────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #222', padding: '80px 40px', background: '#111' }}>
        <div ref={team.ref} style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <h3 className="text-2xl font-bold text-white text-center mb-12">Meet the team</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5">
            {TEAM.map((member, i) => (
              <div
                key={member.name}
                className="flex flex-col items-center text-center gap-3"
                style={{
                  opacity: team.visible ? 1 : 0,
                  transform: team.visible ? 'translateY(0)' : 'translateY(16px)',
                  transition: `opacity 0.5s ease ${i * 0.08}s, transform 0.5s ease ${i * 0.08}s`,
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-lg font-black"
                  style={{ background: '#2A2A2A', color: '#CCFF00', border: '1px solid #333' }}
                >
                  {member.initials}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{member.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#666' }}>{member.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}
