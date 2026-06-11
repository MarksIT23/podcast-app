# Implementation Plan — Podcast Directory & Player Platform

**Date:** 2026-06-10
**Based on:** `thoughts/shared/designs/2026-06-10-podcast-platform-design.md`

---

## Overview

Convert the existing PodcastAI SPA into a 3-subsystem platform with real-time cross-system communication. The existing React 19 code stays as the Public subsystem. Admin and Editor are new apps alongside it.

**Subsystems:**
| Subsystem | Framework | Database | Backend |
|---|---|---|---|
| Public | React 19 (existing) | Supabase PostgreSQL | Supabase Client SDK |
| Admin | Vue 3 | SQLite (Prisma) | Express |
| Editor | Svelte | MongoDB (Mongoose) | Express |
| Gateway | Node.js | None | Express |

---

## Milestones & Order of Execution

| # | Milestone | Dependencies | Est. Effort |
|---|---|---|---|
| M1 | Supabase setup + Public subsystem migration | None | medium |
| M2 | Gateway webhook relay | None | small |
| M3 | Admin subsystem (Vue 3 + Express + SQLite + RSS) | M2 | large |
| M4 | Editor subsystem (Svelte + Express + MongoDB) | M2 | large |
| M5 | Cross-system integration + end-to-end testing | M1–M4 | medium |

**Parallel execution:** M1 and M2 can start simultaneously. M3 and M4 can run in parallel once M2 is ready.

---

## M1 — Public Subsystem: Supabase Migration

**Goal:** Replace `mock.js` with live Supabase queries. Keep every section, component, and animation intact.

### 1.1 Supabase Setup

| File | Action |
|---|---|
| `public/supabase/migrations/001_initial.sql` | **Create** — All tables for existing mock data |
| `public/.env` | **Create** — `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| `public/vite.config.js` | **Edit** — No changes needed (Vite picks up `VITE_` env vars automatically) |

**Migration SQL structure:**

```sql
-- Users table (mirrors mock data)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  avatar TEXT,
  bio TEXT,
  joined_at TIMESTAMPTZ DEFAULT now(),
  last_active TIMESTAMPTZ DEFAULT now(),
  social JSONB DEFAULT '{}',
  preferences JSONB DEFAULT '{}'
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color TEXT,
  podcast_count INT DEFAULT 0
);

-- Podcasts
CREATE TABLE podcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  host TEXT,
  category_id UUID REFERENCES categories(id),
  description TEXT,
  episodes INT DEFAULT 0,
  plays INT DEFAULT 0,
  status TEXT DEFAULT 'published',
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  rating DECIMAL(2,1),
  language TEXT DEFAULT 'English',
  featured BOOLEAN DEFAULT false,
  summary TEXT,
  tags TEXT[] DEFAULT '{}',
  collection_id UUID
);

-- Episodes
CREATE TABLE episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  podcast_id UUID REFERENCES podcasts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  host TEXT,
  date TIMESTAMPTZ,
  duration TEXT,
  plays INT DEFAULT 0,
  category TEXT,
  excerpt TEXT,
  tags TEXT[] DEFAULT '{}',
  audio_url TEXT,
  published BOOLEAN DEFAULT true,
  ai_highlights TEXT[] DEFAULT '{}'
);

