"use client";

import { motion } from "framer-motion";
import { fadeUpSlow, staggerMarketing } from "@/lib/motion";

const FAQS = [
  {
    q: "How do deposits work?",
    a: "Clients pay a deposit to hold their slot. It comes off their total, and you keep it if they no-show. The balance is settled at the appointment.",
  },
  {
    q: "When will I get my link?",
    a: "We're shipping early access in waves. Founding businesses get first pick of booking links and founding rates — join the waitlist and you're in line.",
  },
  {
    q: "What does it cost?",
    a: "Pricing isn't finalised yet. Founding members will lock in a founding rate — expect it to cost less than one no-show a month.",
  },
  {
    q: "What if I don't have fixed prices or hours?",
    a: "You can set up whenever you're ready. Even a rough price list and a couple of working days beat three chats per client.",
  },
  {
    q: "Will my clients need to download anything?",
    a: "No. Your booking link works in any browser — WhatsApp, Instagram, anywhere. One tap and they're booking.",
  },
];

export default function FAQ() {
  return (
    <section className="bg-ink-950 py-32">
      <motion.div
        variants={staggerMarketing}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto max-w-3xl px-6"
      >
        <div className="mb-16 text-center">
          <p className="text-label text-lumora-400">Questions</p>
          <h2 className="mt-4 text-page text-white">Straight answers.</h2>
          <span className="mt-6 inline-block rounded-chip border border-white/15 bg-white/5 px-4 py-2 text-label text-ink-400">
            Founding-team note: answers to be finalised at launch
          </span>
        </div>

        <div className="space-y-4">
          {FAQS.map(({ q, a }) => (
            <motion.div
              key={q}
              variants={fadeUpSlow}
              className="rounded-card border border-white/10 bg-white/5 p-6 shadow-lift"
            >
              <h3 className="text-lg font-semibold text-white">{q}</h3>
              <p className="mt-2 text-ink-400">{a}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
