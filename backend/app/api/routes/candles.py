from fastapi import APIRouter, Query, HTTPException
from app.api.deps import DbSession
from app.services.candle_service import get_candles

router = APIRouter(prefix="/candles", tags=["candles"])


@router.get("")
async def candles(
    db: DbSession,
    symbol: str = Query(..., description="e.g. BTCUSDT"),
    interval: str = Query(..., description="e.g. 1m, 1h, 1d"),
    limit: int = Query(200, ge=1, le=1000),
):
    """
    Returns OHLCV candles for a symbol/interval.
    Serves from Redis cache when available, falls back to DB.
    """
    data = await get_candles(db, symbol, interval, limit)
    if not data:
        raise HTTPException(status_code=404, detail="No candles found")
    return data
