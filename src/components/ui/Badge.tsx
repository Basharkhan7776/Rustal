import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'purple' | 'outline';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors select-none';

  const variants = {
    default: 'bg-zinc-850 text-zinc-300 border-zinc-750',
    success: 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60',
    warning: 'bg-amber-950/50 text-amber-300 border-amber-800/60',
    info: 'bg-sky-950/50 text-sky-300 border-sky-800/60',
    purple: 'bg-purple-950/50 text-purple-300 border-purple-800/60',
    outline: 'bg-transparent text-zinc-400 border-zinc-800',
  };

  const sizes = {
    sm: 'text-[10px] px-1.5 py-0.5 leading-none',
    md: 'text-xs px-2 py-0.5 leading-none',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
