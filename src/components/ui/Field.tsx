import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}

export function FieldShell({ label, error, hint, children }: FieldShellProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 block text-xs text-danger">{error}</span>
      ) : hint ? (
        <span className="mt-1 block text-xs text-muted">{hint}</span>
      ) : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-xl border border-border bg-surface-muted px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-2 focus:ring-brand/20";

export function TextInput({
  label,
  error,
  hint,
  className = "",
  ...rest
}: Omit<FieldShellProps, "children"> & InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <FieldShell label={label} error={error} hint={hint}>
      <input className={`${inputBase} ${className}`} {...rest} />
    </FieldShell>
  );
}

export function SelectInput({
  label,
  error,
  hint,
  className = "",
  children,
  ...rest
}: Omit<FieldShellProps, "children"> &
  SelectHTMLAttributes<HTMLSelectElement> & { label: string; children: ReactNode }) {
  return (
    <FieldShell label={label} error={error} hint={hint}>
      <select className={`${inputBase} ${className}`} {...rest}>
        {children}
      </select>
    </FieldShell>
  );
}
