"""
Seed 90 days of fake OHLCV data for BTC, ETH, SOL.
Run with: docker compose exec backend python -m app.db.seed
"""
import random
from datetime import datetime, timedelta, timezone
from sqlalchemy import insert, text
from app.db.session import sync_engine
from app.core.config import settings


SEED_SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"]
INTERVALS_CONFIG = {
    "1m":  timedelta(minutes=1),
    "5m":  timedelta(minutes=5),
    "15m": timedelta(minutes=15),
    "1h":  timedelta(hours=1),
    "4h":  timedelta(hours=4),
    "1d":  timedelta(days=1),
}
DAYS = 90

START_PRICES = {
    "BTCUSDT": 65_000.0,
    "ETHUSDT": 3_200.0,
    "SOLUSDT": 180.0,
}


def generate_candles(symbol: str, interval: str, delta: timedelta, start_price: float) -> list[dict]:
    candles = []
    price = start_price
    now = datetime.now(timezone.utc).replace(second=0, microsecond=0)
    start = now - timedelta(days=DAYS)

    # Align start to interval boundary
    current = start
    while current <= now:
        change = random.uniform(-0.02, 0.02)
        open_ = price
        close = round(open_ * (1 + change), 4)
        high = round(max(open_, close) * random.uniform(1.0, 1.015), 4)
        low = round(min(open_, close) * random.uniform(0.985, 1.0), 4)
        volume = round(random.uniform(100, 5000), 2)

        candles.append({
            "symbol": symbol,
            "interval": interval,
            "timestamp": current,
            "open": open_,
            "high": high,
            "low": low,
            "close": close,
            "volume": volume,
            "is_closed": True,
        })

        price = close
        current += delta

    return candles


def seed():
    from app.models.ohlcv import OHLCV

    with sync_engine.begin() as conn:
        conn.execute(text("DELETE FROM ohlcv WHERE symbol = ANY(:symbols)"),
                     {"symbols": SEED_SYMBOLS})

        for symbol in SEED_SYMBOLS:
            for interval, delta in INTERVALS_CONFIG.items():
                print(f"Seeding {symbol} {interval}...")
                candles = generate_candles(
                    symbol, interval, delta, START_PRICES[symbol])
                conn.execute(insert(OHLCV), candles)
                print(f"  inserted {len(candles)} candles")

    print("Seed complete.")


if __name__ == "__main__":
    seed()
