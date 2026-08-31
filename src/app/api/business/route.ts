import { NextResponse } from "next/server";
import { requireBusiness, requireSession } from "@/lib/api-auth";
import {
  createBusiness,
  createService,
  parseHours,
  parseServiceInput,
  updateBusiness,
} from "@/lib/business";

/**
 * The owner's own business. Both handlers take the business from the session, so
 * there is no businessId in either request body to tamper with.
 */

/** Onboarding: create the business, optionally with its first service. */
export async function POST(request: Request) {
  const guard = await requireSession();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";

  if (name.length === 0) return NextResponse.json({ error: "Enter your business name" }, { status: 400 });
  if (name.length > 80) return NextResponse.json({ error: "That name is too long" }, { status: 400 });

  const hours = body?.hours === undefined ? undefined : parseHours(body.hours);
  if (typeof hours === "string") {
    return NextResponse.json({ error: hours }, { status: 400 });
  }

  // Validate the first service *before* creating anything, so a bad service
  // doesn't leave a business behind that the owner then can't create again.
  const serviceInput =
    body?.service === undefined ? undefined : parseServiceInput(body.service);
  if (typeof serviceInput === "string") {
    return NextResponse.json({ error: serviceInput }, { status: 400 });
  }

  const business = await createBusiness({
    name,
    ownerEmail: guard.value.email,
    hours,
  });

  if (!business) {
    return NextResponse.json(
      { error: "You already have a business set up" },
      { status: 409 },
    );
  }

  const service = serviceInput
    ? await createService(business.id, serviceInput)
    : null;

  return NextResponse.json({ business, services: service ? [service] : [] }, { status: 201 });
}

/** Settings: rename, or change opening hours. */
export async function PATCH(request: Request) {
  const guard = await requireBusiness();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  if (body === null) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const name = typeof body.name === "string" ? body.name.trim() : undefined;
  if (name !== undefined && name.length === 0) {
    return NextResponse.json({ error: "Business name can't be empty" }, { status: 400 });
  }
  if (name !== undefined && name.length > 80) {
    return NextResponse.json({ error: "That name is too long" }, { status: 400 });
  }

  const hours = body.hours === undefined ? undefined : parseHours(body.hours);
  if (typeof hours === "string") {
    return NextResponse.json({ error: hours }, { status: 400 });
  }

  const business = await updateBusiness(guard.value.business.id, { name, hours });
  return NextResponse.json({ business });
}
