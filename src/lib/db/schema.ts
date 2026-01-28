import {
  pgTable,
  uuid,
  text,
  boolean,
  integer,
  date,
  timestamp,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habits = pgTable(
  "habits",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    frequency: text("frequency").notNull().default("daily"), // 'daily' | 'weekly' | 'custom'
    frequencyDays: integer("frequency_days").array(), // for custom: [0,1,2,3,4,5,6] where 0=Sun
    color: text("color").notNull().default("#6366f1"), // default indigo
    icon: text("icon").notNull().default("circle-check"), // lucide icon name
    categoryId: uuid("category_id").references(() => categories.id),
    position: integer("position").notNull().default(0),
    archived: boolean("archived").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("habits_archived_position_idx").on(table.archived, table.position),
    index("habits_category_id_idx").on(table.categoryId),
  ]
);

export const completions = pgTable(
  "completions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    habitId: uuid("habit_id")
      .notNull()
      .references(() => habits.id, { onDelete: "cascade" }),
    completedDate: date("completed_date").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("completions_habit_date_idx").on(
      table.habitId,
      table.completedDate
    ),
    index("completions_habit_id_idx").on(table.habitId),
    index("completions_completed_date_idx").on(table.completedDate),
  ]
);

// ---------------------------------------------------------------------------
// Gamification tables
// ---------------------------------------------------------------------------

export const userStats = pgTable("user_stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  totalXp: integer("total_xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userAchievements = pgTable(
  "user_achievements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    achievementId: text("achievement_id").notNull(),
    unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
    metadata: jsonb("metadata"),
  },
  (table) => [
    uniqueIndex("user_achievements_achievement_id_idx").on(table.achievementId),
  ]
);

// Type exports for use throughout the app
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type Completion = typeof completions.$inferSelect;
export type NewCompletion = typeof completions.$inferInsert;
export type UserStats = typeof userStats.$inferSelect;
export type NewUserStats = typeof userStats.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type NewUserAchievement = typeof userAchievements.$inferInsert;
