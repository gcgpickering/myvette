from datetime import datetime
from sqlalchemy import Integer, String, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column
from app.db.database import Base


class VehiclePartPosition(Base):
    __tablename__ = "vehicle_part_positions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    make: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    model: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    year_start: Mapped[int] = mapped_column(Integer, nullable=True)
    year_end: Mapped[int] = mapped_column(Integer, nullable=True)
    layout_type: Mapped[str] = mapped_column(String(50), nullable=False)
    positions: Mapped[dict] = mapped_column(JSON, nullable=False)  # {slug: [x,y,z] or null}
    hidden_parts: Mapped[list] = mapped_column(JSON, nullable=True, default=list)
    research_notes: Mapped[str | None] = mapped_column(String(5000), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
