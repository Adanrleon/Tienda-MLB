import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-md px-5 py-3 text-sm font-semibold tracking-[0.02em] transition duration-200 focus:outline-none focus:ring-2 focus:ring-seam/30 disabled:cursor-not-allowed disabled:opacity-60',
        variant === 'primary' &&
          'border border-dugout bg-dugout text-white shadow-[0_10px_20px_rgba(13,45,99,0.14)] hover:bg-[#0a2554]',
        variant === 'secondary' &&
          'border border-scoreboard/10 bg-white text-scoreboard hover:border-dugout/25 hover:bg-[#f7f9fc]',
        variant === 'ghost' &&
          'bg-transparent text-scoreboard hover:bg-scoreboard/5',
        variant === 'danger' &&
          'border border-seam bg-seam text-white shadow-[0_10px_20px_rgba(220,35,64,0.16)] hover:bg-[#c91f39]',
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
