import { API_URL } from "./constants";
import { Candle } from "../types/candle";
import { Strategy, StrategyCreate } from "../types/strategy";

export async function fetchCandles(
  symbol: string,
  interval: string,
  limit = 200,
): Promise<Candle[]> {
  const res = await fetch(
    `${API_URL}/candles?symbol=${symbol}&interval=${interval}&limit=${limit}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch candles");
  return res.json();
}

export async function fetchIndicator(
  symbol: string,
  interval: string,
  type: string,
  period: number,
) {
  const res = await fetch(
    `${API_URL}/indicators?symbol=${symbol}&interval=${interval}&type=${type}&period=${period}`,
    { cache: "no-store" },
  );
  if (!res.ok) throw new Error("Failed to fetch indicator");
  return res.json();
}

export async function fetchSymbols(): Promise<string[]> {
  const res = await fetch(`${API_URL}/symbols`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch symbols");
  return res.json();
}

export async function fetchStrategies(): Promise<Strategy[]> {
  const res = await fetch(`${API_URL}/strategies`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch strategies");
  return res.json();
}

export async function createStrategy(data: StrategyCreate): Promise<Strategy> {
  const res = await fetch(`${API_URL}/strategies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create strategy");
  return res.json();
}

export async function deleteStrategy(id: number): Promise<void> {
  const res = await fetch(`${API_URL}/strategies/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete strategy");
}

export async function createBacktest(data: {
  strategy_id: number;
  symbol: string;
  interval: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
}) {
  const res = await fetch(`${API_URL}/backtests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create backtest");
  }
  return res.json();
}

export async function fetchBacktestStatus(id: number) {
  const res = await fetch(`${API_URL}/backtests/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch backtest");
  return res.json();
}

export async function fetchBacktestResults(id: number) {
  const res = await fetch(`${API_URL}/backtests/${id}/results`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export async function fetchBacktestTrades(id: number) {
  const res = await fetch(`${API_URL}/backtests/${id}/trades`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch trades");
  return res.json();
}

export async function fetchEquityCurve(id: number) {
  const res = await fetch(`${API_URL}/backtests/${id}/equity-curve`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch equity curve");
  return res.json();
  ``;
}

export async function fetchPortfolio(name = "default") {
  const res = await fetch(`${API_URL}/paper/portfolio?name=${name}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch portfolio");
  return res.json();
}

export async function executePaperTrade(
  data: {
    symbol: string;
    action: "BUY" | "SELL";
    quantity?: number;
  },
  portfolio = "default",
) {
  const res = await fetch(`${API_URL}/paper/trade?portfolio=${portfolio}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Trade failed");
  }
  return res.json();
}

export async function fetchAllBacktests() {
  const res = await fetch(`${API_URL}/backtests/all`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch backtests");
  return res.json();
}
