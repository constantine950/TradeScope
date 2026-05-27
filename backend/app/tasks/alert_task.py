"""
Celery beat task — runs every minute.
Evaluates all active alerts against latest indicator values.
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import select
import pandas as pd
import pandas_ta as ta

from app.core.celery_app import celery_app
from app.db.session import sync_engine
from app.models.alert import Alert
from app.models.ohlcv import OHLCV


def get_latest_indicator_value(db: Session, alert: Alert) -> float | None:
    """Compute the latest indicator value for an alert."""
    rows = db.execute(
        select(OHLCV)
        .where(
            OHLCV.symbol == alert.symbol,
            OHLCV.interval == alert.interval,
            OHLCV.is_closed == True,
        )
        .order_by(OHLCV.timestamp.desc())
        .limit(alert.period * 3)
    ).scalars().all()

    if not rows:
        return None

    closes = pd.Series([r.close for r in reversed(rows)])

    if alert.indicator == "RSI":
        result = ta.rsi(closes, length=alert.period)
    elif alert.indicator == "SMA":
        result = ta.sma(closes, length=alert.period)
    elif alert.indicator == "EMA":
        result = ta.ema(closes, length=alert.period)
    else:
        return None

    if result is None or result.empty:
        return None

    last = result.dropna()
    return float(last.iloc[-1]) if not last.empty else None


def check_condition(value: float, operator: str, threshold: float) -> bool:
    if operator == "<":
        return value < threshold
    elif operator == ">":
        return value > threshold
    elif operator == "<=":
        return value <= threshold
    elif operator == ">=":
        return value >= threshold
    elif operator == "==":
        return abs(value - threshold) < 0.01
    return False


@celery_app.task
def evaluate_all_alerts():
    with Session(sync_engine) as db:
        alerts = db.execute(
            select(Alert).where(
                Alert.is_active == True,
                Alert.triggered == False,
            )
        ).scalars().all()

        print(f"Evaluating {len(alerts)} alerts", flush=True)

        for alert in alerts:
            value = get_latest_indicator_value(db, alert)
            print(
                f"Alert {alert.name}: {alert.indicator} = {value}, threshold {alert.operator} {alert.threshold}", flush=True)

            if value is None:
                continue

            if check_condition(value, alert.operator, alert.threshold):
                alert.triggered = True
                alert.triggered_at = datetime.now(timezone.utc)
                alert.triggered_value = round(value, 4)
                print(
                    f"Alert fired: {alert.name} — {alert.indicator} = {value}", flush=True)

        db.commit()
