import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, readSession } from "@/lib/session";

/**
 * Gate on /dashboard/*. This is deliberately not authentication — see
 * src/app/api/session/route.ts. It stops the dashboard being casually public and
 * gives magic-link sign-in a cookie contract to fill in.
 *
 * The cookie is resolved against KV rather than trusted as-is, so a forged or
 * revoked cookie fails the same way a missing one does. Costs one KV read per
 * dashboard request.
 *
 * Named `proxy` in `src/proxy.ts`: Next 16 deprecated the `middleware` file
 * convention. Same runtime behaviour, same `config.matcher`.
 */
export async function proxy(request: NextRequest) {
  const session = await readSession(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("next", request.nextUrl.pathname);

  const response = NextResponse.redirect(login);
  // Clear whatever was sent — expired, revoked or hand-crafted, it is not a
  // session, so don't leave it around to be replayed on the next request.
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
