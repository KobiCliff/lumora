"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerProduct } from "@/lib/motion";

type PageShellProps = {
  title: string;
  subtitle?: string;
  /** Top-right action, e.g. a primary Button. */
  action?: React.ReactNode;
  children: React.ReactNode;
};

/**
 * Every dashboard page's outer wrapper. Owns the stagger container, so any
 * `motion` descendant with `variants` and no `initial`/`animate` of its own
 * joins the page's entrance sequence automatically.
 */
export default function PageShell({
  title,
  subtitle,
  action,
  children,
}: PageShellProps) {
  return (
    <motion.div
      variants={staggerProduct}
      initial="hidden"
      animate="show"
      className="relative"
    >
      {/* The dialed-back descendant of the Hero's floating shapes. */}
      <div
        aria-hidden
        className="animate-float-up pointer-events-none absolute -top-48 left-1/2 h-96 w-[52rem] -translate-x-1/2 bg-brand-glow opacity-60 dark:opacity-100"
      />

      <motion.header
        variants={fadeUp}
        className="relative mb-10 flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-page text-strong">{title}</h1>
          {subtitle ? (
            <p className="mt-3 max-w-xl text-lg text-muted">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </motion.header>

      <div className="relative">{children}</div>
    </motion.div>
  );
}
