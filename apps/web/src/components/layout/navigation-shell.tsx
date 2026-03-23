'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Navbar } from './navbar';
import { Footer } from './footer';

const AUTH_PATHS = ['/login', '/register'];

export function NavigationShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.includes(pathname);

  if (isAuth) {
    return (
      <div className="fixed inset-0 overflow-hidden flex items-center justify-center bg-slate-50 p-4 sm:p-8">
        {children}
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="relative">{children}</main>
      <Footer />
    </>
  );
}
