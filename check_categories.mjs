import { PrismaClient } from './server/node_modules/@prisma/client/index.js';

const prisma = new PrismaClient({
  datasources: { db: { url: 'file:///D:/PODCAST/server/prisma/dev.db' } }
});

const podcasts = await prisma.podcast.findMany({
  take: 5,
  include: { categories: true }
});
console.log('=== Podcasts with categories ===');
podcasts.forEach(p => console.log(`${p.title}: [${p.categories.map(c=>c.name).join(', ')}]`));

const categories = await prisma.category.findMany();
console.log('\n=== All Categories ===');
categories.forEach(c => console.log(`${c.name} (${c.podcastCount} podcasts)`));

await prisma.$disconnect();
