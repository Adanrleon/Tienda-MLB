'use client';

import { FormEvent, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '../ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const redirectTo = searchParams.get('redirectTo') ?? '/';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get('name') ?? '');
    const email = String(formData.get('email') ?? '');
    const password = String(formData.get('password') ?? '');

    startTransition(() => {
      void (async () => {
        try {
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
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="section-shell-dark hidden p-8 lg:block">
        <div className="relative z-[1]">
          <p className="caps-label text-[#f06f83]">Member Access</p>
          <h2 className="mt-4 font-sans text-5xl font-extrabold tracking-[-0.05em] text-white">
            Sign In To Continue Shopping
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/72">
            Sign in to unlock cart actions, direct checkout, and a smoother path from
            product page to payment.
          </p>
          <div className="mt-8 grid gap-3">
            <div className="rounded-[0.9rem] border border-white/10 bg-white/6 px-4 py-4">
              <p className="font-semibold text-white">Checkout-ready sessions</p>
              <p className="mt-1 text-sm leading-6 text-white/66">
                Card and PayPal flows stay connected to your authenticated session.
              </p>
            </div>
            <div className="rounded-[0.9rem] border border-white/10 bg-white/6 px-4 py-4">
              <p className="font-semibold text-white">Fast re-entry</p>
              <p className="mt-1 text-sm leading-6 text-white/66">
                Buy-now and cart redirects return you to the right place automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="section-shell mx-auto w-full max-w-xl p-8 lg:p-10">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="caps-label text-scoreboard/50">Account Access</p>
            <h1 className="mt-2 font-sans text-4xl font-extrabold tracking-[-0.05em] text-scoreboard">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
          </div>
          <Button
            variant="ghost"
            onClick={() => setMode((current) => (current === 'login' ? 'register' : 'login'))}
          >
            {mode === 'login' ? 'Need an account?' : 'Already have one?'}
          </Button>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          {mode === 'register' ? (
            <label className="flex flex-col gap-2">
              <span className="caps-label text-scoreboard/50">Name</span>
              <input name="name" required className="form-control" />
            </label>
          ) : null}
          <label className="flex flex-col gap-2">
            <span className="caps-label text-scoreboard/50">Email</span>
            <input name="email" type="email" required className="form-control" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="caps-label text-scoreboard/50">Password</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="form-control"
            />
          </label>
          {error ? <p className="text-sm font-semibold text-seam">{error}</p> : null}
          <Button className="w-full" type="submit" disabled={isPending}>
            {isPending ? 'Working...' : mode === 'login' ? 'Login' : 'Register & Login'}
          </Button>
        </form>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button variant="secondary" onClick={() => signIn('google', { redirectTo })}>
            Continue with Google
          </Button>
          <Button variant="secondary" onClick={() => signIn('github', { redirectTo })}>
            Continue with GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
