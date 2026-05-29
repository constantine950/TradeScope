"use client";
import { useState } from "react";
import { StrategyCreate, Condition } from "../../types/strategy";
import ConditionList from "./ConditionList";

interface Props {
  onSave: (strategy: StrategyCreate) => Promise<void>;
}

export default function StrategyBuilder({ onSave }: Props) {
  const [name, setName] = useState("");
  const [action, setAction] = useState<"BUY" | "SELL">("BUY");
  const [logic, setLogic] = useState<"AND" | "OR">("AND");
  const [conditions, setConditions] = useState<Condition[]>([
    { indicator: "RSI", period: 14, operator: "<", value: 30 },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Strategy name is required");
      return;
    }
    if (conditions.length === 0) {
      setError("Add at least one condition");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave({ name, conditions, action, condition_logic: logic });
      setName("");
      setConditions([
        { indicator: "RSI", period: 14, operator: "<", value: 30 },
      ]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

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
        Build Strategy
      </h2>

      {/* Name */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            color: "var(--text-secondary)",
            fontSize: "12px",
            marginBottom: "6px",
          }}
        >
          Strategy Name
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. RSI Oversold Bounce"
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            background: "var(--bg-primary)",
            color: "var(--text-primary)",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Action */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            color: "var(--text-secondary)",
            fontSize: "12px",
            marginBottom: "6px",
          }}
        >
          Action
        </label>
        <div style={{ display: "flex", gap: "8px" }}>
          {(["BUY", "SELL"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAction(a)}
              style={{
                padding: "6px 20px",
                borderRadius: "6px",
                fontSize: "13px",
                fontWeight: 600,
                border: `1px solid ${action === a ? (a === "BUY" ? "var(--green)" : "var(--red)") : "var(--border)"}`,
                background:
                  action === a
                    ? a === "BUY"
                      ? "#22c55e22"
                      : "#ef444422"
                    : "transparent",
                color:
                  action === a
                    ? a === "BUY"
                      ? "var(--green)"
                      : "var(--red)"
                    : "var(--text-secondary)",
                cursor: "pointer",
              }}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* Conditions */}
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            color: "var(--text-secondary)",
            fontSize: "12px",
            marginBottom: "6px",
          }}
        >
          Conditions
        </label>
        <ConditionList
          conditions={conditions}
          logic={logic}
          onConditionsChange={setConditions}
          onLogicChange={setLogic}
        />
      </div>

      {error && (
        <div
          style={{
            color: "var(--red)",
            fontSize: "12px",
            marginBottom: "12px",
          }}
        >
          {error}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "6px",
          border: "none",
          background: "var(--accent)",
          color: "#fff",
          fontSize: "14px",
          fontWeight: 600,
          cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.7 : 1,
        }}
      >
        {saving ? "Saving..." : "Save Strategy"}
      </button>
    </div>
  );
}
