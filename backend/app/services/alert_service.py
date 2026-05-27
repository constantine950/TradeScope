from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.alert import Alert
from app.schemas.alert import AlertCreate


async def create_alert(db: AsyncSession, data: AlertCreate) -> Alert:
    alert = Alert(
        name=data.name,
        symbol=data.symbol.upper(),
        interval=data.interval,
        indicator=data.indicator,
        period=data.period,
        operator=data.operator,
        threshold=data.threshold,
    )
    db.add(alert)
    await db.flush()
    await db.refresh(alert)
    return alert


async def list_alerts(db: AsyncSession) -> list[Alert]:
    result = await db.execute(
        select(Alert).order_by(Alert.created_at.desc())
    )
    return list(result.scalars().all())


async def delete_alert(db: AsyncSession, alert_id: int) -> bool:
    alert = await db.get(Alert, alert_id)
    if not alert:
        return False
    await db.delete(alert)
    return True
