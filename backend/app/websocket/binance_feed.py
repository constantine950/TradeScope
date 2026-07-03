"""
Connects to Kraken public WebSocket v2 for live OHLCV data.
No API key required. No geo-restrictions.
"""
import asyncio
import json
from datetime import datetime

import websockets

from app.core.config import settings
from app.core.redis import candle_cache_key, lpush_trim
from app.db.session import AsyncSessionLocal
from app.models.ohlcv import OHLCV
from sqlalchemy.dialects.postgresql import insert

KRAKEN_WS_URL = "wss://ws.kraken.com/v2"

SYMBOL_MAP = {
    "BTCUSDT": "BTC/USDT",
    "ETHUSDT": "ETH/USDT",
    "SOLUSDT": "SOL/USDT",
    "BNBUSDT": "BNB/USDT",
}

INTERVAL_MAP = {
    "1m": 1,
    "5m": 5,
    "15m": 15,
    "1h": 60,
    "4h": 240,
    "1d": 1440,
}


def build_subscribe_message(symbols: list[str], interval: str) -> dict:
    kraken_symbols = [SYMBOL_MAP[s] for s in symbols if s in SYMBOL_MAP]
    return {
        "method": "subscribe",
        "params": {
            "channel": "ohlc",
            "symbol": kraken_symbols,
            "interval": INTERVAL_MAP.get(interval, 1),
        }
    }


def parse_kraken_ohlc(msg: dict) -> list[dict]:
    candles = []
    if msg.get("channel") != "ohlc":
        return candles
    if msg.get("type") not in ("snapshot", "update"):
        return candles

    reverse_map = {v: k for k, v in SYMBOL_MAP.items()}
    interval_reverse = {v: k for k, v in INTERVAL_MAP.items()}

    for item in msg.get("data", []):
        symbol = reverse_map.get(item.get("symbol"))
        interval = interval_reverse.get(item.get("interval", 1), "1m")

        if not symbol:
            continue

        try:
            candles.append({
                "symbol": symbol,
                "interval": interval,
                "timestamp": datetime.fromisoformat(
                    item["timestamp"].replace("Z", "+00:00")
                ).isoformat(),
                "open": float(item["open"]),
                "high": float(item["high"]),
                "low": float(item["low"]),
                "close": float(item["close"]),
                "volume": float(item["volume"]),
                "is_closed": item.get("confirm", False),
            })
        except (KeyError, ValueError) as e:
            print(f"Failed to parse candle: {e}", flush=True)

    return candles


async def upsert_candle(candle: dict) -> None:
    from datetime import datetime as dt
    db_candle = {**candle, "timestamp": dt.fromisoformat(candle["timestamp"])}
    async with AsyncSessionLocal() as session:
        stmt = (
            insert(OHLCV)
            .values(**db_candle)
            .on_conflict_do_update(
                constraint="uq_ohlcv_symbol_interval_ts",
                set_={
                    "open": db_candle["open"],
                    "high": db_candle["high"],
                    "low": db_candle["low"],
                    "close": db_candle["close"],
                    "volume": db_candle["volume"],
                    "is_closed": db_candle["is_closed"],
                },
            )
        )
        await session.execute(stmt)
        await session.commit()


async def cache_candle(candle: dict) -> None:
    key = candle_cache_key(candle["symbol"], candle["interval"])
    await lpush_trim(key, candle, maxlen=settings.candle_cache_size)


async def run_feed() -> None:
    from app.websocket.manager import broadcast_candle

    backoff = 1
    max_backoff = 60

    while True:
        try:
            print(f"Connecting to Kraken WS: {KRAKEN_WS_URL}", flush=True)
            async with websockets.connect(
                KRAKEN_WS_URL,
                ping_interval=20,
                ping_timeout=10,
                close_timeout=10,
            ) as ws:
                backoff = 1  # reset on successful connect
                print("Kraken WS connected", flush=True)

                for interval in settings.supported_intervals:
                    sub_msg = build_subscribe_message(
                        settings.supported_symbols, interval)
                    await ws.send(json.dumps(sub_msg))

                async for message in ws:
                    data = json.loads(message)
                    candles = parse_kraken_ohlc(data)

                    for candle in candles:
                        await cache_candle(candle)
                        await broadcast_candle(candle)

                        if candle["is_closed"]:
                            await upsert_candle(candle)
                            print(
                                f"Saved: {candle['symbol']} {candle['interval']} "
                                f"@ {candle['timestamp']}", flush=True
                            )

        except websockets.exceptions.ConnectionClosed as e:
            print(
                f"Kraken WS closed: {e}. Reconnecting in {backoff}s...", flush=True)
        except websockets.exceptions.WebSocketException as e:
            print(
                f"Kraken WS error: {e}. Reconnecting in {backoff}s...", flush=True)
        except Exception as e:
            print(
                f"Kraken WS unexpected error: {e}. Reconnecting in {backoff}s...", flush=True)

        await asyncio.sleep(backoff)
        backoff = min(backoff * 2, max_backoff)
