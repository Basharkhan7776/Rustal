import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';

export interface ResizeHandleProps {
  direction: 'horizontal' | 'vertical'; // vertical = divider is vertical (drags left/right), horizontal = divider is horizontal (drags up/down)
  onResize: (delta: number) => void;
  className?: string;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  direction,
  onResize,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);

    const startPos = direction === 'vertical' ? e.clientX : e.clientY;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentPos = direction === 'vertical' ? moveEvent.clientX : moveEvent.clientY;
      const delta = currentPos - startPos;
      if (delta !== 0) {
        onResize(delta);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = direction === 'vertical' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
  }, [direction, onResize]);

  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        'group relative shrink-0 transition-colors z-30 select-none',
        direction === 'vertical'
          ? 'w-[5px] -mx-[2px] cursor-col-resize h-full flex items-center justify-center'
          : 'h-[5px] -my-[2px] cursor-row-resize w-full flex items-center justify-center',
        className
      )}
    >
      <div
        className={cn(
          'transition-colors duration-150',
          direction === 'vertical'
            ? 'w-[1px] h-full bg-zinc-800/80 group-hover:bg-zinc-500 group-active:bg-zinc-300'
            : 'h-[1px] w-full bg-zinc-800/80 group-hover:bg-zinc-500 group-active:bg-zinc-300',
          isDragging && 'bg-zinc-300'
        )}
      />
    </div>
  );
};
