"use client";

import { type ReactNode } from "react";
import {
  motion,
  type Variants,
  type Transition,
  useReducedMotion,
} from "framer-motion";

// ---------------------------------------------------------------------------
// Shared transition presets
// ---------------------------------------------------------------------------

export const springTransition: Transition = {
  type: "spring",
  stiffness: 350,
  damping: 30,
};

export const gentleSpring: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 25,
};

export const tweenFast: Transition = {
  type: "tween",
  duration: 0.2,
  ease: "easeOut",
};

export const tweenMedium: Transition = {
  type: "tween",
  duration: 0.35,
  ease: [0.25, 0.1, 0.25, 1],
};

// ---------------------------------------------------------------------------
// Variant presets
// ---------------------------------------------------------------------------

export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: tweenMedium },
  exit: { opacity: 0, transition: tweenFast },
};

export const fadeInUpVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: tweenMedium },
  exit: { opacity: 0, y: -8, transition: tweenFast },
};

export const scaleInVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: gentleSpring,
  },
  exit: { opacity: 0, scale: 0.95, transition: tweenFast },
};

export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: { opacity: 0, y: -10, transition: tweenFast },
};

// Stagger container + item
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "tween", duration: 0.3, ease: "easeOut" },
  },
};

// Reduced-motion safe variants (no transform, just opacity)
const noMotionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 1, transition: { duration: 0 } },
};

const noMotionStaggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

const noMotionStaggerItem: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0 } },
};

// ---------------------------------------------------------------------------
// FadeIn component
// ---------------------------------------------------------------------------

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      variants={prefersReduced ? noMotionVariants : fadeInVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={delay > 0 ? { delay } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// FadeInUp component
// ---------------------------------------------------------------------------

interface FadeInUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function FadeInUp({ children, className, delay = 0 }: FadeInUpProps) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      variants={prefersReduced ? noMotionVariants : fadeInUpVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={delay > 0 ? { delay } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// SlideUp component
// ---------------------------------------------------------------------------

interface SlideUpProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function SlideUp({ children, className, delay = 0 }: SlideUpProps) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      variants={prefersReduced ? noMotionVariants : slideUpVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={delay > 0 ? { delay } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ScaleIn component
// ---------------------------------------------------------------------------

interface ScaleInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function ScaleIn({ children, className, delay = 0 }: ScaleInProps) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      variants={prefersReduced ? noMotionVariants : scaleInVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={delay > 0 ? { delay } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// StaggerContainer + StaggerItem
// ---------------------------------------------------------------------------

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.06,
}: StaggerContainerProps) {
  const prefersReduced = useReducedMotion();

  const containerVariants: Variants = prefersReduced
    ? noMotionStaggerContainer
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.04,
          },
        },
      };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      variants={prefersReduced ? noMotionStaggerItem : staggerItemVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// AnimatedCard - a card-like entrance animation wrapper
// ---------------------------------------------------------------------------

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({
  children,
  className,
  delay = 0,
}: AnimatedCardProps) {
  const prefersReduced = useReducedMotion();

  const cardVariants: Variants = prefersReduced
    ? noMotionVariants
    : {
        hidden: { opacity: 0, y: 8, scale: 0.98 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            ...tweenMedium,
            delay,
          },
        },
        exit: {
          opacity: 0,
          scale: 0.96,
          transition: tweenFast,
        },
      };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
