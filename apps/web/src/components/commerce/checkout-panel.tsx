'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  capturePayPalOrder,
  confirmStripePayment,
  createPayPalOrder,
  createStripePaymentIntent,
  syncCartToBackend,
} from '@/lib/api';
import {
  CheckoutFormValues,
  CheckoutMethod,
  CheckoutSnapshot,
  DIRECT_CHECKOUT_KEY,
  DirectCheckoutSession,
} from '@/types/checkout';
import { cn, formatCurrency } from '@/lib/utils';
import { useCart } from '../providers/cart-provider';
import { useToast } from '../providers/toast-provider';
import { Button } from '../ui/button';
import { PayPalCheckout } from './paypal-checkout';
import { StripeCardCheckout } from './stripe-card-checkout';

const CHECKOUT_SNAPSHOT_KEY = 'tienda-mlb-checkout-snapshot';
const PENDING_STRIPE_ORDER_KEY = 'tienda-mlb-pending-stripe-order';

export function CheckoutPanel() {
  const { data: session } = useSession();
  const { items: cartItems, clearCart, hydrated } = useCart();
  const { pushToast } = useToast();
  const searchParams = useSearchParams();
  const [isFinalizingStripe, startStripeFinalizeTransition] = useTransition();
  const handledStripeReturn = useRef(false);
  const [completedCheckout, setCompletedCheckout] = useState<CheckoutSnapshot | null>(
    null,
  );
  const [paymentMethod, setPaymentMethod] = useState<CheckoutMethod>('card');
  const [directCheckout, setDirectCheckout] = useState<DirectCheckoutSession | null>(null);

  const paymentDetails: CheckoutFormValues = {
    fullName: session?.user?.name ?? '',
    email: session?.user?.email ?? '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  };
  const isDirectCheckout = Boolean(directCheckout?.items.length);
  const checkoutItems = isDirectCheckout ? directCheckout?.items ?? [] : cartItems;
  const subtotalInCents = checkoutItems.reduce(
    (sum, item) => sum + item.quantity * item.priceInCents,
    0,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mode = searchParams.get('mode');

    if (mode === 'cart') {
      window.sessionStorage.removeItem(DIRECT_CHECKOUT_KEY);
      setDirectCheckout(null);
      return;
    }

    try {
      const storedCheckout = window.sessionStorage.getItem(DIRECT_CHECKOUT_KEY);
      setDirectCheckout(
        storedCheckout ? (JSON.parse(storedCheckout) as DirectCheckoutSession) : null,
      );
    } catch {
      window.sessionStorage.removeItem(DIRECT_CHECKOUT_KEY);
      setDirectCheckout(null);
    }
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const provider = searchParams.get('provider');
    const paymentIntentId = searchParams.get('payment_intent');
    const apiToken = session?.user?.apiToken;
    const pendingOrderId = window.sessionStorage.getItem(PENDING_STRIPE_ORDER_KEY);

    if (
      provider !== 'stripe' ||
      !paymentIntentId ||
      !apiToken ||
      !pendingOrderId ||
      handledStripeReturn.current
    ) {
      return;
    }

    handledStripeReturn.current = true;

    startStripeFinalizeTransition(() => {
      void (async () => {
        try {
          await finalizeStripePayment(pendingOrderId, paymentIntentId);
        } catch (error) {
          handledStripeReturn.current = false;
          pushToast({
            title: 'Stripe confirmation pending',
            description:
              error instanceof Error
                ? error.message
                : 'The payment returned from Stripe but could not be confirmed yet.',
          });
        }
      })();
    });
  }, [searchParams, session?.user?.apiToken]);

  const getCheckoutValidationError = () => {
    if (!session?.user) {
      return 'Sign in before continuing to payment.';
    }

    if (!session.user.apiToken) {
      return 'The backend token is missing. Complete backend auth setup first.';
    }

    if (checkoutItems.length === 0) {
      return 'Add at least one jersey or use Buy Now before checking out.';
    }

    return null;
  };

  const persistCheckoutSnapshot = (
    provider: CheckoutMethod,
    orderId?: string,
    externalReference?: string,
  ) => {
    if (typeof window === 'undefined') {
      return null;
    }

    const snapshot: CheckoutSnapshot = {
      provider,
      items: checkoutItems,
      subtotalInCents,
      customer: {
        fullName: paymentDetails.fullName,
        email: paymentDetails.email,
      },
      createdAt: new Date().toISOString(),
      orderId,
      externalReference,
    };

    window.sessionStorage.setItem(CHECKOUT_SNAPSHOT_KEY, JSON.stringify(snapshot));
    return snapshot;
  };

  const readStoredSnapshot = () => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const storedSnapshot = window.sessionStorage.getItem(CHECKOUT_SNAPSHOT_KEY);
      return storedSnapshot ? (JSON.parse(storedSnapshot) as CheckoutSnapshot) : null;
    } catch {
      window.sessionStorage.removeItem(CHECKOUT_SNAPSHOT_KEY);
      return null;
    }
  };

  const finishCheckout = (
    provider: CheckoutMethod,
    orderId: string,
    externalReference: string,
  ) => {
    const snapshot =
      readStoredSnapshot() ?? persistCheckoutSnapshot(provider, orderId, externalReference);

    const completedSnapshot: CheckoutSnapshot = {
      ...(snapshot ?? {
        provider,
        items: checkoutItems,
        subtotalInCents,
        customer: {
          fullName: paymentDetails.fullName,
          email: paymentDetails.email,
        },
        createdAt: new Date().toISOString(),
      }),
      provider,
      orderId,
      externalReference,
    };

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(
        CHECKOUT_SNAPSHOT_KEY,
        JSON.stringify(completedSnapshot),
      );
      window.sessionStorage.removeItem(PENDING_STRIPE_ORDER_KEY);
      window.sessionStorage.removeItem(DIRECT_CHECKOUT_KEY);
      window.history.replaceState({}, '', '/checkout');
    }

    if (!isDirectCheckout) {
      clearCart();
    } else {
      setDirectCheckout(null);
    }

    setCompletedCheckout(completedSnapshot);
    pushToast({
      title: provider === 'card' ? 'Card payment completed' : 'PayPal payment completed',
      description: 'Your order has been confirmed successfully.',
    });
  };

  const prepareCheckoutContext = () => {
    const validationError = getCheckoutValidationError();

    if (validationError) {
      throw new Error(validationError);
    }

    const apiToken = session?.user?.apiToken;

    if (!apiToken) {
      throw new Error('Your API token is missing. Sign in again and retry.');
    }

    return {
      apiToken,
      payload: paymentDetails,
    };
  };

  const prepareStripeIntent = async () => {
    const { apiToken, payload } = prepareCheckoutContext();

    await syncCartToBackend(apiToken, checkoutItems);
    const intent = await createStripePaymentIntent(apiToken, payload);
    persistCheckoutSnapshot('card', intent.orderId);

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(PENDING_STRIPE_ORDER_KEY, intent.orderId);
    }

    return intent;
  };

  const finalizeStripePayment = async (orderId: string, paymentIntentId: string) => {
    const apiToken = session?.user?.apiToken;

    if (!apiToken) {
      throw new Error('Your session expired. Sign in again before confirming payment.');
    }

    const result = await confirmStripePayment(apiToken, {
      orderId,
      paymentIntentId,
    });

    if (result.status !== 'succeeded') {
      throw new Error(
        result.status === 'processing'
          ? 'Stripe is still processing the payment. Refresh this page in a moment.'
          : `Stripe returned payment status "${result.status}".`,
      );
    }

    finishCheckout('card', orderId, paymentIntentId);
  };

  const createPayPalOrderIntent = async () => {
    const { apiToken, payload } = prepareCheckoutContext();

    await syncCartToBackend(apiToken, checkoutItems);
    const order = await createPayPalOrder(apiToken, payload);
    persistCheckoutSnapshot('paypal', order.orderId, order.paypalOrderId);
    return order;
  };

  const finalizePayPalPayment = async (payload: {
    orderId: string;
    paypalOrderId: string;
  }) => {
    const apiToken = session?.user?.apiToken;

    if (!apiToken) {
      throw new Error('Your session expired. Sign in again before confirming payment.');
    }

    const result = await capturePayPalOrder(apiToken, payload);

    if (result.status !== 'COMPLETED') {
      throw new Error(`PayPal returned payment status "${result.status}".`);
    }

    finishCheckout('paypal', payload.orderId, payload.paypalOrderId);
  };

  if (!hydrated) {
    return (
      <div className="section-shell p-10 text-center">
        <p className="caps-label text-scoreboard/60">
          Loading checkout...
        </p>
      </div>
    );
  }

  if (completedCheckout) {
    return (
      <div className="space-y-8">
        <section className="section-shell p-8 lg:p-10">
          <p className="caps-label text-scoreboard/45">
            Order Confirmed
          </p>
          <h2 className="mt-4 font-sans text-5xl font-extrabold tracking-[-0.05em] text-scoreboard lg:text-[4rem]">
            Payment Approved
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-scoreboard/68">
            The payment finished with{' '}
            {completedCheckout.provider === 'card' ? 'Stripe card payment' : 'PayPal'}.
            Since this store does not use delivery data in checkout, the order closes
            directly from the selected product or checkout review.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/catalog">
              <Button>Continue Shopping</Button>
            </Link>
            <Link href="/cart">
              <Button variant="secondary">Open Cart</Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="section-shell p-6 lg:p-8">
            <p className="caps-label text-scoreboard/45">
              Order Summary
            </p>
            {completedCheckout.items.length ? (
              <div className="mt-6 space-y-4">
                {completedCheckout.items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[0.9rem] border border-scoreboard/10 bg-white px-4 py-4"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-scoreboard">{item.name}</p>
                        <p className="text-sm text-scoreboard/55">
                          {item.team} - Size {item.size} - Qty {item.quantity}
                        </p>
                      </div>
                      <p className="font-sans text-2xl font-extrabold leading-none text-dugout">
                        {formatCurrency(item.priceInCents * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm leading-7 text-scoreboard/65">
                The order was completed correctly, but the local checkout snapshot is no
                longer available on this browser.
              </p>
            )}
          </div>

          <aside className="section-shell h-fit p-6">
            <p className="caps-label text-scoreboard/45">
              Payment Result
            </p>
            <div className="mt-5 rounded-[0.9rem] bg-[var(--page-panel)] px-5 py-5">
              <p className="text-xs uppercase tracking-[0.18em] text-scoreboard/48">
                Charged total
              </p>
              <p className="mt-2 font-sans text-5xl font-extrabold leading-none text-dugout">
                {formatCurrency(completedCheckout.subtotalInCents)}
              </p>
              <p className="mt-3 text-sm text-scoreboard/66">
                Paid via{' '}
                {completedCheckout.provider === 'card' ? 'Stripe Card' : 'PayPal'} for{' '}
                {completedCheckout.customer.fullName || 'the signed-in customer'}.
              </p>
            </div>
            <div className="mt-4 rounded-[1.35rem] border border-scoreboard/10 bg-white px-4 py-4 text-sm text-scoreboard/65">
              <p>Receipt email: {completedCheckout.customer.email || 'Not available'}</p>
            </div>
          </aside>
        </section>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div className="section-shell p-10 text-center">
        <p className="font-display text-5xl uppercase tracking-[0.06em] text-scoreboard">
          Checkout starts with a cart
        </p>
        <p className="mt-4 text-sm text-scoreboard/65">
          Add at least one jersey to the cart or use Buy Now from a product page.
        </p>
      </div>
    );
  }

  const paymentMethodLabel =
    paymentMethod === 'card' ? 'Card payment' : 'PayPal payment';
  const validationError = getCheckoutValidationError();

  return (
    <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
      <section className="section-shell p-6 lg:p-8">
        <p className="caps-label text-scoreboard/45">
          Order Review
        </p>
        <h2 className="mt-4 font-sans text-4xl font-extrabold tracking-[-0.04em] text-scoreboard lg:text-[3.4rem]">
          Ready To Pay
        </h2>

        <div className="mt-10 space-y-3">
          {checkoutItems.map((item) => (
            <div
              key={item.id}
              className="group flex items-center gap-4 rounded-2xl border border-scoreboard/8 bg-white p-3.5 transition-all hover:border-scoreboard/20 hover:shadow-md"
            >
              {/* Product Thumbnail */}
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-50 p-1.5 ring-1 ring-slate-100 transition-transform group-hover:scale-105">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-mlb-navy/5 text-[10px] font-black text-mlb-navy/20 uppercase">
                    MLB
                  </div>
                )}
              </div>

              {/* Item Info */}
              <div className="flex flex-1 items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-sans font-extrabold text-scoreboard uppercase tracking-tight text-sm">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-[11px] font-bold uppercase tracking-widest text-scoreboard/40">
                    {item.team} <span className="mx-1 opacity-20">•</span> Size {item.size} <span className="mx-1 opacity-20">•</span> Qty {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-sans text-xl font-extrabold leading-none text-dugout">
                    {formatCurrency(item.priceInCents * item.quantity)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      <aside className="section-shell h-fit p-6">
        <p className="caps-label text-scoreboard/45">
          Payment
        </p>
        <div className="mt-5 rounded-[0.9rem] bg-[var(--page-panel)] px-5 py-5">
          <p className="text-xs uppercase tracking-[0.18em] text-scoreboard/48">Total</p>
          <p className="mt-2 font-sans text-5xl font-extrabold leading-none text-dugout">
            {formatCurrency(subtotalInCents)}
          </p>
          <p className="mt-3 text-sm text-scoreboard/66">
            Active method: {paymentMethodLabel}. Checkout stays direct and does not
            require delivery fields in this store.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setPaymentMethod('card')}
            className={cn(
              'rounded-md border px-4 py-3 text-sm font-semibold transition',
              paymentMethod === 'card'
                ? 'border-dugout bg-dugout text-white'
                : 'border-scoreboard/10 bg-white text-scoreboard hover:border-scoreboard/25',
            )}
          >
            Card
          </button>
          <button
            onClick={() => setPaymentMethod('paypal')}
            className={cn(
              'rounded-md border px-4 py-3 text-sm font-semibold transition',
              paymentMethod === 'paypal'
                ? 'border-dugout bg-dugout text-white'
                : 'border-scoreboard/10 bg-white text-scoreboard hover:border-scoreboard/25',
            )}
          >
            PayPal
          </button>
        </div>

        {validationError ? (
          <div className="mt-5 rounded-[1.4rem] border border-amber-300/60 bg-amber-50 px-4 py-4">
            <p className="text-sm font-semibold text-scoreboard">Before paying</p>
            <p className="mt-2 text-sm leading-6 text-scoreboard/65">
              {validationError}
            </p>
          </div>
        ) : null}

        {isFinalizingStripe ? (
          <div className="mt-5 rounded-[1.4rem] border border-scoreboard/10 bg-white px-4 py-4">
            <p className="text-sm font-semibold text-scoreboard">
              Finishing secure verification...
            </p>
            <p className="mt-2 text-sm leading-6 text-scoreboard/65">
              Stripe sent the customer back to this page and the backend is now
              confirming the final payment state.
            </p>
          </div>
        ) : null}

        <div className="mt-6">
          {paymentMethod === 'card' ? (
            <StripeCardCheckout
              paymentDetails={paymentDetails}
              subtotalInCents={subtotalInCents}
              onPrepareIntent={prepareStripeIntent}
              onConfirmIntent={({ orderId, paymentIntentId }) =>
                finalizeStripePayment(orderId, paymentIntentId)
              }
            />
          ) : (
            <PayPalCheckout
              active={paymentMethod === 'paypal'}
              onCreateOrder={createPayPalOrderIntent}
              onCaptureOrder={finalizePayPalPayment}
            />
          )}
        </div>
      </aside>
    </div>
  );
}
