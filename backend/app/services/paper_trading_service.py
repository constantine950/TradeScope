from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.paper_trade import PaperPortfolio, PaperPosition, PaperTrade
from app.models.ohlcv import OHLCV
from app.schemas.paper_trade import PaperTradeCreate
from app.core.config import settings
from datetime import datetime, timezone


async def get_or_create_portfolio(db: AsyncSession, name: str = "default") -> PaperPortfolio:
    """Get existing portfolio or create one with $10,000 starting balance."""
    result = await db.execute(
        select(PaperPortfolio).where(PaperPortfolio.name == name)
    )
    portfolio = result.scalar_one_or_none()

    if not portfolio:
        portfolio = PaperPortfolio(
            name=name,
            balance=settings.paper_trading_initial_balance,
            initial_balance=settings.paper_trading_initial_balance,
        )
        db.add(portfolio)
        await db.flush()
        await db.refresh(portfolio)

    return portfolio


async def get_current_price(db: AsyncSession, symbol: str) -> float | None:
    """Get the latest close price for a symbol."""
    result = await db.execute(
        select(OHLCV.close)
        .where(OHLCV.symbol == symbol)
        .order_by(OHLCV.timestamp.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def execute_paper_trade(
    db: AsyncSession,
    data: PaperTradeCreate,
    portfolio_name: str = "default",
) -> dict:
    symbol = data.symbol.upper()
    portfolio = await get_or_create_portfolio(db, portfolio_name)
    current_price = await get_current_price(db, symbol)

    if not current_price:
        return {"error": f"No price data for {symbol}"}

    fee_rate = settings.default_fee_rate

    if data.action == "BUY":
        # Calculate how much we can buy
        available = portfolio.balance
        if data.quantity:
            cost = data.quantity * current_price
            if cost > available:
                return {"error": "Insufficient balance"}
            size = data.quantity
        else:
            # Use 95% of available balance
            cost = available * 0.95
            size = cost / current_price

        fee = cost * fee_rate
        total_cost = size * current_price + fee

        if total_cost > portfolio.balance:
            return {"error": "Insufficient balance"}

        # Deduct from balance
        portfolio.balance -= total_cost
        portfolio.updated_at = datetime.now(timezone.utc)

        # Create or update position
        pos_result = await db.execute(
            select(PaperPosition).where(
                and_(
                    PaperPosition.portfolio_id == portfolio.id,
                    PaperPosition.symbol == symbol,
                )
            )
        )
        existing_position = pos_result.scalar_one_or_none()

        if existing_position:
            # Average down
            total_size = existing_position.size + size
            avg_price = (
                (existing_position.size * existing_position.entry_price) +
                (size * current_price)
            ) / total_size
            existing_position.size = total_size
            existing_position.entry_price = avg_price
        else:
            db.add(PaperPosition(
                portfolio_id=portfolio.id,
                symbol=symbol,
                size=size,
                entry_price=current_price,
            ))

        trade = PaperTrade(
            portfolio_id=portfolio.id,
            symbol=symbol,
            action="BUY",
            price=current_price,
            size=size,
            fee=fee,
            pnl=None,
        )
        db.add(trade)
        await db.flush()
        return {"action": "BUY", "symbol": symbol, "price": current_price, "size": size, "fee": fee}

    elif data.action == "SELL":
        pos_result = await db.execute(
            select(PaperPosition).where(
                and_(
                    PaperPosition.portfolio_id == portfolio.id,
                    PaperPosition.symbol == symbol,
                )
            )
        )
        position = pos_result.scalar_one_or_none()

        if not position:
            return {"error": f"No open position for {symbol}"}

        size = data.quantity if data.quantity else position.size
        if size > position.size:
            return {"error": "Cannot sell more than position size"}

        proceeds = size * current_price
        fee = proceeds * fee_rate
        net_proceeds = proceeds - fee
        pnl = net_proceeds - (size * position.entry_price)

        portfolio.balance += net_proceeds
        portfolio.updated_at = datetime.now(timezone.utc)

        if size >= position.size:
            await db.delete(position)
        else:
            position.size -= size

        trade = PaperTrade(
            portfolio_id=portfolio.id,
            symbol=symbol,
            action="SELL",
            price=current_price,
            size=size,
            fee=fee,
            pnl=round(pnl, 4),
        )
        db.add(trade)
        await db.flush()
        return {"action": "SELL", "symbol": symbol, "price": current_price, "size": size, "fee": fee, "pnl": round(pnl, 4)}


async def get_portfolio_summary(db: AsyncSession, portfolio_name: str = "default") -> dict:
    portfolio = await get_or_create_portfolio(db, portfolio_name)

    # Get positions
    pos_result = await db.execute(
        select(PaperPosition).where(PaperPosition.portfolio_id == portfolio.id)
    )
    positions = list(pos_result.scalars().all())

    # Enrich positions with current prices
    enriched_positions = []
    positions_value = 0.0
    for pos in positions:
        current_price = await get_current_price(db, pos.symbol)
        unrealized_pnl = None
        if current_price:
            unrealized_pnl = round(
                (current_price - pos.entry_price) * pos.size, 4)
            positions_value += pos.size * current_price
        enriched_positions.append({
            "id": pos.id,
            "symbol": pos.symbol,
            "size": pos.size,
            "entry_price": pos.entry_price,
            "entry_time": pos.entry_time,
            "current_price": current_price,
            "unrealized_pnl": unrealized_pnl,
        })

    # Get recent trades
    trades_result = await db.execute(
        select(PaperTrade)
        .where(PaperTrade.portfolio_id == portfolio.id)
        .order_by(PaperTrade.executed_at.desc())
        .limit(50)
    )
    trades = list(trades_result.scalars().all())

    total_value = portfolio.balance + positions_value
    total_pnl = total_value - portfolio.initial_balance

    return {
        "portfolio": portfolio,
        "positions": enriched_positions,
        "trades": trades,
        "total_value": round(total_value, 2),
        "day_pnl": 0.0,  # simplified — full day P&L needs historical snapshots
        "total_pnl": round(total_pnl, 2),
    }
