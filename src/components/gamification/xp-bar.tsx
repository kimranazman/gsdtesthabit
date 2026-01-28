"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface XpBarProps {
  level: number;
  xpIntoLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
  isMaxLevel: boolean;
  totalXp: number;
  className?: string;
}

export function XpBar({
  level,
  xpIntoLevel,
  xpNeededForNext,
  progressPercent,
  isMaxLevel,
  totalXp,
  className,
}: XpBarProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Level badge */}
      <div
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-[11px] font-bold text-white shadow-sm"
        title={`Level ${level} - ${totalXp} total XP`}
      >
        {level}
      </div>

      {/* XP progress bar */}
      <div className="hidden sm:flex flex-col gap-0.5 min-w-[100px]">
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.3 }}
          />
        </div>
        <span className="text-[10px] text-muted-foreground leading-none tabular-nums">
          {isMaxLevel ? (
            "MAX LEVEL"
          ) : (
            <>
              {xpIntoLevel}/{xpNeededForNext} XP
            </>
          )}
        </span>
      </div>
    </div>
  );
}
