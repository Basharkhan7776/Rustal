import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'success' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-orange-500 hover:bg-orange-600 text-white shadow-sm shadow-orange-500/20 font-semibold',
      secondary: 'bg-zinc-800/80 hover:bg-zinc-700/80 text-zinc-200 border border-zinc-750 hover:border-zinc-600',
      outline: 'bg-transparent hover:bg-zinc-800/60 text-zinc-300 border border-zinc-800 hover:border-zinc-700',
      ghost: 'bg-transparent hover:bg-zinc-800/60 text-zinc-300 hover:text-zinc-100',
      success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-500/20 font-semibold',
      destructive: 'bg-rose-600/90 hover:bg-rose-500 text-white shadow-sm shadow-rose-500/20',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1.2 gap-1.5 h-7',
      md: 'text-xs px-3 py-1.5 gap-2 h-8',
      lg: 'text-sm px-4 py-2 gap-2.5 h-10',
      icon: 'h-8 w-8 p-0 shrink-0',
    };

    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
