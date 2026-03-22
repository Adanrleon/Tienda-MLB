import { CartLine } from './product';

export const DIRECT_CHECKOUT_KEY = 'tienda-mlb-direct-checkout';
export type CheckoutMethod = 'card' | 'paypal';

export type CheckoutFormValues = {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type CheckoutSnapshot = {
  provider: CheckoutMethod;
  items: CartLine[];
  subtotalInCents: number;
  customer: Pick<CheckoutFormValues, 'fullName' | 'email'>;
  createdAt: string;
  orderId?: string;
  externalReference?: string;
};

export type DirectCheckoutSession = {
  items: CartLine[];
  createdAt: string;
};
