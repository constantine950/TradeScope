from datetime import datetime
from sqlalchemy import BigInteger, Boolean, Float, Index, String, UniqueConstraint, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.db.base import Base


class OHLCV(Base):
    """
    Candlestick data stored in a TimescaleDB hypertable.
    One row = one candle for a symbol/interval combination.
    """
    __tablename__ = "ohlcv"

    id: Mapped[int] = mapped_column(
        BigInteger, primary_key=True, autoincrement=True)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    interval: Mapped[str] = mapped_column(String(5), nullable=False)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False)
    open: Mapped[float] = mapped_column(Float, nullable=False)
    high: Mapped[float] = mapped_column(Float, nullable=False)
    low: Mapped[float] = mapped_column(Float, nullable=False)
    close: Mapped[float] = mapped_column(Float, nullable=False)
    volume: Mapped[float] = mapped_column(Float, nullable=False)
    is_closed: Mapped[bool] = mapped_column(Boolean, default=True)

    __table_args__ = (
        UniqueConstraint("symbol", "interval", "timestamp",
                         name="uq_ohlcv_symbol_interval_ts"),
        Index("ix_ohlcv_symbol_interval_ts",
              "symbol", "interval", "timestamp"),
    )
