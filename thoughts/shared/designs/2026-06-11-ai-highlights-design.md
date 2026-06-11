date: 2026-06-11
topic: "AI Highlights Feature Design"
status: validated

# AI Highlights Feature Design

## Problem Statement

The current "AI Highlights" section on the homepage is purely decorative — 4 hardcoded mock cards with no backend, no database, no admin tools, and no actual AI processing. We need to build a real system that:

- Automatically generates highlight clips from podcast episodes
- Detects key/important segments
- Allows editors to accept/reject, trim, tag, and describe clips
- Organizes highlights into collections

## Constraints

- **SQLite** database (no Postgres-specific features)
- **Express** backend (same pattern as existing routes)
- **No external AI API** initially — segment detection will use a heuristic/rule-based engine that can be swapped for an ML model later
- Must integrate with existing **Episode** and **Podcast** models
- Admin workflow must match existing admin UI patterns (DataTable, forms, modals)

## Approach

**Phase 1 — Data Layer & Core API** (what we design here)
- New database models: `Highlight`, `HighlightCollection`, `HighlightSegment`
- Backend CRUD routes for highlights and collections
- A scheduled job that runs after episode ingestion to auto-detect segments

**Phase 2 — Admin Editor UI** (follows existing patterns)
- Highlights management page in admin (table with accept/reject toggles)
- Trim editor modal (set start/end times)
- Tag and description editing
- Collection assignment

**Phase 3 — User-Facing Pages**
- Dedicated `/highlights` page replacing the static section
- `/highlights/:id` detail page with audio clip player
- Collection browsing

## Architecture

```
┌─────────────────────────────────────────────┐
│            Ingestion Pipeline                │
│  RSS Feed → Episodes → Highlight Detection  │
│                      ↓                       │
│           Highlight (pending)                │
│                      ↓                       │
│         Admin Review Workflow                │
│  Accept ✓ │ Reject ✗ │ Trim ✂️ │ Tag 🏷️      │
│                      ↓                       │
│        Published Highlight                   │
│                      ↓                       │
│   User-Facing Pages / Collections            │
└─────────────────────────────────────────────┘
```

The **Highlight Detection Engine** runs as a post-ingestion job. It analyzes episode metadata (title, description, tags, duration) and uses heuristics to propose segments. This can be replaced with an ML model later without changing the data model.

## Database Models

Add to `schema.prisma`:

```prisma
// ============================================
// AI Highlights
// ============================================

model HighlightCollection {
  id          String   @id @default(uuid())
  name        String
  description String   @default("")
  slug        String   @unique
  coverImage  String   @default("")
  color       String   @default("#3B82F6")
  createdAt   DateTime @default(now())
  highlights  Highlight[]
}

model Highlight {
  id             String   @id @default(uuid())
  episodeId      String
  episode        Episode  @relation(fields: [episodeId], references: [id], onDelete: Cascade)
  collectionId   String?
  collection     HighlightCollection? @relation(fields: [collectionId], references: [id], onDelete: SetNull)
  title          String   // Auto-generated or editor-set
  description    String   @default("")
  startTime      Int      // seconds from episode start
  endTime        Int      // seconds from episode start
  confidence     Float    @default(0) // AI confidence score 0-1
  status         String   @default("pending") // pending | approved | rejected
  tags           String   @default("[]") // JSON array
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  segments       HighlightSegment[]

  @@index([episodeId])
  @@index([status])
  @@index([collectionId])
}

model HighlightSegment {
  id          String    @id @default(uuid())
  highlightId String
  highlight   Highlight @relation(fields: [highlightId], references: [id], onDelete: Cascade)
  label       String    // "key_point", "quote", "summary", "sentiment_shift"
  startTime   Int       // seconds
  endTime     Int       // seconds
  text        String    @default("") // optional transcript snippet
  confidence  Float     @default(0)

  @@index([highlightId])
}
```

### Key Design Decisions

- **Highlight vs Segment**: A `Highlight` is a proposed clip from an episode. It can contain multiple `HighlightSegment`s (e.g., multiple key points in one 5-minute clip). Segments are the atomic "important moment" within a highlighted region.
- **Collections**: Highlights can be grouped into collections (e.g., "Best of Tech", "Weekly Top Picks"). Collections have a slug for URL-friendly access.
- **Status workflow**: `pending` → `approved` or `rejected`. Auto-detected highlights start as `pending`. Editors review and approve/reject.
- **Confidence score**: The detection engine assigns a 0-1 score. Editors can use this to prioritize review.
- **Timestamps in seconds**: `startTime`/`endTime` are absolute seconds from episode start. The audio player uses these to seek and play clips.

## Backend Routes

### Highlight Detection Job (`server/jobs/highlight-detection.js`)

A cron job that runs after episode ingestion:
1. Fetch episodes without highlights
2. Analyze title, description, tags, and duration
3. Generate candidate `Highlight` records (status: pending)
4. Generate `HighlightSegment` records for each highlight

Initial heuristic engine:
- **Title keywords**: Scan for patterns like "breakthrough", "key", "important", "crucial", "reveals"
- **Description structure**: Look for bullet points, numbered lists, "key takeaways" phrases
- **Duration-based**: Propose clips at 25%, 50%, 75% marks of episode
- **Tag matching**: Match episode tags to known "important" topics

### API Endpoints

