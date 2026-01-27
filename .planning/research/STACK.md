# Stack Research

**Domain:** Habit Tracking Web Application
**Researched:** 2026-01-28
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 15.x | Full-stack React framework | App Router with RSC, server actions, built-in API routes. Industry standard for Vercel deployment |
| TypeScript | 5.x | Type safety | Catches errors at build time, essential for Drizzle ORM type inference |
| React | 19.x | UI library | Ships with Next.js 15, server components reduce client bundle |
| Tailwind CSS | 3.x | Utility-first styling | Rapid UI development, built-in dark mode support, pairs with shadcn/ui |
| shadcn/ui | latest | Component library | Not a dependency -- copies components into project. Accessible, customizable, Tailwind-native |
| Vercel Postgres | latest | Managed PostgreSQL | Zero-config with Vercel deployment, auto-provisioned connection strings |
| Drizzle ORM | 0.36.x | Type-safe database ORM | Lightweight, SQL-like syntax, excellent TypeScript inference, built-in migration tooling |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @vercel/postgres | latest | Postgres adapter | Connection pooling for Vercel Postgres, required adapter |
| drizzle-kit | latest | Migration tooling | Schema push with `npx drizzle-kit push`, generates migrations |
| date-fns | 3.x | Date manipulation | Streak calculations, calendar views, date formatting |
| recharts | 2.x | Charts and graphs | Trend charts, completion rate visualization, responsive charts |
| @dnd-kit/core | 6.x | Drag and drop | Habit reordering, accessible DnD with keyboard support |
| @dnd-kit/sortable | 8.x | Sortable lists | Built on @dnd-kit/core for list reordering |
| lucide-react | latest | Icon library | shadcn/ui default icons, clean and consistent |
| next-themes | latest | Theme management | Dark/light mode toggle with system preference detection |
| react-activity-calendar | latest | Heatmap calendar | GitHub-style contribution graph, customizable colors |
| clsx + tailwind-merge | latest | Class utilities | Conditional Tailwind classes, used by shadcn/ui |
| zod | 3.x | Schema validation | Form validation, server action input validation |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Linting | Ships with Next.js, use default config |
| Prettier | Formatting | Add tailwindcss plugin for class sorting |
| drizzle-kit | DB tooling | `npx drizzle-kit push` for schema sync, `npx drizzle-kit studio` for DB browser |

## Installation

```bash
# Core
npx create-next-app@latest --typescript --tailwind --eslint --app --src-dir

# Database
npm install drizzle-orm @vercel/postgres
npm install -D drizzle-kit

# UI Components (shadcn/ui init, then add components individually)
npx shadcn@latest init
npx shadcn@latest add button card checkbox input dialog dropdown-menu

# Supporting
npm install date-fns recharts @dnd-kit/core @dnd-kit/sortable lucide-react next-themes zod clsx tailwind-merge

# Dev dependencies
npm install -D prettier prettier-plugin-tailwindcss @types/node
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Drizzle ORM | Prisma | If you prefer declarative schema and don't mind heavier bundle |
| shadcn/ui | Radix UI directly | If you want full control without pre-styled components |
| recharts | Chart.js / react-chartjs-2 | If you need canvas-based rendering for very large datasets |
| @dnd-kit | react-beautiful-dnd | Never -- react-beautiful-dnd is deprecated and unmaintained |
| date-fns | dayjs | If you prefer chainable API; date-fns is more tree-shakeable |
| Vercel Postgres | Neon Postgres | If not deploying to Vercel; Neon is the underlying provider |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| react-beautiful-dnd | Deprecated, no React 18+ support | @dnd-kit |
| moment.js | Huge bundle, mutable API, legacy | date-fns |
| styled-components | Unnecessary with Tailwind, SSR complexity | Tailwind CSS |
| Redux | Overkill for single-user app with server components | React Server Components + server actions |
| Prisma | Heavier runtime, slower cold starts on serverless | Drizzle ORM |
| mongoose/MongoDB | Relational data (habits, completions, streaks) fits SQL better | PostgreSQL |

## Stack Patterns by Variant

**For server-side data fetching (default):**
- Use React Server Components to fetch data directly in components
- Use server actions for mutations (create, update, delete)
- No client-side state management library needed

**For interactive client components (drag-and-drop, charts):**
- Mark with "use client" directive
- Use React state for local UI state
- Fetch data via server components, pass as props

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| Next.js 15.x | React 19.x | Next.js 15 ships with React 19 |
| Drizzle ORM 0.36.x | @vercel/postgres latest | Use drizzle-orm/vercel-postgres adapter |
| shadcn/ui latest | Tailwind CSS 3.x | shadcn/ui v2 supports Tailwind v3; v4 support in progress |
| @dnd-kit 6.x | React 19.x | Fully compatible |
| recharts 2.x | React 19.x | Stable with React 19 |

## Sources

- Next.js official documentation -- App Router, Server Components, Server Actions
- Drizzle ORM documentation -- Vercel Postgres adapter setup
- shadcn/ui documentation -- Installation and component usage
- Vercel documentation -- Postgres setup and environment variables

---
*Stack research for: Habit Tracking Web Application*
*Researched: 2026-01-28*
