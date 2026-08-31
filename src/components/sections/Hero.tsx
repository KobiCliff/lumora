"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fadeInSlow, fadeUpSlow, staggerMarketing } from "@/lib/motion";

export default function Hero() {
  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-ink-900 via-lumora-900 to-ink-900">
      <div className="absolute inset-0 bg-grid-white" />

      <motion.div
        variants={staggerMarketing}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-5xl px-6 text-center"
      >
        <motion.h1 variants={fadeUpSlow} className="mb-8 text-display text-white">
          Lumora
        </motion.h1>

        <motion.p variants={fadeInSlow} className="mb-12 text-lead text-white/80">
          The future of work is here.
          <br />
          Beautiful. Fast. Yours.
        </motion.p>

        <motion.div
          variants={fadeUpSlow}
          className="flex flex-col justify-center gap-6 sm:flex-row"
        >
          <Button asChild variant="invert" size="xl" className="group">
            <Link href="/waitlist">
              Join Waitlist
              <ArrowRight className="transition-transform group-hover:translate-x-2" />
            </Link>
          </Button>
          <Button asChild variant="invertOutline" size="xl">
            <a href="#features">Learn More</a>
          </Button>
        </motion.div>
      </motion.div>

      {/* Floating shapes. Now on the --animate-float-* keyframes the tokens
          define, which also means they honour prefers-reduced-motion. */}
      <div
        aria-hidden
        className="absolute top-32 left-10 h-56 w-80 rotate-12 animate-float-up rounded-card bg-linear-to-br from-lumora-500 to-accent-pink shadow-glow"
      />
      <div
        aria-hidden
        className="absolute right-10 bottom-32 h-64 w-96 -rotate-12 animate-float-down rounded-card bg-linear-to-br from-accent-blue to-accent-cyan shadow-glow"
      />
    </section>
  );
}
