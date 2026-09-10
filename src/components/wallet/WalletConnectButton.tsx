"use client";

import { useState } from "react";
import { useAppState } from "@/context/AppStateContext";
import { WALLET_PROVIDERS } from "@/lib/mock-data";
import { truncateAddress } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { WalletProviderId } from "@/lib/types";

export function WalletConnectButton() {
  const { state, connectWallet, disconnectWallet } = useAppState();
  const [open, setOpen] = useState(false);
  const { wallet } = state;

  if (wallet.status === "connected" && wallet.address) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden items-center gap-2 rounded-xl border border-border bg-surface-muted px-3 py-2 text-sm sm:flex">
          <span className="h-2 w-2 rounded-full bg-success" />
          <span className="font-mono text-foreground">{truncateAddress(wallet.address)}</span>
        </span>
        <Button variant="secondary" size="sm" onClick={disconnectWallet}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        loading={wallet.status === "connecting"}
        size="sm"
      >
        {wallet.status === "connecting" ? "Connecting…" : "Connect Wallet"}
      </Button>
      <WalletModal
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(provider) => {
          connectWallet(provider);
          setOpen(false);
        }}
      />
    </>
  );
}

function WalletModal({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (provider: WalletProviderId) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Connect a wallet">
      <p className="mb-4 text-sm text-muted">
        Choose a wallet to connect to Harbor. This is a simulated connection for demo
        purposes — no real wallet extension is required.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {WALLET_PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            onClick={() => onSelect(provider.id)}
            className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface-muted px-4 py-5 text-center transition-colors hover:border-brand hover:bg-brand-soft cursor-pointer"
          >
            <span className="text-2xl">{provider.icon}</span>
            <span className="text-sm font-medium text-foreground">{provider.label}</span>
          </button>
        ))}
      </div>
    </Modal>
  );
}
