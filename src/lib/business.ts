import { kv } from "@vercel/kv";
import { randomId, slugify } from "./ids";
import {
  businessByEmailKey,
  businessBySlugKey,
  businessKey,
  normalizeEmail,
  serviceKey,
  serviceSetKey,
} from "./kv-keys";
import { WAT_TIMEZONE, parseHhMm } from "./time";
import { WEEKDAYS, type Business, type OpeningHours, type Service } from "./types";

/**
 * Business and Service persistence.
 *
 * One owner has one business, and `business:byEmail:<email>` is claimed with `nx`
 * so that stays true even if two sign-ups race. The slug is claimed the same way
 * and never changes afterwards: a business can rename itself freely, but a link
 * already sitting in a customer's WhatsApp history has to keep working.
 */

export const DEFAULT_SLOT_MINUTES = 30;

/** Mon–Fri 9–6, Saturday half day, Sunday closed. A salon can accept this as-is. */
export const DEFAULT_HOURS: OpeningHours = {
  mon: { open: "09:00", close: "18:00" },
  tue: { open: "09:00", close: "18:00" },
  wed: { open: "09:00", close: "18:00" },
  thu: { open: "09:00", close: "18:00" },
  fri: { open: "09:00", close: "18:00" },
  sat: { open: "10:00", close: "16:00" },
  sun: null,
};

/* ── Business ───────────────────────────────────────────────────────────── */

/**
 * Claims the prettiest free slug for `businessId`: "radiance-salon", then
 * "radiance-salon-2", and so on. `nx` makes each attempt an atomic claim, so two
 * identically-named businesses registering at once cannot both take one slug.
 */
async function claimSlug(base: string, businessId: string): Promise<string> {
  const MAX_ATTEMPTS = 25;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const candidate = attempt === 1 ? base : `${base}-${attempt}`;
    const claimed = await kv.set(businessBySlugKey(candidate), businessId, {
      nx: true,
    });
    if (claimed) return candidate;
  }

  // 25 businesses share this name. Random suffix rather than fail the sign-up.
  const candidate = `${base}-${randomId(3)}`;
  await kv.set(businessBySlugKey(candidate), businessId, { nx: true });
  return candidate;
}

export type CreateBusinessInput = {
  name: string;
  ownerEmail: string;
  hours?: OpeningHours;
  slotMinutes?: number;
};

/**
 * Creates the owner's business, or returns null if they already have one.
 *
 * Ownership is claimed before the slug so a rejected duplicate doesn't burn a
 * slug on its way out.
 */
export async function createBusiness(
  input: CreateBusinessInput,
): Promise<Business | null> {
  const ownerEmail = normalizeEmail(input.ownerEmail);
  const id = randomId(12);

  const claimed = await kv.set(businessByEmailKey(ownerEmail), id, { nx: true });
  if (!claimed) return null;

  const business: Business = {
    id,
    slug: await claimSlug(slugify(input.name), id),
    name: input.name.trim(),
    ownerEmail,
    timezone: WAT_TIMEZONE,
    slotMinutes: input.slotMinutes ?? DEFAULT_SLOT_MINUTES,
    hours: input.hours ?? DEFAULT_HOURS,
    createdAt: Date.now(),
  };

  await kv.set(businessKey(id), business);
  return business;
}

export async function getBusiness(businessId: string): Promise<Business | null> {
  return (await kv.get<Business>(businessKey(businessId))) ?? null;
}

/** Resolves the signed-in owner's business. */
export async function getBusinessByEmail(email: string): Promise<Business | null> {
  const id = await kv.get<string>(businessByEmailKey(email));
  // A dangling pointer (index written, record not) reads as "no business" rather
  // than throwing, so a half-failed sign-up leaves the owner able to retry.
  return id ? getBusiness(id) : null;
}

/** Resolves a public booking page. */
export async function getBusinessBySlug(slug: string): Promise<Business | null> {
  const id = await kv.get<string>(businessBySlugKey(slug));
  return id ? getBusiness(id) : null;
}

/**
 * Updates the owner-editable fields. `id`, `slug`, `ownerEmail` and `createdAt`
 * are deliberately not patchable — the fields are listed out rather than spread
 * so a stray key in a request body can't reach KV.
 */
export async function updateBusiness(
  businessId: string,
  patch: { name?: string; hours?: OpeningHours; slotMinutes?: number },
): Promise<Business | null> {
  const existing = await getBusiness(businessId);
  if (!existing) return null;

  const next: Business = {
    ...existing,
    name: patch.name?.trim() || existing.name,
    hours: patch.hours ?? existing.hours,
    slotMinutes: patch.slotMinutes ?? existing.slotMinutes,
  };

  await kv.set(businessKey(businessId), next);
  return next;
}

/* ── Services ───────────────────────────────────────────────────────────── */

export type ServiceInput = {
  name: string;
  durationMinutes: number;
  priceKobo: number;
  depositKobo: number;
};

