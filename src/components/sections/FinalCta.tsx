"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fadeInSlow, fadeUpSlow, staggerMarketing } from "@/lib/motion";

export default function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-linear-to-br from-ink-900 via-lumora-900 to-ink-900 py-32">
      <div className="absolute inset-0 bg-grid-white" />
      <div aria-hidden className="absolute inset-0 bg-brand-glow" />

      <motion.div
        variants={staggerMarketing}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="relative z-10 mx-auto max-w-3xl px-6 text-center"
      >
        <motion.h2 variants={fadeUpSlow} className="text-page text-white">
          Your link is waiting.
        </motion.h2>
        <motion.p
          variants={fadeInSlow}
          className="mt-6 text-lead text-white/80"
        >
          Founding businesses get first pick of booking links — and a founding
          rate.
        </motion.p>
        <motion.div variants={fadeUpSlow} className="mt-12">
          <Button asChild variant="invert" size="xl" className="group">
            <Link href="/waitlist">
              Get Early Access
              <ArrowRight className="transition-transform group-hover:translate-x-2" />
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
