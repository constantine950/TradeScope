import { useState, useEffect } from "react";
import { IndicatorData } from "../types/indicator";
import { fetchIndicator } from "../lib/api";

export function useIndicator(
  symbol: string,
  interval: string,
  type: string,
  period: number,
  enabled: boolean = true,
) {
  const [data, setData] = useState<IndicatorData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      return;
    }
    setLoading(true);
    fetchIndicator(symbol, interval, type, period)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [symbol, interval, type, period, enabled]);

  return { data, loading };
}
