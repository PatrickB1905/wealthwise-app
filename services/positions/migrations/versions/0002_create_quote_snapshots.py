from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0002_create_quote_snapshots"
down_revision = "0001_create_users_and_positions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "quote_snapshots",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("symbol", sa.Text(), nullable=False),
        sa.Column("currentPrice", sa.Float(), nullable=False),
        sa.Column("dailyChangePercent", sa.Float(), nullable=False),
        sa.Column("logoUrl", sa.Text(), nullable=False, server_default=""),
        sa.Column("updatedAt", sa.DateTime(timezone=False), nullable=False),
    )

    op.create_index("ix_quote_snapshots_symbol", "quote_snapshots", ["symbol"])
    op.create_index("ix_quote_snapshots_updatedAt", "quote_snapshots", ["updatedAt"])
    op.create_unique_constraint("uq_quote_snapshots_symbol", "quote_snapshots", ["symbol"])


def downgrade() -> None:
    op.drop_constraint("uq_quote_snapshots_symbol", "quote_snapshots", type_="unique")
    op.drop_index("ix_quote_snapshots_updatedAt", table_name="quote_snapshots")
    op.drop_index("ix_quote_snapshots_symbol", table_name="quote_snapshots")
    op.drop_table("quote_snapshots")
