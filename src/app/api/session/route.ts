import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSession,
  destroySession,
} from "@/lib/session";

/**
 * TODO(auth): THIS IS A GATE, NOT AUTHENTICATION.
 *
 * Anyone can POST here with any syntactically valid email and receive a session —
 * there is no verification and no identity. Its only job is to keep /dashboard
 * from being publicly reachable while the real product is built.
 *
 * What it is *not* is forgeable: the cookie carries an opaque random id, so a
 * session can only be created by going through this route. Hand-editing the
 * cookie in devtools gets you redirected to /login.
 *
 * Magic-link sign-in replaces the body of POST with: generate a single-use token,
 * store it in KV against the email, email the link, and call createSession() only
 * when the token is redeemed. The cookie name, flags, the KV session record and
 * the proxy that reads it all stay as they are.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Enter a valid email" }, { status: 400 });
  }

  let sessionId: string;
  try {
    sessionId = await createSession(email);
  } catch {
    // Sessions live in KV, so no KV means no sign-in. Say so plainly instead of
    // surfacing a generic 500 — locally this almost always means missing creds.
    return NextResponse.json(
      { error: "Could not start a session. Check that Vercel KV is configured." },
      { status: 503 },
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: sessionId,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  // Revoke server-side first, so the session is dead even if the client keeps
  // sending the cookie.
  await destroySession(request.cookies.get(SESSION_COOKIE)?.value);

  const response = NextResponse.json({ success: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
