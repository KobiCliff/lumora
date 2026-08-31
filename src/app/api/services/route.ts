import { NextResponse } from "next/server";
import { requireBusiness } from "@/lib/api-auth";
import { createService, listServices, parseServiceInput } from "@/lib/business";

export async function GET() {
  const guard = await requireBusiness();
  if (!guard.ok) return guard.response;

  return NextResponse.json({ services: await listServices(guard.value.business.id) });
}

export async function POST(request: Request) {
  const guard = await requireBusiness();
  if (!guard.ok) return guard.response;

  const body = await request.json().catch(() => null);
  const input = parseServiceInput(body);
  if (typeof input === "string") {
    return NextResponse.json({ error: input }, { status: 400 });
  }

  const service = await createService(guard.value.business.id, input);
  return NextResponse.json({ service }, { status: 201 });
}
