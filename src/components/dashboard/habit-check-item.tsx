"use client";

import { useState, useTransition, useRef, useEffect } from "react";
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
  const toggleRef = useRef<HTMLButtonElement>(null);

  const isCompleted = optimisticCompleted;

  // Register the toggle ref for keyboard shortcuts
  useEffect(() => {
    onToggleRef?.(toggleRef.current);
    return () => onToggleRef?.(null);
  }, [onToggleRef]);

  function handleToggle() {
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
      } catch {
        // Revert on error
        setOptimisticCompleted(optimisticCompleted);
      }
    });
  }

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

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-4 transition-all duration-200",
        isCompleted
          ? "border-green-200 bg-green-50/50 dark:border-green-900/30 dark:bg-green-950/20"
          : "border-border bg-card hover:border-primary/20 hover:shadow-sm"
      )}
    >
      {/* Keyboard shortcut badge */}
      {index != null && index < 9 && (
        <span className="hidden md:flex size-5 shrink-0 items-center justify-center rounded border border-border bg-muted text-[10px] font-mono text-muted-foreground">
          {index + 1}
        </span>
      )}

      {/* Completion toggle button */}
      <button
        ref={toggleRef}
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200",
          isCompleted
            ? "border-green-500 bg-green-500 text-white"
            : "border-muted-foreground/30 bg-background hover:border-primary/50",
          isPending && "opacity-60",
          justCompleted && "animate-bounce-check"
        )}
        aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
      >
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : isCompleted ? (
          <Check className={cn("size-5", justCompleted && "animate-check-draw")} strokeWidth={3} />
        ) : null}
      </button>

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
}
