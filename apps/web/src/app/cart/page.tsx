import { CartPage } from '@/components/commerce/cart-page';

export default function CartRoute() {
  return (
    <div className="space-y-6">
      <section className="section-shell px-6 py-8 lg:px-8">
        <p className="caps-label text-scoreboard/42">
          Cart
        </p>
        <h1 className="mt-3 font-sans text-5xl font-extrabold tracking-[-0.05em] text-scoreboard lg:text-[4rem]">
          Your Stadium Bag
        </h1>
      </section>
      <CartPage />
    </div>
  );
}
