"use client";
import { useState } from "react";
import { useCandles } from "../../hooks/useCandles";
import ChartToolbar from "../../components/chart/ChartToolbar";
import CandlestickChart from "../../components/chart/CandlestickChart";

export default function DashboardPage() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("1h");

  const { candles, loading, error } = useCandles(symbol, interval);

  const lastCandle = candles[candles.length - 1];
  const firstCandle = candles[0];
  const priceChange =
    lastCandle && firstCandle
      ? ((lastCandle.close - firstCandle.close) / firstCandle.close) * 100
      : undefined;

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg-primary)",
      }}
    >
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-secondary)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span
          style={{ fontWeight: 700, fontSize: "16px", color: "var(--accent)" }}
        >
          TradeScope
        </span>
        <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
          algorithmic trading dashboard
        </span>
      </div>

      <ChartToolbar
        symbol={symbol}
        interval={interval}
        onSymbolChange={setSymbol}
        onIntervalChange={setInterval}
        lastPrice={lastCandle?.close}
        priceChange={priceChange}
      />

      <div style={{ flex: 1, position: "relative" }}>
        {loading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              zIndex: 10,
              background: "var(--bg-primary)",
            }}
          >
            Loading candles...
          </div>
        )}
        {error && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--red)",
              zIndex: 10,
            }}
          >
            Error: {error}
          </div>
        )}
        {!loading && !error && (
          <CandlestickChart candles={candles} height={600} />
        )}
      </div>
    </div>
  );
}
