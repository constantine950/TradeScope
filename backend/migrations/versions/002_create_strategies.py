"""create strategies

Revision ID: 002
Revises: 001
Create Date: 2026-01-01
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "002"
down_revision = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "strategies",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("conditions", JSONB, nullable=False, server_default="[]"),
        sa.Column("action", sa.String(10), nullable=False),
        sa.Column("condition_logic", sa.String(3),
                  nullable=False, server_default="AND"),
        sa.Column("created_by", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now()),
    )
    op.create_index("ix_strategies_name", "strategies", ["name"])


def downgrade() -> None:
    op.execute("DROP TABLE IF EXISTS strategies")
