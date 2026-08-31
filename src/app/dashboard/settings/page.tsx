import type { Metadata } from "next";
import { Settings } from "lucide-react";
import Link from "next/link";
import BusinessSettingsForm from "@/components/dashboard/BusinessSettingsForm";
import EmptyState from "@/components/dashboard/EmptyState";
import PageShell from "@/components/dashboard/PageShell";
import ServicesManager from "@/components/dashboard/ServicesManager";
import { getBusinessByEmail, listServices } from "@/lib/business";
import { currentSession } from "@/lib/session-server";

export const metadata: Metadata = {
  title: "Settings · Lumora",
};

export default async function SettingsPage() {
  const session = await currentSession();
  const business = session ? await getBusinessByEmail(session.email) : null;

  if (!business) {
    return (
      <PageShell
        title="Settings"
        subtitle="Your business details, services, and how deposits are collected."
      >
        <EmptyState
          icon={<Settings />}
          title="No business yet"
          description="Services and opening hours hang off a business, so set that up first — it's one short form."
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

  const services = await listServices(business.id);

  return (
    <PageShell
      title="Settings"
      subtitle="Your business details, services, and how deposits are collected."
    >
      <div className="space-y-8">
        <BusinessSettingsForm business={business} />
        <ServicesManager services={services} />
      </div>
    </PageShell>
  );
}
