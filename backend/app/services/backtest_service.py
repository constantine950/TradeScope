from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.backtest import BacktestRun, BacktestResult, BacktestTrade
from app.schemas.backtest import BacktestCreate
from app.tasks.backtest_task import run_backtest


async def create_backtest_run(db: AsyncSession, data: BacktestCreate) -> BacktestRun:
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
