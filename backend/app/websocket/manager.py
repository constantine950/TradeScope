"""
Manages the Binance feed as a background task inside FastAPI.
Starts on app startup, cancels on shutdown.
"""
import asyncio
import logging
from app.websocket.binance_feed import run_feed

logger = logging.getLogger(__name__)

_feed_task: asyncio.Task | None = None


async def start_feed() -> None:
    global _feed_task
    logger.info("Starting Binance market data feed...")
    _feed_task = asyncio.create_task(run_feed())


async def stop_feed() -> None:
    global _feed_task
    if _feed_task:
        logger.info("Stopping Binance market data feed...")
        _feed_task.cancel()
        try:
            await _feed_task
        except asyncio.CancelledError:
            pass
        _feed_task = None
