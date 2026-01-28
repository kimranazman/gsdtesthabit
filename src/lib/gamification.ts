/**
 * Gamification Engine
 *
 * XP, levels, and achievement definitions for the habit tracker.
 * This module contains pure functions and constants — no database access.
 */

// ---------------------------------------------------------------------------
// XP Constants
// ---------------------------------------------------------------------------

/** Base XP awarded for completing a habit */
export const XP_PER_COMPLETION = 10;

/** Bonus XP multiplier per streak day (streak * this value) */
export const STREAK_BONUS_MULTIPLIER = 2;

// ---------------------------------------------------------------------------
// XP Calculation Functions
// ---------------------------------------------------------------------------

/**
 * Calculate total XP earned for a single completion.
 * Base XP + streak bonus (streak length * STREAK_BONUS_MULTIPLIER).
 *
 * @param streakLength - Current streak length for the habit (before this completion)
 * @returns Total XP to award
 */
export function calculateXpForCompletion(streakLength: number): number {
  const base = XP_PER_COMPLETION;
  const streakBonus = Math.max(0, streakLength) * STREAK_BONUS_MULTIPLIER;
  return base + streakBonus;
}

// ---------------------------------------------------------------------------
// Level System
// ---------------------------------------------------------------------------

/**
 * Get the total XP required to reach a given level.
 * Formula: level * level * 50
 *
 * Level 1: 0 XP (starting level)
 * Level 2: 200 XP
 * Level 3: 450 XP
 * Level 4: 800 XP
 * Level 5: 1250 XP
 * ...
 * Level 50: 125000 XP
 */
export function getXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return level * level * 50;
}

/** Maximum level in the system */
export const MAX_LEVEL = 50;

/**
 * Determine the level for a given total XP amount.
 * Iterates from level 1 upward until XP threshold exceeds totalXp.
 */
export function getLevelForXp(totalXp: number): number {
  let level = 1;
  while (level < MAX_LEVEL && totalXp >= getXpForLevel(level + 1)) {
    level++;
  }
  return level;
}

/**
 * Get progress information for the current level.
 * Returns current level, XP within current level, XP needed for next level, and progress percentage.
 */
export function getXpProgress(totalXp: number): {
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  xpIntoLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
  isMaxLevel: boolean;
} {
  const level = getLevelForXp(totalXp);
  const currentLevelXp = getXpForLevel(level);
  const nextLevelXp = level < MAX_LEVEL ? getXpForLevel(level + 1) : currentLevelXp;
  const xpIntoLevel = totalXp - currentLevelXp;
  const xpNeededForNext = nextLevelXp - currentLevelXp;
  const isMaxLevel = level >= MAX_LEVEL;
  const progressPercent = isMaxLevel
    ? 100
    : xpNeededForNext > 0
      ? Math.min(100, Math.round((xpIntoLevel / xpNeededForNext) * 100))
      : 100;

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    xpIntoLevel,
    xpNeededForNext,
    progressPercent,
    isMaxLevel,
  };
}

// ---------------------------------------------------------------------------
// Achievement Definitions
// ---------------------------------------------------------------------------

export type AchievementCategory = "streak" | "completion" | "variety" | "level";

export interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  icon: string; // lucide icon name
}

/**
 * All 16 achievements in the system.
 */
