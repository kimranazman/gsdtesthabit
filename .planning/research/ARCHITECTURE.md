# Architecture Research

**Domain:** Habit Tracking Web Application
**Researched:** 2026-01-28
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Presentation Layer                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │Dashboard │  │ Habits   │  │Analytics │  │ Settings │    │
│  │  Page    │  │  CRUD    │  │  Page    │  │  Page    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
│       │              │              │              │          │
├───────┴──────────────┴──────────────┴──────────────┴─────────┤
│                       Server Actions Layer                    │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐    │
│  │              Drizzle ORM (Type-safe queries)          │    │
│  └──────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                        Data Layer                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │ habits   │  │completions│  │categories│                   │
│  └──────────┘  └──────────┘  └──────────┘                   │
└─────────────────────────────────────────────────────────────┘
                         │
                  Vercel Postgres
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Dashboard Page | Today's habit checklist, quick completion toggle | Server Component fetching today's habits + Client Component for interactions |
| Habits Management | CRUD for habits, categories, reordering | Mix of Server Components (list) and Client Components (forms, DnD) |
| Analytics Page | Charts, heatmap, completion rates | Server Component for data aggregation + Client Component for chart rendering |
| Settings Page | Theme toggle, seed data trigger | Client Component for preferences |
| Server Actions | Mutations (create, update, delete, toggle) | Next.js server actions in dedicated files |
| Data Access | Type-safe database queries | Drizzle ORM queries, shared across server actions and pages |
| Database Schema | Data structure and relationships | Drizzle schema definitions with proper indexes |

## Recommended Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (theme provider, nav)
│   ├── page.tsx                # Dashboard (today's habits)
│   ├── habits/
│   │   ├── page.tsx            # Habit management (list, create)
│   │   └── [id]/
│   │       └── page.tsx        # Edit habit
│   ├── analytics/
│   │   └── page.tsx            # Analytics dashboard
│   └── globals.css             # Tailwind imports
├── components/                 # Shared UI components
│   ├── ui/                     # shadcn/ui components (auto-generated)
│   ├── habits/                 # Habit-specific components
│   │   ├── habit-card.tsx      # Single habit display
│   │   ├── habit-form.tsx      # Create/edit form
│   │   ├── habit-list.tsx      # Sortable habit list
│   │   └── completion-toggle.tsx # One-tap toggle button
│   ├── analytics/              # Analytics-specific components
│   │   ├── heatmap.tsx         # GitHub-style heatmap
│   │   ├── streak-card.tsx     # Streak display
│   │   ├── completion-chart.tsx # Trend chart
│   │   └── stats-card.tsx      # Summary statistics
│   ├── layout/                 # Layout components
│   │   ├── navbar.tsx          # Navigation bar
│   │   └── theme-toggle.tsx    # Dark/light mode toggle
│   └── providers.tsx           # Theme provider wrapper
├── lib/                        # Shared utilities
│   ├── db/
│   │   ├── index.ts            # Database connection (Drizzle + Vercel Postgres)
│   │   ├── schema.ts           # Drizzle schema definitions
│   │   └── seed.ts             # Seed data (3 example habits)
│   ├── actions/                # Server actions
│   │   ├── habits.ts           # Habit CRUD actions
│   │   ├── completions.ts      # Completion toggle actions
│   │   └── categories.ts       # Category management actions
│   ├── queries/                # Read-only data fetching
│   │   ├── habits.ts           # Habit queries
│   │   ├── completions.ts      # Completion/streak queries
│   │   └── analytics.ts        # Analytics aggregation queries
│   └── utils.ts                # Shared utilities (date helpers, cn())
├── hooks/                      # Custom React hooks
│   └── use-keyboard-shortcuts.ts
└── types/                      # TypeScript type definitions
    └── index.ts                # Shared types
```

### Structure Rationale

- **app/:** Next.js App Router convention. Each route is a folder with page.tsx
- **components/:** Feature-grouped components. shadcn/ui in components/ui/ (convention)
- **lib/db/:** Database concerns isolated. Schema, connection, and seed data together
- **lib/actions/:** Server actions separated by domain. Easy to find and test
- **lib/queries/:** Read-only queries separated from mutations. Server Components import these directly
- **hooks/:** Client-side hooks for interactive features (keyboard shortcuts)

## Architectural Patterns

### Pattern 1: Server Components with Client Islands

**What:** Default to Server Components. Use Client Components only for interactivity.
**When to use:** Every page in this app.
**Trade-offs:** Smaller client bundle, faster initial load. But Client Components can't use async/await directly.

**Example:**
```typescript
// app/page.tsx (Server Component - fetches data)
export default async function Dashboard() {
  const habits = await getHabitsForToday();
  return <HabitChecklist habits={habits} />;
}

