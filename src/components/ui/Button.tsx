import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'secondary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg select-none cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-zinc-100 hover:bg-white text-zinc-950 font-semibold shadow-xs border border-zinc-200',
      secondary: 'bg-[#18181b] hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700',
      outline: 'bg-transparent hover:bg-zinc-800/70 text-zinc-300 border border-zinc-800 hover:border-zinc-700',
      ghost: 'bg-transparent hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-100',
      destructive: 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/50',
    };

    const sizes = {
      sm: 'text-xs px-2.5 py-1 gap-1.5 h-7',
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
