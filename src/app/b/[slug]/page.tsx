import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BookingFlow from "@/components/booking/BookingFlow";
import { getBusinessBySlug, listServices } from "@/lib/business";
import { watDateKey } from "@/lib/time";

/**
 * A business's public booking page. No session, no account — the customer just
 * books. `src/proxy.ts` matches `/dashboard/:path*` only, so this stays open.
 */

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) return { title: "Not found · Lumora" };

  return {
    title: `Book ${business.name} · Lumora`,
    description: `Choose a time with ${business.name} and get an instant confirmation.`,
  };
}

export default async function PublicBookingPage({ params }: Params) {
  const { slug } = await params;
  const business = await getBusinessBySlug(slug);
  if (!business) notFound();

  const services = (await listServices(business.id)).filter(
    (service) => service.active,
  );

  return (
    <main className="min-h-screen bg-linear-to-br from-lumora-900 via-ink-950 to-ink-900 px-6 py-16">
      <BookingFlow
        business={{ name: business.name, slug: business.slug, hours: business.hours }}
        services={services}
        /* The WAT day is resolved on the server and handed down, so the client's
           first render can't disagree with the HTML across a midnight boundary. */
        today={watDateKey(Date.now())}
      />

    </main>
  );
}
