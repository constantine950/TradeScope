"use client";
import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  LineData,
} from "lightweight-charts";
import { BacktestTrade, EquityPoint } from "../../types/backtest";

interface Props {
  equityCurve: EquityPoint[];
  trades: BacktestTrade[];
  initialCapital: number;
}

export default function EquityCurveChart({
  equityCurve,
  trades,
  initialCapital,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 250,
      layout: { background: { color: "#161b27" }, textColor: "#94a3b8" },
      grid: {
        vertLines: { color: "#2a3347" },
        horzLines: { color: "#2a3347" },
      },
      rightPriceScale: { borderColor: "#2a3347" },
      timeScale: { borderColor: "#2a3347", timeVisible: true },
    });

    const lineSeries = chart.addLineSeries({
      color: "#3b82f6",
      lineWidth: 2,
      priceLineVisible: false,
    });

    // Add baseline at initial capital
    chart.addLineSeries({
      color: "#2a3347",
      lineWidth: 1,
      lineStyle: 2,
      priceLineVisible: false,
    });

    chartRef.current = chart;
    lineSeriesRef.current = lineSeries;

    const ro = new ResizeObserver(() => {
      if (containerRef.current)
        chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, []);

  useEffect(() => {
    if (!lineSeriesRef.current || !equityCurve.length) return;

    const data: LineData[] = equityCurve
      .filter((p) => p.timestamp && p.value)
      .map((p) => ({
        time: (new Date(p.timestamp).getTime() / 1000) as UTCTimestamp,
        value: p.value,
      }));

    // Deduplicate by time
    const seen = new Set<number>();
    const deduped = data.filter((d) => {
      const t = d.time as number;
      if (seen.has(t)) return false;
      seen.add(t);
      return true;
    });

    lineSeriesRef.current.setData(deduped);
    chartRef.current?.timeScale().fitContent();
  }, [equityCurve]);

  const finalValue =
    equityCurve[equityCurve.length - 1]?.value ?? initialCapital;
  const totalReturn = ((finalValue - initialCapital) / initialCapital) * 100;
  const isPositive = totalReturn >= 0;

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "14px" }}>Equity Curve</span>
        <div style={{ display: "flex", gap: "16px", fontSize: "13px" }}>
          <span style={{ color: "var(--text-secondary)" }}>
            Start: ${initialCapital.toLocaleString()}
          </span>
          <span style={{ color: "var(--text-secondary)" }}>
            End: $
            {finalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
          <span
            style={{
              color: isPositive ? "var(--green)" : "var(--red)",
              fontWeight: 600,
            }}
          >
            {isPositive ? "+" : ""}
            {totalReturn.toFixed(2)}%
          </span>
        </div>
      </div>
      <div ref={containerRef} style={{ width: "100%", height: "250px" }} />
    </div>
  );
}
