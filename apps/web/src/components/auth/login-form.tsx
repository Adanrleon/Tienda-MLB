'use client';

import { FormEvent, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '../ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const redirectTo = searchParams.get('redirectTo') ?? '/';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '');
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    startTransition(() => {
      void (async () => {
        try {
          if (mode === 'forgot') {
            const response = await fetch(`${API_URL}/auth/forgot-password`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
              setSuccess(data.message);
            } else {
              setError(data.message || 'Something went wrong.');
            }
            return;
          }

          if (mode === 'register') {
            const response = await fetch(`${API_URL}/auth/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
              setError('Registration failed. Check the backend API and try again.');
              return;
            }
          }

          const result = await signIn('credentials', {
            email,
            password,
            redirect: false,
          });

          if (result?.error) {
            setError('Invalid credentials.');
            return;
          }

          router.push(redirectTo);
          router.refresh();
        } catch {
          setError('Authentication is unavailable until the backend is running.');
        }
      })();
    });
  };

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
          <p className="font-display tracking-[0.2em] text-mlb-red text-sm font-bold uppercase mb-4">Official MLB Gear</p>
          <h2 className="text-4xl font-display uppercase tracking-wide text-white leading-tight">
            {mode === 'forgot' ? 'Security & Access' : 'Sign In To Continue Shopping'}
          </h2>
          <p className="mt-4 max-w-sm text-sm text-white/80 leading-relaxed font-medium">
            {mode === 'forgot' 
              ? 'Enter your email address and we will send you a secure link to reset your account credentials.' 
              : 'Unlock checkout-ready sessions, exclusive early access, and a tailored home plate for managing your collection.'}
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
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mlb-red mb-2">
                {mode === 'forgot' ? 'Password Reset' : 'Account Access'}
              </p>
              <h1 className="font-display text-3xl uppercase tracking-wide text-mlb-navy">
                {mode === 'login' ? 'Welcome Back' : mode === 'register' ? 'Create Account' : 'Recover Access'}
              </h1>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Full Name</label>
                <input
                  suppressHydrationWarning
                  name="name"
                  required
                  placeholder="Shohei Ohtani"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-mlb-red focus:bg-white focus:ring-1 focus:ring-mlb-red"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Email Address</label>
              <input
                suppressHydrationWarning
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition-all placeholder:text-slate-400 focus:border-mlb-red focus:bg-white focus:ring-1 focus:ring-mlb-red"
              />
            </div>

            {mode !== 'forgot' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Password</label>
                  {mode === 'login' && (
                    <button 
                      type="button" 
                      onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
                      suppressHydrationWarning 
                      className="text-[11px] font-bold text-slate-400 hover:text-mlb-red transition-colors"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
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
            )}

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-center border border-red-100">
                <p className="text-xs font-bold text-mlb-red">{error}</p>
              </div>
            )}

            {success && (
              <div className="rounded-lg bg-emerald-50 p-4 text-center border border-emerald-100">
                <p className="text-xs font-semibold text-emerald-700 leading-relaxed">{success}</p>
              </div>
            )}

            <button
              suppressHydrationWarning
              type="submit"
              disabled={isPending}
              className="mt-6 w-full rounded-xl bg-mlb-navy py-3.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-mlb-navy/20 transition-all hover:bg-slate-800 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:transform-none"
            >
              {isPending 
                ? 'Processing...' 
                : mode === 'login' 
                  ? 'Sign In To Account' 
                  : mode === 'register' 
                    ? 'Create Account & Sign In' 
                    : 'Send Reset Link'}
            </button>
          </form>

          {mode !== 'forgot' && (
            <>
              <div className="mt-8 relative">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-slate-100" />
                </div>
                <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="bg-white px-4 text-slate-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => signIn('google', { redirectTo })}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  Google
                </button>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => signIn('github', { redirectTo })}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                >
                  GitHub
                </button>
              </div>
            </>
          )}

          <p className="mt-10 text-center text-[11px] font-semibold text-slate-500">
            {mode === 'login' 
              ? "Don't have an account? " 
              : mode === 'register' 
                ? "Already have an account? " 
                : "Remember your password? "}
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => {
                setMode(m => m === 'register' ? 'login' : 'register');
                if (mode === 'forgot') setMode('login');
                setError(null);
                setSuccess(null);
              }}
              className="font-bold text-mlb-navy hover:text-mlb-red transition-colors uppercase tracking-widest ml-1"
            >
              {mode === 'login' ? 'Register Now' : mode === 'register' ? 'Sign In' : 'Back to Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

