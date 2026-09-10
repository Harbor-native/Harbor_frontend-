"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppStateContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { TransactionRow } from "@/components/transactions/TransactionRow";
import { TransactionDetailModal } from "@/components/transactions/TransactionDetailModal";
import type { TransactionRecord, TransactionStatus } from "@/lib/types";

const FILTERS: { id: TransactionStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "completed", label: "Completed" },
  { id: "failed", label: "Failed" },
];

export default function TransactionsPage() {
  const { state } = useAppState();
  const [filter, setFilter] = useState<TransactionStatus | "all">("all");
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? state.transactions
        : state.transactions.filter((t) => t.status === filter),
    [state.transactions, filter],
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Transactions</h1>
          <p className="mt-1 text-sm text-muted">Your full on-ramp purchase history.</p>
        </div>
        <Link href="/buy">
          <Button>Buy crypto</Button>
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors cursor-pointer ${
              filter === f.id
                ? "border-brand bg-brand-soft text-brand"
                : "border-border bg-surface-muted text-muted hover:text-foreground"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        {filtered.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">
            No transactions match this filter.
          </p>
        ) : (
          filtered.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} onClick={() => setSelectedTx(tx)} />
          ))
        )}
      </Card>

      <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
    </div>
  );
}
