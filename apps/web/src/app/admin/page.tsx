import { auth } from '@/auth';
import { AdminPanel } from '@/components/commerce/admin-panel';
import { Button } from '@/components/ui/button';
import { getProducts } from '@/lib/api';

export default async function AdminPage() {
  const session = await auth();
  const products = await getProducts();

  if (session?.user?.role !== 'ADMIN') {
    return (
      <div className="section-shell mx-auto max-w-2xl p-10 text-center">
        <p className="font-display text-5xl uppercase tracking-[0.06em] text-scoreboard">
          Admin Access Only
        </p>
        <p className="mt-4 text-sm text-scoreboard/65">
          Use an account with the `ADMIN` role from the backend database to manage
          products.
        </p>
        <div className="mt-6">
          <Button disabled>Waiting For Admin Session</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="hero-grid section-shell stadium-band px-6 py-8 lg:px-8">
        <p className="caps-label text-scoreboard/50">
          Admin Panel
        </p>
        <h1 className="mt-3 font-display text-6xl uppercase leading-[0.92] tracking-[0.05em] text-scoreboard lg:text-7xl">
          Product Control Center
        </h1>
      </section>
      <AdminPanel
        initialProducts={products}
        apiToken={session.user.apiToken ?? ''}
      />
    </div>
  );
}
