---
date: 2026-06-08
topic: "Admin & User Sides for PodcastAI Platform"
status: draft
---

## Problem Statement
The PodcastAI platform currently has only public marketing pages and a mock auth page. To make it a complete application, we need authenticated user experiences (dashboard, library, profile) and administrative functionality (podcast CRUD, user management, analytics, settings).

## Existing State
- Public landing page with Hero, FeaturedPodcasts, AIHighlights, LatestEpisodes, AnalyticsDashboard, Integrations, Footer
- AuthPage (login/register UI — no actual auth)
- Persistent AudioPlayer working
- UI components: Button, Card, Input, Badge
- Radix UI deps already in package.json (tabs, dialog, dropdown-menu, slider, switch, avatar, tooltip)
- React Router with `/` and `/auth` routes

## Approach

**Layer 1: Auth Infrastructure** — AuthContext + ProtectedRoute + AdminRoute + API service layer with mock data

**Layer 2: Shared UI Components** — Sidebar, DataTable, Modal, Tabs, Avatar, Switch, EmptyState, Toast, ConfirmDialog, Pagination, LoadingSkeleton, StatCard, PageHeader, SearchInput

**Layer 3: Dashboard Layout** — Collapsible sidebar + top bar + content area (used by both user and admin pages)

**Layer 4: User Pages** — Dashboard, Library (3 tabs), Profile (edit + preferences)

**Layer 5: Admin Pages** — Dashboard, Podcasts (CRUD table + form), Users (table with role mgmt), Analytics (charts + export), Settings

**Layer 6: Navigation Updates** — Auth-aware nav bar, user dropdown menu

**Security:**
- ProtectedRoute redirects unauthenticated users to `/auth`
- AdminRoute additionally checks `user.role === 'admin'`
- API service interceptors handle 401 responses globally

**Dependencies Rationale (already installed):**
- `@radix-ui/react-tabs` — tab interfaces (Library, Settings)
- `@radix-ui/react-dialog` — modals (forms, confirmations)
- `@radix-ui/react-dropdown-menu` — user menu, row actions
- `@radix-ui/react-switch` — toggle settings
- `@radix-ui/react-avatar` — user avatars with fallback
- `@radix-ui/react-tooltip` — sidebar icon labels
- `@radix-ui/react-slider` — future use (seeking, volume)
- `axios` — HTTP client with interceptors

## Architecture

### Route Structure
```
/                   → HomePage          (public)
/auth               → AuthPage          (public)
/dashboard          → UserDashboard     (auth required)
/library            → UserLibrary       (auth required)
/profile            → UserProfile       (auth required)
/admin              → AdminDashboard    (admin required)
/admin/podcasts     → AdminPodcasts     (admin required)
/admin/podcasts/new → AdminPodcastForm  (admin required)
/admin/podcasts/:id/edit → AdminPodcastForm (admin required)
/admin/users        → AdminUsers        (admin required)
/admin/analytics    → AdminAnalytics    (admin required)
/admin/settings     → AdminSettings     (admin required)
```

### Auth Flow
```
User → AuthPage (login/register)
     → AuthContext stores user + token
     → ProtectedRoute checks isAuthenticated
       → Yes: render page
       → No: redirect to /auth
     → AdminRoute additionally checks user.role === 'admin'
       → Yes: render admin page
       → No: redirect to /dashboard
```

### Data Flow
```
Component → Custom hook (useAuth, etc.)
          → API service (axios)
          → Mock data layer (swapable)
          → Returns data + loading + error states
```

## Components

### New Shared UI (18 components)
1. **Sidebar** — Collapsible, icon + label, active state, tooltip when collapsed, nav section headers
2. **DataTable** — Sortable columns, row selection, actions slot, pagination integration, empty state
3. **Modal** — Radix Dialog wrapper with dark theme styling, title, description, footer actions
4. **Tabs** — Radix Tabs wrapper with underline/animated indicator style
5. **Avatar** — Radix Avatar with size variants (sm/md/lg/xl), fallback initials
6. **Switch** — Radix Switch with label, dark theme
7. **DropdownMenu** — Radix DropdownMenu with items, separators, icons
8. **StatCard** — Icon + label + value + trend arrow (reuses pattern from AnalyticsDashboard)
9. **PageHeader** — Title + description + breadcrumbs + action buttons slot
10. **EmptyState** — Icon/illustration + heading + message + CTA button
11. **Toast** — AnimatePresence-based notification stack (success/error/info)
12. **ConfirmDialog** — Modal with destructive styling, confirm/cancel buttons
13. **SearchInput** — Debounced input with search icon and clear button
14. **Pagination** — Page numbers, prev/next, page size selector
15. **LoadingSkeleton** — Pulse animation blocks for content loading
16. **StatusBadge** — Badge variant specifically for Active/Suspended/Published/Draft/Archived
17. **Tooltip** — Radix Tooltip wrapper
18. **Breadcrumbs** — Chevron-separated breadcrumb trail

