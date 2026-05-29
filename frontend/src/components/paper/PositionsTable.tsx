"use client";
import { PaperPosition } from "../../types/paper";

interface Props {
  positions: PaperPosition[];
}

export default function PositionsTable({ positions }: Props) {
  if (!positions.length) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "13px",
          border: "1px dashed var(--border)",
          borderRadius: "8px",
        }}
      >
        No open positions
      </div>
    );
  }

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
          Open Positions
        </span>
      </div>
      <table
        style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}
      >
        <thead>
          <tr style={{ borderBottom: "1px solid var(--border)" }}>
            {[
              "Symbol",
              "Size",
              "Entry Price",
              "Current Price",
              "Unrealized P&L",
            ].map((h) => (
              <th
                key={h}
                style={{
                  padding: "8px 16px",
                  textAlign: "left",
                  color: "var(--text-secondary)",
                  fontWeight: 500,
                  fontSize: "12px",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {positions.map((p) => {
            const pnl = p.unrealized_pnl ?? 0;
            return (
              <tr
                key={p.id}
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                  {p.symbol}
                </td>
                <td style={{ padding: "12px 16px" }}>{p.size.toFixed(6)}</td>
                <td style={{ padding: "12px 16px" }}>
                  ${p.entry_price.toLocaleString()}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {p.current_price
                    ? `$${p.current_price.toLocaleString()}`
                    : "—"}
                </td>
                <td
                  style={{
                    padding: "12px 16px",
                    fontWeight: 600,
                    color: pnl >= 0 ? "var(--green)" : "var(--red)",
                  }}
                >
                  {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
