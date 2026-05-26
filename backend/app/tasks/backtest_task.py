"""
Celery task for running backtests.

This runs in the worker container, completely separate from FastAPI.
It uses synchronous SQLAlchemy (sync_engine) because Celery workers
don't run an asyncio event loop.
"""
import math
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select, and_

from app.core.celery_app import celery_app
from app.db.session import sync_engine
from app.models.backtest import BacktestRun, BacktestResult, BacktestTrade
from app.models.ohlcv import OHLCV
from app.models.strategy import Strategy
from app.core.config import settings


def evaluate_condition(condition: dict, indicators: dict) -> tuple[bool, float]:
    """
    Evaluate a single condition against current indicator values.
    Returns (met: bool, score: float 0-100)
    """
    indicator = condition["indicator"]
    operator = condition["operator"]
    threshold = condition["value"]
    period = condition.get("period", 14)

    key = f"{indicator}_{period}"
    current_value = indicators.get(key)

    if current_value is None:
        return False, 0.0

    if operator == "<":
        met = current_value < threshold
        # Score: how far below threshold (0-100)
        score = max(
            0.0, min(100.0, (threshold - current_value) / threshold * 100))
    elif operator == ">":
        met = current_value > threshold
        score = max(
            0.0, min(100.0, (current_value - threshold) / threshold * 100))
    elif operator == "<=":
        met = current_value <= threshold
        score = max(
            0.0, min(100.0, (threshold - current_value) / threshold * 100 + 1))
    elif operator == ">=":
        met = current_value >= threshold
        score = max(
            0.0, min(100.0, (current_value - threshold) / threshold * 100 + 1))
    elif operator == "==":
        met = abs(current_value - threshold) < 0.01
        score = 100.0 if met else 0.0
    else:
        met = False
        score = 0.0

    return met, score


def compute_indicators_for_candle(candles: list, idx: int, conditions: list) -> dict:
    """
    Compute indicator values at a given candle index.
    Uses only candles up to idx (no lookahead bias).
    """
    closes = [c.close for c in candles[:idx + 1]]
    indicators = {}

    for condition in conditions:
        indicator = condition["indicator"]
        period = condition.get("period", 14)
        key = f"{indicator}_{period}"

        if len(closes) < period:
            continue

        if indicator == "RSI":
            gains, losses = [], []
            for i in range(1, len(closes)):
                diff = closes[i] - closes[i - 1]
                gains.append(max(diff, 0))
                losses.append(max(-diff, 0))
            if len(gains) >= period:
                avg_gain = sum(gains[-period:]) / period
                avg_loss = sum(losses[-period:]) / period
                if avg_loss == 0:
                    indicators[key] = 100.0
                else:
                    rs = avg_gain / avg_loss
                    indicators[key] = round(100 - (100 / (1 + rs)), 4)

        elif indicator == "SMA":
            indicators[key] = round(sum(closes[-period:]) / period, 4)

        elif indicator == "EMA":
            k = 2 / (period + 1)
            ema = closes[0]
            for price in closes[1:]:
                ema = price * k + ema * (1 - k)
            indicators[key] = round(ema, 4)

    return indicators


def compute_metrics(
    trades: list[dict],
    initial_capital: float,
    equity_curve: list[dict],
) -> dict:
    """Compute backtest performance metrics from completed trades."""
    if not trades:
        return {
            "total_return_pct": 0.0,
            "sharpe_ratio": 0.0,
            "max_drawdown_pct": 0.0,
            "win_rate_pct": 0.0,
            "total_trades": 0,
            "avg_trade_duration_hours": 0.0,
            "final_capital": initial_capital,
        }

    final_capital = equity_curve[-1]["value"] if equity_curve else initial_capital
    total_return_pct = (
        (final_capital - initial_capital) / initial_capital) * 100

    # Win rate
    pnls = [t["pnl"] for t in trades if t["pnl"] is not None]
    wins = [p for p in pnls if p > 0]
    win_rate_pct = (len(wins) / len(pnls) * 100) if pnls else 0.0

    # Sharpe ratio (simplified — uses trade returns)
    if len(pnls) > 1:
        mean_pnl = sum(pnls) / len(pnls)
        variance = sum((p - mean_pnl) ** 2 for p in pnls) / len(pnls)
        std_pnl = math.sqrt(variance)
        sharpe = (mean_pnl / std_pnl * math.sqrt(252)) if std_pnl > 0 else 0.0
    else:
        sharpe = 0.0

    # Max drawdown
    peak = initial_capital
    max_drawdown = 0.0
    for point in equity_curve:
        value = point["value"]
        if value > peak:
            peak = value
        drawdown = (peak - value) / peak * 100
        if drawdown > max_drawdown:
            max_drawdown = drawdown

    # Avg trade duration
    durations = []
    for t in trades:
        if t["entry_time"] and t["exit_time"]:
            delta = t["exit_time"] - t["entry_time"]
            durations.append(delta.total_seconds() / 3600)
    avg_duration = sum(durations) / len(durations) if durations else 0.0

    return {
        "total_return_pct": round(total_return_pct, 4),
        "sharpe_ratio": round(sharpe, 4),
        "max_drawdown_pct": round(max_drawdown, 4),
        "win_rate_pct": round(win_rate_pct, 4),
        "total_trades": len(pnls),
        "avg_trade_duration_hours": round(avg_duration, 2),
        "final_capital": round(final_capital, 2),
    }


