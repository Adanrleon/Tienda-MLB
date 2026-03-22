'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { loadExternalScript } from '@/lib/load-external-script';
import { formatCurrency } from '@/lib/utils';
import { CheckoutFormValues } from '@/types/checkout';
import { Button } from '../ui/button';
import { useToast } from '../providers/toast-provider';

type StripeCardCheckoutProps = {
  paymentDetails: CheckoutFormValues;
  subtotalInCents: number;
  onPrepareIntent: () => Promise<{
    orderId: string;
    clientSecret: string;
  }>;
  onConfirmIntent: (payload: {
    orderId: string;
    paymentIntentId: string;
  }) => Promise<void>;
};

const STRIPE_SCRIPT_URL = 'https://js.stripe.com/v3/';

export function StripeCardCheckout({
  paymentDetails,
  subtotalInCents,
  onPrepareIntent,
  onConfirmIntent,
}: StripeCardCheckoutProps) {
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  const { pushToast } = useToast();
  const [preparedIntent, setPreparedIntent] = useState<{
    orderId: string;
    clientSecret: string;
  } | null>(null);
  const [elementState, setElementState] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [isPreparing, startPreparingTransition] = useTransition();
  const [isSubmitting, startSubmittingTransition] = useTransition();
  const stripeRef = useRef<any>(null);
  const elementsRef = useRef<any>(null);
  const paymentElementRef = useRef<any>(null);
  const containerIdRef = useRef(
    `stripe-payment-element-${Math.random().toString(36).slice(2)}`,
  );

  useEffect(() => {
    if (!preparedIntent?.clientSecret || !publishableKey) {
      return;
    }

    let cancelled = false;
    setElementState('loading');

    void loadExternalScript(STRIPE_SCRIPT_URL)
      .then(() => {
        if (cancelled || !window.Stripe) {
          return;
        }

        const stripe = window.Stripe(publishableKey);

        if (!stripe) {
          throw new Error('Stripe.js could not be initialized.');
        }

        stripeRef.current = stripe;
        elementsRef.current = stripe.elements({
          clientSecret: preparedIntent.clientSecret,
          appearance: {
            theme: 'stripe',
            variables: {
              colorPrimary: '#09111f',
              colorText: '#09111f',
              colorDanger: '#d7263d',
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              borderRadius: '18px',
            },
          },
        });

        paymentElementRef.current?.destroy?.();
        paymentElementRef.current = elementsRef.current.create('payment', {
          layout: 'tabs',
        });
        paymentElementRef.current.mount(`#${containerIdRef.current}`);

        if (!cancelled) {
          setElementState('ready');
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setElementState('idle');
        pushToast({
          title: 'Stripe unavailable',
          description:
            error instanceof Error
              ? error.message
              : 'The secure card form could not be loaded.',
        });
      });

    return () => {
      cancelled = true;
      paymentElementRef.current?.destroy?.();
      paymentElementRef.current = null;
      elementsRef.current = null;
      stripeRef.current = null;

      const container = document.getElementById(containerIdRef.current);

      if (container) {
        container.innerHTML = '';
      }
    };
  }, [preparedIntent?.clientSecret, publishableKey, pushToast]);

  const handlePrepareForm = () => {
    if (!publishableKey) {
      pushToast({
        title: 'Stripe missing',
        description:
          'Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in the web env to render the card form.',
      });
      return;
    }

    startPreparingTransition(() => {
      void (async () => {
        try {
          const intent = await onPrepareIntent();
          setPreparedIntent(intent);
        } catch (error) {
          pushToast({
            title: 'Card form unavailable',
            description:
              error instanceof Error
                ? error.message
                : 'The secure card form could not be prepared.',
          });
        }
      })();
    });
  };

  const handleSubmitPayment = () => {
    if (!stripeRef.current || !elementsRef.current || !preparedIntent) {
      pushToast({
        title: 'Card form not ready',
        description: 'Load the secure card fields before confirming the payment.',
      });
      return;
    }

    startSubmittingTransition(() => {
      void (async () => {
        const stripe = stripeRef.current;
        const elements = elementsRef.current;
        const billingDetails: Record<string, unknown> = {};
        const address: Record<string, string> = {};

        if (typeof elements.submit === 'function') {
          const submitResult = await elements.submit();

          if (submitResult?.error) {
            pushToast({
              title: 'Card form incomplete',
              description:
                submitResult.error.message ??
                'Complete the Stripe card fields before continuing.',
            });
            return;
          }
        }

        if (paymentDetails.fullName) {
          billingDetails.name = paymentDetails.fullName;
        }

        if (paymentDetails.email) {
          billingDetails.email = paymentDetails.email;
        }

        if (paymentDetails.phone) {
          billingDetails.phone = paymentDetails.phone;
        }

        if (paymentDetails.addressLine1) {
          address.line1 = paymentDetails.addressLine1;
        }

        if (paymentDetails.addressLine2) {
          address.line2 = paymentDetails.addressLine2;
        }

        if (paymentDetails.city) {
          address.city = paymentDetails.city;
        }

        if (paymentDetails.state) {
          address.state = paymentDetails.state;
        }

        if (paymentDetails.postalCode) {
          address.postal_code = paymentDetails.postalCode;
        }

        if (paymentDetails.country) {
          address.country = paymentDetails.country;
        }

        if (Object.keys(address).length > 0) {
          billingDetails.address = address;
        }

        const confirmParams: Record<string, unknown> = {
          return_url: `${window.location.origin}/checkout?provider=stripe`,
        };

        if (Object.keys(billingDetails).length > 0) {
          confirmParams.payment_method_data = {
            billing_details: billingDetails,
          };
        }

        const result = await stripe.confirmPayment({
          elements,
          confirmParams,
          redirect: 'if_required',
        });

        if (result.error) {
          pushToast({
            title: 'Card payment failed',
            description:
              result.error.message ??
              'Stripe rejected the card details. Check the form and try again.',
          });
          return;
        }

        if (result.paymentIntent?.id) {
          try {
            await onConfirmIntent({
              orderId: preparedIntent.orderId,
              paymentIntentId: result.paymentIntent.id,
            });
          } catch (error) {
            pushToast({
              title: 'Payment pending',
              description:
                error instanceof Error
                  ? error.message
                  : 'The payment succeeded in Stripe, but the backend could not confirm it yet.',
            });
          }
          return;
        }

        pushToast({
          title: 'Additional verification required',
          description:
            'Stripe is continuing the secure verification flow. Finish it and return to this page.',
        });
      })();
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[0.9rem] border border-scoreboard/10 bg-white px-4 py-4">
        <p className="text-sm font-semibold text-scoreboard">Card checkout</p>
        <p className="mt-2 text-sm leading-6 text-scoreboard/62">
          Load the secure card form directly inside this page, then enter the card
          number, expiry date, CVC, and billing details to complete the payment.
        </p>
      </div>

      {!preparedIntent ? (
        <Button className="w-full" onClick={handlePrepareForm} disabled={isPreparing}>
          {isPreparing ? 'Preparing secure card form...' : 'Load Secure Card Form'}
        </Button>
      ) : null}

      {preparedIntent ? (
        <div className="rounded-[0.9rem] border border-scoreboard/10 bg-white px-4 py-4">
          <p className="caps-label text-scoreboard/45">
            Secure Card Fields
          </p>
          <div
            id={containerIdRef.current}
            className="mt-4 min-h-[238px] rounded-[0.75rem] border border-scoreboard/10 bg-[var(--page-panel)] p-3"
          />
          {elementState !== 'ready' ? (
            <p className="mt-3 text-sm text-scoreboard/60">Loading Stripe Elements...</p>
          ) : null}
          <Button
            className="mt-5 w-full"
            onClick={handleSubmitPayment}
            disabled={elementState !== 'ready' || isSubmitting}
          >
            {isSubmitting
              ? 'Confirming card payment...'
              : `Pay ${formatCurrency(subtotalInCents)} by card`}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
