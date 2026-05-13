from fastapi import APIRouter, Query, HTTPException
from app.api.deps import DbSession
from app.services.indicator_service import (
    compute_sma,
    compute_ema,
    compute_rsi,
    compute_bbands,
)

router = APIRouter(prefix="/indicators", tags=["indicators"])

SUPPORTED_TYPES = ["sma", "ema", "rsi", "bbands"]


@router.get("")
async def indicators(
    db: DbSession,
    symbol: str = Query(..., description="e.g. BTCUSDT"),
    interval: str = Query(..., description="e.g. 1h"),
    type: str = Query(..., description="sma | ema | rsi | bbands"),
    period: int = Query(20, ge=2, le=200),
):
    """
    Compute and return indicator values for a symbol/interval.
    Results are cached in Redis for 60 seconds.
    """
    symbol = symbol.upper()
    type = type.lower()

    if type not in SUPPORTED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported indicator type. Choose from: {SUPPORTED_TYPES}"
        )

    if type == "sma":
        data = await compute_sma(db, symbol, interval, period)
    elif type == "ema":
        data = await compute_ema(db, symbol, interval, period)
    elif type == "rsi":
        data = await compute_rsi(db, symbol, interval, period)
    elif type == "bbands":
        data = await compute_bbands(db, symbol, interval, period)

    if not data:
        raise HTTPException(
            status_code=404, detail="No data found for this symbol/interval")

    return {
        "symbol": symbol,
        "interval": interval,
        "type": type,
        "period": period,
        "data": data,
    }
