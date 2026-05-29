import { useState, useEffect, useCallback } from "react";
import { PortfolioSummary } from "../types/paper";
import { executePaperTrade, fetchPortfolio } from "../lib/api";

export function usePaperTrading() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [trading, setTrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastTrade, setLastTrade] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchPortfolio()
      .then(setSummary)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    // Refresh every 30 seconds for live P&L updates
    const interval = setInterval(load, 30_000);
    return () => clearInterval(interval);
  }, [load]);

  const trade = async (
    symbol: string,
    action: "BUY" | "SELL",
    quantity?: number,
  ) => {
    setTrading(true);
    setError(null);
    setLastTrade(null);
    try {
      const result = await executePaperTrade({ symbol, action, quantity });
      setLastTrade(
        `${action} ${result.size.toFixed(4)} ${symbol} @ $${result.price.toLocaleString()}`,
      );
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Trade failed");
    } finally {
      setTrading(false);
    }
  };

  return { summary, loading, trading, error, lastTrade, trade, reload: load };
}
