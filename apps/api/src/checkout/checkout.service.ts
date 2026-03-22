import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus } from '@prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { CapturePayPalOrderDto } from './dto/capture-paypal-order.dto';
import { ConfirmStripePaymentDto } from './dto/confirm-stripe-payment.dto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CreatePaymentMethodDto } from './dto/create-payment-method.dto';

@Injectable()
export class CheckoutService {
  constructor(private readonly prisma: PrismaService) {}

  async createSession(user: { id: string; email: string }, dto: CreateCheckoutSessionDto) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty.');
    }

    const subtotalInCents = cart.items.reduce(
      (sum, item) => sum + item.product.priceInCents * item.quantity,
      0,
    );
    const checkoutEmail = dto.email ?? user.email;

    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        checkoutEmail,
        subtotalInCents,
        status: OrderStatus.DRAFT,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            unitPriceCents: item.product.priceInCents,
          })),
        },
      },
    });

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      await this.prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PENDING_PAYMENT },
      });

      return {
        orderId: order.id,
        checkoutUrl:
          process.env.STRIPE_SUCCESS_URL ??
          'http://localhost:3000/checkout?status=success&mocked=1',
        mocked: true,
      };
    }

    const stripe = new Stripe(stripeSecretKey);
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: checkoutEmail,
      success_url:
        process.env.STRIPE_SUCCESS_URL ??
        'http://localhost:3000/checkout?status=success',
      cancel_url:
        process.env.STRIPE_CANCEL_URL ?? 'http://localhost:3000/cart?status=cancelled',
      metadata: {
        orderId: order.id,
        userId: user.id,
      },
      line_items: cart.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: 'usd',
          unit_amount: item.product.priceInCents,
          product_data: {
            name: item.product.name,
            description: `${item.product.team} - Size ${item.size}`,
          },
        },
      })),
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PENDING_PAYMENT,
        stripeSessionId: session.id,
      },
    });

    return {
      orderId: order.id,
      checkoutUrl: session.url,
      mocked: false,
    };
  }

  async createStripePaymentIntent(
    user: { id: string; email: string; name?: string },
    dto: CreatePaymentMethodDto,
  ) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new BadRequestException(
        'Stripe is not configured yet. Add STRIPE_SECRET_KEY in the API env.',
      );
    }

    const cart = await this.getCartForCheckout(user.id);
    const subtotalInCents = this.calculateSubtotalInCents(cart.items);
    const checkoutEmail = dto.email?.trim() || user.email;
    const customerName = dto.fullName?.trim() || user.name || checkoutEmail;
    const order = await this.createDraftOrder(
      user,
      cart.items,
      subtotalInCents,
      checkoutEmail,
    );

    const stripe = new Stripe(stripeSecretKey);
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: subtotalInCents,
      currency: 'usd',
      payment_method_types: ['card'],
      receipt_email: checkoutEmail,
      metadata: {
        orderId: order.id,
        userId: user.id,
        customerName,
      },
    };

    if (dto.addressLine1 && dto.city && dto.state && dto.postalCode && dto.country) {
      paymentIntentParams.shipping = {
        name: customerName,
        phone: dto.phone,
        address: {
          line1: dto.addressLine1,
          line2: dto.addressLine2,
          city: dto.city,
          state: dto.state,
          postal_code: dto.postalCode,
          country: dto.country.toUpperCase(),
        },
      };
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    if (!paymentIntent.client_secret) {
      throw new BadRequestException('Stripe did not return a client secret.');
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PENDING_PAYMENT,
        stripePaymentId: paymentIntent.id,
      },
    });

    return {
      orderId: order.id,
      clientSecret: paymentIntent.client_secret,
    };
  }

  async confirmStripePayment(
    user: { id: string; email: string; name?: string },
    dto: ConfirmStripePaymentDto,
  ) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      throw new BadRequestException(
        'Stripe is not configured yet. Add STRIPE_SECRET_KEY in the API env.',
      );
    }

    const order = await this.prisma.order.findFirst({
      where: {
        id: dto.orderId,
        userId: user.id,
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found.');
    }

    const stripe = new Stripe(stripeSecretKey);
    const paymentIntent = await stripe.paymentIntents.retrieve(dto.paymentIntentId);

    if (paymentIntent.metadata.orderId !== order.id) {
      throw new BadRequestException('Payment does not belong to this order.');
    }

    if (paymentIntent.status === 'succeeded') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          stripePaymentId: paymentIntent.id,
        },
      });

      await this.clearCart(user.id);
    }

    return {
      orderId: order.id,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    };
  }

  async createPayPalOrder(
    user: { id: string; email: string; name?: string },
    dto: CreatePaymentMethodDto,
  ) {
    const cart = await this.getCartForCheckout(user.id);
    const subtotalInCents = this.calculateSubtotalInCents(cart.items);
    const checkoutEmail = dto.email?.trim() || user.email;
    const order = await this.createDraftOrder(
      user,
      cart.items,
      subtotalInCents,
      checkoutEmail,
    );
    const accessToken = await this.getPayPalAccessToken();
    const amountValue = this.toUsdAmount(subtotalInCents);

    const response = await fetch(`${this.getPayPalBaseUrl()}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: order.id,
            description: `MLB Dugout Store order ${order.id}`,
            amount: {
              currency_code: 'USD',
              value: amountValue,
            },
          },
        ],
      }),
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          id?: string;
          message?: string;
        }
      | null;

    if (!response.ok || !payload?.id) {
      throw new BadRequestException(
        this.getErrorMessage(payload, 'PayPal could not create the order.'),
      );
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PENDING_PAYMENT,
        stripeSessionId: payload.id,
      },
    });

    return {
      orderId: order.id,
      paypalOrderId: payload.id,
    };
  }

  async capturePayPalOrder(
    user: { id: string; email: string; name?: string },
    dto: CapturePayPalOrderDto,
  ) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: dto.orderId,
        userId: user.id,
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found.');
    }

    if (order.stripeSessionId && order.stripeSessionId !== dto.paypalOrderId) {
      throw new BadRequestException('PayPal order does not match this checkout.');
    }

    const accessToken = await this.getPayPalAccessToken();
    const response = await fetch(
      `${this.getPayPalBaseUrl()}/v2/checkout/orders/${dto.paypalOrderId}/capture`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const payload = (await response.json().catch(() => null)) as
      | {
          id?: string;
          status?: string;
          message?: string;
        }
      | null;

    if (!response.ok) {
      throw new BadRequestException(
        this.getErrorMessage(payload, 'PayPal could not capture the order.'),
      );
    }

    const status = payload?.status ?? 'PENDING';

    if (status === 'COMPLETED') {
      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          stripeSessionId: dto.paypalOrderId,
        },
      });

      await this.clearCart(user.id);
    }

    return {
      orderId: order.id,
      paypalOrderId: dto.paypalOrderId,
      status,
    };
  }

  private async getCartForCheckout(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new BadRequestException('Cart is empty.');
    }

    return cart;
  }

  private calculateSubtotalInCents(
    items: Array<{
      quantity: number;
      product: {
        priceInCents: number;
      };
    }>,
  ) {
    return items.reduce((sum, item) => sum + item.product.priceInCents * item.quantity, 0);
  }

  private async createDraftOrder(
    user: { id: string; email: string; name?: string },
    items: Array<{
      productId: string;
      size: string;
      quantity: number;
      product: {
        priceInCents: number;
      };
    }>,
    subtotalInCents: number,
    checkoutEmail: string,
  ) {
    return this.prisma.order.create({
      data: {
        userId: user.id,
        checkoutEmail,
        subtotalInCents,
        status: OrderStatus.DRAFT,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            unitPriceCents: item.product.priceInCents,
          })),
        },
      },
    });
  }

  private async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!cart) {
      return;
    }

    await this.prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });
  }

  private getPayPalBaseUrl() {
    return process.env.PAYPAL_BASE_URL ?? 'https://api-m.sandbox.paypal.com';
  }

  private async getPayPalAccessToken() {
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new BadRequestException(
        'PayPal is not configured yet. Add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in the API env.',
      );
    }

    const response = await fetch(`${this.getPayPalBaseUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString(
          'base64',
        )}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const payload = (await response.json().catch(() => null)) as
      | {
          access_token?: string;
          error_description?: string;
        }
      | null;

    if (!response.ok || !payload?.access_token) {
      throw new BadRequestException(
        payload?.error_description ?? 'PayPal authentication failed.',
      );
    }

    return payload.access_token;
  }

  private toUsdAmount(amountInCents: number) {
    return (amountInCents / 100).toFixed(2);
  }

  private getErrorMessage(
    payload: {
      message?: string;
    } | null,
    fallback: string,
  ) {
    return payload?.message ?? fallback;
  }
}
