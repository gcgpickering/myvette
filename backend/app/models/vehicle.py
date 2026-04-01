from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Integer, String, Float, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.part import VehiclePart


class Vehicle(Base):
    """Represents a vehicle with its specifications."""

    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False, index=True)
    make: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    model: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    trim: Mapped[str] = mapped_column(String(100), nullable=False)
    body_type: Mapped[str] = mapped_column(String(50), nullable=False)
    engine_type: Mapped[str] = mapped_column(String(100), nullable=True)
    displacement: Mapped[float] = mapped_column(Float, nullable=True)
    horsepower: Mapped[int] = mapped_column(Integer, nullable=True)
    torque: Mapped[int] = mapped_column(Integer, nullable=True)
    drivetrain: Mapped[str] = mapped_column(String(50), nullable=True)
    transmission_type: Mapped[str] = mapped_column(String(100), nullable=True)
    curb_weight: Mapped[int] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    parts: Mapped[list["VehiclePart"]] = relationship(back_populates="vehicle")
