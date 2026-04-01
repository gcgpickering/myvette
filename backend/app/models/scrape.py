from datetime import datetime

from sqlalchemy import Integer, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class ScrapeResult(Base):
    """Cached marketplace scraping result."""

    __tablename__ = "scrape_results"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    upgrade_category_id: Mapped[int] = mapped_column(
        ForeignKey("upgrade_categories.id"), nullable=False
    )
    retailer: Mapped[str] = mapped_column(String(100), nullable=False)
    product_name: Mapped[str] = mapped_column(String(500), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="USD")
    rating: Mapped[float] = mapped_column(Float, nullable=True)
    review_count: Mapped[int] = mapped_column(Integer, nullable=True)
    image_url: Mapped[str] = mapped_column(String(1000), nullable=True)
    product_url: Mapped[str] = mapped_column(String(1000), nullable=False)
    seller_name: Mapped[str] = mapped_column(String(200), nullable=True)
    shipping_estimate: Mapped[str] = mapped_column(String(200), nullable=True)
    fitment_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    scraped_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)


class ScrapeJob(Base):
    """Tracks async scraping job status."""

    __tablename__ = "scrape_jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    vehicle_id: Mapped[int] = mapped_column(ForeignKey("vehicles.id"), nullable=False)
    upgrade_category_id: Mapped[int] = mapped_column(
        ForeignKey("upgrade_categories.id"), nullable=False
    )
    status: Mapped[str] = mapped_column(String(50), default="pending")
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    error_message: Mapped[str | None] = mapped_column(String(2000), nullable=True)
