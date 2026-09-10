"use client";

import { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { COUNTRIES, EMPTY_KYC } from "@/lib/mock-data";
import type { KycData } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { SelectInput, TextInput } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";

const STEPS = ["Personal", "Address", "Identity", "Review"];

export function KycFlow() {
  const { state, submitKyc } = useAppState();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<KycData>(
    state.kycData.fullName ? state.kycData : EMPTY_KYC,
  );

  if (state.kycStatus === "verified") {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-soft text-2xl text-success">
          ✓
        </div>
        <h2 className="text-lg font-semibold text-foreground">You&apos;re verified</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Your identity has been verified. You now have full access to purchase limits
          and payment methods.
        </p>
      </Card>
    );
  }

  if (state.kycStatus === "pending") {
    return (
      <Card className="p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-warning-soft text-2xl text-warning">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
        <h2 className="text-lg font-semibold text-foreground">Verification in review</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          We&apos;re reviewing the details you submitted for{" "}
          <span className="font-medium text-foreground">{state.kycData.fullName}</span>. This
          typically takes just a moment in this demo.
        </p>
        <Badge tone="warning">Pending review</Badge>
      </Card>
    );
  }

  const update = (patch: Partial<KycData>) => setForm((f) => ({ ...f, ...patch }));

  const canAdvance = () => {
    if (step === 0) return form.fullName.trim().length > 1 && form.dateOfBirth;
    if (step === 1) return form.country && form.address && form.city && form.postalCode;
    if (step === 2) return form.idNumber.trim().length > 3;
    return true;
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <TextInput
            label="Full legal name"
            placeholder="Jane Doe"
            value={form.fullName}
            onChange={(e) => update({ fullName: e.target.value })}
          />
          <TextInput
            label="Date of birth"
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => update({ dateOfBirth: e.target.value })}
          />
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <SelectInput
            label="Country of residence"
            value={form.country}
            onChange={(e) => update({ country: e.target.value })}
          >
            <option value="">Select a country</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectInput>
          <TextInput
            label="Street address"
            placeholder="123 Harbor Way"
            value={form.address}
            onChange={(e) => update({ address: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="City"
              value={form.city}
              onChange={(e) => update({ city: e.target.value })}
            />
            <TextInput
              label="Postal code"
              value={form.postalCode}
              onChange={(e) => update({ postalCode: e.target.value })}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <SelectInput
            label="ID type"
            value={form.idType}
            onChange={(e) => update({ idType: e.target.value as KycData["idType"] })}
          >
            <option value="passport">Passport</option>
            <option value="national_id">National ID</option>
            <option value="drivers_license">Driver&apos;s License</option>
          </SelectInput>
          <TextInput
            label="ID number"
            placeholder="X1234567"
            value={form.idNumber}
            onChange={(e) => update({ idNumber: e.target.value })}
          />
          <div className="rounded-xl border-2 border-dashed border-border bg-surface-muted p-6 text-center">
            <p className="text-sm font-medium text-foreground">Upload ID document</p>
            <p className="mt-1 text-xs text-muted">
              Drag and drop or click to upload (simulated — no file is actually sent)
            </p>
            <Button variant="secondary" size="sm" className="mt-3" type="button">
              Choose file
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <SummaryRow label="Full name" value={form.fullName} />
          <SummaryRow label="Date of birth" value={form.dateOfBirth} />
          <SummaryRow label="Country" value={form.country} />
          <SummaryRow label="Address" value={`${form.address}, ${form.city} ${form.postalCode}`} />
          <SummaryRow label="ID type" value={form.idType.replace("_", " ")} />
          <SummaryRow label="ID number" value={form.idNumber} />
        </div>
      )}

      <div className="mt-6 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)} disabled={!canAdvance()}>
            Continue
          </Button>
        ) : (
          <Button onClick={() => submitKyc(form)}>Submit for verification</Button>
        )}
      </div>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-muted px-4 py-2.5 text-sm">
      <span className="text-muted">{label}</span>
      <span className="font-medium capitalize text-foreground">{value || "—"}</span>
    </div>
  );
}
