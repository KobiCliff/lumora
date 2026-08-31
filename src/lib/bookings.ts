import { kv } from "@vercel/kv";
import { releaseSlots, reserveSlots, slotsSpanned } from "./availability";
import { randomId } from "./ids";
import { bookingIndexKey, bookingKey } from "./kv-keys";
import { recentWatMonths, watMonthRange, type MonthRange } from "./time";
import type { Booking, BookingStatus, Business, Service } from "./types";

/**
 * Booking persistence and the numbers the dashboard reads.
 *
 * Every query goes through the `bookings:<businessId>` ZSET, scored by `startsAt`:
 * one ranged read plus one `mget` answers "what happened in August", instead of
 * walking every booking the business has ever taken.
 */

export type CreateBookingInput = {
  startsAt: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
};

export type CreateBookingResult =
  | { ok: true; booking: Booking }
  | { ok: false; reason: "conflict" };

/**
 * Writes a booking and claims the grid slots it occupies.
 *
 * The caller is responsible for having already validated `startsAt` against
 * opening hours and the lead time — `candidateSlots` in availability.ts is what
 * does that. This function only guarantees no two bookings share a slot.
 *
 * Service name and prices are copied onto the booking rather than referenced: a
 * booking is a record of what was agreed, and editing a service later must not
 * rewrite it.
 */
export async function createBooking(
  business: Business,
  service: Service,
  input: CreateBookingInput,
): Promise<CreateBookingResult> {
  const id = randomId(12);
  const slots = slotsSpanned(input.startsAt, service.durationMinutes, business.slotMinutes);

  const reserved = await reserveSlots(business.id, slots, id);
  if (!reserved) return { ok: false, reason: "conflict" };

  const booking: Booking = {
    id,
    businessId: business.id,
    serviceId: service.id,
    serviceName: service.name,
    customerName: input.customerName.trim(),
    customerPhone: input.customerPhone.trim(),
    ...(input.customerEmail ? { customerEmail: input.customerEmail.trim() } : {}),
    startsAt: input.startsAt,
    endsAt: input.startsAt + service.durationMinutes * 60 * 1000,
    durationMinutes: service.durationMinutes,
    slots,
    priceKobo: service.priceKobo,
    depositKobo: service.depositKobo,
    status: "confirmed",
    deposit: { status: "unpaid" },
    createdAt: Date.now(),
  };

  try {
    await kv.set(bookingKey(id), booking);
    await kv.zadd(bookingIndexKey(business.id), {
      score: booking.startsAt,
      member: id,
    });
  } catch (error) {
    // Don't leave slots held by a booking that isn't there — the customer would
    // see "already taken" for a time nobody has.
    await releaseSlots(business.id, slots);
    throw error;
  }

  return { ok: true, booking };
}

export async function getBooking(bookingId: string): Promise<Booking | null> {
  return (await kv.get<Booking>(bookingKey(bookingId))) ?? null;
}

/**
 * Bookings starting in `[start, end)`, earliest first.
 *
 * `(${end}` is Redis's exclusive-max syntax, which keeps a booking at midnight on
 * the 1st out of the previous month's totals.
 */
