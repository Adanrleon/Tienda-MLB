'use client';

import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ShoppingCart, User, Search, Menu } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useCart } from '../providers/cart-provider';
import { Button } from '../ui/button';
import { MlbLogo } from '../ui/mlb-logo';

const links = [
  { href: '/catalog', label: 'All Jerseys' },
  { href: '/catalog?category=Home', label: 'Home' },
  { href: '/catalog?category=Road', label: 'Away' },
  { href: '/catalog?category=City Connect', label: 'City Connect' },
];

export function Navbar() {
  const { data: session } = useSession();
  const { totalItems } = useCart();
  const { scrollY } = useScroll();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const headerBg = useTransform(
    scrollY,
    [0, 50],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)']
  );

  const headerBorder = useTransform(
    scrollY,
    [0, 50],
    ['rgba(226, 232, 240, 0)', 'rgba(226, 232, 240, 1)']
  );

  return (
    <motion.header
      style={{ backgroundColor: headerBg, borderColor: headerBorder }}
      className="sticky top-0 z-50 border-b transition-all duration-300 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-10">
        <Link href="/" className="group flex items-center gap-4">
          <img
            src="/images/Major_League_Baseball_logo.svg.webp"
            alt="MLB Logo"
            className="h-10 w-auto transition-transform duration-300 group-hover:scale-110"
          />
          <div className="hidden lg:block border-l border-slate-200 pl-4">
            <h1 className="display-title text-xl text-slate-900">
              MAJOR LEAGUE <span className="text-mlb-red">JERSEYS</span>
            </h1>
          </div>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 transition hover:text-slate-900"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-mlb-red transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchTerm.trim()) {
                router.push(`/catalog?search=${encodeURIComponent(searchTerm.trim())}`);
              }
            }}
            className="hidden items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 transition-colors focus-within:border-mlb-navy focus-within:bg-white md:flex"
          >
            <Search className="h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search teams, players..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ml-2 w-48 bg-transparent text-sm outline-none placeholder:text-slate-400"
              suppressHydrationWarning
            />
          </form>

          <div className="flex items-center border-l border-slate-200 pl-4 gap-2">
            <Link
              href="/cart"
              className="group relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-slate-100"
            >
              <ShoppingCart className="h-5 w-5 text-slate-700" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-mlb-red text-[10px] font-bold text-white shadow-lg ring-2 ring-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {session?.user ? (
              <div className="relative">
                <button
                  suppressHydrationWarning
                  onClick={() => setUserMenuOpen(o => !o)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200"
                  title={session.user.name ?? 'Profile'}
                >
                  <User className="h-5 w-5 text-slate-700" />
                </button>

                {userMenuOpen && (
                  <>
                    {/* Backdrop to close on outside click */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl ring-1 ring-slate-900/5">
                      {/* User info header */}
                      <div className="border-b border-slate-100 px-4 py-3">
                        <p className="text-xs font-bold text-slate-900 truncate">{session.user.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{session.user.email}</p>
                      </div>
                      {/* Menu items */}
                      <div className="p-1.5">
                        <button
                          suppressHydrationWarning
                          onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: '/' }); }}
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest text-mlb-red transition-colors hover:bg-red-50"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link href="/login" className="hidden sm:block">
                <Button suppressHydrationWarning className="h-10 rounded-full px-6 text-[10px] font-bold uppercase tracking-widest">
                  Login
                </Button>
              </Link>
            )}

            <button className="flex h-10 w-10 items-center justify-center lg:hidden">
              <Menu className="h-6 w-6 text-slate-900" />
            </button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
