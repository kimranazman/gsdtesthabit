"use server";

import { db } from "@/lib/db";
import { habits } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";
import { processHabitCreationGamification } from "@/lib/actions/gamification";

const habitSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  frequency: z.enum(["daily", "weekly", "custom"]),
  frequencyDays: z.array(z.number().min(0).max(6)).optional(),
  color: z.string().min(1),
  icon: z.string().min(1),
  categoryId: z.string().uuid().nullable().optional(),
});

export type HabitFormData = z.infer<typeof habitSchema>;

export async function createHabit(data: HabitFormData) {
  const parsed = habitSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  // Get next position
  const existing = await db
    .select({ position: habits.position })
    .from(habits)
    .where(eq(habits.archived, false))
    .orderBy(asc(habits.position));

  const nextPosition =
    existing.length > 0
      ? (existing[existing.length - 1]?.position ?? 0) + 1
      : 0;

  const result = await db
    .insert(habits)
    .values({
      name: parsed.data.name,
      description: parsed.data.description || null,
      frequency: parsed.data.frequency,
      frequencyDays: parsed.data.frequencyDays ?? null,
      color: parsed.data.color,
      icon: parsed.data.icon,
      categoryId: parsed.data.categoryId ?? null,
      position: nextPosition,
    })
    .returning();

  // Process gamification (habit-creator, collector achievements)
  let gamificationAchievements: { id: string; name: string; description: string }[] = [];
  try {
    const gamification = await processHabitCreationGamification();
    gamificationAchievements = gamification.achievementsUnlocked.map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
    }));
  } catch (error) {
    // Gamification is non-critical — don't fail habit creation
    console.error("Gamification processing error:", error);
  }

  revalidatePath("/habits");
  return { habit: result[0], achievementsUnlocked: gamificationAchievements };
}

export async function updateHabit(id: string, data: Partial<HabitFormData>) {
  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined)
    updateData.description = data.description || null;
  if (data.frequency !== undefined) updateData.frequency = data.frequency;
  if (data.frequencyDays !== undefined)
    updateData.frequencyDays = data.frequencyDays ?? null;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.categoryId !== undefined)
    updateData.categoryId = data.categoryId ?? null;

  const result = await db
    .update(habits)
    .set(updateData)
    .where(eq(habits.id, id))
    .returning();

  revalidatePath("/habits");
  return { habit: result[0] };
}

export async function archiveHabit(id: string) {
  const result = await db
    .update(habits)
    .set({ archived: true, updatedAt: new Date() })
    .where(eq(habits.id, id))
    .returning();

  revalidatePath("/habits");
  return { habit: result[0] };
}

export async function unarchiveHabit(id: string) {
  // Get next position for unarchived habit
  const existing = await db
    .select({ position: habits.position })
    .from(habits)
    .where(eq(habits.archived, false))
    .orderBy(asc(habits.position));

  const nextPosition =
    existing.length > 0
      ? (existing[existing.length - 1]?.position ?? 0) + 1
      : 0;

  const result = await db
    .update(habits)
    .set({ archived: false, position: nextPosition, updatedAt: new Date() })
    .where(eq(habits.id, id))
    .returning();

  revalidatePath("/habits");
  return { habit: result[0] };
}

export async function reorderHabits(orderedIds: string[]) {
  // Update positions in a single transaction
  await db.transaction(async (tx) => {
    for (let i = 0; i < orderedIds.length; i++) {
      await tx
        .update(habits)
        .set({ position: i, updatedAt: new Date() })
        .where(eq(habits.id, orderedIds[i]));
    }
  });

  revalidatePath("/habits");
  return { success: true };
}