export async function createService(
  businessId: string,
  input: ServiceInput,
): Promise<Service> {
  const service: Service = {
    id: randomId(8),
    businessId,
    name: input.name.trim(),
    durationMinutes: input.durationMinutes,
    priceKobo: input.priceKobo,
    depositKobo: input.depositKobo,
    active: true,
    createdAt: Date.now(),
  };

  await kv.set(serviceKey(businessId, service.id), service);
  await kv.sadd(serviceSetKey(businessId), service.id);
  return service;
}

/** Oldest first, so the list doesn't reshuffle when a service is edited. */
export async function listServices(businessId: string): Promise<Service[]> {
  const ids = await kv.smembers(serviceSetKey(businessId));
  if (ids.length === 0) return []; // mget with no keys is an error

  const services = await kv.mget<(Service | null)[]>(
    ...ids.map((id) => serviceKey(businessId, id)),
  );

  return services
    .filter((service): service is Service => service !== null)
    .sort((a, b) => a.createdAt - b.createdAt);
}

export async function getService(
  businessId: string,
  serviceId: string,
): Promise<Service | null> {
  return (await kv.get<Service>(serviceKey(businessId, serviceId))) ?? null;
}

export async function updateService(
  businessId: string,
  serviceId: string,
  patch: Partial<ServiceInput> & { active?: boolean },
): Promise<Service | null> {
  const existing = await getService(businessId, serviceId);
  if (!existing) return null;

  const next: Service = {
    ...existing,
    name: patch.name?.trim() || existing.name,
    durationMinutes: patch.durationMinutes ?? existing.durationMinutes,
    priceKobo: patch.priceKobo ?? existing.priceKobo,
    depositKobo: patch.depositKobo ?? existing.depositKobo,
    active: patch.active ?? existing.active,
  };

  await kv.set(serviceKey(businessId, serviceId), next);
  return next;
}

/**
 * Removes a service outright. Safe for past bookings, which snapshot the service
 * name and price at booking time — but `active: false` is the better answer for
 * "we don't offer this any more", since it keeps the service out of the booking
 * page without touching history.
 */
export async function deleteService(
  businessId: string,
  serviceId: string,
): Promise<boolean> {
  const existing = await getService(businessId, serviceId);
  if (!existing) return false;

  await kv.del(serviceKey(businessId, serviceId));
  await kv.srem(serviceSetKey(businessId), serviceId);
  return true;
}

/* ── Validation ─────────────────────────────────────────────────────────────
   Shared by the onboarding and settings routes, and the last line of defence
   for the public booking page — which takes input from strangers. */

export const MAX_SERVICE_DURATION_MINUTES = 600; // a 10-hour appointment is a typo
export const MAX_PRICE_KOBO = 100_000_000; // ₦1,000,000

/** Returns the parsed hours, or a message naming what's wrong with them. */
export function parseHours(input: unknown): OpeningHours | string {
  if (typeof input !== "object" || input === null) return "Opening hours are missing";

  const record = input as Record<string, unknown>;
  const hours = {} as OpeningHours;

  for (const day of WEEKDAYS) {
    const value = record[day];

    if (value === null || value === undefined) {
      hours[day] = null; // closed
      continue;
    }

    if (typeof value !== "object") return `Opening hours for ${day} are invalid`;

    const { open, close } = value as { open?: unknown; close?: unknown };
    if (typeof open !== "string" || typeof close !== "string") {
      return `Opening hours for ${day} need an open and close time`;
    }

    const openMinutes = parseHhMm(open);
    const closeMinutes = parseHhMm(close);
    if (openMinutes === null || closeMinutes === null) {
      return `Use 24-hour HH:MM times for ${day}`;
    }
    if (closeMinutes <= openMinutes) {
      return `Closing time must be after opening time on ${day}`;
    }

    hours[day] = { open, close };
  }

  return hours;
}

/** Returns the parsed service fields, or a message naming what's wrong. */
export function parseServiceInput(input: unknown): ServiceInput | string {
  if (typeof input !== "object" || input === null) return "Service details are missing";

  const { name, durationMinutes, priceKobo, depositKobo } = input as Record<
    string,
    unknown
  >;

  if (typeof name !== "string" || name.trim().length === 0) {
    return "Give the service a name";
  }
  if (name.trim().length > 80) return "Service name is too long";

  if (!isPositiveInteger(durationMinutes)) return "Set how long the service takes";
  if (durationMinutes > MAX_SERVICE_DURATION_MINUTES) {
    return "That duration looks too long — check the minutes";
  }

  if (!isNonNegativeInteger(priceKobo)) return "Set a price";
  if (priceKobo > MAX_PRICE_KOBO) return "That price looks too high";

  if (!isNonNegativeInteger(depositKobo)) return "Set a deposit, or 0 for none";
  if (depositKobo > priceKobo) return "Deposit can't be more than the price";

  return {
    name: name.trim(),
    durationMinutes,
    priceKobo,
    depositKobo,
  };
}

function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
