/**
 * Random identifiers and URL slugs.
 *
 * Web Crypto only, so this is safe to import from the Edge runtime (the proxy
 * pulls it in transitively via session.ts).
 */

/** `bytes` bytes of CSPRNG, hex-encoded — so the string is `bytes * 2` chars. */
export function randomId(bytes = 12): string {
  const buffer = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(buffer, (b) => b.toString(16).padStart(2, "0")).join("");
}

const SLUG_MAX_LENGTH = 40;

/**
 * Business name -> URL slug: "Radiance Salon & Spa" -> "radiance-salon-spa".
 *
 * Accents are folded rather than dropped so "Kòfí's Barbers" stays readable as
 * "kofis-barbers". Returns "business" for input that reduces to nothing at all,
 * because the caller needs *some* slug to append a collision suffix to.
 */
export function slugify(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "") // combining marks left by NFKD
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, ""); // slice() can leave a trailing dash behind

  return slug || "business";
}
