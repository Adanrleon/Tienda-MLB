'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Product } from '@/types/product';
import { DIRECT_CHECKOUT_KEY, DirectCheckoutSession } from '@/types/checkout';
import { toStockLabel } from '@/lib/utils';
import { buildCartLineFromProduct, useCart } from '../providers/cart-provider';
import { useToast } from '../providers/toast-provider';
import { LoginModal } from '../auth/login-modal';
import { Button } from '../ui/button';

export function ProductPurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { addItem } = useCart();
  const { pushToast } = useToast();
  const [selectedSize, setSelectedSize] = useState(product.availableSizes[0] ?? 'M');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginRedirectTo, setLoginRedirectTo] = useState(`/product/${product.slug}`);

  const stock = product.stockBySize[selectedSize] ?? 0;

  const storeDirectCheckout = () => {
    if (typeof window === 'undefined') {
      return;
    }

    const directCheckout: DirectCheckoutSession = {
      items: [buildCartLineFromProduct(product, selectedSize)],
      createdAt: new Date().toISOString(),
    };

    window.sessionStorage.setItem(DIRECT_CHECKOUT_KEY, JSON.stringify(directCheckout));
  };

  const handleAddToCart = () => {
    if (!session?.user) {
      setLoginRedirectTo(`/product/${product.slug}`);
      setShowLoginModal(true);
      return;
    }

    if (stock <= 0) {
      pushToast({
        title: 'Size unavailable',
        description: 'Choose another size or check back soon.',
      });
      return;
    }

    addItem(product, selectedSize);
    pushToast({
      title: 'Added to cart',
      description: `${product.name} in size ${selectedSize} is ready in your bag.`,
    });
  };

  const handleBuyNow = () => {
    if (stock <= 0) {
      pushToast({
        title: 'Size unavailable',
        description: 'Choose another size or check back soon.',
      });
      return;
    }

    storeDirectCheckout();

    if (!session?.user) {
      setLoginRedirectTo('/checkout?mode=direct');
      setShowLoginModal(true);
      return;
    }

    router.push('/checkout?mode=direct');
  };

  return (
    <>
      <div className="section-shell p-6 lg:p-7">
        <p className="caps-label text-scoreboard/44">Select size</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {product.availableSizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`min-w-[3rem] rounded-md border px-4 py-3 text-sm font-semibold transition ${
                selectedSize === size
                  ? 'border-dugout bg-dugout text-white'
                  : 'border-scoreboard/10 bg-white text-scoreboard hover:border-scoreboard/30 hover:bg-[var(--page-panel)]'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
        <div className="mt-5 rounded-[0.9rem] border border-scoreboard/8 bg-[var(--page-panel)] px-4 py-4">
          <p className="text-sm font-semibold text-scoreboard">{toStockLabel(stock)}</p>
          <p className="mt-1 text-sm text-scoreboard/62">
            Size {selectedSize} is active for this product.
          </p>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="info-chip">Officially Licensed</span>
          <span className="info-chip">Fast Checkout</span>
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button className="flex-1" onClick={handleAddToCart}>
            Add To Cart
          </Button>
          <Button variant="secondary" className="flex-1" onClick={handleBuyNow}>
            Buy Now
          </Button>
        </div>
        <p className="mt-4 text-sm leading-6 text-scoreboard/58">
          Login is required before adding this jersey to the cart or starting checkout.
        </p>
      </div>
      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectTo={loginRedirectTo}
      />
    </>
  );
}
