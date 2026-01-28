"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Activity, BarChart3, Home, ListChecks, Keyboard, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme-toggle";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { XpBar } from "@/components/gamification/xp-bar";
import { getUserStats } from "@/lib/actions/gamification";
import { getXpProgress } from "@/lib/gamification";
import { useState, useCallback, useEffect } from "react";

const navItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    label: "Habits",
    href: "/habits",
    icon: ListChecks,
  },
  {
    label: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
  {
    label: "Achievements",
    href: "/achievements",
    icon: Trophy,
  },
];

interface XpData {
  level: number;
  xpIntoLevel: number;
  xpNeededForNext: number;
  progressPercent: number;
  isMaxLevel: boolean;
  totalXp: number;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [xpData, setXpData] = useState<XpData | null>(null);

  const openShortcuts = useCallback(() => setShortcutsOpen(true), []);

  // Fetch XP data on mount and when path changes (to reflect new XP from completions)
  useEffect(() => {
    let cancelled = false;
    async function fetchXp() {
      try {
        const stats = await getUserStats();
        if (cancelled) return;
        const progress = getXpProgress(stats.totalXp);
        setXpData({
          level: progress.level,
          xpIntoLevel: progress.xpIntoLevel,
          xpNeededForNext: progress.xpNeededForNext,
          progressPercent: progress.progressPercent,
          isMaxLevel: progress.isMaxLevel,
          totalXp: stats.totalXp,
        });
      } catch {
        // Non-critical, silently fail
      }
    }
    fetchXp();
    return () => { cancelled = true; };
  }, [pathname]);

  // Global keyboard shortcuts for navigation and help
  useKeyboardShortcuts({
    shortcuts: [
      {
        key: "?",
        shift: true,
        description: "Show keyboard shortcuts",
        handler: openShortcuts,
      },
    ],
    sequences: [
      {
        keys: ["g", "d"],
        description: "Go to Dashboard",
        handler: () => router.push("/"),
      },
      {
        keys: ["g", "h"],
        description: "Go to Habits",
        handler: () => router.push("/habits"),
      },
      {
        keys: ["g", "a"],
        description: "Go to Analytics",
        handler: () => router.push("/analytics"),
      },
      {
        keys: ["g", "v"],
        description: "Go to Achievements",
        handler: () => router.push("/achievements"),
      },
    ],
  });

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 max-w-screen-xl items-center px-4">
          {/* Logo */}
          <Link href="/" className="mr-6 flex items-center gap-2 font-semibold">
            <Activity className="size-5 text-primary" />
            <span className="hidden sm:inline-block">HabitTracker</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex md:items-center md:gap-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Desktop actions */}
          <div className="flex items-center gap-1">
            {/* XP bar */}
            {xpData && (
              <Link href="/achievements" className="mr-1">
                <XpBar {...xpData} />
              </Link>
            )}

            {/* Keyboard shortcuts button (desktop only) */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden md:inline-flex size-9"
                  onClick={openShortcuts}
                  aria-label="Keyboard shortcuts"
                >
                  <Keyboard className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Keyboard shortcuts (?)</TooltipContent>
            </Tooltip>

            {/* Theme toggle */}
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Keyboard shortcuts dialog */}
      <KeyboardShortcutsDialog
        open={shortcutsOpen}
        onOpenChange={setShortcutsOpen}
      />
    </>
  );
}
