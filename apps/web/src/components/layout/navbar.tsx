'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, User } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useCart } from '../providers/cart-provider';
import { Button } from '../ui/button';

const links = [
  { href: '/', label: 'Home' },
  { href: '/catalog', label: 'Jerseys' },
  { href: '/checkout?mode=cart', label: 'Checkout' },
];

export function Navbar() {
  const { data: session } = useSession();
  const { totalItems } = useCart();

  return (
    <motion.header
      initial={{ opacity: 0, y: -18 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-40 border-b border-scoreboard/8 bg-white/96 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[88rem] items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <p className="font-display text-2xl uppercase leading-none tracking-[0.04em] text-dugout sm:text-[2.1rem]">
              MLB Authentic
            </p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.28em] text-scoreboard/42">
              Official Jersey Shop
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b-2 border-transparent pb-1 text-sm font-semibold text-scoreboard/70 transition hover:border-seam hover:text-scoreboard"
            >
              {link.label}
            </Link>
          ))}
          {session?.user?.role === 'ADMIN' ? (
            <Link
              href="/admin"
              className="border-b-2 border-transparent pb-1 text-sm font-semibold text-seam transition hover:border-seam hover:text-[#b51f32]"
            >
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative inline-flex h-9 items-center gap-2 rounded-md border border-scoreboard/10 bg-white px-3 text-sm font-semibold text-scoreboard transition hover:border-dugout/25"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <span className="rounded-full bg-dugout px-1.5 py-0.5 text-[10px] text-white">
              {totalItems}
            </span>
          </Link>
          {session?.user ? (
            <button
              onClick={() => signOut({ redirectTo: '/' })}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-scoreboard/10 px-3 text-sm font-semibold text-scoreboard transition hover:border-dugout/25"
            >
              <User className="h-4 w-4" />
              <span>{session.user.name?.split(' ')[0] ?? 'Sign out'}</span>
            </button>
          ) : (
            <Link href="/login">
              <Button className="h-9 px-4 py-0">Login</Button>
            </Link>
          )}
        </div>
      </div>
    </motion.header>
  );
}
