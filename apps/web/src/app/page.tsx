import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { getFeaturedProducts, getProducts } from '@/lib/api';
import { ProductCard } from '@/components/commerce/product-card';
import { Button } from '@/components/ui/button';

const TEAM_CODES: Record<string, string> = {
  'Arizona Diamondbacks': 'ARI',
  'Atlanta Braves': 'ATL',
  'Boston Red Sox': 'BOS',
  'Chicago Cubs': 'CHC',
  'Los Angeles Dodgers': 'LAD',
  'New York Yankees': 'NYY',
  'San Diego Padres': 'SDP',
};

export default async function HomePage() {
  const products = await getProducts();
  const featuredProducts = await getFeaturedProducts();
  const spotlightProduct = featuredProducts[0];
  const featuredTeams = products
    .reduce<
      Array<{ team: string; accent: string }>
    >((teams, product) => {
      if (teams.some((entry) => entry.team === product.team)) {
        return teams;
      }

      teams.push({ team: product.team, accent: product.accent });
      return teams;
    }, [])
    .slice(0, 6);

  return (
    <div className="space-y-10 pb-8">
      <section className="section-shell overflow-hidden">
        <div className="grid lg:grid-cols-[1fr_0.92fr]">
          <div className="relative overflow-hidden bg-[linear-gradient(160deg,#153977_0%,#0d2d63_56%,#081d46_100%)] px-6 py-10 text-white lg:px-10 lg:py-14">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.1),transparent_35%)]" />
            <div className="relative z-[1] fade-up">
              <p className="caps-label text-[#f06f83]">Elite Performance Gear</p>
              <h1 className="mt-4 max-w-3xl font-sans text-5xl font-extrabold leading-[0.94] tracking-[-0.04em] text-white sm:text-6xl lg:text-[4.9rem]">
                Represent Your Team. Live MLB Authentic.
              </h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/78 lg:text-base">
                Discover official-team MLB jerseys with a cleaner shopping experience,
                fast checkout, and merchandising inspired by premium baseball retail.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/catalog">
                  <Button className="gap-2 bg-white text-dugout hover:bg-white/90">
                    Shop Jerseys
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    variant="secondary"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/14 hover:text-white"
                  >
                    View Collection
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative min-h-[22rem] bg-[#102b59] lg:min-h-[30rem]">
            {spotlightProduct?.images[0]?.url ? (
              <img
                src={spotlightProduct.images[0].url}
                alt={spotlightProduct.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : null}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,45,99,0.16),rgba(13,45,99,0.82))]" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_62%)]" />
            <div className="absolute inset-x-6 bottom-6 rounded-[1rem] border border-white/10 bg-[rgba(8,22,52,0.72)] px-5 py-5 text-white backdrop-blur-sm">
              <p className="caps-label text-white/52">Featured Jersey</p>
              <h2 className="mt-2 font-sans text-3xl font-extrabold uppercase leading-none tracking-[-0.04em]">
                {spotlightProduct?.team ?? 'MLB Select'}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/74">
                {spotlightProduct?.description ??
                  'Premium MLB jersey presentation with a direct path to checkout.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="caps-label text-scoreboard/46">Featured Teams</p>
            <h2 className="mt-2 font-sans text-4xl font-extrabold uppercase tracking-[-0.04em] text-scoreboard">
              Teams In Focus
            </h2>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {featuredTeams.map((team) => (
            <div key={team.team} className="section-shell p-4 text-center">
              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-md text-sm font-bold uppercase tracking-[0.14em] text-white"
                style={{ backgroundColor: team.accent }}
              >
                {TEAM_CODES[team.team] ?? team.team.slice(0, 3).toUpperCase()}
              </div>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-scoreboard/78">
                {team.team}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="caps-label text-scoreboard/46">Best Sellers</p>
            <h2 className="mt-2 font-sans text-4xl font-extrabold uppercase tracking-[-0.04em] text-scoreboard">
              Featured Jerseys
            </h2>
          </div>
          <Link href="/catalog">
            <Button variant="ghost" className="px-0 text-dugout hover:bg-transparent">
              View Collection
            </Button>
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {featuredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </section>

    </div>
  );
}
