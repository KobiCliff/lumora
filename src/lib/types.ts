/**
 * Domain model, stored as JSON in KV. See src/lib/kv-keys.ts for the key layout.
 *
 * Two conventions hold everywhere:
 *   - money is integer *kobo*, never a float naira amount (and Paystack wants
 *     kobo too, so this costs nothing later)
 *   - instants are epoch milliseconds; anything human-facing is derived in WAT
 *     by src/lib/time.ts
 */

export type Weekday = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const WEEKDAYS: readonly Weekday[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export const WEEKDAY_LABELS: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

/** `"09:00"` / `"18:00"`, in the business's local time. `null` = closed that day. */
export type DayHours = { open: string; close: string } | null;

export type OpeningHours = Record<Weekday, DayHours>;

export type Business = {
  id: string;
  /** Immutable once created — public links must not rot when the name changes. */
  slug: string;
  name: string;
  ownerEmail: string;
  /** Always "Africa/Lagos" for now. Stored so a second zone is a code change, not a migration. */
  timezone: string;
  /** Booking grid in minutes. Every start time is a multiple of this from opening. */
  slotMinutes: number;
  hours: OpeningHours;
  createdAt: number;
};

export type Service = {
  id: string;
  businessId: string;
  name: string;
  durationMinutes: number;
  priceKobo: number;
  /** 0 = no deposit required to book. */
  depositKobo: number;
  active: boolean;
  createdAt: number;
};

/**
 * "pending" arrives with Paystack, for a booking whose deposit hasn't cleared
 * yet. Until then every booking is created "confirmed".
 */
export type BookingStatus =
  | "confirmed"
  | "completed"
  | "no_show"
  | "cancelled";

export type DepositStatus = "unpaid" | "paid";

export type Booking = {
  id: string;
  businessId: string;
  serviceId: string;
  /**
   * serviceName, priceKobo and depositKobo are denormalized snapshots. A booking
   * is a historical record: renaming or deleting a service must not silently
   * rewrite last month's revenue.
   */
  serviceName: string;
  customerName: string;
  /** Required — Nigerian SMBs reach customers by phone, not email. */
  customerPhone: string;
  /** Optional today; Paystack will require it to charge a deposit. */
  customerEmail?: string;
  startsAt: number;
  endsAt: number;
  durationMinutes: number;
  /**
   * The grid slot starts this booking claimed, as epoch ms.
   *
   * Stored rather than recomputed: if the owner changes `slotMinutes` later, the
   * slots to free on cancellation are the ones claimed at booking time, and
   * deriving them from the current grid would orphan keys and permanently block
   * times nobody has booked.
   */
  slots: number[];
  priceKobo: number;
  depositKobo: number;
  status: BookingStatus;
  deposit: {
    status: DepositStatus;
    /** Paystack transaction reference, once there is one. */
    reference?: string;
    paidAt?: number;
  };
  createdAt: number;
};

/** Statuses a booking can be moved to from the dashboard. */
export const SETTABLE_STATUSES: readonly BookingStatus[] = [
  "confirmed",
  "completed",
  "no_show",
  "cancelled",
];

export const STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: "Confirmed",
  completed: "Completed",
  no_show: "No-show",
  cancelled: "Cancelled",
};
