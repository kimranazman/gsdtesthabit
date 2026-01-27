"use server";

import { db } from "@/lib/db";
import { completions } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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
    await db
      .delete(completions)
      .where(eq(completions.id, existing[0].id));

    revalidatePath("/");
    return { completed: false, completion: null };
  } else {
    // Create new completion
    const result = await db
      .insert(completions)
      .values({
        habitId,
        completedDate: dateStr,
      })
      .returning();

    revalidatePath("/");
    return { completed: true, completion: result[0] };
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
