import { Candle } from "../types/candle";
import { API_URL } from "./constants";

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
