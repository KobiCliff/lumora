import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/api-auth";
import { setBookingStatus } from "@/lib/bookings";
import { SETTABLE_STATUSES, type BookingStatus } from "@/lib/types";

/**
 * Marks a booking completed / no-show / cancelled.
 *
 * This is what makes the no-show rate mean anything: nothing else in the system
 * knows whether someone actually turned up.
 */

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const guard = await requireBusiness();
  if (!guard.ok) return guard.response;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { status } = body as { status?: unknown };
  if (!SETTABLE_STATUSES.includes(status as BookingStatus)) {
    return NextResponse.json({ error: "Unknown status" }, { status: 400 });
  }

  // Scoped by the session's business, so an id from another business 404s.
  const booking = await setBookingStatus(
    guard.value.business.id,
    id,
    status as BookingStatus,
  );
  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  return NextResponse.json({ booking });
}
