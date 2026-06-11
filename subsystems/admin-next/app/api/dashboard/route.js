/**
 * Admin Subsystem API — reads directly from the Admin SQLite database via Prisma.
 * This demonstrates that the Admin system has its OWN database (SQLite).
 */

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import path from 'path';

// Point Prisma at the Admin SQLite database
// In production this would be its own isolated database file
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.resolve(process.cwd(), '../../server/prisma/dev.db')}`,
    },
  },
});

export async function GET() {
  try {
    const [totalPodcasts, totalEpisodes, totalFeeds, failedJobs] = await Promise.all([
      prisma.podcast.count(),
      prisma.episode.count(),
      prisma.feed.count(),
      prisma.job.count({ where: { status: 'error' } }),
    ]);

    return NextResponse.json({
      database: 'SQLite (Admin)',
      framework: 'Next.js',
      port: 3003,
      stats: {
        totalPodcasts,
        totalEpisodes,
        totalFeeds,
        failedJobs,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
