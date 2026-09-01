import Link from "next/link";

/**
 * Minimal landing chrome: the wordmark (which doubles as the brand lockup) and
 * the one thing every visitor is here for — the waitlist. Fixed over the ink
 * gradients so it's always one tap from anywhere on the page.
 */
export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="text-2xl font-black tracking-[-0.04em] text-white"
        >
          LUMORA
        </Link>
        <Link
          href="/waitlist"
          className="rounded-chip border border-white/30 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-ink-950"
        >
          Join waitlist
        </Link>
      </nav>
    </header>
  );
}