export async function bookingsInRange(
  businessId: string,
  start: number,
  end: number,
): Promise<Booking[]> {
  const ids = await kv.zrange<string[]>(bookingIndexKey(businessId), start, `(${end}`, {
    byScore: true,
  });
  if (ids.length === 0) return []; // mget with no keys is an error

  const bookings = await kv.mget<(Booking | null)[]>(...ids.map(bookingKey));
  return bookings.filter((booking): booking is Booking => booking !== null);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Bookings from now forward, soonest first — the working list for an owner. */
export async function upcomingBookings(
  businessId: string,
  now = Date.now(),
  days = 90,
): Promise<Booking[]> {
  return bookingsInRange(businessId, now, now + days * DAY_MS);
}

/** Recently past bookings, most recent first, for marking outcomes after the fact. */
export async function pastBookings(
  businessId: string,
  now = Date.now(),
  days = 60,
): Promise<Booking[]> {
  const bookings = await bookingsInRange(businessId, now - days * DAY_MS, now);
  return bookings.reverse();
}

/**
 * Moves a booking's status, and frees its slots when it stops occupying time.
 *
 * Cancelling is the only status that returns the slots to the grid — a no-show
 * still consumed the appointment, and re-selling it after the fact would make the
 * no-show rate a lie.
 */
export async function setBookingStatus(
  businessId: string,
  bookingId: string,
  status: BookingStatus,
): Promise<Booking | null> {
  const existing = await getBooking(bookingId);
  // Scoped by businessId so an owner can't reach into another business's bookings
  // by id.
  if (!existing || existing.businessId !== businessId) return null;
  if (existing.status === status) return existing;

  const next: Booking = { ...existing, status };
  await kv.set(bookingKey(bookingId), next);

  if (status === "cancelled") {
    await releaseSlots(businessId, existing.slots);
  }

  return next;
}

/* ── Dashboard numbers ──────────────────────────────────────────────────── */

export type PeriodStats = {
  bookings: number;
  /** Deposits actually paid, in kobo. */
  depositsKobo: number;
  /** Booked value including unpaid balances, in kobo. */
  revenueKobo: number;
  noShows: number;
  /** Percent of finished appointments that were no-shows. Null when none finished. */
  noShowRate: number | null;
};

/** Bookings that were meant to happen — cancellations aren't a business's fault. */
const isLive = (booking: Booking) => booking.status !== "cancelled";

/** Appointments whose outcome is known, i.e. what a no-show rate can divide by. */
const isSettled = (booking: Booking) =>
  booking.status === "completed" || booking.status === "no_show";

export function summarize(bookings: Booking[]): PeriodStats {
  const live = bookings.filter(isLive);
  const settled = live.filter(isSettled);
  const noShows = live.filter((booking) => booking.status === "no_show").length;

  return {
    bookings: live.length,
    depositsKobo: live
      .filter((booking) => booking.deposit.status === "paid")
      .reduce((total, booking) => total + booking.depositKobo, 0),
    revenueKobo: live.reduce((total, booking) => total + booking.priceKobo, 0),
    noShows,
    noShowRate: settled.length === 0 ? null : (noShows / settled.length) * 100,
  };
}

export type MonthlyStats = {
  current: PeriodStats;
  previous: PeriodStats;
  /**
   * Percent change vs. last month, or undefined where a comparison would be
   * meaningless — a first month has nothing to grow from, and "+∞%" is noise.
   */
  delta: {
    bookings?: number;
    depositsKobo?: number;
    noShowRate?: number;
  };
  /** True when the business has never taken a booking, so pages can show empty states. */
  empty: boolean;
};

/** This WAT month against last, for the dashboard's three stat cards. */
export async function monthlyStats(
  businessId: string,
  now = Date.now(),
): Promise<MonthlyStats> {
  const thisMonth = watMonthRange(now);
  const lastMonth = watMonthRange(now, -1);

  const [currentBookings, previousBookings] = await Promise.all([
    bookingsInRange(businessId, thisMonth.start, thisMonth.end),
    bookingsInRange(businessId, lastMonth.start, lastMonth.end),
  ]);

  const current = summarize(currentBookings);
  const previous = summarize(previousBookings);

  return {
    current,
    previous,
    delta: {
      bookings: percentChange(previous.bookings, current.bookings),
      depositsKobo: percentChange(previous.depositsKobo, current.depositsKobo),
      noShowRate:
        previous.noShowRate === null || current.noShowRate === null
          ? undefined
          : Number((current.noShowRate - previous.noShowRate).toFixed(1)),
    },
    empty: current.bookings === 0 && previous.bookings === 0,
  };
}

/**
 * Undefined rather than a number when the baseline is zero. A jump from 0 to 12
 * isn't "+1200%", it's a first month, and rendering a percentage there would be
 * the chart lying with a straight face.
 */
function percentChange(previous: number, current: number): number | undefined {
  if (previous === 0) return undefined;
  return Number((((current - previous) / previous) * 100).toFixed(1));
}

export type MonthBucket = MonthRange & { bookings: number; revenueKobo: number };

/** The last `count` months for the bar chart, oldest first. */
export async function bookingsByMonth(
  businessId: string,
  count = 6,
  now = Date.now(),
): Promise<MonthBucket[]> {
  const months = recentWatMonths(now, count);

  // One ranged read spanning every month, split locally — cheaper than `count`
  // round trips, and the ZSET is already sorted by start time.
  const bookings = await bookingsInRange(
    businessId,
    months[0].start,
    months[months.length - 1].end,
  );
  const live = bookings.filter(isLive);

  return months.map((month) => {
    const inMonth = live.filter(
      (booking) => booking.startsAt >= month.start && booking.startsAt < month.end,
    );
    return {
      ...month,
      bookings: inMonth.length,
      revenueKobo: inMonth.reduce((total, booking) => total + booking.priceKobo, 0),
    };
  });
}

export type ServiceBreakdown = {
  serviceId: string;
  serviceName: string;
  bookings: number;
  revenueKobo: number;
  noShows: number;
};

/**
 * Revenue and no-shows per service, for the analytics page.
 *
 * Grouped by the booking's *snapshot* name, so a service that was renamed or
 * deleted still shows up under what it was called at the time.
 */
export function breakdownByService(bookings: Booking[]): ServiceBreakdown[] {
  const groups = new Map<string, ServiceBreakdown>();

  for (const booking of bookings.filter(isLive)) {
    const existing = groups.get(booking.serviceId) ?? {
      serviceId: booking.serviceId,
      serviceName: booking.serviceName,
      bookings: 0,
      revenueKobo: 0,
      noShows: 0,
    };

    existing.bookings += 1;
    existing.revenueKobo += booking.priceKobo;
    if (booking.status === "no_show") existing.noShows += 1;
    groups.set(booking.serviceId, existing);
  }

  return [...groups.values()].sort((a, b) => b.revenueKobo - a.revenueKobo);
}
