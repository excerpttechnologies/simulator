'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Linkedin, Twitter, Youtube, CheckCircle } from 'lucide-react';
import { RevealOnScroll } from './ui/reveal-on-scroll';
import { GlassCard } from './ui/glass-card';
import { PrimaryButton } from './ui/buttons';

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="contact" className="py-24 landing-section relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--glow-violet)]/20 to-transparent pointer-events-none" aria-hidden />
      <div className="max-w-7xl mx-auto px-5 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <RevealOnScroll>
            <h2 className="font-heading text-[clamp(2rem,4vw,3.5rem)] font-bold text-white leading-tight">
              Ready to Transform Your Institution?
            </h2>
          </RevealOnScroll>
          <RevealOnScroll delay={0.1}>
            <p className="text-[var(--text-muted)] text-lg">
              Request a live demo and see how AccountIn can make your students job-ready.
            </p>
            <PrimaryButton href="#contact-form" className="mt-6">
              Request Demo
            </PrimaryButton>
          </RevealOnScroll>
        </div>

        <div id="contact-form" className="grid lg:grid-cols-2 gap-12">
          <RevealOnScroll>
            <div className="space-y-8">
              <div>
                <span className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full bg-[var(--bg-glass)] border border-[var(--glass-border)] text-[var(--accent-cyan)]">
                  Contact Us
                </span>
                <h3 className="text-xl font-bold mb-2 text-white">AccountIn</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  Empowering institutions to create industry-ready tax &amp; accounting professionals
                  through immersive simulation-based learning.
                </p>
              </div>

              <div className="space-y-5">
                {[
                  { icon: MapPin, label: 'Address', value: '100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038' },
                  { icon: Phone, label: 'Phone', value: '+91 80 4567 8900' },
                  { icon: Mail, label: 'Email', value: 'hello@accountin.in' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[var(--bg-glass)] border border-[var(--glass-border)] flex items-center justify-center shrink-0">
                        <Icon size={18} className="text-[var(--accent-cyan)]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[var(--text-faint)] uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm text-[var(--text-muted)] mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                {[
                  { icon: Linkedin, href: '#' },
                  { icon: Twitter, href: '#' },
                  { icon: Youtube, href: '#' },
                ].map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={i}
                      href={social.href}
                      className="w-10 h-10 rounded-xl bg-[var(--bg-glass)] border border-[var(--glass-border)] flex items-center justify-center hover:border-[var(--accent-cyan)]/40 transition-colors"
                      aria-label="Social link"
                    >
                      <Icon size={18} className="text-[var(--text-muted)]" />
                    </a>
                  );
                })}
              </div>
            </div>
          </RevealOnScroll>

          <RevealOnScroll delay={0.1}>
            <GlassCard className="p-8">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center"
                >
                  <CheckCircle size={48} className="text-emerald-400 mb-4" />
                  <h3 className="text-xl font-bold mb-2 text-white">Demo Request Received!</h3>
                  <p className="text-sm text-[var(--text-muted)]">Our team will contact you within 24 hours.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-4 text-sm text-[var(--accent-cyan)] font-semibold hover:underline"
                  >
                    Submit another request
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold mb-2 text-white">Request a Demo</h3>
                  {[
                    { name: 'name', label: 'Name', type: 'text', placeholder: 'Your full name' },
                    { name: 'institution', label: 'Institution Name', type: 'text', placeholder: 'Your institution name' },
                    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@institution.com' },
                    { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+91 98765 43210' },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">{field.label}</label>
                      <input
                        type={field.type}
                        name={field.name}
                        placeholder={field.placeholder}
                        required
                        className="w-full rounded-xl px-4 py-3 text-sm text-white bg-white/5 border border-[var(--glass-border)] outline-none focus:border-[var(--accent-blue)] transition-colors placeholder:text-[var(--text-faint)]"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] mb-1.5 block">Message</label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Tell us about your institution and training needs..."
                      className="w-full rounded-xl px-4 py-3 text-sm text-white bg-white/5 border border-[var(--glass-border)] outline-none focus:border-[var(--accent-blue)] transition-colors resize-none placeholder:text-[var(--text-faint)]"
                    />
                  </div>
                  <PrimaryButton type="submit" className="w-full">
                    Request Demo
                  </PrimaryButton>
                </form>
              )}
            </GlassCard>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
