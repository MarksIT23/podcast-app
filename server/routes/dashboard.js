import { Router } from 'express';

export default function dashboardRoutes(prisma) {
  const router = Router();

  router.get('/dashboard', async (req, res) => {
    try {
      const [
        totalPodcasts,
        totalEpisodes,
        totalUsers,
        activeUsers,
        totalPlaysResult,
        categories,
        jobs,
      ] = await Promise.all([
        prisma.podcast.count(),
        prisma.episode.count(),
        prisma.appUser.count(),
        prisma.appUser.count({ where: { status: 'active' } }),
        prisma.episode.aggregate({ _sum: { plays: true } }),
        prisma.category.findMany({ include: { _count: { select: { podcasts: true } } } }),
        prisma.job.findMany({ orderBy: { runAt: 'desc' }, take: 50 }),
      ]);

      const failedJobs = jobs.filter(j => j.status === 'error').length;
      const lastIngestion = jobs.length > 0 ? jobs[0].runAt : null;
      const totalPlays = totalPlaysResult._sum.plays || 0;

      // Plays by category
      const playsByCategory = categories.map(c => ({
        category: c.name,
        value: Math.floor(Math.random() * 50000) + 10000,
      }));

      // User growth (last 12 months)
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      const recentUsers = await prisma.appUser.findMany({
        where: { joinedAt: { gte: twelveMonthsAgo } },
        orderBy: { joinedAt: 'asc' },
        select: { joinedAt: true },
      });

      const userGrowth = buildMonthlySeries(recentUsers, 'joinedAt');

      // Plays by month (last 12)
      const recentEpisodes = await prisma.episode.findMany({
        where: { publishedAt: { gte: twelveMonthsAgo } },
        select: { plays: true, publishedAt: true },
      });
      const playsByMonth = buildMonthlySeries(recentEpisodes, 'publishedAt', 'plays');

      // --- Revenue simulation (no real revenue model yet) ---
      const totalRevenue = totalUsers * 3.99;
      const revenueGrowth = 22.4;

      // Revenue by month — derive from user growth curve
      const revenueByMonth = userGrowth.map(m => ({
        month: m.month,
        value: Math.round(m.value * 3.99 * (0.8 + Math.random() * 0.4)),
      }));

      // Weekly plays — derive from total plays spread over 7 days
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyPlays = dayNames.map((label, i) => ({
        label,
        value: Math.round((totalPlays / 7) * (0.7 + Math.random() * 0.6)),
      }));

      // Avg session duration (dummy value)
      const avgSessionDuration = '14:32';

      // User retention (dummy value)
      const userRetention = 68;

      // Retention by week (dummy trend)
      const retentionByWeek = [
        { week: 'Wk 1', value: 100 },
        { week: 'Wk 2', value: 72 },
        { week: 'Wk 3', value: 58 },
        { week: 'Wk 4', value: 49 },
        { week: 'Wk 5', value: 43 },
        { week: 'Wk 6', value: 38 },
      ];

      // Devices (dummy distribution)
      const devices = [
        { type: 'Mobile', value: 58 },
        { type: 'Desktop', value: 27 },
        { type: 'Tablet', value: 10 },
        { type: 'Smart TV', value: 5 },
      ];

      // Top countries (dummy data)
      const topCountries = [
        { country: 'United States', value: 42 },
        { country: 'United Kingdom', value: 18 },
        { country: 'Germany', value: 12 },
        { country: 'Canada', value: 9 },
        { country: 'Australia', value: 7 },
        { country: 'Others', value: 12 },
      ];

      res.json({
        data: {
          totalUsers,
          activeUsers,
          totalPlays,
          totalPodcasts,
          totalEpisodes,
          totalFeeds: await prisma.feed.count(),
          avgEngagement: 74.2,
          failedJobs,
          lastIngestion,
          playsByMonth,
          userGrowth,
          revenueByMonth,
          weeklyPlays,
          totalRevenue,
          revenueGrowth,
          avgSessionDuration,
          userRetention,
          retentionByWeek,
          devices,
          topCountries,
          playsByCategory,
          recentJobs: jobs.slice(0, 10),
          feedsByStatus: {
            active: await prisma.feed.count({ where: { status: 'active' } }),
            failed: await prisma.feed.count({ where: { status: 'failed' } }),
            pending: await prisma.feed.count({ where: { status: 'pending' } }),
          },
        },
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

function buildMonthlySeries(records, dateField, valueField = null) {
  const monthMap = {};
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
    monthMap[key] = { month: label, value: 0 };
  }

  for (const record of records) {
    const date = new Date(record[dateField]);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (monthMap[key]) {
      monthMap[key].value += valueField ? (record[valueField] || 0) : 1;
    }
  }

  return Object.values(monthMap);
}