@celery_app.task(bind=True)
def run_backtest(self, run_id: int) -> dict:
    """
    Main backtest task.
    Fetches candles, evaluates strategy conditions on each candle,
    simulates trades, and stores results.
    """
    with Session(sync_engine) as db:
        # 1. Load the run and strategy
        run = db.get(BacktestRun, run_id)
        if not run:
            return {"error": f"Run {run_id} not found"}

        run.status = "running"
        db.commit()

        strategy = db.get(Strategy, run.strategy_id)
        if not strategy:
            run.status = "failed"
            db.commit()
            return {"error": "Strategy not found"}

        # 2. Fetch candles in date range
        candles = db.execute(
            select(OHLCV)
            .where(
                and_(
                    OHLCV.symbol == run.symbol,
                    OHLCV.interval == run.interval,
                    OHLCV.timestamp >= run.start_date,
                    OHLCV.timestamp <= run.end_date,
                    OHLCV.is_closed == True,
                )
            )
            .order_by(OHLCV.timestamp.asc())
        ).scalars().all()

        if not candles:
            run.status = "failed"
            db.commit()
            return {"error": "No candles found for date range"}

        # 3. Simulate trading
        capital = run.initial_capital
        # {"entry_price": float, "entry_time": datetime, "size": float}
        position = None
        trades = []
        equity_curve = []

        for idx, candle in enumerate(candles):
            indicators = compute_indicators_for_candle(
                candles, idx, strategy.conditions)

            # Evaluate all conditions
            results = [
                evaluate_condition(cond, indicators)
                for cond in strategy.conditions
            ]
            scores = [r[1] for r in results]
            mets = [r[0] for r in results]

            if strategy.condition_logic == "AND":
                signal_fires = all(mets)
            else:
                signal_fires = any(mets)

            signal_score = sum(scores) / len(scores) if scores else 0.0

            fee_rate = settings.default_fee_rate

            if signal_fires and position is None and strategy.action == "BUY":
                # Enter position
                fee = capital * fee_rate
                size = (capital - fee) / candle.close
                position = {
                    "entry_price": candle.close,
                    "entry_time": candle.timestamp,
                    "size": size,
                    "signal_score": signal_score,
                }
                capital -= fee

            elif position is not None and strategy.action == "BUY":
                # Exit on next non-signal candle (simple exit logic)
                if not signal_fires:
                    exit_price = candle.close
                    fee = position["size"] * exit_price * fee_rate
                    proceeds = position["size"] * exit_price - fee
                    pnl = proceeds - \
                        (position["entry_price"] * position["size"])
                    capital = proceeds

                    trades.append({
                        "entry_time": position["entry_time"],
                        "exit_time": candle.timestamp,
                        "entry_price": position["entry_price"],
                        "exit_price": exit_price,
                        "position_size": position["size"],
                        "fee": fee,
                        "pnl": round(pnl, 4),
                        "signal_score": position["signal_score"],
                        "action": "BUY",
                    })
                    position = None

            equity_curve.append({
                "timestamp": str(candle.timestamp),
                "value": round(
                    capital + (position["size"] *
                               candle.close if position else 0), 2
                ),
            })

        # Close any open position at end
        if position is not None:
            last = candles[-1]
            fee = position["size"] * last.close * fee_rate
            proceeds = position["size"] * last.close - fee
            pnl = proceeds - (position["entry_price"] * position["size"])
            capital = proceeds
            trades.append({
                "entry_time": position["entry_time"],
                "exit_time": last.timestamp,
                "entry_price": position["entry_price"],
                "exit_price": last.close,
                "position_size": position["size"],
                "fee": fee,
                "pnl": round(pnl, 4),
                "signal_score": position["signal_score"],
                "action": "BUY",
            })

        # 4. Save trades
        for t in trades:
            db.add(BacktestTrade(run_id=run_id, **t))

        # 5. Compute and save metrics
        metrics = compute_metrics(trades, run.initial_capital, equity_curve)
        db.add(BacktestResult(
            run_id=run_id,
            equity_curve=equity_curve,
            **metrics,
        ))

        run.status = "done"
        db.commit()

        return {"run_id": run_id, "status": "done", **metrics}
