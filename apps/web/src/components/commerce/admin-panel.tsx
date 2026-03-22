'use client';

import { ChangeEvent, useState, useTransition } from 'react';
import { ApiError, deleteProduct, createOrUpdateProduct } from '@/lib/api';
import { Product } from '@/types/product';
import { cn, formatCurrency } from '@/lib/utils';
import { useToast } from '../providers/toast-provider';
import { Button } from '../ui/button';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');
const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const;
const CATEGORY_OPTIONS = [
  'Home',
  'Away',
  'Alternate',
  'City Connect',
  'Throwback',
  'Replica',
  'Authentic',
] as const;
const TEAM_OPTIONS = [
  { value: 'Arizona Diamondbacks', accent: '#A71930' },
  { value: 'Atlanta Braves', accent: '#CE1141' },
  { value: 'Baltimore Orioles', accent: '#DF4601' },
  { value: 'Boston Red Sox', accent: '#BD3039' },
  { value: 'Chicago Cubs', accent: '#0E3386' },
  { value: 'Chicago White Sox', accent: '#27251F' },
  { value: 'Cincinnati Reds', accent: '#C6011F' },
  { value: 'Cleveland Guardians', accent: '#E31937' },
  { value: 'Colorado Rockies', accent: '#333366' },
  { value: 'Detroit Tigers', accent: '#0C2340' },
  { value: 'Houston Astros', accent: '#EB6E1F' },
  { value: 'Kansas City Royals', accent: '#004687' },
  { value: 'Los Angeles Angels', accent: '#BA0021' },
  { value: 'Los Angeles Dodgers', accent: '#005A9C' },
  { value: 'Miami Marlins', accent: '#00A3E0' },
  { value: 'Milwaukee Brewers', accent: '#12284B' },
  { value: 'Minnesota Twins', accent: '#002B5C' },
  { value: 'New York Mets', accent: '#002D72' },
  { value: 'New York Yankees', accent: '#132448' },
  { value: 'Oakland Athletics', accent: '#003831' },
  { value: 'Philadelphia Phillies', accent: '#E81828' },
  { value: 'Pittsburgh Pirates', accent: '#FDB827' },
  { value: 'San Diego Padres', accent: '#2F241D' },
  { value: 'San Francisco Giants', accent: '#FD5A1E' },
  { value: 'Seattle Mariners', accent: '#005C5C' },
  { value: 'St. Louis Cardinals', accent: '#C41E3A' },
  { value: 'Tampa Bay Rays', accent: '#092C5C' },
  { value: 'Texas Rangers', accent: '#003278' },
  { value: 'Toronto Blue Jays', accent: '#134A8E' },
  { value: 'Washington Nationals', accent: '#AB0003' },
] as const;

type SizeOption = (typeof SIZE_OPTIONS)[number];

type FormState = {
  name: string;
  team: string;
  category: string;
  description: string;
  price: string;
  featured: boolean;
  selectedSizes: SizeOption[];
  sizeStock: Record<SizeOption, string>;
  imageUrls: string[];
};

function createDefaultSizeStock(): Record<SizeOption, string> {
  return {
    XS: '0',
    S: '6',
    M: '8',
    L: '5',
    XL: '3',
    XXL: '0',
  };
}

