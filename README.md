# Lumora

Booking and appointment software for small service businesses in Nigeria — salons,
barbershops, clinics, repair shops, tutors. A business signs up, lists its services,
and gets a public booking page its customers can use without creating an account.
The business owner sees bookings, revenue and no-shows on a dashboard.

The problem it replaces: taking appointments over WhatsApp and Instagram DMs, with
no deposit, no reminders and no record of what was booked.

## Status

Early build. Working today:

- Marketing landing page and email waitlist (stored in Vercel KV)
- The data model — businesses, services and bookings (`src/lib/types.ts`)
- Business and service management from the dashboard — opening hours, slot size,
  services with duration, price and deposit
- The public booking page at `/b/<slug>` — customers see real availability and
  book without creating an account
- Dashboard — bookings, analytics and settings pages, running on live data
- A placeholder sign-in gate on `/dashboard/*` (see [Auth](#auth) — this is not
  real authentication yet)

Not built yet: real email-based authentication, Paystack payments, and
subscription billing.

## Stack

| | |
|---|---|
| Framework | Next.js 16 (App Router, React 19, React Compiler) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 — configured in CSS, no `tailwind.config.ts` |
| UI | Radix primitives, `class-variance-authority`, `lucide-react` |
| Animation | Framer Motion, via shared tokens in `src/lib/motion.ts` |
| Charts | Recharts |
| Data | Vercel KV (Redis) |
| Payments | Paystack (not wired up yet) |

## Running locally

Requires Node 20+.

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

### Environment

Create `.env.local`. Vercel KV backs everything — the waitlist, sessions,
businesses, services and bookings — so without these two variables the landing
page renders, but the waitlist, sign-in, booking page and dashboard all fail.

```bash
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

Both come from the Vercel dashboard: **Storage → your KV store → `.env.local` tab**.
If the project is linked with the Vercel CLI, `vercel env pull .env.local` fetches
them for you.

## Layout

```
src/
  app/
    page.tsx            landing page
    waitlist/           waitlist signup
    login/              placeholder sign-in
    b/[slug]/           public booking page
    dashboard/          business-facing app (gated)
    api/
      waitlist/         waitlist signup handler
      session/          issues and clears the session cookie
      business/         business create/update
      services/         service create/update/delete
      bookings/         booking status changes
      public/           availability + bookings for /b/*
  components/
    sections/           landing page sections
    booking/            the public booking flow
    dashboard/          PageShell, PanelCard, StatCard, ServicesManager, ...
    layout/             dashboard chrome
    ui/                 shared primitives
    charts/
  lib/
    types.ts            the domain model
    business.ts         business + service storage and validation
    bookings.ts         booking storage, status changes, stats
    availability.ts     slot grid — candidates, reserve, release
    kv-keys.ts          KV key layout
    session.ts          session cookie + KV session store
    motion.ts           shared Framer Motion variants
  proxy.ts              route gate on /dashboard/*
```

Two things that look like mistakes but aren't:

- **`src/proxy.ts`, not `middleware.ts`** — Next 16 renamed the file convention.
  Same runtime behaviour and same `config.matcher`.
- **No `tailwind.config.ts`** — Tailwind v4 takes its configuration from
  `@theme` in `src/app/globals.css`. Design tokens (colours, type scale, radii,
  shadows) live there.

## Auth

`/dashboard/*` is gated by `src/proxy.ts`, which resolves a session cookie against
KV and redirects to `/login` when there isn't one. **This is a gate, not
authentication:** `/api/session` hands a session to anyone who posts a
syntactically valid email address, so it keeps the dashboard from being casually
public and nothing more.

It is not, however, forgeable. The cookie holds an opaque 256-bit random id and the
email lives in KV under `session:<id>`, so sessions can only be created by going
through `/api/session`, and logout deletes the server-side record.

Magic-link sign-in will replace only the step that decides *whether* to issue a
session — the cookie, the KV record and the code that reads them are meant to stay.

## Scripts

| | |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve a production build |
| `npm run lint` | ESLint |
