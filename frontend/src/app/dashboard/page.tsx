"use client";
import { useState } from "react";
import ChartToolbar, {
  IndicatorToggles,
} from "../../components/chart/ChartToolbar";
import CandlestickChart from "../../components/chart/CandlestickChart";
import { useCandles } from "../../hooks/useCandles";
import { useIndicator } from "../../hooks/useIndicators";
import { BollingerPoint, IndicatorPoint } from "../../types/indicator";

export default function DashboardPage() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("1h");
  const [indicators, setIndicators] = useState<IndicatorToggles>({
    sma: false,
    ema: false,
    bbands: false,
    rsi: false,
  });

  const { candles, loading, error } = useCandles(symbol, interval);

  const { data: smaData } = useIndicator(
    symbol,
    interval,
    "sma",
    20,
    indicators.sma,
  );
  const { data: emaData } = useIndicator(
    symbol,
    interval,
    "ema",
    20,
    indicators.ema,
  );
  const { data: bbandsData } = useIndicator(
    symbol,
    interval,
    "bbands",
    20,
    indicators.bbands,
  );
  const { data: rsiData } = useIndicator(
    symbol,
    interval,
    "rsi",
    14,
    indicators.rsi,
  );

  const handleIndicatorToggle = (key: keyof IndicatorToggles) => {
    setIndicators((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const lastCandle = candles[candles.length - 1];
  const firstCandle = candles[0];
  const priceChange =
    lastCandle && firstCandle
      ? ((lastCandle.close - firstCandle.close) / firstCandle.close) * 100
      : undefined;

  // Parse bbands data into upper/middle/lower arrays
  const bbandsOverlay = bbandsData
    ? {
        upper: bbandsData.data as unknown as BollingerPoint[],
        middle: bbandsData.data as unknown as BollingerPoint[],
        lower: bbandsData.data as unknown as BollingerPoint[],
      }
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

      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-secondary)",
        }}
      >
        <a
          href="/dashboard"
          style={{
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: 500,
            borderBottom: "2px solid var(--accent)",
            color: "var(--text-primary)",
            textDecoration: "none",
          }}
        >
          Chart
        </a>
        <a
          href="/strategy"
          style={{
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: 500,
            borderBottom: "2px solid transparent",
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          Strategy
        </a>
        <a
          href="/backtest"
          style={{
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: 500,
            borderBottom: "2px solid transparent",
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          Backtest
        </a>
        <a
          href="/paper"
          style={{
            padding: "10px 20px",
            fontSize: "13px",
            fontWeight: 500,
            borderBottom: "2px solid transparent",
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          Paper
        </a>
      </div>

      <ChartToolbar
        symbol={symbol}
        interval={interval}
        onSymbolChange={setSymbol}
        onIntervalChange={setInterval}
        lastPrice={lastCandle?.close}
        priceChange={priceChange}
        indicators={indicators}
        onIndicatorToggle={handleIndicatorToggle}
      />

      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
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
          <CandlestickChart
            candles={candles}
            height={480}
            indicators={{
              sma: indicators.sma
                ? (smaData?.data as IndicatorPoint[])
                : undefined,
              ema: indicators.ema
                ? (emaData?.data as IndicatorPoint[])
                : undefined,
              bbands: indicators.bbands ? bbandsOverlay : undefined,
            }}
            rsi={
              indicators.rsi ? (rsiData?.data as IndicatorPoint[]) : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
