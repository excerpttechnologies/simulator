'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { NavLoginLink, OutlinedButton } from './ui/buttons';

const PUBLIC_NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#services' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 landing-section">
      <nav
        className={`transition-all duration-300 ${
          scrolled
            ? 'bg-[var(--bg-base)]/80 backdrop-blur-xl border-b border-[var(--glass-border)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-[72px] flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-[var(--text-primary)] shrink-0 font-heading"
          >
            ACCOUNTIN
          </Link>

          <div className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {PUBLIC_NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors rounded-lg relative group"
              >
                {link.label}
                <span className="absolute bottom-1 left-3 right-3 h-px bg-[var(--accent-gradient)] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <NavLoginLink className="hidden sm:block" />
            <OutlinedButton href="/signup" className="hidden sm:inline-flex text-xs px-4 py-2">
              Sign Up
            </OutlinedButton>
            <button
              className="lg:hidden p-2 rounded-lg text-[var(--text-muted)] hover:bg-[var(--accent-blue)]/10 hover:text-[var(--accent-cyan)]"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden fixed inset-0 top-[72px] bg-[var(--bg-base)]/95 backdrop-blur-xl z-40 overflow-y-auto border-t border-[var(--glass-border)]"
          >
            <div className="px-5 py-6 flex flex-col gap-1">
              {PUBLIC_NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="text-base font-medium text-[var(--text-muted)] hover:text-[var(--accent-cyan)] py-3 border-b border-[var(--glass-border)]"
                >
                  {link.label}
                </a>
              ))}
              <NavLoginLink className="text-base font-medium text-[var(--text-muted)] hover:text-[var(--accent-cyan)] py-3" />
              <OutlinedButton href="/signup" className="mt-4 w-full">
                Sign Up
              </OutlinedButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
