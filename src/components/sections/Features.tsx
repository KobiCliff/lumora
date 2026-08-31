"use client";

import { motion } from "framer-motion";
import { Shield, Sparkles, Zap } from "lucide-react";
import { fadeUpSlow, staggerMarketing } from "@/lib/motion";

const FEATURES = [
  {
    icon: Zap,
    title: "Blazing Fast",
    desc: "Built with Next.js + React Server Components",
  },
  {
    icon: Shield,
    title: "Secure by Default",
    desc: "End-to-end encryption, SOC 2 compliant",
  },
  {
    icon: Sparkles,
    title: "Beautiful Out The Box",
    desc: "Design that makes your users say wow",
  },
];

export default function Features() {
  return (
    // id="features" is what the Hero's "Learn More" anchor points at.
    <section id="features" className="bg-ink-950 py-32">
      <motion.div
        variants={staggerMarketing}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-3"
      >
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <motion.div key={title} variants={fadeUpSlow} className="text-center">
            <Icon className="mx-auto mb-6 size-16 text-lumora-400" />
            <h3 className="mb-4 text-section text-white">{title}</h3>
            <p className="text-ink-400">{desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
