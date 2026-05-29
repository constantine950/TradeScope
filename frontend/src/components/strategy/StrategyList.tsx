"use client";
import { Strategy } from "../../types/strategy";

interface Props {
  strategies: Strategy[];
  onDelete: (id: number) => void;
}

export default function StrategyList({ strategies, onDelete }: Props) {
  if (!strategies.length) {
    return (
      <div
        style={{
          padding: "32px",
          textAlign: "center",
          color: "var(--text-secondary)",
          fontSize: "13px",
          border: "1px dashed var(--border)",
          borderRadius: "8px",
        }}
      >
        No strategies yet. Build one above.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {strategies.map((s) => (
        <div
          key={s.id}
          style={{
            background: "var(--bg-secondary)",
            borderRadius: "8px",
            border: "1px solid var(--border)",
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "6px",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "14px" }}>
                  {s.name}
                </span>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    background: s.action === "BUY" ? "#22c55e22" : "#ef444422",
                    color: s.action === "BUY" ? "var(--green)" : "var(--red)",
                    border: `1px solid ${s.action === "BUY" ? "var(--green)" : "var(--red)"}`,
                  }}
                >
                  {s.action}
                </span>
              </div>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "3px" }}
              >
                {s.conditions.map((c, i) => (
                  <span
                    key={i}
                    style={{ fontSize: "12px", color: "var(--text-secondary)" }}
                  >
                    {i > 0 && (
                      <span
                        style={{ color: "var(--accent)", marginRight: "4px" }}
                      >
                        {s.condition_logic}
                      </span>
                    )}
                    {c.indicator}({c.period}) {c.operator} {c.value}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => onDelete(s.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                fontSize: "16px",
                padding: "0 4px",
              }}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
