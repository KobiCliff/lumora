import { kv } from "@vercel/kv";
import { slotKey } from "./kv-keys";
import { fromWatDateTime, parseHhMm, toHhMm, watTimeKey, watWeekday } from "./time";
import type { Business, Service } from "./types";

/**
 * Which times a customer can actually pick.
 *
 * The model is a fixed grid: starts are multiples of `business.slotMinutes` from
 * the day's opening time, and a service occupies however many consecutive grid
 * slots its duration covers. That is why a 90-minute service on a 30-minute grid
 * blocks three slots — and why availability has to look at all of them, not just
 * the one the customer clicked.
 */

/** No booking closer than this to now. Nobody wants a walk-in disguised as a booking. */
export const LEAD_TIME_MINUTES = 60;

/** How far ahead the public page will let a customer book. */
export const BOOKING_HORIZON_DAYS = 30;

const MINUTE_MS = 60 * 1000;

/** Every grid slot start a service starting at `startsAt` would occupy. */
export function slotsSpanned(
  startsAt: number,
  durationMinutes: number,
  slotMinutes: number,
): number[] {
  const count = Math.ceil(durationMinutes / slotMinutes);
  return Array.from({ length: count }, (_, i) => startsAt + i * slotMinutes * MINUTE_MS);
}

export type Slot = {
  /** Epoch ms. What the client posts back. */
  startsAt: number;
  /** WAT wall-clock `"14:30"`, for the button label. */
  time: string;
};

/**
 * Candidate starts for one day, before checking what's booked — opening hours,
 * the grid, the service duration and the lead time only.
 *
 * Split out from `slotsForDay` because the booking route needs exactly this to
 * revalidate a posted timestamp, and doing that through the KV-reading function
 * would mean a second round of reads it already has the answer for.
 */
export function candidateSlots(
  business: Business,
  service: Service,
  dateKey: string,
  now: number,
): number[] {
  const hours = business.hours[watWeekday(dateKey)];
  if (!hours) return []; // closed

  const open = parseHhMm(hours.open);
  const close = parseHhMm(hours.close);
  if (open === null || close === null || close <= open) return [];

  const earliest = now + LEAD_TIME_MINUTES * MINUTE_MS;
  const starts: number[] = [];

  for (let minute = open; minute + service.durationMinutes <= close; minute += business.slotMinutes) {
    const startsAt = fromWatDateTime(dateKey, toHhMm(minute));
    if (startsAt >= earliest) starts.push(startsAt);
  }

  return starts;
}

/**
 * Bookable starts for one day.
 *
 * One `mget` over the day's slot keys — around 20 for a normal opening day — so
 * this is a single round trip regardless of how busy the day is.
 */
export async function slotsForDay(
  business: Business,
  service: Service,
  dateKey: string,
  now = Date.now(),
): Promise<Slot[]> {
  const candidates = candidateSlots(business, service, dateKey, now);
  if (candidates.length === 0) return [];

  // A service can spill past the last candidate's own slot, so the set of slots
  // to check is wider than the set of candidate starts.
  const needed = new Set<number>();
  for (const startsAt of candidates) {
    for (const slot of slotsSpanned(startsAt, service.durationMinutes, business.slotMinutes)) {
      needed.add(slot);
    }
  }

  const slotList = [...needed];
  const values = await kv.mget<(string | null)[]>(
    ...slotList.map((slot) => slotKey(business.id, slot)),
  );

  const taken = new Set<number>();
  slotList.forEach((slot, index) => {
    if (values[index]) taken.add(slot);
  });

  return candidates
    .filter((startsAt) =>
      slotsSpanned(startsAt, service.durationMinutes, business.slotMinutes).every(
        (slot) => !taken.has(slot),
      ),
    )
    .map((startsAt) => ({ startsAt, time: watTimeKey(startsAt) }));
}

/**
 * Claim every slot a booking occupies, atomically per slot.
 *
 * `set(… { nx: true })` returns `"OK"` when the key was free and `null` when it
 * already existed, which makes each claim a compare-and-set with no Lua. If a
 * later slot is taken, the ones already claimed are released and the caller gets
 * a conflict.
 *
 * Not a transaction: two customers racing for overlapping ranges can each win
 * part of it and both be told to pick another time. That's a rare, safe outcome —
 * no double-booking — and this is the one place a pending-payment TTL will go
 * once deposits are collected at booking time.
 */
export async function reserveSlots(
  businessId: string,
  slots: number[],
  bookingId: string,
): Promise<boolean> {
  const claimed: number[] = [];

  for (const slot of slots) {
    const result = await kv.set(slotKey(businessId, slot), bookingId, { nx: true });
    if (result === null) {
      await releaseSlots(businessId, claimed);
      return false;
    }
    claimed.push(slot);
  }

  return true;
}

/** Free slots again — a failed reservation, or a cancellation. */
export async function releaseSlots(businessId: string, slots: number[]): Promise<void> {
  if (slots.length === 0) return;
  await kv.del(...slots.map((slot) => slotKey(businessId, slot)));
}
