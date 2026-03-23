'use client';

import { useSession } from 'next-auth/react';
import { Product, CartLine } from '@/types/product';
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

type CartContextValue = {
  items: CartLine[];
  totalItems: number;
  subtotalInCents: number;
  hydrated: boolean;
  addItem: (product: Product, size: string) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  clearCart: () => void;
};

const MULTI_CART_KEY = 'tienda-mlb-multi-carts';
const LEGACY_KEY = 'tienda-mlb-cart';

const CartContext = createContext<CartContextValue | null>(null);

export function buildCartLineFromProduct(product: Product, size: string): CartLine {
  return {
    id: `${product.id}-${size}`,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    team: product.team,
    accent: product.accent,
    size,
    quantity: 1,
    priceInCents: product.priceInCents,
    imageUrl: product.images[0]?.url,
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const userId = session?.user?.id || 'guest';
  
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Sync from Multi-Cart Map when User ID changes
  useEffect(() => {
    // Wait for session to be at least known (even if unauthenticated)
    if (status === 'loading') return;

    try {
      const stored = window.localStorage.getItem(MULTI_CART_KEY);
      const carts = stored ? JSON.parse(stored) : {};
      
      // Cleanup/Migrate legacy cart to guest if needed
      const legacy = window.localStorage.getItem(LEGACY_KEY);
      if (legacy && !carts.guest) {
        carts.guest = JSON.parse(legacy);
        window.localStorage.removeItem(LEGACY_KEY);
        window.localStorage.setItem(MULTI_CART_KEY, JSON.stringify(carts));
      }

      setItems(carts[userId] || []);
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, [userId, status]);

  // Sync to Multi-Cart Map on changes
  useEffect(() => {
    if (!hydrated || status === 'loading') return;

    try {
      const stored = window.localStorage.getItem(MULTI_CART_KEY);
      const carts = stored ? JSON.parse(stored) : {};
      
      // Update only current user's entry
      carts[userId] = items;
      window.localStorage.setItem(MULTI_CART_KEY, JSON.stringify(carts));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [items, userId, hydrated, status]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalInCents = items.reduce(
    (sum, item) => sum + item.quantity * item.priceInCents,
    0,
  );

  const addItem = (product: Product, size: string) => {
    setItems((current) => {
      const existingLine = current.find(
        (item) => item.productId === product.id && item.size === size,
      );

      if (existingLine) {
        return current.map((item) =>
          item.id === existingLine.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...current,
        buildCartLineFromProduct(product, size),
      ];
    });
  };

  const updateQuantity = (lineId: string, quantity: number) => {
    setItems((current) =>
      current
        .map((item) => (item.id === lineId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (lineId: string) => {
    setItems((current) => current.filter((item) => item.id !== lineId));
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        subtotalInCents,
        hydrated,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within CartProvider.');
  }

  return context;
}

