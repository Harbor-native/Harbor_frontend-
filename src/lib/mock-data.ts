import type {
  CryptoAsset,
  FiatCurrency,
  KycData,
  PaymentMethodOption,
  Quote,
  TransactionRecord,
  WalletProviderId,
} from "./types";

export const ASSETS: CryptoAsset[] = [
  { symbol: "BTC", name: "Bitcoin", network: "Bitcoin", icon: "₿", color: "#f7931a" },
  { symbol: "ETH", name: "Ethereum", network: "Ethereum", icon: "Ξ", color: "#627eea" },
  { symbol: "SOL", name: "Solana", network: "Solana", icon: "◎", color: "#14f195" },
  { symbol: "USDC", name: "USD Coin", network: "Ethereum", icon: "$", color: "#2775ca" },
];

export const BASE_RATES: Record<string, number> = {
  BTC: 62_450.32,
  ETH: 3_412.87,
  SOL: 142.19,
  USDC: 1,
};

export const FIAT_CURRENCIES: { id: FiatCurrency; label: string; symbol: string }[] = [
  { id: "USD", label: "US Dollar", symbol: "$" },
  { id: "EUR", label: "Euro", symbol: "€" },
  { id: "GBP", label: "British Pound", symbol: "£" },
];

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "card",
    label: "Debit / Credit Card",
    description: "Instant purchase, highest fee",
    feePercent: 0.035,
    etaLabel: "Instant",
  },
  {
    id: "bank_transfer",
    label: "Bank Transfer",
    description: "Lower fee, takes longer to settle",
    feePercent: 0.008,
    etaLabel: "1-3 business days",
  },
  {
    id: "apple_pay",
    label: "Apple Pay",
    description: "Fast checkout via Apple Pay",
    feePercent: 0.03,
    etaLabel: "Instant",
  },
  {
    id: "google_pay",
    label: "Google Pay",
    description: "Fast checkout via Google Pay",
    feePercent: 0.03,
    etaLabel: "Instant",
  },
];

export const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Nigeria",
  "Kenya",
  "South Africa",
  "India",
  "Singapore",
  "Australia",
  "Brazil",
];

export const WALLET_PROVIDERS: { id: WalletProviderId; label: string; icon: string }[] = [
  { id: "metamask", label: "MetaMask", icon: "\u{1F98A}" },
  { id: "phantom", label: "Phantom", icon: "\u{1F47B}" },
  { id: "coinbase", label: "Coinbase Wallet", icon: "\u{1F535}" },
  { id: "walletconnect", label: "WalletConnect", icon: "\u{1F517}" },
];

const NETWORK_BY_PROVIDER: Record<WalletProviderId, string> = {
  metamask: "Ethereum",
  coinbase: "Ethereum",
  walletconnect: "Ethereum",
  phantom: "Solana",
};

function randomHex(length: number): string {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function generateMockAddress(provider: WalletProviderId): string {
  if (provider === "phantom") {
    const base58 =
      "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    let out = "";
    for (let i = 0; i < 44; i++) {
      out += base58[Math.floor(Math.random() * base58.length)];
    }
    return out;
  }
  return `0x${randomHex(40)}`;
}

export function networkForProvider(provider: WalletProviderId): string {
  return NETWORK_BY_PROVIDER[provider];
}

export function currentRate(symbol: string): number {
  const base = BASE_RATES[symbol] ?? 1;
  const jitter = (Math.random() - 0.5) * 0.006;
  return Number((base * (1 + jitter)).toFixed(2));
}

export function buildQuote(params: {
  fiatAmount: number;
  fiatCurrency: FiatCurrency;
  asset: CryptoAsset;
  feePercent: number;
}): Quote {
  const { fiatAmount, fiatCurrency, asset, feePercent } = params;
  const rate = currentRate(asset.symbol);
  const providerFee = Number((fiatAmount * feePercent).toFixed(2));
  const networkFee = asset.symbol === "USDC" ? 0.5 : Number((rate * 0.00012).toFixed(2));
  const spendable = Math.max(fiatAmount - providerFee - networkFee, 0);
  const cryptoAmount = Number((spendable / rate).toFixed(8));
  const total = Number((fiatAmount).toFixed(2));

  return {
    fiatAmount,
    fiatCurrency,
    asset,
    rate,
    cryptoAmount,
    providerFee,
    networkFee,
    total,
    expiresAt: Date.now() + 30_000,
  };
}

function randomId(): string {
  return `hb_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function seedTransactions(): TransactionRecord[] {
  const now = Date.now();
  const day = 86_400_000;

  const entries: Array<{
    offsetDays: number;
    status: TransactionRecord["status"];
    assetSymbol: string;
    fiatAmount: number;
    paymentMethod: TransactionRecord["paymentMethod"];
  }> = [
    { offsetDays: 0.2, status: "completed", assetSymbol: "ETH", fiatAmount: 500, paymentMethod: "card" },
    { offsetDays: 1.4, status: "completed", assetSymbol: "BTC", fiatAmount: 1200, paymentMethod: "bank_transfer" },
    { offsetDays: 3, status: "failed", assetSymbol: "SOL", fiatAmount: 150, paymentMethod: "card" },
    { offsetDays: 5.5, status: "completed", assetSymbol: "USDC", fiatAmount: 800, paymentMethod: "apple_pay" },
    { offsetDays: 9, status: "completed", assetSymbol: "SOL", fiatAmount: 300, paymentMethod: "google_pay" },
  ];

  return entries.map((entry) => {
    const asset = ASSETS.find((a) => a.symbol === entry.assetSymbol)!;
    const method = PAYMENT_METHODS.find((m) => m.id === entry.paymentMethod)!;
    const quote = buildQuote({
      fiatAmount: entry.fiatAmount,
      fiatCurrency: "USD",
      asset,
      feePercent: method.feePercent,
    });
    return {
      id: randomId(),
      createdAt: new Date(now - entry.offsetDays * day).toISOString(),
      status: entry.status,
      fiatAmount: entry.fiatAmount,
      fiatCurrency: "USD",
      cryptoAmount: quote.cryptoAmount,
      asset,
      paymentMethod: entry.paymentMethod,
      walletAddress: generateMockAddress("metamask"),
      providerFee: quote.providerFee,
      networkFee: quote.networkFee,
      total: quote.total,
      txHash: entry.status === "completed" ? `0x${randomHex(64)}` : null,
    };
  });
}

export const EMPTY_KYC: KycData = {
  fullName: "",
  dateOfBirth: "",
  country: "",
  address: "",
  city: "",
  postalCode: "",
  idType: "passport",
  idNumber: "",
  submittedAt: null,
};

export function generateTransactionId(): string {
  return randomId();
}

export function generateTxHash(): string {
  return `0x${randomHex(64)}`;
}
