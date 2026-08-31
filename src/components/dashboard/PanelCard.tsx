"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";
import { cn } from "@/lib/utils";

type PanelCardProps = {
  title: string;
  subtitle?: string;
  /** Top-right slot, e.g. a range selector. */
  action?: React.ReactNode;
  /** Adds the brand glow — reserve it for the one hero panel on a page. */
  glow?: boolean;
  className?: string;
  children: React.ReactNode;
};

/** The large content container: charts, tables, forms. */
export default function PanelCard({
  title,
  subtitle,
  action,
  glow = false,
  className,
  children,
}: PanelCardProps) {
  return (
    <motion.section
      variants={fadeUp}
      className={cn(
        "rounded-panel border border-hairline bg-surface p-8",
        glow ? "shadow-glow" : "shadow-lift",
        className,
      )}
    >
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-section text-strong">{title}</h2>
          {subtitle ? <p className="mt-2 text-muted">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </motion.section>
  );
}
