import { Router } from 'express';

export default function activityRoutes(prisma) {
  const router = Router();

  // Recent activity feed
  router.get('/activity', async (req, res) => {
    try {
      const { page = 1, pageSize = 10 } = req.query;

      const [data, total] = await Promise.all([
        prisma.activity.findMany({
          orderBy: { timestamp: 'desc' },
          skip: (Number(page) - 1) * Number(pageSize),
          take: Number(pageSize),
        }),
        prisma.activity.count(),
      ]);

      const mapped = data.map(a => ({
        id: a.id,
        type: a.type,
        user: a.user,
        detail: a.detail,
        timestamp: a.timestamp.toISOString(),
      }));

      res.json({ data: mapped, total, page: Number(page), pageSize: Number(pageSize) });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
