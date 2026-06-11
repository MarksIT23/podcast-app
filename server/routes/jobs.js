import { Router } from 'express';
import RssParser from 'rss-parser';
import { ingestFeed } from '../jobs/ingestion.js';

const rssParser = new RssParser();

export default function jobRoutes(prisma) {
  const router = Router();

  router.get('/jobs', async (req, res) => {
    try {
      const { page = 1, pageSize = 20, status } = req.query;
      const where = status ? { status } : {};
      const [data, total] = await Promise.all([
        prisma.job.findMany({
          where,
          skip: (Number(page) - 1) * Number(pageSize),
          take: Number(pageSize),
          orderBy: { runAt: 'desc' },
          include: { feed: { select: { url: true } } },
        }),
        prisma.job.count({ where }),
      ]);
      res.json({ data, total, page: Number(page), pageSize: Number(pageSize) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  router.post('/jobs/:id/retry', async (req, res) => {
    try {
      const job = await prisma.job.findUnique({
        where: { id: req.params.id },
        include: { feed: true },
      });
      if (!job) return res.status(404).json({ error: 'Job not found' });

      const feed = await rssParser.parseURL(job.feed.url);
      let ingestedCount = 0;

      for (const item of feed.items || []) {
        const audioUrl = item.enclosure?.url || item.link;
        if (!audioUrl) continue;

        await prisma.episode.upsert({
          where: { id: `${job.feedId}-${item.guid || item.link}` },
          update: { title: item.title || '' },
          create: {
            id: `${job.feedId}-${item.guid || item.link}`,
            feedId: job.feedId,
            title: item.title || 'Untitled',
            description: item.contentSnippet || null,
            audioUrl,
            duration: item.itunes?.duration ? parseInt(item.itunes.duration) : null,
            publishedAt: item.pubDate ? new Date(item.pubDate) : null,
            rawData: JSON.stringify(item),
          },
        });
        ingestedCount++;
      }

      const newJob = await prisma.job.create({
        data: {
          feedId: job.feedId,
          status: 'success',
          message: `Retry successful: ${ingestedCount} episodes ingested`,
        },
      });

      await prisma.feed.update({
        where: { id: job.feedId },
        data: { status: 'active', lastFetched: new Date() },
      });

      res.json({ data: newJob });
    } catch (err) {
      const newJob = await prisma.job.create({
        data: {
          feedId: req.params.id,
          status: 'error',
          message: `Retry failed: ${err.message}`,
        },
      });

      res.status(500).json({ error: err.message, data: newJob });
    }
  });

  // Manual trigger: ingest a single feed by ID (async — ingestion logs to Job table)
  router.post('/feeds/:id/ingest', async (req, res) => {
    try {
      const feed = await prisma.feed.findUnique({ where: { id: req.params.id } });
      if (!feed) return res.status(404).json({ error: 'Feed not found' });

      // Fire-and-forget: ingestion is tracked via Job entries
      ingestFeed(prisma, feed).catch(err => console.error(`[Ingest] Background error: ${err.message}`));

      res.json({ success: true, message: `Ingestion started for feed "${feed.url}".` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Manual trigger: ingest all active/pending/failed feeds (async)
  router.post('/feeds/ingest-all', async (req, res) => {
    try {
      const feeds = await prisma.feed.findMany({
        where: { status: { in: ['active', 'failed', 'pending'] } },
      });

      // Fire each feed ingestion in the background (don't await)
      for (const feed of feeds) {
        ingestFeed(prisma, feed).catch(err => console.error(`[Ingest] Feed ${feed.id} error: ${err.message}`));
      }

      res.json({ success: true, message: `Ingestion triggered for ${feeds.length} feed(s). Check job logs for results.` });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
