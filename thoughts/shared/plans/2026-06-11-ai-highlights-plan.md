# Implementation Plan — AI Highlights System

**Date:** 2026-06-11
**Based on:** `thoughts/shared/designs/2026-06-11-ai-highlights-design.md`

---

## Overview

Build a complete AI Highlights system: database models, admin CRUD API, detection engine, admin UI, user-facing pages. Replace the current mock-data static section with a live, data-driven feature.

**Key integration points:**
- Existing `episodes.js` route has placeholder `aiHighlights: []` — will be replaced with real DB queries
- Navigation has `{ label: 'AI Highlights', href: '/#ai-highlights' }` anchor — will be replaced with route
- `AIHighlights.jsx` has hardcoded mock data — will be replaced with API-driven `HighlightsPage.jsx`

---

## Step 1: Prisma Schema & Migration

**What:** Add `Highlight`, `HighlightCollection`, `HighlightSegment` models to `schema.prisma`

**Files:**
- `D:\PODCAST\server\prisma\schema.prisma`

**Tasks:**
1. Add `HighlightCollection` model (name, description, slug unique, coverImage, color, timestamps, highlights relation)
2. Add `Highlight` model (episodeId FK → Episode cascade delete, collectionId FK optional → HighlightCollection setNull, title, description, startTime Int, endTime Int, confidence Float, status String default "pending", tags String default "[]", timestamps, segments relation)
3. Add `HighlightSegment` model (highlightId FK → Highlight cascade delete, label String, startTime Int, endTime Int, text String default "", confidence Float)
4. Update existing `Episode` model to add `highlights Highlight[]` relation (reverse relation on episodeId)
5. Add `@@index([episodeId])`, `@@index([status])`, `@@index([collectionId])` on Highlight
6. Add `@@index([highlightId])` on HighlightSegment
7. Run `npx prisma db push` to apply migration

---

## Step 2: Highlight Detection Job

**What:** Create a heuristic-based highlight detection engine that runs after episode ingestion

**Files:**
- `D:\PODCAST\server\jobs\highlight-detection.js` (new)
- `D:\PODCAST\server\index.js` (or the job scheduler entry) — register the job

**Tasks:**
1. Create `server/jobs/highlight-detection.js` with:
   - `detectHighlightsForEpisode(episode)` function
   - Heuristic rules: scan title/description for keywords ("breakthrough", "key", "important"), detect bullet points/lists in description, propose clips at 25%/50%/75% marks, check tags
   - Generate `Highlight` records with status=`pending` and confidence score 0-1
   - Generate `HighlightSegment` records for each highlight
2. Create `runDetectionForAllPending()` to process episodes without highlights
3. Create manual trigger endpoint (used in Step 3)

**Heuristic rules (initial):**
- Title contains "breakthrough", "reveals", "exclusive" → confidence 0.8, label "key_point"
- Description has numbered lists → one segment per list item, confidence 0.6
- Duration > 30 min → propose 3 segments at 25%, 50%, 75% marks with confidence 0.3
- Tags match ["AI", "technology", "research", "science"] → confidence boost +0.2

---

## Step 3: Backend API Routes

**What:** Create all admin and public API endpoints for highlights and collections

**Files:**
- `D:\PODCAST\server\routes\highlights.js` (new)
- `D:\PODCAST\server\index.js` — register routes
- `D:\PODCAST\server\routes\episodes.js` — update to include real highlights

**Tasks:**
1. Create `server/routes/highlights.js` with admin endpoints (protected):
   - `GET /api/admin/highlights` — list with filters (status, episodeId, collectionId), pagination
   - `GET /api/admin/highlights/:id` — single highlight with segments
   - `PUT /api/admin/highlights/:id` — update title, description, tags, startTime, endTime, status
   - `POST /api/admin/highlights/:id/approve` — set status=approved
   - `POST /api/admin/highlights/:id/reject` — set status=rejected
   - `DELETE /api/admin/highlights/:id` — delete
   - `POST /api/admin/episodes/:id/detect` — manual trigger detection for an episode
2. Admin collection endpoints:
   - `GET /api/admin/highlight-collections` — list all
   - `POST /api/admin/highlight-collections` — create
   - `PUT /api/admin/highlight-collections/:id` — update
   - `DELETE /api/admin/highlight-collections/:id` — delete
   - `POST /api/admin/highlight-collections/:id/reorder` — reorder highlights
