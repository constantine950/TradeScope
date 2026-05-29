export interface BacktestRun {
  id: number;
  strategy_id: number;
  symbol: string;
  interval: string;
  start_date: string;
  end_date: string;
  initial_capital: number;
  status: "pending" | "running" | "done" | "failed";
  celery_task_id: string | null;
  created_at: string;
}

export interface BacktestResult {
  run_id: number;
  total_return_pct: number | null;
  sharpe_ratio: number | null;
  max_drawdown_pct: number | null;
  win_rate_pct: number | null;
  total_trades: number | null;
  avg_trade_duration_hours: number | null;
  final_capital: number | null;
}

export interface BacktestTrade {
  id: number;
  entry_time: string;
  exit_time: string | null;
  entry_price: number;
  exit_price: number | null;
  position_size: number;
  fee: number;
  pnl: number | null;
  signal_score: number | null;
  action: string;
}

export interface EquityPoint {
  timestamp: string;
  value: number;
}
