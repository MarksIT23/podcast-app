import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // ============================================
  // Clean existing data (order matters for FK)
  // ============================================
  await prisma.category.deleteMany();
  await prisma.adminUser.deleteMany();

  // ============================================
  // Admin User
  // ============================================
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@podcastapp.com',
      password: adminPassword,
      name: 'Admin',
      role: 'admin',
    },
  });
  console.log(`  Admin: admin@podcastapp.com / admin123`);

  // ============================================
  // Moderator User
  // ============================================
  const modPassword = await bcrypt.hash('mod123', 10);
  const moderator = await prisma.adminUser.create({
    data: {
      email: 'mod@podcastapp.com',
      password: modPassword,
      name: 'Dr. James Wilson',
      role: 'moderator',
    },
  });
  console.log(`  Moderator: mod@podcastapp.com / mod123`);

  // ============================================
  // Categories
  // ============================================
  const categories = await Promise.all([
    prisma.category.create({ data: { name: 'Technology', slug: 'technology', description: 'Software, AI, gadgets, and digital innovation', color: '#8B3DFF' } }),
    prisma.category.create({ data: { name: 'Science', slug: 'science', description: 'Research, discoveries, and scientific breakthroughs', color: '#00A8FF' } }),
    prisma.category.create({ data: { name: 'Business', slug: 'business', description: 'Entrepreneurship, finance, and market insights', color: '#FF7A00' } }),
    prisma.category.create({ data: { name: 'Entertainment', slug: 'entertainment', description: 'Pop culture, comedy, and creative conversations', color: '#F59E0B' } }),
    prisma.category.create({ data: { name: 'Education', slug: 'education', description: 'Learning, skill-building, and academic topics', color: '#22C55E' } }),
    prisma.category.create({ data: { name: 'Health', slug: 'health', description: 'Wellness, fitness, and mental health', color: '#EF4444' } }),
  ]);
  console.log(`  ${categories.length} categories created`);

  console.log('\n✅ Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
