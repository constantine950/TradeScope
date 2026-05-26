from datetime import datetime
from typing import Any
from sqlalchemy import DateTime, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Strategy(Base):
    """
    A trading strategy — a named set of conditions and an action.

    conditions is a JSON array of objects:
    [
      { "indicator": "RSI", "period": 14, "operator": "<", "value": 30 },
      { "indicator": "SMA", "period": 20, "operator": ">", "value": "close" }
    ]

    condition_logic: "AND" means all conditions must be true.
                     "OR"  means any condition must be true.

    action: "BUY" or "SELL"
    """
    __tablename__ = "strategies"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    conditions: Mapped[list[dict[str, Any]]] = mapped_column(
        JSONB, nullable=False, default=list)
    action: Mapped[str] = mapped_column(String(10), nullable=False)
    condition_logic: Mapped[str] = mapped_column(String(3), default="AND")
    created_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now())
