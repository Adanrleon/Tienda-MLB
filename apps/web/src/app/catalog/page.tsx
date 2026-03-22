import { CatalogShell } from '@/components/commerce/catalog-shell';
import { getProducts } from '@/lib/api';

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <div className="space-y-12 pb-20">
      <section className="section-shell-dark px-10 py-16 lg:px-20 lg:py-24">
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-10 bg-mlb-red" />
            <p className="caps-label text-white/60">Official Retailer</p>
          </div>
          <h1 className="display-title text-5xl text-white sm:text-7xl lg:text-[6.5rem]">
            AUTHENTIC <span className="text-mlb-red">COLLECTION</span>
          </h1>
          <p className="max-w-2xl text-lg text-white/50 leading-relaxed">
            The complete Major League lineup. From classic pinstripes to advanced City Connect designs, 
            explore the exact apparel worn by professional athletes across all 30 organizations.
          </p>
        </div>
        <div className="stadium-overlay opacity-30" />
      </section>
      <CatalogShell products={products} />
    </div>
  );
}
