import { getHabits, getCategories } from "@/lib/db/queries";
import { HabitsPageClient } from "@/components/habits/habits-page-client";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const [habits, categories] = await Promise.all([
    getHabits(),
    getCategories(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Habits</h1>
        <p className="text-muted-foreground">
          Create, edit, and manage your habits.
        </p>
      </div>

      <HabitsPageClient habits={habits} categories={categories} />
    </div>
  );
}
