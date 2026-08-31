"use client";

import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useEffect } from "react";
import { EASE, cardHover, fadeUp, scaleIn } from "@/lib/motion";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: number;
  /** e.g. "₦" */
  prefix?: string;
  /** e.g. "%" */
  suffix?: string;
  decimals?: number;
  /** Percent change vs. the previous period. */
  delta?: number;
  /** For metrics where down is the good direction, e.g. no-show rate. */
  lowerIsBetter?: boolean;
  /** A bare icon element — the badge sizes it. Props stay serializable so
   *  server components can render this card directly. */
  icon?: React.ReactNode;
};

/**
 * The dashboard's answer to the Hero's oversized display type: a big number
 * that *arrives*. The count-up is driven by a MotionValue rendered directly as
 * a child, so it animates without re-rendering React 60 times a second.
 */
export default function StatCard({
  label,
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  delta,
  lowerIsBetter = false,
  icon,
}: StatCardProps) {
  const reduceMotion = useReducedMotion();
  const count = useMotionValue(reduceMotion ? value : 0);
  const display = useTransform(count, (latest) => {
    const formatted = latest.toLocaleString("en-NG", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (reduceMotion) {
      count.set(value);
      return;
    }
    const controls = animate(count, value, {
      duration: 0.9,
      ease: EASE,
      delay: 0.15,
    });
    return () => controls.stop();
  }, [count, reduceMotion, value]);

  const improving =
    delta === undefined ? false : lowerIsBetter ? delta < 0 : delta > 0;
  const DeltaIcon = (delta ?? 0) >= 0 ? ArrowUpRight : ArrowDownRight;

  return (
    <motion.div
      variants={fadeUp}
      {...cardHover}
      className="group relative overflow-hidden rounded-card border border-hairline bg-surface p-7 shadow-lift transition-shadow duration-300 hover:shadow-lift-lg"
    >
      {/* The landing page's gradient, quietly — it surfaces on hover. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-br from-lumora-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="relative flex items-start justify-between gap-4">
        <p className="text-label uppercase text-muted">{label}</p>
        {icon ? (
          <span className="grid size-10 shrink-0 place-items-center rounded-chip bg-lumora-500/10 text-lumora-600 [&>svg]:size-5 dark:text-lumora-400">
            {icon}
          </span>
        ) : null}
      </div>

      <motion.p className="relative mt-4 text-metric tabular-nums text-strong">
        {display}
      </motion.p>

      {delta !== undefined ? (
        <motion.p
          variants={scaleIn}
          className={cn(
            "relative mt-4 inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1 text-sm font-semibold",
            improving ? "bg-success/10 text-success" : "bg-danger/10 text-danger",
          )}
        >
          <DeltaIcon className="size-4" />
          {delta > 0 ? "+" : ""}
          {delta.toFixed(1)}%
          <span className="font-normal text-muted">vs last month</span>
        </motion.p>
      ) : null}
    </motion.div>
  );
}
