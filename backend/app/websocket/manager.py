import asyncio
import json
import logging
from fastapi import WebSocket
from app.websocket.binance_feed import run_feed

logger = logging.getLogger(__name__)

_feed_task: asyncio.Task | None = None

# Connected frontend WebSocket clients
_clients: dict[str, set[WebSocket]] = {}  # key: "symbol:interval"


async def start_feed() -> None:
    global _feed_task
    print("Starting Kraken market data feed...", flush=True)
    _feed_task = asyncio.create_task(run_feed())


async def stop_feed() -> None:
    global _feed_task
    if _feed_task:
        print("Stopping Kraken market data feed...", flush=True)
        _feed_task.cancel()
        try:
            await _feed_task
        except asyncio.CancelledError:
            pass
        _feed_task = None


async def connect_client(websocket: WebSocket, symbol: str, interval: str) -> None:
    await websocket.accept()
    key = f"{symbol}:{interval}"
    if key not in _clients:
        _clients[key] = set()
    _clients[key].add(websocket)


def disconnect_client(websocket: WebSocket, symbol: str, interval: str) -> None:
    key = f"{symbol}:{interval}"
    if key in _clients:
        _clients[key].discard(websocket)


async def broadcast_candle(candle: dict) -> None:
    """Broadcast a candle update to all subscribed frontend clients."""
    key = f"{candle['symbol']}:{candle['interval']}"
    if key not in _clients or not _clients[key]:
        return

    message = json.dumps(candle)
    dead = set()

    for ws in _clients[key].copy():
        try:
            await ws.send_text(message)
        except Exception:
            dead.add(ws)

    for ws in dead:
        _clients[key].discard(ws)
