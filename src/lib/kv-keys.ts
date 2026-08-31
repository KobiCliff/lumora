/**
 * Every KV key Lumora writes, built in one place.
 *
 * Layout:
 *   business:<id>                      JSON Business
 *   business:byEmail:<email>           businessId    owner's session email -> business
 *   business:bySlug:<slug>             businessId    public booking page -> business
 *   service:<businessId>:<serviceId>   JSON Service
 *   services:<businessId>              SET of serviceIds
 *   booking:<bookingId>                JSON Booking
 *   bookings:<businessId>              ZSET score=startsAt, member=bookingId
 *   slot:<businessId>:<slotStartMs>    bookingId     one per occupied grid slot
 *
 * The two booking indexes have distinct jobs and shouldn't be conflated:
 *   - the ZSET answers "which bookings fall in this range" for the dashboard, in
 *     one ranged read rather than a scan of the business's whole history
 *   - the slot keys are concurrency control. `set(key, id, { nx: true })` is an
 *     atomic claim, so two customers racing for one time cannot both win.
 */

/** Emails are case-insensitive in practice; normalise so the index has one entry per owner. */
export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const businessKey = (businessId: string) => `business:${businessId}`;

export const businessByEmailKey = (email: string) =>
  `business:byEmail:${normalizeEmail(email)}`;

export const businessBySlugKey = (slug: string) => `business:bySlug:${slug}`;

export const serviceKey = (businessId: string, serviceId: string) =>
  `service:${businessId}:${serviceId}`;

export const serviceSetKey = (businessId: string) => `services:${businessId}`;

export const bookingKey = (bookingId: string) => `booking:${bookingId}`;

export const bookingIndexKey = (businessId: string) => `bookings:${businessId}`;

export const slotKey = (businessId: string, slotStartMs: number) =>
  `slot:${businessId}:${slotStartMs}`;
