import pandas as pd
import pandas_ta as ta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.ohlcv import OHLCV
from app.core.redis import cache_get, cache_set, indicator_cache_key
from app.core.config import settings


async def fetch_candle_df(
    db: AsyncSession,
    symbol: str,
    interval: str,
    limit: int = 500,
) -> pd.DataFrame:
    """Fetch closed candles from DB and return as a DataFrame."""
    stmt = (
        select(OHLCV)
        .where(
            and_(
                OHLCV.symbol == symbol,
                OHLCV.interval == interval,
                OHLCV.is_closed == True,
            )
        )
        .order_by(OHLCV.timestamp.asc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.scalars().all()

    if not rows:
        return pd.DataFrame()

    df = pd.DataFrame([
        {
            "timestamp": r.timestamp,
            "open": r.open,
            "high": r.high,
            "low": r.low,
            "close": r.close,
            "volume": r.volume,
        }
        for r in rows
    ])
    df.set_index("timestamp", inplace=True)
    return df


async def compute_sma(
    db: AsyncSession,
    symbol: str,
    interval: str,
    period: int = 20,
) -> list[dict]:
    cache_key = indicator_cache_key(symbol, interval, "sma", period)
    cached = await cache_get(cache_key)
    if cached:
        return cached

    df = await fetch_candle_df(db, symbol, interval)
    if df.empty:
        return []

    sma = ta.sma(df["close"], length=period)

    result = [
        {"timestamp": str(ts), "value": None if pd.isna(v) else round(v, 4)}
        for ts, v in zip(sma.index, sma.values)
    ]

    await cache_set(cache_key, result, ttl=settings.indicator_cache_ttl)
    return result


async def compute_ema(
    db: AsyncSession,
    symbol: str,
    interval: str,
    period: int = 20,
) -> list[dict]:
    cache_key = indicator_cache_key(symbol, interval, "ema", period)
    cached = await cache_get(cache_key)
    if cached:
        return cached

    df = await fetch_candle_df(db, symbol, interval)
    if df.empty:
        return []

    ema = ta.ema(df["close"], length=period)

    result = [
        {"timestamp": str(ts), "value": None if pd.isna(v) else round(v, 4)}
        for ts, v in zip(ema.index, ema.values)
    ]

    await cache_set(cache_key, result, ttl=settings.indicator_cache_ttl)
    return result


async def compute_rsi(
    db: AsyncSession,
    symbol: str,
    interval: str,
    period: int = 14,
) -> list[dict]:
    cache_key = indicator_cache_key(symbol, interval, "rsi", period)
    cached = await cache_get(cache_key)
    if cached:
        return cached

    df = await fetch_candle_df(db, symbol, interval)
    if df.empty:
        return []

    rsi = ta.rsi(df["close"], length=period)

    result = [
        {"timestamp": str(ts), "value": None if pd.isna(v) else round(v, 4)}
        for ts, v in zip(rsi.index, rsi.values)
    ]

    await cache_set(cache_key, result, ttl=settings.indicator_cache_ttl)
    return result


async def compute_bbands(
    db: AsyncSession,
    symbol: str,
    interval: str,
    period: int = 20,
) -> list[dict]:
    cache_key = indicator_cache_key(symbol, interval, "bbands", period)
    cached = await cache_get(cache_key)
    if cached:
        return cached

    df = await fetch_candle_df(db, symbol, interval)
    if df.empty:
        return []

    bbands = ta.bbands(df["close"], length=period)

    lower_col = f"BBL_{period}_2.0"
    middle_col = f"BBM_{period}_2.0"
    upper_col = f"BBU_{period}_2.0"

    result = [
        {
            "timestamp": str(ts),
            "upper": None if pd.isna(row[upper_col]) else round(row[upper_col], 4),
            "middle": None if pd.isna(row[middle_col]) else round(row[middle_col], 4),
            "lower": None if pd.isna(row[lower_col]) else round(row[lower_col], 4),
        }
        for ts, row in bbands.iterrows()
    ]

    await cache_set(cache_key, result, ttl=settings.indicator_cache_ttl)
    return result
