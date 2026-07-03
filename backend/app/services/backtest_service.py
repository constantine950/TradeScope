from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException
from app.models.backtest import BacktestRun, BacktestResult, BacktestTrade
from app.models.strategy import Strategy
from app.models.ohlcv import OHLCV
from app.schemas.backtest import BacktestCreate
from app.tasks.backtest_task import run_backtest
from app.core.config import settings


VALID_INDICATORS = ["RSI", "SMA", "EMA", "BBANDS"]
VALID_OPERATORS = ["<", ">", "<=", ">=",
                   "==", "crosses_above", "crosses_below"]


async def validate_backtest(db: AsyncSession, data: BacktestCreate) -> None:
    """Validate backtest request before dispatching to Celery."""

    # 1. Strategy exists
    strategy = await db.get(Strategy, data.strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")

    # 2. Strategy has conditions
    if not strategy.conditions:
        raise HTTPException(
            status_code=400, detail="Strategy has no conditions")

    # 3. Validate each condition
    for i, cond in enumerate(strategy.conditions):
        if cond.get("indicator", "").upper() not in VALID_INDICATORS:
            raise HTTPException(
                status_code=400,
                detail=f"Condition {i+1}: invalid indicator '{cond.get('indicator')}'"
            )
        if cond.get("operator") not in VALID_OPERATORS:
            raise HTTPException(
                status_code=400,
                detail=f"Condition {i+1}: invalid operator '{cond.get('operator')}'"
            )
        if cond.get("period", 0) < 2:
            raise HTTPException(
                status_code=400,
                detail=f"Condition {i+1}: period must be >= 2"
            )

    # 4. Symbol is supported
    if data.symbol.upper() not in settings.supported_symbols:
        raise HTTPException(
            status_code=400,
            detail=f"Symbol {data.symbol} not supported. Choose from {settings.supported_symbols}"
        )

    # 5. Interval is supported
    if data.interval not in settings.supported_intervals:
        raise HTTPException(
            status_code=400,
            detail=f"Interval {data.interval} not supported"
        )

    # 6. Date range is valid
    if data.start_date >= data.end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before end_date"
        )

    # 7. Check candles exist for this range
    result = await db.execute(
        select(OHLCV)
        .where(
            OHLCV.symbol == data.symbol.upper(),
            OHLCV.interval == data.interval,
            OHLCV.timestamp >= data.start_date,
            OHLCV.timestamp <= data.end_date,
            OHLCV.is_closed == True,
        )
        .limit(1)
    )
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=400,
            detail=f"No candle data found for {data.symbol} {data.interval} in the given date range"
        )


async def create_backtest_run(db: AsyncSession, data: BacktestCreate) -> BacktestRun:
    await validate_backtest(db, data)

    run = BacktestRun(
        strategy_id=data.strategy_id,
        symbol=data.symbol.upper(),
        interval=data.interval,
        start_date=data.start_date,
        end_date=data.end_date,
        initial_capital=data.initial_capital,
        status="pending",
    )
    db.add(run)
    await db.flush()
    await db.refresh(run)

    task = run_backtest.delay(run.id)
    run.celery_task_id = task.id
    await db.flush()

    return run


async def list_runs(db: AsyncSession) -> list[BacktestRun]:
    result = await db.execute(
        select(BacktestRun).order_by(BacktestRun.created_at.desc())
    )
    return list(result.scalars().all())


async def get_run(db: AsyncSession, run_id: int) -> BacktestRun | None:
    result = await db.execute(
        select(BacktestRun).where(BacktestRun.id == run_id)
    )
    return result.scalar_one_or_none()


async def get_results(db: AsyncSession, run_id: int) -> BacktestResult | None:
    result = await db.execute(
        select(BacktestResult).where(BacktestResult.run_id == run_id)
    )
    return result.scalar_one_or_none()


async def get_trades(db: AsyncSession, run_id: int) -> list[BacktestTrade]:
    result = await db.execute(
        select(BacktestTrade)
        .where(BacktestTrade.run_id == run_id)
        .order_by(BacktestTrade.entry_time.asc())
    )
    return list(result.scalars().all())
