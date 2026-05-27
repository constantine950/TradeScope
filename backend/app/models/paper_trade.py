from datetime import datetime
from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base


class PaperPortfolio(Base):
    """
    A virtual portfolio with a starting balance of $10,000.
    Tracks cash balance and open positions.
    """
    __tablename__ = "paper_portfolios"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), default="default")
    balance: Mapped[float] = mapped_column(Float, default=10_000.0)
    initial_balance: Mapped[float] = mapped_column(Float, default=10_000.0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now())

    positions: Mapped[list["PaperPosition"]] = relationship(
        "PaperPosition", back_populates="portfolio")
    trades: Mapped[list["PaperTrade"]] = relationship(
        "PaperTrade", back_populates="portfolio")


class PaperPosition(Base):
    """An open position in a paper portfolio."""
    __tablename__ = "paper_positions"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    portfolio_id: Mapped[int] = mapped_column(
        ForeignKey("paper_portfolios.id"), nullable=False)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    size: Mapped[float] = mapped_column(Float, nullable=False)
    entry_price: Mapped[float] = mapped_column(Float, nullable=False)
    entry_time: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now())

    portfolio: Mapped["PaperPortfolio"] = relationship(
        "PaperPortfolio", back_populates="positions")


class PaperTrade(Base):
    """A completed paper trade — buy or sell."""
    __tablename__ = "paper_trades"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, autoincrement=True)
    portfolio_id: Mapped[int] = mapped_column(
        ForeignKey("paper_portfolios.id"), nullable=False)
    symbol: Mapped[str] = mapped_column(String(20), nullable=False)
    action: Mapped[str] = mapped_column(String(10), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    size: Mapped[float] = mapped_column(Float, nullable=False)
    fee: Mapped[float] = mapped_column(Float, default=0.0)
    pnl: Mapped[float | None] = mapped_column(Float, nullable=True)
    executed_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now())

    portfolio: Mapped["PaperPortfolio"] = relationship(
        "PaperPortfolio", back_populates="trades")
