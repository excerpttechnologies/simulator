'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  widget?: boolean;
};

export function GlassCard({ children, className, hover = false, widget = false }: GlassCardProps) {
  const Comp = hover ? motion.div : 'div';
  const hoverProps = hover
    ? {
        whileHover: { y: -4, transition: { duration: 0.2 } },
      }
    : {};

  return (
    <Comp
      className={cn(
        'relative rounded-[22px] border backdrop-blur-[20px]',
        widget
          ? 'bg-[var(--widget-bg)] border-[rgba(15,23,42,0.07)] text-[var(--widget-text)] shadow-[0_8px_32px_rgba(15,23,42,0.08),0_2px_8px_rgba(15,23,42,0.04)]'
          : 'bg-[var(--bg-glass)] border-[var(--glass-border)] shadow-[0_4px_24px_rgba(15,23,42,0.07),0_1px_3px_rgba(15,23,42,0.04)]',
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent',
        hover && 'transition-[border-color,box-shadow,transform] hover:border-[var(--accent-blue)] hover:shadow-[0_8px_36px_rgba(255,122,0,0.12),0_2px_8px_rgba(15,23,42,0.06)]',
        className,
      )}
      {...hoverProps}
    >
      {children}
    </Comp>
  );
}
