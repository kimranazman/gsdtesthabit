import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { categories, habits, completions } from "./schema";
import { subDays, format, getDay } from "date-fns";

async function seed() {
  const connectionString =
    process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "Missing database connection string. Set POSTGRES_URL or DATABASE_URL."
    );
  }

  const isSSL = !connectionString.includes("localhost");

  const pool = new Pool({
    connectionString,
    ssl: isSSL ? { rejectUnauthorized: false } : false,
  });
  const db = drizzle(pool);

  console.log("Seeding database...");

  // Clear existing data
  await db.delete(completions);
  await db.delete(habits);
  await db.delete(categories);
  console.log("Cleared existing data.");

  // Create categories
  const [healthCategory] = await db
    .insert(categories)
    .values({
      name: "Health",
      color: "#10b981", // emerald
    })
    .returning();

  const [productivityCategory] = await db
    .insert(categories)
    .values({
      name: "Productivity",
      color: "#6366f1", // indigo
    })
    .returning();

  console.log("Created categories:", healthCategory.name, productivityCategory.name);

  // Create habits
  const [exerciseHabit] = await db
    .insert(habits)
    .values({
      name: "Morning Exercise",
      description: "30 minutes of exercise to start the day",
      frequency: "daily",
      color: "#10b981",
      icon: "dumbbell",
      categoryId: healthCategory.id,
      position: 0,
    })
    .returning();

  const [readingHabit] = await db
    .insert(habits)
    .values({
      name: "Read 30 Minutes",
      description: "Read at least 30 minutes of a book",
      frequency: "daily",
      color: "#6366f1",
      icon: "book-open",
      categoryId: productivityCategory.id,
      position: 1,
    })
    .returning();

  const [weeklyReviewHabit] = await db
    .insert(habits)
    .values({
      name: "Weekly Review",
      description: "Review goals and plan for the upcoming week",
      frequency: "weekly",
      frequencyDays: [0], // Sunday
      color: "#f59e0b",
      icon: "clipboard-list",
      categoryId: productivityCategory.id,
      position: 2,
    })
    .returning();

  console.log(
    "Created habits:",
    exerciseHabit.name,
    readingHabit.name,
    weeklyReviewHabit.name
  );

  // Generate historical completion data (last 30 days)
  const today = new Date();
  const completionRecords: Array<{
    habitId: string;
    completedDate: string;
    notes: string | null;
  }> = [];

  for (let i = 0; i < 30; i++) {
    const date = subDays(today, i);
    const dateStr = format(date, "yyyy-MM-dd");
    const dayOfWeek = getDay(date); // 0 = Sunday

    // Morning Exercise: ~80% completion rate (skip some days randomly)
    if (Math.random() < 0.8) {
      completionRecords.push({
        habitId: exerciseHabit.id,
        completedDate: dateStr,
        notes:
          i < 3
            ? null
            : i % 7 === 0
              ? "Great workout today!"
              : null,
      });
    }

    // Reading: ~70% completion rate
    if (Math.random() < 0.7) {
      completionRecords.push({
        habitId: readingHabit.id,
        completedDate: dateStr,
        notes:
          i % 10 === 0 ? "Finished a chapter" : null,
      });
    }

    // Weekly Review: only on Sundays, ~90% completion
    if (dayOfWeek === 0 && Math.random() < 0.9) {
      completionRecords.push({
        habitId: weeklyReviewHabit.id,
        completedDate: dateStr,
        notes: "Reviewed weekly goals",
      });
    }
  }

  if (completionRecords.length > 0) {
    await db.insert(completions).values(completionRecords);
  }

  console.log(`Created ${completionRecords.length} completion records.`);
  console.log("Seeding complete!");

  await pool.end();
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
