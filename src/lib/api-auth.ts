import { NextResponse } from "next/server";
import { getBusinessByEmail } from "./business";
import { currentSession } from "./session-server";
import type { Business } from "./types";
import type { Session } from "./session";

/**
 * Owner-scoping for dashboard route handlers.
 *
 * Every mutation reads the business from the *session*, never from a request
 * body — so a signed-in owner cannot edit another business by passing its id.
 * That constraint is the reason these helpers return the business rather than
 * just asserting a session exists.
 */

type Guard<T> = { ok: true; value: T } | { ok: false; response: NextResponse };

const deny = (error: string, status: number): Guard<never> => ({
  ok: false,
  response: NextResponse.json({ error }, { status }),
});

/** For endpoints that run before a business exists, i.e. onboarding. */
export async function requireSession(): Promise<Guard<Session>> {
  const session = await currentSession();
  if (!session) return deny("Sign in to continue", 401);
  return { ok: true, value: session };
}

/** For everything else: the signed-in owner and the business they own. */
export async function requireBusiness(): Promise<
  Guard<{ session: Session; business: Business }>
> {
  const session = await currentSession();
  if (!session) return deny("Sign in to continue", 401);

  const business = await getBusinessByEmail(session.email);
  if (!business) return deny("Set up your business first", 404);

  return { ok: true, value: { session, business } };
}
