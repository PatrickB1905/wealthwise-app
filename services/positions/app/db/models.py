from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    password: Mapped[str] = mapped_column(Text, nullable=False)

    createdAt: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)
    updatedAt: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)

    firstName: Mapped[str] = mapped_column(Text, nullable=False)
    lastName: Mapped[str] = mapped_column(Text, nullable=False)

    positions: Mapped[list[Position]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )


class Position(Base):
    __tablename__ = "positions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    userId: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    ticker: Mapped[str] = mapped_column(Text, nullable=False, index=True)
    quantity: Mapped[float] = mapped_column(Float, nullable=False)

    buyPrice: Mapped[float] = mapped_column(Float, nullable=False)
    buyDate: Mapped[datetime] = mapped_column(DateTime(timezone=False), nullable=False)

    sellPrice: Mapped[float | None] = mapped_column(Float, nullable=True)
    sellDate: Mapped[datetime | None] = mapped_column(DateTime(timezone=False), nullable=True)

    user: Mapped[User] = relationship(back_populates="positions")


class QuoteSnapshot(Base):

    __tablename__ = "quote_snapshots"
    __table_args__ = (UniqueConstraint("symbol", name="uq_quote_snapshots_symbol"),)

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    symbol: Mapped[str] = mapped_column(Text, nullable=False, index=True)

    currentPrice: Mapped[float] = mapped_column(Float, nullable=False)
    dailyChangePercent: Mapped[float] = mapped_column(Float, nullable=False)

    logoUrl: Mapped[str] = mapped_column(Text, nullable=False, default="")

    updatedAt: Mapped[datetime] = mapped_column(
        DateTime(timezone=False), nullable=False, index=True
    )
