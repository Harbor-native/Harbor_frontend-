"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { KycStatusCard } from "@/components/kyc/KycStatusCard";
import { TransactionRow } from "@/components/transactions/TransactionRow";
import { TransactionDetailModal } from "@/components/transactions/TransactionDetailModal";
import { formatFiat, truncateAddress } from "@/lib/format";
import type { TransactionRecord } from "@/lib/types";

export default function DashboardPage() {
  const { state } = useAppState();
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  const stats = useMemo(() => {
    const completed = state.transactions.filter((t) => t.status === "completed");
    const totalSpent = completed.reduce((sum, t) => sum + t.fiatAmount, 0);
    return {
      totalSpent,
      totalOrders: state.transactions.length,
      completedOrders: completed.length,
    };
  }, [state.transactions]);

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-brand-soft to-surface p-8 sm:p-10">
        <p className="mb-2 text-sm font-medium text-brand">Fiat-to-crypto on-ramp</p>
        <h1 className="max-w-lg text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Buy crypto in minutes, straight to your wallet.
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted">
          Connect a wallet, choose an amount, and pay with card or bank transfer. Harbor
          handles the quote, compliance check, and delivery.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/buy">
            <Button size="lg">Buy crypto</Button>
          </Link>
          <Link href="/transactions">
            <Button size="lg" variant="secondary">
              View history
            </Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total purchased" value={formatFiat(stats.totalSpent, "USD")} />
        <StatCard label="Completed orders" value={String(stats.completedOrders)} />
        <StatCard label="Total orders" value={String(stats.totalOrders)} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Wallet</h3>
            {state.wallet.status === "connected" && <Badge tone="success">Connected</Badge>}
          </div>
          {state.wallet.status === "connected" && state.wallet.address ? (
            <div className="text-sm">
              <p className="font-mono text-foreground">
                {truncateAddress(state.wallet.address, 8, 6)}
              </p>
              <p className="mt-1 text-muted">{state.wallet.network} network</p>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Connect a wallet from the header to start buying crypto.
            </p>
          )}
        </Card>
        <KycStatusCard status={state.kycStatus} />
      </section>

      <section>
        <Card className="overflow-hidden p-0">
          <CardHeader
            title="Recent activity"
            action={
              <Link href="/transactions" className="text-sm font-medium text-brand">
                View all
              </Link>
            }
          />
          <div className="mt-4">
            {state.transactions.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-muted">No transactions yet.</p>
            ) : (
              <div className="pb-2">
                {state.transactions.slice(0, 5).map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} onClick={() => setSelectedTx(tx)} />
                ))}
              </div>
            )}
          </div>
        </Card>
      </section>

      <TransactionDetailModal tx={selectedTx} onClose={() => setSelectedTx(null)} />
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    </Card>
  );
}
