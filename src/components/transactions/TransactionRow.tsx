"use client";

import { formatCrypto, formatFiat, timeAgo } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/mock-data";
import type { TransactionRecord } from "@/lib/types";
import { TransactionStatusBadge } from "./TransactionStatusBadge";

export function TransactionRow({
  tx,
  onClick,
}: {
  tx: TransactionRecord;
  onClick: () => void;
}) {
  const method = PAYMENT_METHODS.find((m) => m.id === tx.paymentMethod);

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-4 border-b border-border px-5 py-4 text-left transition-colors last:border-b-0 hover:bg-surface-muted cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
          style={{ backgroundColor: `${tx.asset.color}22`, color: tx.asset.color }}
        >
          {tx.asset.icon}
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">
            Buy {tx.asset.symbol}
            <span className="ml-2 text-xs font-normal text-muted">
              {method?.label}
            </span>
          </p>
          <p className="text-xs text-muted">{timeAgo(tx.createdAt)}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">
            {formatFiat(tx.fiatAmount, tx.fiatCurrency)}
          </p>
          <p className="text-xs text-muted">{formatCrypto(tx.cryptoAmount, tx.asset.symbol)}</p>
        </div>
        <TransactionStatusBadge status={tx.status} />
      </div>
    </button>
  );
}
