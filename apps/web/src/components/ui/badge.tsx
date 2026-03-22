import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Badge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-scoreboard/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-scoreboard/78',
        className,
      )}
    >
      {children}
    </span>
  );
}
