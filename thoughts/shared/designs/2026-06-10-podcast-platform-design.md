---
date: 2026-06-10
topic: "Podcast Directory & Player Platform — 3 Subsystem Architecture"
status: validated
---

## Problem Statement

We need to convert the existing PodcastAI React SPA (mock data, single app) into a **three-subsystem podcast platform** matching the spec requirements:
- **Admin System** (RSS ingestion, job logs, failed queues, raw data viewer)
- **Editor System** (editorial queue, enrichment, collections, episode management)
- **Public User System** (browse, search, play, highlights)

Each subsystem must use a **different framework**, a **different database**, communicate via **REST APIs**, and support **real-time updates** across systems.

## Constraints

- **No rewrite of existing code** — the current React 19 app stays intact
- **Keep all existing styling, animations, sections, components** — Hero, GSAPIntro, PodcastCard, AudioPlayer, etc.
- **Keep the stack (React 19, Vite 8, Tailwind v4, GSAP, Framer Motion)** for the Public subsystem
- **Supabase (PostgreSQL)** for the Public subsystem
- **Auth per-system** — each has its own auth table and JWT
- **Local dev only** — no Docker, no production deployment
- **Real-time** — changes in one subsystem reflect in others
- **RSS feeds** — real scheduled ingestion needed

## Approach

**Monorepo architecture.** Three independent apps in one repo, each with its own backend and database. A lightweight event gateway relays webhooks between subsystems for real-time sync.

| Subsystem | Framework | Database | Backend | Auth |
|---|---|---|---|---|
| **Public** (existing code) | React 19 + Vite | Supabase PostgreSQL | Supabase (no custom backend needed initially) | Supabase Auth |
| **Admin** | Vue 3 + Vite | SQLite (via Prisma) | Express.js | bcrypt + JWT |
| **Editor** | Svelte + Vite | MongoDB (via Mongoose) | Express.js | bcrypt + JWT |
| **Gateway** | Node.js EventBus | None (in-memory relay) | Webhook receiver | Internal API key |

**RSS Ingestion:** node-cron in Admin Express backend. Scheduled jobs parse feeds, store raw data in SQLite, and POST to gateway.

## Architecture

```
podcast-platform/
├── public/                   # React 19 + Vite (existing code)
│   ├── src/
│   │   ├── services/         # mock.js → supabase.js swap
│   │   ├── pages/            # Keep and add new pages
│   │   ├── sections/         # Keep as-is
│   │   ├── components/       # Keep as-is
│   │   └── ...
│   ├── supabase/             # Migrations and schema
│   └── package.json
│
├── admin/                    # Vue 3 + Vite (new)
│   ├── src/
│   │   ├── pages/            # Dashboard, RSS Manager, Job Logs, Raw Viewer
│   │   ├── components/
│   │   └── ...
│   ├── server/               # Express.js backend
│   │   ├── routes/           # REST API endpoints
│   │   ├── jobs/             # node-cron RSS ingestion
│   │   ├── prisma/           # SQLite schema + migrations
│   │   └── index.js
│   └── package.json
│
├── editor/                   # Svelte + Vite (new)
│   ├── src/
│   │   ├── pages/            # Editorial Dashboard, Queue, Collections, Settings
│   │   ├── components/
│   │   └── ...
│   ├── server/               # Express.js backend
│   │   ├── routes/           # REST API endpoints
│   │   ├── models/           # Mongoose schemas
│   │   └── index.js
│   └── package.json
│
├── gateway/                  # Webhook relay (new)
│   ├── index.js              # Simple Express server receiving POST hooks
│   ├── relay.js              # Forwards to subscribed subsystems
│   └── package.json
│
└── package.json              # Root workspace (npm workspaces)
```

## Components

### Public Subsystem (existing, modified)

**What changes:**
- `src/services/mock.js` → replaced with Supabase query service using `@supabase/supabase-js`
- `src/services/supabase.js` — new file: Supabase client with real-time subscriptions
- `src/pages/admin/` — adjusted to match spec requirements (feed management, job logs, raw viewer)
- No changes to sections, components, animations, or styling

**New pages needed:**
- Podcast detail page (episodes list, player, AI highlights)
- Search results page
- Category browse page
- User library page enhancements

### Admin Subsystem (new)

