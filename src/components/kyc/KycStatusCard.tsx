import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { KycStatus } from "@/lib/types";

const CONFIG: Record<
  KycStatus,
  { title: string; description: string; tone: "success" | "warning" | "danger" | "neutral"; label: string }
> = {
  unverified: {
    title: "Verify your identity",
    description: "Complete a quick identity check to unlock higher purchase limits.",
    tone: "neutral",
    label: "Not started",
  },
  pending: {
    title: "Verification in review",
    description: "We're reviewing your submitted details. This usually takes a few moments.",
    tone: "warning",
    label: "Pending",
  },
  verified: {
    title: "Identity verified",
    description: "You're all set. Your account has full purchase limits enabled.",
    tone: "success",
    label: "Verified",
  },
  rejected: {
    title: "Verification failed",
    description: "We couldn't verify your details. Please review and resubmit.",
    tone: "danger",
    label: "Rejected",
  },
};

export function KycStatusCard({ status }: { status: KycStatus }) {
  const config = CONFIG[status];

  return (
    <Card className="p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Identity verification</h3>
        <Badge tone={config.tone}>{config.label}</Badge>
      </div>
      <p className="mb-4 text-sm text-muted">{config.description}</p>
      {status !== "verified" && (
        <Link href="/kyc">
          <Button size="sm" variant={status === "unverified" ? "primary" : "secondary"}>
            {status === "pending" ? "View status" : "Start verification"}
          </Button>
        </Link>
      )}
    </Card>
  );
}
