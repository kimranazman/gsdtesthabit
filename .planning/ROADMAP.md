# Roadmap: HabitTracker

## Overview

Build a personal habit tracking app from scratch in 6 phases. Start with project foundation and database schema, then add habit management CRUD, followed by the daily tracking loop (the core experience). Layer on streaks and statistics, then analytics visualization, and finish with UX polish. Each phase delivers working, deployable functionality that builds on the previous.

## Phases

- [x] **Phase 1: Foundation & Database** - Project setup, database schema, seed data, navigation shell
- [x] **Phase 2: Habit Management** - Create, edit, archive habits with categories and drag-and-drop reordering
- [x] **Phase 3: Daily Tracking** - Dashboard checklist with one-tap completion, notes, and visual states
- [x] **Phase 4: Streaks & Statistics** - Streak tracking, completion rates, heatmap calendar, summary views
- [x] **Phase 5: Analytics Dashboard** - Overall rates, trend charts, habit comparison, day-of-week patterns
- [ ] **Phase 6: UX Polish** - Dark mode, keyboard shortcuts, animations, responsive refinement

## Phase Details

### Phase 1: Foundation & Database
**Goal**: Bootstrapped Next.js 15 project with database connected, schema defined, seed data, and responsive navigation shell
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05
**Success Criteria** (what must be TRUE):
  1. Next.js 15 app runs locally with TypeScript, Tailwind CSS, and shadcn/ui configured
  2. Drizzle ORM connects to Vercel Postgres and schema is pushed (habits, completions, categories tables)
  3. Running seed script creates 3 example habits with historical completion data
  4. Navigation shell renders with links to dashboard, habits, and analytics pages
  5. App is responsive on mobile and desktop viewports
**Plans**: 3 plans

Plans:
- [x] 01-01: Next.js project setup with TypeScript, Tailwind CSS, and shadcn/ui
- [x] 01-02: Database schema, Drizzle ORM connection, and seed data
- [x] 01-03: Navigation shell and responsive layout

### Phase 2: Habit Management
**Goal**: Full habit CRUD with categories, color/icon selection, and drag-and-drop reordering
**Depends on**: Phase 1
**Requirements**: HABIT-01, HABIT-02, HABIT-03, HABIT-04, HABIT-05, HABIT-06
**Success Criteria** (what must be TRUE):
  1. User can create a new habit with name, description, frequency, color, and icon
  2. User can edit any habit property and see changes immediately
  3. User can archive a habit and it disappears from active views
  4. User can drag habits to reorder them on both desktop and mobile
  5. User can create categories and assign habits to them
**Plans**: 3 plans

Plans:
- [x] 02-01: Habit CRUD with server actions (create, edit, archive)
- [x] 02-02: Category management and habit grouping
- [x] 02-03: Drag-and-drop reordering with @dnd-kit

### Phase 3: Daily Tracking
**Goal**: Dashboard showing today's habits as a checklist with one-tap completion, optimistic UI, notes, and visual distinction between states
**Depends on**: Phase 2
**Requirements**: TRACK-01, TRACK-02, TRACK-03, TRACK-04, TRACK-05, TRACK-06
**Success Criteria** (what must be TRUE):
  1. Dashboard displays today's applicable habits as a checklist
  2. Tapping a habit toggles completion with immediate visual feedback (optimistic UI)
  3. User can add optional notes to a completion entry
  4. Completed, pending, and missed habits have visually distinct styling
  5. Dashboard loads with efficient batched queries (no N+1 pattern)
**Plans**: 3 plans

Plans:
- [x] 03-01: Dashboard page with today's habit checklist
- [x] 03-02: Completion toggle with optimistic UI and server actions
- [x] 03-03: Completion notes and visual state styling

### Phase 4: Streaks & Statistics
**Goal**: Current and best streak per habit, completion rates, GitHub-style heatmap calendar, and weekly/monthly summary views
**Depends on**: Phase 3
**Requirements**: STAT-01, STAT-02, STAT-03, STAT-04, STAT-05, STAT-06, STAT-07
**Success Criteria** (what must be TRUE):
  1. Each habit shows its current streak and best streak
  2. Completion rate is displayed for last 7 days, 30 days, and all time per habit
  3. Heatmap calendar visualizes completion density across the year (GitHub-style)
  4. Weekly and monthly summary views show completion patterns
  5. Streaks calculate correctly for daily, weekly, and custom-day frequencies
**Plans**: 4 plans

Plans:
- [x] 04-01: Streak calculation engine (current streak, best streak, frequency-aware)
- [x] 04-02: Completion rate queries (7d, 30d, all time)
- [x] 04-03: Heatmap calendar view (GitHub-style contribution graph)
- [x] 04-04: Weekly and monthly summary views

### Phase 5: Analytics Dashboard
**Goal**: Analytics page with overall completion rate, trend charts, habit comparison, and day-of-week consistency patterns
**Depends on**: Phase 4
**Requirements**: ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-04
**Success Criteria** (what must be TRUE):
  1. Analytics dashboard shows overall completion rate across all habits
  2. Trend chart visualizes completion rate over time (line or area chart)
  3. Best performing and struggling habits are clearly identified and compared
  4. Day-of-week pattern analysis shows which days user is most consistent
**Plans**: 3 plans

Plans:
- [x] 05-01: Analytics page layout and overall completion rate
- [x] 05-02: Trend charts with recharts (completion over time)
- [x] 05-03: Habit comparison and day-of-week pattern analysis

### Phase 6: UX Polish
**Goal**: Dark/light mode, keyboard shortcuts, smooth animations, and mobile-first responsive refinement
**Depends on**: Phase 5
**Requirements**: UX-01, UX-02, UX-03, UX-04
**Success Criteria** (what must be TRUE):
  1. Dark mode and light mode toggle works with system preference detection
  2. Keyboard shortcuts work for completing habits, navigating, and creating habits
  3. Interactions have smooth animations (toggle, drag, page transitions)
  4. Layout is polished and consistent across mobile, tablet, and desktop
**Plans**: 3 plans

Plans:
- [ ] 06-01: Dark mode / light mode with next-themes
- [ ] 06-02: Keyboard shortcuts for common actions
- [ ] 06-03: Animations, transitions, and responsive polish

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation & Database | 3/3 | Complete | 2026-01-28 |
| 2. Habit Management | 3/3 | Complete | 2026-01-28 |
| 3. Daily Tracking | 3/3 | Complete | 2026-01-28 |
| 4. Streaks & Statistics | 4/4 | Complete | 2026-01-28 |
| 5. Analytics Dashboard | 3/3 | Complete | 2026-01-28 |
| 6. UX Polish | 0/3 | Not started | - |
