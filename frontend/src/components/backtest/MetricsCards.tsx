"use client";

import { BacktestResult } from "../../types/backtest";

interface Props {
  result: BacktestResult;
  initialCapital: number;
}

export default function MetricsCards({ result, initialCapital }: Props) {
  const metrics = [
    {
      label: "Total Return",
      value:
        result.total_return_pct !== null
          ? `${result.total_return_pct > 0 ? "+" : ""}${result.total_return_pct.toFixed(2)}%`
          : "—",
      color:
        (result.total_return_pct ?? 0) >= 0 ? "var(--green)" : "var(--red)",
    },
    {
      label: "Final Capital",
      value:
        result.final_capital !== null
          ? `$${result.final_capital.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
          : "—",
      color: "var(--text-primary)",
    },
    {
      label: "Sharpe Ratio",
      value:
        result.sharpe_ratio !== null ? result.sharpe_ratio.toFixed(2) : "—",
      color:
        (result.sharpe_ratio ?? 0) >= 1
          ? "var(--green)"
          : "var(--text-secondary)",
    },
    {
      label: "Max Drawdown",
      value:
        result.max_drawdown_pct !== null
          ? `${result.max_drawdown_pct.toFixed(2)}%`
          : "—",
      color: "var(--red)",
    },
    {
      label: "Win Rate",
      value:
        result.win_rate_pct !== null
          ? `${result.win_rate_pct.toFixed(1)}%`
          : "—",
      color: (result.win_rate_pct ?? 0) >= 50 ? "var(--green)" : "var(--red)",
    },
    {
      label: "Total Trades",
      value:
        result.total_trades !== null ? result.total_trades.toString() : "—",
      color: "var(--text-primary)",
    },
    {
      label: "Avg Duration",
      value:
        result.avg_trade_duration_hours !== null
          ? `${result.avg_trade_duration_hours.toFixed(1)}h`
          : "—",
      color: "var(--text-secondary)",
    },
    {
      label: "Initial Capital",
      value: `$${initialCapital.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      color: "var(--text-secondary)",
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
        gap: "12px",
      }}
    >
      {metrics.map(({ label, value, color }) => (
        <div
          key={label}
          style={{
            background: "var(--bg-primary)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: "var(--text-secondary)",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: "20px", fontWeight: 600, color }}>
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}
