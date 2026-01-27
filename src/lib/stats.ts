/**
 * Streak & Statistics calculation engine.
 *
 * All calculations are frequency-aware:
 * - daily: every calendar day counts
 * - weekly: one completion per ISO week is expected
 * - custom: only the specified days of the week count
 *
 * Completion rate = completed / expected
 */

import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  eachWeekOfInterval,
  subDays,
  subWeeks,
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  isAfter,
} from "date-fns";
import type { Habit } from "@/lib/db/schema";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse a "YYYY-MM-DD" string into a Date at noon (timezone-safe) */
function toDate(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00");
}

/** Format a Date as "YYYY-MM-DD" */
function toDateStr(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/** Get the ISO week key for a date, e.g. "2026-W05" */
function weekKey(date: Date): string {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  return format(weekStart, "yyyy-'W'II");
}

// ---------------------------------------------------------------------------
// Streak calculations
// ---------------------------------------------------------------------------

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
}

/**
 * Calculate current streak and best streak for a habit.
 *
 * Streaks are frequency-aware:
 * - daily: count consecutive calendar days with completions
 * - weekly: count consecutive weeks with at least one completion
 * - custom: count consecutive applicable days (based on frequencyDays) with completions
 *
 * The current streak counts backwards from today.
 * If today is an applicable day and not yet completed, the streak counts from yesterday.
 * If today IS completed, it counts from today.
 */
