"use server";

import { db } from "@/lib/db";
import { categories, habits } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod/v4";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().nullable().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export async function createCategory(data: CategoryFormData) {
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const result = await db
    .insert(categories)
    .values({
      name: parsed.data.name,
      color: parsed.data.color ?? null,
    })
    .returning();

  revalidatePath("/habits");
  return { category: result[0] };
}

export async function updateCategory(id: string, data: CategoryFormData) {
  const parsed = categorySchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid data" };
  }

  const result = await db
    .update(categories)
    .set({
      name: parsed.data.name,
      color: parsed.data.color ?? null,
    })
    .where(eq(categories.id, id))
    .returning();

  revalidatePath("/habits");
  return { category: result[0] };
}

export async function deleteCategory(id: string) {
  // Unassign habits from this category first
  await db
    .update(habits)
    .set({ categoryId: null })
    .where(eq(habits.categoryId, id));

  await db.delete(categories).where(eq(categories.id, id));

  revalidatePath("/habits");
  return { success: true };
}
