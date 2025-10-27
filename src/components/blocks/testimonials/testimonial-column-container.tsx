'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

export function TestimonialColumnContainer({
  className,
  shift = 0,
  children,
}: {
  className?: string;
  shift?: number;
  children: React.ReactNode;
}) {
  const columnRef = useRef<React.ElementRef<'div'>>(null);
  const [columnHeight, setColumnHeight] = useState(0);
  // 确保最小持续时间为 20 秒，最大为 60 秒
  const minDuration = 20000; // 20 秒
  const maxDuration = 60000; // 60 秒
  const calculatedDuration = columnHeight * shift;
  const duration = `${Math.min(Math.max(calculatedDuration, minDuration), maxDuration)}ms`;

  useEffect(() => {
    if (!columnRef.current) {
      return;
    }

    const resizeObserver = new window.ResizeObserver(() => {
      setColumnHeight(columnRef.current?.offsetHeight ?? 0);
    });

    resizeObserver.observe(columnRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={columnRef}
      className={cn('animate-marquee space-y-4 py-4', className)}
      style={{ '--marquee-duration': duration } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