-- Collections
CREATE TABLE collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable real-time on podcasts and episodes
ALTER PUBLICATION supabase_realtime ADD TABLE podcasts;
ALTER PUBLICATION supabase_realtime ADD TABLE episodes;
```

### 1.2 Seed Data

Create `public/supabase/seed.sql` with INSERT statements for all 20 podcasts, 23 episodes, 6 categories, 13 users from `mock.js`. This preserves all existing content as live data.

### 1.3 New Service Files

| File | Action | Contents |
|---|---|---|
| `src/services/supabase.js` | **Create** | Supabase client init using `@supabase/supabase-js` with `createClient()` |
| `src/services/supabase-client.js` | **Create** | Typed helper functions: `getPodcasts`, `getEpisodes`, `getCategories`, `getUser`, `searchPodcasts`, `subscribeToRealtime(table, callback)` |
| `src/services/data.js` | **Create** | Unified data access layer that wraps supabase calls. Components import from here, not from supabase directly |

### 1.4 Files to Modify (mock.js replacement)

| File | Change |
|---|---|
| `src/services/mock.js` | **Remove entire file** — no longer used |
| `src/pages/HomePage.jsx` | Replace `import { MOCK_PODCASTS } from '../services/mock'` → `import { getPodcasts } from '../services/data'` |
| `src/sections/FeaturedPodcasts.jsx` | Same pattern — replace mock imports with data service calls |
| `src/sections/LatestEpisodes.jsx` | Same pattern |
| `src/sections/AIHighlights.jsx` | Same pattern |
| `src/sections/AnalyticsDashboard.jsx` | Same pattern |
| `src/sections/StatisticsStrip.jsx` | Same pattern |
| `src/components/PodcastCard.jsx` | Replace mock data references |
| `src/components/SearchBar.jsx` | Wire search to `searchPodcasts()` |
| `src/components/AudioPlayer/AudioPlayer.jsx` | Ensure episode data comes from data service |
| `src/components/FloatingStats.jsx` | Replace mock references |
| `src/pages/user/UserDashboard.jsx` | Replace mock references |
| `src/pages/user/UserLibrary.jsx` | Replace mock references |
| `src/pages/user/UserProfile.jsx` | Replace mock references (or keep using AuthContext — profile can stay as-is since it uses context, not mock.js) |
| `src/pages/admin/AdminDashboard.jsx` | Replace mock data with data service |
| `src/pages/admin/AdminPodcasts.jsx` | Replace mock data with data service |
| `src/pages/admin/AdminUsers.jsx` | Replace mock data with data service |
| `src/pages/admin/AdminAnalytics.jsx` | Replace mock data with data service |

### 1.5 New Public Pages

| File | Action | Purpose |
|---|---|---|
| `src/pages/PodcastDetailPage.jsx` | **Create** | Episode list + audio player + AI highlights for a single podcast |
| `src/pages/SearchResultsPage.jsx` | **Create** | Search results grid with filters (category, language, duration) |
| `src/pages/CategoryBrowsePage.jsx` | **Create** | Browse all podcasts in a category |
| `src/pages/PodcastsPage.jsx` | **Create** | Browse all podcasts with search/filter |
| `src/App.jsx` | **Edit** | Add routes for new pages |

### 1.6 Auth Migration

| File | Change |
|---|---|
| `src/contexts/AuthContext.jsx` | Keep as-is for now. Add Supabase Auth as an alternative provider option. The existing mock auth still works for local dev. Eventually swap to Supabase Auth's `signInWithPassword` |

### 1.7 Install Dependencies

```bash
cd public
npm install @supabase/supabase-js
```

### 1.8 Verification

- `npm run build` succeeds
- App loads, intro plays, hero renders
- Featured podcasts, latest episodes, statistics show real Supabase data
- Admin pages show real Supabase data
- Search works against Supabase

---

## M2 — Gateway Webhook Relay

**Goal:** Lightweight relay server that cross-system webhooks pass through.

### Files

| File | Action | Contents |
|---|---|---|
| `gateway/package.json` | **Create** | Express + body-parser, basic scripts |
| `gateway/index.js` | **Create** | Express server on port 3100, body-parser, CORS |
| `gateway/relay.js` | **Create** | In-memory subscriber registry. Methods: `subscribe(subsystem, url, events[])`, `unsubscribe(subsystem)`, `relay(event, payload)` |
| `gateway/subscribers.json` | **Create** | Persisted subscriber list (simple JSON, loaded at startup) |

### API Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/webhook/ingest` | Admin → Gateway → Editor + Public |
| `POST` | `/webhook/publish` | Editor → Gateway → Public |
| `POST` | `/webhook/update` | Editor → Gateway → Public |
| `POST` | `/subscribe` | Subsystem registers for events |
| `POST` | `/unsubscribe` | Subsystem deregisters |

### Gateway Behavior

- On `/webhook/*` receive → look up subscribers for that event type → POST payload to each subscriber URL
- 3 retry attempts with 1s/3s/5s exponential backoff
- Log all deliveries + failures to console
- Return `200 { received: true, relayed: [subscriberCount] }` immediately (fire-and-forget)

---

## M3 — Admin Subsystem (Vue 3 + Express + SQLite + RSS)

**Goal:** RSS feed management, ingestion jobs, raw data viewer, failed queue.

### 3.1 Scaffold Vue 3 App

```bash
npm create vite@latest admin -- --template vue
cd admin
npm install vue-router pinia axios
```

### 3.2 Install Backend Dependencies

```bash
mkdir admin/server
cd admin/server
npm init -y
npm install express cors prisma @prisma/client bcrypt jsonwebtoken node-cron rss-parser body-parser
npx prisma init --datasource-provider sqlite
```

### 3.3 Prisma Schema

Create `admin/server/prisma/schema.prisma` with:
- **Feed** — id, url, category, status (active/failed/pending), lastFetched, createdAt
- **Episode** — id, feedId (FK), title, description, audioUrl, duration, publishedAt, rawData (JSON string)
- **Job** — id, feedId (FK), status (success/error/running), message, runAt
- **AdminUser** — id, email (unique), password (bcrypt), name, role

Run `npx prisma migrate dev --name init`

### 3.4 Express Backend Files

