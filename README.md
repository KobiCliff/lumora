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
- Dashboard shell — bookings, analytics and settings pages, currently on hardcoded
  sample data
- A placeholder sign-in gate on `/dashboard/*` (see [Auth](#auth) — this is not
  real authentication yet)

Not built yet: the data model (businesses, services, bookings), the public booking
page, and Paystack payments.

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

Create `.env.local`. Vercel KV backs the waitlist and sessions and, soon, all app
data — without these two variables the landing page renders, but signing up for the
waitlist and signing in both fail.

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
    dashboard/          business-facing app (gated)
    api/
      waitlist/         waitlist signup handler
      session/          issues and clears the session cookie
  components/
    sections/           landing page sections
    dashboard/          PageShell, PanelCard, StatCard, EmptyState
    layout/             dashboard chrome
    ui/                 shared primitives
    charts/
  lib/
    motion.ts           shared Framer Motion variants
    session.ts          session cookie + KV session store
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
