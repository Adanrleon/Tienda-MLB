import { CheckoutFormValues } from '@/types/checkout';
import { CartLine, Product } from '@/types/product';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

type ProductFilters = {
  team?: string;
  category?: string;
  search?: string;
  featured?: boolean;
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}



function buildQuery(filters: ProductFilters) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.set(key, String(value));
  });

  const query = params.toString();
  return query ? `?${query}` : '';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') ?? '';
  const payload = contentType.includes('application/json')
    ? await response.json().catch(() => null)
    : await response.text().catch(() => null);

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;

    if (payload && typeof payload === 'object' && 'message' in payload) {
      const errorMessage = payload.message;

      if (typeof errorMessage === 'string') {
        message = errorMessage;
      } else if (
        Array.isArray(errorMessage) &&
        errorMessage.every((entry) => typeof entry === 'string')
      ) {
        message = errorMessage.join(' ');
      }
    }

    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

function normalizeImageUrl(url: string) {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  if (url.startsWith('/')) {
    return `${API_ORIGIN}${url}`;
  }

  return `${API_ORIGIN}/${url}`;
}

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    images: product.images.map((image) => ({
      ...image,
      url: normalizeImageUrl(image.url),
    })),
  };
}

export async function getProducts(filters: ProductFilters = {}) {
  try {
    const products = await request<Product[]>(`/products${buildQuery(filters)}`);
    return products.map(normalizeProduct);
  } catch {
    return [];
  }
}

export async function getFeaturedProducts() {
  try {
    const products = await request<Product[]>('/products/featured');
    return products.map(normalizeProduct);
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string) {
  try {
    return normalizeProduct(await request<Product>(`/products/${slug}`));
  } catch {
    return null;
  }
}

export async function createCheckoutSession(apiToken: string, email?: string) {
  return request<{ checkoutUrl: string; mocked: boolean }>('/checkout/session', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({ email }),
  });
}

function sanitizePaymentPayload(payload: CheckoutFormValues) {
  const fullName = payload.fullName.trim();
  const email = payload.email.trim();
  const phone = payload.phone.trim();
  const addressLine1 = payload.addressLine1.trim();
  const addressLine2 = payload.addressLine2.trim();
  const city = payload.city.trim();
  const state = payload.state.trim();
  const postalCode = payload.postalCode.trim();
  const country = payload.country.trim().toUpperCase();

  return {
    fullName: fullName || undefined,
    email: email || undefined,
    phone: phone || undefined,
    addressLine1: addressLine1 || undefined,
    addressLine2: addressLine2 || undefined,
    city: city || undefined,
    state: state || undefined,
    postalCode: postalCode || undefined,
    country: country || undefined,
  };
}

export async function syncCartToBackend(apiToken: string, items: CartLine[]) {
  await request('/cart', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });

  for (const item of items) {
    await request('/cart/items', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      }),
    });
  }
}

export async function createStripePaymentIntent(
  apiToken: string,
  payload: CheckoutFormValues,
) {
  return request<{ orderId: string; clientSecret: string }>(
    '/checkout/stripe/payment-intent',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(sanitizePaymentPayload(payload)),
    },
  );
}

export async function confirmStripePayment(
  apiToken: string,
  payload: {
    orderId: string;
    paymentIntentId: string;
  },
) {
  return request<{ orderId: string; paymentIntentId: string; status: string }>(
    '/checkout/stripe/confirm',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function createPayPalOrder(apiToken: string, payload: CheckoutFormValues) {
  return request<{ orderId: string; paypalOrderId: string }>('/checkout/paypal/order', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify(sanitizePaymentPayload(payload)),
  });
}

export async function capturePayPalOrder(
  apiToken: string,
  payload: {
    orderId: string;
    paypalOrderId: string;
  },
) {
  return request<{ orderId: string; paypalOrderId: string; status: string }>(
    '/checkout/paypal/capture',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(payload),
    },
  );
}

export async function createOrUpdateProduct(
  apiToken: string,
  payload: Record<string, unknown>,
  editingId?: string,
) {
  const method = editingId ? 'PATCH' : 'POST';
  const path = editingId ? `/admin/products/${editingId}` : '/admin/products';

  return normalizeProduct(
    await request<Product>(path, {
      method,
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(payload),
    }),
  );
}

export async function deleteProduct(apiToken: string, productId: string) {
  return request<{ success: boolean }>(`/admin/products/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${apiToken}`,
    },
  });
}
