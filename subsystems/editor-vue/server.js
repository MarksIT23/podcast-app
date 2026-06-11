/**
 * Editor Subsystem Backend API Server
 * Framework: Express.js
 * Database: MongoDB (file-based mock or real MongoDB)
 * Port: 3005
 *
 * This server reads from the Editor's MongoDB database.
 * Data is synchronized from the Admin SQLite database via the replication middleware.
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.EDITOR_PORT || 3005;

const app = express();
app.use(cors());
app.use(express.json());

// ─── MongoDB File-Based Collection Helper ───────────────────────────────────
// Reads from the same JSON files created by the replication middleware in server/prisma/
const MONGO_DATA_DIR = path.resolve(__dirname, '../../server/prisma');

function readCollection(name) {
  const filePath = path.join(MONGO_DATA_DIR, `mongodb_${name}.json`);
  if (!fs.existsSync(filePath)) return [];
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return [];
  }
}

function writeCollection(name, data) {
  const filePath = path.join(MONGO_DATA_DIR, `mongodb_${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    subsystem: 'Editor',
    framework: 'Express.js (Vue frontend)',
    database: 'MongoDB (file-based)',
    port: PORT,
    time: new Date().toISOString(),
  });
});

// ─── Auth ───────────────────────────────────────────────────────────────────
app.post('/api/editor/login', (req, res) => {
  const { password } = req.body;
  const EDITOR_PASSWORD = process.env.EDITOR_PASSWORD || 'editor123';
  if (password === EDITOR_PASSWORD) {
    res.json({ success: true, token: 'mock-editor-token-xyz' });
  } else {
    res.status(401).json({ error: 'Invalid editor credentials' });
  }
});

// ─── Editor Dashboard Stats ─────────────────────────────────────────────────
app.get('/api/editor/dashboard', (req, res) => {
  try {
    const podcasts = readCollection('podcast');
    const highlights = readCollection('highlight');
    const episodes = readCollection('episode');

    const pending = highlights.filter(h => h.status === 'pending').length;
    const approved = highlights.filter(h => h.status === 'approved').length;
    const rejected = highlights.filter(h => h.status === 'rejected').length;
    const drafts = podcasts.filter(p => p.status === 'draft').length;
    const published = podcasts.filter(p => p.status === 'published').length;

    res.json({
      database: 'MongoDB (Editor)',
      stats: {
        totalPodcasts: podcasts.length,
        totalEpisodes: episodes.length,
        totalHighlights: highlights.length,
        pendingReviews: pending,
        approvedHighlights: approved,
        rejectedHighlights: rejected,
        drafts,
        published,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Podcast Review Queue ───────────────────────────────────────────────────
app.get('/api/editor/podcasts', (req, res) => {
  try {
    const podcasts = readCollection('podcast');
    const { status } = req.query;
    const filtered = status ? podcasts.filter(p => p.status === status) : podcasts;

    res.json({
      database: 'MongoDB (Editor)',
      data: filtered,
      total: filtered.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Podcast Editor (update tags, summary, featured flag) ───────────────────
app.put('/api/editor/podcasts/:id', (req, res) => {
  try {
    const podcasts = readCollection('podcast');
    const index = podcasts.findIndex(p => p.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Podcast not found in Editor DB' });

    const { tags, summary, featured, status: newStatus } = req.body;
    if (tags !== undefined) podcasts[index].tags = JSON.stringify(tags);
    if (summary !== undefined) podcasts[index].summary = summary;
    if (featured !== undefined) podcasts[index].featured = featured;
    if (newStatus !== undefined) podcasts[index].status = newStatus;
    podcasts[index].updatedAt = new Date().toISOString();

    writeCollection('podcast', podcasts);
    res.json({ data: podcasts[index], database: 'MongoDB (Editor)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── AI Highlights Review Queue ─────────────────────────────────────────────
app.get('/api/editor/highlights', (req, res) => {
  try {
    const highlights = readCollection('highlight');
    const { status } = req.query;
    const filtered = status ? highlights.filter(h => h.status === status) : highlights;

    res.json({
      database: 'MongoDB (Editor)',
      data: filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      total: filtered.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Approve/Reject Highlight ───────────────────────────────────────────────
app.post('/api/editor/highlights/:id/approve', (req, res) => {
  try {
    const highlights = readCollection('highlight');
    const index = highlights.findIndex(h => h.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Highlight not found' });

    highlights[index].status = 'approved';
    highlights[index].updatedAt = new Date().toISOString();
    writeCollection('highlight', highlights);

    res.json({ data: highlights[index], database: 'MongoDB (Editor)', action: 'approved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/editor/highlights/:id/reject', (req, res) => {
  try {
    const highlights = readCollection('highlight');
    const index = highlights.findIndex(h => h.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Highlight not found' });

    highlights[index].status = 'rejected';
    highlights[index].updatedAt = new Date().toISOString();
    writeCollection('highlight', highlights);

    res.json({ data: highlights[index], database: 'MongoDB (Editor)', action: 'rejected' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Highlight Trimming (adjust start/end times) ────────────────────────────
app.put('/api/editor/highlights/:id/trim', (req, res) => {
  try {
    const highlights = readCollection('highlight');
    const index = highlights.findIndex(h => h.id === req.params.id);
    if (index === -1) return res.status(404).json({ error: 'Highlight not found' });

    const { startTime, endTime, tags, description } = req.body;
    if (startTime !== undefined) highlights[index].startTime = startTime;
    if (endTime !== undefined) highlights[index].endTime = endTime;
    if (tags !== undefined) highlights[index].tags = JSON.stringify(tags);
    if (description !== undefined) highlights[index].description = description;
    highlights[index].updatedAt = new Date().toISOString();

    writeCollection('highlight', highlights);
    res.json({ data: highlights[index], database: 'MongoDB (Editor)', action: 'trimmed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Curated Collections ────────────────────────────────────────────────────
app.get('/api/editor/collections', (req, res) => {
  try {
    const collections = readCollection('highlightcollection');
    res.json({ database: 'MongoDB (Editor)', data: collections, total: collections.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/editor/collections', (req, res) => {
  try {
    const collections = readCollection('highlightcollection');
    const { name, description, slug } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const newCollection = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      description: description || '',
      slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
      coverImage: '',
      color: '#3B82F6',
      createdAt: new Date().toISOString(),
    };

    collections.push(newCollection);
    writeCollection('highlightcollection', collections);
    res.json({ data: newCollection, database: 'MongoDB (Editor)' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Episodes (publish/hide toggle) ─────────────────────────────────────────
app.get('/api/editor/episodes', (req, res) => {
  try {
    const episodes = readCollection('episode');
    res.json({ database: 'MongoDB (Editor)', data: episodes, total: episodes.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Editor Server] Running on port ${PORT}`);
  console.log(`[Editor Server] Database: MongoDB (file-based at ${MONGO_DATA_DIR})`);
  console.log(`[Editor Server] Framework: Express.js backend + Vue 3 frontend`);
});
