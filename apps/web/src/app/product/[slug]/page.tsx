import { notFound } from 'next/navigation';
import { ProductPurchasePanel } from '@/components/commerce/product-purchase-panel';
import { JerseyVisual } from '@/components/ui/jersey-visual';
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

  const imageUrl = product.images[0]?.url;
  const galleryItems = product.images.length
    ? product.images.slice(0, 4)
    : [{ url: imageUrl ?? '', alt: product.name }];

  return (
    <div className="space-y-6">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-scoreboard/42">
        Home / Jerseys / {product.team}
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.02fr_0.98fr]">
        <section className="section-shell p-5">
          <div className="grid gap-4 md:grid-cols-[5.5rem_1fr]">
            <div className="space-y-3">
              {galleryItems.map((item, index) => (
                <div
                  key={`${item.url}-${index}`}
                  className="overflow-hidden rounded-[0.7rem] border border-scoreboard/8 bg-[var(--page-panel)] p-2"
                >
                  {item.url ? (
                    <img
                      src={item.url}
                      alt={item.alt ?? product.name}
                      className="h-16 w-full object-contain"
                    />
                  ) : (
                    <JerseyVisual
                      team={product.team}
                      category={product.category}
                      accent={product.accent}
                      className="h-16 rounded-[0.45rem]"
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-[0.9rem] bg-[var(--page-panel)] p-5">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={product.name}
                  className="h-[30rem] w-full rounded-[0.75rem] object-contain lg:h-[38rem]"
                />
              ) : (
                <JerseyVisual
                  team={product.team}
                  category={product.category}
                  accent={product.accent}
                  className="h-[30rem] rounded-[0.75rem] lg:h-[38rem]"
                />
              )}
            </div>
          </div>
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
