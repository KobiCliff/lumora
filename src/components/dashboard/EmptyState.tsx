"use client";

import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

type EmptyStateProps = {
  /** A bare icon element — the badge sizes it. */
  icon: React.ReactNode;
  title: string;
  description: string;
  /** Small all-caps note under the copy, e.g. what ships next. */
  hint?: string;
  action?: React.ReactNode;
};

export default function EmptyState({
  icon,
  title,
  description,
  hint,
  action,
}: EmptyStateProps) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-panel border border-dashed border-hairline bg-surface/70 p-14 text-center shadow-lift"
    >
      <span className="mx-auto mb-6 grid size-16 place-items-center rounded-card bg-lumora-500/10 text-lumora-600 [&>svg]:size-8 dark:text-lumora-400">
        {icon}
      </span>
      <h2 className="text-section text-strong">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-muted">{description}</p>
      {action ? <div className="mt-8">{action}</div> : null}
      {hint ? <p className="mt-8 text-label uppercase text-muted">{hint}</p> : null}
    </motion.div>
  );
}
