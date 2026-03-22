'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { Button } from '../ui/button';

type Props = {
  open: boolean;
  onClose: () => void;
  redirectTo?: string;
};

export function LoginModal({ open, onClose, redirectTo = '/catalog' }: Props) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-scoreboard/55 px-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            className="w-full max-w-md rounded-[2rem] border border-white/70 bg-diamond p-8 shadow-card"
          >
            <p className="font-display text-4xl uppercase tracking-[0.06em] text-scoreboard">
              Login Required
            </p>
            <p className="mt-3 text-sm leading-7 text-scoreboard/70">
              You need an account before adding jerseys to the cart or starting
              checkout.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button onClick={() => signIn('google', { redirectTo })}>
                Continue with Google
              </Button>
              <Button
                variant="secondary"
                onClick={() => signIn('github', { redirectTo })}
              >
                Continue with GitHub
              </Button>
              <Link href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`} onClick={onClose}>
                <Button variant="ghost" className="w-full">
                  Use Email & Password
                </Button>
              </Link>
            </div>
            <button
              onClick={onClose}
              className="mt-5 text-sm font-semibold text-scoreboard/60 transition hover:text-scoreboard"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
