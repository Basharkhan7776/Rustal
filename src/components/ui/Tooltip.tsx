import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  shortcut?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  children: React.ReactElement;
  className?: string;
  delay?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  shortcut,
  side = 'bottom',
  children,
  className,
  delay = 150,
}) => {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, delay);
  };

  const hide = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-flex items-center justify-center"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && content && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-50 pointer-events-none flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium text-zinc-200 bg-[#18181b] border border-zinc-700/80 shadow-xl shadow-black/60 whitespace-nowrap animate-in fade-in zoom-in-95 duration-100',
            positionClasses[side],
            className
          )}
        >
          <span>{content}</span>
          {shortcut && (
            <kbd className="px-1 py-0.2 text-[9px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700/60 rounded">
              {shortcut}
            </kbd>
          )}
        </div>
      )}
    </div>
  );
};
