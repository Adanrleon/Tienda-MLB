export type ProductImage = {
  id?: string;
  url: string;
  alt?: string | null;
  sortOrder?: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  team: string;
  category: string;
  description: string;
  priceInCents: number;
  featured: boolean;
  accent: string;
  availableSizes: string[];
  stockBySize: Record<string, number>;
  images: ProductImage[];
};

export type CartLine = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  team: string;
  accent: string;
  size: string;
  quantity: number;
  priceInCents: number;
  imageUrl?: string;
};
