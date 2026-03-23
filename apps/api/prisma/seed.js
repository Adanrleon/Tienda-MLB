const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

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
];

function slugify(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

const products = TEAM_OPTIONS.map((t, index) => {
  const isHome = index % 2 === 0;
  const rawName = `${t.value} ${isHome ? 'Home' : 'Away'} Authentic Jersey`;
  
  return {
    id: slugify(t.value + '-' + (isHome?'home':'away')),
    name: rawName,
    slug: slugify(rawName),
    team: t.value,
    category: isHome ? 'Home' : 'Away',
    description: 'Pinstriped presence with a championship silhouette built for collectors and game-day loyalists.',
    priceInCents: 14900,
    featured: index % 6 === 0,
    accent: t.accent,
    availableSizes: ['S', 'M', 'L', 'XL'],
    stockBySize: { S: 4, M: 8, L: 6, XL: 3 },
  };
});

async function main() {
  console.log('Seeding admin user...');
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'mariacarbonell@gmail.com' },
    update: {},
    create: {
      email: 'mariacarbonell@gmail.com',
      passwordHash,
      name: 'Maria Carbonell',
      role: 'ADMIN',
    },
  });

  console.log('Cleaning up old products and relations...');
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();

  console.log(`Seeding ${products.length} products...`);
  for (const productData of products) {
    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: productData,
      create: productData,
    });
  }

  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