function createInitialFormState(): FormState {
  return {
    name: '',
    team: TEAM_OPTIONS[0].value,
    category: CATEGORY_OPTIONS[0],
    description: '',
    price: '149.00',
    featured: false,
    selectedSizes: ['S', 'M', 'L', 'XL'],
    sizeStock: createDefaultSizeStock(),
    imageUrls: [],
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function getAccentByTeam(team: string) {
  return TEAM_OPTIONS.find((entry) => entry.value === team)?.accent ?? '#0F172A';
}

export function AdminPanel({
  initialProducts,
  apiToken,
}: {
  initialProducts: Product[];
  apiToken: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [form, setForm] = useState<FormState>(createInitialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { pushToast } = useToast();

  const handleFieldChange = (
    field: keyof Pick<FormState, 'name' | 'team' | 'category' | 'description' | 'price'>,
    value: string,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const toggleSize = (size: SizeOption) => {
    setForm((current) => {
      const selectedSizes = current.selectedSizes.includes(size)
        ? current.selectedSizes.filter((entry) => entry !== size)
        : [...current.selectedSizes, size].sort(
            (left, right) => SIZE_OPTIONS.indexOf(left) - SIZE_OPTIONS.indexOf(right),
          );

      return {
        ...current,
        selectedSizes,
      };
    });
  };

  const updateSizeStock = (size: SizeOption, value: string) => {
    setForm((current) => ({
      ...current,
      sizeStock: {
        ...current.sizeStock,
        [size]: value,
      },
    }));
  };

  const normalizeProductImageUrl = (url: string) => {
    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    if (url.startsWith('/')) {
      return `${API_ORIGIN}${url}`;
    }

    return `${API_ORIGIN}/${url}`;
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file || !apiToken) {
      return;
    }

    const body = new FormData();
    body.append('file', file);

    const response = await fetch(`${API_URL}/admin/products/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body,
    });

    if (!response.ok) {
      pushToast({
        title: 'Upload failed',
        description: 'The image endpoint is not available right now.',
      });
      return;
    }

    const data = (await response.json()) as { url?: string | null };
    const uploadedUrl = data.url ? normalizeProductImageUrl(data.url) : '';

    if (!uploadedUrl) {
      return;
    }

    setForm((current) => ({
      ...current,
      imageUrls: [...current.imageUrls, uploadedUrl],
    }));

    event.target.value = '';

    pushToast({
      title: 'Image uploaded',
      description: 'The file was added to the product gallery.',
    });
  };

  const removeImage = (url: string) => {
    setForm((current) => ({
      ...current,
      imageUrls: current.imageUrls.filter((entry) => entry !== url),
    }));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(createInitialFormState());
  };

  const handleSubmit = () => {
    if (!apiToken) {
      pushToast({
        title: 'Admin token missing',
        description: 'Set up login and backend envs before creating products.',
      });
      return;
    }

    const trimmedName = form.name.trim();
    const trimmedDescription = form.description.trim();
    const generatedSlug = slugify(trimmedName);

    if (!trimmedName) {
      pushToast({
        title: 'Missing name',
        description: 'Enter the product name before saving.',
      });
      return;
    }

    if (!generatedSlug) {
      pushToast({
        title: 'Invalid name',
        description: 'Use a name that can generate a valid product URL.',
      });
      return;
    }

    if (!trimmedDescription || trimmedDescription.length < 16) {
      pushToast({
        title: 'Description too short',
        description: 'Use at least 16 characters in the product description.',
      });
      return;
    }

    if (form.selectedSizes.length === 0) {
      pushToast({
        title: 'Select sizes',
        description: 'Choose at least one available size.',
      });
      return;
    }

    startTransition(() => {
      void (async () => {
        try {
          const stockBySize = Object.fromEntries(
            form.selectedSizes.map((size) => [
              size,
              Math.max(0, Number.parseInt(form.sizeStock[size] || '0', 10) || 0),
            ]),
          );

          const payload = {
            name: trimmedName,
            slug: generatedSlug,
            team: form.team,
            category: form.category,
            description: trimmedDescription,
            priceInCents: Math.round(Number.parseFloat(form.price || '0') * 100),
            featured: form.featured,
            accent: getAccentByTeam(form.team),
            availableSizes: form.selectedSizes,
            stockBySize,
            imageUrls: form.imageUrls,
          };

          const product = await createOrUpdateProduct(apiToken, payload, editingId ?? undefined);

          setProducts((current) => {
            if (editingId) {
              return current.map((entry) => (entry.id === product.id ? product : entry));
            }

            return [product, ...current];
          });

          resetForm();
          pushToast({
            title: editingId ? 'Product updated' : 'Product created',
            description: product.name,
          });
        } catch (error) {
          pushToast({
            title: 'Save failed',
            description:
              error instanceof ApiError
                ? error.message
                : 'Check the form values and try again.',
          });
        }
      })();
    });
  };

  const handleEdit = (product: Product) => {
    const nextSizeStock = createDefaultSizeStock();

    for (const size of SIZE_OPTIONS) {
      nextSizeStock[size] = String(product.stockBySize[size] ?? 0);
    }

    setEditingId(product.id);
    setForm({
      name: product.name,
      team: product.team,
      category: product.category,
      description: product.description,
      price: (product.priceInCents / 100).toFixed(2),
      featured: product.featured,
      selectedSizes: product.availableSizes.filter((size): size is SizeOption =>
        SIZE_OPTIONS.includes(size as SizeOption),
      ),
      sizeStock: nextSizeStock,
      imageUrls: product.images.map((image) => image.url),
    });
  };

  const handleDelete = (productId: string) => {
    if (!apiToken) return;

    startTransition(() => {
      void (async () => {
        try {
          await deleteProduct(apiToken, productId);
          setProducts((current) => current.filter((product) => product.id !== productId));
          pushToast({
            title: 'Product deleted',
          });
        } catch (error) {
          pushToast({
            title: 'Delete failed',
            description:
              error instanceof ApiError
                ? error.message
                : 'The admin API rejected the request.',
          });
        }
      })();
    });
  };

  const previewSlug = slugify(form.name);

  return (
    <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="section-shell p-6 lg:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-display text-4xl uppercase tracking-[0.06em] text-scoreboard">
              {editingId ? 'Edit Product' : 'Create Product'}
            </p>
            <p className="mt-2 text-sm text-scoreboard/60">
              Slug, accent and other internal values are generated automatically.
            </p>
          </div>
          {editingId ? (
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          ) : null}
        </div>

        <div className="mt-6 grid gap-4">
          <label className="flex flex-col gap-2">
            <span className="caps-label text-scoreboard/50">Name</span>
            <input
              value={form.name}
              onChange={(event) => handleFieldChange('name', event.target.value)}
              placeholder="Los Angeles Dodgers Home Elite Jersey"
              className="form-control"
            />
            <span className="text-xs text-scoreboard/50">
              Product URL: {previewSlug ? `/product/${previewSlug}` : 'Generated from name'}
            </span>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="caps-label text-scoreboard/50">Team</span>
              <select
                value={form.team}
                onChange={(event) => handleFieldChange('team', event.target.value)}
                className="form-control"
              >
                {TEAM_OPTIONS.map((team) => (
                  <option key={team.value} value={team.value}>
                    {team.value}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-2">
              <span className="caps-label text-scoreboard/50">Category</span>
              <select
                value={form.category}
                onChange={(event) => handleFieldChange('category', event.target.value)}
                className="form-control"
              >
                {CATEGORY_OPTIONS.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="caps-label text-scoreboard/50">Price (USD)</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => handleFieldChange('price', event.target.value)}
              className="form-control"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="caps-label text-scoreboard/50">Description</span>
            <textarea
              value={form.description}
              onChange={(event) => handleFieldChange('description', event.target.value)}
              placeholder="Pinstriped presence with a championship silhouette built for collectors..."
              className="form-control min-h-28"
            />
          </label>

          <div className="rounded-[1.75rem] border border-scoreboard/10 bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-scoreboard/50">
                  Available Sizes
                </p>
                <p className="mt-1 text-sm text-scoreboard/60">
                  Choose the sizes you want to sell and assign stock visually.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              {SIZE_OPTIONS.map((size) => {
                const active = form.selectedSizes.includes(size);

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={cn(
                      'rounded-full border px-4 py-2 text-sm font-semibold transition',
                      active
                        ? 'border-scoreboard bg-scoreboard text-white'
                        : 'border-scoreboard/10 bg-white text-scoreboard hover:border-scoreboard/30',
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>

            {form.selectedSizes.length ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {form.selectedSizes.map((size) => (
                  <label
                    key={size}
                    className="flex items-center justify-between rounded-2xl border border-scoreboard/10 bg-[#fbfaf8] px-4 py-3"
                  >
                    <span className="text-sm font-semibold text-scoreboard">{size}</span>
                    <input
                      type="number"
                      min="0"
                      value={form.sizeStock[size]}
                      onChange={(event) => updateSizeStock(size, event.target.value)}
                      className="w-24 rounded-xl border border-scoreboard/10 bg-white px-3 py-2 text-right text-sm outline-none transition focus:border-seam/40"
                    />
                  </label>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-scoreboard/55">
                Select at least one size to define stock.
              </p>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-scoreboard/10 bg-white px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-scoreboard/50">
                  Images
                </p>
                <p className="mt-1 text-sm text-scoreboard/60">
                  Upload one or more images for the product gallery.
                </p>
              </div>
              <span className="rounded-full bg-scoreboard/5 px-3 py-1 text-xs font-semibold text-scoreboard/65">
                {form.imageUrls.length} uploaded
              </span>
            </div>

            {form.imageUrls.length ? (
              <div className="mt-4 space-y-3">
                {form.imageUrls.map((url, index) => (
                  <div
                    key={url}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-scoreboard/10 bg-[#fbfaf8] px-3 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={url}
                        alt={`Uploaded product image ${index + 1}`}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-sm font-semibold text-scoreboard">
                          Image {index + 1}
                        </p>
                        <p className="max-w-[180px] truncate text-xs text-scoreboard/55">
                          {url}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" onClick={() => removeImage(url)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-scoreboard/55">
                No images uploaded yet. The product can still be saved.
              </p>
            )}

            <label className="mt-4 flex flex-col gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-scoreboard/50">
                Upload Image
              </span>
              <input type="file" accept="image/*" onChange={handleImageUpload} />
            </label>
          </div>

          <label className="flex items-center gap-3 rounded-2xl border border-scoreboard/10 bg-scoreboard/5 px-4 py-3 text-sm font-semibold text-scoreboard">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  featured: event.target.checked,
                }))
              }
            />
            Feature on home page
          </label>

          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </section>

      <section className="section-shell p-6 lg:p-8">
        <p className="font-display text-4xl uppercase tracking-[0.06em] text-scoreboard">
          Product Library
        </p>
        <div className="mt-6 space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="rounded-[1.75rem] border border-scoreboard/10 bg-white px-5 py-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-[75%]">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-scoreboard/45">
                    {product.team}
                  </p>
                  <p className="mt-2 font-display text-3xl uppercase leading-none tracking-[0.04em] text-scoreboard">
                    {product.name}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-scoreboard/55">
                    {product.category} | {formatCurrency(product.priceInCents)}
                  </p>
                  <p className="mt-3 text-sm text-scoreboard/65">{product.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-scoreboard/45">
                    Sizes: {product.availableSizes.join(', ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => handleEdit(product)}>
                    Edit
                  </Button>
                  <Button variant="danger" onClick={() => handleDelete(product.id)}>
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
