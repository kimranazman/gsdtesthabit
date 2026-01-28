# Roadmap: HabitTracker — Milestone 2: Enhanced Mobile UX & Gamification

## Overview

Elevate the habit tracker with swipe gestures, Framer Motion animations, gamification (XP, levels, achievements), mobile-optimized bottom navigation, and delightful micro-interactions. Each phase builds on the existing v1 app to create an engaging, mobile-first experience that makes habit tracking addictive.

## Phases

- [x] **Phase 7: Framer Motion & Page Transitions** - Install framer-motion, animated page transitions, layout animations, micro-interactions
- [x] **Phase 8: Swipe Gestures** - Swipe-to-complete on dashboard, swipe-to-reveal actions on habit cards, pull-to-refresh feel
- [x] **Phase 9: Gamification Engine** - XP system, levels, achievements, streak milestones with database schema
- [x] **Phase 10: Gamification UI & Celebrations** - Level-up animations, achievement toasts, confetti effects, progress rings
- [x] **Phase 11: Mobile Bottom Navigation & Polish** - Bottom nav bar for mobile, haptic-style feedback, touch-optimized spacing, final polish

## Phase Details

### Phase 7: Framer Motion & Page Transitions
**Goal**: Replace CSS animations with Framer Motion for fluid page transitions, staggered list animations, and interactive micro-interactions across the entire app
**Depends on**: Phase 6 (Milestone 1 complete)
**Requirements**: Enhanced animations, smooth transitions, mobile-first feel
**Success Criteria** (what must be TRUE):
  1. framer-motion is installed and AnimatePresence wraps route transitions
  2. Dashboard habit list uses staggered entrance animations with framer-motion
  3. Habit completion toggle has a satisfying spring animation (scale + color)
  4. Cards and dialogs animate in/out with smooth opacity and scale transitions
  5. Analytics charts fade in with staggered delays
  6. All animations respect prefers-reduced-motion
**Plans**: 3 plans

Plans:
- [x] 07-01: Install framer-motion, create motion wrapper components, page transition layout
- [x] 07-02: Dashboard and habit list staggered animations with spring physics
- [x] 07-03: Dialog/sheet/card entrance animations and analytics chart transitions

### Phase 8: Swipe Gestures
**Goal**: Touch-friendly swipe gestures on the dashboard for completing habits, revealing actions, and navigating between days
**Depends on**: Phase 7
**Requirements**: Swipe interactions, mobile-first UX, gesture-driven actions
**Success Criteria** (what must be TRUE):
  1. Swiping right on a habit card completes it with a green sweep animation
  2. Swiping left on a habit card reveals action buttons (notes, skip)
  3. Swipe between days on the dashboard (previous day / next day navigation)
  4. Visual indicators show swipe direction and threshold (color change on drag)
  5. Gestures work smoothly on both iOS and Android mobile browsers
  6. Desktop still works with click-based interactions (graceful fallback)
**Plans**: 3 plans

Plans:
- [x] 08-01: Swipeable habit card component with right-swipe to complete
- [x] 08-02: Left-swipe reveal actions (notes, skip) with spring-back
- [x] 08-03: Day navigation swipe and gesture polish

### Phase 9: Gamification Engine
**Goal**: Backend gamification system with XP points, levels, achievements, and streak milestones tracked in the database
**Depends on**: Phase 7
**Requirements**: XP, levels, achievements, streak rewards
**Success Criteria** (what must be TRUE):
  1. Database schema includes user_stats (XP, level) and achievements tables
  2. Completing a habit awards XP (10 base + streak bonus)
  3. XP thresholds define levels (1-50) with increasing requirements
  4. Achievement system triggers on milestones (first habit, 7-day streak, 30-day streak, 100 completions, etc.)
  5. Server actions return gamification events (level_up, achievement_unlocked, xp_gained) alongside completion responses
  6. At least 12 achievements defined covering streaks, completions, and variety
**Plans**: 3 plans

Plans:
- [x] 09-01: Gamification database schema (user_stats, achievements tables) and XP/level calculations
- [x] 09-02: XP award system integrated into completion server actions
- [x] 09-03: Achievement definitions and trigger engine (12+ achievements)

### Phase 10: Gamification UI & Celebrations
**Goal**: Visual gamification layer with XP progress bar, level display, achievement toasts, confetti on level-ups, and celebration animations
**Depends on**: Phase 8, Phase 9
**Requirements**: Celebration animations, visual rewards, engagement feedback
**Success Criteria** (what must be TRUE):
  1. XP progress bar shows current XP and progress to next level in the navbar/header
  2. Level-up triggers a full-screen celebration animation (confetti + level badge)
  3. Achievement unlocks show an animated toast notification with the achievement icon and description
  4. Dashboard shows daily XP earned and current streak bonus multiplier
  5. Achievements page displays all achievements (locked and unlocked) in a grid
  6. Completing a habit shows +XP floating number animation
**Plans**: 3 plans

Plans:
- [x] 10-01: XP progress bar, level display in header, and +XP floating animation
- [x] 10-02: Level-up celebration with confetti and achievement toast notifications
- [x] 10-03: Achievements page with locked/unlocked grid and daily XP summary

### Phase 11: Mobile Bottom Navigation & Polish
**Goal**: Mobile-optimized bottom navigation bar, haptic-style feedback, refined touch targets, and final visual polish for a native-app feel
**Depends on**: Phase 10
**Requirements**: Bottom nav, native-app feel, final polish
**Success Criteria** (what must be TRUE):
  1. Bottom navigation bar appears on mobile (replaces top nav links) with Dashboard, Habits, Analytics, Achievements tabs
  2. Active tab has animated indicator (sliding underline or filled icon)
  3. Tap feedback on interactive elements (scale pulse on touch)
  4. Safe area insets handled for iOS notch/home bar
  5. PWA manifest with app icon for add-to-homescreen
  6. Final visual consistency pass — spacing, typography, color harmony across all pages
**Plans**: 3 plans

Plans:
- [x] 11-01: Bottom navigation bar for mobile with animated active indicator
- [x] 11-02: Tap feedback, safe area insets, and PWA manifest
- [x] 11-03: Visual consistency pass — spacing, typography, and color harmony

## Progress

**Execution Order:**
Phase 7 → Phase 8 + Phase 9 (parallel) → Phase 10 → Phase 11

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 7. Framer Motion & Page Transitions | 3/3 | Complete | 2026-01-28 |
| 8. Swipe Gestures | 3/3 | Complete | 2026-01-28 |
| 9. Gamification Engine | 3/3 | Complete | 2026-01-28 |
| 10. Gamification UI & Celebrations | 3/3 | Complete | 2026-01-28 |
| 11. Mobile Bottom Nav & Polish | 3/3 | Complete | 2026-01-28 |