All under `/api/admin/highlights` (protected, like existing routes):

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/highlights` | List highlights (filterable by status, episode, collection) |
| GET | `/highlights/:id` | Get single highlight with segments |
| PUT | `/highlights/:id` | Update title, description, tags, start/end times, status |
| POST | `/highlights/:id/approve` | Shortcut to set status=approved |
| POST | `/highlights/:id/reject` | Shortcut to set status=rejected |
| DELETE | `/highlights/:id` | Delete highlight |
| GET | `/episodes/:id/highlights` | Get highlights for a specific episode |
| POST | `/episodes/:id/detect` | Manually trigger detection for an episode |

Collections:

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/highlight-collections` | List all collections |
| POST | `/highlight-collections` | Create collection |
| PUT | `/highlight-collections/:id` | Update collection |
| DELETE | `/highlight-collections/:id` | Delete collection |
| POST | `/highlight-collections/:id/reorder` | Reorder highlights in collection |

Public endpoints (unprotected):

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/highlights` | Published highlights for user-facing pages |
| GET | `/highlights/:id` | Single published highlight with audio seek URL |
| GET | `/highlight-collections` | Collections with highlight counts |

## Frontend Components

### Admin Pages (under `/admin/highlights`)

1. **AdminHighlights.jsx** — Table of all highlights with filters (status, episode, collection)
   - Columns: Title, Episode, Confidence, Status, Duration, Tags, Actions
   - Row actions: Approve, Reject, Edit, Delete
   - Bulk actions: Approve selected, Reject selected, Assign to Collection

2. **AdminHighlightEditor.jsx** — Full editor for a single highlight
   - Audio player with time-range selector (start/end trim)
   - Title, description, tags inputs
   - Collection picker (dropdown)
   - Segments list (auto-detected, can be toggled on/off)
   - Save / Approve / Reject buttons

3. **AdminHighlightCollections.jsx** — Collection management
   - Table of collections with highlight counts
   - Create/edit modal (name, description, slug, color)
   - Drag-and-drop highlight reordering

### User-Facing Pages

1. **HighlightsPage.jsx** — Dedicated `/highlights` route
   - Grid of published highlight cards (replaces static section)
   - Filter by collection
   - Search
   - Sort by date, popularity, confidence

2. **HighlightDetailPage.jsx** — `/highlights/:id`
   - Embedded audio player that seeks to clip start
   - Description, tags, episode context
   - "Listen to full episode" link
   - Save to collection button

3. **HighlightCollectionPage.jsx** — `/highlights/collection/:slug`
   - Collection with its highlights

### Shared Components

1. **HighlightCard.jsx** — Reusable card (used in grid and lists)
   - Shows title, episode name, duration, tags, confidence badge
   - Play button that opens audio at clip start
   - Bookmark/save button

2. **TrimRange.jsx** — Time-range selector for the editor
   - Dual-handle range slider on audio waveform/seekbar
   - Start/end time displays

## Data Flow

```
Episode Ingestion Complete
         │
         ▼
Highlight Detection Job runs
  • Fetch episode metadata
  • Run heuristic analysis
  • Create Highlight (pending)
  • Create Segment records
         │
         ▼
Admin Review (AdminHighlights page)
  • See all pending highlights
  • Listen to proposed clips
  • Approve → status=approved
  • Reject → status=rejected
  • Edit → open editor for trimming/tags
         │
         ▼
Published Highlight visible to users
  • Appears in user-facing /highlights
  • Can be added to collections
  • Embedded audio player with clip range
```

## Error Handling

- **Detection failure**: Log error, mark episode as "detection_skipped" to avoid re-processing
- **Missing audio URL**: Skip highlights for episodes without `audioUrl`
- **Invalid timestamps**: Clamp start/end to episode duration
- **Concurrent edits**: Optimistic locking via `updatedAt` comparison
- **Empty results**: If detection finds nothing, create a single low-confidence segment at the 50% mark as a fallback

## Testing Strategy

| Layer | What to test |
|-------|-------------|
| **Detection engine** | Heuristic correctly identifies keywords, generates valid timestamps, handles edge cases (empty description, very short episodes) |
| **API routes** | CRUD works, status transitions are valid, collections assign correctly, auth enforced |
| **Admin UI** | Approve/reject flow, trim editor saves correct times, tag input works, collection picker |
| **User-facing UI** | Audio player seeks to correct time, cards display correctly, filters work |
| **Integration** | Full flow: ingest → detect → review → publish → display |

## Open Questions

1. **Audio seeking**: How does the user-facing audio player handle time-seeking? The episode `audioUrl` is an external RSS feed MP3. We need a way to play from a specific timestamp — either the browser's native `<audio>` element with `currentTime` set, or a custom audio player component.
2. **Waveform visualization**: The trim editor ideally shows an audio waveform. Generating waveforms requires audio processing (ffmpeg or similar). Initial version can use a simple time-range slider without waveform.
3. **User authentication for highlights**: Can any user view highlights, or only logged-in users? The public route suggests anyone can view published highlights, but saving/bookmarking requires auth.
4. **Retroactive detection**: Should existing episodes get highlights generated for them, or only new episodes after the feature is deployed? A one-time backfill job would need to iterate all episodes.

## Implementation Order

1. **Schema + migration** — Add models, run `prisma db push`
2. **Detection job** — Create `server/jobs/highlight-detection.js`, integrate with ingestion cron
3. **Backend routes** — All admin and public highlight/collection endpoints
4. **Admin pages** — `AdminHighlights`, `AdminHighlightEditor`, `AdminHighlightCollections`
5. **User-facing pages** — `HighlightsPage`, `HighlightDetailPage`, `HighlightCollectionPage`
6. **Shared components** — `HighlightCard`, `TrimRange`
7. **Navigation update** — Replace `/#ai-highlights` anchor with `/highlights` route
8. **Homepage update** — Replace static `AIHighlights.jsx` with live data from API
