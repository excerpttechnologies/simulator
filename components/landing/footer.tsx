import Link from 'next/link';
import { Linkedin, Twitter, Youtube, Mail } from 'lucide-react';

const FOOTER_LINKS = {
  Platform: [
    { label: 'GST Simulation', href: '#simulations' },
    { label: 'TDS Simulation', href: '#simulations' },
    { label: 'Income Tax', href: '#simulations' },
    { label: 'Accounting', href: '#simulations' },
    { label: 'Payroll & EPFO', href: '#simulations' },
  ],
  Solutions: [
    { label: 'For Institutes', href: '#institutions' },
    { label: 'For Universities', href: '#institutions' },
    { label: 'For Coaching Centers', href: '#institutions' },
    { label: 'UAE VAT Training', href: '#demo' },
  ],
  'Partner Program': [
    { label: 'Training Partner', href: '#partner' },
    { label: 'White Label', href: '#partner' },
    { label: 'Become a Partner', href: '#contact' },
  ],
  Resources: [
    { label: 'Platform Demo', href: '#demo' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'FAQ', href: '#faq' },
    { label: 'Pricing', href: '#pricing' },
  ],
  Company: [
    { label: 'About Us', href: '#institutions' },
    { label: 'Contact', href: '#contact' },
    { label: 'Careers', href: '#' },
    { label: 'Blog', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

const NAV_ROW = [
  { label: 'Home', href: '#hero' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Simulations', href: '#simulations' },
  { label: 'Partner Program', href: '#partner' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

const SOCIAL = [
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Youtube, href: '#', label: 'YouTube' },
  { icon: Mail, href: 'mailto:hello@accountin.in', label: 'Email' },
];

export function Footer() {
  return (
    <footer className="landing-section border-t border-[var(--glass-border)] text-white">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">
        <div className="text-center mb-12">
          <Link href="/" className="text-2xl font-bold font-heading text-white">
            ACCOUNTIN
          </Link>
          <p className="mt-4 text-sm text-[var(--text-muted)] leading-relaxed max-w-md mx-auto">
            Empowering Institutions to Create Industry-Ready Tax &amp; Accounting Professionals.
          </p>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8" aria-label="Footer navigation">
            {NAV_ROW.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-[var(--text-muted)] hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <div className="flex justify-center gap-3 mt-6">
            {SOCIAL.map((s) => {
              const Icon = s.icon;
              return (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-[var(--bg-glass)] border border-[var(--glass-border)] flex items-center justify-center text-[var(--text-muted)] hover:text-white hover:border-white/25 transition-colors"
                >
                  <Icon size={16} />
                </a>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12 border-t border-[var(--glass-border)] pt-12">
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-faint)] mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-sm text-[var(--text-muted)] hover:text-white transition-colors">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--glass-border)] pt-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Subscribe to our newsletter</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Get updates on new simulations and compliance changes.</p>
            </div>
            <form className="flex gap-2 w-full sm:w-auto" action="#">
              <input
                type="email"
                placeholder="Enter your email"
                aria-label="Email for newsletter"
                className="flex-1 sm:w-64 rounded-full px-4 py-2.5 text-sm bg-[var(--bg-glass)] border border-[var(--glass-border)] text-white outline-none focus:border-[var(--accent-blue)] placeholder:text-[var(--text-faint)]"
              />
              <button
                type="submit"
                className="rounded-full px-5 py-2.5 text-sm font-semibold bg-white text-[#05060B] hover:scale-[1.03] transition-transform whitespace-nowrap"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-[var(--glass-border)] pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--text-faint)]">
            &copy; {new Date().getFullYear()} AccountIn. All rights reserved.
          </p>
          <div className="flex gap-6">
            {FOOTER_LINKS.Legal.map((link) => (
              <a key={link.label} href={link.href} className="text-xs text-[var(--text-faint)] hover:text-white transition-colors">
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
