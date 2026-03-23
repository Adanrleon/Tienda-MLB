import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => (
    <button
      suppressHydrationWarning
      ref={ref}
      className={cn(
        'btn-premium',
        variant === 'primary' && 'btn-premium-primary',
        variant === 'secondary' && 'btn-premium-secondary',
        variant === 'ghost' && 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
        variant === 'danger' && 'bg-mlb-red text-white hover:bg-[#c91f39] shadow-lg shadow-mlb-red/20',
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
