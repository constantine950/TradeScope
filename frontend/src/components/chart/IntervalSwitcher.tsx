"use client";

import { INTERVALS } from "../../lib/constants";

interface Props {
  value: string;
  onChange: (interval: string) => void;
}

export default function IntervalSwitcher({ value, onChange }: Props) {
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {INTERVALS.map((i) => (
        <button
          key={i.value}
          onClick={() => onChange(i.value)}
          style={{
            padding: "4px 10px",
            borderRadius: "4px",
            border: "1px solid var(--border)",
            background:
              value === i.value ? "var(--bg-tertiary)" : "transparent",
            color:
              value === i.value
                ? "var(--text-primary)"
                : "var(--text-secondary)",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          {i.label}
        </button>
      ))}
    </div>
  );
}
