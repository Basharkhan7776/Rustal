import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';

export interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical';
  onResizeStart?: () => void;
  onResize: (deltaFromStart: number) => void;
  onResizeEnd?: () => void;
  className?: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction,
  onResizeStart,
  onResize,
  onResizeEnd,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    onResizeStart?.();

    const startPos = direction === 'vertical' ? e.clientX : e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = direction === 'vertical' ? moveEvent.clientX : moveEvent.clientY;
      const totalDelta = currentPos - startPos;
      onResize(totalDelta);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onResizeEnd?.();
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = direction === 'vertical' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [direction, onResize, onResizeStart, onResizeEnd]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  return (
    <>
      {/* Fullscreen transparent shield during dragging to prevent iframes/Monaco from capturing events */}
      {isDragging && (
        <div
          className={cn(
            'fixed inset-0 z-50 select-none',
            direction === 'vertical' ? 'cursor-col-resize' : 'cursor-row-resize'
          )}
        />
      )}

      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'group relative shrink-0 z-30 select-none touch-none',
          direction === 'vertical'
            ? 'w-2 -mx-1 cursor-col-resize h-full flex items-center justify-center'
            : 'h-2 -my-1 cursor-row-resize w-full flex items-center justify-center',
          className
        )}
      >
        <div
          className={cn(
            'transition-colors duration-100',
            direction === 'vertical'
              ? 'w-[1px] h-full bg-zinc-800/80 group-hover:bg-zinc-500 group-hover:w-[2px]'
              : 'h-[1px] w-full bg-zinc-800/80 group-hover:bg-zinc-500 group-hover:h-[2px]',
            isDragging && (direction === 'vertical' ? 'bg-zinc-300 w-[2px]' : 'bg-zinc-300 h-[2px]')
          )}
        />
      </div>
    </>
  );
};
