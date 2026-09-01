"use client";

import { motion } from "framer-motion";
import {
  Banknote,
  CalendarCheck,
  LayoutDashboard,
  Link2,
} from "lucide-react";
import { fadeUpSlow, staggerMarketing } from "@/lib/motion";

const FEATURES = [
  {
    icon: Link2,
    title: "Your name on the link",
    desc: "A real booking page with your business name on it — services, prices, availability. Put it in your bio and let it book for you.",
  },
  {
    icon: CalendarCheck,
    title: "No more “is today free?”",
    desc: "Your real availability updates itself. Clients see the open slots and pick one — no back-and-forth, no chasing.",
  },
  {
    icon: Banknote,
    title: "Deposits, not promises",
    desc: "Take a deposit when clients book, so “I’ll be there” actually means it. No-shows stop eating your money.",
  },
  {
    icon: LayoutDashboard,
    title: "One dashboard, every booking",
    desc: "Bookings, revenue, no-shows — all tracked, all in one place. You finally see exactly what your business is making.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-ink-950 py-32">
      <motion.div
        variants={staggerMarketing}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-6xl px-6"
      >
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-label text-lumora-400">The tools</p>
          <h2 className="mt-4 text-page text-white">
            Everything a real business runs on.
          </h2>
        </div>

        <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={fadeUpSlow} className="text-center">
              <Icon className="mx-auto mb-6 size-16 text-lumora-400" />
              <h3 className="mb-4 text-section text-white">{title}</h3>
              <p className="text-ink-400">{desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
