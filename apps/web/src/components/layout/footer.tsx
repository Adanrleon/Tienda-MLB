import Link from 'next/link';

export function Footer() {
  return (
    <footer className="mt-16 border-t border-scoreboard/8 bg-white">
      <div className="mx-auto max-w-[88rem] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <p className="font-display text-3xl uppercase tracking-[0.04em] text-dugout">
              MLB Authentic
            </p>
            <p className="mt-3 max-w-sm text-sm leading-7 text-scoreboard/62">
              A jersey-only MLB storefront focused on clean presentation, quick checkout
              and premium product browsing.
            </p>
          </div>
          <div>
            <p className="caps-label text-scoreboard/45">Shop</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-scoreboard/68">
              <Link href="/catalog">Authentic Collection</Link>
              <Link href="/catalog">Replica Series</Link>
              <Link href="/catalog">Featured Teams</Link>
            </div>
          </div>
          <div>
            <p className="caps-label text-scoreboard/45">Support</p>
            <div className="mt-4 flex flex-col gap-3 text-sm text-scoreboard/68">
              <Link href="/cart">Cart</Link>
              <Link href="/checkout">Checkout</Link>
              <Link href="/login">Account Access</Link>
            </div>
          </div>
          <div>
            <p className="caps-label text-scoreboard/45">Technology</p>
            <div className="mt-4 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.16em] text-scoreboard/55">
              <span>Next.js</span>
              <span>NestJS</span>
              <span>Prisma</span>
              <span>Stripe</span>
              <span>PayPal</span>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-scoreboard/8 pt-6 text-xs text-scoreboard/42">
          Premium jersey storefront UI inspired by official baseball retail layouts.
        </div>
      </div>
    </footer>
  );
}
