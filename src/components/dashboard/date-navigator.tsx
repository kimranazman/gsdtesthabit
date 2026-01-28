"use client";

import { useCallback } from "react";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useReducedMotion, type PanInfo } from "framer-motion";
import { cn } from "@/lib/utils";

const DAY_SWIPE_THRESHOLD = 50; // px to trigger day change

interface DateNavigatorProps {
  formattedDate: string;
  isToday: boolean;
  onPrevDay: () => void;
  onNextDay: () => void;
  onGoToToday: () => void;
  canGoForward: boolean;
}

export function DateNavigator({
  formattedDate,
  isToday,
  onPrevDay,
  onNextDay,
  onGoToToday,
  canGoForward,
}: DateNavigatorProps) {
  const prefersReduced = useReducedMotion();
  const noMotion = !!prefersReduced;

  const handleDragEnd = useCallback(
    (_: unknown, info: PanInfo) => {
      const offsetX = info.offset.x;
      const velocityX = info.velocity.x;

      // Swipe right -> previous day
      if (offsetX > DAY_SWIPE_THRESHOLD || (offsetX > 30 && velocityX > 300)) {
        onPrevDay();
        return;
      }

      // Swipe left -> next day
      if (
        canGoForward &&
        (offsetX < -DAY_SWIPE_THRESHOLD || (offsetX < -30 && velocityX < -300))
      ) {
        onNextDay();
        return;
      }
    },
    [onPrevDay, onNextDay, canGoForward]
  );

  return (
    <div className="flex items-center justify-between gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevDay}
        aria-label="Previous day"
        className="size-9 shrink-0"
      >
        <ChevronLeft className="size-5" />
      </Button>

      <motion.div
        className={cn(
          "flex-1 text-center select-none cursor-grab active:cursor-grabbing",
          "rounded-lg px-3 py-1.5 transition-colors",
          isToday
            ? "bg-primary/10 text-primary font-semibold"
            : "bg-muted/50 text-foreground"
        )}
        drag={noMotion ? false : "x"}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        dragMomentum={false}
        onDragEnd={noMotion ? undefined : handleDragEnd}
        style={{ touchAction: "pan-y" }}
        whileTap={noMotion ? undefined : { scale: 0.98 }}
      >
        <div className="flex items-center justify-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">{formattedDate}</span>
        </div>
        {isToday && (
          <p className="text-xs text-primary/70 mt-0.5">Today</p>
        )}
      </motion.div>

      <div className="flex items-center gap-1 shrink-0">
        {!isToday && (
          <Button
            variant="outline"
            size="sm"
            onClick={onGoToToday}
            className="text-xs h-8 px-2"
          >
            Today
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextDay}
          disabled={!canGoForward}
          aria-label="Next day"
          className="size-9"
        >
          <ChevronRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}
