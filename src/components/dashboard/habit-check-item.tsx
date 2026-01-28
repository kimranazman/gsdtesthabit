"use client";

import { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { Check, MessageSquare, Loader2, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { HabitIcon } from "@/components/habits/habit-icon";
import { toggleCompletion, updateCompletionNotes } from "@/lib/actions/completions";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { SwipeableHabitCard } from "./swipeable-habit-card";
import { XpPopup } from "@/components/gamification/xp-popup";
import { useGamification } from "@/components/gamification/gamification-provider";
import type { HabitWithCompletion } from "@/lib/db/queries";

interface HabitCheckItemProps {
  habit: HabitWithCompletion;
  dateStr: string;
  currentStreak?: number;
  index?: number;
  onToggleRef?: (ref: HTMLButtonElement | null) => void;
}

export function HabitCheckItem({ habit, dateStr, currentStreak, index, onToggleRef }: HabitCheckItemProps) {
  // Optimistic state for completion toggle
  const [optimisticCompleted, setOptimisticCompleted] = useState(
    !!habit.completion
  );
  const [notes, setNotes] = useState(habit.completion?.notes ?? "");
  const [notesOpen, setNotesOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isNotesPending, startNotesTransition] = useTransition();
  const [justCompleted, setJustCompleted] = useState(false);
  const [xpGained, setXpGained] = useState<number | null>(null);
  const [xpTriggerKey, setXpTriggerKey] = useState(0);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const isCompleted = optimisticCompleted;
  const prefersReduced = useReducedMotion();
  const noMotion = !!prefersReduced;

  // Gamification context
  const { triggerGamificationEvents } = useGamification();

  // Register the toggle ref for keyboard shortcuts
  useEffect(() => {
    onToggleRef?.(toggleRef.current);
    return () => onToggleRef?.(null);
  }, [onToggleRef]);

  // Sync optimistic state when habit prop changes (e.g., from date navigation)
  useEffect(() => {
    setOptimisticCompleted(!!habit.completion);
    setNotes(habit.completion?.notes ?? "");
  }, [habit.completion]);

  const handleToggle = useCallback(() => {
    const wasCompleted = optimisticCompleted;
    // Optimistic update
    setOptimisticCompleted(!optimisticCompleted);

    // Trigger completion animation
    if (!wasCompleted) {
      setJustCompleted(true);
      setTimeout(() => setJustCompleted(false), 600);
    }

    startTransition(async () => {
      try {
        const result = await toggleCompletion(habit.id, dateStr);
        // Sync with server result
        setOptimisticCompleted(result.completed);
        if (!result.completed) {
          setNotes("");
        }

        // Trigger gamification effects on completion
        if (result.completed && result.gamification) {
          // Show +XP floating animation
          setXpGained(result.gamification.xpGained);
          setXpTriggerKey((k) => k + 1);

          // Trigger level-up / achievement celebrations
          triggerGamificationEvents(result.gamification);
        }
      } catch {
        // Revert on error
        setOptimisticCompleted(optimisticCompleted);
      }
    });
  }, [optimisticCompleted, habit.id, dateStr, triggerGamificationEvents]);

  // Swipe-triggered complete (only triggers if not already completed)
  const handleSwipeComplete = useCallback(() => {
    if (!optimisticCompleted) {
      handleToggle();
    }
  }, [optimisticCompleted, handleToggle]);

  // Swipe-triggered undo (only triggers if completed)
  const handleSwipeUndo = useCallback(() => {
    if (optimisticCompleted) {
      handleToggle();
    }
  }, [optimisticCompleted, handleToggle]);

  // Open notes popover
  const handleOpenNotes = useCallback(() => {
    setNotesOpen(true);
  }, []);

  function handleSaveNotes() {
    startNotesTransition(async () => {
      await updateCompletionNotes(habit.id, dateStr, notes);
      setNotesOpen(false);
      // If we're adding notes, the habit should be completed
      if (!optimisticCompleted && notes.trim()) {
        setOptimisticCompleted(true);
      }
    });
  }

  const cardContent = (
    <div
      className={cn(
        "group relative flex items-center gap-3 rounded-lg border p-4 transition-all duration-200",
        isCompleted
          ? "border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20"
          : "border-border bg-card hover:border-primary/20 hover:shadow-sm"
      )}
    >
      {/* XP floating animation */}
      <XpPopup amount={xpGained} triggerKey={xpTriggerKey} />
      {/* Keyboard shortcut badge */}
      {index != null && index < 9 && (
        <span className="hidden md:flex size-5 shrink-0 items-center justify-center rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground">
          {index + 1}
        </span>
      )}

      {/* Completion toggle button with spring animation */}
      <motion.button
        ref={toggleRef}
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200",
          isCompleted
            ? "border-green-500 bg-green-500 text-white"
            : "border-muted-foreground/30 bg-background hover:border-primary/50",
          isPending && "opacity-60"
        )}
        aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
        animate={
          noMotion
            ? undefined
            : justCompleted
              ? {
                  scale: [1, 1.3, 0.85, 1.15, 1],
                  rotate: [0, -8, 6, -3, 0],
                }
              : { scale: 1, rotate: 0 }
        }
        transition={
          noMotion
            ? undefined
            : {
                type: "spring",
                stiffness: 400,
                damping: 15,
                duration: 0.5,
              }
        }
        whileTap={noMotion ? undefined : { scale: 0.9 }}
        whileHover={noMotion ? undefined : { scale: 1.08 }}
      >
        <AnimatePresence mode="wait">
          {isPending ? (
            <motion.span
              key="loading"
              initial={noMotion ? undefined : { opacity: 0, scale: 0.5 }}
              animate={noMotion ? undefined : { opacity: 1, scale: 1 }}
              exit={noMotion ? undefined : { opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.15 }}
            >
              <Loader2 className="size-4 animate-spin" />
            </motion.span>
          ) : isCompleted ? (
            <motion.span
              key="check"
              initial={noMotion ? undefined : { opacity: 0, scale: 0 }}
              animate={noMotion ? undefined : { opacity: 1, scale: 1 }}
              exit={noMotion ? undefined : { opacity: 0, scale: 0 }}
              transition={
                noMotion
                  ? undefined
                  : { type: "spring", stiffness: 500, damping: 20 }
              }
            >
              <Check className="size-5" strokeWidth={3} />
            </motion.span>
          ) : (
            <motion.span
              key="empty"
              initial={noMotion ? undefined : { opacity: 0 }}
              animate={noMotion ? undefined : { opacity: 1 }}
              exit={noMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.1 }}
            />
          )}
        </AnimatePresence>
      </motion.button>

      {/* Habit icon + info */}
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg transition-opacity duration-200",
          isCompleted && "opacity-60"
        )}
        style={{
          backgroundColor: habit.color + "20",
          color: habit.color,
        }}
      >
        <HabitIcon name={habit.icon} className="size-5" />
      </div>

      {/* Content */}
      <div className={cn("min-w-0 flex-1", isCompleted && "opacity-70")}>
        <div className="flex items-center gap-2">
          <h3
            className={cn(
              "truncate font-medium transition-all duration-200",
              isCompleted && "line-through text-muted-foreground"
            )}
          >
            {habit.name}
          </h3>
          {currentStreak != null && currentStreak > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 dark:bg-orange-950/30 px-1.5 py-0.5 text-xs font-medium text-orange-600 dark:text-orange-400 shrink-0">
              <Flame className="size-3" />
              {currentStreak}
            </span>
          )}
        </div>
        {habit.description && (
          <p
            className={cn(
              "truncate text-sm text-muted-foreground",
              isCompleted && "line-through"
            )}
          >
            {habit.description}
          </p>
        )}
        {notes && isCompleted && (
          <p className="mt-1 truncate text-xs text-muted-foreground italic">
            {notes}
          </p>
        )}
      </div>

      {/* Notes button */}
      <Popover open={notesOpen} onOpenChange={setNotesOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "size-8 shrink-0 transition-opacity",
              notes
                ? "opacity-100 text-primary"
                : "opacity-0 group-hover:opacity-100"
            )}
            aria-label="Add note"
          >
            <MessageSquare className="size-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72">
          <div className="space-y-3">
            <p className="text-sm font-medium">Note for {habit.name}</p>
            <Textarea
              placeholder="Add a note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="resize-none text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotesOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveNotes}
                disabled={isNotesPending}
              >
                {isNotesPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );

  return (
    <SwipeableHabitCard
      isCompleted={isCompleted}
      onComplete={handleSwipeComplete}
      onOpenNotes={handleOpenNotes}
      onUndoComplete={handleSwipeUndo}
    >
      {cardContent}
    </SwipeableHabitCard>
  );
}
