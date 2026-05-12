"""create ohlcv hypertable

Revision ID: 001
Revises:
Create Date: 2026-01-01
"""
from alembic import op
import sqlalchemy as sa

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create table — composite primary key includes timestamp (required by TimescaleDB)
    op.create_table(
        "ohlcv",
        sa.Column("id", sa.BigInteger, autoincrement=True, nullable=False),
        sa.Column("symbol", sa.String(20), nullable=False),
        sa.Column("interval", sa.String(5), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("open", sa.Float, nullable=False),
        sa.Column("high", sa.Float, nullable=False),
        sa.Column("low", sa.Float, nullable=False),
        sa.Column("close", sa.Float, nullable=False),
        sa.Column("volume", sa.Float, nullable=False),
        sa.Column("is_closed", sa.Boolean, default=True),
        # timestamp must be in the primary key for hypertable partitioning
        sa.PrimaryKeyConstraint("id", "timestamp", name="pk_ohlcv"),
        sa.UniqueConstraint("symbol", "interval", "timestamp",
                            name="uq_ohlcv_symbol_interval_ts"),
    )

    op.create_index("ix_ohlcv_symbol_interval_ts", "ohlcv",
                    ["symbol", "interval", "timestamp"])

    # 2. Convert to hypertable — partitioned by timestamp
    op.execute("SELECT create_hypertable('ohlcv', 'timestamp')")

    # 3. Enable compression — segment by symbol and interval for query efficiency
    op.execute("""
        ALTER TABLE ohlcv SET (
            timescaledb.compress,
            timescaledb.compress_segmentby = 'symbol,interval'
        )
    """)

    # 4. Auto-compress chunks older than 7 days
    op.execute("SELECT add_compression_policy('ohlcv', INTERVAL '7 days')")


def downgrade() -> None:
    op.drop_table("ohlcv")
