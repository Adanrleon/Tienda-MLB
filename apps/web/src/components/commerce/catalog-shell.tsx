'use client';

import { useDeferredValue, useState } from 'react';
import { Product } from '@/types/product';
import { ProductCard } from './product-card';

export function CatalogShell({ products }: { products: Product[] }) {
  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const deferredSearch = useDeferredValue(search);

  const teams = ['All', ...new Set(products.map((product) => product.team))];
  const categories = ['All', ...new Set(products.map((product) => product.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = deferredSearch
      ? `${product.name} ${product.team} ${product.description}`
          .toLowerCase()
          .includes(deferredSearch.toLowerCase())
      : true;
    const matchesTeam = teamFilter === 'All' ? true : product.team === teamFilter;
    const matchesCategory =
      categoryFilter === 'All' ? true : product.category === categoryFilter;

    return matchesSearch && matchesTeam && matchesCategory;
  });

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <aside className="section-shell h-fit p-5">
        <div className="flex items-center justify-between gap-3">
          <p className="caps-label text-scoreboard/50">Filters</p>
          <button
            onClick={() => {
              setSearch('');
              setTeamFilter('All');
              setCategoryFilter('All');
            }}
            className="text-[11px] font-semibold uppercase tracking-[0.16em] text-seam"
          >
            Clear all
          </button>
        </div>
        <label className="mt-5 flex flex-col gap-2">
          <span className="caps-label text-scoreboard/42">Search</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Dodgers, Yankees, throwback..."
            className="form-control"
          />
        </label>

        <div className="mt-6 border-t border-scoreboard/8 pt-5">
          <p className="caps-label text-scoreboard/42">Teams</p>
          <div className="mt-3 flex flex-col gap-2">
            {teams.map((team) => (
              <button
                key={team}
                onClick={() => setTeamFilter(team)}
                className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${
                  teamFilter === team
                    ? 'border-dugout bg-dugout text-white'
                    : 'border-scoreboard/8 bg-white text-scoreboard/72 hover:border-scoreboard/18 hover:bg-[var(--page-panel)]'
                }`}
              >
                {team}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-scoreboard/8 pt-5">
          <p className="caps-label text-scoreboard/42">Category</p>
          <div className="mt-3 flex flex-col gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${
                  categoryFilter === category
                    ? 'border-seam bg-seam text-white'
                    : 'border-scoreboard/8 bg-white text-scoreboard/72 hover:border-scoreboard/18 hover:bg-[var(--page-panel)]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="space-y-6">
        <div className="section-shell px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-scoreboard/70">
              Showing {filteredProducts.length} authentic jerseys
            </p>
            <div className="rounded-md border border-scoreboard/8 bg-[var(--page-panel)] px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-scoreboard/55">
              Sort by: Popularity
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {filteredProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
