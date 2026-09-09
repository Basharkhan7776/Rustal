import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
  className?: string;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  trigger,
  children,
  align = 'right',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen(prev => !prev)} className="inline-flex">
        {trigger}
      </div>

      {isOpen && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-1.5 min-w-[220px] rounded-xl bg-[#121215] border border-zinc-800/90 p-1.5 shadow-2xl shadow-black/80 backdrop-blur-md animate-in fade-in zoom-in-95 duration-100',
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            className
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export interface DropdownMenuItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  shortcut?: string;
  danger?: boolean;
}

export const DropdownMenuItem: React.FC<DropdownMenuItemProps> = ({
  children,
  icon,
  shortcut,
  danger,
  className,
  ...props
}) => {
  return (
    <button
      role="menuitem"
      type="button"
      className={cn(
        'w-full flex items-center justify-between gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left select-none',
        danger
          ? 'text-red-400 hover:text-red-300 hover:bg-red-500/10'
          : 'text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800/80',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5 truncate">
        {icon && <span className="w-3.5 h-3.5 flex items-center justify-center shrink-0 text-zinc-400">{icon}</span>}
        <span className="truncate">{children}</span>
      </div>
      {shortcut && (
        <kbd className="px-1.5 py-0.2 text-[9px] font-mono bg-zinc-850 text-zinc-400 border border-zinc-700/60 rounded shrink-0">
          {shortcut}
        </kbd>
      )}
    </button>
  );
};

export const DropdownMenuSeparator: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={cn('my-1 h-px bg-zinc-800/70', className)} />;
};
