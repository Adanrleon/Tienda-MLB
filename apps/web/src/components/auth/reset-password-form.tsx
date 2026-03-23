'use client';

import { FormEvent, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get('password') ?? '');
    const confirmPassword = String(formData.get('confirmPassword') ?? '');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token, password }),
          });

          const data = await response.json();

          if (response.ok) {
            setSuccess('Your password has been successfully reset.');
            setTimeout(() => {
              router.push('/login');
            }, 3000);
          } else {
            setError(data.message || 'Failed to reset password.');
          }
        } catch {
          setError('Server is unavailable. Please try again later.');
        }
      })();
    });
  };

  if (!token) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-mlb-navy mb-4 uppercase tracking-tighter">Missing Token</h1>
        <p className="text-slate-500 mb-6">You need a valid reset link to change your password.</p>
        <button 
          onClick={() => router.push('/login')}
          className="text-mlb-red font-bold uppercase tracking-widest text-sm hover:underline"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl ring-1 ring-slate-900/5 lg:grid lg:min-h-[600px] lg:grid-cols-2">
      {/* Left side: Hero Image / Branding */}
      <div className="relative hidden lg:block overflow-hidden">
        <img
          src="/images/fondo.jpg"
          alt="Baseball field"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-mlb-navy/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-mlb-navy/90 via-mlb-navy/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-12">
          <p className="font-display tracking-[0.2em] text-mlb-red text-sm font-bold uppercase mb-4">Security Center</p>
          <h2 className="text-4xl font-display uppercase tracking-wide text-white leading-tight">
            Reset Your Account Password
          </h2>
          <p className="mt-4 max-w-sm text-sm text-white/80 leading-relaxed font-medium">
            Please enter a new secure password for your MLB account to regain full access to your collection.
          </p>
        </div>
      </div>

      {/* Right side: Form Details */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-white relative">
        <div className="absolute top-8 right-8">
          <img src="/images/Major_League_Baseball_logo.svg.webp" alt="MLB Logo" className="h-6 w-auto opacity-20" />
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mlb-red mb-2">Final Step</p>
              <h1 className="font-display text-3xl uppercase tracking-wide text-mlb-navy">
                Set New Password
              </h1>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">New Password</label>
              <input
                suppressHydrationWarning
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-mlb-red focus:bg-white focus:ring-1 focus:ring-mlb-red"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Confirm New Password</label>
              <input
                suppressHydrationWarning
                name="confirmPassword"
                type="password"
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-mlb-red focus:bg-white focus:ring-1 focus:ring-mlb-red"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-center border border-red-100">
                <p className="text-xs font-bold text-mlb-red">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-emerald-50 p-4 text-center border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-700 leading-relaxed">{success}</p>
                <p className="mt-2 text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Redirecting to login...</p>
              </div>
            )}

            <button
              suppressHydrationWarning
              type="submit"
              disabled={isPending || !!success}
              className="mt-6 w-full rounded-xl bg-mlb-navy py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-mlb-navy/20 transition-all hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:transform-none"
            >
              {isPending ? 'Updating...' : 'Set New Password'}
            </button>
          </form>

          <p className="mt-10 text-center text-[11px] font-semibold text-slate-500">
            Remembered your password?
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => router.push('/login')}
              className="font-bold text-mlb-navy hover:text-mlb-red transition-colors uppercase tracking-widest ml-1"
            >
              Back to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
