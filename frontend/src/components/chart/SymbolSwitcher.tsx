"use client";

import { SYMBOLS } from "../../lib/constants";

interface Props {
  value: string;
  onChange: (symbol: string) => void;
}

export default function SymbolSwitcher({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {SYMBOLS.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          style={{
            padding: "4px 10px",
            borderRadius: "4px",
            border: "1px solid var(--border)",
            background: value === s ? "var(--accent)" : "var(--bg-tertiary)",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: value === s ? 600 : 400,
          }}
        >
          {s.replace("USDT", "")}
        </button>
      ))}
    </div>
  );
}
