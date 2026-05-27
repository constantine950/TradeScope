from datetime import datetime
from pydantic import BaseModel
from typing import Literal


class AlertCreate(BaseModel):
    name: str
    symbol: str
    interval: str
    indicator: Literal["RSI", "SMA", "EMA"]
    period: int = 14
    operator: Literal["<", ">", "<=", ">=", "=="]
    threshold: float


class AlertOut(BaseModel):
    id: int
    name: str
    symbol: str
    interval: str
    indicator: str
    period: int
    operator: str
    threshold: float
    is_active: bool
    triggered: bool
    triggered_at: datetime | None
    triggered_value: float | None
    created_at: datetime

    model_config = {"from_attributes": True}
