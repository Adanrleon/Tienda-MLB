'use client';

import { ChangeEvent, useState, useTransition } from 'react';
import { Search, ChevronLeft, ChevronRight, Edit3, Trash2, ImageIcon, Star } from 'lucide-react';
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
const TEAM_LOGOS: Record<string, string> = {
  'Arizona Diamondbacks': '109',
  'Atlanta Braves': '144',
  'Baltimore Orioles': '110',
  'Boston Red Sox': '111',
  'Chicago Cubs': '112',
  'Chicago White Sox': '145',
  'Cincinnati Reds': '113',
  'Cleveland Guardians': '114',
  'Colorado Rockies': '115',
  'Detroit Tigers': '116',
  'Houston Astros': '117',
  'Kansas City Royals': '118',
  'Los Angeles Angels': '108',
  'Los Angeles Dodgers': '119',
  'Miami Marlins': '146',
  'Milwaukee Brewers': '158',
  'Minnesota Twins': '142',
  'New York Mets': '121',
  'New York Yankees': '147',
  'Oakland Athletics': '133',
  'Philadelphia Phillies': '143',
  'Pittsburgh Pirates': '134',
  'San Diego Padres': '135',
  'San Francisco Giants': '137',
  'Seattle Mariners': '136',
  'St. Louis Cardinals': '138',
  'Tampa Bay Rays': '139',
  'Texas Rangers': '140',
  'Toronto Blue Jays': '141',
  'Washington Nationals': '120',
};

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

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editConfirmProduct, setEditConfirmProduct] = useState<Product | null>(null);

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
    setIsFormOpen(false);
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
    setIsFormOpen(true);
  };

  const handleEditClick = (product: Product) => {
    if (isFormOpen && !editingId) {
      const isNewFormDirty = form.name.trim() !== '' || form.description.trim() !== '' || form.imageUrls.length > 0;
      if (isNewFormDirty) {
        setEditConfirmProduct(product);
        return;
      }
    }

    if (editingId) {
      if (editingId === product.id) {
         document.getElementById('admin-library-top')?.scrollIntoView({ behavior: 'smooth' });
         return;
      }
      
      const currentProductBeingEdited = products.find(p => p.id === editingId);
      if (currentProductBeingEdited) {
        const isProductDirty = 
          form.name !== currentProductBeingEdited.name ||
          form.description !== currentProductBeingEdited.description ||
          form.price !== (currentProductBeingEdited.priceInCents / 100).toFixed(2) ||
          form.team !== currentProductBeingEdited.team ||
          form.category !== currentProductBeingEdited.category ||
          form.featured !== currentProductBeingEdited.featured ||
          form.imageUrls.length !== currentProductBeingEdited.images.length;

        if (isProductDirty) {
          setEditConfirmProduct(product);
          return;
        }
      }
    }

    handleEdit(product);
    document.getElementById('admin-library-top')?.scrollIntoView({ behavior: 'smooth' });
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

  // Library Pagination & Filtering logic
  const filteredLibraryProducts = products.filter((p) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.team.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(filteredLibraryProducts.length / ITEMS_PER_PAGE);
  const paginatedLibraryProducts = filteredLibraryProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    document.getElementById('admin-library-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="mx-auto max-w-7xl">
      {isFormOpen || editingId ? (
      <section className="section-shell p-6 lg:p-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-4">
            <button 
              onClick={resetForm} 
              className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-scoreboard/5 hover:bg-scoreboard/10 transition-colors"
              title="Go Back to Library"
              aria-label="Go Back"
            >
              <ChevronLeft className="h-5 w-5 text-scoreboard/70" />
            </button>
            <div>
              <p className="font-display text-4xl uppercase tracking-[0.06em] text-scoreboard">
                {editingId ? 'Edit Product' : 'Create Product'}
              </p>
              <p className="mt-2 text-sm text-scoreboard/60">
                Slug, accent and other internal values are generated automatically.
              </p>
            </div>
          </div>
          {editingId ? (
            <Button variant="ghost" onClick={resetForm}>
              Cancel
            </Button>
          ) : null}
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Main Content Column */}
          <div className="flex flex-col gap-6 lg:col-span-8">
            <div className="rounded-[1.75rem] border border-scoreboard/10 bg-[#fbfaf8] p-6 lg:p-8">
              <h3 className="mb-6 flex items-center font-display text-2xl tracking-[0.04em] text-scoreboard">
                Basic Information
              </h3>
              
              <div className="grid gap-6">
                <label className="flex flex-col gap-2">
                  <span className="caps-label text-scoreboard/50">Product Name</span>
                  <input
                    value={form.name}
                    onChange={(event) => handleFieldChange('name', event.target.value)}
                    placeholder="e.g. Los Angeles Dodgers Home Elite Jersey"
                    className="w-full rounded-2xl border border-scoreboard/10 bg-white px-4 py-3 outline-none transition focus:border-mlb-red focus:ring-1 focus:ring-mlb-red font-medium"
                  />
                  <span className="text-xs font-semibold text-scoreboard/40">
                    URL: <span className="text-mlb-navy">{previewSlug ? `/product/${previewSlug}` : 'auto-generated'}</span>
                  </span>
                </label>

                <div className="grid gap-6 md:grid-cols-2">
                  <label className="flex flex-col gap-2">
                    <span className="caps-label text-scoreboard/50">Team</span>
                    <select
                      value={form.team}
                      onChange={(event) => handleFieldChange('team', event.target.value)}
                      className="w-full rounded-2xl border border-scoreboard/10 bg-white px-4 py-3 outline-none transition focus:border-mlb-red focus:ring-1 focus:ring-mlb-red font-medium appearance-none"
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
                      className="w-full rounded-2xl border border-scoreboard/10 bg-white px-4 py-3 outline-none transition focus:border-mlb-red focus:ring-1 focus:ring-mlb-red font-medium appearance-none"
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
                  <span className="caps-label text-scoreboard/50">Description</span>
                  <textarea
                    value={form.description}
                    onChange={(event) => handleFieldChange('description', event.target.value)}
                    placeholder="Write a compelling description for this jersey..."
                    className="w-full rounded-2xl border border-scoreboard/10 bg-white px-4 py-3 outline-none transition focus:border-mlb-red focus:ring-1 focus:ring-mlb-red min-h-[140px] font-medium resize-y"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-scoreboard/10 bg-[#fbfaf8] p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="flex items-center font-display text-2xl tracking-[0.04em] text-scoreboard">
                  Media Gallery
                </h3>
                <span className="rounded-full bg-mlb-red/10 px-3 py-1 text-xs font-bold text-mlb-red">
                  {form.imageUrls.length} File{form.imageUrls.length !== 1 ? 's' : ''}
                </span>
              </div>

              {form.imageUrls.length > 0 ? (
                <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {form.imageUrls.map((url, index) => (
                    <div
                      key={url}
                      className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-scoreboard/10 bg-white shadow-sm transition-all hover:shadow-md"
                    >
                      <img
                        src={url}
                        alt={`Uploaded product image ${index + 1}`}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                        <Button 
                          variant="danger" 
                          onClick={() => removeImage(url)}
                          className="scale-90 shadow-xl"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mb-6 flex min-h-[160px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-scoreboard/20 bg-white/50 px-6 py-8 text-center transition-colors hover:bg-white">
                  <div className="rounded-full bg-scoreboard/5 p-4 mb-4">
                    <svg className="h-8 w-8 text-scoreboard/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-scoreboard/80">
                    No images uploaded yet.
                  </p>
                  <p className="mt-1 text-xs text-scoreboard/50">
                    Optimal format: JPG, PNG • Max size: 5MB
                  </p>
                </div>
              )}

              <label className="relative flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-scoreboard/20 bg-white py-4 px-4 font-semibold text-mlb-navy shadow-sm transition-all hover:bg-slate-50 hover:border-mlb-navy/30">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                Upload New Image
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Sidebar Column */}
          <div className="flex flex-col gap-6 lg:col-span-4">
            <div className="rounded-[1.75rem] border border-scoreboard/10 bg-[#fbfaf8] p-6">
              <h3 className="mb-6 font-display text-2xl tracking-[0.04em] text-scoreboard">
                Pricing
              </h3>
              <label className="flex flex-col gap-2">
                <span className="caps-label text-scoreboard/50">Retail Price (USD)</span>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-scoreboard/50 font-bold">
                    $
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(event) => handleFieldChange('price', event.target.value)}
                    className="w-full rounded-2xl border border-scoreboard/10 bg-white py-3 pl-8 pr-4 text-lg font-bold outline-none transition focus:border-mlb-red focus:ring-1 focus:ring-mlb-red"
                  />
                </div>
              </label>
            </div>

            <div className="rounded-[1.75rem] border border-scoreboard/10 bg-[#fbfaf8] p-6">
              <h3 className="mb-4 font-display text-2xl tracking-[0.04em] text-scoreboard">
                Inventory
              </h3>
              
              <div className="mb-4 flex flex-wrap gap-2">
                {SIZE_OPTIONS.map((size) => {
                  const active = form.selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={cn(
                        'rounded-full border px-4 py-2 text-sm font-bold transition-all',
                        active
                          ? 'border-mlb-navy bg-mlb-navy text-white shadow-md scale-105'
                          : 'border-scoreboard/20 bg-white text-scoreboard/70 hover:border-scoreboard/50',
                      )}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {form.selectedSizes.length > 0 ? (
                <div className="grid gap-3 border-t border-scoreboard/10 pt-4 mt-2">
                  <p className="text-xs uppercase tracking-widest text-scoreboard/40 font-bold mb-1">Set Stock Levels</p>
                  {form.selectedSizes.map((size) => (
                    <label
                      key={size}
                      className="flex items-center justify-between rounded-xl border border-scoreboard/5 bg-white px-4 py-2.5 shadow-sm"
                    >
                      <span className="font-bold text-scoreboard">{size}</span>
                      <input
                        type="number"
                        min="0"
                        value={form.sizeStock[size]}
                        onChange={(event) => updateSizeStock(size, event.target.value)}
                        className="w-20 rounded-lg border border-scoreboard/10 bg-slate-50 px-3 py-1.5 text-right font-medium outline-none transition focus:border-mlb-red"
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mt-2">
                  <p className="text-xs font-semibold text-amber-800">
                    ⚠ Select at least one size above to define stock.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[1.75rem] border border-scoreboard/10 bg-[#fbfaf8] p-6">
              <h3 className="mb-4 font-display text-2xl tracking-[0.04em] text-scoreboard">
                Visibility
              </h3>
              <label className="group flex cursor-pointer items-center gap-4 rounded-xl border border-scoreboard/10 bg-white px-4 py-4 shadow-sm hover:border-mlb-red/30 transition-colors">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        featured: event.target.checked,
                      }))
                    }
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-slate-200 transition-colors peer-checked:bg-mlb-red"></div>
                  <div className="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white transition-all peer-checked:translate-x-full"></div>
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-scoreboard">Feature Item</span>
                  <span className="text-xs font-medium text-scoreboard/50">Highlight on the Home Page</span>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center border-t border-scoreboard/10 pt-8">
          <Button 
            onClick={handleSubmit} 
            disabled={isPending} 
            className="w-full max-w-md py-6 text-xl tracking-widest font-display shadow-xl shadow-mlb-navy/20 active:scale-[0.98] transition-transform hover:scale-105"
          >
            {isPending ? 'Saving Data...' : editingId ? 'Update Product' : 'Create Product'}
          </Button>
        </div>
      </section>
      ) : (
      <section id="admin-library-top" className="section-shell p-6 lg:p-8 flex flex-col min-h-[600px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-display text-4xl uppercase tracking-[0.06em] text-scoreboard">
              Product Library
            </p>
            <p className="caps-label text-scoreboard/40 mt-1">
              Total items: {products.length}
            </p>
          </div>
          <Button onClick={() => { resetForm(); setIsFormOpen(true); }}>
            Create New Product
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-6 mb-2">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-scoreboard/40">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by product name or team..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-xl border border-scoreboard/10 py-2.5 pl-10 pr-4 text-sm font-medium outline-none transition-all placeholder:text-scoreboard/40 focus:border-mlb-red focus:bg-white focus:ring-1 focus:ring-mlb-red"
          />
        </div>

        <div className="mt-4 flex-1 grid gap-4 lg:grid-cols-2 content-start">
          {paginatedLibraryProducts.length > 0 ? paginatedLibraryProducts.map((product) => (
            <div
              key={product.id}
              className="group h-full flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-scoreboard/10 bg-white p-3 transition-all hover:border-mlb-navy/20 hover:shadow-md"
            >
              <div className="h-32 w-full sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl bg-scoreboard/5 flex items-center justify-center relative">
                {product.images?.[0]?.url ? (
                  <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-scoreboard/20" />
                )}
                {product.featured && (
                  <div className="absolute top-1.5 right-1.5 bg-yellow-400 text-white rounded-full p-0.5 shadow-sm" title="Featured Product">
                    <Star className="h-3 w-3 fill-current" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1 w-full overflow-hidden">
                  {TEAM_LOGOS[product.team] && (
                    <img
                      src={`https://www.mlbstatic.com/team-logos/${TEAM_LOGOS[product.team]}.svg`}
                      alt={product.team}
                      className="h-3 w-3 shrink-0"
                    />
                  )}
                  <span className="text-[10px] uppercase tracking-widest text-scoreboard/50 font-bold truncate">{product.team}</span>
                  <span className="h-1 w-1 rounded-full bg-scoreboard/20 shrink-0" />
                  <span className="text-[10px] uppercase tracking-widest text-scoreboard/50 font-bold shrink-0">{product.category}</span>
                </div>
                <h4 className="font-display text-lg uppercase tracking-wide text-scoreboard truncate">
                  {product.name}
                </h4>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-sm font-bold text-mlb-navy">{formatCurrency(product.priceInCents)}</span>
                </div>
              </div>

              <div className="hidden lg:flex items-center gap-1.5 px-4 w-48 flex-wrap justify-end">
                {product.availableSizes.map(size => (
                  <span key={size} className="text-[9px] font-bold text-scoreboard/60 bg-scoreboard/5 border border-scoreboard/10 px-1.5 py-0.5 rounded-sm">
                    {size}
                  </span>
                ))}
              </div>

              <div className="flex shrink-0 items-center justify-end gap-2 sm:border-l border-scoreboard/10 sm:pl-4 py-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                <button 
                  suppressHydrationWarning
                  onClick={() => handleEditClick(product)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-scoreboard/5 text-scoreboard/60 transition-colors hover:bg-slate-100 hover:text-mlb-navy"
                  title="Edit Product"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <button 
                  suppressHydrationWarning
                  onClick={() => setDeleteConfirmId(product.id)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 transition-colors hover:bg-red-100 hover:text-red-700"
                  title="Delete Product"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center text-scoreboard/50 text-sm font-semibold">
              No products found matching "{searchQuery}"
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 0 && (
          <div className="mt-8 flex items-center justify-center gap-1">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex h-10 w-10 items-center justify-center text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              if (
                totalPages <= 5 || 
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm transition-all ${
                      currentPage === page
                        ? 'border border-slate-300 font-bold text-slate-900 shadow-sm bg-white'
                        : 'font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {page}
                  </button>
                );
              }
              if (page === 2 && currentPage > 3) {
                return <span key="start-ellipsis" className="flex h-10 w-6 items-end justify-center pb-2 text-slate-400 tracking-[0.2em]">...</span>;
              }
              if (page === totalPages - 1 && currentPage < totalPages - 2) {
                return <span key="end-ellipsis" className="flex h-10 w-6 items-end justify-center pb-2 text-slate-400 tracking-[0.2em]">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex h-10 w-10 items-center justify-center text-slate-400 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </section>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-scoreboard/60 backdrop-blur-sm p-4 transition-all">
          <div className="w-full max-w-sm rounded-[1.75rem] border border-scoreboard/10 bg-white p-6 shadow-2xl">
            <h4 className="mb-2 font-display text-3xl uppercase tracking-[0.04em] text-scoreboard">
              Delete Product?
            </h4>
            <p className="mb-8 text-sm font-medium text-scoreboard/60">
              Are you completely sure you want to permanently delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 flex-wrap">
              <Button variant="ghost" onClick={() => setDeleteConfirmId(null)} className="flex-1">
                Cancel
              </Button>
              <Button variant="danger" onClick={() => {
                handleDelete(deleteConfirmId);
                setDeleteConfirmId(null);
              }} className="flex-1">
                Yes, Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {editConfirmProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-scoreboard/60 backdrop-blur-sm p-4 transition-all">
          <div className="w-full max-w-sm rounded-[1.75rem] border border-scoreboard/10 bg-white p-6 shadow-2xl">
            <h4 className="mb-2 font-display text-3xl uppercase tracking-[0.04em] text-scoreboard">
              Edit Product?
            </h4>
            <p className="mb-8 text-sm font-medium text-scoreboard/60">
              Are you sure you want to edit "{editConfirmProduct.name}"? If you have unsaved changes in the current form, they will be lost.
            </p>
            <div className="flex justify-end gap-3 flex-wrap">
              <Button variant="ghost" onClick={() => setEditConfirmProduct(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={() => {
                handleEdit(editConfirmProduct);
                setEditConfirmProduct(null);
              }} className="flex-1">
                Proceed
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
