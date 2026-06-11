import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cron from 'node-cron';

import feedRoutes from './routes/feeds.js';
import jobRoutes from './routes/jobs.js';
import dashboardRoutes from './routes/dashboard.js';
import podcastRoutes from './routes/podcasts.js';
import categoryRoutes from './routes/categories.js';
import episodeRoutes from './routes/episodes.js';
import userRoutes from './routes/users.js';
import activityRoutes from './routes/activity.js';
import userDataRoutes from './routes/user-data.js';
import settingsRoutes from './routes/settings.js';
import highlightRoutes from './routes/highlights.js';
import { startIngestionJob } from './jobs/ingestion.js';
import { startHighlightDetectionJob } from './jobs/highlight-detection.js';
import publicRoutes from './routes/public.js';

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.ADMIN_PORT || 3002;
const JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key-change-in-production';

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Auth middleware
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Role-based authorization middleware
function authorize(roles = []) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
}

// Health check (unprotected)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Login (unprotected)
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.adminUser.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public routes (no auth required)
app.use('/api', publicRoutes(prisma));

// Public registration
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await prisma.appUser.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.appUser.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user',
        status: 'active',
        joinedAt: new Date(),
        lastActive: new Date(),
      },
    });

    // Generate JWT for auto-login after registration
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err.code === 'P2002') return res.status(409).json({ error: 'Email already registered' });
    res.status(500).json({ error: err.message });
  }
});

// Public user login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.appUser.findUnique({ where: { email } });
    if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All routes below are protected
app.use('/api/admin', authenticate);

// Apply role restrictions to specific paths BEFORE mounting routers
app.use('/api/admin/feeds', authorize(['admin']));
app.use('/api/admin/jobs', authorize(['admin']));
app.use('/api/admin/users', authorize(['admin']));
app.use('/api/admin/settings', authorize(['admin']));

// Shared (Admin + Moderator) routes
app.use('/api/admin', dashboardRoutes(prisma));
app.use('/api/admin', feedRoutes(prisma));
app.use('/api/admin', jobRoutes(prisma));
app.use('/api/admin', podcastRoutes(prisma));
app.use('/api/admin', categoryRoutes(prisma));
app.use('/api/admin', episodeRoutes(prisma));
app.use('/api/admin', userRoutes(prisma));
app.use('/api/admin', activityRoutes(prisma));
app.use('/api/admin', userDataRoutes(prisma));
app.use('/api/admin', settingsRoutes(prisma));
app.use('/api/admin', highlightRoutes(prisma));

// Start RSS ingestion cron (every 15 minutes)
startIngestionJob(prisma);
startHighlightDetectionJob(prisma);

app.listen(PORT, () => {
  console.log(`[Admin Server] Running on port ${PORT}`);
});
