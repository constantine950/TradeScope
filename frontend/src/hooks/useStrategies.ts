import { useState, useEffect, useCallback } from "react";
import { fetchStrategies, createStrategy, deleteStrategy } from "../lib/api";
import { Strategy, StrategyCreate } from "../types/strategy";

export function useStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    fetchStrategies()
      .then(setStrategies)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const create = async (data: StrategyCreate) => {
    const strategy = await createStrategy(data);
    setStrategies((prev) => [strategy, ...prev]);
    return strategy;
  };

  const remove = async (id: number) => {
    await deleteStrategy(id);
    setStrategies((prev) => prev.filter((s) => s.id !== id));
  };

  return { strategies, loading, create, remove, reload: load };
}
