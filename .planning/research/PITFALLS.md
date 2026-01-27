# Pitfalls Research

**Domain:** Habit Tracking Web Application
**Researched:** 2026-01-28
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Incorrect Streak Calculation with Timezones

**What goes wrong:**
Streaks break or double-count when the server timezone differs from the user's timezone. A completion at 11pm local time might register as the next day on the server.

**Why it happens:**
Developers use server-side `new Date()` without considering timezone offset. Vercel serverless functions run in UTC.

**How to avoid:**
- Store completion dates as DATE type (no time component), not TIMESTAMP
- Determine "today" on the client side and send the date string to the server
- Use date-fns with consistent date formatting (yyyy-MM-dd)

**Warning signs:**
- Streaks breaking at midnight even when user completed the habit
- Completions showing on wrong day in calendar view

**Phase to address:**
Phase 1 (Database Schema) -- get the date handling right from the start

---

### Pitfall 2: Missing Optimistic UI for Toggle Actions

**What goes wrong:**
Without optimistic updates, toggling a habit completion feels sluggish. The UI waits for the server round-trip before showing the change, leading to a laggy experience.

**Why it happens:**
Next.js server actions naturally wait for completion before re-rendering. Developers skip optimistic UI because it adds complexity.

**How to avoid:**
- Use React's `useOptimistic` hook for the completion toggle
- Show immediate visual feedback (checkbox, animation)
- Revert on error with toast notification

**Warning signs:**
- Noticeable delay between tap and visual change
- Users double-tapping because they're unsure if it registered

**Phase to address:**
Phase 2 (Daily Tracking) -- implement optimistic UI from the start for toggles

---

### Pitfall 3: N+1 Query Problem in Dashboard

**What goes wrong:**
Loading the dashboard queries each habit individually for its completion status and streak, resulting in many database round-trips.

**Why it happens:**
Natural to loop through habits and query each one's status. Works fine with 3 habits, breaks with 20.

**How to avoid:**
- Fetch all habits and their completions for the date range in a single query
- Use Drizzle's relational queries or a JOIN query
- Pre-fetch completion data for the visible date range (today + recent days for streak display)

**Warning signs:**
- Dashboard load time increases linearly with habit count
- Database connection pool exhaustion

**Phase to address:**
Phase 2 (Daily Tracking) -- design queries to be efficient from the start

---

### Pitfall 4: Heatmap Calendar Performance with Large Date Ranges

**What goes wrong:**
Querying a full year of daily completion data for the heatmap is slow when done naively (individual queries per day or per habit).

**Why it happens:**
Heatmap needs 365 days of aggregated data. Without proper query design, this becomes a performance bottleneck.

**How to avoid:**
- Single aggregation query: GROUP BY completed_date, COUNT completions per day
- Cache the heatmap data (ISR or server-side cache)
- Only re-fetch when a completion changes

**Warning signs:**
- Heatmap page takes 2+ seconds to load
- Excessive database queries in serverless function logs

**Phase to address:**
Phase 3 (Streaks & Stats) -- design the aggregation query correctly

---

### Pitfall 5: Drag-and-Drop Breaking on Mobile

**What goes wrong:**
DnD libraries that work on desktop fail on mobile touch devices. Long press conflicts with scroll, ghost elements look wrong, and drop zones are too small.

**Why it happens:**
Desktop DnD and touch DnD have fundamentally different interaction models. Many DnD libraries focus on desktop first.

**How to avoid:**
- Use @dnd-kit which has first-class touch support
- Test on mobile during development, not after
- Add proper touch delay to distinguish drag from scroll
- Ensure drop targets are large enough for fingers (44x44px minimum)

**Warning signs:**
- Cannot drag habits on phone
- Scrolling triggers drag unintentionally
- Items get stuck mid-drag on touch devices

**Phase to address:**
Phase 2 (Daily Tracking) -- implement DnD with mobile testing from the start

---

### Pitfall 6: Empty States Creating Confusion

**What goes wrong:**
New users see blank pages with no habits, no completions, no analytics. They don't know what to do or what the app looks like with data.

**Why it happens:**
Developers build for the "has data" state and forget the empty state experience.

**How to avoid:**
- Seed 3 example habits on first run with some historical completion data
- Design meaningful empty states for every page (illustration + CTA)
- Analytics page should gracefully handle zero data

**Warning signs:**
- First-time user experience is a blank white page
- Analytics page crashes or shows NaN with no data

**Phase to address:**
Phase 1 (Foundation) -- seed data setup, and Phase 5 (Polish) -- empty state designs

---

### Pitfall 7: Habit Frequency Logic Errors

**What goes wrong:**
Weekly and custom-day habits show up on wrong days, or streaks calculate incorrectly for non-daily habits.

**Why it happens:**
Most streak logic assumes daily habits. Weekly habits (e.g., every Monday) and custom days (e.g., Mon/Wed/Fri) need different streak calculation logic.

