"use client";
import { useState } from "react";
import { SYMBOLS } from "../../lib/constants";

interface Props {
  onTrade: (symbol: string, action: "BUY" | "SELL", quantity?: number) => void;
  trading: boolean;
  balance: number;
}

export default function TradeButton({ onTrade, trading, balance }: Props) {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [action, setAction] = useState<"BUY" | "SELL">("BUY");
  const [useCustomQty, setUseCustomQty] = useState(false);
  const [quantity, setQuantity] = useState("");

  const handleTrade = () => {
    const qty = useCustomQty && quantity ? parseFloat(quantity) : undefined;
    onTrade(symbol, action, qty);
  };

  const selectStyle = {
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    border: "1px solid var(--border)",
    borderRadius: "6px",
    padding: "8px 12px",
    fontSize: "13px",
  };

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        padding: "20px",
      }}
    >
      <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>
        Execute Trade
      </h2>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginBottom: "16px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "12px",
              marginBottom: "6px",
            }}
          >
            Symbol
          </label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            style={selectStyle}
          >
            {SYMBOLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "12px",
              marginBottom: "6px",
            }}
          >
            Action
          </label>
          <div style={{ display: "flex", gap: "6px" }}>
            {(["BUY", "SELL"] as const).map((a) => (
              <button
                key={a}
                onClick={() => setAction(a)}
                style={{
                  padding: "8px 20px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  border: `1px solid ${action === a ? (a === "BUY" ? "var(--green)" : "var(--red)") : "var(--border)"}`,
                  background:
                    action === a
                      ? a === "BUY"
                        ? "#22c55e22"
                        : "#ef444422"
                      : "transparent",
                  color:
                    action === a
                      ? a === "BUY"
                        ? "var(--green)"
                        : "var(--red)"
                      : "var(--text-secondary)",
                  cursor: "pointer",
                }}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            style={{
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "12px",
              marginBottom: "6px",
            }}
          >
            Quantity
          </label>
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <button
              onClick={() => setUseCustomQty(false)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                border: `1px solid ${!useCustomQty ? "var(--accent)" : "var(--border)"}`,
                background: !useCustomQty ? "var(--accent)" : "transparent",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              Auto
            </button>
            <button
              onClick={() => setUseCustomQty(true)}
              style={{
                padding: "8px 12px",
                borderRadius: "6px",
                fontSize: "12px",
                border: `1px solid ${useCustomQty ? "var(--accent)" : "var(--border)"}`,
                background: useCustomQty ? "var(--accent)" : "transparent",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              Custom
            </button>
            {useCustomQty && (
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0.001"
                step="0.001"
                style={{ ...selectStyle, width: "100px" }}
              />
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: "12px",
          color: "var(--text-secondary)",
          marginBottom: "12px",
        }}
      >
        Available balance:{" "}
        <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </span>
        {!useCustomQty && action === "BUY" && (
          <span> — Auto uses 95% of balance</span>
        )}
      </div>

      <button
        onClick={handleTrade}
        disabled={trading}
        style={{
          padding: "10px 32px",
          borderRadius: "6px",
          fontWeight: 600,
          fontSize: "14px",
          border: "none",
          background: trading
            ? "var(--border)"
            : action === "BUY"
              ? "var(--green)"
              : "var(--red)",
          color: "#fff",
          cursor: trading ? "not-allowed" : "pointer",
        }}
      >
        {trading ? "Executing..." : `${action} ${symbol.replace("USDT", "")}`}
      </button>
    </div>
  );
}
