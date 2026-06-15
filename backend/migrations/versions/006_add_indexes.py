from alembic import op

revision = "006"
down_revision = "005"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Composite index for the most common candle query pattern
    op.create_index(
        "ix_ohlcv_symbol_interval_closed_ts",
        "ohlcv",
        ["symbol", "interval", "is_closed", "timestamp"],
    )

    # Index for backtest queries — date range scans
    op.create_index(
        "ix_ohlcv_symbol_interval_ts_range",
        "ohlcv",
        ["symbol", "interval", "timestamp"],
    )

    # Index for alert evaluation — active alerts only
    op.create_index(
        "ix_alerts_active_not_triggered",
        "alerts",
        ["is_active", "triggered"],
    )

    # Index for backtest trades by run
    op.create_index(
        "ix_backtest_trades_run_entry",
        "backtest_trades",
        ["run_id", "entry_time"],
    )


def downgrade() -> None:
    op.drop_index("ix_ohlcv_symbol_interval_closed_ts")
    op.drop_index("ix_ohlcv_symbol_interval_ts_range")
    op.drop_index("ix_alerts_active_not_triggered")
    op.drop_index("ix_backtest_trades_run_entry")
