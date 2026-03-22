import { Product } from '@/types/product';

export const mockProducts: Product[] = [
  {
    id: 'dodgers-home',
    name: 'Los Angeles Dodgers Nike Home Elite Jersey',
    slug: 'los-angeles-dodgers-nike-home-elite-jersey',
    team: 'Los Angeles Dodgers',
    category: 'Home',
    description:
      'The pinnacle of performance. Engineered with Nike Vapor Premier fabric for maximum breathability and movement. Features authentic zigzag stitching and moisture-wicking technology.',
    priceInCents: 19900,
    featured: true,
    accent: '#005A9C',
    availableSizes: ['S', 'M', 'L', 'XL'],
    stockBySize: { S: 4, M: 8, L: 6, XL: 3 },
    images: [
      { id: '1', url: 'https://images.unsplash.com/photo-1593766788306-28561086694e?q=80&w=800&auto=format&fit=crop', alt: 'Dodgers Home Jersey' }
    ],
  },
  {
    id: 'yankees-road',
    name: 'New York Yankees Nike Road Authentic Jersey',
    slug: 'new-york-yankees-nike-road-authentic-jersey',
    team: 'New York Yankees',
    category: 'Road',
    description:
      'Classic road-gray aesthetic. Heavyweight knit construction provides a professional feel. Laser-cut perforations and moisture-wicking yarn keep you cool under pressure.',
    priceInCents: 18500,
    featured: true,
    accent: '#003087',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockBySize: { S: 5, M: 7, L: 5, XL: 4, XXL: 2 },
    images: [
      { id: '2', url: 'https://images.unsplash.com/photo-1562077981-4d7eafd44932?q=80&w=800&auto=format&fit=crop', alt: 'Yankees Road Jersey' }
    ],
  },
  {
    id: 'braves-alternate',
    name: 'Atlanta Braves Nike Alternate Club Jersey',
    slug: 'atlanta-braves-nike-alternate-club-jersey',
    team: 'Atlanta Braves',
    category: 'Alternate',
    description:
      'Bold navy alternate. Features the iconic tomahawk across the chest. Built for the modern athlete with premium heat-sealed graphics and a tailored fit.',
    priceInCents: 17500,
    featured: true,
    accent: '#CE1141',
    availableSizes: ['S', 'M', 'L', 'XL'],
    stockBySize: { S: 6, M: 9, L: 7, XL: 3 },
    images: [
      { id: '3', url: 'https://images.unsplash.com/photo-1508341421810-36b8fc06075b?q=80&w=800&auto=format&fit=crop', alt: 'Braves Alternate Jersey' }
    ],
  },
  {
    id: 'padres-city-connect',
    name: 'San Diego Padres Nike City Connect Jersey',
    slug: 'san-diego-padres-nike-city-connect-jersey',
    team: 'San Diego Padres',
    category: 'City Connect',
    description:
      'Vibrant culture, legendary style. The City Connect series celebrates the unique bond between the team and its city. Featuring electric pink and mint green accents.',
    priceInCents: 21000,
    featured: true,
    accent: '#2F241D',
    availableSizes: ['S', 'M', 'L', 'XL'],
    stockBySize: { S: 2, M: 4, L: 6, XL: 2 },
    images: [
      { id: '4', url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=800&auto=format&fit=crop', alt: 'Padres City Connect Jersey' }
    ],
  },
  {
    id: 'red-sox-home',
    name: 'Boston Red Sox Nike Home Replica Jersey',
    slug: 'boston-red-sox-nike-home-replica-jersey',
    team: 'Boston Red Sox',
    category: 'Home',
    description:
      'Authentic Fenway feel. The clean white base and bold red typography offer a timeless look for any member of Sox Nation.',
    priceInCents: 13500,
    featured: false,
    accent: '#BD3039',
    availableSizes: ['S', 'M', 'L', 'XL'],
    stockBySize: { S: 9, M: 12, L: 10, XL: 8 },
    images: [
      { id: '5', url: 'https://images.unsplash.com/photo-1516731415730-0c641909a83c?q=80&w=800&auto=format&fit=crop', alt: 'Red Sox Home Jersey' }
    ],
  },
  {
    id: 'cubs-throwback',
    name: 'Chicago Cubs Nike Throwback Heritage Jersey',
    slug: 'chicago-cubs-nike-throwback-heritage-jersey',
    team: 'Chicago Cubs',
    category: 'Throwback',
    description:
      'Classic Wrigleyville style. This heritage jersey brings back the beloved logos and colors from the legendary pinstripe era.',
    priceInCents: 16500,
    featured: false,
    accent: '#0E3386',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockBySize: { S: 3, M: 5, L: 7, XL: 4, XXL: 2 },
    images: [
      { id: '6', url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=800&auto=format&fit=crop', alt: 'Cubs Throwback Jersey' }
    ],
  },
];
