"use client";
import StrategyBuilder from "../../components/strategy/StrategyBuilder";
import StrategyList from "../../components/strategy/StrategyList";
import { useStrategies } from "../../hooks/useStrategies";

export default function StrategyPage() {
  const { strategies, loading, create, remove } = useStrategies();

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
          strategy builder
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
            borderBottom: "2px solid var(--accent)",
            color: "var(--text-primary)",
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
            maxWidth: "800px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          <StrategyBuilder
            onSave={async (data) => {
              await create(data);
            }}
          />
          <div>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: 600,
                marginBottom: "12px",
              }}
            >
              Saved Strategies
            </h2>
            {loading ? (
              <div style={{ color: "var(--text-secondary)" }}>Loading...</div>
            ) : (
              <StrategyList strategies={strategies} onDelete={remove} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
