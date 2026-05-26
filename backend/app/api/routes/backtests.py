from fastapi import APIRouter, HTTPException
from app.api.deps import DbSession
from app.schemas.backtest import BacktestCreate, BacktestRunOut, BacktestResultOut, BacktestTradeOut
from app.services.backtest_service import (
    create_backtest_run,
    get_run,
    get_results,
    get_trades,
    list_runs,
)

router = APIRouter(prefix="/backtests", tags=["backtests"])


@router.post("", response_model=BacktestRunOut, status_code=201)
async def create(db: DbSession, data: BacktestCreate):
    return await create_backtest_run(db, data)


@router.get("/all", response_model=list[BacktestRunOut])
async def list_all(db: DbSession):
    return await list_runs(db)


@router.get("/{run_id}", response_model=BacktestRunOut)
async def get_one(db: DbSession, run_id: int):
    run = await get_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Backtest run not found")
    return run


@router.get("/{run_id}/results", response_model=BacktestResultOut)
async def results(db: DbSession, run_id: int):
    run = await get_run(db, run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Backtest run not found")
    if run.status != "done":
        raise HTTPException(
            status_code=202, detail=f"Backtest status: {run.status}")
    result = await get_results(db, run_id)
    if not result:
        raise HTTPException(status_code=404, detail="Results not found")
    return result


@router.get("/{run_id}/trades", response_model=list[BacktestTradeOut])
async def trades(db: DbSession, run_id: int):
    return await get_trades(db, run_id)


@router.get("/{run_id}/equity-curve")
async def equity_curve(db: DbSession, run_id: int):
    result = await get_results(db, run_id)
    if not result:
        raise HTTPException(status_code=404, detail="Results not ready yet")
    return result.equity_curve
