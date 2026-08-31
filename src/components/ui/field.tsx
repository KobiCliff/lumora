import { cn } from "@/lib/utils";

/**
 * Form primitives for the dashboard surface.
 *
 * Deliberately class constants plus one wrapper rather than a component per
 * control: the inputs are plain `<input>`/`<select>` elements, so callers keep
 * direct access to `type`, `step`, `required` and refs without a prop passthrough
 * layer in the middle.
 */

export const inputClass =
  "w-full rounded-control border border-hairline bg-surface px-4 py-3 text-strong transition-colors placeholder:text-muted focus:border-lumora-400 focus:outline-none disabled:opacity-50";

export const selectClass = cn(inputClass, "appearance-none");

export function Field({
  label,
  hint,
  htmlFor,
  className,
  children,
}: {
  label: string;
  /** Small note under the control, e.g. units or a constraint. */
  hint?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={htmlFor} className="block text-label uppercase text-muted">
        {label}
      </label>
      {children}
      {hint ? <p className="text-sm text-muted">{hint}</p> : null}
    </div>
  );
}

/** Inline form error. `role="alert"` so it reaches screen readers on submit. */
export function FieldError({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="text-sm font-semibold text-danger">
      {children}
    </p>
  );
}