export function calculateStreaks(
  habit: Habit,
  completionDates: string[], // sorted ascending "YYYY-MM-DD"
  today: Date = new Date()
): StreakResult {
  if (completionDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  const completionSet = new Set(completionDates);
  const todayStr = toDateStr(today);

  if (habit.frequency === "weekly") {
    return calculateWeeklyStreaks(completionDates, today);
  }

  // For daily and custom: work with applicable days
  // Build list of all applicable days from habit creation to today
  const habitStart = habit.createdAt ? new Date(habit.createdAt) : toDate(completionDates[0]);
  const startDate = habitStart > today ? today : habitStart;

  // Get all applicable days sorted descending (most recent first) for current streak
  const applicableDays = getApplicableDatesForStreak(habit, startDate, today);

  if (applicableDays.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Calculate current streak (from most recent applicable day backward)
  let currentStreak = 0;
  const sortedDesc = [...applicableDays].sort(
    (a, b) => b.getTime() - a.getTime()
  );

  for (const day of sortedDesc) {
    const dayStr = toDateStr(day);
    // Skip today if it's not yet completed (grace period)
    if (dayStr === todayStr && !completionSet.has(dayStr)) {
      continue;
    }
    if (completionSet.has(dayStr)) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Calculate best streak (scan chronologically)
  let bestStreak = 0;
  let tempStreak = 0;
  const sortedAsc = [...applicableDays].sort(
    (a, b) => a.getTime() - b.getTime()
  );

  for (const day of sortedAsc) {
    const dayStr = toDateStr(day);
    if (completionSet.has(dayStr)) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, bestStreak };
}

function getApplicableDatesForStreak(
  habit: Habit,
  start: Date,
  end: Date
): Date[] {
  const allDays = eachDayOfInterval({ start, end });
  if (habit.frequency === "daily") return allDays;
  if (habit.frequency === "custom" && habit.frequencyDays) {
    return allDays.filter((d) => habit.frequencyDays!.includes(d.getDay()));
  }
  return allDays;
}

function calculateWeeklyStreaks(
  completionDates: string[],
  today: Date
): StreakResult {
  if (completionDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Group completions by ISO week
  const weekCompletions = new Set<string>();
  for (const dateStr of completionDates) {
    weekCompletions.add(weekKey(toDate(dateStr)));
  }

  // Current streak: count consecutive weeks backward from current week
  let currentStreak = 0;
  let checkDate = today;
  const currentWeekKey = weekKey(today);

  // If current week doesn't have a completion, start from previous week
  if (!weekCompletions.has(currentWeekKey)) {
    checkDate = subWeeks(today, 1);
  }

  while (true) {
    const wk = weekKey(checkDate);
    if (weekCompletions.has(wk)) {
      currentStreak++;
      checkDate = subWeeks(checkDate, 1);
    } else {
      break;
    }
  }

  // Best streak: scan all weeks chronologically
  const firstDate = toDate(completionDates[0]);
  const weeks = eachWeekOfInterval(
    { start: firstDate, end: today },
    { weekStartsOn: 1 }
  );

  let bestStreak = 0;
  let tempStreak = 0;
  for (const w of weeks) {
    if (weekCompletions.has(weekKey(w))) {
      tempStreak++;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, bestStreak };
}

// ---------------------------------------------------------------------------
// Completion rate calculations
// ---------------------------------------------------------------------------

export interface CompletionRateResult {
  completed: number;
  expected: number;
  rate: number; // 0-1
  percentage: number; // 0-100
}

/**
 * Calculate the completion rate for a habit over a specific number of past days.
 *
 * For daily habits: expected = number of days in range
 * For weekly habits: expected = number of weeks in range
 * For custom habits: expected = number of applicable days in range
 */
export function calculateCompletionRate(
  habit: Habit,
  completionDates: string[],
  days: number | "all",
  today: Date = new Date()
): CompletionRateResult {
  const todayDate = today;
  let startDate: Date;

  if (days === "all") {
    // Use habit creation date or first completion
    const habitCreated = habit.createdAt ? new Date(habit.createdAt) : null;
    const firstCompletion = completionDates.length > 0 ? toDate(completionDates[0]) : null;
    startDate = habitCreated || firstCompletion || todayDate;
  } else {
    startDate = subDays(todayDate, days - 1);
  }

  // Ensure startDate isn't after today
  if (isAfter(startDate, todayDate)) {
    return { completed: 0, expected: 0, rate: 0, percentage: 0 };
  }

  // Don't count days before habit was created
  const habitCreated = habit.createdAt ? new Date(habit.createdAt) : null;
  if (habitCreated && isAfter(habitCreated, startDate)) {
    startDate = habitCreated;
  }

  const startStr = toDateStr(startDate);
  const endStr = toDateStr(todayDate);

  // Count completions in range
  const completionsInRange = completionDates.filter(
    (d) => d >= startStr && d <= endStr
  );

  // Calculate expected
  let expected: number;

  if (habit.frequency === "weekly") {
    const weeks = eachWeekOfInterval(
      { start: startDate, end: todayDate },
      { weekStartsOn: 1 }
    );
    expected = weeks.length;
    // For weekly, count unique weeks with completions
    const weeksDone = new Set<string>();
    for (const d of completionsInRange) {
      weeksDone.add(weekKey(toDate(d)));
    }
    const completed = weeksDone.size;
    const rate = expected > 0 ? completed / expected : 0;
    return {
      completed,
      expected,
      rate: Math.min(rate, 1),
      percentage: Math.round(Math.min(rate, 1) * 100),
    };
  }

  const applicableDays = getApplicableDatesForStreak(habit, startDate, todayDate);
  expected = applicableDays.length;
  const completed = completionsInRange.length;
  const rate = expected > 0 ? completed / expected : 0;

  return {
    completed,
    expected,
    rate: Math.min(rate, 1),
    percentage: Math.round(Math.min(rate, 1) * 100),
  };
}

// ---------------------------------------------------------------------------
// Heatmap data generation
// ---------------------------------------------------------------------------

export interface HeatmapDay {
  date: string; // "YYYY-MM-DD"
  count: number; // number of habits completed that day
  dayOfWeek: number; // 0=Sun..6=Sat
  month: number; // 0-11
  isToday: boolean;
}

/**
 * Generate heatmap data for a year of completions.
 * Returns an array of 365/366 days with completion counts.
 */
export function generateHeatmapData(
  completionDates: string[], // all completion dates (can have duplicates for different habits)
  today: Date = new Date()
): HeatmapDay[] {
  const startDate = subDays(today, 364); // 365 days including today
  const days = eachDayOfInterval({ start: startDate, end: today });
  const todayStr = toDateStr(today);

  // Count completions per day
  const countMap = new Map<string, number>();
  for (const d of completionDates) {
    countMap.set(d, (countMap.get(d) || 0) + 1);
  }

  return days.map((day) => {
    const dateStr = toDateStr(day);
    return {
      date: dateStr,
      count: countMap.get(dateStr) || 0,
      dayOfWeek: day.getDay(),
      month: day.getMonth(),
      isToday: dateStr === todayStr,
    };
  });
}

/**
 * Get the maximum completion count for color scaling
 */
export function getHeatmapMaxCount(heatmapData: HeatmapDay[]): number {
  return Math.max(1, ...heatmapData.map((d) => d.count));
}

/**
 * Get color intensity level (0-4) for a heatmap cell
 */
export function getHeatmapLevel(count: number, maxCount: number): number {
  if (count === 0) return 0;
  if (maxCount <= 0) return 0;
  const ratio = count / maxCount;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

// ---------------------------------------------------------------------------
// Weekly & Monthly summary data
// ---------------------------------------------------------------------------

export interface WeeklySummary {
  weekStart: string; // "YYYY-MM-DD" (Monday)
  weekEnd: string;
  weekLabel: string; // e.g., "Jan 20 - Jan 26"
  totalCompleted: number;
  totalExpected: number;
  rate: number;
  percentage: number;
  perHabit: {
    habitId: string;
    habitName: string;
    habitColor: string;
    completed: number;
    expected: number;
    rate: number;
  }[];
}

export interface MonthlySummary {
  monthStart: string;
  monthLabel: string; // e.g., "January 2026"
  totalCompleted: number;
  totalExpected: number;
  rate: number;
  percentage: number;
  perHabit: {
    habitId: string;
    habitName: string;
    habitColor: string;
    completed: number;
    expected: number;
    rate: number;
  }[];
}

/**
 * Generate weekly summaries for the last N weeks.
 */
export function generateWeeklySummaries(
  habits: Habit[],
  allCompletions: { habitId: string; completedDate: string }[],
  numWeeks: number = 8,
  today: Date = new Date()
): WeeklySummary[] {
  const summaries: WeeklySummary[] = [];

  // Build a lookup: habitId -> Set of completion date strings
  const completionsByHabit = new Map<string, Set<string>>();
  for (const c of allCompletions) {
    if (!completionsByHabit.has(c.habitId)) {
      completionsByHabit.set(c.habitId, new Set());
    }
    completionsByHabit.get(c.habitId)!.add(c.completedDate);
  }

  for (let i = 0; i < numWeeks; i++) {
    const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });

    // Don't go past today for the current week
    const effectiveEnd = isAfter(weekEnd, today) ? today : weekEnd;

    const weekStartStr = toDateStr(weekStart);
    const weekEndStr = toDateStr(effectiveEnd);
    const weekLabel = `${format(weekStart, "MMM d")} - ${format(effectiveEnd, "MMM d")}`;

    let totalCompleted = 0;
    let totalExpected = 0;
    const perHabit: WeeklySummary["perHabit"] = [];

    for (const habit of habits) {
      const habitCompletions = completionsByHabit.get(habit.id) || new Set();

      // Only count this habit if it was created before the week ended
      const habitCreated = habit.createdAt ? new Date(habit.createdAt) : null;
      if (habitCreated && isAfter(habitCreated, effectiveEnd)) continue;

      const effectiveStart =
        habitCreated && isAfter(habitCreated, weekStart)
          ? habitCreated
          : weekStart;

      if (habit.frequency === "weekly") {
        // Weekly: 1 expected per week, check if any day in range has completion
        const daysInWeek = eachDayOfInterval({
          start: effectiveStart,
          end: effectiveEnd,
        });
        const hasCompletion = daysInWeek.some((d) =>
          habitCompletions.has(toDateStr(d))
        );
        const completed = hasCompletion ? 1 : 0;
        const expected = 1;
        perHabit.push({
          habitId: habit.id,
          habitName: habit.name,
          habitColor: habit.color,
          completed,
          expected,
          rate: completed / expected,
        });
        totalCompleted += completed;
        totalExpected += expected;
      } else {
        const applicableDays = getApplicableDatesForStreak(
          habit,
          effectiveStart,
          effectiveEnd
        );
        const expected = applicableDays.length;
        const completed = applicableDays.filter((d) =>
          habitCompletions.has(toDateStr(d))
        ).length;
        perHabit.push({
          habitId: habit.id,
          habitName: habit.name,
          habitColor: habit.color,
          completed,
          expected,
          rate: expected > 0 ? completed / expected : 0,
        });
        totalCompleted += completed;
        totalExpected += expected;
      }
    }

    const rate = totalExpected > 0 ? totalCompleted / totalExpected : 0;

    summaries.push({
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      weekLabel,
      totalCompleted,
      totalExpected,
      rate,
      percentage: Math.round(rate * 100),
      perHabit,
    });
  }

  return summaries;
}

/**
 * Generate monthly summaries for the last N months.
 */
export function generateMonthlySummaries(
  habits: Habit[],
  allCompletions: { habitId: string; completedDate: string }[],
  numMonths: number = 6,
  today: Date = new Date()
): MonthlySummary[] {
  const summaries: MonthlySummary[] = [];

  const completionsByHabit = new Map<string, Set<string>>();
  for (const c of allCompletions) {
    if (!completionsByHabit.has(c.habitId)) {
      completionsByHabit.set(c.habitId, new Set());
    }
    completionsByHabit.get(c.habitId)!.add(c.completedDate);
  }

  for (let i = 0; i < numMonths; i++) {
    const monthDate = subMonths(today, i);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const effectiveEnd = isAfter(monthEnd, today) ? today : monthEnd;

    const monthLabel = format(monthStart, "MMMM yyyy");
    const monthStartStr = toDateStr(monthStart);

    let totalCompleted = 0;
    let totalExpected = 0;
    const perHabit: MonthlySummary["perHabit"] = [];

    for (const habit of habits) {
      const habitCompletions = completionsByHabit.get(habit.id) || new Set();

      const habitCreated = habit.createdAt ? new Date(habit.createdAt) : null;
      if (habitCreated && isAfter(habitCreated, effectiveEnd)) continue;

      const effectiveStart =
        habitCreated && isAfter(habitCreated, monthStart)
          ? habitCreated
          : monthStart;

      if (habit.frequency === "weekly") {
        const weeks = eachWeekOfInterval(
          { start: effectiveStart, end: effectiveEnd },
          { weekStartsOn: 1 }
        );
        const expected = weeks.length;
        let completed = 0;
        for (const w of weeks) {
          const wEnd = endOfWeek(w, { weekStartsOn: 1 });
          const wEffEnd = isAfter(wEnd, effectiveEnd) ? effectiveEnd : wEnd;
          const wStart = isAfter(effectiveStart, w) ? effectiveStart : w;
          const daysInWeek = eachDayOfInterval({
            start: wStart,
            end: wEffEnd,
          });
          if (daysInWeek.some((d) => habitCompletions.has(toDateStr(d)))) {
            completed++;
          }
        }
        perHabit.push({
          habitId: habit.id,
          habitName: habit.name,
          habitColor: habit.color,
          completed,
          expected,
          rate: expected > 0 ? completed / expected : 0,
        });
        totalCompleted += completed;
        totalExpected += expected;
      } else {
        const applicableDays = getApplicableDatesForStreak(
          habit,
          effectiveStart,
          effectiveEnd
        );
        const expected = applicableDays.length;
        const completed = applicableDays.filter((d) =>
          habitCompletions.has(toDateStr(d))
        ).length;
        perHabit.push({
          habitId: habit.id,
          habitName: habit.name,
          habitColor: habit.color,
          completed,
          expected,
          rate: expected > 0 ? completed / expected : 0,
        });
        totalCompleted += completed;
        totalExpected += expected;
      }
    }

    const rate = totalExpected > 0 ? totalCompleted / totalExpected : 0;

    summaries.push({
      monthStart: monthStartStr,
      monthLabel,
      totalCompleted,
      totalExpected,
      rate,
      percentage: Math.round(rate * 100),
      perHabit,
    });
  }

  return summaries;
}

// ---------------------------------------------------------------------------
// Trend data for line/area charts (completion rate over time)
// ---------------------------------------------------------------------------

export interface TrendDataPoint {
  date: string; // "YYYY-MM-DD" (week start)
  label: string; // display label e.g. "Jan 20"
  rate: number; // 0-100 percentage
  completed: number;
  expected: number;
}

/**
 * Generate trend data: weekly completion rate over the last N weeks.
 * Returns data points ordered chronologically (oldest first).
 */
export function generateTrendData(
  habits: Habit[],
  allCompletions: { habitId: string; completedDate: string }[],
  numWeeks: number = 12,
  today: Date = new Date()
): TrendDataPoint[] {
  const points: TrendDataPoint[] = [];

  // Build lookup: habitId -> Set of completion dates
  const completionsByHabit = new Map<string, Set<string>>();
  for (const c of allCompletions) {
    if (!completionsByHabit.has(c.habitId)) {
      completionsByHabit.set(c.habitId, new Set());
    }
    completionsByHabit.get(c.habitId)!.add(c.completedDate);
  }

  for (let i = numWeeks - 1; i >= 0; i--) {
    const weekEnd = endOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const weekStart = startOfWeek(subWeeks(today, i), { weekStartsOn: 1 });
    const effectiveEnd = isAfter(weekEnd, today) ? today : weekEnd;

    let totalCompleted = 0;
    let totalExpected = 0;

    for (const habit of habits) {
      const habitCompletions = completionsByHabit.get(habit.id) || new Set();
      const habitCreated = habit.createdAt ? new Date(habit.createdAt) : null;
      if (habitCreated && isAfter(habitCreated, effectiveEnd)) continue;

      const effectiveStart =
        habitCreated && isAfter(habitCreated, weekStart)
          ? habitCreated
          : weekStart;

      if (habit.frequency === "weekly") {
        const daysInWeek = eachDayOfInterval({
          start: effectiveStart,
          end: effectiveEnd,
        });
        const hasCompletion = daysInWeek.some((d) =>
          habitCompletions.has(toDateStr(d))
        );
        totalCompleted += hasCompletion ? 1 : 0;
        totalExpected += 1;
      } else {
        const applicableDays = getApplicableDatesForStreak(
          habit,
          effectiveStart,
          effectiveEnd
        );
        totalExpected += applicableDays.length;
        totalCompleted += applicableDays.filter((d) =>
          habitCompletions.has(toDateStr(d))
        ).length;
      }
    }

    const rate = totalExpected > 0 ? Math.round((totalCompleted / totalExpected) * 100) : 0;
    points.push({
      date: toDateStr(weekStart),
      label: format(weekStart, "MMM d"),
      rate,
      completed: totalCompleted,
      expected: totalExpected,
    });
  }

  return points;
}

// ---------------------------------------------------------------------------
// Habit comparison (best vs struggling)
// ---------------------------------------------------------------------------

export interface HabitComparisonItem {
  habitId: string;
  habitName: string;
  habitColor: string;
  habitIcon: string;
  rate: number; // 0-100 percentage
  completed: number;
  expected: number;
}

/**
 * Rank all habits by their 30-day completion rate.
 * Returns { best: top N, struggling: bottom N }.
 */
export function calculateHabitComparison(
  habits: Habit[],
  allCompletions: { habitId: string; completedDate: string }[],
  topN: number = 3,
  today: Date = new Date()
): { best: HabitComparisonItem[]; struggling: HabitComparisonItem[] } {
  const completionsByHabit = new Map<string, string[]>();
  for (const c of allCompletions) {
    if (!completionsByHabit.has(c.habitId)) {
      completionsByHabit.set(c.habitId, []);
    }
    completionsByHabit.get(c.habitId)!.push(c.completedDate);
  }

  const items: HabitComparisonItem[] = habits.map((habit) => {
    const dates = completionsByHabit.get(habit.id) || [];
    dates.sort();
    const result = calculateCompletionRate(habit, dates, 30, today);
    return {
      habitId: habit.id,
      habitName: habit.name,
      habitColor: habit.color,
      habitIcon: habit.icon,
      rate: result.percentage,
      completed: result.completed,
      expected: result.expected,
    };
  });

  // Sort descending by rate
  const sorted = [...items].sort((a, b) => b.rate - a.rate);
  const best = sorted.slice(0, topN);

  // For struggling: get bottom N (with at least some expected), reverse so worst is first
  const struggling = sorted
    .filter((h) => h.expected > 0)
    .slice(-topN)
    .reverse();

  // Avoid duplicates if there are fewer habits than topN * 2
  const bestIds = new Set(best.map((h) => h.habitId));
  const uniqueStruggling = struggling.filter((h) => !bestIds.has(h.habitId));

  return { best, struggling: uniqueStruggling };
}

// ---------------------------------------------------------------------------
// Day-of-week pattern analysis
// ---------------------------------------------------------------------------

export interface DayOfWeekData {
  day: string; // "Mon", "Tue", etc.
  dayIndex: number; // 0=Sun, 1=Mon, ..., 6=Sat
  rate: number; // 0-100 percentage
  completed: number;
  expected: number;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Calculate completion rate for each day of the week over the last N days.
 * Shows which days the user is most/least consistent.
 */
export function calculateDayOfWeekPatterns(
  habits: Habit[],
  allCompletions: { habitId: string; completedDate: string }[],
  numDays: number = 90,
  today: Date = new Date()
): DayOfWeekData[] {
  const startDate = subDays(today, numDays - 1);

  // Build lookup: habitId -> Set of completion dates
  const completionsByHabit = new Map<string, Set<string>>();
  for (const c of allCompletions) {
    if (!completionsByHabit.has(c.habitId)) {
      completionsByHabit.set(c.habitId, new Set());
    }
    completionsByHabit.get(c.habitId)!.add(c.completedDate);
  }

  // Accumulate per day-of-week
  const dayStats = Array.from({ length: 7 }, () => ({
    completed: 0,
    expected: 0,
  }));

  const allDays = eachDayOfInterval({ start: startDate, end: today });

  for (const day of allDays) {
    const dayOfWeek = day.getDay();
    const dayStr = toDateStr(day);

    for (const habit of habits) {
      const habitCreated = habit.createdAt ? new Date(habit.createdAt) : null;
      if (habitCreated && isAfter(habitCreated, day)) continue;

      // Check if this day is applicable for the habit
      let applicable = false;
      if (habit.frequency === "daily") {
        applicable = true;
      } else if (habit.frequency === "weekly") {
        // Weekly habits: not meaningful for day-of-week patterns, skip
        applicable = false;
      } else if (habit.frequency === "custom" && habit.frequencyDays) {
        applicable = habit.frequencyDays.includes(dayOfWeek);
      }

      if (!applicable) continue;

      dayStats[dayOfWeek].expected++;
      const habitCompletions = completionsByHabit.get(habit.id) || new Set();
      if (habitCompletions.has(dayStr)) {
        dayStats[dayOfWeek].completed++;
      }
    }
  }

  // Return Mon-Sun order (1,2,3,4,5,6,0)
  const orderedIndices = [1, 2, 3, 4, 5, 6, 0];
  return orderedIndices.map((idx) => ({
    day: DAY_LABELS[idx],
    dayIndex: idx,
    rate:
      dayStats[idx].expected > 0
        ? Math.round(
            (dayStats[idx].completed / dayStats[idx].expected) * 100
          )
        : 0,
    completed: dayStats[idx].completed,
    expected: dayStats[idx].expected,
  }));
}
