"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppState } from "@/context/AppStateContext";
import { ASSETS, BASE_RATES, FIAT_CURRENCIES, PAYMENT_METHODS, buildQuote, currentRate } from "@/lib/mock-data";
import { formatCrypto, formatFiat, truncateAddress } from "@/lib/format";
import type { CryptoAsset, FiatCurrency, PaymentMethodId, Quote, TransactionRecord } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/ui/Stepper";
import { AssetPicker } from "./AssetPicker";
import { PaymentMethodPicker } from "./PaymentMethodPicker";
import { QuoteBreakdown } from "./QuoteBreakdown";
import { WalletConnectButton } from "@/components/wallet/WalletConnectButton";
import { TransactionStatusBadge } from "@/components/transactions/TransactionStatusBadge";

const STEPS = ["Amount", "Payment", "Review", "Done"];
const KYC_THRESHOLD = 1000;
const QUICK_AMOUNTS = [100, 500, 1000, 5000];

type FlowStep = 0 | 1 | 2 | 3;

export function BuyFlow() {
  const { state, submitPurchase } = useAppState();
  const [step, setStep] = useState<FlowStep>(0);
  const [fiatCurrency, setFiatCurrency] = useState<FiatCurrency>("USD");
  const [amountInput, setAmountInput] = useState("250");
  const [asset, setAsset] = useState<CryptoAsset>(ASSETS[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId | null>(null);
  const [reviewQuote, setReviewQuote] = useState<Quote | null>(null);
  const [submittedTxId, setSubmittedTxId] = useState<string | null>(null);

  const fiatAmount = Number(amountInput) || 0;
  const requiresKyc = fiatAmount > KYC_THRESHOLD && state.kycStatus !== "verified";

  const submittedTx = useMemo<TransactionRecord | null>(
    () => state.transactions.find((t) => t.id === submittedTxId) ?? null,
    [state.transactions, submittedTxId],
  );

  const goToPayment = () => setStep(1);

  const goToReview = () => {
    if (!paymentMethod) return;
    const method = PAYMENT_METHODS.find((m) => m.id === paymentMethod)!;
    setReviewQuote(
      buildQuote({ fiatAmount, fiatCurrency, asset, feePercent: method.feePercent }),
    );
    setStep(2);
  };

  const confirmPurchase = () => {
    if (!reviewQuote || !paymentMethod || !state.wallet.address) return;
    const tx = submitPurchase(reviewQuote, paymentMethod, state.wallet.address);
    setSubmittedTxId(tx.id);
    setStep(3);
  };

  const startOver = () => {
    setStep(0);
    setPaymentMethod(null);
    setReviewQuote(null);
    setSubmittedTxId(null);
  };

  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-6">
        <Stepper steps={STEPS} current={step} />
      </div>

      {step === 0 && (
        <div className="space-y-5">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">You pay</span>
              <select
                value={fiatCurrency}
                onChange={(e) => setFiatCurrency(e.target.value as FiatCurrency)}
                className="rounded-lg border border-border bg-surface-muted px-2 py-1 text-xs font-medium text-foreground outline-none"
              >
                {FIAT_CURRENCIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.id}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="number"
              min={0}
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0.00"
              className="w-full rounded-xl border border-border bg-surface-muted px-4 py-3 text-2xl font-semibold text-foreground outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
            <div className="mt-2 flex gap-2">
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAmountInput(String(amt))}
                  className="rounded-lg border border-border bg-surface-muted px-3 py-1 text-xs font-medium text-foreground hover:border-brand cursor-pointer"
                >
                  {formatFiat(amt, fiatCurrency)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="mb-1.5 block text-sm font-medium text-foreground">You receive</span>
            <AssetPicker selected={asset} onSelect={setAsset} />
            <RateEstimate
              key={asset.symbol}
              asset={asset}
              fiatAmount={fiatAmount}
              fiatCurrency={fiatCurrency}
            />
          </div>

          {requiresKyc && (
            <div className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
              Purchases over {formatFiat(KYC_THRESHOLD, fiatCurrency)} require identity
              verification.{" "}
              <Link href="/kyc" className="font-medium underline underline-offset-2">
                Verify now
              </Link>
            </div>
          )}

          <Button
            fullWidth
            size="lg"
            onClick={goToPayment}
            disabled={fiatAmount <= 0 || requiresKyc}
          >
            Continue
          </Button>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-5">
          <PaymentMethodPicker selected={paymentMethod} onSelect={setPaymentMethod} />
          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setStep(0)}>
              Back
            </Button>
            <Button onClick={goToReview} disabled={!paymentMethod} fullWidth>
              Review order
            </Button>
          </div>
        </div>
      )}

      {step === 2 && reviewQuote && (
        <div className="space-y-5">
          {state.wallet.status !== "connected" ? (
            <div className="flex flex-col items-center gap-3 rounded-xl bg-surface-muted px-4 py-6 text-center">
              <p className="text-sm text-muted">
                Connect a wallet to receive your {asset.symbol}
              </p>
              <WalletConnectButton />
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-xl bg-surface-muted px-4 py-3 text-sm">
              <span className="text-muted">Receiving wallet</span>
              <span className="font-mono font-medium text-foreground">
                {truncateAddress(state.wallet.address!)}
              </span>
            </div>
          )}

          <QuoteBreakdown key={reviewQuote.expiresAt} quote={reviewQuote} />

          <div className="flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              onClick={confirmPurchase}
              disabled={state.wallet.status !== "connected"}
              fullWidth
            >
              Confirm &amp; buy
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <ResultStep tx={submittedTx} onStartOver={startOver} />
      )}
    </Card>
  );
}

