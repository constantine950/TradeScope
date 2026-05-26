"""create backtests

Revision ID: 003
Revises: 002
Create Date: 2026-01-01
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "003"
down_revision = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "backtest_runs",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("strategy_id", sa.Integer, sa.ForeignKey(
            "strategies.id"), nullable=False),
        sa.Column("symbol", sa.String(20), nullable=False),
        sa.Column("interval", sa.String(5), nullable=False),
        sa.Column("start_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("end_date", sa.DateTime(timezone=True), nullable=False),
        sa.Column("initial_capital", sa.Float,
                  nullable=False, server_default="10000"),
        sa.Column("status", sa.String(20), nullable=False,
                  server_default="pending"),
        sa.Column("celery_task_id", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
    )

    op.create_table(
        "backtest_results",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("run_id", sa.Integer, sa.ForeignKey(
            "backtest_runs.id"), unique=True, nullable=False),
        sa.Column("total_return_pct", sa.Float, nullable=True),
        sa.Column("sharpe_ratio", sa.Float, nullable=True),
        sa.Column("max_drawdown_pct", sa.Float, nullable=True),
        sa.Column("win_rate_pct", sa.Float, nullable=True),
        sa.Column("total_trades", sa.Integer, nullable=True),
        sa.Column("avg_trade_duration_hours", sa.Float, nullable=True),
        sa.Column("final_capital", sa.Float, nullable=True),
        sa.Column("equity_curve", JSONB, nullable=True),
    )

    op.create_table(
        "backtest_trades",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("run_id", sa.Integer, sa.ForeignKey(
            "backtest_runs.id"), nullable=False),
        sa.Column("entry_time", sa.DateTime(timezone=True), nullable=False),
        sa.Column("exit_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("entry_price", sa.Float, nullable=False),
        sa.Column("exit_price", sa.Float, nullable=True),
        sa.Column("position_size", sa.Float, nullable=False),
        sa.Column("fee", sa.Float, nullable=False, server_default="0"),
        sa.Column("pnl", sa.Float, nullable=True),
        sa.Column("signal_score", sa.Float, nullable=True),
        sa.Column("action", sa.String(10), nullable=False),
    )

    op.create_index("ix_backtest_runs_strategy_id",
                    "backtest_runs", ["strategy_id"])
    op.create_index("ix_backtest_trades_run_id", "backtest_trades", ["run_id"])


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS backtest_trades")
    op.execute("DROP TABLE IF EXISTS backtest_results")
    op.execute("DROP TABLE IF EXISTS backtest_runs")
