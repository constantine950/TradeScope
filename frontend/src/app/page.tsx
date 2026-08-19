import Link from "next/link";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-primary)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          padding: "16px 48px",
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-secondary)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{ fontWeight: 700, fontSize: "20px", color: "var(--accent)" }}
        >
          TradeScope
        </span>
        <Link
          href="/dashboard"
          style={{
            padding: "8px 20px",
            borderRadius: "6px",
            background: "var(--accent)",
            color: "#fff",
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Launch App
        </Link>
      </nav>

      {/* Hero */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            padding: "4px 12px",
            borderRadius: "20px",
            background: "#3b82f622",
            border: "1px solid var(--accent)",
            color: "var(--accent)",
            fontSize: "12px",
            fontWeight: 600,
            marginBottom: "24px",
            letterSpacing: "0.05em",
          }}
        >
          ALGORITHMIC TRADING DASHBOARD
        </div>

        <h1
          style={{
            fontSize: "64px",
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: "24px",
            color: "var(--text-primary)",
            maxWidth: "700px",
          }}
        >
          Build. Backtest.{" "}
          <span style={{ color: "var(--accent)" }}>Trade.</span>
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "var(--text-secondary)",
            maxWidth: "520px",
            lineHeight: 1.7,
            marginBottom: "40px",
          }}
        >
          A full-stack trading terminal with live market data, visual strategy
          builder, backtesting engine, and paper trading — all in one place.
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
          <Link
            href="/dashboard"
            style={{
              padding: "12px 32px",
              borderRadius: "8px",
              background: "var(--accent)",
              color: "#fff",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            Open Dashboard
          </Link>
          <Link
            href="/strategy"
            style={{
              padding: "12px 32px",
              borderRadius: "8px",
              border: "1px solid var(--border)",
              color: "var(--text-primary)",
              textDecoration: "none",
              fontSize: "16px",
              fontWeight: 600,
              background: "var(--bg-secondary)",
            }}
          >
            Build Strategy
          </Link>
        </div>
      </div>

      {/* Features */}
      <div
        style={{
          padding: "64px 48px",
          borderTop: "1px solid var(--border)",
          background: "var(--bg-secondary)",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "24px",
          }}
        >
          {[
            {
              icon: "📈",
              title: "Live Charts",
              desc: "Real-time candlestick charts powered by Kraken WebSocket with SMA, EMA, RSI and Bollinger Bands overlays.",
            },
            {
              icon: "🧠",
              title: "Strategy Builder",
              desc: "Build indicator-based strategies visually — no code required. Combine RSI, SMA, EMA with AND/OR logic.",
            },
            {
              icon: "⚡",
              title: "Backtesting",
              desc: "Run async backtests via Celery. Get Sharpe ratio, max drawdown, win rate, equity curve and full trade log.",
            },
            {
              icon: "💼",
              title: "Paper Trading",
              desc: "Trade with a virtual $10,000 portfolio at live prices. Track positions, fees, and realized P&L.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: "var(--bg-primary)",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                padding: "24px",
              }}
            >
              <div style={{ fontSize: "28px", marginBottom: "12px" }}>
                {icon}
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "15px",
                  marginBottom: "8px",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech stack */}
      <div
        style={{ padding: "32px 48px", borderTop: "1px solid var(--border)" }}
      >
        <div
          style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}
        >
          <div
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              marginBottom: "16px",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Built with
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "12px",
            }}
          >
            {[
              "FastAPI",
              "TimescaleDB",
              "Redis",
              "Celery",
              "Next.js 16",
              "TypeScript",
              "pandas-ta",
              "TradingView Charts",
              "Docker",
            ].map((tech) => (
              <span
                key={tech}
                style={{
                  padding: "4px 12px",
                  borderRadius: "20px",
                  border: "1px solid var(--border)",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  background: "var(--bg-secondary)",
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
