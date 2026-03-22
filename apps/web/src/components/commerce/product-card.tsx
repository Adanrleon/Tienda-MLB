'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/types/product';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { JerseyVisual } from '../ui/jersey-visual';

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const imageUrl = product.images[0]?.url;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45 }}
      className="group"
    >
      <Link
        href={`/product/${product.slug}`}
        className="glow-card block overflow-hidden rounded-[0.95rem] border border-scoreboard/8 bg-white transition duration-300 hover:-translate-y-1"
      >
        <div className="relative bg-[linear-gradient(180deg,#f7f9fc,#eef3f8)] p-4">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-72 w-full rounded-[0.65rem] object-contain"
            />
          ) : (
            <JerseyVisual
              team={product.team}
              category={product.category}
              accent={product.accent}
              className="h-72 rounded-[0.65rem]"
            />
          )}
          <div className="absolute left-7 top-7">
            <Badge className="border-white/0 bg-white text-scoreboard/76">
              {product.category}
            </Badge>
          </div>
          <div className="absolute bottom-7 right-7 rounded-md bg-scoreboard px-3 py-2 text-right text-white shadow-[0_12px_26px_rgba(16,24,40,0.18)]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/55">Price</p>
            <p className="font-sans text-2xl font-extrabold leading-none">
              {formatCurrency(product.priceInCents)}
            </p>
          </div>
        </div>
        <div className="px-4 pb-5 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-scoreboard/42">
            {product.team}
          </p>
          <h3 className="mt-2 font-sans text-xl font-extrabold uppercase leading-[1.02] tracking-[-0.04em] text-scoreboard">
            {product.name}
          </h3>
          <p className="mt-3 text-sm leading-6 text-scoreboard/62">
            {product.description}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.availableSizes.slice(0, 4).map((size) => (
              <span key={size} className="info-chip">
                {size}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
