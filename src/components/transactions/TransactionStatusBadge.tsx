import { Badge } from "@/components/ui/Badge";
import type { TransactionStatus } from "@/lib/types";

const STATUS_CONFIG: Record<TransactionStatus, { label: string; tone: "success" | "warning" | "danger" }> = {
  completed: { label: "Completed", tone: "success" },
  processing: { label: "Processing", tone: "warning" },
  pending: { label: "Pending", tone: "warning" },
  failed: { label: "Failed", tone: "danger" },
};

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}
