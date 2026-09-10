import { BuyFlow } from "@/components/buy/BuyFlow";

export default function BuyPage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Buy crypto</h1>
        <p className="mt-1 text-sm text-muted">
          Get a live quote and receive crypto directly in your wallet.
        </p>
      </div>
      <BuyFlow />
    </div>
  );
}
