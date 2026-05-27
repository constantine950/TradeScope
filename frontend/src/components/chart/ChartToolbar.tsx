"use client";
import SymbolSwitcher from "./SymbolSwitcher";
import IntervalSwitcher from "./IntervalSwitcher";

interface Props {
  symbol: string;
  interval: string;
  onSymbolChange: (s: string) => void;
  onIntervalChange: (i: string) => void;
  lastPrice?: number;
  priceChange?: number;
}

export default function ChartToolbar({
  symbol,
  interval,
  onSymbolChange,
  onIntervalChange,
  lastPrice,
  priceChange,
}: Props) {
  const isPositive = (priceChange ?? 0) >= 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "16px",
        padding: "10px 16px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-secondary)",
        flexWrap: "wrap",
      }}
    >
      <SymbolSwitcher value={symbol} onChange={onSymbolChange} />

      <div
        style={{ width: "1px", height: "20px", background: "var(--border)" }}
      />

      <IntervalSwitcher value={interval} onChange={onIntervalChange} />

      {lastPrice && (
        <>
          <div
            style={{
              width: "1px",
              height: "20px",
              background: "var(--border)",
            }}
          />
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span style={{ fontSize: "18px", fontWeight: 600 }}>
              ${lastPrice.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            {priceChange !== undefined && (
              <span
                style={{
                  color: isPositive ? "var(--green)" : "var(--red)",
                  fontSize: "12px",
                }}
              >
                {isPositive ? "+" : ""}
                {priceChange.toFixed(2)}%
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
