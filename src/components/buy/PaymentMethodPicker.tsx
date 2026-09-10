import { PAYMENT_METHODS } from "@/lib/mock-data";
import type { PaymentMethodId } from "@/lib/types";

export function PaymentMethodPicker({
  selected,
  onSelect,
}: {
  selected: PaymentMethodId | null;
  onSelect: (id: PaymentMethodId) => void;
}) {
  return (
    <div className="space-y-2.5">
      {PAYMENT_METHODS.map((method) => {
        const active = method.id === selected;
        return (
          <button
            key={method.id}
            type="button"
            onClick={() => onSelect(method.id)}
            className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-colors cursor-pointer ${
              active
                ? "border-brand bg-brand-soft"
                : "border-border bg-surface-muted hover:border-brand/50"
            }`}
          >
            <div>
              <p className="text-sm font-medium text-foreground">{method.label}</p>
              <p className="text-xs text-muted">{method.description}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {(method.feePercent * 100).toFixed(1)}% fee
              </p>
              <p className="text-xs text-muted">{method.etaLabel}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
