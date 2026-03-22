'use client';

import { Product, CartLine } from '@/types/product';
import {
  ReactNode,
  createContext,
  startTransition,
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

const STORAGE_KEY = 'tienda-mlb-cart';
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
  const [items, setItems] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const storedValue = window.localStorage.getItem(STORAGE_KEY);

      if (storedValue) {
        startTransition(() => {
          setItems(JSON.parse(storedValue) as CartLine[]);
        });
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

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
