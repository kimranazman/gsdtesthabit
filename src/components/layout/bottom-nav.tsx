"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ListChecks, BarChart3, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Dashboard", href: "/", icon: Home },
  { label: "Habits", href: "/habits", icon: ListChecks },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Achievements", href: "/achievements", icon: Trophy },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      role="navigation"
      aria-label="Bottom navigation"
    >
      {/* Backdrop blur background with top border */}
      <div className="border-t bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div
          className="flex items-stretch justify-around"
          style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        >
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors tap-feedback",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground active:text-foreground"
                )}
              >
                {/* Animated active indicator (top bar) */}
                {isActive && (
                  <motion.span
                    layoutId="bottom-nav-indicator"
                    className="absolute top-0 left-3 right-3 h-0.5 rounded-full bg-primary"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 30,
                    }}
                  />
                )}

                {/* Icon with scale animation on active */}
                <motion.span
                  animate={{
                    scale: isActive ? 1 : 0.9,
                    opacity: isActive ? 1 : 0.6,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  <tab.icon
                    className={cn(
                      "size-5",
                      isActive && "stroke-[2.5px]"
                    )}
                  />
                </motion.span>

                {/* Label */}
                <span
                  className={cn(
                    "leading-none",
                    isActive ? "font-semibold" : "font-medium"
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
