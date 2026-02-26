from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "0001_create_users_and_positions"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("email", sa.Text(), nullable=False, unique=True),
        sa.Column("password", sa.Text(), nullable=False),
        sa.Column("createdAt", sa.DateTime(timezone=False), nullable=False),
        sa.Column("updatedAt", sa.DateTime(timezone=False), nullable=False),
        sa.Column("firstName", sa.Text(), nullable=False),
        sa.Column("lastName", sa.Text(), nullable=False),
    )

    op.create_table(
        "positions",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column(
            "userId",
            sa.Integer(),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("ticker", sa.Text(), nullable=False),
        sa.Column("quantity", sa.Float(), nullable=False),
        sa.Column("buyPrice", sa.Float(), nullable=False),
        sa.Column("buyDate", sa.DateTime(timezone=False), nullable=False),
        sa.Column("sellPrice", sa.Float(), nullable=True),
        sa.Column("sellDate", sa.DateTime(timezone=False), nullable=True),
    )

    op.create_index("ix_positions_userId", "positions", ["userId"])
    op.create_index("ix_positions_ticker", "positions", ["ticker"])


def downgrade() -> None:
    op.drop_index("ix_positions_ticker", table_name="positions")
    op.drop_index("ix_positions_userId", table_name="positions")
    op.drop_table("positions")
    op.drop_table("users")
