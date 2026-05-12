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
INTERVAL = "1h"
DAYS = 90

# Realistic starting prices
START_PRICES = {
    "BTCUSDT": 65_000.0,
    "ETHUSDT": 3_200.0,
    "SOLUSDT": 180.0,
}


def generate_candles(symbol: str, start_price: float) -> list[dict]:
    candles = []
    price = start_price
    now = datetime.now(timezone.utc).replace(minute=0, second=0, microsecond=0)
    start = now - timedelta(days=DAYS)

    current = start
    while current <= now:
        change = random.uniform(-0.02, 0.02)  # ±2% per candle
        open_ = price
        close = round(open_ * (1 + change), 4)
        high = round(max(open_, close) * random.uniform(1.0, 1.015), 4)
        low = round(min(open_, close) * random.uniform(0.985, 1.0), 4)
        volume = round(random.uniform(100, 5000), 2)

        candles.append({
            "symbol": symbol,
            "interval": INTERVAL,
            "timestamp": current,
            "open": open_,
            "high": high,
            "low": low,
            "close": close,
            "volume": volume,
            "is_closed": True,
        })

        price = close
        current += timedelta(hours=1)

    return candles


def seed():
    from app.models.ohlcv import OHLCV

    with sync_engine.begin() as conn:
        # Clear existing seed data
        conn.execute(text("DELETE FROM ohlcv WHERE symbol = ANY(:symbols)"),
                     {"symbols": SEED_SYMBOLS})

        for symbol in SEED_SYMBOLS:
            print(f"Seeding {symbol}...")
            candles = generate_candles(symbol, START_PRICES[symbol])
            conn.execute(insert(OHLCV), candles)
            print(f"  inserted {len(candles)} candles")

    print("Seed complete.")


if __name__ == "__main__":
    seed()
