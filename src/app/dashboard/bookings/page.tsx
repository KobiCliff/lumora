import type { Metadata } from "next";
import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import BookingsTable from "@/components/dashboard/BookingsTable";
import EmptyState from "@/components/dashboard/EmptyState";
import PageShell from "@/components/dashboard/PageShell";
import PanelCard from "@/components/dashboard/PanelCard";
import { pastBookings, upcomingBookings } from "@/lib/bookings";
import { getBusinessByEmail } from "@/lib/business";
import { currentSession } from "@/lib/session-server";

export const metadata: Metadata = {
  title: "Bookings · Lumora",
};

export default async function BookingsPage() {
  const session = await currentSession();
  const business = session ? await getBusinessByEmail(session.email) : null;

  if (!business) {
    return (
      <PageShell
        title="Bookings"
        subtitle="Every appointment, who booked it, and whether the deposit cleared."
      >
        <EmptyState
          icon={<CalendarCheck />}
          title="No business yet"
          description="Bookings arrive through your public page, so set your business up first."
          action={
            <Link
              href="/dashboard"
              className="font-semibold text-lumora-600 hover:underline"
            >
              Set up your business
            </Link>
          }
        />
      </PageShell>
    );
  }

  const [upcoming, past] = await Promise.all([
    upcomingBookings(business.id),
    pastBookings(business.id),
  ]);

  if (upcoming.length === 0 && past.length === 0) {
    return (
      <PageShell
        title="Bookings"
        subtitle="Every appointment, who booked it, and whether the deposit cleared."
      >
        <EmptyState
          icon={<CalendarCheck />}
          title="No bookings yet"
          description="Send your booking link to a customer and their appointment shows up here the moment they confirm it."
          action={
            <Link
              href={`/b/${business.slug}`}
              className="font-mono font-semibold text-lumora-600 hover:underline"
            >
              /b/{business.slug}
            </Link>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Bookings"
      subtitle="Every appointment, who booked it, and whether the deposit cleared."
    >
      <div className="space-y-8">
        <PanelCard
          title="Upcoming"
          subtitle={
            upcoming.length === 0
              ? "Nothing booked ahead right now."
              : `${upcoming.length} appointment${upcoming.length === 1 ? "" : "s"} ahead`
          }
          glow
        >
          {upcoming.length === 0 ? (
            <p className="text-muted">
              Share your link and the next one lands here.
            </p>
          ) : (
            <BookingsTable bookings={upcoming} />
          )}
        </PanelCard>

        {past.length > 0 ? (
          <PanelCard
            title="Recent"
            subtitle="Mark who turned up — it's what makes the no-show rate real."
          >
            <BookingsTable bookings={past} />
          </PanelCard>
        ) : null}
      </div>
    </PageShell>
  );
}
