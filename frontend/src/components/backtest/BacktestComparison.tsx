"use client";
import { useEffect, useRef } from "react";
import {
  createChart,
  IChartApi,
  UTCTimestamp,
  LineData,
} from "lightweight-charts";
import { BacktestRun } from "../../types/backtest";
import { BacktestResult, EquityPoint } from "../../types/backtest";

interface ComparisonRun {
  run: BacktestRun;
  result: BacktestResult;
  equityCurve: EquityPoint[];
}

interface Props {
  runs: ComparisonRun[];
}

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a78bfa", "#f472b6"];

export default function BacktestComparison({ runs }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!containerRef.current || !runs.length) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 300,
      layout: { background: { color: "#161b27" }, textColor: "#94a3b8" },
      grid: {
        vertLines: { color: "#2a3347" },
        horzLines: { color: "#2a3347" },
      },
      rightPriceScale: { borderColor: "#2a3347" },
      timeScale: { borderColor: "#2a3347", timeVisible: true },
    });

    runs.forEach(({ run, equityCurve }, i) => {
      const series = chart.addLineSeries({
        color: COLORS[i % COLORS.length],
        lineWidth: 2,
        title: `#${run.id} ${run.symbol}`,
        priceLineVisible: false,
      });

      const seen = new Set<number>();
      const data: LineData[] = equityCurve
        .filter((p) => p.timestamp && p.value)
        .map((p) => ({
          time: (new Date(p.timestamp).getTime() / 1000) as UTCTimestamp,
          value: p.value,
        }))
        .filter((d) => {
          const t = d.time as number;
          if (seen.has(t)) return false;
          seen.add(t);
          return true;
        });

      series.setData(data);
    });

    chart.timeScale().fitContent();
    chartRef.current = chart;

    const ro = new ResizeObserver(() => {
      if (containerRef.current)
        chart.applyOptions({ width: containerRef.current.clientWidth });
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
    };
  }, [runs]);

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
        }}
      >
        <span style={{ fontWeight: 600, fontSize: "14px" }}>
          Equity Curve Comparison
        </span>
      </div>

      {/* Legend */}
      <div
        style={{
          padding: "10px 16px",
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {runs.map(({ run, result }, i) => (
          <div
            key={run.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "12px",
            }}
          >
            <div
              style={{
                width: "12px",
                height: "3px",
                background: COLORS[i % COLORS.length],
                borderRadius: "2px",
              }}
            />
            <span style={{ color: "var(--text-secondary)" }}>
              Run #{run.id}
            </span>
            <span>
              {run.symbol} {run.interval}
            </span>
            <span
              style={{
                color:
                  (result.total_return_pct ?? 0) >= 0
                    ? "var(--green)"
                    : "var(--red)",
                fontWeight: 600,
              }}
            >
              {(result.total_return_pct ?? 0) >= 0 ? "+" : ""}
              {result.total_return_pct?.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>

      <div ref={containerRef} style={{ width: "100%", height: "300px" }} />

      {/* Side by side metrics */}
      <div style={{ padding: "16px", overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border)" }}>
              <th
                style={{
                  padding: "8px 12px",
                  textAlign: "left",
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                }}
              >
                Metric
              </th>
              {runs.map(({ run }, i) => (
                <th
                  key={run.id}
                  style={{
                    padding: "8px 12px",
                    textAlign: "left",
                    color: COLORS[i % COLORS.length],
                    fontWeight: 500,
                  }}
                >
                  Run #{run.id}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              {
                label: "Total Return",
                key: "total_return_pct",
                format: (v: number) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}%`,
              },
              {
                label: "Final Capital",
                key: "final_capital",
                format: (v: number) => `$${v.toLocaleString()}`,
              },
              {
                label: "Sharpe Ratio",
                key: "sharpe_ratio",
                format: (v: number) => v.toFixed(2),
              },
              {
                label: "Max Drawdown",
                key: "max_drawdown_pct",
                format: (v: number) => `${v.toFixed(2)}%`,
              },
              {
                label: "Win Rate",
                key: "win_rate_pct",
                format: (v: number) => `${v.toFixed(1)}%`,
              },
              {
                label: "Total Trades",
                key: "total_trades",
                format: (v: number) => v.toString(),
              },
            ].map(({ label, key, format }) => (
              <tr key={key} style={{ borderBottom: "1px solid var(--border)" }}>
                <td
                  style={{
                    padding: "8px 12px",
                    color: "var(--text-secondary)",
                  }}
                >
                  {label}
                </td>
                {runs.map(({ run, result }) => (
                  <td key={run.id} style={{ padding: "8px 12px" }}>
                    {result[key as keyof BacktestResult] !== null
                      ? format(result[key as keyof BacktestResult] as number)
                      : "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
