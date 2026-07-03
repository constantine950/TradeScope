import { useState, useCallback } from "react";
import {
  BacktestResult,
  BacktestRun,
  BacktestTrade,
  EquityPoint,
} from "../types/backtest";
import {
  createBacktest,
  fetchBacktestResults,
  fetchBacktestStatus,
  fetchBacktestTrades,
  fetchEquityCurve,
} from "../lib/api";

export function useBacktest() {
  const [run, setRun] = useState<BacktestRun | null>(null);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [trades, setTrades] = useState<BacktestTrade[]>([]);
  const [equityCurve, setEquityCurve] = useState<EquityPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollUntilDone = useCallback(async (runId: number) => {
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const status = await fetchBacktestStatus(runId);
        setRun(status);

        if (status.status === "done") {
          clearInterval(interval);
          setPolling(false);
          const [results, tradesData, curve] = await Promise.all([
            fetchBacktestResults(runId),
            fetchBacktestTrades(runId),
            fetchEquityCurve(runId),
          ]);
          setResult(results);
          setTrades(tradesData);
          setEquityCurve(curve);
        } else if (status.status === "failed") {
          clearInterval(interval);
          setPolling(false);
          setError("Backtest failed");
        }
      } catch (e) {
        clearInterval(interval);
        setPolling(false);
        setError("Failed to poll backtest status");
      }
    }, 2000);
  }, []);

  const startBacktest = useCallback(
    async (data: {
      strategy_id: number;
      symbol: string;
      interval: string;
      start_date: string;
      end_date: string;
      initial_capital: number;
    }) => {
      setLoading(true);
      setError(null);
      setResult(null);
      setTrades([]);
      setEquityCurve([]);

      try {
        const newRun = await createBacktest(data);
        setRun(newRun);
        setLoading(false);
        await pollUntilDone(newRun.id);
      } catch (e: unknown) {
        // Extract FastAPI validation error detail
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Failed to start backtest");
        }
        setLoading(false);
      }
    },
    [pollUntilDone],
  );

  return {
    run,
    result,
    trades,
    equityCurve,
    loading,
    polling,
    error,
    startBacktest,
  };
}
