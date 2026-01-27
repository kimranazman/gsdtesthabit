"use client";

import { useTransition } from "react";
import { MoreHorizontal, Pencil, Archive, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HabitIcon } from "./habit-icon";
import { archiveHabit } from "@/lib/actions/habits";
import { DAYS_OF_WEEK } from "@/lib/constants";
import type { Habit, Category } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface HabitCardProps {
  habit: Habit;
  category?: Category | null;
  onEdit: (habit: Habit) => void;
  dragHandleProps?: Record<string, unknown>;
  isDragging?: boolean;
}

function getFrequencyLabel(habit: Habit): string {
  if (habit.frequency === "daily") return "Daily";
  if (habit.frequency === "weekly") return "Weekly";
  if (habit.frequency === "custom" && habit.frequencyDays) {
    const dayLabels = habit.frequencyDays
      .sort((a, b) => a - b)
      .map((d) => DAYS_OF_WEEK.find((day) => day.value === d)?.label ?? "")
      .filter(Boolean);
    return dayLabels.join(", ");
  }
  return "Custom";
}

export function HabitCard({
  habit,
  category,
  onEdit,
  dragHandleProps,
  isDragging,
}: HabitCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleArchive() {
    startTransition(async () => {
      await archiveHabit(habit.id);
    });
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border bg-card p-4 transition-all",
        isDragging && "shadow-lg ring-2 ring-primary/20 opacity-90",
        isPending && "opacity-50 pointer-events-none"
      )}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground opacity-40 md:opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing min-h-[44px] flex items-center"
        aria-label="Drag to reorder"
        {...dragHandleProps}
      >
        <GripVertical className="size-5" />
      </button>

      {/* Color indicator + Icon */}
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: habit.color + "20", color: habit.color }}
      >
        <HabitIcon name={habit.icon} className="size-5" />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-medium">{habit.name}</h3>
          {category && (
            <Badge variant="secondary" className="shrink-0 text-xs">
              {category.color && (
                <span
                  className="mr-1 inline-block size-2 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
              )}
              {category.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{getFrequencyLabel(habit)}</span>
          {habit.description && (
            <>
              <span className="text-border">|</span>
              <span className="truncate">{habit.description}</span>
            </>
          )}
        </div>
      </div>

      {/* Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">Actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => onEdit(habit)}>
            <Pencil className="size-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={handleArchive}
          >
            <Archive className="size-4" />
            Archive
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
