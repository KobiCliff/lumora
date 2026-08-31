import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";
import Link from "next/link";
import BarChart from "@/components/charts/BarChart";
import EmptyState from "@/components/dashboard/EmptyState";
import PageShell from "@/components/dashboard/PageShell";
import PanelCard from "@/components/dashboard/PanelCard";
import StatCard from "@/components/dashboard/StatCard";
import {
  bookingsByMonth,
  bookingsInRange,
  breakdownByService,
  summarize,
} from "@/lib/bookings";
import { getBusinessByEmail } from "@/lib/business";
import { formatNaira, koboToNaira } from "@/lib/money";
import { currentSession } from "@/lib/session-server";
import { recentWatMonths } from "@/lib/time";

export const metadata: Metadata = {
  title: "Analytics · Lumora",
};

/** How much history the breakdowns cover. */
const MONTHS = 6;

export default async function AnalyticsPage() {
  const session = await currentSession();
  const business = session ? await getBusinessByEmail(session.email) : null;

  if (!business) {
    return (
      <PageShell
        title="Analytics"
        subtitle="No-shows, repeat customers, and which services actually earn."
      >
        <EmptyState
          icon={<BarChart3 />}
          title="No business yet"
          description="There's nothing to chart until your booking page is taking appointments."
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

  const now = Date.now();
  const window = recentWatMonths(now, MONTHS);
  const [bookings, months] = await Promise.all([
    bookingsInRange(business.id, window[0].start, window[MONTHS - 1].end),
    bookingsByMonth(business.id, MONTHS, now),
  ]);

  if (bookings.length === 0) {
    return (
      <PageShell
        title="Analytics"
        subtitle="No-shows, repeat customers, and which services actually earn."
      >
        <EmptyState
          icon={<BarChart3 />}
          title="Not enough data yet"
          description="This page fills in on its own once appointments start coming through — no setup needed."
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

  const totals = summarize(bookings);
  const services = breakdownByService(bookings);

  // Repeat customers are counted by phone number, which is the one field a
  // Nigerian SMB's customers reliably give the same way twice.
  const byPhone = new Map<string, number>();
  for (const booking of bookings) {
    if (booking.status === "cancelled") continue;
    const key = booking.customerPhone.replace(/[^\d]/g, "");
    byPhone.set(key, (byPhone.get(key) ?? 0) + 1);
  }
  const repeatShare =
    byPhone.size === 0
      ? 0
      : ([...byPhone.values()].filter((count) => count > 1).length / byPhone.size) * 100;

  const busiest = services[0];

  return (
    <PageShell
      title="Analytics"
      subtitle={`No-shows, repeat customers, and which services actually earn — last ${MONTHS} months.`}
    >
      <div className="mb-8 grid gap-6 md:grid-cols-3">
        <StatCard
          label="Booked value"
          value={koboToNaira(totals.revenueKobo)}
          prefix="₦"
          icon={<BarChart3 />}
        />
        <StatCard
          label="Repeat customers"
          value={repeatShare}
          suffix="%"
          decimals={0}
        />
        <StatCard
          label="No-shows"
          value={totals.noShows}
          suffix={totals.noShowRate === null ? "" : ` (${totals.noShowRate.toFixed(1)}%)`}
          lowerIsBetter
        />
      </div>

      <div className="space-y-8">
        <PanelCard
          title="Bookings by month"
          subtitle={`${window[0].label} to ${window[MONTHS - 1].label}`}
          glow
        >
          <BarChart
            data={months.map((month) => ({
              month: month.label,
              bookings: month.bookings,
            }))}
          />
        </PanelCard>

        <PanelCard
          title="Which services earn"
          subtitle={
            busiest
              ? `${busiest.serviceName} brings in the most.`
              : "Ranked by booked value."
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-2xl border-collapse text-left">
              <thead>
                <tr className="border-b border-hairline">
                  {["Service", "Bookings", "Booked value", "No-shows"].map((heading) => (
                    <th
                      key={heading}
                      className="pb-4 pr-4 text-label uppercase text-muted"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((service) => (
                  <tr
                    key={service.serviceId}
                    className="border-b border-hairline last:border-0"
                  >
                    <td className="py-4 pr-4 font-semibold text-strong">
                      {service.serviceName}
                    </td>
                    <td className="py-4 pr-4 tabular-nums text-strong">
                      {service.bookings}
                    </td>
                    <td className="py-4 pr-4 tabular-nums text-strong">
                      {formatNaira(service.revenueKobo)}
                    </td>
                    <td className="py-4 tabular-nums text-muted">{service.noShows}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>
      </div>
    </PageShell>
  );
}
