import type { Metadata } from "next";
import { CalendarCheck, CalendarClock, UserX, Wallet } from "lucide-react";
import Link from "next/link";
import BarChart from "@/components/charts/BarChart";
import EmptyState from "@/components/dashboard/EmptyState";
import Onboarding from "@/components/dashboard/Onboarding";
import PageShell from "@/components/dashboard/PageShell";
import PanelCard from "@/components/dashboard/PanelCard";
import StatCard from "@/components/dashboard/StatCard";
import { bookingsByMonth, monthlyStats } from "@/lib/bookings";
import { getBusinessByEmail } from "@/lib/business";
import { koboToNaira } from "@/lib/money";
import { currentSession } from "@/lib/session-server";

export const metadata: Metadata = {
  title: "Dashboard · Lumora",
};

export default async function DashboardPage() {
  const session = await currentSession();
  const business = session ? await getBusinessByEmail(session.email) : null;

  // Nothing on this page means anything without a business, so onboarding *is*
  // the dashboard until there is one.
  if (!business) {
    return (
      <PageShell
        title="Welcome to Lumora"
        subtitle="One short form and customers can start booking you."
      >
        <Onboarding />
      </PageShell>
    );
  }

  const [stats, months] = await Promise.all([
    monthlyStats(business.id),
    bookingsByMonth(business.id, 6),
  ]);

  // A business with no bookings in either month gets a way to get some, not three
  // zeroes and a flat chart.
  if (stats.empty) {
    return (
      <PageShell title="Welcome back" subtitle={`${business.name} is ready for bookings.`}>
        <EmptyState
          icon={<CalendarClock />}
          title="No bookings yet"
          description="Share your booking link and the numbers here fill in on their own — every appointment, deposit and no-show."
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

  const { current, delta } = stats;

  return (
    <PageShell
      title="Welcome back"
      subtitle={`Here's how ${business.name} is doing this month.`}
    >
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <StatCard
          label="Bookings"
          value={current.bookings}
          delta={delta.bookings}
          icon={<CalendarCheck />}
        />
        <StatCard
          label="Deposits collected"
          value={koboToNaira(current.depositsKobo)}
          prefix="₦"
          delta={delta.depositsKobo}
          icon={<Wallet />}
        />
        <StatCard
          label="No-show rate"
          value={current.noShowRate ?? 0}
          suffix="%"
          decimals={1}
          delta={delta.noShowRate}
          lowerIsBetter
          icon={<UserX />}
        />
      </div>

      <PanelCard
        title="Bookings this month"
        subtitle="Confirmed appointments, last six months"
        glow
      >
        <BarChart
          data={months.map((month) => ({
            month: month.label,
            bookings: month.bookings,
          }))}
        />
      </PanelCard>
    </PageShell>
  );
}