3. Public endpoints (unprotected):
   - `GET /api/highlights` — published highlights only, with episode info
   - `GET /api/highlights/:id` — single published highlight with audio seek URL
   - `GET /api/highlight-collections` — collections with published highlight counts
   - `GET /api/episodes/:id/highlights` — published highlights for an episode
4. Update `server/routes/episodes.js`:
   - Replace `aiHighlights: []` in list endpoint with `await prisma.highlight.findMany({ where: { episodeId: e.id, status: 'approved' }, include: { segments: true } })`
   - Same for single episode endpoint

---

## Step 4: Admin Pages

**What:** Create admin UI pages for managing highlights and collections

**Files:**
- `D:\PODCAST\src\pages\admin\AdminHighlights.jsx` (new)
- `D:\PODCAST\src\pages\admin\AdminHighlightEditor.jsx` (new)
- `D:\PODCAST\src\pages\admin\AdminHighlightCollections.jsx` (new)
- `D:\PODCAST\src\components\admin\DataTable.js` — may need column type updates
- Admin router file — register new routes

**Tasks:**
1. Create `AdminHighlights.jsx`:
   - DataTable with columns: Title, Episode, Confidence (badge), Status (badge with color), Duration, Tags, Actions
   - Filter bar: status dropdown, episode search, date range
   - Row actions: Approve ✓, Reject ✗, Edit ✏️, Delete 🗑️
   - Bulk actions: Approve Selected, Reject Selected, Assign to Collection
   - Status badges: pending=yellow, approved=green, rejected=red
   - Confidence badge: high (>0.7)=green, medium (0.4-0.7)=yellow, low (<0.4)=gray
2. Create `AdminHighlightEditor.jsx`:
   - Header with episode title and highlight status
   - Title input (text)
   - Description textarea
   - Tags input (comma-separated or tag chips)
   - Time range selector: start/end time inputs (mm:ss format), preview with "Listen from start" button
   - Collection picker dropdown
   - Segments list: auto-detected segments with toggle to include/exclude
   - Action buttons: Save Draft, Approve & Save, Reject
3. Create `AdminHighlightCollections.jsx`:
   - DataTable: Name, Description, Highlight Count, Slug, Actions
   - Create/Edit modal with fields: name, description, slug (auto-generated from name), color picker
   - Collection detail view with drag-and-drop highlight reorder
4. Register routes in admin router

---

## Step 5: Shared Components

**What:** Create reusable UI components used across admin and public pages

**Files:**
- `D:\PODCAST\src\components\highlights\HighlightCard.jsx` (new)
- `D:\PODCAST\src\components\highlights\TrimRange.jsx` (new)

**Tasks:**
1. Create `HighlightCard.jsx`:
   - Displays: title, episode name, duration, tags as chips, confidence badge
   - Play button that opens audio at clip start (uses existing AudioPlayer)
   - Bookmark/save button (icon toggle)
   - Accent color border (from collection or type)
   - Hover lift effect (matches existing card patterns)
   - Two variants: `compact` (for grid view) and `detailed` (for list view)
2. Create `TrimRange.jsx`:
   - Dual-handle range slider (start/end handles)
   - Time displays for start and end in mm:ss format
   - Step increment of 1 second
   - Props: `min`, `max`, `startTime`, `endTime`, `onChange`
   - Visual: dark track, accent-colored range between handles, handle circles
   - Accessibility: keyboard-navigable handles (arrow keys)

---

## Step 6: User-Facing Pages

**What:** Create public pages replacing the static AI Highlights section

**Files:**
- `D:\PODCAST\src\pages\HighlightsPage.jsx` (new)
- `D:\PODCAST\src\pages\HighlightDetailPage.jsx` (new)
- `D:\PODCAST\src\pages\HighlightCollectionPage.jsx` (new)
- `D:\PODCAST\src\App.jsx` — register new routes

