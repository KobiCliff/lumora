"use client";

import { motion } from "framer-motion";
import { CalendarCheck, Check, Clock, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
// Type-only, and deliberately so: availability.ts imports @vercel/kv, and a value
// import from here would drag the KV client into the client bundle.
import type { Slot } from "@/lib/availability";
import { formatNaira } from "@/lib/money";
import { fadeInSlow, fadeUpSlow, staggerMarketing } from "@/lib/motion";
import {
  addWatDays,
  formatWatDate,
  formatWatDateLong,
  formatWatTime,
  watWeekday,
} from "@/lib/time";
import type { OpeningHours, Service } from "@/lib/types";

/**
 * The customer's side of Lumora: service, day, time, name and phone.
 *
 * Marketing cadence and the ink gradient rather than the dashboard's surface —
 * this page is a stranger's first impression of the business, not a tool. The
 * steps are one component with a `step` state instead of four routes, so nothing
 * chosen is lost on a back press and no state has to survive a navigation.
 */

type BusinessSummary = { name: string; slug: string; hours: OpeningHours };

type Confirmation = {
  id: string;
  serviceName: string;
  startsAt: number;
  endsAt: number;
  priceKobo: number;
  depositKobo: number;
  customerName: string;
};

/** How many days forward the date strip offers. */
const VISIBLE_DAYS = 14;

const formatDuration = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : `${minutes / 60} hr${minutes >= 120 ? "s" : ""}`;

const glassCard =
  "rounded-card border border-white/15 bg-white/5 p-6 backdrop-blur transition-colors";

export default function BookingFlow({
  business,
  services,
  today,
}: {
  business: BusinessSummary;
  services: Service[];
  today: string;
}) {
  const [service, setService] = useState<Service | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  if (confirmation) {
    return <Confirmed business={business} confirmation={confirmation} />;
  }

  return (
    <motion.div
      variants={staggerMarketing}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-2xl"
    >
      <motion.header variants={fadeUpSlow} className="mb-12 text-center">
        <p className="text-label uppercase text-white/50">Book an appointment</p>
        <h1 className="mt-3 text-display text-white">{business.name}</h1>
      </motion.header>

      {services.length === 0 ? (
        <motion.div variants={fadeUpSlow} className={`${glassCard} text-center`}>
          <p className="text-lead text-white">Not taking bookings just yet</p>
          <p className="mt-3 text-white/60">
            {business.name} hasn&apos;t listed any services. Check back shortly.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-8">
          <ServiceStep
            services={services}
            selected={service}
            onSelect={(next) => {
              setService(next);
              setDate(null);
              setSlot(null);
            }}
          />

          {service ? (
            <DateStep
              business={business}
              today={today}
              selected={date}
              onSelect={(next) => {
                setDate(next);
                setSlot(null);
              }}
            />
          ) : null}

          {service && date ? (
            <TimeStep
              slug={business.slug}
              service={service}
              date={date}
              selected={slot}
              onSelect={setSlot}
            />
          ) : null}

          {service && date && slot ? (
            <DetailsStep
              slug={business.slug}
              service={service}
              slot={slot}
              onBooked={setConfirmation}
              onSlotTaken={() => setSlot(null)}
            />
          ) : null}
        </div>
      )}

      <motion.p variants={fadeInSlow} className="mt-16 text-center text-sm text-white/40">
        Powered by Lumora
      </motion.p>
    </motion.div>
  );
}

/* ── Step 1 · Service ───────────────────────────────────────────────────── */

function ServiceStep({
  services,
  selected,
  onSelect,
}: {
  services: Service[];
  selected: Service | null;
  onSelect: (service: Service) => void;
}) {
  return (
    <StepPanel step={1} title="What are you booking?">
      <div className="grid gap-3">
        {services.map((service) => {
          const isSelected = selected?.id === service.id;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelect(service)}
              aria-pressed={isSelected}
              className={`flex flex-wrap items-center justify-between gap-4 rounded-control border px-5 py-4 text-left transition-colors ${
                isSelected
                  ? "border-white bg-white/15"
                  : "border-white/15 bg-white/5 hover:border-white/40"
              }`}
            >
              <span>
                <span className="block font-semibold text-white">{service.name}</span>
                <span className="mt-1 flex items-center gap-1.5 text-sm text-white/60">
                  <Clock className="size-3.5" />
                  {formatDuration(service.durationMinutes)}
                </span>
              </span>
              <span className="text-right">
                <span className="block font-semibold text-white">
                  {formatNaira(service.priceKobo)}
                </span>
                {service.depositKobo > 0 ? (
                  <span className="mt-1 block text-sm text-white/60">
                    {formatNaira(service.depositKobo)} deposit
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </StepPanel>
  );
}

/* ── Step 2 · Day ───────────────────────────────────────────────────────── */

function DateStep({
  business,
  today,
  selected,
  onSelect,
}: {
  business: BusinessSummary;
  today: string;
  selected: string | null;
  onSelect: (date: string) => void;
}) {
  // Closed days are dropped rather than disabled: a strip of greyed-out Sundays
  // is just noise on a phone.
  const days = Array.from({ length: VISIBLE_DAYS }, (_, offset) =>
    addWatDays(today, offset),
  ).filter((date) => business.hours[watWeekday(date)] !== null);

  return (
    <StepPanel step={2} title="Which day?">
      {days.length === 0 ? (
        <p className="text-white/60">
          No opening hours are set for the next fortnight. Try again later.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {days.map((date) => {
            const isSelected = selected === date;
            return (
              <button
                key={date}
                type="button"
                onClick={() => onSelect(date)}
                aria-pressed={isSelected}
                className={`rounded-control border px-4 py-3 text-center text-sm font-semibold transition-colors ${
                  isSelected
                    ? "border-white bg-white/15 text-white"
                    : "border-white/15 bg-white/5 text-white/80 hover:border-white/40"
                }`}
              >
                {date === today ? "Today" : formatWatDate(watDayNoon(date))}
              </button>
            );
          })}
        </div>
      )}
    </StepPanel>
  );
}

/**
 * Midday on the given WAT date, purely as an argument for the `Intl` formatters —
 * far enough from either boundary that no offset quirk can shift the label a day.
 */
function watDayNoon(dateKey: string): number {
  return Date.parse(`${dateKey}T12:00:00Z`);
}

/* ── Step 3 · Time ──────────────────────────────────────────────────────── */

function TimeStep({
  slug,
  service,
  date,
  selected,
  onSelect,
}: {
  slug: string;
  service: Service;
  date: string;
  selected: Slot | null;
  onSelect: (slot: Slot) => void;
}) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [failed, setFailed] = useState(false);

  const load = useCallback(async () => {
    setSlots(null);
    setFailed(false);

    const response = await fetch(
      `/api/public/${slug}/availability?serviceId=${encodeURIComponent(service.id)}&date=${date}`,
    );

    if (!response.ok) {
      setFailed(true);
      return;
    }

    const data = (await response.json()) as { slots: Slot[] };
    setSlots(data.slots);
  }, [slug, service.id, date]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <StepPanel step={3} title={`What time on ${formatWatDateLong(watDayNoon(date))}?`}>
      {failed ? (
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-white/70">Couldn&apos;t load times.</p>
          <Button type="button" variant="invertOutline" size="sm" onClick={() => void load()}>
            Try again
          </Button>
        </div>
      ) : slots === null ? (
        <p className="flex items-center gap-2 text-white/60">
          <Loader2 className="size-4 animate-spin" /> Finding open times
        </p>
      ) : slots.length === 0 ? (
        <p className="text-white/70">
          Nothing free that day. Try another — or call to ask about squeezing in.
        </p>
      ) : (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {slots.map((slot) => {
            const isSelected = selected?.startsAt === slot.startsAt;
            return (
              <button
                key={slot.startsAt}
                type="button"
                onClick={() => onSelect(slot)}
                aria-pressed={isSelected}
                className={`rounded-control border px-3 py-3 text-center text-sm font-semibold transition-colors ${
                  isSelected
                    ? "border-white bg-white/15 text-white"
                    : "border-white/15 bg-white/5 text-white/80 hover:border-white/40"
                }`}
              >
                {formatWatTime(slot.startsAt)}
              </button>
            );
          })}
        </div>
      )}
    </StepPanel>
  );
}

/* ── Step 4 · Details ───────────────────────────────────────────────────── */

function DetailsStep({
  slug,
  service,
  slot,
  onBooked,
  onSlotTaken,
}: {
  slug: string;
  service: Service;
  slot: Slot;
  onBooked: (confirmation: Confirmation) => void;
  onSlotTaken: () => void;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const response = await fetch(`/api/public/${slug}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        serviceId: service.id,
        startsAt: slot.startsAt,
        customerName: name,
        customerPhone: phone,
        customerEmail: email || undefined,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Couldn't book that. Try again.");
      setStatus("idle");
      // 409 means the slot went while this form was open. Sending them back to the
      // time step is the only useful response — the details they typed are kept.
      if (response.status === 409) onSlotTaken();
      return;
    }

    const data = (await response.json()) as { booking: Confirmation };
    onBooked(data.booking);
  }

  return (
    <StepPanel step={4} title="Who should we expect?">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <GlassField label="Your name" htmlFor="booking-name">
            <input
              id="booking-name"
              required
              maxLength={80}
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Amaka Obi"
              className={glassInputClass}
            />
          </GlassField>

          <GlassField label="Phone number" htmlFor="booking-phone">
            <input
              id="booking-phone"
              required
              type="tel"
              maxLength={20}
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="0803 123 4567"
              className={glassInputClass}
            />
          </GlassField>
        </div>

        <GlassField
          label="Email (optional)"
          htmlFor="booking-email"
          hint="Only if you'd like a copy of the confirmation."
        >
          <input
            id="booking-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className={glassInputClass}
          />
        </GlassField>

        <div className="rounded-control border border-white/15 bg-white/5 px-5 py-4 text-sm">
          <p className="font-semibold text-white">
            {service.name} · {formatWatDateLong(slot.startsAt)} at{" "}
            {formatWatTime(slot.startsAt)}
          </p>
          <p className="mt-1 text-white/60">
            {formatDuration(service.durationMinutes)} ·{" "}
            {formatNaira(service.priceKobo)}
            {service.depositKobo > 0
              ? ` · ${formatNaira(service.depositKobo)} deposit payable on arrival`
              : ""}
          </p>
        </div>

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
              <Loader2 className="size-5 animate-spin" /> Booking
            </>
          ) : (
            <>
              <CalendarCheck className="size-5" /> Confirm booking
            </>
          )}
        </Button>
      </form>
    </StepPanel>
  );
}

/* ── Confirmation ───────────────────────────────────────────────────────── */

function Confirmed({
  business,
  confirmation,
}: {
  business: BusinessSummary;
  confirmation: Confirmation;
}) {
  return (
    <motion.div
      variants={staggerMarketing}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-xl text-center"
    >
      <motion.span
        variants={fadeUpSlow}
        className="mx-auto mb-8 grid size-20 place-items-center rounded-card bg-white/15 text-white backdrop-blur"
      >
        <Check className="size-10" />
      </motion.span>

      <motion.h1 variants={fadeUpSlow} className="text-display text-white">
        You&apos;re booked
      </motion.h1>

      <motion.p variants={fadeInSlow} className="mt-4 text-lead text-white/80">
        {confirmation.serviceName} with {business.name}
      </motion.p>

      <motion.div variants={fadeUpSlow} className={`${glassCard} mt-10 text-left`}>
        <dl className="space-y-4">
          <Row label="When">
            {formatWatDateLong(confirmation.startsAt)},{" "}
            {formatWatTime(confirmation.startsAt)} –{" "}
            {formatWatTime(confirmation.endsAt)}
          </Row>
          <Row label="Name">{confirmation.customerName}</Row>
          <Row label="Price">{formatNaira(confirmation.priceKobo)}</Row>
          {confirmation.depositKobo > 0 ? (
            <Row label="Deposit">
              {formatNaira(confirmation.depositKobo)}, payable on arrival
            </Row>
          ) : null}
          <Row label="Reference">
            <span className="font-mono">{confirmation.id}</span>
          </Row>
        </dl>
      </motion.div>

      <motion.p variants={fadeInSlow} className="mt-8 text-white/60">
        Take a screenshot — {business.name} has your details and will call if
        anything changes.
      </motion.p>
    </motion.div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3">
      <dt className="text-label uppercase text-white/50">{label}</dt>
      <dd className="font-semibold text-white">{children}</dd>
    </div>
  );
}

/* ── Shared bits ────────────────────────────────────────────────────────── */

const glassInputClass =
  "w-full rounded-control border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur placeholder:text-white/40 focus:border-white focus:outline-none";

function StepPanel({
  step,
  title,
  children,
}: {
  step: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section variants={fadeUpSlow} className={glassCard}>
      <header className="mb-6 flex items-center gap-3">
        <span className="grid size-7 shrink-0 place-items-center rounded-chip bg-white/15 text-sm font-bold text-white">
          {step}
        </span>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
      </header>
      {children}
    </motion.section>
  );
}

function GlassField({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="block text-label uppercase text-white/50">
        {label}
      </label>
      {children}
      {hint ? <p className="text-sm text-white/50">{hint}</p> : null}
    </div>
  );
}
