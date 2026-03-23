'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MLB_TEAMS = [
  // AL East
  { id: '110', name: 'Baltimore Orioles',    short: 'Orioles',   color: '#DF4601' },
  { id: '111', name: 'Boston Red Sox',       short: 'Red Sox',   color: '#BD3039' },
  { id: '147', name: 'New York Yankees',     short: 'Yankees',   color: '#003087' },
  { id: '139', name: 'Tampa Bay Rays',       short: 'Rays',      color: '#092C5C' },
  { id: '141', name: 'Toronto Blue Jays',    short: 'Blue Jays', color: '#134A8E' },
  // AL Central
  { id: '145', name: 'Chicago White Sox',    short: 'White Sox', color: '#27251F' },
  { id: '114', name: 'Cleveland Guardians',  short: 'Guardians', color: '#00385D' },
  { id: '116', name: 'Detroit Tigers',       short: 'Tigers',    color: '#0C2340' },
  { id: '118', name: 'Kansas City Royals',   short: 'Royals',    color: '#004687' },
  { id: '142', name: 'Minnesota Twins',      short: 'Twins',     color: '#002B5C' },
  // AL West
  { id: '117', name: 'Houston Astros',       short: 'Astros',    color: '#002D62' },
  { id: '108', name: 'Los Angeles Angels',   short: 'Angels',    color: '#BA0021' },
  { id: '133', name: 'Oakland Athletics',    short: 'Athletics', color: '#003831' },
  { id: '136', name: 'Seattle Mariners',     short: 'Mariners',  color: '#0C2C56' },
  { id: '140', name: 'Texas Rangers',        short: 'Rangers',   color: '#003278' },
  // NL East
  { id: '144', name: 'Atlanta Braves',       short: 'Braves',    color: '#CE1141' },
  { id: '146', name: 'Miami Marlins',        short: 'Marlins',   color: '#00A3E0' },
  { id: '121', name: 'New York Mets',        short: 'Mets',      color: '#002D72' },
  { id: '143', name: 'Philadelphia Phillies',short: 'Phillies',  color: '#E81828' },
  { id: '120', name: 'Washington Nationals', short: 'Nationals', color: '#AB0003' },
  // NL Central
  { id: '112', name: 'Chicago Cubs',         short: 'Cubs',      color: '#0E3386' },
  { id: '113', name: 'Cincinnati Reds',      short: 'Reds',      color: '#C6011F' },
  { id: '158', name: 'Milwaukee Brewers',    short: 'Brewers',   color: '#12284B' },
  { id: '134', name: 'Pittsburgh Pirates',   short: 'Pirates',   color: '#27251F' },
  { id: '138', name: 'St. Louis Cardinals',  short: 'Cardinals', color: '#C41E3A' },
  // NL West
  { id: '109', name: 'Arizona Diamondbacks', short: 'D-backs',   color: '#A71930' },
  { id: '115', name: 'Colorado Rockies',     short: 'Rockies',   color: '#33006F' },
  { id: '119', name: 'Los Angeles Dodgers',  short: 'Dodgers',   color: '#005A9C' },
  { id: '135', name: 'San Diego Padres',     short: 'Padres',    color: '#2F241D' },
  { id: '137', name: 'San Francisco Giants', short: 'Giants',    color: '#FD5A1E' },
];

export function TeamCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 400;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="h-1 w-1 rounded-full bg-mlb-red" />
            <p className="caps-label">All 30 Organizations</p>
          </div>
          <h2 className="display-title text-5xl text-slate-900">
            Shop by <span className="text-mlb-red">Team</span>
          </h2>
        </div>
        {/* Scroll controls */}
        <div className="flex gap-2">
          <button
            suppressHydrationWarning
            onClick={() => scroll('left')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:shadow"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            suppressHydrationWarning
            onClick={() => scroll('right')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:shadow"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Carousel track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {MLB_TEAMS.map((team) => (
          <Link
            key={team.id}
            href={`/catalog?team=${encodeURIComponent(team.name)}`}
            className="group relative flex flex-none flex-col items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 transition-all duration-300 hover:border-transparent hover:shadow-xl"
            style={{
              minWidth: '120px',
            }}
          >
            {/* Color background glow on hover */}
            <div
              className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-10"
              style={{ backgroundColor: team.color }}
            />
            {/* Bottom border accent on hover */}
            <div
              className="absolute bottom-0 left-0 h-1 w-0 rounded-b-2xl transition-all duration-300 group-hover:w-full"
              style={{ backgroundColor: team.color }}
            />

            {/* Logo — grayscale by default, full color on hover */}
            <div className="relative flex h-14 w-14 items-center justify-center transition-all duration-300 grayscale group-hover:grayscale-0 group-hover:scale-110">
              <img
                src={`https://www.mlbstatic.com/team-logos/${team.id}.svg`}
                alt={team.name}
                className="h-full w-full object-contain drop-shadow-sm"
              />
            </div>

            {/* Team short name */}
            <span
              className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 transition-colors duration-300 group-hover:text-slate-700"
            >
              {team.short}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
