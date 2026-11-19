import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Libellé, aide et erreur communs aux champs de formulaire. */
type FieldProps = {
  label: string;
  /** Texte d'aide sous le champ. */
  hint?: string;
  /** Message d'erreur : dit ce qui ne va pas et comment corriger. */
  error?: string;
  /** Masque visuellement le libellé (il reste lu par les lecteurs d'écran). */
  hideLabel?: boolean;
};

const CONTROL =
  "w-full rounded-control border bg-white px-3.5 text-[15px] text-soil-900 placeholder:text-soil-500 " +
  "transition-colors duration-(--duration-fast) focus:outline-none focus-visible:outline-2 " +
  "focus-visible:outline-offset-1 focus-visible:outline-water-600 disabled:bg-soil-100 disabled:text-soil-500";

function controlClasses(error: string | undefined, extra: string, className?: string): string {
  return cn(
    CONTROL,
    error ? "border-danger-600" : "border-soil-300 hover:border-soil-400 focus:border-water-600",
    extra,
    className,
  );
}

function FieldShell({
  id,
  label,
  hint,
  error,
  hideLabel,
  children,
}: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className={cn("text-sm font-semibold text-soil-800", hideLabel && "sr-only")}>
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-soil-500">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-danger-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

export function Input({
  label,
  hint,
  error,
  hideLabel,
  className,
  id: idProp,
  ...props
}: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} hideLabel={hideLabel}>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClasses(error, "min-h-11 py-2.5", className)}
        {...props}
      />
    </FieldShell>
  );
}

export function Textarea({
  label,
  hint,
  error,
  hideLabel,
  className,
  id: idProp,
  rows = 4,
  ...props
}: FieldProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} hideLabel={hideLabel}>
      <textarea
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        className={controlClasses(error, "resize-y py-2.5 leading-relaxed", className)}
        {...props}
      />
    </FieldShell>
  );
}

export function Select({
  label,
  hint,
  error,
  hideLabel,
  className,
  id: idProp,
  children,
  ...props
}: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <FieldShell id={id} label={label} hint={hint} error={error} hideLabel={hideLabel}>
      <div className="relative">
        <select
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          className={controlClasses(error, "min-h-11 appearance-none py-2.5 pr-10", className)}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-soil-500"
        >
          <path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </FieldShell>
  );
}
