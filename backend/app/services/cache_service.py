"""
Central cache service — all Redis interactions go through here.
This means if we ever swap Redis for another cache, we change one file.
"""
from app.core.redis import (
    cache_get,
    cache_set,
    cache_delete,
    lrange_all,
    lpush_trim,
    candle_cache_key,
    indicator_cache_key,
)
from app.core.config import settings
from typing import Any


async def get_cached(key: str) -> Any | None:
    return await cache_get(key)


async def set_cached(key: str, value: Any, ttl: int | None = None) -> None:
    await cache_set(key, value, ttl or settings.indicator_cache_ttl)


async def invalidate(key: str) -> None:
    await cache_delete(key)


async def get_candle_buffer(symbol: str, interval: str) -> list[dict]:
    key = candle_cache_key(symbol, interval)
    return await lrange_all(key)


async def push_candle_to_buffer(symbol: str, interval: str, candle: dict) -> None:
    key = candle_cache_key(symbol, interval)
    await lpush_trim(key, candle, maxlen=settings.candle_cache_size)


async def get_indicator_cache(
    symbol: str, interval: str, indicator: str, period: int
) -> Any | None:
    key = indicator_cache_key(symbol, interval, indicator, period)
    return await cache_get(key)


async def set_indicator_cache(
    symbol: str, interval: str, indicator: str, period: int, value: Any
) -> None:
    key = indicator_cache_key(symbol, interval, indicator, period)
    await cache_set(key, value, ttl=settings.indicator_cache_ttl)
