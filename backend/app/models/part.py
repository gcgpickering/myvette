from __future__ import annotations
from typing import TYPE_CHECKING

from sqlalchemy import Integer, String, Float, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.vehicle import Vehicle


class PartType(Base):
    """Defines a type of car part with education content."""

    __tablename__ = "part_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[str] = mapped_column(String(50), nullable=True)
    description: Mapped[str] = mapped_column(String(2000), nullable=False)
    how_it_works: Mapped[str] = mapped_column(String(5000), nullable=False)
    maintenance_schedule: Mapped[str] = mapped_column(String(2000), nullable=True)
    common_failures: Mapped[list] = mapped_column(JSON, nullable=True, default=list)
    svg_diagram_key: Mapped[str] = mapped_column(String(100), nullable=True)

    upgrade_categories: Mapped[list["UpgradeCategory"]] = relationship(
        back_populates="part_type"
    )


class VehiclePart(Base):
    """Links a specific vehicle to its part specs."""

    __tablename__ = "vehicle_parts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    part_type_id: Mapped[int] = mapped_column(ForeignKey("part_types.id"), nullable=False)
    specs: Mapped[dict] = mapped_column(JSON, nullable=True, default=dict)
    oem_part_numbers: Mapped[list] = mapped_column(JSON, nullable=True, default=list)

    vehicle: Mapped["Vehicle"] = relationship(back_populates="parts")
    part_type: Mapped["PartType"] = relationship()


class UpgradeCategory(Base):
    """Defines upgrade categories for a part type."""

    __tablename__ = "upgrade_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    part_type_id: Mapped[int] = mapped_column(ForeignKey("part_types.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(String(2000), nullable=True)
    difficulty_rating: Mapped[int] = mapped_column(Integer, nullable=True)
    estimated_install_time: Mapped[str] = mapped_column(String(100), nullable=True)
    tools_needed: Mapped[list] = mapped_column(JSON, nullable=True, default=list)

    part_type: Mapped["PartType"] = relationship(back_populates="upgrade_categories")
