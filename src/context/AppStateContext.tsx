"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import type { ReactNode } from "react";
import {
  EMPTY_KYC,
  generateMockAddress,
  generateTransactionId,
  generateTxHash,
  networkForProvider,
  seedTransactions,
} from "@/lib/mock-data";
import type {
  KycData,
  KycStatus,
  PaymentMethodId,
  Quote,
  TransactionRecord,
  WalletProviderId,
  WalletState,
} from "@/lib/types";

interface AppState {
  wallet: WalletState;
  kycStatus: KycStatus;
  kycData: KycData;
  transactions: TransactionRecord[];
  hydrated: boolean;
}

type Action =
  | { type: "WALLET_CONNECT_START"; provider: WalletProviderId }
  | { type: "WALLET_CONNECT_SUCCESS"; provider: WalletProviderId; address: string; network: string }
  | { type: "WALLET_DISCONNECT" }
  | { type: "KYC_SUBMIT"; data: KycData }
  | { type: "KYC_SET_STATUS"; status: KycStatus }
  | { type: "TX_ADD"; tx: TransactionRecord }
  | { type: "TX_UPDATE_STATUS"; id: string; status: TransactionRecord["status"]; txHash?: string | null }
  | { type: "HYDRATE"; state: Partial<AppState> };

const initialState: AppState = {
  wallet: { status: "disconnected", address: null, provider: null, network: null },
  kycStatus: "unverified",
  kycData: EMPTY_KYC,
  transactions: [],
  hydrated: false,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "WALLET_CONNECT_START":
      return {
        ...state,
        wallet: { status: "connecting", address: null, provider: action.provider, network: null },
      };
    case "WALLET_CONNECT_SUCCESS":
      return {
        ...state,
        wallet: {
          status: "connected",
          address: action.address,
          provider: action.provider,
          network: action.network,
        },
      };
    case "WALLET_DISCONNECT":
      return { ...state, wallet: initialState.wallet };
    case "KYC_SUBMIT":
      return { ...state, kycStatus: "pending", kycData: action.data };
    case "KYC_SET_STATUS":
      return { ...state, kycStatus: action.status };
    case "TX_ADD":
      return { ...state, transactions: [action.tx, ...state.transactions] };
    case "TX_UPDATE_STATUS":
      return {
        ...state,
        transactions: state.transactions.map((tx) =>
          tx.id === action.id
            ? { ...tx, status: action.status, txHash: action.txHash ?? tx.txHash }
            : tx,
        ),
      };
    case "HYDRATE":
      return { ...state, ...action.state, hydrated: true };
    default:
      return state;
  }
}

const STORAGE_KEY = "harbor:app-state:v1";

interface AppStateContextValue {
  state: AppState;
  connectWallet: (provider: WalletProviderId) => void;
  disconnectWallet: () => void;
  submitKyc: (data: KycData) => void;
  submitPurchase: (quote: Quote, paymentMethod: PaymentMethodId, walletAddress: string) => TransactionRecord;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    let stored: Partial<AppState> | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) stored = JSON.parse(raw);
    } catch {
      stored = null;
    }

    dispatch({
      type: "HYDRATE",
      state: {
        wallet: stored?.wallet ?? initialState.wallet,
        kycStatus: stored?.kycStatus ?? initialState.kycStatus,
        kycData: stored?.kycData ?? initialState.kycData,
        transactions: stored?.transactions ?? seedTransactions(),
      },
    });

    const pendingTimers = timers.current;
    return () => {
      pendingTimers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          wallet: state.wallet,
          kycStatus: state.kycStatus,
          kycData: state.kycData,
          transactions: state.transactions,
        }),
      );
    } catch {
      // ignore storage failures (private mode, quota, etc.)
    }
  }, [state.hydrated, state.wallet, state.kycStatus, state.kycData, state.transactions]);

  const connectWallet = useCallback((provider: WalletProviderId) => {
    dispatch({ type: "WALLET_CONNECT_START", provider });
    const t = setTimeout(() => {
      dispatch({
        type: "WALLET_CONNECT_SUCCESS",
        provider,
        address: generateMockAddress(provider),
        network: networkForProvider(provider),
      });
    }, 900);
    timers.current.push(t);
  }, []);

  const disconnectWallet = useCallback(() => {
    dispatch({ type: "WALLET_DISCONNECT" });
  }, []);

  const submitKyc = useCallback((data: KycData) => {
    dispatch({ type: "KYC_SUBMIT", data: { ...data, submittedAt: new Date().toISOString() } });
    const t = setTimeout(() => {
      dispatch({ type: "KYC_SET_STATUS", status: "verified" });
    }, 2600);
    timers.current.push(t);
  }, []);

  const submitPurchase = useCallback(
    (quote: Quote, paymentMethod: PaymentMethodId, walletAddress: string): TransactionRecord => {
      const tx: TransactionRecord = {
        id: generateTransactionId(),
        createdAt: new Date().toISOString(),
        status: "pending",
        fiatAmount: quote.fiatAmount,
        fiatCurrency: quote.fiatCurrency,
        cryptoAmount: quote.cryptoAmount,
        asset: quote.asset,
        paymentMethod,
        walletAddress,
        providerFee: quote.providerFee,
        networkFee: quote.networkFee,
        total: quote.total,
        txHash: null,
      };
      dispatch({ type: "TX_ADD", tx });

      const t1 = setTimeout(() => {
        dispatch({ type: "TX_UPDATE_STATUS", id: tx.id, status: "processing" });
      }, 1400);
      timers.current.push(t1);

      const t2 = setTimeout(() => {
        const succeeded = Math.random() < 0.88;
        dispatch({
          type: "TX_UPDATE_STATUS",
          id: tx.id,
          status: succeeded ? "completed" : "failed",
          txHash: succeeded ? generateTxHash() : null,
        });
      }, 3600);
      timers.current.push(t2);

      return tx;
    },
    [],
  );

  const value = useMemo<AppStateContextValue>(
    () => ({ state, connectWallet, disconnectWallet, submitKyc, submitPurchase }),
    [state, connectWallet, disconnectWallet, submitKyc, submitPurchase],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
