import { ASSETS } from "@/lib/mock-data";
import type { CryptoAsset } from "@/lib/types";

export function AssetPicker({
  selected,
  onSelect,
}: {
  selected: CryptoAsset;
  onSelect: (asset: CryptoAsset) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ASSETS.map((asset) => {
        const active = asset.symbol === selected.symbol;
        return (
          <button
            key={asset.symbol}
            type="button"
            onClick={() => onSelect(asset)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer ${
              active
                ? "border-brand bg-brand-soft"
                : "border-border bg-surface-muted hover:border-brand/50"
            }`}
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
              style={{ backgroundColor: `${asset.color}22`, color: asset.color }}
            >
              {asset.icon}
            </span>
            <span>
              <span className="block text-sm font-medium text-foreground">{asset.symbol}</span>
              <span className="block text-xs text-muted">{asset.network}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
