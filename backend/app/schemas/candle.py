from datetime import datetime
from pydantic import BaseModel


class CandleOut(BaseModel):
    symbol: str
    interval: str
    timestamp: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float
    is_closed: bool

    model_config = {"from_attributes": True}
