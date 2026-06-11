import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding categories to podcasts...\n');

  const categories = await prisma.category.findMany();
  console.log(`Found ${categories.length} categories:`);
  categories.forEach(c => console.log(`  - ${c.name} (${c.id})`));

  const podcasts = await prisma.podcast.findMany({ where: { status: 'published' } });
  console.log(`\nFound ${podcasts.length} published podcasts\n`);

  const categoryMap = {
    'Technology': categories.find(c => c.name === 'Technology'),
    'Science': categories.find(c => c.name === 'Science'),
    'Business': categories.find(c => c.name === 'Business'),
    'Entertainment': categories.find(c => c.name === 'Entertainment'),
    'Education': categories.find(c => c.name === 'Education'),
    'Health': categories.find(c => c.name === 'Health'),
  };

  const categoryNames = Object.keys(categoryMap);
  let assigned = 0;

  for (const podcast of podcasts) {
    const randomCategory = categoryMap[categoryNames[Math.floor(Math.random() * categoryNames.length)]];
    if (!randomCategory) continue;

    await prisma.podcast.update({
      where: { id: podcast.id },
      data: {
        categories: {
          connect: { id: randomCategory.id },
        },
      },
    });

    console.log(`✓ ${podcast.title} → ${randomCategory.name}`);
    assigned++;
  }

  console.log(`\n✅ Assigned categories to ${assigned} podcasts!`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Error:', e.message);
  process.exit(1);
});
