declare global {
  interface Window {
    Stripe?: (publishableKey: string) => any;
    paypal?: any;
  }
}

export {};
