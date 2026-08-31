import { NextResponse } from "next/server";
import { BOOKING_HORIZON_DAYS, candidateSlots } from "@/lib/availability";
import { createBooking } from "@/lib/bookings";
import { getBusinessBySlug, getService } from "@/lib/business";
import { addWatDays, watDateKey } from "@/lib/time";

/**
 * Takes a booking from a stranger. Public by design — no account required.
 *
 * Every field is re-derived server-side. In particular `startsAt` is checked
 * against `candidateSlots` rather than trusted: the slot keys alone would happily
 * accept 3am on a closed Sunday, since nothing has claimed that slot.
 */

type Params = { params: Promise<{ slug: string }> };

const MAX_NAME = 80;
const MAX_PHONE = 20;

/** Digits, spaces and the punctuation Nigerian numbers are written with. */
const PHONE_SHAPE = /^[+\d][\d\s()-]{6,}$/;
const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request, { params }: Params) {
  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { serviceId, startsAt, customerName, customerPhone, customerEmail } =
    body as Record<string, unknown>;

  if (typeof serviceId !== "string" || serviceId.length === 0) {
    return NextResponse.json({ error: "Pick a service" }, { status: 400 });
  }
  if (typeof startsAt !== "number" || !Number.isFinite(startsAt)) {
    return NextResponse.json({ error: "Pick a time" }, { status: 400 });
  }
  if (typeof customerName !== "string" || customerName.trim().length === 0) {
    return NextResponse.json({ error: "Enter your name" }, { status: 400 });
  }
  if (customerName.trim().length > MAX_NAME) {
    return NextResponse.json({ error: "That name is too long" }, { status: 400 });
  }
  if (typeof customerPhone !== "string" || !PHONE_SHAPE.test(customerPhone.trim())) {
    return NextResponse.json({ error: "Enter a phone number we can reach you on" }, { status: 400 });
  }
  if (customerPhone.trim().length > MAX_PHONE) {
    return NextResponse.json({ error: "That phone number is too long" }, { status: 400 });
  }
  if (
    customerEmail !== undefined &&
    customerEmail !== "" &&
    (typeof customerEmail !== "string" || !EMAIL_SHAPE.test(customerEmail.trim()))
  ) {
    return NextResponse.json({ error: "That email doesn't look right" }, { status: 400 });
  }

  const business = await getBusinessBySlug(slug);
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const service = await getService(business.id, serviceId);
  if (!service || !service.active) {
    return NextResponse.json({ error: "That service isn't available" }, { status: 404 });
  }

  const now = Date.now();
  const dateKey = watDateKey(startsAt);

  if (dateKey > addWatDays(watDateKey(now), BOOKING_HORIZON_DAYS)) {
    return NextResponse.json({ error: "That date is too far ahead" }, { status: 400 });
  }

  // The real gate: is this exact instant a legal start for this service today?
  if (!candidateSlots(business, service, dateKey, now).includes(startsAt)) {
    return NextResponse.json(
      { error: "That time isn't available. Pick another." },
      { status: 400 },
    );
  }

  const result = await createBooking(business, service, {
    startsAt,
    customerName,
    customerPhone,
    ...(typeof customerEmail === "string" && customerEmail
      ? { customerEmail }
      : {}),
  });

  if (!result.ok) {
    return NextResponse.json(
      { error: "Someone just booked that time. Pick another." },
      { status: 409 },
    );
  }

  const { booking } = result;

  // Only what the confirmation screen shows — a public endpoint shouldn't echo
  // back the whole record.
  return NextResponse.json(
    {
      booking: {
        id: booking.id,
        serviceName: booking.serviceName,
        startsAt: booking.startsAt,
        endsAt: booking.endsAt,
        priceKobo: booking.priceKobo,
        depositKobo: booking.depositKobo,
        customerName: booking.customerName,
      },
    },
    { status: 201 },
  );
}
