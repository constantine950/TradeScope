"use client";
import { BacktestResult, BacktestTrade } from "../../types/backtest";
import MetricsCards from "./MetricsCards";

interface Props {
  result: BacktestResult;
  trades: BacktestTrade[];
  initialCapital: number;
}

export default function BacktestResults({
  result,
  trades,
  initialCapital,
}: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <MetricsCards result={result} initialCapital={initialCapital} />

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
          <span style={{ fontWeight: 600, fontSize: "14px" }}>Trade Log</span>
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "12px",
              marginLeft: "8px",
            }}
          >
            {trades.length} trades
          </span>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "12px",
            }}
          >
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {[
                  "#",
                  "Entry Time",
                  "Exit Time",
                  "Entry $",
                  "Exit $",
                  "Size",
                  "Fee",
                  "P&L",
                  "Score",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px 12px",
                      textAlign: "left",
                      color: "var(--text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map((t, i) => (
                <tr
                  key={t.id}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background:
                      i % 2 === 0 ? "transparent" : "var(--bg-primary)",
                  }}
                >
                  <td
                    style={{
                      padding: "8px 12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {i + 1}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    {new Date(t.entry_time).toLocaleDateString()}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    {t.exit_time
                      ? new Date(t.exit_time).toLocaleDateString()
                      : "—"}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    ${t.entry_price.toLocaleString()}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    {t.exit_price ? `$${t.exit_price.toLocaleString()}` : "—"}
                  </td>
                  <td style={{ padding: "8px 12px" }}>
                    {t.position_size.toFixed(4)}
                  </td>
                  <td style={{ padding: "8px 12px" }}>${t.fee.toFixed(2)}</td>
                  <td
                    style={{
                      padding: "8px 12px",
                      fontWeight: 600,
                      color: (t.pnl ?? 0) >= 0 ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {t.pnl !== null
                      ? `${t.pnl >= 0 ? "+" : ""}$${t.pnl.toFixed(2)}`
                      : "—"}
                  </td>
                  <td
                    style={{
                      padding: "8px 12px",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {t.signal_score !== null ? t.signal_score.toFixed(1) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
