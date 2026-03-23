'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const FEATURED_PLAYERS = [
  { photo: '/images/judge.png',     name: 'Aaron Judge',      number: '99', team: 'New York Yankees',      teamColor: '#003087' },
  { photo: '/images/ohtani.png',    name: 'Shohei Ohtani',    number: '17', team: 'Los Angeles Dodgers',   teamColor: '#005A9C' },
  { photo: '/images/betts.png',     name: 'Mookie Betts',     number: '50', team: 'Los Angeles Dodgers',   teamColor: '#005A9C' },
  { photo: '/images/acuña.png',     name: 'Ronald Acuña Jr.', number: '13', team: 'Atlanta Braves',         teamColor: '#CE1141' },
  { photo: '/images/trout.png',     name: 'Mike Trout',       number: '27', team: 'Los Angeles Angels',     teamColor: '#BA0021' },
  { photo: '/images/rodriguez.png', name: 'Julio Rodríguez',  number: '44', team: 'Seattle Mariners',       teamColor: '#0C2C56' },
  { photo: '/images/harper.png',    name: 'Bryce Harper',     number: '3',  team: 'Philadelphia Phillies',  teamColor: '#E81828' },
  { photo: '/images/alvarez.png',   name: 'Yordan Alvarez',   number: '44', team: 'Houston Astros',         teamColor: '#002D62' },
  { photo: '/images/alonso.png',    name: 'Pete Alonso',      number: '20', team: 'New York Mets',          teamColor: '#002D72' },
  { photo: '/images/kurtz.png',     name: 'Nick Kurtz',       number: '16', team: 'Oakland Athletics',      teamColor: '#003831' },
];

export function PlayerCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -380 : 380, behavior: 'smooth' });
  };

  return (
    <section className="space-y-8">
      {/* Header — visually distinct from team carousel */}
      <div className="flex items-end justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-1 w-6 rounded-full bg-mlb-red" />
            <span className="h-1 w-1 rounded-full bg-mlb-red/40" />
          </div>
          <h2 className="display-title text-5xl text-slate-900">
            Featured <span className="text-mlb-red">Players</span>
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            suppressHydrationWarning
            onClick={() => scroll('left')}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            suppressHydrationWarning
            onClick={() => scroll('right')}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-5 overflow-x-auto pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {FEATURED_PLAYERS.map((player) => (
          <Link
            key={player.name}
            href={`/catalog?search=${encodeURIComponent(player.name)}`}
            className="group relative flex-none overflow-hidden rounded-2xl bg-slate-900"
            style={{ width: '240px', height: '310px' }}
          >
            {/* Team color glow from bottom */}
            <div
              className="absolute inset-x-0 bottom-0 h-3/4 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                background: `linear-gradient(to top, ${player.teamColor}cc, transparent)`,
              }}
            />

            {/* Subtle team color top border */}
            <div
              className="absolute inset-x-0 top-0 h-[3px] scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
              style={{ backgroundColor: player.teamColor, transformOrigin: 'left' }}
            />

            {/* Player headshot — positioned to show face + shoulders */}
            <img
              src={player.photo}
              alt={player.name}
              className="absolute bottom-0 left-1/2 h-[260px] w-[200px] -translate-x-1/2 scale-[1.5] origin-bottom object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.55]"
            />

            {/* Dark gradient for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

            {/* Jersey number — decorative */}
            <span className="absolute right-3 top-3 display-title text-5xl leading-none text-white opacity-10 select-none group-hover:opacity-20 transition-opacity">
              {player.number}
            </span>

            {/* Name + team */}
            <div className="absolute bottom-0 inset-x-0 p-4 space-y-0.5">
              <p className="text-xs font-extrabold uppercase tracking-widest text-white leading-tight">
                {player.name}
              </p>
              <p className="text-[9px] font-medium uppercase tracking-widest text-white/40">
                {player.team.split(' ').slice(-1)[0]}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