function RateEstimate({
  asset,
  fiatAmount,
  fiatCurrency,
}: {
  asset: CryptoAsset;
  fiatAmount: number;
  fiatCurrency: FiatCurrency;
}) {
  // Starts from the deterministic base rate so server and client render the
  // same markup; the live jitter only kicks in once mounted (inside the
  // interval callback below), well after hydration.
  const [rate, setRate] = useState(() => BASE_RATES[asset.symbol] ?? 1);

  useEffect(() => {
    const interval = setInterval(() => setRate(currentRate(asset.symbol)), 5000);
    return () => clearInterval(interval);
  }, [asset.symbol]);

  return (
    <p className="mt-2 text-sm text-muted">
      ≈{" "}
      <span className="font-medium text-foreground">
        {formatCrypto(fiatAmount > 0 ? fiatAmount / rate : 0, asset.symbol)}
      </span>{" "}
      at current rate ({formatFiat(rate, fiatCurrency)} / {asset.symbol}) — final price shown at
      review
    </p>
  );
}

function ResultStep({
  tx,
  onStartOver,
}: {
  tx: TransactionRecord | null;
  onStartOver: () => void;
}) {
  if (!tx) return null;

  const isTerminal = tx.status === "completed" || tx.status === "failed";

  return (
    <div className="flex flex-col items-center gap-4 py-4 text-center">
      <div
        className={`flex h-16 w-16 items-center justify-center rounded-full text-3xl ${
          tx.status === "completed"
            ? "bg-success-soft text-success"
            : tx.status === "failed"
              ? "bg-danger-soft text-danger"
              : "bg-warning-soft text-warning"
        }`}
      >
        {tx.status === "completed" ? "✓" : tx.status === "failed" ? "✕" : (
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-foreground">
          {tx.status === "completed"
            ? "Purchase complete"
            : tx.status === "failed"
              ? "Purchase failed"
              : "Processing your purchase"}
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
          {tx.status === "completed"
            ? `${formatCrypto(tx.cryptoAmount, tx.asset.symbol)} is on its way to your wallet.`
            : tx.status === "failed"
              ? "Something went wrong processing your payment. No funds were deducted."
              : "Hang tight — we're confirming your payment with the provider."}
        </p>
      </div>

      <TransactionStatusBadge status={tx.status} />

      {isTerminal && (
        <div className="mt-2 flex gap-3">
          <Link href="/transactions">
            <Button variant="secondary">View history</Button>
          </Link>
          <Button onClick={onStartOver}>Make another purchase</Button>
        </div>
      )}
    </div>
  );
}
