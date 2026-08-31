import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/api-auth";
import {
  deleteService,
  getService,
  parseServiceInput,
  updateService,
} from "@/lib/business";

type Params = { params: Promise<{ id: string }> };

/**
 * Patches are merged onto the stored service and then validated as a whole,
 * rather than validated field by field. That's what lets a request send only the
 * price while still enforcing invariants that span fields — "deposit can't
 * exceed price" needs both values, and only the merged object has both.
 */
export async function PATCH(request: Request, { params }: Params) {
  const guard = await requireBusiness();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const { business } = guard.value;

  const existing = await getService(business.id, id);
  if (!existing) return NextResponse.json({ error: "Service not found" }, { status: 404 });

  const body = await request.json().catch(() => null);
  if (body === null) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });

  const input = parseServiceInput({
    name: body.name ?? existing.name,
    durationMinutes: body.durationMinutes ?? existing.durationMinutes,
    priceKobo: body.priceKobo ?? existing.priceKobo,
    depositKobo: body.depositKobo ?? existing.depositKobo,
  });
  if (typeof input === "string") {
    return NextResponse.json({ error: input }, { status: 400 });
  }

  const service = await updateService(business.id, id, {
    ...input,
    active: typeof body.active === "boolean" ? body.active : undefined,
  });

  return NextResponse.json({ service });
}

export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireBusiness();
  if (!guard.ok) return guard.response;

  const { id } = await params;
  const removed = await deleteService(guard.value.business.id, id);

  if (!removed) return NextResponse.json({ error: "Service not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
