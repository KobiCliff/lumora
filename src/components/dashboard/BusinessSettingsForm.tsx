"use client";

import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PanelCard from "@/components/dashboard/PanelCard";
import { Button } from "@/components/ui/button";
import { Field, FieldError, inputClass } from "@/components/ui/field";
import { WEEKDAYS, WEEKDAY_LABELS, type Business, type OpeningHours, type Weekday } from "@/lib/types";

/**
 * Local shape for the hours editor. Times are kept even while a day is toggled
 * closed, so unchecking Sunday doesn't wipe the hours the owner just typed —
 * only the submitted payload collapses a closed day to null.
 */
type DayState = { enabled: boolean; open: string; close: string };

const FALLBACK_DAY = { open: "09:00", close: "17:00" };

function toDayState(hours: OpeningHours): Record<Weekday, DayState> {
  return Object.fromEntries(
    WEEKDAYS.map((day) => {
      const value = hours[day];
      return [
        day,
        {
          enabled: value !== null,
          open: value?.open ?? FALLBACK_DAY.open,
          close: value?.close ?? FALLBACK_DAY.close,
        },
      ];
    }),
    // fromEntries widens keys to string; WEEKDAYS covers every Weekday exactly once.
  ) as Record<Weekday, DayState>;
}

export default function BusinessSettingsForm({ business }: { business: Business }) {
  const router = useRouter();

  const [name, setName] = useState(business.name);
  const [days, setDays] = useState(() => toDayState(business.hours));
  const [status, setStatus] = useState<"idle" | "loading" | "saved">("idle");
  const [error, setError] = useState<string | null>(null);

  function updateDay(day: Weekday, patch: Partial<DayState>) {
    setDays((current) => ({ ...current, [day]: { ...current[day], ...patch } }));
    setStatus("idle");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const hours = Object.fromEntries(
      WEEKDAYS.map((day) => [
        day,
        days[day].enabled ? { open: days[day].open, close: days[day].close } : null,
      ]),
    );

    const response = await fetch("/api/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, hours }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Couldn't save. Try again.");
      setStatus("idle");
      return;
    }

    setStatus("saved");
    router.refresh();
  }

  return (
    <PanelCard
      title="Business details"
      subtitle="Your name, your link, and when you're open."
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        <Field label="Business name" htmlFor="settings-name">
          <input
            id="settings-name"
            required
            maxLength={80}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setStatus("idle");
            }}
            className={inputClass}
          />
        </Field>

        <Field
          label="Booking link"
          hint="Fixed when you signed up, so links you've already shared keep working."
        >
          <p className="rounded-control border border-hairline bg-surface-inset px-4 py-3 font-mono text-sm text-muted">
            /b/{business.slug}
          </p>
        </Field>

        <div className="space-y-3">
          <p className="text-label uppercase text-muted">Opening hours</p>

          {WEEKDAYS.map((day) => (
            <div
              key={day}
              className="flex flex-wrap items-center gap-3 rounded-card border border-hairline bg-surface-muted px-4 py-3"
            >
              <label className="flex min-w-40 items-center gap-3 text-sm font-semibold text-strong">
                <input
                  type="checkbox"
                  checked={days[day].enabled}
                  onChange={(event) => updateDay(day, { enabled: event.target.checked })}
                  className="size-4 accent-lumora-600"
                />
                {WEEKDAY_LABELS[day]}
              </label>

              {days[day].enabled ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    required
                    aria-label={`${WEEKDAY_LABELS[day]} opening time`}
                    value={days[day].open}
                    onChange={(event) => updateDay(day, { open: event.target.value })}
                    className="rounded-control border border-hairline bg-surface px-3 py-2 text-strong focus:border-lumora-400 focus:outline-none"
                  />
                  <span className="text-muted">to</span>
                  <input
                    type="time"
                    required
                    aria-label={`${WEEKDAY_LABELS[day]} closing time`}
                    value={days[day].close}
                    onChange={(event) => updateDay(day, { close: event.target.value })}
                    className="rounded-control border border-hairline bg-surface px-3 py-2 text-strong focus:border-lumora-400 focus:outline-none"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted">Closed</span>
              )}
            </div>
          ))}
        </div>

        {error ? <FieldError>{error}</FieldError> : null}

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={status === "loading"}>
            {status === "loading" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving
              </>
            ) : (
              "Save changes"
            )}
          </Button>

          {status === "saved" ? (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-success">
              <Check className="size-4" /> Saved
            </p>
          ) : null}
        </div>
      </form>
    </PanelCard>
  );
}
