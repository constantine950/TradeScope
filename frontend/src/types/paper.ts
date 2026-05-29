export interface PaperPortfolio {
  id: number;
  name: string;
  balance: number;
  initial_balance: number;
  created_at: string;
  updated_at: string;
}

export interface PaperPosition {
  id: number;
  symbol: string;
  size: number;
  entry_price: number;
  entry_time: string;
  current_price: number | null;
  unrealized_pnl: number | null;
}

export interface PaperTrade {
  id: number;
  portfolio_id: number;
  symbol: string;
  action: string;
  price: number;
  size: number;
  fee: number;
  pnl: number | null;
  executed_at: string;
}

export interface PortfolioSummary {
  portfolio: PaperPortfolio;
  positions: PaperPosition[];
  trades: PaperTrade[];
  total_value: number;
  day_pnl: number;
  total_pnl: number;
}
