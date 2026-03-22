import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="section-shell mx-auto max-w-2xl p-10 text-center">
      <p className="font-display text-6xl uppercase tracking-[0.06em] text-scoreboard">
        Product Not Found
      </p>
      <p className="mt-4 text-sm text-scoreboard/65">
        The jersey you were looking for is not in the current catalog.
      </p>
      <Link href="/catalog" className="mt-6 inline-flex">
        <Button>Back To Catalog</Button>
      </Link>
    </div>
  );
}
