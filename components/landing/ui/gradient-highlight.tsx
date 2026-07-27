'use client';

import { cn } from '@/lib/utils';

export function GradientHighlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn('relative inline-block', className)}>
      <span
        className="absolute inset-0 -inset-x-2 -inset-y-1 rounded-2xl bg-[var(--accent-gradient)]"
        aria-hidden
      />
      <span
        className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--accent-violet)] rotate-45 rounded-sm"
        style={{ background: 'var(--accent-gradient)' }}
        aria-hidden
      />
      <span className="relative z-10 font-extrabold text-[#05060B] px-1">{children}</span>
    </span>
  );
}
