"use client";

import { motion } from "framer-motion";
import { CalendarClock, Link2, Settings2 } from "lucide-react";
import { fadeUpSlow, staggerMarketing } from "@/lib/motion";

const STEPS = [
  {
    n: "01",
    icon: Settings2,
    title: "Set up",
    desc: "Add your services, prices and hours once. Ten minutes — no tech skills needed.",
  },
  {
    n: "02",
    icon: Link2,
    title: "Share your link",
    desc: "Put it in your bio, drop it in a chat, pin it in your WhatsApp status. One link, everywhere.",
  },
  {
    n: "03",
    icon: CalendarClock,
    title: "They book — deposit included",
    desc: "Clients pick a real slot and pay a deposit to hold it. You just show up and work.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-ink-950 py-32">
      <motion.div
        variants={staggerMarketing}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-6xl px-6"
      >
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-label text-lumora-400">How it works</p>
          <h2 className="mt-4 text-page text-white">
            Three steps. One link. Zero back-and-forth.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {STEPS.map(({ n, icon: Icon, title, desc }) => (
            <motion.div
              key={n}
              variants={fadeUpSlow}
              className="relative rounded-panel border border-white/10 bg-white/5 p-8 shadow-lift"
            >
              <p className="text-metric text-lumora-400/50">{n}</p>
              <span className="mt-6 flex size-14 items-center justify-center rounded-2xl bg-lumora-500/15 text-lumora-400">
                <Icon className="size-7" />
              </span>
              <h3 className="mt-6 text-section text-white">{title}</h3>
              <p className="mt-3 text-ink-400">{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
