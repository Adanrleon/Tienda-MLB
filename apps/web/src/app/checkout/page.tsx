import { CheckoutPanel } from '@/components/commerce/checkout-panel';

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-6 lg:px-12 space-y-6">
      <section className="section-shell px-6 py-8 lg:px-10">

        <p className="caps-label text-scoreboard/42">
          Checkout
        </p>
        <h1 className="mt-3 font-sans text-5xl font-extrabold tracking-[-0.05em] text-scoreboard lg:text-[4rem]">
          Secure Checkout
        </h1>
      </section>
      <CheckoutPanel />
    </div>
  );
}
