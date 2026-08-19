import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";
import { Candle } from "../types/candle";
import { fetchCandles } from "../lib/api";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

function deduplicateAndSort(candles: Candle[]): Candle[] {
  const seen = new Map<string, Candle>();
  for (const candle of candles) {
    // Keep the latest version of each timestamp
    seen.set(candle.timestamp, candle);
  }
  return Array.from(seen.values()).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

export function useCandles(symbol: string, interval: string, limit = 200) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    setCandles([]);
    fetchCandles(symbol, interval, limit)
      .then((data) => setCandles(deduplicateAndSort(data)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol, interval, limit]);

  const handleMessage = useCallback(
    (data: unknown) => {
      const candle = data as Candle;
      if (candle.symbol !== symbol || candle.interval !== interval) return;

      setCandles((prev) => {
        if (!prev.length) return prev;

        const last = prev[prev.length - 1];
        const incomingTime = new Date(candle.timestamp).getTime();
        const lastTime = new Date(last.timestamp).getTime();

        if (incomingTime === lastTime) {
          return [...prev.slice(0, -1), candle];
        } else if (incomingTime > lastTime) {
          return deduplicateAndSort([...prev.slice(-limit + 1), candle]);
        }
        return prev;
      });
    },
    [symbol, interval, limit],
  );

  const wsUrl = `${WS_URL}/ws/candles?symbol=${symbol}&interval=${interval}`;
  useWebSocket(wsUrl, { onMessage: handleMessage });

  return { candles, loading, error };
}
