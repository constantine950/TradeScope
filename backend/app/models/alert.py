from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class Alert(Base):
    """
    An alert fires when an indicator crosses a threshold.
    Example: RSI(14) < 30 on BTCUSDT 1h

    Celery beat evaluates all active alerts every minute.
    When an alert fires, triggered=True and triggered_at is set.
    """
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    interval: Mapped[str] = mapped_column(String(5), nullable=False)
    indicator: Mapped[str] = mapped_column(String(20), nullable=False)
    period: Mapped[int] = mapped_column(Integer, default=14)
    operator: Mapped[str] = mapped_column(String(20), nullable=False)
    threshold: Mapped[float] = mapped_column(Float, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    triggered: Mapped[bool] = mapped_column(Boolean, default=False)
    triggered_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True)
    triggered_value: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now())
