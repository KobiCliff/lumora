"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { selectClass } from "@/components/ui/field";
import { formatNaira } from "@/lib/money";
import { formatWatDate, formatWatTime } from "@/lib/time";
import { SETTABLE_STATUSES, STATUS_LABELS, type Booking, type BookingStatus } from "@/lib/types";

/**
 * The bookings table.
 *
 * The status control is a `<select>` rather than a row of buttons: four statuses
 * times a page of bookings is a lot of buttons, and on a phone a native select is
 * the one control that never mis-taps.
 */

const STATUS_STYLES: Record<BookingStatus, string> = {
  confirmed: "bg-lumora-500/10 text-lumora-600 dark:text-lumora-400",
  completed: "bg-success/10 text-success",
  no_show: "bg-danger/10 text-danger",
  cancelled: "bg-surface-inset text-muted",
};

export default function BookingsTable({ bookings }: { bookings: Booking[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-3xl border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline">
            {["When", "Customer", "Service", "Price", "Deposit", "Status"].map((heading) => (
              <th key={heading} className="pb-4 pr-4 text-label uppercase text-muted">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <BookingRow key={booking.id} booking={booking} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookingRow({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [status, setStatus] = useState(booking.status);
  const [busy, setBusy] = useState(false);

  async function changeStatus(next: BookingStatus) {
    const previous = status;
    setStatus(next); // optimistic — the select shouldn't snap back while we wait
    setBusy(true);

    const response = await fetch(`/api/bookings/${booking.id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });

    setBusy(false);
    if (!response.ok) {
      setStatus(previous);
      return;
    }
    // Cancelling frees the slot and every status moves the stats, so the server
    // components need to re-read.
    router.refresh();
  }

  return (
    <tr className="border-b border-hairline last:border-0">
      <td className="py-4 pr-4 align-top">
        <span className="block font-semibold text-strong">
          {formatWatDate(booking.startsAt)}
        </span>
        <span className="mt-0.5 block text-sm text-muted">
          {formatWatTime(booking.startsAt)}
        </span>
      </td>

      <td className="py-4 pr-4 align-top">
        <span className="block font-semibold text-strong">{booking.customerName}</span>
        <a
          href={`tel:${booking.customerPhone.replace(/[^+\d]/g, "")}`}
          className="mt-0.5 block text-sm text-muted hover:text-lumora-600"
        >
          {booking.customerPhone}
        </a>
      </td>

      <td className="py-4 pr-4 align-top text-strong">{booking.serviceName}</td>

      <td className="py-4 pr-4 align-top tabular-nums text-strong">
        {formatNaira(booking.priceKobo)}
      </td>

      <td className="py-4 pr-4 align-top">
        {booking.depositKobo === 0 ? (
          <span className="text-muted">—</span>
        ) : (
          <span
            className={`inline-block rounded-chip px-2.5 py-1 text-sm font-semibold ${
              booking.deposit.status === "paid"
                ? "bg-success/10 text-success"
                : "bg-surface-inset text-muted"
            }`}
          >
            {formatNaira(booking.depositKobo)}{" "}
            {booking.deposit.status === "paid" ? "paid" : "unpaid"}
          </span>
        )}
      </td>

      <td className="py-4 align-top">
        <span className="flex items-center gap-2">
          <select
            value={status}
            disabled={busy}
            aria-label={`Status for ${booking.customerName}'s booking`}
            onChange={(event) => changeStatus(event.target.value as BookingStatus)}
            className={`${selectClass} w-auto py-2 pl-3 pr-2 text-sm font-semibold ${STATUS_STYLES[status]}`}
          >
            {SETTABLE_STATUSES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
          {busy ? <Loader2 className="size-4 animate-spin text-muted" /> : null}
        </span>
      </td>
    </tr>
  );
}
