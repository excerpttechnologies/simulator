'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';

const base =
  'inline-flex items-center justify-center gap-2 font-semibold text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]';

export function PrimaryButton({
  children,
  href,
  className,
  onClick,
  type = 'button',
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
}) {
  const cls = cn(
    base,
    'rounded-full bg-gradient-to-r from-[#FF7A00] via-[#FF9D2E] to-[#FFC857] text-white px-6 py-3.5 hover:scale-[1.03] hover:shadow-[0_8px_28px_rgba(255,122,0,0.40)] active:scale-[0.98]',
    className,
  );

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} className={cls}>
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        base,
        'rounded-full px-6 py-3.5 text-[var(--text-primary)] bg-white/80 border border-[var(--glass-border)] backdrop-blur-xl hover:scale-[1.03] hover:border-[var(--accent-blue)] hover:shadow-[0_4px_20px_rgba(255,122,0,0.15)]',
        className,
      )}
    >
      {children}
    </a>
  );
}

export function OutlinedButton({
  children,
  href,
  className,
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        base,
        'rounded-full px-5 py-2.5 text-[var(--text-primary)] border border-[var(--glass-border)] bg-transparent hover:bg-[var(--accent-blue)]/5 hover:border-[var(--accent-blue)]',
        className,
      )}
    >
      {children}
    </a>
  );
}

export function NavLoginLink({ className }: { className?: string }) {
  return (
    <Link
      href="/login"
      className={cn('text-sm font-medium text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors', className)}
    >
      Login
    </Link>
  );
}
