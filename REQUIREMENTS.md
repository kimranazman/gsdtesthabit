# Habit Tracker App

A personal habit tracking app with streaks, analytics, and a clean UI. Single user, no auth needed.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- Vercel Postgres + Drizzle ORM
- Deploy to Vercel (auto-deploy from GitHub)

## Core Features

### Habit Management
- Create habits with name, description, frequency (daily/weekly/custom days), and color/icon
- Edit and archive habits (soft delete)
- Reorder habits via drag and drop
- Categories/tags for grouping habits

### Daily Tracking
- Dashboard showing today's habits as a checklist
- One-tap to mark complete/incomplete
- Optional notes per completion
- Visual distinction for completed vs pending vs missed

### Streaks & Stats
- Current streak and best streak per habit
- Completion rate (last 7 days, 30 days, all time)
- Heatmap calendar view (GitHub-style contribution graph)
- Weekly and monthly summary views

### Analytics Dashboard
- Overall completion rate across all habits
- Trend charts (completion over time)
- Best performing habits vs struggling habits
- Day-of-week patterns (which days you're most consistent)

### UX
- Responsive design (mobile-first)
- Dark mode / light mode toggle
- Keyboard shortcuts for power users
- Smooth animations and transitions

## Database
- Vercel Postgres (managed, auto-provisioned via Vercel dashboard)
- Drizzle ORM for type-safe queries and migrations
- Connection via `@vercel/postgres` adapter
- Seed data with 3 example habits on first run
- Run `npx drizzle-kit push` for schema migrations

## Deployment
- GitHub repo auto-deploys to Vercel on push to main
- Vercel Postgres created via Vercel dashboard (Storage tab)
- Environment variables auto-injected by Vercel

## Non-Goals
- No user authentication (single user)
- No social features
- No push notifications
- No mobile native app
