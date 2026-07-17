'use client';

/**
 * Reusable scroll/motion primitives built on framer-motion.
 * All degrade gracefully under prefers-reduced-motion (framer-motion respects
 * the `useReducedMotion` hook, applied via the MotionConfig in the root).
 */
import { motion, useScroll, useSpring, useInView, useMotionValue, useTransform, animate, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

// Shared easing — a confident, slightly fast deceleration (not the bouncy default).
const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────────────── Reveal ─────────────────────────
   Fade + rise into view. Set `delay` for staggered sequencing. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  once = true,
  style,
  as = "div",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  once?: boolean;
  style?: CSSProperties;
  as?: "div" | "li" | "span";
}) {
  const MotionTag = motion[as];
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
      style={style}
    >
      {children}
    </MotionTag>
  );
}

/* Convenience: stagger a group of children. Wrap items in <StaggerItem>. */
export function StaggerGroup({
  children,
  stagger = 0.1,
  once = true,
  style,
}: {
  children: ReactNode;
  stagger?: number;
  once?: boolean;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

export function StaggerItem({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <motion.div variants={itemVariants} style={style}>
      {children}
    </motion.div>
  );
}

/* ───────────────────────── Parallax ─────────────────────────
   Subtle vertical parallax tied to scroll position. Use for background
   orbs / decorative layers, never for text (keeps readability high). */
export function Parallax({
  children,
  speed = 0.3,
  style,
}: {
  children: ReactNode;
  speed?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * -120}px`, `${speed * 120}px`]);
  return (
    <div ref={ref} style={{ position: "absolute", inset: 0, pointerEvents: "none", ...style }}>
      <motion.div style={{ y, width: "100%", height: "100%" }}>{children}</motion.div>
    </div>
  );
}

/* ───────────────────────── Counter ─────────────────────────
   Animated count-up when scrolled into view. */
export function Counter({
  to,
  duration = 1.8,
  suffix = "",
  prefix = "",
  decimals = 0,
  style,
}: {
  to: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration,
      ease: EASE,
      onUpdate: (v) => setVal(v),
    });
    return () => controls.stop();
  }, [inView, to, duration]);

  return (
    <span ref={ref} style={style}>
      {prefix}
      {val.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  );
}

/* ───────────────────────── TiltCard ─────────────────────────
   3D tilt on mouse move with a soft glare. Falls back to static if the
   pointer is coarse (touch). */
export function TiltCard({
  children,
  style,
  glareColor = "rgba(255,255,255,0.06)",
  max = 8,
}: {
  children: ReactNode;
  style?: CSSProperties;
  glareColor?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const [active, setActive] = useState(false);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
    gx.set(px * 100);
    gy.set(py * 100);
  }
  function reset() {
    rx.set(0); ry.set(0); setActive(false);
  }

  const glareBg = useTransform(
    [gx, gy],
    ([x, y]: number[]) => `radial-gradient(circle at ${x}% ${y}%, ${glareColor}, transparent 55%)`
  );

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={reset}
      style={{
        transformStyle: "preserve-3d",
        rotateX: rx,
        rotateY: ry,
        position: "relative",
        transition: "transform 0.1s ease-out",
        ...style,
      }}
    >
      {children}
      <motion.div
        aria-hidden
        style={{
          position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none",
          background: glareBg, opacity: active ? 1 : 0, transition: "opacity 0.3s",
        }}
      />
    </motion.div>
  );
}

/* ───────────────────────── ScrollProgress ─────────────────────────
   Thin gold bar pinned to the top of the viewport showing scroll progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 2, zIndex: 1100,
        transformOrigin: "0%", scaleX,
        background: "linear-gradient(90deg, #C9A84C, #DDBE66, #6BA3FF)",
      }}
    />
  );
}

export { EASE };
