"use client";

import { ThemeProvider } from "next-themes";
import { GamificationProvider } from "@/components/gamification/gamification-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
    >
      <GamificationProvider>
        {children}
      </GamificationProvider>
    </ThemeProvider>
  );
}
