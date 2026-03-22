'use client';

import { ReactNode } from 'react';
import { CartProvider } from './cart-provider';
import { SessionProviderComponent } from './session-provider';
import { ToastProvider } from './toast-provider';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProviderComponent>
      <CartProvider>
        <ToastProvider>{children}</ToastProvider>
      </CartProvider>
    </SessionProviderComponent>
  );
}
