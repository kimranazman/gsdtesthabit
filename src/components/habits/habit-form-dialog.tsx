"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HabitIcon } from "./habit-icon";
import { cn } from "@/lib/utils";
import {
  HABIT_COLORS,
  HABIT_ICONS,
  FREQUENCY_OPTIONS,
  DAYS_OF_WEEK,
} from "@/lib/constants";
import {
  createHabit,
  updateHabit,
  type HabitFormData,
} from "@/lib/actions/habits";
import type { Habit, Category } from "@/lib/db/schema";

interface HabitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habit?: Habit | null;
  categories: Category[];
}

export function HabitFormDialog({
  open,
  onOpenChange,
  habit,
  categories,
}: HabitFormDialogProps) {
  const isEditing = !!habit;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState(habit?.name ?? "");
  const [description, setDescription] = useState(habit?.description ?? "");
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "custom">(
    (habit?.frequency as "daily" | "weekly" | "custom") ?? "daily"
  );
  const [frequencyDays, setFrequencyDays] = useState<number[]>(
    habit?.frequencyDays ?? []
  );
  const [color, setColor] = useState(habit?.color ?? "#6366f1");
  const [icon, setIcon] = useState(habit?.icon ?? "circle-check");
  const [categoryId, setCategoryId] = useState<string | null>(
    habit?.categoryId ?? null
  );

  // Reset form when dialog opens with new data
  function resetForm() {
    setName(habit?.name ?? "");
    setDescription(habit?.description ?? "");
    setFrequency(
      (habit?.frequency as "daily" | "weekly" | "custom") ?? "daily"
    );
    setFrequencyDays(habit?.frequencyDays ?? []);
    setColor(habit?.color ?? "#6366f1");
    setIcon(habit?.icon ?? "circle-check");
    setCategoryId(habit?.categoryId ?? null);
    setError(null);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      resetForm();
    }
    onOpenChange(nextOpen);
  }

  function toggleDay(day: number) {
    setFrequencyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data: HabitFormData = {
      name: name.trim(),
      description: description.trim() || undefined,
      frequency,
      frequencyDays: frequency === "custom" ? frequencyDays : undefined,
      color,
      icon,
      categoryId: categoryId || null,
    };

    startTransition(async () => {
      const result = isEditing
        ? await updateHabit(habit.id, data)
        : await createHabit(data);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      onOpenChange(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Habit" : "New Habit"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update your habit details."
              : "Create a new habit to track."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="habit-name">Name *</Label>
            <Input
              id="habit-name"
              placeholder="e.g., Morning Exercise"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="habit-description">Description</Label>
            <Textarea
              id="habit-description"
              placeholder="Optional description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={2}
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={frequency}
              onValueChange={(v) =>
                setFrequency(v as "daily" | "weekly" | "custom")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FREQUENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Custom days picker */}
            {frequency === "custom" && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {DAYS_OF_WEEK.map((day) => (
                  <Button
                    key={day.value}
                    type="button"
                    variant={
                      frequencyDays.includes(day.value) ? "default" : "outline"
                    }
                    size="sm"
                    className="h-8 w-11 text-xs"
                    onClick={() => toggleDay(day.value)}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categoryId ?? "none"}
                onValueChange={(v) =>
                  setCategoryId(v === "none" ? null : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        {cat.color && (
                          <span
                            className="inline-block size-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                        )}
                        {cat.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  className={cn(
                    "size-8 rounded-full border-2 transition-all hover:scale-110",
                    color === c.value
                      ? "border-foreground scale-110"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: c.value }}
                  onClick={() => setColor(c.value)}
                />
              ))}
            </div>
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <ScrollArea className="h-[120px] rounded-md border p-2">
              <div className="grid grid-cols-8 gap-1.5">
                {HABIT_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    title={iconName}
                    className={cn(
                      "flex size-9 items-center justify-center rounded-md border transition-colors",
                      icon === iconName
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-transparent hover:bg-accent"
                    )}
                    onClick={() => setIcon(iconName)}
                  >
                    <HabitIcon name={iconName} className="size-5" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save Changes"
                  : "Create Habit"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