**Pages:**
1. **Dashboard** — total podcasts, episodes, failed jobs, sync status (all hitting Admin Express API)
2. **RSS Feed Manager** — list of feeds with status (active, failed, pending). Add feed form (RSS URL + category)
3. **Ingestion Job Logs** — success/error/running logs with timestamps
4. **Raw Podcast Data Viewer** — read-only view of ingested feed data
5. **Failed Jobs Queue** — list with retry button per job

**API Endpoints (Admin Express server):**
| Endpoint | Purpose |
|---|---|
| `GET /api/admin/dashboard` | Stats summary |
| `GET /api/admin/feeds` | List all RSS feeds with status |
| `POST /api/admin/feeds` | Add new RSS feed |
| `DELETE /api/admin/feeds/:id` | Remove feed |
| `GET /api/admin/jobs` | Ingestion job logs |
| `POST /api/admin/jobs/:id/retry` | Retry failed job |
| `GET /api/admin/podcasts/raw` | Raw ingested podcast data |

**RSS Ingestion (node-cron in server):**
- Runs every 15 minutes (configurable)
- Fetches RSS XML from each active feed URL
- Parses via `rss-parser` npm package
- Stores in SQLite via Prisma
- Posts webhook to gateway on completion/error

**SQLite Schema (Prisma):**
```prisma
model Feed {
  id          String   @id @default(uuid())
  url         String   @unique
  category    String?
  status      String   @default("active") // active, failed, pending
  lastFetched DateTime?
  createdAt   DateTime @default(now())
  episodes    Episode[]
  jobs        Job[]
}

model Episode {
  id          String   @id @default(uuid())
  feedId      String
  feed        Feed     @relation(fields: [feedId], references: [id])
  title       String
  description String?
  audioUrl    String
  duration    Int?
  publishedAt DateTime?
  rawData     String   // JSON dump of raw RSS data
  createdAt   DateTime @default(now())
}

model Job {
  id        String   @id @default(uuid())
  feedId    String
  feed      Feed     @relation(fields: [feedId], references: [id])
  status    String   // success, error, running
  message   String?
  runAt     DateTime @default(now())
}

model AdminUser {
  id       String @id @default(uuid())
  email    String @unique
  password String // bcrypt hash
  name     String
  role     String @default("admin")
}
```

### Editor Subsystem (new)

**Pages:**
1. **Editorial Dashboard** — pending reviews, drafts, published items counts
2. **Podcast Queue** — list of ingested podcasts pending review
3. **Podcast Editor** — tags, summary, featured flag, collection assignment
4. **Collections Manager** — create/edit curated lists
5. **Episode Management** — publish/hide toggle per episode
6. **Published Content Browser** — browse, edit, unpublish, feature
7. **Settings** — categories, editor accounts, notifications

**API Endpoints (Editor Express server):**
| Endpoint | Purpose |
|---|---|
| `GET /api/editor/dashboard` | Summary counts |
| `GET /api/editor/queue` | Pending review items |
| `GET /api/editor/podcasts/:id` | Podcast detail for editing |
| `PUT /api/editor/podcasts/:id` | Update podcast (tags, summary, featured) |
| `GET /api/editor/collections` | List collections |
| `POST /api/editor/collections` | Create collection |
| `PUT /api/editor/collections/:id` | Update collection |
| `DELETE /api/editor/collections/:id` | Remove collection |
| `PUT /api/editor/episodes/:id` | Toggle publish/hide |
| `GET /api/editor/published` | Published content browser |
| `GET /api/editor/categories` | List categories |
| `POST /api/editor/categories` | Add category |
| `GET /api/editor/accounts` | Editor user management |

**MongoDB Schemas (Mongoose):**
```javascript
// Podcast
{
  title: String,
  host: String,
  category: String,
  description: String,
  summary: String,         // Editor-written summary
  tags: [String],          // Editor-assigned tags
  coverImage: String,
  language: String,
  featured: Boolean,
  collectionId: ObjectId,  // Reference to Collection
  status: String,          // pending_review, draft, published, archived
  sourceFeedId: String,    // Link to Admin's feed ID
  episodes: [Episode],
  createdAt: Date,
  publishedAt: Date
}

// Episode
{
  podcastId: ObjectId,
  title: String,
  description: String,
  audioUrl: String,
  duration: Number,
  published: Boolean,
  publishedAt: Date,
  aiHighlights: [String],
  plays: Number
}

// Collection
{
  name: String,
  description: String,
  coverImage: String,
  podcasts: [ObjectId],
  createdAt: Date
}

// EditorUser
{
  email: String,
  password: String,  // bcrypt
  name: String,
  role: String,      // editor, admin
  notifications: {
    email: Boolean,
    push: Boolean
  }
}

// Category
{
  name: String,
  slug: String,
  description: String,
  color: String
}
```

