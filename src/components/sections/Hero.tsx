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
      <div aria-hidden className="absolute inset-0 bg-brand-glow" />

      <motion.div
        variants={staggerMarketing}
        initial="hidden"
        animate="show"
        className="relative z-10 mx-auto max-w-5xl px-6 pt-16 text-center"
      >
        <motion.h1
          variants={fadeUpSlow}
          className="mb-8 text-display text-white"
        >
          LUMORA
        </motion.h1>

        <motion.p variants={fadeInSlow} className="mb-12 text-lead text-white/85">
          You&apos;re a business now.
        </motion.p>

        <motion.div
          variants={fadeUpSlow}
          className="flex flex-col justify-center gap-6 sm:flex-row"
        >
          <Button asChild variant="invert" size="xl" className="group">
            <Link href="/waitlist">
              Get Early Access
              <ArrowRight className="transition-transform group-hover:translate-x-2" />
            </Link>
          </Button>
          <Button asChild variant="invertOutline" size="xl">
            <a href="#how-it-works">See How It Works</a>
          </Button>
        </motion.div>
      </motion.div>

      {/* Floating shapes. Kept small, in the outer corners, behind the text, and
          desktop-only — decoration, never in the way. pointer-events-none so
          they can't swallow a click, and the float keyframes honour
          prefers-reduced-motion. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-24 left-8 z-0 hidden h-40 w-48 rotate-12 animate-float-up rounded-card bg-linear-to-br from-lumora-500 to-accent-pink opacity-60 shadow-glow lg:block"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-8 bottom-24 z-0 hidden h-48 w-56 -rotate-12 animate-float-down rounded-card bg-linear-to-br from-accent-blue to-accent-cyan opacity-60 shadow-glow lg:block"
      />
    </section>
  );
}
