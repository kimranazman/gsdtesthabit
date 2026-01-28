import { getHabits, getAllCompletionsForActiveHabits } from "@/lib/db/queries";
import { AnalyticsClient } from "@/components/analytics/analytics-client";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const [habits, completions] = await Promise.all([
    getHabits(),
    getAllCompletionsForActiveHabits(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          View your habit completion trends, streaks, and patterns.
        </p>
      </div>

      <AnalyticsClient habits={habits} completions={completions} />
    </div>
  );
}
