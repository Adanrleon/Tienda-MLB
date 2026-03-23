'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';

const TEAM_LOGOS: Record<string, string> = {
  'Arizona Diamondbacks': '109',
  'Atlanta Braves': '144',
  'Baltimore Orioles': '110',
  'Boston Red Sox': '111',
  'Chicago Cubs': '112',
  'Chicago White Sox': '145',
  'Cincinnati Reds': '113',
  'Cleveland Guardians': '114',
  'Colorado Rockies': '115',
  'Detroit Tigers': '116',
  'Houston Astros': '117',
  'Kansas City Royals': '118',
  'Los Angeles Angels': '108',
  'Los Angeles Dodgers': '119',
  'Miami Marlins': '146',
  'Milwaukee Brewers': '158',
  'Minnesota Twins': '142',
  'New York Mets': '121',
  'New York Yankees': '147',
  'Oakland Athletics': '133',
  'Philadelphia Phillies': '143',
  'Pittsburgh Pirates': '134',
  'San Diego Padres': '135',
  'San Francisco Giants': '137',
  'Seattle Mariners': '136',
  'St. Louis Cardinals': '138',
  'Tampa Bay Rays': '139',
  'Texas Rangers': '140',
  'Toronto Blue Jays': '141',
  'Washington Nationals': '120',
};

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const imageUrl = product.images[0]?.url;
  const teamId = TEAM_LOGOS[product.team];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="group h-full"
    >
      <Link
        href={`/product/${product.slug}`}
        className="luxury-card flex flex-col h-full"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 italic text-slate-400">
              No Image
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="absolute left-4 top-4 flex flex-col gap-2">
            <Badge className="bg-white/90 text-slate-900 backdrop-blur-sm">
              {product.category}
            </Badge>
          </div>

          <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex items-center justify-between gap-2 text-white">
              <p className="text-xs font-bold uppercase tracking-widest">View Details</p>
              <div className="h-px flex-1 bg-white/30" />
            </div>
          </div>
        </div>

        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {teamId && (
                  <img
                    src={`https://www.mlbstatic.com/team-logos/${teamId}.svg`}
                    alt={product.team}
                    className="h-4 w-4"
                  />
                )}
                <p className="caps-label text-[9px]">{product.team}</p>
              </div>
              <h3 className="mt-2 text-lg font-bold leading-tight text-slate-900 line-clamp-2">
                {product.name}
              </h3>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-mlb-navy">
                {formatCurrency(product.priceInCents)}
              </p>
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex gap-1.5">
              {product.availableSizes.slice(0, 3).map((size) => (
                <span key={size} className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-[10px] font-bold text-slate-500 transition-colors group-hover:border-slate-300 group-hover:text-slate-900">
                  {size}
                </span>
              ))}
              {product.availableSizes.length > 3 && (
                <span className="flex h-7 w-7 items-center justify-center text-[10px] font-bold text-slate-400">
                  +{product.availableSizes.length - 3}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-mlb-red transition-colors group-hover:text-mlb-navy">
              Shop Now
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
