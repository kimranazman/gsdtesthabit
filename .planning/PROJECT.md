# HabitTracker

## What This Is

A personal habit tracking app with streaks, analytics, and a clean UI. Single user, no authentication needed. Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Vercel Postgres, and Drizzle ORM. Deployed to Vercel with auto-deploy from GitHub.

## Core Value

Users can track daily habits and see their streaks and completion patterns at a glance -- the daily check-in loop must feel effortless and satisfying.

## Requirements

### Validated

(None yet -- ship to validate)

### Active

- [ ] Create habits with name, description, frequency (daily/weekly/custom days), and color/icon
- [ ] Edit and archive habits (soft delete)
- [ ] Reorder habits via drag and drop
- [ ] Categories/tags for grouping habits
- [ ] Dashboard showing today's habits as a checklist
- [ ] One-tap to mark complete/incomplete
- [ ] Optional notes per completion
- [ ] Visual distinction for completed vs pending vs missed
- [ ] Current streak and best streak per habit
- [ ] Completion rate (last 7 days, 30 days, all time)
- [ ] Heatmap calendar view (GitHub-style contribution graph)
- [ ] Weekly and monthly summary views
- [ ] Overall completion rate across all habits
- [ ] Trend charts (completion over time)
- [ ] Best performing habits vs struggling habits
- [ ] Day-of-week patterns (which days most consistent)
- [ ] Responsive design (mobile-first)
- [ ] Dark mode / light mode toggle
- [ ] Keyboard shortcuts for power users
- [ ] Smooth animations and transitions
- [ ] Seed data with 3 example habits on first run

### Out of Scope

- User authentication -- single user, not needed
- Social features -- personal tracking only
- Push notifications -- not needed for v1
- Mobile native app -- web-first, responsive design covers mobile
- Real-time collaboration -- single user app

## Context

- Next.js 15 with App Router for modern React Server Components
- Vercel Postgres as managed database, provisioned via Vercel dashboard
- Drizzle ORM for type-safe queries and migrations (`npx drizzle-kit push` for schema migrations)
- Connection via `@vercel/postgres` adapter
- Environment variables auto-injected by Vercel
- shadcn/ui provides accessible, composable UI components on top of Tailwind CSS
- GitHub repo auto-deploys to Vercel on push to main

## Constraints

- **Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Vercel Postgres, Drizzle ORM -- specified and non-negotiable
- **Deployment**: Vercel with auto-deploy from GitHub push to main
- **Database**: Vercel Postgres with Drizzle ORM -- no other database options
- **Single User**: No auth system, no multi-tenancy -- simplifies everything
- **Simplicity**: Default to simpler solutions when multiple options exist

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| No authentication | Single user app, simplifies architecture | -- Pending |
| Vercel Postgres + Drizzle ORM | Type-safe, managed database with good DX | -- Pending |
| shadcn/ui over custom components | Pre-built accessible components, Tailwind-native | -- Pending |
| Soft delete for habits | Preserve historical data, allow recovery | -- Pending |
| Mobile-first responsive design | Most habit tracking happens on phones | -- Pending |

---
*Last updated: 2026-01-28 after initialization*
