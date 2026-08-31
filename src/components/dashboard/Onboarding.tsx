"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PanelCard from "@/components/dashboard/PanelCard";
import { Button } from "@/components/ui/button";
import { Field, FieldError, inputClass, selectClass } from "@/components/ui/field";
import { nairaToKobo } from "@/lib/money";

/** Common appointment lengths. A select keeps the value a valid integer for free. */
const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240];

/**
 * Shown on /dashboard when the signed-in owner has no business yet.
 *
 * Asks for the two things nothing else can work without — a business name (which
 * becomes the public URL) and one service to book. Opening hours are defaulted
 * rather than asked for, because a five-field form gets finished and a
 * seven-day-schedule form does not; Settings owns them from then on.
 */
export default function Onboarding() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [price, setPrice] = useState("");
  const [deposit, setDeposit] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const response = await fetch("/api/business", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        service: {
          name: serviceName,
          durationMinutes,
          priceKobo: nairaToKobo(price),
          depositKobo: nairaToKobo(deposit),
        },
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Something went wrong. Try again.");
      setStatus("idle");
      return;
    }

    // The dashboard is a server component reading KV, so a refresh is what swaps
    // this form for the real thing.
    router.refresh();
  }

  return (
    <PanelCard
      title="Set up your business"
      subtitle="Two minutes, and your booking page is live."
      glow
      className="mx-auto max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <Field
          label="Business name"
          htmlFor="business-name"
          hint="This becomes your booking link, so customers recognise it."
        >
          <input
            id="business-name"
            required
            autoFocus
            maxLength={80}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Radiance Salon"
            className={inputClass}
          />
        </Field>

        <div className="space-y-6 rounded-card border border-hairline bg-surface-muted p-6">
          <p className="text-label uppercase text-muted">Your first service</p>

          <Field label="Service name" htmlFor="service-name">
            <input
              id="service-name"
              required
              maxLength={80}
              value={serviceName}
              onChange={(event) => setServiceName(event.target.value)}
              placeholder="Box braids"
              className={inputClass}
            />
          </Field>

          <div className="grid gap-6 sm:grid-cols-3">
            <Field label="Duration" htmlFor="service-duration">
              <select
                id="service-duration"
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value))}
                className={selectClass}
              >
                {DURATIONS.map((minutes) => (
                  <option key={minutes} value={minutes}>
                    {minutes < 60
                      ? `${minutes} min`
                      : `${minutes / 60} hr${minutes >= 120 ? "s" : ""}`}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Price (₦)" htmlFor="service-price">
              <input
                id="service-price"
                type="number"
                required
                min={0}
                step={100}
                inputMode="numeric"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder="15000"
                className={inputClass}
              />
            </Field>

            <Field label="Deposit (₦)" htmlFor="service-deposit" hint="Blank for none.">
              <input
                id="service-deposit"
                type="number"
                min={0}
                step={100}
                inputMode="numeric"
                value={deposit}
                onChange={(event) => setDeposit(event.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </Field>
          </div>
        </div>

        {error ? <FieldError>{error}</FieldError> : null}

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" size="lg" disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Creating
              </>
            ) : (
              <>
                Create booking page <ArrowRight className="size-5" />
              </>
            )}
          </Button>
          <p className="text-sm text-muted">
            Opens Mon–Fri 9–6 and Sat 10–4 by default. Change that in Settings.
          </p>
        </div>
      </form>
    </PanelCard>
  );
}
