"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { fadeUpSlow, staggerMarketing } from "@/lib/motion";

const TRADES = [
  "Braids",
  "Nails",
  "Barbers",
  "Makeup",
  "Tutoring",
  "Detailing",
  "Tailoring",
  "Photography",
  "Fitness coaching",
  "Event styling",
];

const SIGNS = [
  "Clients who come back — and bring their friends.",
  "A calendar that's full, but you still have to ask who's coming.",
  "Tired of sounding like a side hustle when you're not one.",
];

export default function WhoItsFor() {
  return (
    <section className="bg-ink-950 py-32">
      <motion.div
        variants={staggerMarketing}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto grid max-w-6xl items-center gap-16 px-6 lg:grid-cols-2"
      >
        <motion.div variants={fadeUpSlow}>
          <p className="text-label text-lumora-400">Who it&apos;s for</p>
          <h2 className="mt-4 text-page text-white">
            Built for the business you&apos;re already running.
          </h2>
          <p className="mt-6 text-lead text-ink-400">
            You learned the craft, built the client list and started charging
            real money. You&apos;re just still running everything out of your
            DMs.
          </p>
          <ul className="mt-10 space-y-4">
            {SIGNS.map((sign) => (
              <li key={sign} className="flex items-start gap-4">
                <span className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-lumora-500/20 text-lumora-400">
                  <Check className="size-4" />
                </span>
                <p className="text-lg text-white/85">{sign}</p>
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          variants={fadeUpSlow}
          className="rounded-panel border border-lumora-400/25 bg-white/5 p-10 shadow-lift-lg"
        >
          <p className="text-label text-lumora-400">Any trade. Every trade.</p>
          <p className="mt-4 text-section text-white">
            If it&apos;s your skill and your phone, Lumora is your booking
            link.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {TRADES.map((trade) => (
              <span
                key={trade}
                className="rounded-chip border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85"
              >
                {trade}
              </span>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
