'use client';

import { useEffect, useRef, useState } from 'react';
import { loadExternalScript } from '@/lib/load-external-script';
import { useToast } from '../providers/toast-provider';

type PayPalCheckoutProps = {
  active: boolean;
  onCreateOrder: () => Promise<{
    orderId: string;
    paypalOrderId: string;
  }>;
  onCaptureOrder: (payload: {
    orderId: string;
    paypalOrderId: string;
  }) => Promise<void>;
};

export function PayPalCheckout({
  active,
  onCreateOrder,
  onCaptureOrder,
}: PayPalCheckoutProps) {
  const { pushToast } = useToast();
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const currency = process.env.NEXT_PUBLIC_PAYPAL_CURRENCY ?? 'USD';
  const [sdkState, setSdkState] = useState<'idle' | 'loading' | 'ready' | 'missing'>(
    clientId ? 'idle' : 'missing',
  );
  const createOrderRef = useRef(onCreateOrder);
  const captureOrderRef = useRef(onCaptureOrder);
  const currentOrderIdRef = useRef<string | null>(null);
  const containerIdRef = useRef(
    `paypal-button-container-${Math.random().toString(36).slice(2)}`,
  );

  createOrderRef.current = onCreateOrder;
  captureOrderRef.current = onCaptureOrder;

  useEffect(() => {
    if (!active) {
      return;
    }

    if (!clientId) {
      setSdkState('missing');
      return;
    }

    let cancelled = false;
    setSdkState('loading');

    const scriptSrc = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      clientId,
    )}&currency=${encodeURIComponent(currency)}&intent=capture&components=buttons`;

    void loadExternalScript(scriptSrc)
      .then(async () => {
        if (cancelled || !window.paypal) {
          return;
        }

        const container = document.getElementById(containerIdRef.current);

        if (!container) {
          return;
        }

        container.innerHTML = '';

        const buttons = window.paypal.Buttons({
          style: {
            layout: 'vertical',
            shape: 'pill',
            color: 'gold',
            label: 'paypal',
            height: 46,
          },
          createOrder: async () => {
            const order = await createOrderRef.current();
            currentOrderIdRef.current = order.orderId;
            return order.paypalOrderId;
          },
          onApprove: async (data: { orderID?: string }) => {
            if (!currentOrderIdRef.current || !data.orderID) {
              throw new Error('PayPal did not return a valid order reference.');
            }

            await captureOrderRef.current({
              orderId: currentOrderIdRef.current,
              paypalOrderId: data.orderID,
            });
          },
          onError: (error: unknown) => {
            pushToast({
              title: 'PayPal unavailable',
              description:
                error instanceof Error
                  ? error.message
                  : 'PayPal could not complete the checkout.',
            });
          },
        });

        await buttons.render(`#${containerIdRef.current}`);

        if (!cancelled) {
          setSdkState('ready');
        }
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        setSdkState('idle');
        pushToast({
          title: 'PayPal unavailable',
          description:
            error instanceof Error
              ? error.message
              : 'The PayPal SDK could not be loaded.',
        });
      });

    return () => {
      cancelled = true;

      const container = document.getElementById(containerIdRef.current);

      if (container) {
        container.innerHTML = '';
      }
    };
  }, [active, clientId, currency, pushToast]);

  if (!clientId) {
    return (
      <div className="rounded-[1.6rem] border border-amber-300/60 bg-amber-50 px-4 py-4">
        <p className="text-sm font-semibold text-scoreboard">PayPal unavailable</p>
        <p className="mt-2 text-sm leading-6 text-scoreboard/65">
          Add `NEXT_PUBLIC_PAYPAL_CLIENT_ID` in the web env and the PayPal API keys in
          the backend env to render the PayPal button.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[0.9rem] border border-scoreboard/10 bg-white px-4 py-4">
        <p className="text-sm font-semibold text-scoreboard">PayPal checkout</p>
        <p className="mt-2 text-sm leading-6 text-scoreboard/62">
          Approve the payment in the PayPal pop-up and the backend will capture the
          order before confirming the checkout.
        </p>
      </div>
      <div className="rounded-[0.9rem] border border-scoreboard/10 bg-white px-4 py-4">
        <div id={containerIdRef.current} className="min-h-[96px]" />
        {sdkState === 'loading' ? (
          <p className="mt-3 text-sm text-scoreboard/60">Loading PayPal...</p>
        ) : null}
      </div>
    </div>
  );
}
