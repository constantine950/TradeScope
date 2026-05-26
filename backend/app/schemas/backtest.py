from datetime import datetime
from pydantic import BaseModel


class BacktestCreate(BaseModel):
    strategy_id: int
    symbol: str
    interval: str
    start_date: datetime
    end_date: datetime
    initial_capital: float = 10_000.0


class BacktestTradeOut(BaseModel):
    id: int
    entry_time: datetime
    exit_time: datetime | None
    entry_price: float
    exit_price: float | None
    position_size: float
    fee: float
    pnl: float | None
    signal_score: float | None
    action: str

    model_config = {"from_attributes": True}


class BacktestResultOut(BaseModel):
    total_return_pct: float | None
    sharpe_ratio: float | None
    max_drawdown_pct: float | None
    win_rate_pct: float | None
    total_trades: int | None
    avg_trade_duration_hours: float | None
    final_capital: float | None

    model_config = {"from_attributes": True}


class BacktestRunOut(BaseModel):
    id: int
    strategy_id: int
    symbol: str
    interval: str
    start_date: datetime
    end_date: datetime
    initial_capital: float
    status: str
    celery_task_id: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
