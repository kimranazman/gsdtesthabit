"use client";

import { useState, useTransition } from "react";
import { Plus, Settings, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { CategoryFormDialog } from "./category-form-dialog";
import { deleteCategory } from "@/lib/actions/categories";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/db/schema";

interface CategoryManagerProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function CategoryManager({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryManagerProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [, startTransition] = useTransition();

  function handleEdit(cat: Category) {
    setEditingCategory(cat);
    setFormOpen(true);
  }

  function handleDelete(cat: Category) {
    startTransition(async () => {
      await deleteCategory(cat.id);
      if (selectedCategoryId === cat.id) {
        onSelectCategory(null);
      }
    });
  }

  function handleFormClose(open: boolean) {
    setFormOpen(open);
    if (!open) {
      setEditingCategory(null);
    }
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {/* "All" filter */}
      <button
        type="button"
        onClick={() => onSelectCategory(null)}
        className={cn(
          "inline-flex shrink-0 items-center rounded-full border px-3 py-1.5 text-sm font-medium transition-colors min-h-[36px]",
          selectedCategoryId === null
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border hover:bg-accent"
        )}
      >
        All
      </button>

      {/* Category filter pills */}
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelectCategory(cat.id)}
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors min-h-[36px]",
            selectedCategoryId === cat.id
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border hover:bg-accent"
          )}
        >
          {cat.color && (
            <span
              className={cn(
                "inline-block size-2 rounded-full",
                selectedCategoryId === cat.id && "opacity-80"
              )}
              style={{ backgroundColor: selectedCategoryId === cat.id ? "currentColor" : cat.color }}
            />
          )}
          {cat.name}
        </button>
      ))}

      {/* Manage categories */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="ml-1 shrink-0 gap-1">
            <Settings className="size-3.5" />
            Categories
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Manage Categories</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {categories.length === 0 && (
            <div className="px-2 py-3 text-center text-sm text-muted-foreground">
              No categories yet.
            </div>
          )}
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between px-2 py-1.5">
              <span className="flex items-center gap-2 text-sm">
                {cat.color && (
                  <span
                    className="inline-block size-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
                {cat.name}
              </span>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleEdit(cat)}
                >
                  <Pencil className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDelete(cat)}
                >
                  <Trash2 className="size-3 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setEditingCategory(null);
              setFormOpen(true);
            }}
          >
            <Plus className="size-4" />
            New Category
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={handleFormClose}
        category={editingCategory}
      />
    </div>
  );
}
