# Requirements: HabitTracker

**Defined:** 2026-01-28
**Core Value:** Users can track daily habits and see their streaks and completion patterns at a glance -- the daily check-in loop must feel effortless and satisfying.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [ ] **FOUND-01**: Project bootstrapped with Next.js 15 App Router, TypeScript, Tailwind CSS, and shadcn/ui
- [ ] **FOUND-02**: Database connection established with Vercel Postgres and Drizzle ORM
- [ ] **FOUND-03**: Database schema created for habits, completions, and categories tables
- [ ] **FOUND-04**: Seed data populates 3 example habits with historical completions on first run
- [ ] **FOUND-05**: Responsive navigation shell with app layout

### Habit Management

- [ ] **HABIT-01**: User can create a habit with name, description, frequency (daily/weekly/custom days), and color/icon
- [ ] **HABIT-02**: User can edit an existing habit's properties
- [ ] **HABIT-03**: User can archive a habit (soft delete) and it disappears from active views
- [ ] **HABIT-04**: User can reorder habits via drag and drop on both desktop and mobile
- [ ] **HABIT-05**: User can assign categories/tags to habits for grouping
- [ ] **HABIT-06**: User can create and manage categories

### Daily Tracking

- [ ] **TRACK-01**: Dashboard shows today's habits as a checklist with clear visual layout
- [ ] **TRACK-02**: User can mark a habit complete with one tap/click and see immediate visual feedback
- [ ] **TRACK-03**: User can unmark a completed habit to toggle it back to incomplete
- [ ] **TRACK-04**: User can add optional notes when completing a habit
- [ ] **TRACK-05**: Completed, pending, and missed habits have distinct visual styling
- [ ] **TRACK-06**: Dashboard loads efficiently with batched database queries (no N+1)

### Streaks & Statistics

- [ ] **STAT-01**: Each habit displays its current streak (consecutive completions)
- [ ] **STAT-02**: Each habit displays its best streak (all-time record)
- [ ] **STAT-03**: Completion rate shown per habit for last 7 days, 30 days, and all time
- [ ] **STAT-04**: Heatmap calendar view showing completion density (GitHub-style contribution graph)
- [ ] **STAT-05**: Weekly summary view showing habit completion across the week
- [ ] **STAT-06**: Monthly summary view showing habit completion across the month
- [ ] **STAT-07**: Streak calculation correctly handles daily, weekly, and custom-day frequencies

### Analytics

- [ ] **ANLYT-01**: Analytics dashboard shows overall completion rate across all habits
- [ ] **ANLYT-02**: Trend charts visualize completion rate over time
- [ ] **ANLYT-03**: Best performing habits vs struggling habits comparison view
- [ ] **ANLYT-04**: Day-of-week pattern analysis showing which days user is most consistent

### UX & Polish

- [ ] **UX-01**: Responsive design works on mobile, tablet, and desktop (mobile-first)
- [ ] **UX-02**: Dark mode and light mode toggle with system preference detection
- [ ] **UX-03**: Keyboard shortcuts for common actions (complete habit, navigate, create)
- [ ] **UX-04**: Smooth animations and transitions on interactions (toggle, drag, navigation)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Data Management

- **DATA-01**: User can export habit data as CSV or JSON
- **DATA-02**: User can import habits from a backup file

### Enhanced Features

- **ENH-01**: Habit templates library for quick creation
- **ENH-02**: Multiple view options (list, grid, calendar)
- **ENH-03**: Habit reminders via browser notifications

## Out of Scope

| Feature | Reason |
|---------|--------|
| User authentication | Single-user app, no auth needed |
| Social features | Personal tracking only, no sharing or accountability partners |
| Push notifications | Not needed for v1, browser-only app |
| Mobile native app | Web-first, responsive design covers mobile use cases |
| Gamification (points/levels) | Over-engineering, streaks and heatmap provide sufficient motivation |
| AI-powered suggestions | Unclear value for v1, manual habit creation is sufficient |
| Real-time collaboration | Single user, no multi-user scenarios |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 1 | Pending |
| HABIT-01 | Phase 2 | Pending |
| HABIT-02 | Phase 2 | Pending |
| HABIT-03 | Phase 2 | Pending |
| HABIT-04 | Phase 2 | Pending |
| HABIT-05 | Phase 2 | Pending |
| HABIT-06 | Phase 2 | Pending |
| TRACK-01 | Phase 3 | Pending |
| TRACK-02 | Phase 3 | Pending |
| TRACK-03 | Phase 3 | Pending |
| TRACK-04 | Phase 3 | Pending |
| TRACK-05 | Phase 3 | Pending |
| TRACK-06 | Phase 3 | Pending |
| STAT-01 | Phase 4 | Pending |
| STAT-02 | Phase 4 | Pending |
| STAT-03 | Phase 4 | Pending |
| STAT-04 | Phase 4 | Pending |
| STAT-05 | Phase 4 | Pending |
| STAT-06 | Phase 4 | Pending |
| STAT-07 | Phase 4 | Pending |
| ANLYT-01 | Phase 5 | Pending |
| ANLYT-02 | Phase 5 | Pending |
| ANLYT-03 | Phase 5 | Pending |
| ANLYT-04 | Phase 5 | Pending |
| UX-01 | Phase 6 | Pending |
| UX-02 | Phase 6 | Pending |
| UX-03 | Phase 6 | Pending |
| UX-04 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 31 total
- Mapped to phases: 31
- Unmapped: 0

---
*Requirements defined: 2026-01-28*
*Last updated: 2026-01-28 after initial definition*