export const ACHIEVEMENTS: AchievementDefinition[] = [
  // STREAKS (5)
  {
    id: "first-flame",
    name: "First Flame",
    description: "Your first spark! Achieve a 3-day streak.",
    category: "streak",
    icon: "flame",
  },
  {
    id: "week-warrior",
    name: "Week Warrior",
    description: "A full week of consistency! 7-day streak.",
    category: "streak",
    icon: "sword",
  },
  {
    id: "fortnight-force",
    name: "Fortnight Force",
    description: "Two weeks strong! 14-day streak.",
    category: "streak",
    icon: "shield",
  },
  {
    id: "monthly-master",
    name: "Monthly Master",
    description: "A whole month! Incredible! 30-day streak.",
    category: "streak",
    icon: "crown",
  },
  {
    id: "century-streak",
    name: "Century Streak",
    description: "100 days. Legendary.",
    category: "streak",
    icon: "trophy",
  },

  // COMPLETIONS (5)
  {
    id: "first-step",
    name: "First Step",
    description: "Every journey begins with a single step.",
    category: "completion",
    icon: "footprints",
  },
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Building momentum! 10 completions.",
    category: "completion",
    icon: "rocket",
  },
  {
    id: "half-century",
    name: "Half Century",
    description: "50 habits completed!",
    category: "completion",
    icon: "star",
  },
  {
    id: "century-club",
    name: "Century Club",
    description: "100 completions. You're committed!",
    category: "completion",
    icon: "medal",
  },
  {
    id: "habit-machine",
    name: "Habit Machine",
    description: "500! You're a habit machine!",
    category: "completion",
    icon: "cog",
  },

  // VARIETY (3)
  {
    id: "habit-creator",
    name: "Habit Creator",
    description: "Your first habit is born!",
    category: "variety",
    icon: "plus-circle",
  },
  {
    id: "collector",
    name: "Collector",
    description: "Building your habit collection. 5 habits created.",
    category: "variety",
    icon: "layers",
  },
  {
    id: "diversified",
    name: "Diversified",
    description: "Variety is the spice of life! 3 different habits in one day.",
    category: "variety",
    icon: "sparkles",
  },

  // LEVELS (3)
  {
    id: "level-5",
    name: "Level 5",
    description: "Rising to level 5!",
    category: "level",
    icon: "arrow-up",
  },
  {
    id: "level-10",
    name: "Level 10",
    description: "Double digits!",
    category: "level",
    icon: "zap",
  },
  {
    id: "level-25",
    name: "Level 25",
    description: "Quarter century level!",
    category: "level",
    icon: "gem",
  },
];

/** Map for O(1) lookup by achievement ID */
export const ACHIEVEMENT_MAP = new Map(
  ACHIEVEMENTS.map((a) => [a.id, a])
);

// ---------------------------------------------------------------------------
// Achievement Checking Context
// ---------------------------------------------------------------------------

/**
 * Context data needed to evaluate which achievements should be unlocked.
 * Populated by the caller (server actions) before calling the checker.
 */
export interface AchievementCheckContext {
  /** IDs of achievements already unlocked */
  alreadyUnlocked: Set<string>;
  /** Total number of completions across all habits */
  totalCompletions: number;
  /** Best streak across any habit */
  bestStreak: number;
  /** Current streak for the habit just completed */
  currentStreak: number;
  /** Total number of habits created (non-archived) */
  totalHabitsCreated: number;
  /** Number of distinct habits completed today */
  distinctHabitsCompletedToday: number;
  /** Current level after XP award */
  newLevel: number;
}

/**
 * Check which achievements should be newly unlocked given the context.
 * Returns an array of achievement IDs that should be unlocked now.
 */
export function checkAchievements(ctx: AchievementCheckContext): string[] {
  const newlyUnlocked: string[] = [];

  function tryUnlock(id: string, condition: boolean) {
    if (condition && !ctx.alreadyUnlocked.has(id)) {
      newlyUnlocked.push(id);
    }
  }

  // Streak achievements — use the best of currentStreak and bestStreak
  const maxStreak = Math.max(ctx.currentStreak, ctx.bestStreak);
  tryUnlock("first-flame", maxStreak >= 3);
  tryUnlock("week-warrior", maxStreak >= 7);
  tryUnlock("fortnight-force", maxStreak >= 14);
  tryUnlock("monthly-master", maxStreak >= 30);
  tryUnlock("century-streak", maxStreak >= 100);

  // Completion achievements
  tryUnlock("first-step", ctx.totalCompletions >= 1);
  tryUnlock("getting-started", ctx.totalCompletions >= 10);
  tryUnlock("half-century", ctx.totalCompletions >= 50);
  tryUnlock("century-club", ctx.totalCompletions >= 100);
  tryUnlock("habit-machine", ctx.totalCompletions >= 500);

  // Variety achievements
  tryUnlock("habit-creator", ctx.totalHabitsCreated >= 1);
  tryUnlock("collector", ctx.totalHabitsCreated >= 5);
  tryUnlock("diversified", ctx.distinctHabitsCompletedToday >= 3);

  // Level achievements
  tryUnlock("level-5", ctx.newLevel >= 5);
  tryUnlock("level-10", ctx.newLevel >= 10);
  tryUnlock("level-25", ctx.newLevel >= 25);

  return newlyUnlocked;
}

// ---------------------------------------------------------------------------
// Gamification Event Types
// ---------------------------------------------------------------------------

export interface GamificationEvents {
  xpGained: number;
  newTotalXp: number;
  newLevel: number;
  leveledUp: boolean;
  previousLevel: number;
  achievementsUnlocked: AchievementDefinition[];
}
