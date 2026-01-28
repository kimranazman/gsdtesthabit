"use server";

import { db } from "@/lib/db";
import { completions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  getTodaysHabitsWithCompletions,
  getCompletionsForHabit,
  type HabitWithCompletion,
} from "@/lib/db/queries";
import { calculateStreaks } from "@/lib/stats";
import { processCompletionGamification } from "@/lib/actions/gamification";
import type { GamificationEvents } from "@/lib/gamification";

/**
 * Toggle a habit's completion for a given date.
 * If a completion exists, delete it (uncomplete). If not, create one (complete).
 * Returns the new completion state.
 */
export async function toggleCompletion(habitId: string, dateStr: string) {
  // Check if completion already exists
  const existing = await db
    .select()
    .from(completions)
    .where(
      and(
        eq(completions.habitId, habitId),
        eq(completions.completedDate, dateStr)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Delete existing completion (uncomplete)
    // Note: XP is NOT removed when uncompleting (keeps it simple)
    await db
      .delete(completions)
      .where(eq(completions.id, existing[0].id));

    revalidatePath("/");
    return { completed: false, completion: null, gamification: null };
  } else {
    // Create new completion
    const result = await db
      .insert(completions)
      .values({
        habitId,
        completedDate: dateStr,
      })
      .returning();

    // Process gamification events (XP, level, achievements)
    let gamification: GamificationEvents | null = null;
    try {
      gamification = await processCompletionGamification(habitId, dateStr);
    } catch (error) {
      // Gamification is non-critical — don't fail the completion
      console.error("Gamification processing error:", error);
    }

    revalidatePath("/");
    return { completed: true, completion: result[0], gamification };
  }
}

/**
 * Update notes on an existing completion record.
 * If no completion exists for this habit+date, create one with the notes.
 */
export async function updateCompletionNotes(
  habitId: string,
  dateStr: string,
  notes: string
) {
  // Check if completion exists
  const existing = await db
    .select()
    .from(completions)
    .where(
      and(
        eq(completions.habitId, habitId),
        eq(completions.completedDate, dateStr)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing completion notes
    const result = await db
      .update(completions)
      .set({ notes: notes || null })
      .where(eq(completions.id, existing[0].id))
      .returning();

    revalidatePath("/");
    return { completion: result[0] };
  } else {
    // Create new completion with notes (also marks as complete)
    const result = await db
      .insert(completions)
      .values({
        habitId,
        completedDate: dateStr,
        notes: notes || null,
      })
      .returning();

    revalidatePath("/");
    return { completion: result[0] };
  }
}

/**
 * Fetch habits with completions for a specific date.
 * Used by the dashboard date navigation feature.
 * Returns habits, formatted date string, and streak data.
 */
export async function getHabitsForDate(dateStr: string): Promise<{
  habits: HabitWithCompletion[];
  streakMap: Record<string, { currentStreak: number; bestStreak: number }>;
}> {
  const habits = await getTodaysHabitsWithCompletions(dateStr);

  // Build streak map
  const targetDate = new Date(dateStr + "T12:00:00");
  const streakMap: Record<string, { currentStreak: number; bestStreak: number }> = {};

  await Promise.all(
    habits.map(async (habit) => {
      const completionRecords = await getCompletionsForHabit(habit.id);
      const dates = completionRecords.map((c) => c.completedDate).sort();
      streakMap[habit.id] = calculateStreaks(habit, dates, targetDate);
    })
  );

  return { habits, streakMap };
}