// components/habits/habit-checklist.tsx (Client Component - handles interactions)
"use client";
export function HabitChecklist({ habits }) {
  // handles toggle, drag-drop, animations
}
```

### Pattern 2: Server Actions for Mutations

**What:** Use Next.js server actions instead of API routes for all data mutations.
**When to use:** Every create, update, delete, and toggle operation.
**Trade-offs:** Simpler than API routes, automatic form handling, but less flexible for external API consumers (not needed here).

**Example:**
```typescript
// lib/actions/completions.ts
"use server";
export async function toggleCompletion(habitId: string, date: string) {
  // Insert or delete completion record
  // Revalidate the dashboard path
  revalidatePath("/");
}
```

### Pattern 3: Computed Streaks (Query-time Calculation)

**What:** Calculate streaks from completion records at query time rather than storing streak counts.
**When to use:** For a single-user app with modest data volume.
**Trade-offs:** Simpler data model, always accurate. Slower for large datasets (not an issue for single user).

**Example:**
```typescript
// lib/queries/completions.ts
export async function getStreak(habitId: string) {
  // Query completions ordered by date desc
  // Count consecutive days from today backwards
  // Also track best streak across all time
}
```

## Data Flow

### Request Flow (Reading Data)

```
[Browser Request]
    ↓
[Next.js Server Component] → [Drizzle Query] → [Vercel Postgres]
    ↓                                               ↓
[Rendered HTML] ←────── [Server-rendered data] ←──── [Query result]
    ↓
[Hydrate Client Components]
```

### Mutation Flow (Writing Data)

```
[User Action (click toggle)]
    ↓
[Client Component] → [Server Action call] → [Drizzle mutation] → [Vercel Postgres]
    ↓                                                                    ↓
[Optimistic UI update]                                           [Data persisted]
    ↓                                                                    ↓
[revalidatePath()] ← ── ── ── ── ── ── ── ── ── ── ── ── ── ── [Revalidate]
    ↓
[Fresh server data replaces optimistic]
```

### Key Data Flows

1. **Daily checklist load:** Server Component queries today's habits with their completion status, renders checklist. Client Component handles toggle interactions.
2. **Toggle completion:** Client calls server action, optimistic UI update, server inserts/deletes completion record, revalidates path.
3. **Analytics load:** Server Component runs aggregation queries (streaks, rates, heatmap data), passes to Client Components for chart rendering.

## Database Schema

### Core Tables

```
habits
├── id (uuid, PK)
├── name (text, NOT NULL)
├── description (text)
├── frequency (text: 'daily' | 'weekly' | 'custom')
├── frequency_days (integer[] -- for custom: [0,1,2,3,4,5,6] where 0=Sun)
├── color (text -- hex color)
├── icon (text -- lucide icon name)
├── category_id (uuid, FK -> categories.id, nullable)
├── position (integer -- for drag-and-drop ordering)
├── archived (boolean, default false -- soft delete)
├── created_at (timestamp)
└── updated_at (timestamp)

completions
├── id (uuid, PK)
├── habit_id (uuid, FK -> habits.id)
├── completed_date (date, NOT NULL)
├── notes (text, nullable)
├── created_at (timestamp)
└── UNIQUE(habit_id, completed_date)

categories
├── id (uuid, PK)
├── name (text, NOT NULL)
├── color (text)
└── created_at (timestamp)
```

### Key Indexes

- `completions(habit_id, completed_date)` -- streak calculation, daily lookup
- `habits(archived, position)` -- active habits in order
- `habits(category_id)` -- filter by category

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1 user (our case) | Current architecture is more than sufficient. Query-time streak calculation is fine |
| 1-100 users | Add auth, per-user data isolation. Still fine with current stack |
| 100+ users | Materialized streak views, background jobs for analytics, connection pooling |

### Scaling Priorities

1. **First bottleneck:** Streak calculation on large date ranges. Fix: Cache computed values or add materialized view
2. **Second bottleneck:** Analytics aggregation queries. Fix: Pre-compute daily rollups

## Anti-Patterns

### Anti-Pattern 1: Storing Streak Count in Habits Table

**What people do:** Add `current_streak` and `best_streak` columns to habits table
**Why it's wrong:** Gets out of sync when completions are edited/deleted, requires update triggers
**Do this instead:** Calculate from completions table. For single user, this is fast enough

### Anti-Pattern 2: Client-Side Data Fetching for Everything

**What people do:** Use useEffect + fetch for all data loading
**Why it's wrong:** Misses the entire benefit of Next.js App Router server components
**Do this instead:** Fetch in Server Components, pass data to Client Components as props

### Anti-Pattern 3: Single Massive Page Component

**What people do:** Put dashboard, habits, analytics all on one page
**Why it's wrong:** Slow initial load, poor code organization, can't leverage route-based code splitting
**Do this instead:** Separate routes for dashboard, habits management, and analytics

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Vercel Postgres | @vercel/postgres adapter via Drizzle | Connection string auto-injected as env var |
| Vercel (hosting) | Git push to deploy | Auto-deploy from main branch |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Server Components <-> Client Components | Props | Data flows down, actions flow up |
| Client Components <-> Server Actions | Function calls | Direct import and call |
| Server Actions <-> Database | Drizzle ORM queries | Type-safe, no raw SQL needed |

## Sources

- Next.js App Router documentation -- Server Components, Server Actions patterns
- Drizzle ORM documentation -- Schema definition, query patterns
- Vercel Postgres documentation -- Connection setup, adapter usage
- shadcn/ui documentation -- Project structure conventions

---
*Architecture research for: Habit Tracking Web Application*
*Researched: 2026-01-28*
