"use client";

import { motion, AnimatePresence } from "framer-motion";

interface XpPopupProps {
  /** Amount of XP to show; set to 0/null to hide */
  amount: number | null;
  /** Unique key to re-trigger animation */
  triggerKey: number;
}

/**
 * Floating "+N XP" animation that appears above a habit on completion.
 * Floats upward and fades out.
 */
export function XpPopup({ amount, triggerKey }: XpPopupProps) {
  return (
    <AnimatePresence mode="wait">
      {amount != null && amount > 0 && (
        <motion.div
          key={triggerKey}
          className="pointer-events-none absolute -top-2 right-2 z-10 text-sm font-bold text-amber-500 dark:text-amber-400"
          initial={{ opacity: 1, y: 0, scale: 0.8 }}
          animate={{ opacity: 0, y: -32, scale: 1.1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          +{amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  );
}
