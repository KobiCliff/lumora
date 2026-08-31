import { cookies } from "next/headers";
import { SESSION_COOKIE, readSession, type Session } from "./session";

/**
 * Server-side session reader for server components and route handlers.
 *
 * Separate from src/lib/session.ts on purpose: that module is imported by
 * src/proxy.ts, which runs in the Edge runtime where `next/headers` does not
 * exist. Keeping `cookies()` out of there is what stops the middleware bundle
 * from breaking.
 */
export async function currentSession(): Promise<Session | null> {
  const jar = await cookies();
  return readSession(jar.get(SESSION_COOKIE)?.value);
}
