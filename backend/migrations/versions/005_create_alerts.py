"""create alerts

Revision ID: 005
Revises: 004
Create Date: 2026-01-01
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "005"
down_revision = "004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "alerts",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("symbol", sa.String(20), nullable=False),
        sa.Column("interval", sa.String(5), nullable=False),
        sa.Column("indicator", sa.String(20), nullable=False),
        sa.Column("period", sa.Integer, nullable=False, server_default="14"),
        sa.Column("operator", sa.String(20), nullable=False),
        sa.Column("threshold", sa.Float, nullable=False),
        sa.Column("is_active", sa.Boolean,
                  nullable=False, server_default="true"),
        sa.Column("triggered", sa.Boolean,
                  nullable=False, server_default="false"),
        sa.Column("triggered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("triggered_value", sa.Float, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
    )
    op.create_index("ix_alerts_symbol", "alerts", ["symbol"])
    op.create_index("ix_alerts_is_active", "alerts", ["is_active"])


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS alerts")
