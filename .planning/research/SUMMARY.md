# Project Research Summary

**Project:** HabitTracker
**Domain:** Habit Tracking Web Application
**Researched:** 2026-01-28
**Confidence:** HIGH

## Executive Summary

HabitTracker is a personal habit tracking web app with streaks, analytics, and a clean UI. The domain is well-established with clear patterns: habit CRUD, daily completion tracking, streak calculation, and visualization through heatmaps and charts. The tech stack (Next.js 15, TypeScript, Tailwind, shadcn/ui, Vercel Postgres, Drizzle ORM) is modern, well-documented, and optimized for Vercel deployment.

The recommended approach is to build foundation-first: database schema and project setup, then daily tracking (the core loop), then streaks and visualization, then analytics, and finally polish. The critical path is getting the daily check-in experience right -- this is the action users perform most frequently and must feel effortless.

Key risks are timezone-related streak calculation errors (store dates not timestamps), N+1 query patterns on the dashboard (batch queries from the start), and mobile DnD compatibility (use @dnd-kit with touch support). All are preventable with correct initial architecture choices.

## Key Findings

### Recommended Stack

The stack is prescribed by requirements and is an excellent fit for this domain. Next.js 15 App Router with Server Components handles data fetching efficiently, server actions simplify mutations, and Vercel Postgres + Drizzle ORM provide type-safe database access with zero-config deployment.

**Core technologies:**
- Next.js 15: Full-stack framework with App Router, RSC, server actions -- ideal for Vercel deployment
- Drizzle ORM + Vercel Postgres: Lightweight type-safe ORM with managed PostgreSQL -- fast cold starts
- shadcn/ui + Tailwind CSS: Accessible components with utility styling -- rapid UI development with dark mode

**Key supporting libraries:**
- date-fns: Tree-shakeable date manipulation for streaks and calendar
- recharts: React-native charts for analytics dashboard
- @dnd-kit: Accessible drag-and-drop with first-class touch support
- next-themes: Dark/light mode with system preference detection

### Expected Features

**Must have (table stakes):**
- Habit CRUD (create, edit, archive) -- unusable without it
- Daily checklist with one-tap completion -- primary interaction
- Current and best streak per habit -- core motivator
- Completion rates (7d, 30d, all time) -- basic progress tracking
- Mobile-responsive design -- most habit tracking on phones

**Should have (competitive):**
- GitHub-style heatmap calendar -- visual motivation, key differentiator
- Analytics dashboard with trend charts -- data-driven habit building
- Drag-and-drop reordering -- personalized experience
- Dark/light mode -- modern UX standard
- Categories/tags -- organization at scale

**Defer (v2+):**
- Data export -- when portability matters
- Habit templates -- if users want quick starts

### Architecture Approach

Server Components by default with Client Component "islands" for interactivity (toggle, DnD, charts). Server actions for all mutations. Drizzle ORM queries in dedicated files. Three core tables: habits, completions, categories. Streaks calculated at query time (sufficient for single user). Routes: dashboard (/), habits management (/habits), analytics (/analytics).

**Major components:**
1. Dashboard Page -- today's checklist, primary daily interaction
2. Habits Management -- CRUD, categories, drag-and-drop ordering
3. Analytics Page -- heatmap, charts, completion rates, patterns
4. Database Layer -- Drizzle schema, queries, server actions
5. UI Shell -- Navigation, theme toggle, responsive layout

### Critical Pitfalls

1. **Timezone streak errors** -- store completion dates as DATE type, determine "today" client-side
2. **Missing optimistic UI** -- use useOptimistic for toggle, show immediate feedback
3. **N+1 dashboard queries** -- batch-fetch habits + completions in single query
4. **Heatmap performance** -- single aggregation query, GROUP BY completed_date
5. **Habit frequency logic** -- streaks for weekly/custom habits need different calculation than daily

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation & Database
**Rationale:** Everything depends on the database schema and project setup. Get dates and schema right first.
**Delivers:** Next.js project with database connection, schema, seed data, basic layout
**Addresses:** Project setup, database schema, seed data, navigation shell
**Avoids:** Timezone pitfall by using DATE type from the start

### Phase 2: Habit Management
**Rationale:** Cannot track habits without habits to track. CRUD is prerequisite for everything.
**Delivers:** Create, edit, archive habits with categories, drag-and-drop reordering
**Addresses:** Habit CRUD, categories/tags, drag-and-drop, soft delete
**Avoids:** Mobile DnD pitfall by using @dnd-kit with touch support

### Phase 3: Daily Tracking
**Rationale:** The core daily loop. Most important UX to get right.
**Delivers:** Dashboard with today's checklist, one-tap toggle, completion notes, visual states
**Addresses:** Daily checklist, completion toggle, notes, completed/pending/missed states
**Avoids:** N+1 queries and missing optimistic UI pitfalls

### Phase 4: Streaks & Statistics
**Rationale:** Requires completion data from Phase 3. The motivational layer.
**Delivers:** Streak tracking, completion rates, heatmap calendar, summary views
**Addresses:** Current/best streaks, completion rates, heatmap, weekly/monthly views
**Avoids:** Heatmap performance and frequency logic pitfalls

### Phase 5: Analytics Dashboard
**Rationale:** Requires historical data patterns. Visualization and insights layer.
**Delivers:** Overall rates, trend charts, best/struggling habits, day-of-week patterns
**Addresses:** Analytics overview, trend visualization, habit comparison, consistency patterns

### Phase 6: Polish & UX
**Rationale:** Core features must work before polishing. Refinement layer.
**Delivers:** Dark mode, keyboard shortcuts, animations, responsive refinement
**Addresses:** Theme toggle, keyboard shortcuts, smooth transitions, mobile optimization

### Phase Ordering Rationale

- Foundation first: schema and setup are prerequisites for all features
- Habit management before tracking: need habits to exist before tracking them
- Tracking before stats: need completion data to calculate streaks
- Stats before analytics: analytics builds on streak/rate calculations
- Polish last: core must work before refinement

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4:** Streak calculation for non-daily habits needs careful algorithm design
- **Phase 5:** recharts configuration for specific chart types needs API research

Phases with standard patterns (skip research-phase):
- **Phase 1:** Standard Next.js + Drizzle setup, well-documented
- **Phase 2:** Standard CRUD with @dnd-kit, established patterns
- **Phase 6:** Tailwind dark mode and CSS animations, well-documented

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Prescribed stack, all libraries well-documented and compatible |
| Features | HIGH | Habit tracking is a well-understood domain with clear patterns |
| Architecture | HIGH | Standard Next.js App Router patterns, no exotic requirements |
| Pitfalls | HIGH | Common issues well-documented in community |

**Overall confidence:** HIGH

### Gaps to Address

- Specific recharts chart types for analytics: resolve during Phase 5 planning
- react-activity-calendar vs custom heatmap: evaluate during Phase 4 planning
- Exact seed data content: define during Phase 1 execution

## Sources

### Primary (HIGH confidence)
- Next.js 15 documentation -- App Router, Server Components, Server Actions
- Drizzle ORM documentation -- Schema, queries, Vercel Postgres adapter
- shadcn/ui documentation -- Installation, component catalog
- Vercel documentation -- Postgres setup, deployment

### Secondary (MEDIUM confidence)
- @dnd-kit documentation -- Sortable, touch support
- recharts documentation -- Chart types, responsive containers
- Loop Habit Tracker (open source) -- Heatmap and streak patterns

### Tertiary (LOW confidence)
- Community best practices for streak calculation edge cases

---
*Research completed: 2026-01-28*
*Ready for roadmap: yes*
