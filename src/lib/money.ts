/**
 * Money is integer kobo everywhere in Lumora — never a float naira amount.
 *
 * Naira only exists at the two edges: a form input the owner types, and a string
 * a human reads. Everything between them is kobo, which is also the unit Paystack
 * charges in, so the deposit flow inherits this for free.
 */

/** "₦15,000", or "₦1,500.50" when there really are kobo to show. */
export function formatNaira(kobo: number): string {
  const naira = kobo / 100;
  const decimals = kobo % 100 === 0 ? 0 : 2;

  return `₦${naira.toLocaleString("en-NG", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
}

/**
 * A naira form value to kobo. Empty input is 0 — a blank deposit field means "no
 * deposit". Anything non-numeric returns NaN, which the server's validation then
 * rejects with a readable message rather than storing a broken price.
 */
export function nairaToKobo(input: string | number): number {
  const naira = typeof input === "number" ? input : Number(input.trim());
  if (!Number.isFinite(naira)) return Number.NaN;

  return Math.round(naira * 100);
}

/** For pre-filling a naira input from a stored kobo amount. */
export function koboToNaira(kobo: number): number {
  return kobo / 100;
}
