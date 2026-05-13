from pydantic import BaseModel
from datetime import datetime


class IndicatorPoint(BaseModel):
    timestamp: datetime
    value: float | None


class IndicatorOut(BaseModel):
    symbol: str
    interval: str
    type: str
    period: int
    data: list[IndicatorPoint]


class BollingerPoint(BaseModel):
    timestamp: datetime
    upper: float | None
    middle: float | None
    lower: float | None


class BollingerOut(BaseModel):
    symbol: str
    interval: str
    type: str = "bbands"
    period: int
    data: list[BollingerPoint]
