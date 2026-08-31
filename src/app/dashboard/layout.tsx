import DashboardLayout from "@/components/layout/DashboardLayout";
import { getBusinessByEmail } from "@/lib/business";
import { currentSession } from "@/lib/session-server";

/**
 * Lives here rather than inside each page so the shell stays mounted across
 * navigations — which is what lets the sidebar's `layoutId` pill glide between
 * items instead of jumping.
 *
 * Reads the business once for the whole segment. Only the two fields the chrome
 * renders cross into the client component, keeping the RSC payload small.
 */
export default async function DashboardSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The proxy guarantees a session on /dashboard/*; the null branch is defensive.
  const session = await currentSession();
  const business = session ? await getBusinessByEmail(session.email) : null;

  return (
    <DashboardLayout
      business={business ? { name: business.name, slug: business.slug } : null}
    >
      {children}
    </DashboardLayout>
  );
}