**How to avoid:**
- Define clear rules: a "weekly" habit's streak counts by applicable days, not calendar days
- A streak breaks only when a scheduled day is missed, not on off-days
- Write explicit tests for each frequency type's streak calculation

**Warning signs:**
- Weekly habit shows as "missed" on non-scheduled days
- Streak resets over a weekend for a weekday-only habit
- "All time" completion rate makes no sense for custom schedules

**Phase to address:**
Phase 1 (Schema design) and Phase 3 (Streak calculation)

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Inline styles for quick fixes | Fast visual fix | Inconsistent design, hard to maintain | Never with Tailwind available |
| Skipping loading states | Less code to write | Janky UX, layout shift | Never -- always add loading.tsx |
| Raw SQL instead of Drizzle | Quick prototyping | Lose type safety, migration issues | Never with Drizzle set up |
| Single file for all actions | Fast to find | Unmanageable after 10+ actions | MVP only, refactor early |
| No error boundaries | Less boilerplate | Entire app crashes on one error | Only in very first prototype |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vercel Postgres | Using direct connection string in serverless | Use @vercel/postgres pooled connection (POSTGRES_URL, not POSTGRES_URL_NON_POOLED) |
| Drizzle + Vercel | Forgetting to export schema for drizzle-kit | Export all tables from schema.ts, reference in drizzle.config.ts |
| shadcn/ui | Installing as npm package | Use `npx shadcn@latest add` to copy components into project |
| next-themes | Flash of wrong theme on load | Add `suppressHydrationWarning` to html element in layout.tsx |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-rendering entire habit list on toggle | Visual jank, slow response | Use React.memo, key props, optimistic updates | 10+ habits |
| Loading full completion history on dashboard | Slow page load | Only load today's data + streak count | 100+ days of data |
| Unoptimized heatmap rendering | Laggy scroll, high CPU | Virtualize or limit to visible months | 365+ days rendered as SVG |
| Chart re-rendering on every state change | Janky animations | useMemo for chart data computation | Complex dashboard views |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing database connection string | Full DB access for attacker | Use env vars, never commit .env files |
| No input validation on server actions | SQL injection or malformed data | Use Zod schemas to validate all inputs |
| No rate limiting on server actions | DoS via rapid form submission | Not critical for single user, but add basic throttle |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No confirmation for destructive actions | Accidental habit deletion | Soft delete (archive), undo option |
| Calendar only shows current month | Can't see historical progress | Show 12-month scrollable heatmap |
| Tiny touch targets on mobile | Frustrating tap experience | Minimum 44x44px touch targets, generous padding |
| No feedback on completion | Unsure if action registered | Satisfying animation + color change on toggle |
| Stats page with no data explanation | Confused about empty numbers | "Complete 7 days of tracking to see trends" message |

## "Looks Done But Isn't" Checklist

- [ ] **Streak calculation:** Often missing custom frequency handling -- verify with Mon/Wed/Fri habit
- [ ] **Heatmap:** Often missing today's date highlight -- verify current day is visually distinct
- [ ] **Dark mode:** Often missing chart/heatmap theme adaptation -- verify charts aren't invisible in dark mode
- [ ] **Mobile layout:** Often missing landscape orientation -- verify on phone rotated sideways
- [ ] **Loading states:** Often missing for data-heavy pages -- verify loading.tsx exists for /analytics
- [ ] **Error handling:** Often missing for failed server actions -- verify offline/error toast appears
- [ ] **Seed data:** Often missing historical completions -- verify heatmap has data on first run

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong date storage (timestamps vs dates) | HIGH | Migration to change column types, recalculate all dates |
| N+1 queries | MEDIUM | Refactor queries, add JOINs, may need schema index changes |
| No optimistic UI | LOW | Add useOptimistic hook to toggle component |
| Bad empty states | LOW | Add conditional rendering with empty state components |
| DnD not working on mobile | MEDIUM | May need to swap DnD library entirely if wrong one chosen |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Timezone streak errors | Phase 1 (Schema) | Unit test: completion at 11pm local = correct date |
| Missing optimistic UI | Phase 2 (Tracking) | Toggle responds < 100ms visually |
| N+1 dashboard queries | Phase 2 (Tracking) | Dashboard loads with single DB round-trip |
| Heatmap performance | Phase 3 (Streaks) | Heatmap loads < 500ms with 365 days |
| Mobile DnD broken | Phase 2 (Tracking) | Drag works on iOS Safari and Chrome Android |
| Empty state confusion | Phase 1 + Phase 5 | First-time user sees seed data and clear CTAs |
| Frequency logic errors | Phase 1 + Phase 3 | Tests pass for daily, weekly, custom schedules |

## Sources

- Next.js App Router known issues and best practices
- @dnd-kit documentation -- mobile touch support
- Vercel Postgres connection pooling documentation
- Community reports on streak calculation edge cases

---
*Pitfalls research for: Habit Tracking Web Application*
*Researched: 2026-01-28*
