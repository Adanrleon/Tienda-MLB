import { CatalogShell } from '@/components/commerce/catalog-shell';
import { getProducts } from '@/lib/api';

export default async function CatalogPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <section className="section-shell-dark px-6 py-8 lg:px-8 lg:py-12">
        <p className="caps-label text-[#f06f83]">
          Catalog
        </p>
        <h1 className="relative z-[1] mt-3 max-w-4xl font-sans text-5xl font-extrabold uppercase leading-[0.94] tracking-[-0.05em] text-white lg:text-[4.8rem]">
          Official Authentic Collection
        </h1>
        <p className="relative z-[1] mt-4 max-w-3xl text-sm leading-7 text-white/74 lg:text-base">
          Browse MLB jerseys across home, away, alternate and throwback looks through a
          retail-style catalog built for quick selection.
        </p>
      </section>
      <CatalogShell products={products} />
    </div>
  );
}
