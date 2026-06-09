"use client";
import { useState, useEffect } from "react";
import { useBacktest } from "../../hooks/useBacktest";
import { useStrategies } from "../../hooks/useStrategies";
import BacktestRunner from "../../components/backtest/BacktestRunner";
import BacktestResults from "../../components/backtest/BacktestResults";
import {
  fetchAllBacktests,
  fetchBacktestResults,
  fetchEquityCurve,
} from "../../lib/api";
import { BacktestResult, BacktestRun, EquityPoint } from "../../types/backtest";
import BacktestComparison from "../../components/backtest/BacktestComparison";

interface ComparisonRun {
  run: BacktestRun;
  result: BacktestResult;
  equityCurve: EquityPoint[];
}

function exportCSV(
  trades: ReturnType<typeof Array.prototype.map>,
  runId: number,
) {
  const headers = [
    "#",
    "Entry Time",
    "Exit Time",
    "Entry Price",
    "Exit Price",
    "Size",
    "Fee",
    "PnL",
    "Signal Score",
  ];
  const rows = trades.map((t: any, i: number) => [
    i + 1,
    t.entry_time,
    t.exit_time ?? "",
    t.entry_price,
    t.exit_price ?? "",
    t.position_size,
    t.fee,
    t.pnl ?? "",
    t.signal_score ?? "",
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `backtest_${runId}_trades.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

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

  const [allRuns, setAllRuns] = useState<BacktestRun[]>([]);
  const [comparisonRuns, setComparisonRuns] = useState<ComparisonRun[]>([]);
  const [selectedForComparison, setSelectedForComparison] = useState<
    Set<number>
  >(new Set());
  const [loadingComparison, setLoadingComparison] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    fetchAllBacktests()
      .then((runs) =>
        setAllRuns(runs.filter((r: BacktestRun) => r.status === "done")),
      )
      .catch(console.error);
  }, [run]);

  const toggleComparison = (id: number) => {
    setSelectedForComparison((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 5) next.add(id);
      return next;
    });
  };

  const loadComparison = async () => {
    if (selectedForComparison.size < 2) return;
    setLoadingComparison(true);
    try {
      const runs = await Promise.all(
        Array.from(selectedForComparison).map(async (id) => {
          const run = allRuns.find((r) => r.id === id)!;
          const [result, curve] = await Promise.all([
            fetchBacktestResults(id),
            fetchEquityCurve(id),
          ]);
          return { run, result, equityCurve: curve };
        }),
      );
      setComparisonRuns(runs);
      setShowComparison(true);
    } finally {
      setLoadingComparison(false);
    }
  };

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
            <>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => exportCSV(trades, run?.id ?? 0)}
                  style={{
                    padding: "6px 16px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    border: "1px solid var(--border)",
                    background: "transparent",
                    color: "var(--text-secondary)",
                    cursor: "pointer",
                  }}
                >
                  Export CSV
                </button>
              </div>
              <BacktestResults
                result={result}
                trades={trades}
                equityCurve={equityCurve}
                initialCapital={run?.initial_capital ?? 10000}
              />
            </>
          )}

          {/* Comparison section */}
          {allRuns.length >= 2 && (
            <div
              style={{
                background: "var(--bg-secondary)",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "14px" }}>
                  Compare Runs
                </span>
                <span
                  style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                >
                  Select 2-5 runs
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                {allRuns.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => toggleComparison(r.id)}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      border: `1px solid ${selectedForComparison.has(r.id) ? "var(--accent)" : "var(--border)"}`,
                      background: selectedForComparison.has(r.id)
                        ? "var(--accent)"
                        : "transparent",
                      color: "var(--text-primary)",
                      cursor: "pointer",
                    }}
                  >
                    #{r.id} {r.symbol} {r.interval}
                  </button>
                ))}
              </div>

              <button
                onClick={loadComparison}
                disabled={selectedForComparison.size < 2 || loadingComparison}
                style={{
                  padding: "8px 20px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  border: "none",
                  background:
                    selectedForComparison.size >= 2
                      ? "var(--accent)"
                      : "var(--border)",
                  color: "#fff",
                  cursor:
                    selectedForComparison.size >= 2 ? "pointer" : "not-allowed",
                }}
              >
                {loadingComparison ? "Loading..." : "Compare Selected"}
              </button>
            </div>
          )}

          {showComparison && comparisonRuns.length >= 2 && (
            <BacktestComparison runs={comparisonRuns} />
          )}
        </div>
      </div>
    </div>
  );
}
