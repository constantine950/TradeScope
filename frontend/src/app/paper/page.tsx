"use client";
import { usePaperTrading } from "../../hooks/usePaperTrading";
import PortfolioSummaryCard from "../../components/paper/PortfolioSummary";
import PositionsTable from "../../components/paper/PositionsTable";
import TradeButton from "../../components/paper/TradeButton";

export default function PaperPage() {
  const { summary, loading, trading, error, lastTrade, trade } =
    usePaperTrading();

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
          paper trading
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
            borderBottom: "2px solid transparent",
            color: "var(--text-secondary)",
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
            borderBottom: "2px solid var(--accent)",
            color: "var(--text-primary)",
            textDecoration: "none",
          }}
        >
          Paper
        </a>
      </div>

      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {loading ? (
            <div style={{ color: "var(--text-secondary)" }}>
              Loading portfolio...
            </div>
          ) : summary ? (
            <>
              <PortfolioSummaryCard summary={summary} />

              <TradeButton
                onTrade={trade}
                trading={trading}
                balance={summary.portfolio.balance}
              />

              {lastTrade && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    background: "#22c55e22",
                    border: "1px solid var(--green)",
                    color: "var(--green)",
                    fontSize: "13px",
                  }}
                >
                  ✓ Executed: {lastTrade}
                </div>
              )}

              {error && (
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "6px",
                    background: "#ef444422",
                    border: "1px solid var(--red)",
                    color: "var(--red)",
                    fontSize: "13px",
                  }}
                >
                  ✗ {error}
                </div>
              )}

              <PositionsTable positions={summary.positions} />

              {/* Recent trades */}
              {summary.trades.length > 0 && (
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
                      Recent Trades
                    </span>
                  </div>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "13px",
                    }}
                  >
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)" }}>
                        {[
                          "Symbol",
                          "Action",
                          "Price",
                          "Size",
                          "Fee",
                          "P&L",
                          "Time",
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
                      {summary.trades.map((t, i) => (
                        <tr
                          key={t.id}
                          style={{
                            borderBottom: "1px solid var(--border)",
                            background:
                              i % 2 === 0 ? "transparent" : "var(--bg-primary)",
                          }}
                        >
                          <td style={{ padding: "10px 16px", fontWeight: 600 }}>
                            {t.symbol}
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            <span
                              style={{
                                padding: "2px 8px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: 600,
                                background:
                                  t.action === "BUY"
                                    ? "#22c55e22"
                                    : "#ef444422",
                                color:
                                  t.action === "BUY"
                                    ? "var(--green)"
                                    : "var(--red)",
                                border: `1px solid ${t.action === "BUY" ? "var(--green)" : "var(--red)"}`,
                              }}
                            >
                              {t.action}
                            </span>
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            ${t.price.toLocaleString()}
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            {t.size.toFixed(6)}
                          </td>
                          <td style={{ padding: "10px 16px" }}>
                            ${t.fee.toFixed(2)}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              fontWeight: 600,
                              color:
                                t.pnl === null
                                  ? "var(--text-secondary)"
                                  : t.pnl >= 0
                                    ? "var(--green)"
                                    : "var(--red)",
                            }}
                          >
                            {t.pnl === null
                              ? "—"
                              : `${t.pnl >= 0 ? "+" : ""}$${t.pnl.toFixed(2)}`}
                          </td>
                          <td
                            style={{
                              padding: "10px 16px",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {new Date(t.executed_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <div style={{ color: "var(--red)" }}>Failed to load portfolio</div>
          )}
        </div>
      </div>
    </div>
  );
}
