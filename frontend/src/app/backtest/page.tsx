"use client";
import { useBacktest } from "../../hooks/useBacktest";
import { useStrategies } from "../../hooks/useStrategies";
import BacktestRunner from "../../components/backtest/BacktestRunner";
import BacktestResults from "../../components/backtest/BacktestResults";

export default function BacktestPage() {
  const { strategies, loading: strategiesLoading } = useStrategies();
  const {
    run,
    result,
    trades,
    equityCurve,
    loading,
    polling,
    error,
    startBacktest,
  } = useBacktest();

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
          backtesting
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
            borderBottom: "2px solid var(--accent)",
            color: "var(--text-primary)",
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

      <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {strategiesLoading ? (
            <div style={{ color: "var(--text-secondary)" }}>
              Loading strategies...
            </div>
          ) : strategies.length === 0 ? (
            <div
              style={{
                padding: "32px",
                textAlign: "center",
                color: "var(--text-secondary)",
                border: "1px dashed var(--border)",
                borderRadius: "8px",
              }}
            >
              No strategies yet.{" "}
              <a href="/strategy" style={{ color: "var(--accent)" }}>
                Build one first.
              </a>
            </div>
          ) : (
            <BacktestRunner
              strategies={strategies}
              onRun={startBacktest}
              loading={loading}
              polling={polling}
            />
          )}

          {error && (
            <div style={{ color: "var(--red)", fontSize: "13px" }}>
              Error: {error}
            </div>
          )}

          {run && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "6px",
                border: "1px solid var(--border)",
                background: "var(--bg-secondary)",
                fontSize: "12px",
                color: "var(--text-secondary)",
                display: "flex",
                gap: "16px",
              }}
            >
              <span>Run #{run.id}</span>
              <span>
                {run.symbol} {run.interval}
              </span>
              <span
                style={{
                  color:
                    run.status === "done"
                      ? "var(--green)"
                      : run.status === "failed"
                        ? "var(--red)"
                        : "var(--accent)",
                  fontWeight: 600,
                }}
              >
                {run.status.toUpperCase()}
              </span>
            </div>
          )}

          {result && (
            <BacktestResults
              result={result}
              trades={trades}
              equityCurve={equityCurve}
              initialCapital={run?.initial_capital ?? 10000}
            />
          )}
        </div>
      </div>
    </div>
  );
}
