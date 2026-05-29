"use client";
import { Condition } from "../../types/strategy";

interface Props {
  condition: Condition;
  index: number;
  onChange: (index: number, condition: Condition) => void;
  onRemove: (index: number) => void;
}

const INDICATORS = ["RSI", "SMA", "EMA", "BBANDS"];
const OPERATORS = [
  "<",
  ">",
  "<=",
  ">=",
  "==",
  "crosses_above",
  "crosses_below",
];

const selectStyle = {
  background: "var(--bg-primary)",
  color: "var(--text-primary)",
  border: "1px solid var(--border)",
  borderRadius: "4px",
  padding: "6px 8px",
  fontSize: "13px",
  cursor: "pointer",
};

const inputStyle = {
  ...selectStyle,
  width: "80px",
};

export default function ConditionRow({
  condition,
  index,
  onChange,
  onRemove,
}: Props) {
  const update = (field: keyof Condition, value: string | number) => {
    onChange(index, { ...condition, [field]: value });
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 12px",
        background: "var(--bg-primary)",
        borderRadius: "6px",
        border: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          color: "var(--text-secondary)",
          fontSize: "12px",
          minWidth: "20px",
        }}
      >
        #{index + 1}
      </span>

      <select
        value={condition.indicator}
        onChange={(e) => update("indicator", e.target.value)}
        style={selectStyle}
      >
        {INDICATORS.map((i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={condition.period}
        onChange={(e) => update("period", parseInt(e.target.value))}
        style={{ ...inputStyle, width: "60px" }}
        placeholder="Period"
        min={2}
        max={200}
      />

      <select
        value={condition.operator}
        onChange={(e) => update("operator", e.target.value)}
        style={selectStyle}
      >
        {OPERATORS.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>

      <input
        type="number"
        value={condition.value}
        onChange={(e) => update("value", parseFloat(e.target.value))}
        style={inputStyle}
        placeholder="Value"
        step="any"
      />

      <button
        onClick={() => onRemove(index)}
        style={{
          background: "transparent",
          border: "none",
          color: "var(--red)",
          cursor: "pointer",
          fontSize: "16px",
          padding: "0 4px",
          marginLeft: "auto",
        }}
      >
        ×
      </button>
    </div>
  );
}
