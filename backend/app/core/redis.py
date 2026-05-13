import json
from typing import Any, Optional
import redis.asyncio as aioredis
from app.core.config import settings

_pool: Optional[aioredis.ConnectionPool] = None


def get_pool() -> aioredis.ConnectionPool:
    global _pool
    if _pool is None:
        _pool = aioredis.ConnectionPool.from_url(
            settings.redis_url, decode_responses=True)
    return _pool


def get_redis() -> aioredis.Redis:
    return aioredis.Redis(connection_pool=get_pool())


async def cache_set(key: str, value: Any, ttl: int = 60) -> None:
    r = get_redis()
    await r.setex(key, ttl, json.dumps(value))


async def cache_get(key: str) -> Optional[Any]:
    r = get_redis()
    raw = await r.get(key)
    return json.loads(raw) if raw else None


async def cache_delete(key: str) -> None:
    r = get_redis()
    await r.delete(key)


async def lpush_trim(key: str, value: Any, maxlen: int = 200) -> None:
    """Push to list and trim to maxlen — used as a ring buffer for candles."""
    r = get_redis()
    async with r.pipeline() as pipe:
        await pipe.lpush(key, json.dumps(value))
        await pipe.ltrim(key, 0, maxlen - 1)
        await pipe.execute()


async def lrange_all(key: str) -> list[Any]:
    r = get_redis()
    items = await r.lrange(key, 0, -1)
    return [json.loads(i) for i in items]


def candle_cache_key(symbol: str, interval: str) -> str:
    return f"candles:{symbol}:{interval}"


def indicator_cache_key(symbol: str, interval: str, indicator: str, period: int) -> str:
    return f"indicator:{symbol}:{interval}:{indicator}:{period}"
