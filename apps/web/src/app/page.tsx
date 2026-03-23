import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Zap } from 'lucide-react';
import { getFeaturedProducts, getProducts } from '@/lib/api';
import { ProductCard } from '@/components/commerce/product-card';
import { Button } from '@/components/ui/button';
import { TeamCarousel } from '@/components/commerce/team-carousel';
import { PlayerCarousel } from '@/components/commerce/player-carousel';

export default async function HomePage() {
  const products = await getProducts();
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="space-y-24">
      {/* Cinematic Hero Section - Full Width */}
      <section className="relative -mt-[1px] h-[85vh] min-h-[600px] overflow-hidden bg-slate-900 shadow-2xl">
        <div className="absolute inset-0">
          <img
            src="/images/x7flvoyyd3agxhve4z0a.jpg"
            alt="MLB Hero"
            className="h-full w-full object-cover object-center opacity-60 brightness-75 transition-transform duration-[10s] hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        <div className="relative flex h-full items-center">
          <div className="mx-auto w-full max-w-[90rem] px-10 lg:px-20">
            <div className="max-w-4xl space-y-8 animate-in">
              <div className="flex items-center gap-3">
                <span className="h-0.5 w-12 bg-mlb-red" />
                <p className="caps-label text-white text-glow">Official On-Field Apparel</p>
              </div>

              <h1 className="display-title text-6xl text-white sm:text-7xl lg:text-[7.5rem]">
                EVERY <span className="text-mlb-red">PITCH</span>.<br />
                EVERY <span className="underline decoration-mlb-red decoration-4 transition-all hover:decoration-white">STITCH</span>.
              </h1>

              <p className="max-w-xl text-lg text-slate-300 leading-relaxed font-medium">
                Experience the authentic craftsmanship of the Major Leagues.
                Our Elite Series jerseys are engineered for performance and
                designed for the true devotee.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/catalog">
                  <Button className="h-16 px-10 text-xs font-bold tracking-[0.2em] uppercase rounded-full">
                    Shop Elite Collection
                  </Button>
                </Link>
                <Link href="/catalog?category=Home">
                  <button suppressHydrationWarning className="group h-16 px-10 rounded-full border-2 border-white/60 text-white text-xs font-bold tracking-[0.2em] uppercase transition-all duration-300 hover:bg-white hover:text-slate-900 hover:border-white flex items-center gap-2">
                    View Home Originals
                    <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 right-10 hidden flex-col gap-10 text-white/50 text-[10px] font-bold uppercase tracking-[0.3em] sm:flex lg:flex-row">
          <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-mlb-red" /> Official Player Jersey</div>
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-mlb-red" /> Verified League Product</div>
          <div className="flex items-center gap-2"><Star className="h-4 w-4 text-mlb-red" /> Finest MLB Merch</div>
        </div>
      </section>

      <div className="mx-auto max-w-[90rem] space-y-24 px-4 sm:px-6 lg:px-10">
        {/* 30-Team Carousel */}
        <TeamCarousel />

        {/* Featured Jerseys Grid */}
        <section className="space-y-12">
          <div className="flex items-end justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-1 w-1 rounded-full bg-mlb-red" />
                <p className="caps-label">Curated Selection</p>
              </div>
              <h2 className="display-title text-5xl text-slate-900">Elite <span className="text-mlb-red">Jerseys</span> In Focus</h2>
            </div>
            <Link href="/catalog" className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-600 transition hover:text-mlb-navy">
              Browse All Collection <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-2" />
            </Link>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </section>
      </div>

      {/* Featured Player Spotlight — Full Width */}
      <section className="relative h-[75vh] min-h-[600px] overflow-hidden bg-slate-950">
        {/* Background image with same overlay effect */}
        <div className="absolute inset-0">
          <img
            src="/images/aaron_judge_michaelmooneygetty.webp"
            alt="The Judge Era"
            className="h-full w-full object-cover object-center"
          />
          {/* Dark overlays — control darkness here, not on the image */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/50 to-slate-950/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />
        </div>

        {/* Content */}
        <div className="relative flex h-full items-center">
          <div className="mx-auto w-full max-w-[90rem] px-10 lg:px-20">
            <div className="max-w-2xl space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-mlb-red/40 bg-mlb-red/10 px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-mlb-red backdrop-blur-sm">
                <Star className="h-3 w-3 fill-mlb-red" /> Spotlight Star
              </div>

              <h3 className="display-title text-7xl text-white lg:text-[8rem]">
                THE JUDGE <br /><span className="text-mlb-red">ERA</span>.
              </h3>

              <p className="text-lg text-slate-300 leading-relaxed max-w-lg">
                Represent the Bronx Bombers in style. The 2024 Captain's Collection
                features the exact specifications worn on-field in New York.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/catalog?team=New York Yankees">
                  <button suppressHydrationWarning className="group relative h-14 overflow-hidden rounded-full bg-mlb-red px-10 text-xs font-bold tracking-[0.15em] uppercase text-white shadow-lg shadow-mlb-red/30 transition-all duration-300 hover:shadow-mlb-red/50 hover:shadow-xl hover:scale-[1.02]">
                    {/* Shimmer sweep on hover */}
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
                    <span className="relative">Shop Yankees Collection</span>
                  </button>
                </Link>
                <Link href="/catalog">
                  <button suppressHydrationWarning className="group h-14 px-10 rounded-full border-2 border-white/60 text-white text-xs font-bold tracking-[0.15em] uppercase transition-all duration-300 hover:bg-white hover:text-slate-900 flex items-center gap-2">
                    Browse All Teams
                    <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[90rem] space-y-20 px-4 sm:px-6 lg:px-10 pb-0">

        {/* Editorial Image Grid */}
        <section className="space-y-6">
          {/* Section label */}
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-mlb-red" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Shop The Collection</p>
          </div>

          {/* 3-panel grid — equal columns */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 h-[520px]">

            {/* Panel 1 */}
            <Link href="/catalog" className="group relative overflow-hidden rounded-2xl bg-slate-900">
              <img
                src="/images/GettyImages-2266391282-scaled-e1773497058279.jpg"
                alt="Elite Collection"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-7 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-mlb-red">2025 Season</p>
                <h3 className="display-title text-4xl text-white leading-tight">
                  OFFICIAL<br />ON-FIELD GEAR
                </h3>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/60 transition-colors group-hover:text-white">
                  Shop All Jerseys <span className="transition-transform group-hover:translate-x-1 inline-block">→</span>
                </div>
              </div>
            </Link>

            {/* Panel 2 */}
            <Link href="/catalog" className="group relative overflow-hidden rounded-2xl bg-slate-900">
              <img
                src="/images/Commissioners-trophy-world-series-major-league-baseball.webp"
                alt="MLB Field"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-7 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-mlb-red">All 30 Teams</p>
                <h3 className="display-title text-4xl text-white leading-tight">
                  THE COMPLETE<br />MLB CATALOG
                </h3>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/60 transition-colors group-hover:text-white">
                  Browse Collection <span className="transition-transform group-hover:translate-x-1 inline-block">→</span>
                </div>
              </div>
            </Link>

            {/* Panel 3 */}
            <Link href="/catalog" className="group relative overflow-hidden rounded-2xl bg-slate-900">
              <img
                src="/images/lfvgiw4kvq869vb1ze0v.avif"
                alt="Authentic Jerseys"
                className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-7 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-mlb-red">League Licensed</p>
                <h3 className="display-title text-4xl text-white leading-tight">
                  AUTHENTIC<br />PLAYER SPEC
                </h3>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/60 transition-colors group-hover:text-white">
                  Explore Jerseys <span className="transition-transform group-hover:translate-x-1 inline-block">→</span>
                </div>
              </div>
            </Link>

          </div>
        </section>

        {/* Featured Players Carousel */}
        <PlayerCarousel />

      </div>

    </div>
  );
}
