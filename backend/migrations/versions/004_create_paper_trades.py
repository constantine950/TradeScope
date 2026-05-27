"""create paper trades

Revision ID: 004
Revises: 003
Create Date: 2026-01-01
"""
from alembic import op
import sqlalchemy as sa

revision = "004"
down_revision = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "paper_portfolios",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(100), nullable=False,
                  server_default="default"),
        sa.Column("balance", sa.Float, nullable=False, server_default="10000"),
        sa.Column("initial_balance", sa.Float,
                  nullable=False, server_default="10000"),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
    )

    op.create_table(
        "paper_positions",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("portfolio_id", sa.Integer, sa.ForeignKey(
            "paper_portfolios.id"), nullable=False),
        sa.Column("symbol", sa.String(20), nullable=False),
        sa.Column("size", sa.Float, nullable=False),
        sa.Column("entry_price", sa.Float, nullable=False),
        sa.Column("entry_time", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
    )

    op.create_table(
        "paper_trades",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("portfolio_id", sa.Integer, sa.ForeignKey(
            "paper_portfolios.id"), nullable=False),
        sa.Column("symbol", sa.String(20), nullable=False),
        sa.Column("action", sa.String(10), nullable=False),
        sa.Column("price", sa.Float, nullable=False),
        sa.Column("size", sa.Float, nullable=False),
        sa.Column("fee", sa.Float, nullable=False, server_default="0"),
        sa.Column("pnl", sa.Float, nullable=True),
        sa.Column("executed_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
    )

    op.create_index("ix_paper_positions_portfolio_id",
                    "paper_positions", ["portfolio_id"])
    op.create_index("ix_paper_trades_portfolio_id",
                    "paper_trades", ["portfolio_id"])


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS paper_trades")
    op.execute("DROP TABLE IF EXISTS paper_positions")
    op.execute("DROP TABLE IF EXISTS paper_portfolios")
