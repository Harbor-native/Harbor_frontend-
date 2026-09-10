export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {steps.map((step, index) => {
        const state =
          index < current ? "done" : index === current ? "active" : "upcoming";
        return (
          <li key={step} className="flex flex-1 items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                  state === "done"
                    ? "bg-brand text-brand-foreground"
                    : state === "active"
                      ? "border-2 border-brand text-brand"
                      : "border border-border text-muted"
                }`}
              >
                {state === "done" ? "✓" : index + 1}
              </span>
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  state === "upcoming" ? "text-muted" : "text-foreground"
                }`}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <span
                className={`h-px flex-1 ${state === "done" ? "bg-brand" : "bg-border"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
