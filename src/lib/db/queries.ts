import { db } from "@/lib/db";
import { habits, categories, completions } from "@/lib/db/schema";
import type { Habit, Completion } from "@/lib/db/schema";
import { eq, asc, and, gte, lte } from "drizzle-orm";

export async function getHabits(includeArchived = false) {
  if (includeArchived) {
    return db.select().from(habits).orderBy(asc(habits.position));
  }
  return db
    .select()
    .from(habits)
    .where(eq(habits.archived, false))
    .orderBy(asc(habits.position));
}

export async function getHabit(id: string) {
  const result = await db
    .select()
    .from(habits)
    .where(eq(habits.id, id))
    .limit(1);
  return result[0] ?? null;
}

export async function getCategories() {
  return db.select().from(categories).orderBy(asc(categories.name));
}

// Types for dashboard
export type HabitWithCompletion = Habit & {
  completion: Completion | null;
};

/**
 * Get today's applicable habits with their completion status in a single batched query.
 * Frequency-aware: daily = every day, weekly = once per week (any day), custom = on specified days.
 * Returns habits joined with completions for the given date.
 */
export async function getTodaysHabitsWithCompletions(
  dateStr?: string
): Promise<HabitWithCompletion[]> {
  // Use provided date or today's date in local timezone
  const targetDate = dateStr ?? new Date().toISOString().split("T")[0];
  const dayOfWeek = new Date(targetDate + "T12:00:00").getDay(); // 0=Sun, 6=Sat

  // Single query: LEFT JOIN habits with completions for the target date
  const rows = await db
    .select({
      habit: habits,
      completion: completions,
    })
    .from(habits)
    .leftJoin(
      completions,
      and(
        eq(completions.habitId, habits.id),
        eq(completions.completedDate, targetDate)
      )
    )
    .where(eq(habits.archived, false))
    .orderBy(asc(habits.position));

  // Filter by frequency in application code (simpler than complex SQL)
  const filtered = rows.filter(({ habit }) => {
    if (habit.frequency === "daily") return true;
    if (habit.frequency === "weekly") return true; // Show weekly habits every day, user picks when to complete
    if (habit.frequency === "custom" && habit.frequencyDays) {
      return habit.frequencyDays.includes(dayOfWeek);
    }
    return true;
  });

  return filtered.map(({ habit, completion }) => ({
    ...habit,
    completion: completion ?? null,
  }));
}

/**
 * Get all completions for a specific habit, ordered by date descending.
 */
export async function getCompletionsForHabit(habitId: string): Promise<Completion[]> {
  return db
    .select()
    .from(completions)
    .where(eq(completions.habitId, habitId))
    .orderBy(asc(completions.completedDate));
}

/**
 * Get all completions across all active habits within a date range.
 */
export async function getCompletionsInRange(
  startDate: string,
  endDate: string
): Promise<(Completion & { habitColor?: string })[]> {
  const rows = await db
    .select({
      completion: completions,
      habitColor: habits.color,
    })
    .from(completions)
    .innerJoin(habits, eq(completions.habitId, habits.id))
    .where(
      and(
        gte(completions.completedDate, startDate),
        lte(completions.completedDate, endDate),
        eq(habits.archived, false)
      )
    )
    .orderBy(asc(completions.completedDate));

  return rows.map((r) => ({
    ...r.completion,
    habitColor: r.habitColor,
  }));
}

/**
 * Get all completions for all active habits (for stats calculations).
 */
export async function getAllCompletionsForActiveHabits(): Promise<Completion[]> {
  return db
    .select({
      id: completions.id,
      habitId: completions.habitId,
      completedDate: completions.completedDate,
      notes: completions.notes,
      createdAt: completions.createdAt,
    })
    .from(completions)
    .innerJoin(habits, eq(completions.habitId, habits.id))
    .where(eq(habits.archived, false))
    .orderBy(asc(completions.completedDate));
}
