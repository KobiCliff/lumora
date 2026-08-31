import { NextResponse } from "next/server";
import { getBusinessBySlug, getService } from "@/lib/business";
import { BOOKING_HORIZON_DAYS, slotsForDay } from "@/lib/availability";
import { addWatDays, watDateKey } from "@/lib/time";

/**
 * Bookable times for one service on one day.
 *
 * Public — no session, since the whole point is that a customer books without an
 * account. `src/proxy.ts` only matches `/dashboard/:path*`, so nothing gates this.
 */

const DATE_SHAPE = /^\d{4}-\d{2}-\d{2}$/;

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: Request, { params }: Params) {
  const { slug } = await params;
  const url = new URL(request.url);
  const serviceId = url.searchParams.get("serviceId");
  const date = url.searchParams.get("date");

  if (!serviceId || !date || !DATE_SHAPE.test(date)) {
    return NextResponse.json({ error: "Pick a service and a date" }, { status: 400 });
  }

  const now = Date.now();
  const today = watDateKey(now);
  // Bounded so the endpoint can't be walked forever, and so a typo'd year doesn't
  // turn into a KV read for a day in 2087.
  if (date < today || date > addWatDays(today, BOOKING_HORIZON_DAYS)) {
    return NextResponse.json({ slots: [] });
  }

  const business = await getBusinessBySlug(slug);
  if (!business) {
    return NextResponse.json({ error: "Business not found" }, { status: 404 });
  }

  const service = await getService(business.id, serviceId);
  if (!service || !service.active) {
    return NextResponse.json({ error: "Service not available" }, { status: 404 });
  }

  const slots = await slotsForDay(business, service, date, now);
  return NextResponse.json({ slots });
}
