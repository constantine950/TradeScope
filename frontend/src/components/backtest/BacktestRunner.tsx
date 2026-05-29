"use client";
import { useState } from "react";
import { Strategy } from "../../types/strategy";
import { SYMBOLS, INTERVALS } from "../../lib/constants";

interface Props {
  strategies: Strategy[];
  onRun: (data: {
    strategy_id: number;
    symbol: string;
    interval: string;
    start_date: string;
    end_date: string;
    initial_capital: number;
  }) => void;
  loading: boolean;
  polling: boolean;
}

const selectStyle = {
  background: "var(--bg-primary)",
  color: "var(--text-primary)",
  border: "1px solid var(--border)",
  borderRadius: "6px",
  padding: "8px 12px",
  fontSize: "13px",
  width: "100%",
};

const inputStyle = { ...selectStyle };

export default function BacktestRunner({
  strategies,
  onRun,
  loading,
  polling,
}: Props) {
  const [strategyId, setStrategyId] = useState<number>(strategies[0]?.id ?? 0);
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [interval, setInterval] = useState("1h");
  const [startDate, setStartDate] = useState("2026-02-11");
  const [endDate, setEndDate] = useState("2026-03-04");
  const [capital, setCapital] = useState(10000);

  const handleRun = () => {
    if (!strategyId) return;
    onRun({
      strategy_id: strategyId,
      symbol,
      interval,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      initial_capital: capital,
    });
  };

  const isRunning = loading || polling;

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "8px",
        border: "1px solid var(--border)",
        padding: "20px",
      }}
    >
      <h2 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "16px" }}>
        Run Backtest
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "12px",
        }}
      >
        <div>
          <label
            style={{
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "12px",
              marginBottom: "6px",
            }}
          >
            Strategy
          </label>
          <select
            value={strategyId}
            onChange={(e) => setStrategyId(Number(e.target.value))}
            style={selectStyle}
          >
            {strategies.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "12px",
              marginBottom: "6px",
            }}
          >
            Symbol
          </label>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            style={selectStyle}
          >
            {SYMBOLS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "12px",
              marginBottom: "6px",
            }}
          >
            Interval
          </label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            style={selectStyle}
          >
            {INTERVALS.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "12px",
              marginBottom: "6px",
            }}
          >
            Initial Capital ($)
          </label>
          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(Number(e.target.value))}
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "12px",
              marginBottom: "6px",
            }}
          >
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              color: "var(--text-secondary)",
              fontSize: "12px",
              marginBottom: "6px",
            }}
          >
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Progress bar */}
      {isRunning && (
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginBottom: "6px",
            }}
          >
            {loading ? "Starting backtest..." : "Running backtest..."}
          </div>
          <div
            style={{
              height: "4px",
              background: "var(--border)",
              borderRadius: "2px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                background: "var(--accent)",
                borderRadius: "2px",
                animation: "progress 1.5s ease-in-out infinite",
                width: "40%",
              }}
            />
          </div>
          <style>{`
            @keyframes progress {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(350%); }
            }
          `}</style>
        </div>
      )}

      <button
        onClick={handleRun}
        disabled={isRunning || !strategyId}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "6px",
          border: "none",
          background: isRunning ? "var(--border)" : "var(--accent)",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 600,
          cursor: isRunning ? "not-allowed" : "pointer",
        }}
      >
        {isRunning ? "Running..." : "Run Backtest"}
      </button>
    </div>
  );
}
