import { KycFlow } from "@/components/kyc/KycFlow";

export default function KycPage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Identity verification</h1>
        <p className="mt-1 text-sm text-muted">
          Required for purchases over $1,000. Takes about a minute.
        </p>
      </div>
      <KycFlow />
    </div>
  );
}
