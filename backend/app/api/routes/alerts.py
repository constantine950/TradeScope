from fastapi import APIRouter, HTTPException
from app.api.deps import DbSession
from app.schemas.alert import AlertCreate, AlertOut
from app.services.alert_service import create_alert, list_alerts, delete_alert

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.post("", response_model=AlertOut, status_code=201)
async def create(db: DbSession, data: AlertCreate):
    return await create_alert(db, data)


@router.get("", response_model=list[AlertOut])
async def list_all(db: DbSession):
    return await list_alerts(db)


@router.delete("/{alert_id}", status_code=204)
async def delete(db: DbSession, alert_id: int):
    deleted = await delete_alert(db, alert_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Alert not found")
