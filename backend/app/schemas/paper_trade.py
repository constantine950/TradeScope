from datetime import datetime
from pydantic import BaseModel
from typing import Literal


class PaperTradeCreate(BaseModel):
    symbol: str
    action: Literal["BUY", "SELL"]
    quantity: float | None = None  # if None, use all available balance


class PaperPortfolioOut(BaseModel):
    id: int
    name: str
    balance: float
    initial_balance: float
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaperPositionOut(BaseModel):
    id: int
    symbol: str
    size: float
    entry_price: float
    entry_time: datetime
    current_price: float | None = None
    unrealized_pnl: float | None = None

    model_config = {"from_attributes": True}


class PaperTradeOut(BaseModel):
    id: int
    symbol: str
    action: str
    price: float
    size: float
    fee: float
    pnl: float | None
    executed_at: datetime

    model_config = {"from_attributes": True}


class PortfolioSummaryOut(BaseModel):
    portfolio: PaperPortfolioOut
    positions: list[PaperPositionOut]
    trades: list[PaperTradeOut]
    total_value: float
    day_pnl: float
    total_pnl: float
