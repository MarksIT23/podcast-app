/**
 * Admin Subsystem API — Ingestion Job Logs
 * Shows success/error/running jobs from the SQLite database.
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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = {};
    if (status) where.status = status;

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { runAt: 'desc' },
      take: 50,
      include: {
        feed: { select: { url: true, category: true } },
      },
    });

    const counts = {
      success: await prisma.job.count({ where: { status: 'success' } }),
      error: await prisma.job.count({ where: { status: 'error' } }),
      running: await prisma.job.count({ where: { status: 'running' } }),
    };

    return NextResponse.json({
      database: 'SQLite (Admin)',
      data: jobs,
      counts,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
