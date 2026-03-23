'use client';

import { useDeferredValue, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types/product';
import { ProductCard } from './product-card';

export function CatalogShell({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();

  // Initialize from URL params on first render
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '');
  const [teamFilter, setTeamFilter] = useState(() => searchParams.get('team') ?? 'All');
  const [categoryFilter, setCategoryFilter] = useState(() => searchParams.get('category') ?? 'All');
  const deferredSearch = useDeferredValue(search);
  const [currentPage, setCurrentPage] = useState(1);

  // Sync if URL changes (e.g. browser back/forward or navigation)
  useEffect(() => {
    setSearch(searchParams.get('search') ?? '');
    setTeamFilter(searchParams.get('team') ?? 'All');
    setCategoryFilter(searchParams.get('category') ?? 'All');
  }, [searchParams]);

  const ALL_TEAMS = [
    'Arizona Diamondbacks', 'Atlanta Braves', 'Baltimore Orioles', 'Boston Red Sox',
    'Chicago Cubs', 'Chicago White Sox', 'Cincinnati Reds', 'Cleveland Guardians',
    'Colorado Rockies', 'Detroit Tigers', 'Houston Astros', 'Kansas City Royals',
    'Los Angeles Angels', 'Los Angeles Dodgers', 'Miami Marlins', 'Milwaukee Brewers',
    'Minnesota Twins', 'New York Mets', 'New York Yankees', 'Oakland Athletics',
    'Philadelphia Phillies', 'Pittsburgh Pirates', 'San Diego Padres', 'San Francisco Giants',
    'Seattle Mariners', 'St. Louis Cardinals', 'Tampa Bay Rays', 'Texas Rangers',
    'Toronto Blue Jays', 'Washington Nationals'
  ];

  const teams = ['All', ...ALL_TEAMS];
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [deferredSearch, teamFilter, categoryFilter]);

  // Pagination logic
  const ITEMS_PER_PAGE = 12;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('catalog-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div id="catalog-top" className="grid gap-8 lg:grid-cols-[17rem_1fr]">
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
        <div className="mt-5 flex flex-col gap-2">
          <label htmlFor="catalog-search" className="caps-label text-scoreboard/42">Search Collection</label>
          <div className="relative group">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 transition-colors group-focus-within:text-slate-900">
              <Search className="h-4 w-4" />
            </div>
            <input
              id="catalog-search"
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Dodgers, Judge, throwback..."
              className="w-full rounded-md border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-1 focus:ring-slate-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition-colors hover:text-mlb-red"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-scoreboard/8 pt-5">
          <p className="caps-label text-scoreboard/42">Teams</p>
          <div className="mt-3 flex max-h-[300px] flex-col gap-2 overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin', scrollbarColor: '#E2E8F0 transparent' }}>
            {teams.map((team) => (
              <button
                key={team}
                onClick={() => setTeamFilter(team)}
                className={`flex-shrink-0 rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${teamFilter === team
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
                className={`rounded-md border px-3 py-2 text-left text-sm font-semibold transition ${categoryFilter === category
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
              {teamFilter !== 'All' && (
                <span className="ml-2 font-bold text-mlb-navy">— {teamFilter}</span>
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {paginatedProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="pt-12 flex items-center justify-center gap-1">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex h-10 w-10 items-center justify-center text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                totalPages <= 7 ||
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm transition-all ${currentPage === page
                        ? 'border border-slate-300 font-bold text-slate-900 shadow-sm bg-white'
                        : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                  >
                    {page}
                  </button>
                );
              }

              if (page === 2 && currentPage > 3) {
                return <span key="start-ellipsis" className="flex h-10 w-6 items-end justify-center pb-2 text-slate-400 tracking-[0.2em]">...</span>;
              }
              if (page === totalPages - 1 && currentPage < totalPages - 2) {
                return <span key="end-ellipsis" className="flex h-10 w-6 items-end justify-center pb-2 text-slate-400 tracking-[0.2em]">...</span>;
              }

              return null;
            })}

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex h-10 w-10 items-center justify-center text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
