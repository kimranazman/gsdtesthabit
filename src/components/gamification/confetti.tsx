"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ConfettiCelebrationProps {
  /** Whether to show the celebration overlay */
  show: boolean;
  /** New level reached */
  level: number;
  /** Called when the animation completes */
  onComplete: () => void;
}

// Confetti particle configuration
const PARTICLE_COUNT = 60;
const COLORS = [
  "#f59e0b", // amber
  "#ef4444", // red
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#10b981", // emerald
  "#f97316", // orange
  "#ec4899", // pink
  "#06b6d4", // cyan
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  shape: "rect" | "circle";
}

function createParticles(): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 800),
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 3 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    });
  }
  return particles;
}

function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>(createParticles());
  const animationRef = useRef<number>(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const particles = particlesRef.current;
    let alive = false;

    for (const p of particles) {
      p.x += p.vx;
      p.vy += 0.1; // gravity
      p.y += p.vy;
      p.vx *= 0.99; // friction
      p.rotation += p.rotationSpeed;

      if (p.y < canvas.height + 20) {
        alive = true;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;

      if (p.shape === "rect") {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (alive) {
      animationRef.current = requestAnimationFrame(animate);
    }
  }, []);

  useEffect(() => {
    particlesRef.current = createParticles();
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}

export function ConfettiCelebration({
  show,
  level,
  onComplete,
}: ConfettiCelebrationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onComplete, 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Confetti particles */}
          <ConfettiCanvas />

          {/* Level up text overlay */}
          <motion.div
            className="pointer-events-none fixed inset-0 z-[101] flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex flex-col items-center gap-3"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
            >
              {/* Glow effect behind badge */}
              <motion.div
                className="absolute size-32 rounded-full bg-amber-400/20 blur-2xl"
                animate={{
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Level badge */}
              <motion.div
                className="relative flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 text-3xl font-extrabold text-white shadow-2xl"
                animate={{
                  rotate: [0, -5, 5, -3, 3, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: 0.5,
                  ease: "easeInOut",
                }}
              >
                {level}
              </motion.div>

              {/* Text */}
              <motion.p
                className="text-2xl font-extrabold tracking-wider text-amber-500 dark:text-amber-400 drop-shadow-lg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                LEVEL UP!
              </motion.p>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
