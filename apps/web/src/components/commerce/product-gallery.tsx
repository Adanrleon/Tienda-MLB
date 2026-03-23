'use client';

import { useState } from 'react';
import { Product } from '@/types/product';
import { JerseyVisual } from '@/components/ui/jersey-visual';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  product: Product;
}

export function ProductGallery({ product }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const galleryItems = product.images.length
    ? product.images.slice(0, 4)
    : [{ url: '', alt: product.name }];

  const activeItem = galleryItems[activeIndex];

  return (
    <div className="grid gap-4 md:grid-cols-[5.5rem_1fr]">
      {/* Thumbnails Sidebar */}
      <div className="space-y-3">
        {galleryItems.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "group relative w-full overflow-hidden rounded-[0.7rem] border bg-[var(--page-panel)] p-2 transition-all duration-300 hover:shadow-md",
              activeIndex === index 
                ? "border-mlb-red ring-1 ring-mlb-red shadow-sm" 
                : "border-scoreboard/8 hover:border-scoreboard/20"
            )}
            aria-label={`View image ${index + 1}`}
          >
            {item.url ? (
              <img
                src={item.url}
                alt={item.alt ?? product.name}
                className={cn(
                  "h-16 w-full object-contain transition-transform duration-300 group-hover:scale-105",
                  activeIndex === index ? "opacity-100" : "opacity-60 group-hover:opacity-100"
                )}
              />
            ) : (
              <JerseyVisual
                team={product.team}
                category={product.category}
                accent={product.accent}
                className="h-16 rounded-[0.45rem]"
              />
            )}
            {/* Active Indicator Bar */}
            {activeIndex === index && (
              <div className="absolute left-0 top-0 h-full w-1 bg-mlb-red" />
            )}
          </button>
        ))}
      </div>

      {/* Main Image View */}
      <div className="relative rounded-[0.9rem] bg-[var(--page-panel)] p-5 shadow-inner">
        {activeItem?.url ? (
          <div className="relative h-[30rem] w-full lg:h-[38rem]">
            <img
              src={activeItem.url}
              alt={activeItem.alt ?? product.name}
              key={activeItem.url} // Force animation on change
              className="h-full w-full rounded-[0.75rem] object-contain transition-opacity duration-500 animate-in fade-in"
            />
          </div>
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
  );
}
