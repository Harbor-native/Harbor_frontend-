"use client";

import type { ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { formatCrypto, formatDateTime, formatFiat, truncateAddress } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/mock-data";
import type { TransactionRecord, TransactionStatus } from "@/lib/types";
import { TransactionStatusBadge } from "./TransactionStatusBadge";

const TIMELINE_STEPS: { status: TransactionStatus; label: string }[] = [
  { status: "pending", label: "Order submitted" },
  { status: "processing", label: "Payment processing" },
  { status: "completed", label: "Crypto delivered" },
];

function stepIndex(status: TransactionStatus): number {
  if (status === "failed") return -1;
  return TIMELINE_STEPS.findIndex((s) => s.status === status);
}

export function TransactionDetailModal({
  tx,
  onClose,
}: {
  tx: TransactionRecord | null;
  onClose: () => void;
}) {
  if (!tx) return null;
  const method = PAYMENT_METHODS.find((m) => m.id === tx.paymentMethod);
  const activeIndex = stepIndex(tx.status);

  return (
    <Modal open={!!tx} onClose={onClose} title="Transaction details">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold"
            style={{ backgroundColor: `${tx.asset.color}22`, color: tx.asset.color }}
          >
            {tx.asset.icon}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Buy {formatCrypto(tx.cryptoAmount, tx.asset.symbol)}
            </p>
            <p className="text-xs text-muted">{formatDateTime(tx.createdAt)}</p>
          </div>
        </div>
        <TransactionStatusBadge status={tx.status} />
      </div>

      {tx.status === "failed" ? (
        <div className="mb-5 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          This transaction failed during payment processing. No funds were deducted.
        </div>
      ) : (
        <ol className="mb-5 space-y-3">
          {TIMELINE_STEPS.map((step, index) => {
            const done = index <= activeIndex;
            return (
              <li key={step.status} className="flex items-center gap-3">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                    done ? "bg-brand text-brand-foreground" : "border border-border text-muted"
                  }`}
                >
                  {done ? "✓" : ""}
                </span>
                <span className={`text-sm ${done ? "text-foreground" : "text-muted"}`}>
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <dl className="space-y-2.5 rounded-xl bg-surface-muted p-4 text-sm">
        <Row label="Amount">{formatFiat(tx.fiatAmount, tx.fiatCurrency)}</Row>
        <Row label="You receive">{formatCrypto(tx.cryptoAmount, tx.asset.symbol)}</Row>
        <Row label="Network">{tx.asset.network}</Row>
        <Row label="Payment method">{method?.label}</Row>
        <Row label="Wallet">{truncateAddress(tx.walletAddress)}</Row>
        <Row label="Provider fee">{formatFiat(tx.providerFee, tx.fiatCurrency)}</Row>
        <Row label="Network fee">{formatFiat(tx.networkFee, tx.fiatCurrency)}</Row>
        {tx.txHash && (
          <Row label="Tx hash">
            <span className="font-mono">{truncateAddress(tx.txHash, 10, 8)}</span>
          </Row>
        )}
      </dl>
    </Modal>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted">{label}</dt>
      <dd className="font-medium text-foreground">{children}</dd>
    </div>
  );
}