| File | Contents |
|---|---|
| `admin/server/index.js` | Express app setup, CORS, JSON parsing, route mounting, error middleware. Listens on port 3002 |
| `admin/server/routes/dashboard.js` | GET /api/admin/dashboard — counts of feeds, episodes, jobs by status |
| `admin/server/routes/feeds.js` | GET /api/admin/feeds, POST /api/admin/feeds, DELETE /api/admin/feeds/:id |
| `admin/server/routes/jobs.js` | GET /api/admin/jobs, POST /api/admin/jobs/:id/retry |
| `admin/server/routes/podcasts.js` | GET /api/admin/podcasts/raw |
| `admin/server/routes/auth.js` | POST /api/admin/login, POST /api/admin/register |
| `admin/server/middleware/auth.js` | JWT verification middleware for admin routes |
| `admin/server/jobs/ingestion.js` | node-cron job — every 15min, fetches all active feeds via rss-parser, stores episodes + creates Job records, POSTs to gateway |
| `admin/server/jobs/index.js` | Initialize all scheduled jobs |

### 3.5 Vue 3 Frontend Pages

| File | Contents |
|---|---|
| `admin/src/pages/DashboardPage.vue` | Stats cards (feeds, episodes, jobs, sync status), recent activity feed |
| `admin/src/pages/FeedsPage.vue` | Table of RSS feeds with status badges, add feed form modal, delete with confirmation |
| `admin/src/pages/JobsPage.vue` | Filterable job log table (success/error/running), retry button per failed job |
| `admin/src/pages/RawDataPage.vue` | Read-only viewer of raw podcast data from SQLite, searchable |
| `admin/src/pages/LoginPage.vue` | Login form |
| `admin/src/router/index.js` | Vue Router with auth guard |
| `admin/src/stores/auth.js` | Pinia store for auth state + JWT |
| `admin/src/stores/feeds.js` | Pinia store for feed CRUD |
| `admin/src/stores/jobs.js` | Pinia store for job list + retry |

### 3.6 RSS Ingestion Logic (admin/server/jobs/ingestion.js)

```
async function ingestFeed(feed):
  try:
    log job start → create Job { feedId, status: "running" }
    fetch(feed.url)
    parse XML via rss-parser
    for each episode in parsed.feed.episodes:
      upsert Episode { feedId, title, description, audioUrl, duration, publishedAt, rawData: JSON.stringify(episode) }
    update Feed.lastFetched = now()
    update Job { status: "success", message: `${n} episodes ingested` }
    POST to gateway /webhook/ingest { feedId: feed.id, feedUrl: feed.url, episodesCount: n }
  catch error:
    update Job { status: "error", message: error.message }
    if 5 consecutive failures → Feed.status = "suspended"
```

### 3.7 Verification

- `admin/server` starts on port 3002
- Add feed via Vue UI → RSS ingested → episodes visible in raw viewer
- Failed feed → retry button works
- Gateway receives webhook on successful ingestion

---

## M4 — Editor Subsystem (Svelte + Express + MongoDB)

**Goal:** Editorial workflow — review queue, enrichment, collections, episode management.

### 4.1 Scaffold Svelte App

```bash
npm create vite@latest editor -- --template svelte
cd editor
npm install svelte-routing svelte stores
```

### 4.2 Install Backend Dependencies

```bash
mkdir editor/server
cd editor/server
npm init -y
npm install express cors mongoose bcrypt jsonwebtoken body-parser
```

### 4.3 Mongoose Models

Create `editor/server/models/` with schemas for **Podcast**, **Episode**, **Collection**, **EditorUser**, **Category** (all matching the design document).

### 4.4 Express Backend Files

| File | Contents |
|---|---|
| `editor/server/index.js` | Express on port 3003, MongoDB connection at startup |
| `editor/server/routes/dashboard.js` | GET /api/editor/dashboard — counts by status |
| `editor/server/routes/queue.js` | GET /api/editor/queue — podcasts with status=pending_review |
| `editor/server/routes/podcasts.js` | GET /api/editor/podcasts/:id, PUT /api/editor/podcasts/:id |
| `editor/server/routes/collections.js` | Full CRUD for collections |
| `editor/server/routes/episodes.js` | GET episodes for podcast, PUT /api/editor/episodes/:id (toggle published) |
| `editor/server/routes/published.js` | GET /api/editor/published — browse published content |
| `editor/server/routes/categories.js` | GET, POST categories |
| `editor/server/routes/accounts.js` | GET editor users, POST create (admin only) |
| `editor/server/routes/auth.js` | POST /api/editor/login, POST /api/editor/register |
| `editor/server/middleware/auth.js` | JWT verification |

### 4.5 Svelte Frontend Pages

