const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const products = [
  {
    id: 'dodgers-home',
    name: 'Los Angeles Dodgers Home Elite Jersey',
    slug: 'los-angeles-dodgers-home-elite-jersey',
    team: 'Los Angeles Dodgers',
    category: 'Home',
    description:
      'Pinstriped presence with a championship silhouette built for collectors and game-day loyalists.',
    priceInCents: 18900,
    featured: true,
    accent: '#0C2C56',
    availableSizes: ['S', 'M', 'L', 'XL'],
    stockBySize: { S: 4, M: 8, L: 6, XL: 3 },
  },
  {
    id: 'yankees-away',
    name: 'New York Yankees Road Authentic Jersey',
    slug: 'new-york-yankees-road-authentic-jersey',
    team: 'New York Yankees',
    category: 'Away',
    description:
      'Road-gray minimalism with a heavyweight baseball identity and a sharp navy finish.',
    priceInCents: 18200,
    featured: true,
    accent: '#132448',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockBySize: { S: 5, M: 7, L: 5, XL: 4, XXL: 2 },
  },
  {
    id: 'braves-alternate',
    name: 'Atlanta Braves Alternate Club Jersey',
    slug: 'atlanta-braves-alternate-club-jersey',
    team: 'Atlanta Braves',
    category: 'Alternate',
    description:
      'Bold navy body with red strike points that push the energy closer to primetime than practice.',
    priceInCents: 17400,
    featured: true,
    accent: '#CE1141',
    availableSizes: ['S', 'M', 'L', 'XL'],
    stockBySize: { S: 6, M: 9, L: 7, XL: 3 },
  },
  {
    id: 'padres-city-connect',
    name: 'San Diego Padres City Connect Jersey',
    slug: 'san-diego-padres-city-connect-jersey',
    team: 'San Diego Padres',
    category: 'City Connect',
    description:
      'Electric color-blocking and confident trim designed to stand apart instantly in a jersey wall.',
    priceInCents: 19600,
    featured: true,
    accent: '#2F241D',
    availableSizes: ['S', 'M', 'L', 'XL'],
    stockBySize: { S: 2, M: 4, L: 6, XL: 2 },
  },
  {
    id: 'red-sox-home',
    name: 'Boston Red Sox Home Replica Jersey',
    slug: 'boston-red-sox-home-replica-jersey',
    team: 'Boston Red Sox',
    category: 'Home',
    description:
      'Classic white-and-red look with a clean crest placement and reliable everyday wearability.',
    priceInCents: 14900,
    featured: false,
    accent: '#BD3039',
    availableSizes: ['S', 'M', 'L', 'XL'],
    stockBySize: { S: 9, M: 12, L: 10, XL: 8 },
  },
  {
    id: 'cubs-throwback',
    name: 'Chicago Cubs Throwback Heritage Jersey',
    slug: 'chicago-cubs-throwback-heritage-jersey',
    team: 'Chicago Cubs',
    category: 'Throwback',
    description:
      'Vintage-inspired striping and rich blue tones with a relaxed, collector-first attitude.',
    priceInCents: 16800,
    featured: false,
    accent: '#0E3386',
    availableSizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stockBySize: { S: 3, M: 5, L: 7, XL: 4, XXL: 2 },
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        slug: product.slug,
        team: product.team,
        category: product.category,
        description: product.description,
        priceInCents: product.priceInCents,
        featured: product.featured,
        accent: product.accent,
        availableSizes: product.availableSizes,
        stockBySize: product.stockBySize,
        status: 'ACTIVE',
      },
      create: {
        ...product,
        status: 'ACTIVE',
      },
    });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
