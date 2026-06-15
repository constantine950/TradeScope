from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.ohlcv import OHLCV
from app.core.redis import lrange_all, candle_cache_key, cache_get, cache_set
from app.core.config import settings


async def get_candles(
    db: AsyncSession,
    symbol: str,
    interval: str,
    limit: int = 200,
) -> list[dict]:
    symbol = symbol.upper()

    # 1. Try Redis ring buffer for 1m — live data
    if interval == "1m":
        key = candle_cache_key(symbol, interval)
        cached = await lrange_all(key)
        if cached:
            seen = {}
            for candle in cached:
                ts = candle["timestamp"]
                seen[ts] = candle
            deduped = list(seen.values())
            deduped.sort(key=lambda c: c["timestamp"])
            return deduped[-limit:]

    # 2. Try Redis cache for other intervals
    cache_key = f"candles_query:{symbol}:{interval}:{limit}"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    # 3. DB query
    stmt = (
        select(OHLCV)
        .where(
            and_(
                OHLCV.symbol == symbol,
                OHLCV.interval == interval,
                OHLCV.is_closed == True,
            )
        )
        .order_by(OHLCV.timestamp.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    candles = [
        {
            "symbol": r.symbol,
            "interval": r.interval,
            "timestamp": r.timestamp.isoformat(),
            "open": r.open,
            "high": r.high,
            "low": r.low,
            "close": r.close,
            "volume": r.volume,
            "is_closed": r.is_closed,
        }
        for r in reversed(rows)
    ]

    # Cache for 30 seconds
    await cache_set(cache_key, candles, ttl=30)
    return candles


async def get_symbols() -> list[str]:
    return settings.supported_symbols


async def get_intervals() -> list[str]:
    return settings.supported_intervals