**Tasks:**
1. Create `HighlightsPage.jsx` (`/highlights`):
   - Hero/title section: "AI Highlights" with subtitle
   - Grid of HighlightCard components (2-3 columns responsive)
   - Filter by collection (horizontal chips/tabs)
   - Search bar
   - Sort dropdown (Date, Confidence, Duration)
   - Loading skeleton state
   - Empty state: "No highlights yet" with illustration
   - Fetch from `GET /api/highlights`
2. Create `HighlightDetailPage.jsx` (`/highlights/:id`):
   - Back button to `/highlights`
   - Large highlight card with full description
   - Embedded audio player that seeks to clip start time
     - Use existing AudioPlayer component or `<audio>` element with `currentTime` set
     - Auto-play toggle
   - Tags as clickable filters
   - Episode context card (title, date, "Listen to full episode" link)
   - Collection badge (if assigned)
   - Share button (copy link)
3. Create `HighlightCollectionPage.jsx` (`/highlights/collection/:slug`):
   - Collection header: name, description, highlight count
   - Grid of HighlightCard components
   - Empty state if no published highlights in collection
4. Update `App.jsx`:
   - Add routes: `/highlights`, `/highlights/:id`, `/highlights/collection/:slug`
   - Add navigation links

---

## Step 7: Navigation & Homepage Updates

**What:** Replace static references with live data and proper routing

**Files:**
- `D:\PODCAST\src\components\navigation\Navigation.jsx`
- `D:\PODCAST\src\pages\HomePage.jsx`
- `D:\PODCAST\src\sections\AIHighlights.jsx` (deprecate/remove or repurpose)
- `D:\PODCAST\src\App.jsx`

**Tasks:**
1. Update `Navigation.jsx`:
   - Change `{ label: 'AI Highlights', href: '/#ai-highlights' }` to `{ label: 'AI Highlights', href: '/highlights' }`
   - Ensure nav items work with React Router
2. Update `HomePage.jsx`:
   - Keep `AIHighlights` component as a "featured" section showing top 4 published highlights (fetch from API)
   - Or replace entirely with a simpler "Latest Highlights" section that fetches live data
3. Update `App.jsx` router:
   - Add route for `/highlights` → `HighlightsPage`
   - Add route for `/highlights/:id` → `HighlightDetailPage`
   - Add route for `/highlights/collection/:slug` → `HighlightCollectionPage`
4. Optionally repurpose `AIHighlights.jsx` to fetch from API instead of hardcoded mock data:
   - Replace `const highlights = [...]` with `fetch('/api/highlights?limit=4')`
   - Keep same visual layout but use real data

---

## Step 8: Episodes API Integration

**What:** Wire the existing episode endpoints to return real highlight data

**Files:**
- `D:\PODCAST\server\routes\episodes.js`

**Tasks:**
1. Update `GET /episodes` list endpoint:
   - Replace `aiHighlights: []` with DB query:
     ```
     aiHighlights: await prisma.highlight.findMany({
       where: { episodeId: e.id, status: 'approved' },
       include: { segments: true }
     })
     ```
   - Note: this adds N+1 queries. For performance with large datasets, consider batching:
     - Fetch all approved highlights grouped by episodeId
     - Map them into the response
2. Update `GET /episodes/:id` single endpoint:
   - Same replacement as above
   - Single query per episode, so N+1 isn't a concern here

---

## Summary

| Step | What | Est. Files Changed | Est. Effort |
|------|------|-------------------|-------------|
| 1 | Schema + migration | 1 | small |
| 2 | Detection job | 2 | medium |
| 3 | Backend API routes | 4 | medium |
| 4 | Admin pages | 4 | large |
| 5 | Shared components | 2 | small |
| 6 | User-facing pages | 4 | large |
| 7 | Navigation & homepage | 4 | medium |
| 8 | Episodes API integration | 1 | small |

**Total: ~22 files, estimated 3-4 hours for a developer**

---

## Dependencies

- Step 1 must be completed before Steps 2, 3, 8 (they depend on Prisma models)
- Step 5 must be completed before Steps 4, 6 (components used by pages)
- Steps 2, 3 are independent of each other after Step 1
- Steps 4, 6 are independent of each other after Step 5
- Step 7 depends on Steps 3, 6 (routes must exist before navigation can link to them)
- Step 8 depends on Step 1 only

**Recommended execution order:**
1 → [2, 3, 5] (parallel) → [4, 6] (parallel) → 7 → 8
