"use client";
import { PortfolioSummary } from "../../types/paper";

interface Props {
  summary: PortfolioSummary;
}

export default function PortfolioSummaryCard({ summary }: Props) {
  const { portfolio, total_value, total_pnl } = summary;
  const isPositive = total_pnl >= 0;

  const cards = [
    {
      label: "Cash Balance",
      value: `$${portfolio.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      color: "var(--text-primary)",
    },
    {
      label: "Total Value",
      value: `$${total_value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      color: "var(--text-primary)",
    },
    {
      label: "Total P&L",
      value: `${isPositive ? "+" : ""}$${total_pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      color: isPositive ? "var(--green)" : "var(--red)",
    },
    {
      label: "Return",
      value: `${isPositive ? "+" : ""}${(((total_value - portfolio.initial_balance) / portfolio.initial_balance) * 100).toFixed(2)}%`,
      color: isPositive ? "var(--green)" : "var(--red)",
    },
    {
      label: "Initial Capital",
      value: `$${portfolio.initial_balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
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
      {cards.map(({ label, value, color }) => (
        <div
          key={label}
          style={{
            background: "var(--bg-secondary)",
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
