import { Suspense } from 'react';
import { CatalogShell } from '@/components/commerce/catalog-shell';
import { getProducts } from '@/lib/api';

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <div className="space-y-12 pb-0">
      <section className="relative w-full overflow-hidden bg-slate-950 px-4 py-16 sm:px-10 lg:px-20 lg:py-24 border-b border-white/10">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/images/unnamed.jpg"
            alt="Stadium"
            className="h-full w-full object-cover object-center opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-10 bg-mlb-red" />
            <p className="caps-label text-white/60">Official Retailer</p>
          </div>
          <h1 className="display-title text-5xl text-white sm:text-7xl lg:text-[6.5rem]">
            AUTHENTIC <span className="text-mlb-red">COLLECTION</span>
          </h1>
          <p className="max-w-2xl text-lg text-white/60 leading-relaxed font-medium">
            The complete Major League lineup. From classic pinstripes to advanced City Connect designs,
            explore the exact apparel worn by professional athletes across all 30 organizations.
          </p>
        </div>
      </section>
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <Suspense fallback={<div className="py-20 text-center text-slate-400">Loading catalog...</div>}>
          <CatalogShell products={products} />
        </Suspense>
      </div>
    </div>
  );
}
