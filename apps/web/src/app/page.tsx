import Link from 'next/link';
import { ArrowRight, Star, ShieldCheck, Truck, Zap } from 'lucide-react';
import { getFeaturedProducts, getProducts } from '@/lib/api';
import { ProductCard } from '@/components/commerce/product-card';
import { Button } from '@/components/ui/button';

const TEAM_LOGOS: Record<string, string> = {
  'Arizona Diamondbacks': '109',
  'Atlanta Braves': '144',
  'Boston Red Sox': '111',
  'Chicago Cubs': '112',
  'Los Angeles Dodgers': '119',
  'New York Yankees': '147',
  'San Diego Padres': '135',
};

export default async function HomePage() {
  const products = await getProducts();
  const featuredProducts = await getFeaturedProducts();
  
  const allTeams = products.reduce<Array<{ name: string; id: string }>>((acc, p) => {
    if (!acc.some(t => t.name === p.team) && TEAM_LOGOS[p.team]) {
      acc.push({ name: p.team, id: TEAM_LOGOS[p.team] });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Cinematic Hero Section */}
      <section className="relative -mt-6 h-[85vh] min-h-[600px] overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-2xl">
        <div className="absolute inset-0">
          <img
            src="/images/hero_banner.png"
            alt="MLB Hero"
            className="h-full w-full object-cover object-center opacity-60 brightness-75 transition-transform duration-[10s] hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
        </div>
        
        <div className="relative flex h-full items-center px-10 lg:px-20">
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
                <Button variant="secondary" className="h-16 px-10 text-xs font-bold tracking-[0.2em] uppercase rounded-full bg-white/10 border-white/20 text-white backdrop-blur-sm hover:bg-white/20">
                  View Home Originals
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 right-10 flex gap-10 text-white/50 text-[10px] font-bold uppercase tracking-[0.3em] lg:flex-row flex-col">
           <div className="flex items-center gap-2"><Zap className="h-4 w-4 text-mlb-red" /> Vapor Premier Tech</div>
           <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-mlb-red" /> Authentic Licensed</div>
           <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-mlb-red" /> Next-Day Fulfillment</div>
        </div>
      </section>

      {/* Team Brand Scroller */}
      <section className="py-10 border-y border-slate-200">
        <div className="flex flex-col items-center gap-12">
          <p className="caps-label text-slate-400">Shop by Official Organization</p>
          <div className="flex flex-wrap justify-center gap-8 lg:gap-16 grayscale transition-all hover:grayscale-0">
            {allTeams.map((team) => (
              <Link
                key={team.id}
                href={`/catalog?team=${encodeURIComponent(team.name)}`}
                className="group flex flex-col items-center gap-4 transition-transform hover:-translate-y-2"
              >
                <img
                  src={`https://www.mlbstatic.com/team-logos/${team.id}.svg`}
                  alt={team.name}
                  className="h-16 w-16 drop-shadow-md"
                />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-mlb-navy">
                  {team.name.split(' ').pop()}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

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

      {/* Featured Player Spotlight */}
      <section className="relative h-[600px] overflow-hidden rounded-[2.5rem] bg-slate-950">
        <div className="absolute inset-x-0 top-0 h-full w-full">
           <img 
            src="/images/featured_player.png" 
            alt="Featured Player" 
            className="h-full w-full object-cover object-top opacity-50"
           />
           <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </div>
        
        <div className="relative flex h-full items-end p-12 lg:p-20">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-mlb-red/30 bg-mlb-red/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-mlb-red backdrop-blur-sm">
               <Star className="h-3 w-3 fill-mlb-red" /> Spotlight Star
            </div>
            
            <h3 className="display-title text-7xl text-white">THE JUDGE <br /><span className="text-mlb-red">ERA</span>.</h3>
            
            <p className="text-lg text-slate-300">
               Represent the Bronx Bombers in style. The 2024 Captain s Collection 
               features the exact specifications worn on-field in New York.
            </p>
            
            <Link href="/catalog?team=New York Yankees">
              <Button className="h-14 px-10 rounded-full bg-white text-slate-950 hover:bg-slate-200">
                Shop Yankees Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits / Trust Bar */}
      <section className="grid gap-10 rounded-[2rem] bg-slate-50 p-12 lg:grid-cols-3">
        <div className="space-y-4">
           <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
              <Zap className="h-6 w-6 text-mlb-red" />
           </div>
           <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Vapor Premier Tech</h4>
           <p className="text-sm text-slate-600 leading-relaxed">Exact moisture-wicking materials used by the pros in the dog days of August.</p>
        </div>
        <div className="space-y-4">
           <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-mlb-red" />
           </div>
           <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Verified Authentic</h4>
           <p className="text-sm text-slate-600 leading-relaxed">Direct-from-league authenticity with holograms and verifiable SKU numbers.</p>
        </div>
        <div className="space-y-4">
           <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
              <Truck className="h-6 w-6 text-mlb-red" />
           </div>
           <h4 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Stadium Speed</h4>
           <p className="text-sm text-slate-600 leading-relaxed">Orders placed before 3PM EST ship same-day from our national distribution hub.</p>
        </div>
      </section>
    </div>
  );
}