### Layouts
- **DashboardLayout** — Sidebar (nav links) + TopBar (breadcrumbs, search, profile) + content area
- **AdminLayout** — Same structure, admin-specific sidebar links + admin badge

### Existing Updates
- **Navigation.jsx** — Show user avatar + dropdown when authenticated, hide Login/Subscribe
- **App.jsx** — Add AuthProvider, wrap routes with ProtectedRoute/AdminRoute, lazy-load new pages
- **AuthPage.jsx** — Connect to AuthContext instead of console.log

## User Pages

### UserDashboard
- Continue Listening row (horizontal scroll cards with progress)
- Quick library links
- Recommended podcasts (existing PodcastCard reused)
- Recent activity feed
- Quick stat cards

### UserLibrary
- Radix Tabs: Saved Podcasts | Playlists | History
- Saved: grid of PodcastCards with "Remove" option
- Playlists: list with create/rename/delete, click to expand episodes
- History: chronological episode list with timestamps

### UserProfile
- Avatar upload with preview
- Edit name, email, bio
- Change password
- Notification toggles (email, push, weekly digest)
- Accent color picker (future)

## Admin Pages

### AdminDashboard
- 4 KPI stat cards (Users, Plays, Podcasts, Revenue)
- 12-month user growth line chart
- Recent signups table (last 5)
- Top 5 podcasts this week
- Quick action buttons

### AdminPodcasts
- DataTable with columns: Title, Host, Category, Episodes, Plays, Status, Actions
- Search by title/host
- Filter by category, status
- Bulk actions bar (Publish, Archive, Delete)
- Row actions: Edit, Delete (ConfirmDialog), Duplicate, Toggle status
- Pagination

### AdminPodcastForm
- Reused for create and edit
- Fields: title, host, description, category (select), cover image URL, status switch
- Form validation with error states
- Save + Cancel buttons

### AdminUsers
- DataTable: Avatar, Name, Email, Role, Status, Joined, Last Active
- Role dropdown inline (user/admin/moderator)
- Actions: Edit, Suspend/Activate, Delete
- Search by name/email
- Filter by role, status
- Pagination

### AdminAnalytics
- Date range selector with presets (7d, 30d, 90d, 12m, custom)
- 4 KPI cards
- Plays over time line chart
- Top categories bar chart
- User acquisition area chart
- Per-podcast breakdown table with CSV export

### AdminSettings
- General: platform name, description, logo URL
- Integrations: mock API key fields
- AI Settings: highlight toggle, summary length
- Content Moderation: auto-approve toggle, review queue

## Implementation Order

### Wave 1: Auth + Layout Infrastructure
1. Create `AuthContext.jsx` — state, login/logout/register, persist to localStorage
2. Create `api.js` — axios instance
3. Create `mock.js` — mock data and async functions
4. Create `ProtectedRoute.jsx` + `AdminRoute.jsx`
5. Create `DashboardLayout.jsx` + `AdminLayout.jsx`
6. Update `App.jsx` — AuthProvider, new routes, lazy loading

### Wave 2: Shared UI Components
7. Create all 18 shared UI components listed above
8. Export from `components/ui/index.js`

### Wave 3: User Pages
9. Create `UserDashboard.jsx`
10. Create `UserLibrary.jsx`
11. Create `UserProfile.jsx`

### Wave 4: Admin Pages
12. Create `AdminDashboard.jsx`
13. Create `AdminPodcasts.jsx` + `AdminPodcastForm.jsx`
14. Create `AdminUsers.jsx`
15. Create `AdminAnalytics.jsx`
16. Create `AdminSettings.jsx`

### Wave 5: Integration + Polish
17. Update `Navigation.jsx` — auth-aware with user dropdown
18. Update `AuthPage.jsx` — connect to AuthContext
19. Build verification
20. Final review

## Error Handling
- **Auth errors**: 401 → auto-logout, redirect to /auth
- **API errors**: Toast notification with error message
- **Form validation**: Inline error messages with red border
- **Loading states**: LoadingSkeleton components throughout
- **Empty states**: EmptyState component with actionable CTAs
- **404 routes**: Catch-all redirect to /dashboard

## Open Questions
- Should the mock data layer use localStorage for persistence across refreshes? → Yes, to simulate real behavior
- Should we add a "Moderator" role, or keep it simple with User/Admin? → Keep it simple — User/Admin only initially
- Single-page forms (modal) or dedicated page for podcast CRUD? → Dedicated page for create/edit (better UX for complex forms)
