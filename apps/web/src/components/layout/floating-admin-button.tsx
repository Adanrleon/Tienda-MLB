'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Settings } from 'lucide-react';

export function FloatingAdminButton() {
  const { data: session } = useSession();

  // Show if the user is authenticated and has the ADMIN role, or the admin email
  const isAuthorized = session?.user && (
    (session.user as any).role === 'ADMIN' || 
    session.user.email === 'mariacarbonell@gmail.com'
  );

  if (!isAuthorized) {
    return null;
  }

  return (
    <Link
      href="/admin"
      className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-mlb-red text-white shadow-2xl transition-transform hover:scale-110 hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-mlb-red/50"
      aria-label="Admin Dashboard"
      title="Admin Dashboard"
    >
      <Settings className="h-6 w-6" />
    </Link>
  );
}
