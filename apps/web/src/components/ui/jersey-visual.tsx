import { CSSProperties } from 'react';
import { cn } from '@/lib/utils';

export function JerseyVisual({
  team,
  category,
  accent,
  className,
}: {
  team: string;
  category: string;
  accent: string;
  className?: string;
}) {
  const style = {
    '--accent': accent,
  } as CSSProperties;

  return (
    <div
      style={style}
      className={cn(
        'noise relative overflow-hidden rounded-[1.9rem] border border-white/30 bg-scoreboard text-white',
        className,
      )}
    >
      <div className="absolute inset-0 bg-pinstripes opacity-30" />
      <div
        className="absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(circle at top left, rgba(255,255,255,0.22), transparent 24%), radial-gradient(circle at bottom right, rgba(255,255,255,0.12), transparent 22%), linear-gradient(145deg, var(--accent), #09111F 72%)',
        }}
      />
      <div className="absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.2),transparent)]" />
      <div className="relative flex h-full flex-col justify-between p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
            MLB
          </span>
          <span className="rounded-full border border-white/20 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
            {category}
          </span>
        </div>
        <div className="relative mx-auto flex h-40 w-32 items-center justify-center rounded-[2.4rem_2.4rem_1.2rem_1.2rem] border border-white/20 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] shadow-2xl backdrop-blur-sm">
          <div className="absolute top-[-22px] h-11 w-11 rounded-full border border-white/20 bg-scoreboard/70" />
          <div className="absolute top-0 h-10 w-24 rounded-b-3xl border-x border-b border-white/20 bg-scoreboard/70" />
          <div className="absolute inset-y-6 left-1/2 w-px -translate-x-1/2 bg-white/18" />
          <div className="text-center font-display text-3xl uppercase leading-none tracking-[0.08em] text-white">
            {team
              .split(' ')
              .map((word) => word[0])
              .join('')}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-white/65">Official Drop</p>
          <p className="mt-1 font-display text-2xl uppercase leading-none tracking-[0.04em]">
            {team}
          </p>
        </div>
      </div>
    </div>
  );
}
