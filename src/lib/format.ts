import type { FiatCurrency } from "./types";

const CURRENCY_LOCALE: Record<FiatCurrency, string> = {
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
};

export function formatFiat(amount: number, currency: FiatCurrency): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCrypto(amount: number, symbol: string): string {
  const digits = amount !== 0 && amount < 1 ? 6 : 4;
  return `${amount.toLocaleString(undefined, {
    maximumFractionDigits: digits,
  })} ${symbol}`;
}

export function truncateAddress(address: string, lead = 6, trail = 4): string {
  if (address.length <= lead + trail) return address;
  return `${address.slice(0, lead)}…${address.slice(-trail)}`;
}

export function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
