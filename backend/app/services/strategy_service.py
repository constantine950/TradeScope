from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.strategy import Strategy
from app.schemas.strategy import StrategyCreate, StrategyUpdate


async def create_strategy(db: AsyncSession, data: StrategyCreate) -> Strategy:
    strategy = Strategy(
        name=data.name,
        description=data.description,
        conditions=[c.model_dump() for c in data.conditions],
        action=data.action,
        condition_logic=data.condition_logic,
        created_by=data.created_by,
    )
    db.add(strategy)
    await db.flush()
    await db.refresh(strategy)
    return strategy


async def get_strategy(db: AsyncSession, strategy_id: int) -> Strategy | None:
    result = await db.execute(
        select(Strategy).where(Strategy.id == strategy_id)
    )
    return result.scalar_one_or_none()


async def list_strategies(db: AsyncSession) -> list[Strategy]:
    result = await db.execute(
        select(Strategy).order_by(Strategy.created_at.desc())
    )
    return list(result.scalars().all())


async def update_strategy(
    db: AsyncSession, strategy_id: int, data: StrategyUpdate
) -> Strategy | None:
    strategy = await get_strategy(db, strategy_id)
    if not strategy:
        return None

    if data.name is not None:
        strategy.name = data.name
    if data.description is not None:
        strategy.description = data.description
    if data.conditions is not None:
        strategy.conditions = [c.model_dump() for c in data.conditions]
    if data.action is not None:
        strategy.action = data.action
    if data.condition_logic is not None:
        strategy.condition_logic = data.condition_logic

    await db.flush()
    await db.refresh(strategy)
    return strategy


async def delete_strategy(db: AsyncSession, strategy_id: int) -> bool:
    result = await db.execute(
        delete(Strategy).where(Strategy.id == strategy_id)
    )
    return result.rowcount > 0
