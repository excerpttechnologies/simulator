'use client';

import { cn } from '@/lib/utils';

export function Marquee({
  children,
  className,
  speed = 30,
}: {
  children: React.ReactNode;
  className?: string;
  speed?: number;
}) {
  return (
    <div className={cn('relative overflow-hidden', className)}>
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[var(--bg-base)] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[var(--bg-base)] to-transparent z-10 pointer-events-none" />
      <div
        className="flex w-max gap-6 marquee-track"
        style={{ animationDuration: `${speed}s` }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}
