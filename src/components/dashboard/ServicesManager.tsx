"use client";

import { Eye, EyeOff, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PanelCard from "@/components/dashboard/PanelCard";
import { Button } from "@/components/ui/button";
import { Field, FieldError, inputClass, selectClass } from "@/components/ui/field";
import { formatNaira, koboToNaira, nairaToKobo } from "@/lib/money";
import type { Service } from "@/lib/types";

const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240];

const formatDuration = (minutes: number) =>
  minutes < 60 ? `${minutes} min` : `${minutes / 60} hr${minutes >= 120 ? "s" : ""}`;

/**
 * Service list with inline add and edit.
 *
 * "Hide" (active: false) is offered before "Delete" on purpose: hiding keeps a
 * service out of the booking page without removing the row analytics groups past
 * bookings by. Deleting is for genuine mistakes.
 */
export default function ServicesManager({ services }: { services: Service[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <PanelCard
      title="Services"
      subtitle="What customers can book, how long it takes, and what it costs."
      action={
        !adding ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
          >
            <Plus className="size-4" /> Add service
          </Button>
        ) : null
      }
    >
      <div className="space-y-4">
        {adding ? (
          <ServiceForm onDone={() => setAdding(false)} onCancel={() => setAdding(false)} />
        ) : null}

        {services.length === 0 && !adding ? (
          <p className="rounded-card border border-dashed border-hairline bg-surface-muted p-8 text-center text-muted">
            No services yet. Add one and it appears on your booking page.
          </p>
        ) : null}

        {services.map((service) =>
          editingId === service.id ? (
            <ServiceForm
              key={service.id}
              service={service}
              onDone={() => setEditingId(null)}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <ServiceRow
              key={service.id}
              service={service}
              onEdit={() => {
                setEditingId(service.id);
                setAdding(false);
              }}
            />
          ),
        )}
      </div>
    </PanelCard>
  );
}

function ServiceRow({ service, onEdit }: { service: Service; onEdit: () => void }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function send(method: "PATCH" | "DELETE", body?: unknown) {
    setBusy(true);
    await fetch(`/api/services/${service.id}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    setBusy(false);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-hairline bg-surface-muted px-5 py-4">
      <div className="min-w-0">
        <p className="flex items-center gap-2 font-semibold text-strong">
          {service.name}
          {!service.active ? (
            <span className="rounded-chip bg-surface-inset px-2 py-0.5 text-xs font-semibold text-muted">
              Hidden
            </span>
          ) : null}
        </p>
        <p className="mt-1 text-sm text-muted">
          {formatDuration(service.durationMinutes)} · {formatNaira(service.priceKobo)}
          {service.depositKobo > 0
            ? ` · ${formatNaira(service.depositKobo)} deposit`
            : " · no deposit"}
        </p>
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${service.name}`}
          className="grid size-9 place-items-center rounded-control text-muted transition-colors hover:bg-lumora-500/10 hover:text-lumora-600"
        >
          <Pencil className="size-4" />
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => send("PATCH", { active: !service.active })}
          aria-label={service.active ? `Hide ${service.name}` : `Show ${service.name}`}
          className="grid size-9 place-items-center rounded-control text-muted transition-colors hover:bg-lumora-500/10 hover:text-lumora-600 disabled:opacity-50"
        >
          {service.active ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>

        <button
          type="button"
          disabled={busy}
          onClick={() => {
            if (confirm(`Delete "${service.name}"? Past bookings keep their details.`)) {
              send("DELETE");
            }
          }}
          aria-label={`Delete ${service.name}`}
          className="grid size-9 place-items-center rounded-control text-muted transition-colors hover:bg-danger/15 hover:text-danger disabled:opacity-50"
        >
          {busy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
      </div>
    </div>
  );
}

/** Add form when `service` is absent, edit form when it's present. */
function ServiceForm({
  service,
  onDone,
  onCancel,
}: {
  service?: Service;
  onDone: () => void;
  onCancel: () => void;
}) {
  const router = useRouter();

  const [name, setName] = useState(service?.name ?? "");
  const [durationMinutes, setDurationMinutes] = useState(service?.durationMinutes ?? 60);
  const [price, setPrice] = useState(
    service ? String(koboToNaira(service.priceKobo)) : "",
  );
  const [deposit, setDeposit] = useState(
    service && service.depositKobo > 0 ? String(koboToNaira(service.depositKobo)) : "",
  );
  const [status, setStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setError(null);

    const response = await fetch(
      service ? `/api/services/${service.id}` : "/api/services",
      {
        method: service ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          durationMinutes,
          priceKobo: nairaToKobo(price),
          depositKobo: nairaToKobo(deposit),
        }),
      },
    );

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Couldn't save. Try again.");
      setStatus("idle");
      return;
    }

    onDone();
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-card border border-lumora-500/30 bg-surface p-6 shadow-lift"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-label uppercase text-muted">
          {service ? "Edit service" : "New service"}
        </p>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="grid size-8 place-items-center rounded-control text-muted transition-colors hover:bg-lumora-500/10 hover:text-lumora-600"
        >
          <X className="size-4" />
        </button>
      </div>

      <Field label="Service name">
        <input
          required
          autoFocus
          maxLength={80}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Box braids"
          className={inputClass}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Duration">
          <select
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(Number(event.target.value))}
            className={selectClass}
          >
            {DURATIONS.map((minutes) => (
              <option key={minutes} value={minutes}>
                {formatDuration(minutes)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Price (₦)">
          <input
            type="number"
            required
            min={0}
            step={100}
            inputMode="numeric"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            placeholder="15000"
            className={inputClass}
          />
        </Field>

        <Field label="Deposit (₦)" hint="Blank for none.">
          <input
            type="number"
            min={0}
            step={100}
            inputMode="numeric"
            value={deposit}
            onChange={(event) => setDeposit(event.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </Field>
      </div>

      {error ? <FieldError>{error}</FieldError> : null}

      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={status === "loading"}>
          {status === "loading" ? (
            <>
              <Loader2 className="size-4 animate-spin" /> Saving
            </>
          ) : service ? (
            "Save service"
          ) : (
            "Add service"
          )}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
