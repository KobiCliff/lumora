"use client";

import { motion } from "framer-motion";
import {
  BadgeCheck,
  Check,
  Clock,
  Link2,
  MessageCircle,
  X,
} from "lucide-react";
import { fadeUpSlow, staggerMarketing } from "@/lib/motion";

const DM_BUBBLES = [
  { from: "client" as const, text: "Hey, are you in today?" },
  { from: "owner" as const, text: "Yes, I am. What time do you want to come?" },
  { from: "client" as const, text: "5:00 PM. How much for the style?" },
  { from: "owner" as const, text: "₦8,000. I'll keep a slot for you." },
  { from: "client" as const, text: "Okay, I'll come 🙏" },
];

const SLOTS = ["Tue 10:00", "Tue 2:30", "Wed 9:00"];

export default function ProblemSolution() {
  return (
    <section className="bg-ink-950 py-32">
      <motion.div
        variants={staggerMarketing}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-6xl px-6"
      >
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <p className="text-label text-lumora-400">The problem</p>
          <h2 className="mt-4 text-page text-white">
            Your money is stuck in the DMs.
          </h2>
          <p className="mt-6 text-lead text-ink-400">
            A no-show costs you money. A booking page costs you nothing. Right
            now you&apos;re running the whole thing out of a chat.
          </p>
        </div>

        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          {/* The DM way */}
          <motion.div
            variants={fadeUpSlow}
            className="flex flex-col rounded-panel border border-white/10 bg-white/5 p-8 shadow-lift-lg"
          >
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-full bg-danger/15 text-danger">
                  <MessageCircle className="size-6" />
                </span>
                <div>
                  <p className="text-nav font-semibold text-white">The DM way</p>
                  <p className="text-sm text-ink-400">
                    A normal Tuesday, across three chats
                  </p>
                </div>
              </div>
              <span className="rounded-chip border border-danger/30 px-3 py-1 text-label text-danger">
                Today
              </span>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-3">
              {DM_BUBBLES.map((bubble) => (
                <div
                  key={bubble.text}
                  className={bubble.from === "owner" ? "flex justify-end" : "flex justify-start"}
                >
                  <p
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      bubble.from === "owner"
                        ? "rounded-br-sm bg-lumora-600 text-white"
                        : "rounded-bl-sm bg-white/10 text-white/90"
                    }`}
                  >
                    {bubble.text}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3.5">
              <X className="size-4 shrink-0 text-danger" />
              <p className="text-sm font-semibold text-danger">
                5pm came and went. No client, no deposit, no record — and
                nothing to show for the whole chat.
              </p>
            </div>
          </motion.div>

          {/* The Lumora way */}
          <motion.div
            variants={fadeUpSlow}
            className="relative flex flex-col overflow-hidden rounded-panel border border-lumora-400/30 bg-white/5 p-8 shadow-glow"
          >
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="flex size-12 items-center justify-center rounded-full bg-linear-to-br from-lumora-500 to-accent-pink text-lg font-black text-white">
                  S
                </span>
                <div>
                  <p className="text-nav font-semibold text-white">
                    Styles by Amarachi
                  </p>
                  <p className="text-sm text-ink-400">Your booking link</p>
                </div>
              </div>
              <Link2 className="size-5 text-lumora-400" />
            </div>

            <div className="flex flex-1 flex-col justify-center gap-6">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-ink-900/60 px-5 py-4">
                <div>
                  <p className="text-nav font-semibold text-white">
                    Lemonade braids — full
                  </p>
                  <p className="text-sm text-ink-400">2 hours · In your chair</p>
                </div>
                <p className="text-section text-lumora-300">₦8,000</p>
              </div>

              <div>
                <p className="mb-3 text-label text-ink-400">Next open slots</p>
                <div className="flex flex-wrap gap-3">
                  {SLOTS.map((slot, i) => (
                    <span
                      key={slot}
                      className={`inline-flex items-center gap-2 rounded-chip px-4 py-2 text-sm font-semibold ${
                        i === 0
                          ? "bg-lumora-600 text-white"
                          : "border border-white/15 bg-white/5 text-white/80"
                      }`}
                    >
                      {i === 0 ? <Clock className="size-4" /> : null}
                      {slot}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/10 px-4 py-3.5">
                <Check className="size-4 shrink-0 text-success" />
                <p className="text-sm font-semibold text-success">
                  ₦2,000 deposit holds your slot
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <button
                type="button"
                className="w-full rounded-control bg-lumora-600 px-6 py-4 text-lg font-bold text-white shadow-lift transition-colors hover:bg-lumora-500"
              >
                Pay deposit & confirm
              </button>
              <p className="flex items-center justify-center gap-2 text-sm text-ink-400">
                <BadgeCheck className="size-4 text-lumora-400" />
                Booked. Reminder sent to Amarachi — and to you.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
