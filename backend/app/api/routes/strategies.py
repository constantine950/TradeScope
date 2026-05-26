from fastapi import APIRouter, HTTPException
from app.api.deps import DbSession
from app.schemas.strategy import StrategyCreate, StrategyUpdate, StrategyOut
from app.services.strategy_service import (
    create_strategy,
    get_strategy,
    list_strategies,
    update_strategy,
    delete_strategy,
)

router = APIRouter(prefix="/strategies", tags=["strategies"])


@router.post("", response_model=StrategyOut, status_code=201)
async def create(db: DbSession, data: StrategyCreate):
    return await create_strategy(db, data)


@router.get("", response_model=list[StrategyOut])
async def list_all(db: DbSession):
    return await list_strategies(db)


@router.get("/{strategy_id}", response_model=StrategyOut)
async def get_one(db: DbSession, strategy_id: int):
    strategy = await get_strategy(db, strategy_id)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return strategy


@router.patch("/{strategy_id}", response_model=StrategyOut)
async def update(db: DbSession, strategy_id: int, data: StrategyUpdate):
    strategy = await update_strategy(db, strategy_id, data)
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return strategy


@router.delete("/{strategy_id}", status_code=204)
async def delete(db: DbSession, strategy_id: int):
    deleted = await delete_strategy(db, strategy_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Strategy not found")
