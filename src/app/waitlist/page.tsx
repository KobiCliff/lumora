"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Confetti from "react-confetti";
import { Button } from "@/components/ui/button";
// import Nav from "@/components/sections/Nav";
import { fadeInSlow, fadeUpSlow, staggerMarketing } from "@/lib/motion";

export default function WaitlistPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    const response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    // The API rejects duplicates with a 409; without this the form threw
    // confetti at people it had just turned away.
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Something went wrong. Try again.");
      setStatus("idle");
      return;
    }

    setStatus("success");
  };

  return (
    <>
      {/* <Nav />
      {status === "success" && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
        />
      )} */}
      <section className="flex min-h-screen items-center justify-center bg-linear-to-br from-lumora-900 via-ink-950 to-ink-900">
        <motion.div
          variants={staggerMarketing}
          initial="hidden"
          animate="show"
          className="max-w-2xl px-6 text-center"
        >
          <motion.h1
            variants={fadeUpSlow}
            className="mb-8 text-display text-white"
          >
            LUMORA
          </motion.h1>
          <motion.p
            variants={fadeInSlow}
            className="mb-12 text-lead text-white/90"
          >
            Coming Soon
          </motion.p>

          {status !== "success" ? (
            <motion.form
              variants={fadeUpSlow}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={error ? true : undefined}
                className="mx-auto w-full max-w-md rounded-control border border-white/20 bg-white/10 px-8 py-5 text-xl text-white placeholder-white/40 backdrop-blur focus:border-white focus:outline-none"
                placeholder="you@yourbusiness.com"
              />

              {error ? (
                <p role="alert" className="font-semibold text-danger">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                variant="invert"
                size="xl"
                disabled={status === "loading"}
                className="mx-auto w-full max-w-md"
              >
                {status === "loading" ? "Joining..." : "Get Early Access"}
              </Button>
            </motion.form>
          ) : (
            <motion.div
              variants={fadeUpSlow}
              className="text-section text-white"
            >
              Coming Soon
            </motion.div>
          )}

          <motion.p variants={fadeInSlow} className="mt-12 text-white/60">
            Founding businesses get first pick of booking links.
          </motion.p>
        </motion.div>
      </section>
    </>
  );
}
