"use client";

import { useEffect, useState } from "react";
import { formatCrypto, formatFiat } from "@/lib/format";
import type { Quote } from "@/lib/types";

const QUOTE_LIFETIME_SECONDS = 30;

export function QuoteBreakdown({ quote }: { quote: Quote }) {
  const [secondsLeft, setSecondsLeft] = useState(QUOTE_LIFETIME_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-2.5 rounded-xl bg-surface-muted p-4 text-sm">
      <div className="flex items-center justify-between">
        <span className="text-muted">Exchange rate</span>
        <span className="font-medium text-foreground">
          1 {quote.asset.symbol} = {formatFiat(quote.rate, quote.fiatCurrency)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted">Amount</span>
        <span className="font-medium text-foreground">
          {formatFiat(quote.fiatAmount, quote.fiatCurrency)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted">Provider fee</span>
        <span className="font-medium text-foreground">
          {formatFiat(quote.providerFee, quote.fiatCurrency)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-muted">Network fee</span>
        <span className="font-medium text-foreground">
          {formatFiat(quote.networkFee, quote.fiatCurrency)}
        </span>
      </div>
      <div className="my-1 h-px bg-border" />
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">You receive</span>
        <span className="font-semibold text-brand">
          {formatCrypto(quote.cryptoAmount, quote.asset.symbol)}
        </span>
      </div>
      <p className="pt-1 text-xs text-muted">
        Quote refreshes in {secondsLeft}s
      </p>
    </div>
  );
}
