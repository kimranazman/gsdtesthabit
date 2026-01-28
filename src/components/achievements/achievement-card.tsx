"use client";

import { motion } from "framer-motion";
import { AchievementIcon } from "@/components/gamification/achievement-icon";
import { cn } from "@/lib/utils";
import type { AchievementDefinition } from "@/lib/gamification";

interface AchievementCardProps {
  achievement: AchievementDefinition;
  unlocked: boolean;
  unlockedAt?: Date;
  index: number;
}

export function AchievementCard({
  achievement,
  unlocked,
  unlockedAt,
  index,
}: AchievementCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: index * 0.05,
      }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-shadow",
        unlocked
          ? "border-amber-200 bg-gradient-to-b from-amber-50/50 to-background shadow-sm hover:shadow-md dark:border-amber-900/30 dark:from-amber-950/20"
          : "border-border bg-muted/30 opacity-60 grayscale hover:opacity-80"
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-full",
          unlocked
            ? "bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950/40 dark:to-orange-950/40"
            : "bg-muted"
        )}
      >
        <AchievementIcon
          name={achievement.icon}
          locked={!unlocked}
          className={cn(
            "size-6",
            unlocked
              ? "text-amber-600 dark:text-amber-400"
              : "text-muted-foreground"
          )}
        />
      </div>

      {/* Name */}
      <h3 className="font-semibold text-sm leading-tight">
        {unlocked ? achievement.name : "???"}
      </h3>

      {/* Description */}
      <p className="text-xs text-muted-foreground leading-snug">
        {unlocked ? achievement.description : "Keep going to unlock this achievement!"}
      </p>

      {/* Unlock date */}
      {unlocked && unlockedAt && (
        <p className="text-[10px] text-muted-foreground/70 mt-auto pt-1">
          {new Date(unlockedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}

      {/* Unlocked badge */}
      {unlocked && (
        <div className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-green-500 text-white">
          <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </motion.div>
  );
}
