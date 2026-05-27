import { useState, useEffect, useCallback } from "react";
import { useWebSocket } from "./useWebSocket";
import { Candle } from "../types/candle";
import { fetchCandles } from "../lib/api";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export function useCandles(symbol: string, interval: string, limit = 200) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchCandles(symbol, interval, limit)
      .then(setCandles)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [symbol, interval, limit]);

  // Live updates via WebSocket
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
          // Update existing last candle
          return [...prev.slice(0, -1), candle];
        } else if (incomingTime > lastTime) {
          // New candle — append and trim to limit
          return [...prev.slice(-limit + 1), candle];
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
