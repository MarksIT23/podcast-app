/**
 * Admin Subsystem API — RSS Feeds management
 * Reads/writes feeds from the SQLite database.
 */

import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
import path from 'path';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${path.resolve(process.cwd(), '../../server/prisma/dev.db')}`,
    },
  },
});

export async function GET() {
  try {
    const feeds = await prisma.feed.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        podcast: { select: { id: true, title: true } },
        _count: { select: { jobs: true, episodes: true } },
      },
    });

    return NextResponse.json({
      database: 'SQLite (Admin)',
      data: feeds,
      total: feeds.length,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { url, category } = body;

    if (!url) {
      return NextResponse.json({ error: 'RSS URL is required' }, { status: 400 });
    }

    const feed = await prisma.feed.create({
      data: { url, category: category || 'General', status: 'active' },
    });

    return NextResponse.json({ data: feed, database: 'SQLite (Admin)' });
  } catch (err) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Feed URL already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
