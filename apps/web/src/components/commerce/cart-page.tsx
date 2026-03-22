'use client';

import Link from 'next/link';
import { useCart } from '../providers/cart-provider';
import { Button } from '../ui/button';
import { JerseyVisual } from '../ui/jersey-visual';
import { formatCurrency } from '@/lib/utils';

export function CartPage() {
  const { items, hydrated, subtotalInCents, updateQuantity, removeItem, clearCart } =
    useCart();

  if (!hydrated) {
    return (
      <div className="section-shell p-8">
        <p className="caps-label text-scoreboard/60">
          Loading cart...
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="section-shell p-10 text-center">
        <p className="font-sans text-4xl font-extrabold tracking-[-0.04em] text-scoreboard">
          Your cart is empty
        </p>
        <p className="mt-4 text-sm text-scoreboard/65">
          Start with the featured drops and build your game-day rotation.
        </p>
        <Link href="/catalog" className="mt-6 inline-flex">
          <Button>Explore Catalog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.42fr_0.72fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="section-shell grid gap-5 p-5 sm:grid-cols-[150px_1fr]"
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-40 w-full rounded-[0.75rem] bg-[var(--page-panel)] object-contain"
              />
            ) : (
              <JerseyVisual
                team={item.team}
                category={`Size ${item.size}`}
                accent={item.accent}
                className="h-40 rounded-[0.75rem]"
              />
            )}
            <div className="flex flex-col justify-between gap-4">
              <div>
                <p className="caps-label text-scoreboard/45">
                  {item.team}
                </p>
                <h2 className="mt-2 font-sans text-2xl font-extrabold uppercase leading-[1.02] tracking-[-0.04em] text-scoreboard">
                  {item.name}
                </h2>
                <p className="mt-2 text-sm text-scoreboard/60">Selected size: {item.size}</p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2 rounded-md border border-scoreboard/10 bg-[var(--page-panel)] px-2 py-1">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="rounded-md bg-white px-3 py-1 text-lg shadow-sm"
                  >
                    -
                  </button>
                  <span className="min-w-8 text-center text-sm font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="rounded-md bg-white px-3 py-1 text-lg shadow-sm"
                  >
                    +
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-sans text-3xl font-extrabold leading-none text-dugout">
                    {formatCurrency(item.priceInCents * item.quantity)}
                  </p>
                  <Button variant="ghost" onClick={() => removeItem(item.id)}>
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <aside className="section-shell h-fit p-6">
        <p className="caps-label text-scoreboard/45">
          Order Summary
        </p>
        <div className="mt-6 space-y-3 text-sm text-scoreboard/70">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotalInCents)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Checkout mode</span>
            <span>Card or PayPal</span>
          </div>
        </div>
        <div className="mt-6 rounded-[0.9rem] bg-[var(--page-panel)] px-5 py-5">
          <p className="text-xs uppercase tracking-[0.18em] text-scoreboard/48">
            Estimated total
          </p>
          <p className="mt-2 font-sans text-5xl font-extrabold leading-none text-dugout">
            {formatCurrency(subtotalInCents)}
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <Link href="/checkout?mode=cart">
            <Button className="w-full">Proceed To Checkout</Button>
          </Link>
          <Button variant="secondary" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>
      </aside>
    </div>
  );
}
