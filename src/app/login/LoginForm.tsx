"use client";

import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { fadeUpSlow, staggerMarketing } from "@/lib/motion";

export default function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const response = await fetch("/api/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Something went wrong. Try again.");
      setStatus("idle");
      return;
    }

    // replace, not push, so Back doesn't land the user on a login screen
    // they've already passed.
    router.replace(next);
  }

  return (
    <section className="relative grid min-h-screen place-items-center overflow-hidden bg-linear-to-br from-ink-900 via-lumora-950 to-ink-950 px-6">
      <div className="absolute inset-0 bg-grid-white" />

      <motion.div
        variants={staggerMarketing}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-md"
      >
        <motion.p
          variants={fadeUpSlow}
          className="mb-10 text-center text-4xl font-black tracking-[-0.04em] text-white"
        >
          Lumora
        </motion.p>

        <motion.div
          variants={fadeUpSlow}
          className="rounded-panel border border-white/10 bg-white/5 p-10 shadow-glow backdrop-blur"
        >
          <h1 className="text-section text-white">Sign in</h1>
          <p className="mt-2 text-white/60">
            Manage your bookings, deposits and no-shows.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@yourbusiness.com"
              aria-invalid={error ? true : undefined}
              className="w-full rounded-control border border-white/20 bg-white/10 px-5 py-4 text-lg text-white placeholder-white/40 backdrop-blur focus:border-white focus:outline-none"
            />

            {error ? (
              <p role="alert" className="text-sm font-semibold text-danger">
                {error}
              </p>
            ) : null}

            <Button
              type="submit"
              variant="invert"
              size="lg"
              disabled={status === "loading"}
              className="w-full"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Signing in
                </>
              ) : (
                <>
                  Continue <ArrowRight className="size-5" />
                </>
              )}
            </Button>
          </form>

          <p className="mt-8 text-label uppercase text-white/40">
            Placeholder gate · no email is sent yet
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