### Gateway (shared relay)

Simple Express server:
- `POST /webhook/ingest` — Admin sends when feed is ingested (new podcasts available)
- `POST /webhook/publish` — Editor sends when podcast is published
- `POST /webhook/update` — Editor sends when podcast/collection is updated
- Gateway forwards to subscribed endpoints (Public's Supabase, Editor's polling, etc. via outbound webhooks)
- Simple in-memory subscriber registry (or JSON file for persistence)

## Data Flow

```
Admin (Vue 3)
  │
  │ REST API calls to Admin Express
  │ node-cron fetches RSS every 15min
  │ Stores in SQLite via Prisma
  │
  ├─ POST /webhook/ingest ──→ Gateway
  │                              │
  │                              ├─ POST → Editor Express (queue updated)
  │                              └─ POST → Public Express (new podcast available)
  │
Editor (Svelte)                 
  │                               
  │ REST API calls to Editor Express
  │ Editor reviews, enriches, publishes
  │ Stores in MongoDB via Mongoose
  │
  ├─ POST /webhook/publish ──→ Gateway
  │                              │
  │                              └─ POST → Public (via Supabase Realtime)
  │
Public (React 19)
  │
  │ REST + Supabase Realtime subscriptions
  │ Reads from Supabase PostgreSQL
  │ Real-time updates when Editor publishes
  │
  └─ Users browse, search, play via existing UI
```

## Error Handling

| Layer | Strategy |
|---|---|
| **RSS Ingestion** | Each feed fetch is wrapped in try/catch. Failed → Job record with `status: "error"` + error message. Cron continues to next feed. |
| **API Endpoints** | All endpoints return `{ data, error }` structure. Express has global error middleware. |
| **Gateway** | Webhook delivery is fire-and-forget with 3 retry attempts (exponential backoff). Failed deliveries logged but don't block. |
| **Supabase** | `@supabase/supabase-js` has built-in retry for transient failures. Real-time subscriptions auto-reconnect. |
| **Cross-system** | If Editor's backend is down, Admin still ingests feeds. Data isn't lost — it queues in the pending state. |

**Retry strategy for failed jobs:**
- In Admin UI, each failed job has a "Retry" button
- Retry re-fetches that specific feed immediately and updates the job status
- If retry fails, job stays in error state with updated error message
- After 5 consecutive failures, feed auto-suspends (status → `suspended`)

## Testing Strategy

| Layer | Approach |
|---|---|
| **Public (existing)** | Smoke test: app boots, intro plays, hero renders, navigation works. Existing sections shouldn't break. |
| **Admin** | Manual test: add feed, verify ingestion, check logs, retry job. Jest + Supertest for Express API routes. |
| **Editor** | Manual test: review queue, edit podcast, create collection, publish episode. Jest + Supertest for API routes. |
| **Gateway** | Integration test: POST to webhook, verify relay reaches subscriber. |
| **End-to-end** | Flow test: Admin ingests RSS → Editor reviews → Public sees live podcast. |

**Key test paths:**
1. RSS feed URL added → ingestion runs → raw data viewable → Editor sees pending → Editor publishes → Public shows podcast
2. Failed feed ingestion → retry button → successful retry → Editor queue updated
3. Editor publishes episode → Public player has it immediately (real-time)

## Open Questions (resolved)

- **Does "different framework" mean we can keep existing code?** Yes — existing React 19 app stays as Public. Admin and Editor are new Vue 3 and Svelte apps.
- **What about mock data?** Remove mock.js, replace with Supabase. The mock data itself becomes actual seed data in Supabase.
- **Real-time or poll?** Real-time via webhooks (Admin→Gateway→Editor/Public) and Supabase Realtime (Public→listeners).
- **RSS ingestion mechanism?** node-cron in Admin Express backend — simplest, zero infra, just Node.js.
