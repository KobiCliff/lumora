import { kv } from "@vercel/kv";
import { randomId } from "./ids";

/**
 * Session storage contract.
 *
 * The cookie holds an opaque, random id and nothing else — the email lives in KV
 * under that id. So a hand-crafted cookie is useless: an attacker would have to
 * guess a 256-bit id that exists in KV. Logout really is logout, because the
 * server-side record is deleted.
 *
 * TODO(auth): magic-link sign-in will set this exact cookie and reuse
 * createSession() verbatim — only the step that decides *whether* to call it
 * changes. See src/app/api/session/route.ts for what this deliberately does not do.
 */
export const SESSION_COOKIE = "lumora_session";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Session = {
  email: string;
  createdAt: number;
};

const sessionKey = (id: string) => `session:${id}`;

/** 32 bytes of CSPRNG, hex-encoded. Anything else was not issued by createSession(). */
const SESSION_ID_SHAPE = /^[0-9a-f]{64}$/;

/** Stores a session in KV and returns the id to put in the cookie. Throws if KV is unreachable. */
export async function createSession(email: string): Promise<string> {
  const id = randomId(32);
  const session: Session = { email, createdAt: Date.now() };
  // The KV TTL mirrors the cookie's maxAge. maxAge alone is browser-enforced and
  // therefore advisory; the TTL is what actually bounds the session.
  await kv.set(sessionKey(id), session, { ex: SESSION_MAX_AGE });
  return id;
}

/**
 * Resolves a cookie value to its session, or null if there isn't one.
 *
 * Fails closed: a KV outage or a malformed id reads as "not signed in" rather
 * than throwing, so the gate can never fail *open*. The shape check runs first so
 * junk cookie values don't turn into KV lookups.
 */
export async function readSession(id: string | undefined): Promise<Session | null> {
  if (!id || !SESSION_ID_SHAPE.test(id)) return null;

  try {
    return (await kv.get<Session>(sessionKey(id))) ?? null;
  } catch {
    return null;
  }
}

/** Revokes a session server-side. Safe to call with a missing or already-expired id. */
export async function destroySession(id: string | undefined): Promise<void> {
  if (!id || !SESSION_ID_SHAPE.test(id)) return;

  try {
    await kv.del(sessionKey(id));
  } catch {
    // The cookie gets cleared regardless, so a failed delete degrades to
    // "session expires on its own TTL" rather than blocking logout.
  }
}

/**
 * Guards against an open redirect via `?next=`: only same-origin absolute paths
 * are allowed through.
 */
export function safeRedirectPath(next: string | undefined, fallback = "/dashboard") {
  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
