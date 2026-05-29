"use client";
import { Condition } from "../../types/strategy";
import ConditionRow from "./ConditionRow";

interface Props {
  conditions: Condition[];
  logic: "AND" | "OR";
  onConditionsChange: (conditions: Condition[]) => void;
  onLogicChange: (logic: "AND" | "OR") => void;
}

const DEFAULT_CONDITION: Condition = {
  indicator: "RSI",
  period: 14,
  operator: "<",
  value: 30,
};

export default function ConditionList({
  conditions,
  logic,
  onConditionsChange,
  onLogicChange,
}: Props) {
  const addCondition = () => {
    onConditionsChange([...conditions, { ...DEFAULT_CONDITION }]);
  };

  const updateCondition = (index: number, condition: Condition) => {
    const updated = [...conditions];
    updated[index] = condition;
    onConditionsChange(updated);
  };

  const removeCondition = (index: number) => {
    onConditionsChange(conditions.filter((_, i) => i !== index));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {conditions.length > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "4px",
          }}
        >
          <span style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
            Logic:
          </span>
          {(["AND", "OR"] as const).map((l) => (
            <button
              key={l}
              onClick={() => onLogicChange(l)}
              style={{
                padding: "3px 10px",
                borderRadius: "4px",
                fontSize: "12px",
                border: `1px solid ${logic === l ? "var(--accent)" : "var(--border)"}`,
                background: logic === l ? "var(--accent)" : "transparent",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              {l}
            </button>
          ))}
          <span style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
            {logic === "AND"
              ? "All conditions must be true"
              : "Any condition must be true"}
          </span>
        </div>
      )}

      {conditions.map((condition, index) => (
        <ConditionRow
          key={index}
          condition={condition}
          index={index}
          onChange={updateCondition}
          onRemove={removeCondition}
        />
      ))}

      <button
        onClick={addCondition}
        style={{
          padding: "8px",
          borderRadius: "6px",
          border: "1px dashed var(--border)",
          background: "transparent",
          color: "var(--text-secondary)",
          cursor: "pointer",
          fontSize: "13px",
          marginTop: "4px",
        }}
      >
        + Add condition
      </button>
    </div>
  );
}
