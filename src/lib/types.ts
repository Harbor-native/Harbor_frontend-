export type WalletProviderId = "metamask" | "phantom" | "walletconnect" | "coinbase";

export type WalletConnectionStatus = "disconnected" | "connecting" | "connected";

export interface WalletState {
  status: WalletConnectionStatus;
  address: string | null;
  provider: WalletProviderId | null;
  network: string | null;
}

export type KycStatus = "unverified" | "pending" | "verified" | "rejected";

export interface KycData {
  fullName: string;
  dateOfBirth: string;
  country: string;
  address: string;
  city: string;
  postalCode: string;
  idType: "passport" | "national_id" | "drivers_license";
  idNumber: string;
  submittedAt: string | null;
}

export type FiatCurrency = "USD" | "EUR" | "GBP" | "NGN";

export interface CryptoAsset {
  symbol: string;
  name: string;
  network: string;
  icon: string;
  color: string;
}

export type PaymentMethodId = "card" | "bank_transfer" | "apple_pay" | "google_pay";

export interface PaymentMethodOption {
  id: PaymentMethodId;
  label: string;
  description: string;
  feePercent: number;
  etaLabel: string;
}

export interface Quote {
  fiatAmount: number;
  fiatCurrency: FiatCurrency;
  asset: CryptoAsset;
  rate: number;
  cryptoAmount: number;
  providerFee: number;
  networkFee: number;
  total: number;
  expiresAt: number;
}

export type TransactionStatus = "pending" | "processing" | "completed" | "failed";

export interface TransactionRecord {
  id: string;
  createdAt: string;
  status: TransactionStatus;
  fiatAmount: number;
  fiatCurrency: FiatCurrency;
  cryptoAmount: number;
  asset: CryptoAsset;
  paymentMethod: PaymentMethodId;
  walletAddress: string;
  providerFee: number;
  networkFee: number;
  total: number;
  txHash: string | null;
}
