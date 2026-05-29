export interface Condition {
  indicator: "RSI" | "SMA" | "EMA" | "BBANDS";
  period: number;
  operator: "<" | ">" | "<=" | ">=" | "==" | "crosses_above" | "crosses_below";
  value: number;
}

export interface Strategy {
  id: number;
  name: string;
  description: string | null;
  conditions: Condition[];
  action: "BUY" | "SELL";
  condition_logic: "AND" | "OR";
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface StrategyCreate {
  name: string;
  description?: string;
  conditions: Condition[];
  action: "BUY" | "SELL";
  condition_logic: "AND" | "OR";
}
