"use client";

import { AnimatePresence, MotionConfig, motion } from "framer-motion";
import {
  BarChart3,
  CalendarCheck,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useState, useSyncExternalStore } from "react";
import { ease, springy } from "@/lib/motion";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/bookings", label: "Bookings", icon: CalendarCheck },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

const DESKTOP_QUERY = "(min-width: 1024px)";

function subscribeToDesktop(onChange: () => void) {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

/**
 * Drives the sidebar transform. The client snapshot is read synchronously, so
 * the first client render is already correct and the sidebar doesn't slide in
 * on every desktop page load — at the cost of a style mismatch against the
 * server snapshot, hence suppressHydrationWarning below.
 */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeToDesktop,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}

export default function DashboardLayout({
  business,
  children,
}: {
  /** Null until onboarding creates one. */
  business: { name: string; slug: string } | null;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const isDesktop = useIsDesktop();

  const current = NAV.find((item) => item.href === pathname)?.label;

  const handleLogout = useCallback(async () => {
    await fetch("/api/session", { method: "DELETE" });
    router.push("/");
  }, [router]);

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-canvas">
        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <motion.aside
          suppressHydrationWarning
          initial={false}
          animate={{ x: isDesktop || sidebarOpen ? 0 : "-100%" }}
          transition={springy}
          className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-chrome-wash"
        >
          <div className="flex h-16 shrink-0 items-center justify-between px-6">
            <Link
              href="/"
              className="text-2xl font-black tracking-[-0.04em] text-chrome-fg"
            >
              Lumora
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close menu"
              className="grid size-9 place-items-center rounded-control text-chrome-muted transition-colors hover:bg-white/10 hover:text-chrome-fg lg:hidden"
            >
              <X className="size-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 p-4">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 rounded-control px-4 py-3 text-nav transition-colors",
                    active
                      ? "text-chrome-fg"
                      : "text-chrome-muted hover:bg-white/5 hover:text-chrome-fg",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="navActive"
                      transition={springy}
                      className="absolute inset-0 rounded-control bg-white/10 shadow-glow"
                    />
                  ) : null}
                  <Icon className="relative size-5 shrink-0" />
                  <span className="relative">{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Identity card. The public booking link lives here because it's the
              thing an owner needs to hand out, and this is the one place on
              every page. */}
          <div className="m-4 rounded-card border border-chrome-hairline bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-chip bg-linear-to-br from-lumora-500 to-accent-pink text-base font-black text-white">
                {business ? business.name.charAt(0).toUpperCase() : "?"}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-chrome-fg">
                  {business ? business.name : "No business yet"}
                </p>
                {business ? (
                  <Link
                    href={`/b/${business.slug}`}
                    className="block truncate text-xs text-chrome-muted underline-offset-2 transition-colors hover:text-chrome-fg hover:underline"
                  >
                    /b/{business.slug}
                  </Link>
                ) : (
                  <p className="text-xs text-chrome-muted">Finish setting up</p>
                )}
              </div>
            </div>
          </div>
        </motion.aside>

        {/* ── Mobile backdrop ─────────────────────────────────────────── */}
        <AnimatePresence>
          {sidebarOpen && !isDesktop ? (
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={ease(0.2)}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-ink-950/60 backdrop-blur-sm lg:hidden"
            />
          ) : null}
        </AnimatePresence>

        {/* ── Main ────────────────────────────────────────────────────── */}
        <div className="lg:pl-72">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-chrome-hairline bg-chrome bg-linear-to-r from-lumora-900/45 via-transparent to-transparent px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
                className="grid size-9 place-items-center rounded-control text-chrome-muted transition-colors hover:bg-white/10 hover:text-chrome-fg lg:hidden"
              >
                <Menu className="size-5" />
              </button>
              {current ? (
                <p className="hidden text-label uppercase text-chrome-muted lg:block">
                  {current}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className="grid size-9 place-items-center rounded-control text-chrome-muted transition-colors hover:bg-white/10 hover:text-chrome-fg"
              >
                {/* Both icons render, and `dark:` swaps them by rotating one out
                    and the other in. Pure CSS, so it's correct on the server and
                    needs no mounted-gate. */}
                <span className="relative grid size-5 place-items-center">
                  <Moon className="size-5 ease-lumora transition-transform duration-300 dark:-rotate-90 dark:scale-0" />
                  <Sun className="absolute size-5 rotate-90 scale-0 ease-lumora transition-transform duration-300 dark:rotate-0 dark:scale-100" />
                </span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-control px-3 py-2 text-sm font-semibold text-chrome-muted transition-colors hover:bg-danger/15 hover:text-danger"
              >
                <LogOut className="size-4" /> Log out
              </button>
            </div>
          </header>

          <main className="px-6 py-10 lg:px-10">{children}</main>
        </div>
      </div>
    </MotionConfig>
  );
}