| File | Contents |
|---|---|
| `editor/src/pages/Dashboard.svelte` | Editorial overview: pending/draft/published counts, quick actions |
| `editor/src/pages/Queue.svelte` | List of podcasts pending review with accept/reject buttons |
| `editor/src/pages/PodcastEditor.svelte` | Form: edit tags, summary, featured flag, collection dropdown |
| `editor/src/pages/Collections.svelte` | CRUD collections. Drag-to-reorder podcasts in collection |
| `editor/src/pages/Episodes.svelte` | Per-podcast episode list with publish/hide toggles |
| `editor/src/pages/Published.svelte` | Browse all published, edit/unpublish/feature actions |
| `editor/src/pages/Settings.svelte` | Categories CRUD, editor accounts, notification prefs |
| `editor/src/pages/Login.svelte` | Login form |
| `editor/src/App.svelte` | Router setup with auth guard |

### 4.6 Webhook Integration

When Editor publishes a podcast, the Express backend POSTs to:
```
POST → gateway/webhook/publish { podcastId, title, episodeIds[] }
```

When Editor updates content:
```
POST → gateway/webhook/update { podcastId, updatedFields[] }
```

### 4.7 Verification

- `editor/server` starts on port 3003
- Pending podcasts appear in queue
- Can edit, tag, assign to collection, publish
- Gateway receives webhook on publish

---

## M5 — Cross-System Integration

### 5.1 Subscribe Pattern

When each subsystem starts, it registers with gateway:

```bash
# Editor subscribes to ingest events
POST → gateway/subscribe { subsystem: "editor", url: "http://localhost:3003/webhook/ingest", events: ["ingest"] }

# Public subscribes to publish events
POST → gateway/subscribe { subsystem: "public", url: "http://localhost:3004/webhook/publish", events: ["publish"] }
```

### 5.2 Public Receives Webhooks

Create `public/server/` (or integrate into existing dev server flow) — a simple Express endpoint on port 3004 that receives publish events and triggers Supabase updates:

| File | Contents |
|---|---|
| `public/server/index.js` | Express on port 3004, receives webhooks from gateway |
| `public/server/routes/webhooks.js` | POST /webhook/publish → trigger Supabase upsert. POST /webhook/update → trigger Supabase update |

Alternatively, since Public uses Supabase, Editor can write directly to Supabase. But the spec requires cross-system REST communication, so the gateway relay + webhook receiver is the correct architecture.

### 5.3 End-to-End Test Scenarios

**Scenario 1: Full RSS flow**
1. Admin: Add RSS feed `http://example.com/feed.xml`
2. Wait for cron (or trigger manual) → feed ingested → 3 episodes stored in SQLite
3. Gateway receives `ingest` event → Editor sees 3 new podcasts in queue
4. Editor: Review, tag, assign collection, publish
5. Gateway receives `publish` event → Public Supabase gets new podcast + episodes
6. Public user visits site → sees new podcast in Featured (Supabase real-time if subscribed)

**Scenario 2: Failed feed + retry**
1. Admin: Add invalid RSS URL
2. Cron runs → Job fails with error
3. Admin page shows failed job in queue with error message
4. Admin clicks Retry → cron immediately re-fetches feed → succeeds
5. Gateway sends ingest event

**Scenario 3: Real-time update**
1. Editor publishes episode from existing podcast
2. Gateway relays to Public
3. Public page auto-updates episode list (Supabase Realtime subscription)

---

## Dependency Installation Summary

### Public (existing `D:\PODCAST`)
```
npm install @supabase/supabase-js
```

### Admin
```
# Frontend
npm create vite@latest admin -- --template vue
npm install vue-router pinia axios

# Backend
cd admin/server
npm init -y
npm install express cors prisma @prisma/client bcrypt jsonwebtoken node-cron rss-parser body-parser
```

### Editor
```
# Frontend
npm create vite@latest editor -- --template svelte
cd editor
npm install svelte-routing

# Backend
cd editor/server
npm init -y
npm install express cors mongoose bcrypt jsonwebtoken body-parser
```

### Gateway
```
mkdir gateway
cd gateway
npm init -y
npm install express body-parser
```

---

## Risk Register

| Risk | Likelihood | Mitigation |
|---|---|---|
| Supabase API differences from mock data | Medium | Build data service adaptor layer early; test all existing sections after migration |
| Vue 3 / Svelte learning curve | Low | The apps are separate; existing React devs can focus on Public while others learn |
| RSS parsing edge cases | Medium | Use `rss-parser` which handles most formats; wrap in try/catch with proper error logging |
| MongoDB schema changes mid-development | Low | Mongoose schemas are flexible; add fields as needed without migrations |
| Gateway becomes single point of failure | Low | It's in-memory and stateless; if it goes down, each subsystem continues working independently. Only real-time sync is delayed |
| Real-time not truly real-time | Medium | Gateway webhooks are near-instant. Supabase Realtime adds <100ms latency. Acceptable for this use case |
