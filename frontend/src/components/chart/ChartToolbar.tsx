"use client";
import SymbolSwitcher from "./SymbolSwitcher";
import IntervalSwitcher from "./IntervalSwitcher";

export interface IndicatorToggles {
  sma: boolean;
  ema: boolean;
  bbands: boolean;
  rsi: boolean;
}

interface Props {
  symbol: string;
  interval: string;
  onSymbolChange: (s: string) => void;
  onIntervalChange: (i: string) => void;
  lastPrice?: number;
  priceChange?: number;
  indicators: IndicatorToggles;
  onIndicatorToggle: (key: keyof IndicatorToggles) => void;
}

const INDICATOR_BUTTONS: {
  key: keyof IndicatorToggles;
  label: string;
  color: string;
}[] = [
  { key: "sma", label: "SMA", color: "#f59e0b" },
  { key: "ema", label: "EMA", color: "#a78bfa" },
  { key: "bbands", label: "BB", color: "#60a5fa" },
  { key: "rsi", label: "RSI", color: "#f472b6" },
];

export default function ChartToolbar({
  symbol,
  interval,
  onSymbolChange,
  onIntervalChange,
  lastPrice,
  priceChange,
  indicators,
  onIndicatorToggle,
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
      <div
        style={{ width: "1px", height: "20px", background: "var(--border)" }}
      />

      {/* Indicator toggles */}
      <div style={{ display: "flex", gap: "4px" }}>
        {INDICATOR_BUTTONS.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => onIndicatorToggle(key)}
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              border: `1px solid ${indicators[key] ? color : "var(--border)"}`,
              background: indicators[key] ? `${color}22` : "transparent",
              color: indicators[key] ? color : "var(--text-secondary)",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: 500,
            }}
          >
            {label}
          </button>
        ))}
      </div>

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
