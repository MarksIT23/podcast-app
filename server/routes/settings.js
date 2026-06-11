import { Router } from 'express';

export default function settingsRoutes(prisma) {
  const router = Router();

  // GET — load all settings as a flat JSON object
  router.get('/settings', async (req, res) => {
    try {
      const rows = await prisma.setting.findMany();
      const settings = {};
      for (const row of rows) {
        settings[row.key] = JSON.parse(row.value);
      }
      res.json({ data: settings });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT — upsert settings by section
  router.put('/settings', async (req, res) => {
    try {
      const entries = req.body; // { 'general': {...}, 'integrations': {...}, ... }
      if (!entries || typeof entries !== 'object') {
        return res.status(400).json({ error: 'Expected object of setting sections' });
      }

      for (const [key, value] of Object.entries(entries)) {
        await prisma.setting.upsert({
          where: { key },
          update: { value: JSON.stringify(value) },
          create: { key, value: JSON.stringify(value) },
        });
      }

      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}
