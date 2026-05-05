# TradeScope — Product Requirements Document

## 1. Problem statement

Retail traders have access to market data but no easy way to turn trading intuitions into testable strategies. Existing tools are either too expensive, require coding, or don't connect live data to historical backtesting in one place. TradeScope closes that gap — a single terminal where you can watch live markets, build a strategy visually, and immediately see how it would have performed.

## 2. Goal

- Live candlestick chart streaming from Binance WebSocket
- Technical indicators: SMA, EMA, RSI, Bollinger Bands computed server-side
- Visual strategy builder — no code required
- Backtesting engine: P&L, Sharpe ratio, drawdown, win rate
- Paper trading with virtual $10,000 portfolio
- Clean trading terminal UI in Next.js

## 3. Supported symbols & intervals

**Symbols:** BTCUSDT, ETHUSDT, SOLUSDT, BNBUSDT  
**Intervals:** 1m, 5m, 15m, 1h, 4h, 1d

## 4. Strategy schema

A strategy is a named set of conditions evaluated against indicator values on each candle. All conditions combine with AND or OR logic. When met, a BUY or SELL action fires.

```json
{
  "name": "RSI Oversold Bounce",
  "conditions": [
    { "indicator": "RSI", "period": 14, "operator": "<", "value": 30 },
    { "indicator": "SMA", "period": 20, "operator": ">", "value": "close" }
  ],
  "condition_logic": "AND",
  "action": "BUY"
}
```

**Supported operators:** `<` `>` `<=` `>=` `==` `crosses_above` `crosses_below`

## 5. Backtest output schema

**Metrics per run:** total_return_pct, sharpe_ratio, max_drawdown_pct, win_rate_pct, total_trades, avg_trade_duration

**Per-trade log:** entry_price, exit_price, position_size, fee (0.1% per side), pnl, signal_score (0–100)

## 6. Technical indicators

| Indicator       | Library   | Key params          | Chart placement      |
| --------------- | --------- | ------------------- | -------------------- |
| SMA             | pandas-ta | period              | Overlay on candles   |
| EMA             | pandas-ta | period              | Overlay on candles   |
| RSI             | pandas-ta | period (default 14) | Separate panel below |
| Bollinger Bands | pandas-ta | period, std dev     | Overlay on candles   |

## 7. Out of scope (v1)

Live strategy execution, real money trading, options/futures, multi-asset strategies, user authentication, mobile app

## 8. Non-functional requirements

- Candle REST API responds in <200ms for cached queries
- 90 days of OHLCV history; TimescaleDB compression on data older than 7 days
- 90-day backtest on 1h data completes in <10s via Celery async task
- Binance WS reconnects automatically with exponential backoff on disconnect
