import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { ProductPurchasePanel } from '@/components/commerce/product-purchase-panel';
import { ProductGallery } from '@/components/commerce/product-gallery';
import { getProductBySlug } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-4 lg:px-12 space-y-6">

      <nav className="mt-2 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-scoreboard/40 transition-all">

        <Link 
          href="/" 
          className="flex items-center gap-1.5 hover:text-mlb-red transition-colors group"
        >
          <Home className="h-3 w-3 transition-transform group-hover:scale-110" />
          <span>Home</span>
        </Link>
        <ChevronRight className="h-3 w-3 stroke-[3px] text-scoreboard/20" />
        <Link 
          href="/catalog" 
          className="hover:text-mlb-red transition-colors"
        >
          Jerseys
        </Link>
        <ChevronRight className="h-3 w-3 stroke-[3px] text-scoreboard/20" />
        <span className="font-black text-mlb-navy/60">{product.team}</span>
      </nav>


      <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
        <section className="section-shell p-5">
          <ProductGallery product={product} />
        </section>


        <section className="space-y-5">
          <div className="section-shell p-6 lg:p-8">
            <div className="flex flex-wrap gap-2">
              <span className="info-chip">Authentic Jersey</span>
              <span className="info-chip">{product.category}</span>
            </div>
            <p className="mt-5 caps-label text-scoreboard/44">{product.team}</p>
            <h1 className="mt-3 font-sans text-4xl font-extrabold uppercase leading-[0.94] tracking-[-0.05em] text-scoreboard lg:text-[4.3rem]">
              {product.name}
            </h1>
            <p className="mt-5 font-sans text-4xl font-extrabold leading-none text-dugout">
              {formatCurrency(product.priceInCents)}
            </p>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-scoreboard/66 lg:text-base">
              {product.description}
            </p>
          </div>

          <ProductPurchasePanel product={product} />

          <div className="section-shell p-6">
            <p className="caps-label text-scoreboard/42">Details</p>
            <div className="mt-4 space-y-3 text-sm leading-6 text-scoreboard/66">
              <p>Official MLB jersey presentation with team-first styling and premium fit.</p>
              <p>Available across selected sizes with direct checkout and cart purchase flow.</p>
              <p>Designed for a cleaner retail-style product page without altering store logic.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
